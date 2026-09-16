import { onBeforeUnmount, shallowRef, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import { FONDOS, FUENTE_DEM, LIMITES, MUNICIPIOS, VISTA_INICIAL } from '../data/mapa.js'
import { FORMACIONES, PROFUNDIDAD_MODELO } from '../data/formaciones.js'

const RUTA = {
  acuifero: 'data/acuifero-morroa.geojson',
  recarga: 'data/zona-recarga.geojson',
  pozos: 'data/pozos.geojson',
}

/** Colección de puntos de las cabeceras municipales. */
function fcMunicipios() {
  return {
    type: 'FeatureCollection',
    features: MUNICIPIOS.map((m) => ({
      type: 'Feature',
      properties: { nombre: m.nombre, sobreAcuifero: m.sobreAcuifero ? 1 : 0 },
      geometry: { type: 'Point', coordinates: [m.lon, m.lat] },
    })),
  }
}

/**
 * Convierte cada pozo en un prisma hexagonal centrado en sus coordenadas, para
 * poder extruirlo en 3D. `radio` va en metros.
 */
function columnasDePozos(pozos, radio = 900) {
  const features = pozos.features.map((p) => {
    const [lon, lat] = p.geometry.coordinates
    const dLat = radio / 111320
    const dLon = radio / (111320 * Math.cos((lat * Math.PI) / 180))
    const anillo = []
    for (let i = 0; i <= 6; i += 1) {
      const a = (Math.PI / 3) * i
      anillo.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)])
    }
    return {
      type: 'Feature',
      properties: { ...p.properties, serie: undefined },
      geometry: { type: 'Polygon', coordinates: [anillo] },
    }
  })
  return { type: 'FeatureCollection', features }
}

/** Fuente raster del fondo cartográfico seleccionado. */
function fuenteFondo(id) {
  const f = FONDOS.find((x) => x.id === id) ?? FONDOS[0]
  return {
    type: 'raster',
    tiles: f.tiles,
    tileSize: 256,
    maxzoom: f.maxzoom,
    attribution: f.atribucion,
  }
}

/** Estilo base del visor. Las capas temáticas se añaden tras `load`. */
function estiloBase(fondoId) {
  return {
    version: 8,
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    sources: {
      fondo: fuenteFondo(fondoId),
      dem: {
        type: 'raster-dem',
        tiles: FUENTE_DEM.tiles,
        tileSize: FUENTE_DEM.tileSize,
        maxzoom: FUENTE_DEM.maxzoom,
        encoding: FUENTE_DEM.encoding,
        attribution: FUENTE_DEM.atribucion,
      },
    },
    layers: [
      { id: 'fondo-color', type: 'background', paint: { 'background-color': '#061422' } },
      {
        id: 'fondo',
        type: 'raster',
        source: 'fondo',
        paint: { 'raster-opacity': 1, 'raster-fade-duration': 240 },
      },
    ],
    sky: {
      'sky-color': '#153a5c',
      'horizon-color': '#4a7ea8',
      'fog-color': '#0b1f33',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.5,
      'fog-ground-blend': 0.3,
    },
  }
}

/**
 * Visor 3D del acuífero Morroa.
 *
 * Nota sobre el bloque estratigráfico: la especificación de estilos de MapLibre
 * no admite extrusiones bajo el nivel del terreno (`fill-extrusion-base` tiene
 * mínimo 0). Las unidades geológicas se dibujan por tanto como un bloque
 * diagramático levantado sobre la huella real del acuífero: conserva el orden
 * estratigráfico correcto (Qal arriba, Tct abajo) y su cara superior equivale a
 * la superficie del terreno. El corte vertical a profundidad real se presenta en
 * la vista de corte geológico.
 */
