import { onBeforeUnmount, shallowRef, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FORMACIONES, PROFUNDIDAD_MODELO } from '../data/formaciones.js'

// Escala del bloque diagramático: el eje Y representa profundidad real en
// metros, comprimida para que el bloque quepa en pantalla sin deformar el
// orden ni el espesor relativo de las unidades.
const ANCHO = 120
const FONDO = 80
const ESCALA_Y = 0.09
const y = (metros) => -metros * ESCALA_Y

/** Superficie piezométrica media y proyectada, en metros bajo el terreno. */
const NIVEL_ACTUAL = 68
const NIVEL_PROYECTADO = 84

/**
 * Corte geológico 3D del acuífero Morroa.
 *
 * A diferencia del visor geoespacial, aquí el eje vertical sí crece hacia abajo:
 * el bloque muestra las ocho unidades de la columna estratigráfica a su
 * profundidad real, la superficie piezométrica y la posición de un pozo tipo.
 */
export function useCorteGeologico(contenedor, estado, callbacks = {}) {
  const listo = shallowRef(false)
  let escena, camara, render, controles, raycaster, puntero
  let grupoEstratos, grupoAgua, grupoPozo
  let anim = null
  let resizeObs = null
  const mallas = new Map()
  let resaltado = null

  function materialEstrato(f) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(f.color),
      roughness: 0.92,
      metalness: 0.02,
      transparent: true,
      opacity: 0.97,
      flatShading: false,
    })
  }

  function construirEstratos() {
    grupoEstratos = new THREE.Group()
    for (const f of FORMACIONES) {
      const espesor = (f.base - f.techo) * ESCALA_Y
      const geo = new THREE.BoxGeometry(ANCHO, espesor, FONDO)
      const malla = new THREE.Mesh(geo, materialEstrato(f))
      malla.position.y = y(f.techo) - espesor / 2
      malla.userData = { formacion: f, yBase: malla.position.y }
      malla.castShadow = true
      malla.receiveShadow = true

      // Arista superior resaltada: separa visualmente cada contacto geológico.
      const aristas = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x0b1f33, transparent: true, opacity: 0.45 }),
      )
      malla.add(aristas)

      mallas.set(f.id, malla)
      grupoEstratos.add(malla)
    }
    escena.add(grupoEstratos)
  }

  function construirSuperficie() {
    const geo = new THREE.PlaneGeometry(ANCHO, FONDO, 24, 16)
    const pos = geo.attributes.position
    // Ondulación suave que evoca el relieve de las lomas de Morroa.
    for (let i = 0; i < pos.count; i += 1) {
      const px = pos.getX(i)
      const py = pos.getY(i)
      pos.setZ(i, Math.sin(px * 0.09) * 1.6 + Math.cos(py * 0.12) * 1.1)
    }
    geo.computeVertexNormals()
    const malla = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x6f8f55, roughness: 1, metalness: 0 }),
    )
    malla.rotation.x = -Math.PI / 2
    // Amplitud máxima de la ondulación = 1.6 + 1.1; el plano se eleva por
    // encima de ese valle para que el techo del bloque no lo atraviese.
    malla.position.y = 3.2
    malla.receiveShadow = true
    escena.add(malla)
  }

  function construirAgua() {
    grupoAgua = new THREE.Group()

    const plano = (nivel, color, opacidad) => {
      // Sobresalen del bloque para que el nivel se lea como un reborde
      // continuo incluso con los estratos opacos y sin separar.
      const geo = new THREE.PlaneGeometry(ANCHO * 1.09, FONDO * 1.09)
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color,
          transparent: true,
          opacity: opacidad,
          roughness: 0.15,
          metalness: 0.35,
          side: THREE.DoubleSide,
        }),
      )
      m.rotation.x = -Math.PI / 2
      m.position.y = y(nivel)
      return m
    }

    grupoAgua.add(plano(NIVEL_ACTUAL, 0x38bdf8, 0.55))
    const proyectado = plano(NIVEL_PROYECTADO, 0xf97362, 0.32)
    proyectado.userData.proyectado = true
    grupoAgua.add(proyectado)
    escena.add(grupoAgua)
  }

  function construirPozo() {
    grupoPozo = new THREE.Group()
    const profundidad = 310
    const x = -ANCHO * 0.22
    const z = FONDO * 0.18

    const entubado = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, profundidad * ESCALA_Y, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xd6dfe8,
        roughness: 0.45,
        metalness: 0.6,
        side: THREE.DoubleSide,
      }),
    )
    entubado.position.set(x, y(profundidad / 2), z)

    // Columna de agua dentro del pozo, del nivel estático al fondo.
    const alturaAgua = (profundidad - NIVEL_ACTUAL) * ESCALA_Y
    const agua = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, alturaAgua, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        metalness: 0.4,
      }),
    )
    agua.position.set(x, y(NIVEL_ACTUAL + (profundidad - NIVEL_ACTUAL) / 2), z)

    const cabezal = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 3, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.7 }),
    )
    cabezal.position.set(x, 2.6, z)

    grupoPozo.add(entubado, agua, cabezal)
    escena.add(grupoPozo)
  }

  function construirLuces() {
    escena.add(new THREE.HemisphereLight(0xbfd9f2, 0x1a2a38, 1.15))
    const sol = new THREE.DirectionalLight(0xfff4e0, 1.5)
    sol.position.set(70, 120, 90)
    sol.castShadow = true
    sol.shadow.mapSize.set(2048, 2048)
    sol.shadow.camera.left = -130
    sol.shadow.camera.right = 130
    sol.shadow.camera.top = 130
    sol.shadow.camera.bottom = -130
    sol.shadow.camera.near = 10
    sol.shadow.camera.far = 400
    sol.shadow.bias = -0.0008
    sol.shadow.normalBias = 0.6
    sol.shadow.camera.updateProjectionMatrix()
    escena.add(sol)
    escena.add(new THREE.DirectionalLight(0x7dd3fc, 0.35).translateX(-90))
  }

  /** Posiciones 2D de las etiquetas de cada unidad, para el overlay HTML. */
  function calcularEtiquetas() {
    if (!render) return []
    const rect = render.domElement.getBoundingClientRect()
    const v = new THREE.Vector3()
    const salida = []
    for (const [id, malla] of mallas) {
      if (!malla.visible) continue
      // El grupo de estratos está en el origen, así que la posición de la
      // malla ya es su posición en coordenadas de mundo.
      v.set(ANCHO / 2, malla.position.y, FONDO / 2)
      v.project(camara)
      if (v.z > 1) continue
      salida.push({
        id,
        x: ((v.x + 1) / 2) * rect.width,
        yPos: ((1 - v.y) / 2) * rect.height,
      })
    }
    return salida
  }

  function aplicarSeparacion() {
    const sep = estado.separacion.value * 12
    let i = 0
    for (const f of FORMACIONES) {
      const malla = mallas.get(f.id)
      if (malla) malla.position.y = malla.userData.yBase - i * sep
      i += 1
    }
    // Los planos piezometricos acompanan al techo de la Fm. Morroa cuando las
    // unidades se separan, para no quedar flotando fuera de contexto.
    if (grupoAgua) {
      const iTpm = FORMACIONES.findIndex((f) => f.id === 'Tpm')
      grupoAgua.position.y = -iTpm * sep * (NIVEL_ACTUAL / 172)
    }
  }

  function aplicarVisibilidad() {
    for (const f of FORMACIONES) {
      const malla = mallas.get(f.id)
      if (malla) malla.visible = estado.estratosVisibles.value.includes(f.id)
    }
  }

  function resaltar(id) {
    for (const [clave, malla] of mallas) {
      const activo = id === null || clave === id
      malla.material.opacity = activo ? 0.97 : 0.2
      malla.material.depthWrite = activo
    }
  }

  function alSenalar(evento) {
    const rect = render.domElement.getBoundingClientRect()
    puntero.x = ((evento.clientX - rect.left) / rect.width) * 2 - 1
    puntero.y = -((evento.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(puntero, camara)
    const impactos = raycaster.intersectObjects([...mallas.values()], false)
    const id = impactos.find((i) => i.object.visible)?.object.userData.formacion.id ?? null
    if (id !== resaltado) {
      resaltado = id
      resaltar(id)
      render.domElement.style.cursor = id ? 'pointer' : 'grab'
      callbacks.onResaltar?.(id)
    }
  }

  function alHacerClic() {
    if (resaltado) callbacks.onSeleccionar?.(resaltado)
  }

  function dimensionar() {
    const el = contenedor.value
    if (!el || !render) return
    const { clientWidth: w, clientHeight: h } = el
    if (!w || !h) return
    render.setSize(w, h, false)
    camara.aspect = w / h
    camara.updateProjectionMatrix()
  }

  function bucle() {
    anim = requestAnimationFrame(bucle)
    controles.update()
    render.render(escena, camara)
    callbacks.onEtiquetas?.(calcularEtiquetas())
  }

  function iniciar() {
    const el = contenedor.value
    if (!el) return

    escena = new THREE.Scene()
    escena.background = null
    escena.fog = new THREE.Fog(0x061422, 260, 520)

    camara = new THREE.PerspectiveCamera(42, 1, 0.5, 2000)
    camara.position.set(118, 86, 142)

    render = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    render.shadowMap.enabled = true
    render.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(render.domElement)
    render.domElement.style.cursor = 'grab'

    controles = new OrbitControls(camara, render.domElement)
    controles.enableDamping = true
    controles.dampingFactor = 0.07
    controles.minDistance = 70
    controles.maxDistance = 420
    controles.maxPolarAngle = Math.PI * 0.49
    controles.target.set(0, y(PROFUNDIDAD_MODELO / 2), 0)

    raycaster = new THREE.Raycaster()
    puntero = new THREE.Vector2()

    construirLuces()
    construirSuperficie()
    construirEstratos()
    construirAgua()
    construirPozo()
    aplicarVisibilidad()
    aplicarSeparacion()

    render.domElement.addEventListener('pointermove', alSenalar)
    render.domElement.addEventListener('click', alHacerClic)
    render.domElement.addEventListener('pointerleave', () => {
      resaltado = null
      resaltar(null)
      callbacks.onResaltar?.(null)
    })

    resizeObs = new ResizeObserver(dimensionar)
    resizeObs.observe(el)
    dimensionar()
    bucle()
    listo.value = true
  }

  function encuadrar() {
    camara.position.set(118, 86, 142)
    controles.target.set(0, y(PROFUNDIDAD_MODELO / 2), 0)
    controles.update()
  }

  watch(() => estado.separacion.value, aplicarSeparacion)
  watch(() => estado.estratosVisibles.value, aplicarVisibilidad, { deep: true })

  onBeforeUnmount(() => {
    if (anim) cancelAnimationFrame(anim)
    resizeObs?.disconnect()
    controles?.dispose()
    for (const malla of mallas.values()) {
      malla.geometry.dispose()
      malla.material.dispose()
    }
    render?.dispose()
    render?.domElement.remove()
  })

  return { listo, iniciar, encuadrar, NIVEL_ACTUAL, NIVEL_PROYECTADO }
}
