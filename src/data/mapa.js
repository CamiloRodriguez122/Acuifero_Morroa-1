/** Configuración del visor geoespacial: fondos, cámara y referencias urbanas. */

const ATRIB_OSM =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const ATRIB_CARTO = `${ATRIB_OSM} · © <a href="https://carto.com/attributions">CARTO</a>`

/**
 * Fondos cartográficos servidos por teselas públicas sin llave de API, de modo
 * que el visor funciona en cualquier despliegue sin credenciales (RNF-14).
 */
export const FONDOS = [
  {
    id: 'satelite',
    nombre: 'Satélite',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    atribucion: 'Imágenes © Esri, Maxar, Earthstar Geographics',
    maxzoom: 18,
    brillo: [0.05, 0.92],
  },
  {
    id: 'relieve',
    nombre: 'Relieve',
    tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
    atribucion: `${ATRIB_OSM} · SRTM | © <a href="https://opentopomap.org">OpenTopoMap</a>`,
    maxzoom: 17,
    brillo: [0.04, 0.95],
  },
  {
    id: 'claro',
    nombre: 'Mapa claro',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    ],
    atribucion: ATRIB_CARTO,
    maxzoom: 19,
    brillo: [0.06, 1],
  },
  {
    id: 'oscuro',
    nombre: 'Mapa oscuro',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    ],
    atribucion: ATRIB_CARTO,
    maxzoom: 19,
    brillo: [0, 0.88],
  },
]

/** Modelo digital de elevación (codificación Terrarium) para el relieve 3D. */
export const FUENTE_DEM = {
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium',
  tileSize: 256,
  maxzoom: 13,
  atribucion:
    'Elevación: <a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> (AWS Open Data)',
}

/** Encuadre inicial: todo el sistema acuífero en vista oblicua. */
export const VISTA_INICIAL = {
  center: [-75.315, 9.345],
  zoom: 9.15,
  pitch: 58,
  bearing: -26,
}

/** Recorridos predefinidos de cámara (RF-03). */
export const VISTAS = [
  { id: 'general', nombre: 'Vista general', ...VISTA_INICIAL },
  {
    id: 'recarga',
    nombre: 'Zona de recarga',
    center: [-75.312, 9.352],
    zoom: 10.3,
    pitch: 66,
    bearing: 22,
  },
  {
    id: 'sincelejo',
    nombre: 'Sincelejo',
    center: [-75.3978, 9.3047],
    zoom: 11.6,
    pitch: 70,
    bearing: -40,
  },
  {
    id: 'ovejas',
    nombre: 'Ovejas',
    center: [-75.2286, 9.5275],
    zoom: 11.4,
    pitch: 64,
    bearing: 8,
  },
  {
    id: 'sampues',
    nombre: 'Sampués',
    center: [-75.3797, 9.1839],
    zoom: 11.4,
    pitch: 64,
    bearing: -12,
  },
  {
    id: 'cenital',
    nombre: 'Cenital',
    center: [-75.315, 9.345],
    zoom: 9.3,
    pitch: 0,
    bearing: 0,
  },
]

/** Cabeceras municipales sobre el acuífero o en su área de influencia. */
export const MUNICIPIOS = [
  { nombre: 'Sincelejo', lon: -75.3978, lat: 9.3047, sobreAcuifero: true },
  { nombre: 'Corozal', lon: -75.2947, lat: 9.3175, sobreAcuifero: true },
  { nombre: 'Morroa', lon: -75.3053, lat: 9.3333, sobreAcuifero: true },
  { nombre: 'Los Palmitos', lon: -75.2711, lat: 9.3789, sobreAcuifero: true },
  { nombre: 'Ovejas', lon: -75.2286, lat: 9.5275, sobreAcuifero: true },
  { nombre: 'Sampués', lon: -75.3797, lat: 9.1839, sobreAcuifero: true },
  { nombre: 'San Juan de Betulia', lon: -75.2803, lat: 9.2733, sobreAcuifero: true },
  { nombre: 'Toluviejo', lon: -75.4394, lat: 9.4506, sobreAcuifero: false },
  { nombre: 'Colosó', lon: -75.355, lat: 9.4972, sobreAcuifero: false },
  { nombre: 'Chalán', lon: -75.3122, lat: 9.5433, sobreAcuifero: false },
  { nombre: 'San Pedro', lon: -75.0678, lat: 9.3942, sobreAcuifero: false },
  { nombre: 'Sincé', lon: -75.1458, lat: 9.2442, sobreAcuifero: false },
]

/** Extensión aproximada del área de estudio, usada para acotar la navegación. */
export const LIMITES = [
  [-75.72, 8.95],
  [-74.95, 9.78],
]