export function useMapaAcuifero(contenedor, estado, callbacks = {}) {
  const mapa = shallowRef(null)
  const cargando = shallowRef(true)
  const error = shallowRef(null)
  const datos = shallowRef({ acuifero: null, recarga: null, pozos: null })

  let popup = null
  let capasListas = false
  let rotando = false
  let animacion = null
  const limpiadores = []

  /**
   * Factor de exageracion vertical del bloque: 1 m real de columna equivale a
   * `exageracionBloque` metros representados. Sin exagerar, los 760 m de la
   * columna serian imperceptibles frente a los ~50 km de la huella.
   */
  const escalaBloque = () => estado.exageracionBloque.value

  function geometriaEstrato(f) {
    const k = escalaBloque()
    const sep = estado.separacion.value * 900
    const indice = FORMACIONES.indexOf(f)
    const desde = FORMACIONES.length - 1 - indice
    const base = (PROFUNDIDAD_MODELO - f.base) * k + desde * sep + estado.alturaSuelo.value
    const alto = (PROFUNDIDAD_MODELO - f.techo) * k + desde * sep + estado.alturaSuelo.value
    return { base, alto }
  }

  async function cargarDatos() {
    const [acuifero, recarga, pozos] = await Promise.all(
      [RUTA.acuifero, RUTA.recarga, RUTA.pozos].map(async (r) => {
        const res = await fetch(`${import.meta.env.BASE_URL}${r}`)
        if (!res.ok) throw new Error(`No se pudo cargar ${r} (HTTP ${res.status})`)
        return res.json()
      }),
    )
    datos.value = { acuifero, recarga, pozos }
    return datos.value
  }

  /**
   * Altura de la columna de cada pozo. Representa la profundidad al nivel del
   * agua (nivel estático): cuanto más alta la columna, más profundo está el
   * agua. La escala es exagerada para que se lea sobre una huella de ~50 km.
   */
  const alturaPozo = () => ['*', ['get', 'nivel_estatico_m'], estado.escalaPozos.value]

  function agregarCapas(m, d) {
    m.addSource('acuifero', { type: 'geojson', data: d.acuifero })
    m.addSource('recarga', { type: 'geojson', data: d.recarga })
    m.addSource('pozos', { type: 'geojson', data: d.pozos })
    m.addSource('pozos-columna', { type: 'geojson', data: columnasDePozos(d.pozos) })
    m.addSource('municipios', { type: 'geojson', data: fcMunicipios() })

    // --- Huella real del acuífero sobre el terreno -------------------------
    m.addLayer({
      id: 'acuifero-relleno',
      type: 'fill',
      source: 'acuifero',
      paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.16 },
    })
    m.addLayer({
      id: 'acuifero-borde',
      type: 'line',
      source: 'acuifero',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#7dd3fc', 'line-width': 2.4, 'line-opacity': 0.95 },
    })
    m.addLayer({
      id: 'recarga-relleno',
      type: 'fill',
      source: 'recarga',
      paint: { 'fill-color': '#22d3ee', 'fill-opacity': 0.3 },
    })
    m.addLayer({
      id: 'recarga-borde',
      type: 'line',
      source: 'recarga',
      paint: {
        'line-color': '#a5f3fc',
        'line-width': 1.4,
        'line-dasharray': [2, 1.6],
        'line-opacity': 0.9,
      },
    })

    // --- Bloque estratigráfico levantado ----------------------------------
    for (const f of FORMACIONES) {
      const { base, alto } = geometriaEstrato(f)
      m.addLayer({
        id: `estrato-${f.id}`,
        type: 'fill-extrusion',
        source: 'acuifero',
        paint: {
          'fill-extrusion-color': f.color,
          'fill-extrusion-base': base,
          'fill-extrusion-height': alto,
          'fill-extrusion-opacity': 0.85,
          'fill-extrusion-vertical-gradient': true,
        },
        layout: { visibility: 'none' },
      })
    }

    // --- Pozos como columnas 3D -------------------------------------------
    m.addLayer({
      id: 'pozo-columna',
      type: 'fill-extrusion',
      source: 'pozos-columna',
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'tendencia_m_ano'],
          0.25,
          '#4ade80',
          0.6,
          '#fbbf24',
          1.2,
          '#f87171',
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-height': alturaPozo(),
        'fill-extrusion-opacity': 0.92,
        'fill-extrusion-vertical-gradient': true,
      },
    })
    m.addLayer({
      id: 'pozo-punto',
      type: 'circle',
      source: 'pozos',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 13, 9],
        'circle-color': '#0b1f33',
        'circle-stroke-color': '#7dd3fc',
        'circle-stroke-width': 2,
        'circle-pitch-alignment': 'map',
      },
    })
    m.addLayer({
      id: 'pozo-etiqueta',
      type: 'symbol',
      source: 'pozos',
      minzoom: 10,
      layout: {
        'text-field': ['get', 'codigo'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#e0f2fe',
        'text-halo-color': '#061422',
        'text-halo-width': 1.4,
      },
    })

    // --- Referencias urbanas ----------------------------------------------
    m.addLayer({
      id: 'municipio-punto',
      type: 'circle',
      source: 'municipios',
      paint: {
        'circle-radius': 3.5,
        'circle-color': ['case', ['==', ['get', 'sobreAcuifero'], 1], '#fde68a', '#94a3b8'],
        'circle-stroke-color': '#061422',
        'circle-stroke-width': 1,
      },
    })
    m.addLayer({
      id: 'municipio-etiqueta',
      type: 'symbol',
      source: 'municipios',
      layout: {
        'text-field': ['get', 'nombre'],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 12, 14],
        'text-offset': [0, -1.1],
        'text-anchor': 'bottom',
      },
      paint: {
        'text-color': ['case', ['==', ['get', 'sobreAcuifero'], 1], '#fef3c7', '#cbd5e1'],
        'text-halo-color': '#061422',
        'text-halo-width': 1.6,
      },
    })
  }

  function conectarInteraccion(m) {
    popup = new maplibregl.Popup({ closeButton: false, offset: 14, maxWidth: '260px' })

    const sobre = (e) => {
      m.getCanvas().style.cursor = 'pointer'
      const p = e.features[0].properties
      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong class="text-sky-200">${p.nombre}</strong><br>` +
            `<span class="text-slate-400">${p.codigo} · ${p.municipio}</span><br>` +
            `Nivel estático: <strong>${Number(p.nivel_estatico_m).toFixed(1)} m</strong><br>` +
            `Tendencia: <strong>${Number(p.tendencia_m_ano).toFixed(2)} m/año</strong>`,
        )
        .addTo(m)
    }
    const fuera = () => {
      m.getCanvas().style.cursor = ''
      popup.remove()
    }
    const clic = (e) => {
      const codigo = e.features[0].properties.codigo
      const pozo = datos.value.pozos.features.find((f) => f.properties.codigo === codigo)
      if (pozo) callbacks.onSeleccionarPozo?.(pozo.properties)
    }

    for (const capa of ['pozo-punto', 'pozo-columna']) {
      m.on('mouseenter', capa, sobre)
      m.on('mouseleave', capa, fuera)
      m.on('click', capa, clic)
      limpiadores.push(() => {
        m.off('mouseenter', capa, sobre)
        m.off('mouseleave', capa, fuera)
        m.off('click', capa, clic)
      })
    }
  }

  function aplicarVisibilidad() {
    const m = mapa.value
    if (!m || !capasListas) return
    const c = estado.capas.value
    const set = (id, visible) => {
      if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
    }
    set('acuifero-relleno', c.acuifero)
    set('acuifero-borde', c.acuifero)
    set('recarga-relleno', c.recarga)
    set('recarga-borde', c.recarga)
    set('pozo-columna', c.pozos)
    set('pozo-punto', c.pozos)
    set('pozo-etiqueta', c.pozos)
    set('municipio-punto', c.municipios)
    set('municipio-etiqueta', c.municipios)
    for (const f of FORMACIONES) {
      set(`estrato-${f.id}`, c.bloque && estado.estratosVisibles.value.includes(f.id))
    }
  }

  function aplicarBloque() {
    const m = mapa.value
    if (!m || !capasListas) return
    for (const f of FORMACIONES) {
      const id = `estrato-${f.id}`
      if (!m.getLayer(id)) continue
      const { base, alto } = geometriaEstrato(f)
      m.setPaintProperty(id, 'fill-extrusion-base', base)
      m.setPaintProperty(id, 'fill-extrusion-height', alto)
    }
  }

  function aplicarEscalaPozos() {
    const m = mapa.value
    if (!m || !capasListas || !m.getLayer('pozo-columna')) return
    m.setPaintProperty('pozo-columna', 'fill-extrusion-height', alturaPozo())
  }

  function aplicarTerreno() {
    const m = mapa.value
    if (!m || !capasListas) return
    if (estado.capas.value.terreno) {
      m.setTerrain({ source: 'dem', exaggeration: estado.exageracion.value })
    } else {
      m.setTerrain(null)
    }
  }

  function volarA(vista) {
    mapa.value?.flyTo({
      center: vista.center,
      zoom: vista.zoom,
      pitch: vista.pitch,
      bearing: vista.bearing,
      duration: 2000,
      essential: true,
    })
  }

  function enfocarPozo(props) {
    const pozo = datos.value.pozos?.features.find((f) => f.properties.codigo === props.codigo)
    if (!pozo) return
    mapa.value?.flyTo({
      center: pozo.geometry.coordinates,
      zoom: 12.4,
      pitch: 66,
      duration: 1800,
      essential: true,
    })
  }

  function alternarRotacion(activo) {
    rotando = activo
    if (animacion) cancelAnimationFrame(animacion)
    if (!activo) return
    const paso = () => {
      if (!rotando || !mapa.value) return
      mapa.value.setBearing(mapa.value.getBearing() + 0.08)
      animacion = requestAnimationFrame(paso)
    }
    animacion = requestAnimationFrame(paso)
  }

  async function iniciar() {
    try {
      const d = await cargarDatos()
      const m = new maplibregl.Map({
        container: contenedor.value,
        style: estiloBase(estado.fondo.value),
        ...VISTA_INICIAL,
        maxBounds: LIMITES,
        maxPitch: 85,
        minZoom: 7,
        attributionControl: { compact: true },
        hash: false,
      })
      mapa.value = m

      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
      m.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')
      m.addControl(new maplibregl.FullscreenControl(), 'top-right')

      m.on('error', (e) => {
        // Las teselas que fallan puntualmente no deben tumbar el visor.
        console.warn('[mapa]', e?.error?.message ?? e)
      })

      if (!m.isStyleLoaded()) {
        await new Promise((resolve) => m.once('style.load', resolve))
      }
      agregarCapas(m, d)
      capasListas = true
      conectarInteraccion(m)
      aplicarTerreno()
      aplicarVisibilidad()
      cargando.value = false
      callbacks.onListo?.(d)
    } catch (e) {
      error.value = e.message ?? 'Error desconocido al iniciar el visor'
      cargando.value = false
    }
  }

  // --- Reacciones a los controles de la interfaz --------------------------
  watch(
    () => estado.fondo.value,
    (id) => {
      const m = mapa.value
      if (!m) return
      const src = m.getSource('fondo')
      if (!src) return
      const f = FONDOS.find((x) => x.id === id) ?? FONDOS[0]
      src.setTiles(f.tiles)
    },
  )
  watch(() => estado.capas.value, aplicarVisibilidad, { deep: true })
  watch(() => estado.estratosVisibles.value, aplicarVisibilidad, { deep: true })
  watch(() => estado.capas.value.terreno, aplicarTerreno)
  watch(() => estado.exageracion.value, aplicarTerreno)
  watch(
    () => [
      estado.exageracionBloque.value,
      estado.separacion.value,
      estado.alturaSuelo.value,
    ],
    aplicarBloque,
  )
  watch(() => estado.escalaPozos.value, aplicarEscalaPozos)

  onBeforeUnmount(() => {
    rotando = false
    if (animacion) cancelAnimationFrame(animacion)
    limpiadores.forEach((fn) => fn())
    popup?.remove()
    mapa.value?.remove()
    mapa.value = null
  })

  return { mapa, cargando, error, datos, iniciar, volarA, enfocarPozo, alternarRotacion }
}
