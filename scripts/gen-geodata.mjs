/**
 * Genera las capas GeoJSON base del acuífero Morroa (WGS84 / EPSG:4326).
 *
 * La delimitación se digitalizó a partir del Mapa Geológico de la Formación
 * Morroa (afloramiento Tpm) y del mapa de Recarga Anual 2023, anclando los
 * vértices a las coordenadas oficiales de las cabeceras municipales. Es una
 * aproximación cartográfica: para usar la cartografía oficial de CARSUCRE basta
 * con sustituir los archivos de `public/data`.
 *
 * Se ejecuta en `prebuild`, de modo que el repositorio no versiona datos
 * derivados. Uso: `node scripts/gen-geodata.mjs`
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = join(RAIZ, 'public', 'data')

// --- Límite exterior del sistema acuífero (confinado + aflorante) -----------
const ACUIFERO = [
  [-75.205, 9.575], [-75.16, 9.545], [-75.175, 9.495], [-75.21, 9.465],
  [-75.235, 9.43], [-75.23, 9.4], [-75.245, 9.37], [-75.25, 9.34],
  [-75.26, 9.31], [-75.275, 9.275], [-75.295, 9.24], [-75.315, 9.21],
  [-75.335, 9.18], [-75.35, 9.15], [-75.375, 9.125], [-75.41, 9.13],
  [-75.44, 9.16], [-75.445, 9.195], [-75.425, 9.23], [-75.41, 9.265],
  [-75.42, 9.295], [-75.43, 9.325], [-75.405, 9.35], [-75.375, 9.375],
  [-75.35, 9.405], [-75.325, 9.435], [-75.305, 9.47], [-75.285, 9.505],
  [-75.265, 9.54], [-75.24, 9.565],
]

// --- Franja de afloramiento de la Fm. Morroa = zona de recarga directa ------
const RECARGA_W = [
  [-75.25, 9.55], [-75.27, 9.5], [-75.29, 9.45], [-75.31, 9.4],
  [-75.33, 9.355], [-75.348, 9.315], [-75.368, 9.27], [-75.383, 9.225],
  [-75.398, 9.18], [-75.406, 9.145],
]
const RECARGA_E = [
  [-75.365, 9.142], [-75.353, 9.18], [-75.338, 9.225], [-75.323, 9.27],
  [-75.303, 9.315], [-75.283, 9.355], [-75.263, 9.4], [-75.243, 9.45],
  [-75.223, 9.5], [-75.203, 9.55],
]

const anillo = (coords) => {
  const r = coords.map((c) => [...c])
  if (r[0][0] !== r.at(-1)[0] || r[0][1] !== r.at(-1)[1]) r.push([...r[0]])
  return [r]
}

const fc = (features) => ({ type: 'FeatureCollection', features })

function escribir(nombre, obj) {
  const ruta = join(SALIDA, nombre)
  writeFileSync(ruta, JSON.stringify(obj), 'utf8')
  console.log(`${nombre}  ${(JSON.stringify(obj).length / 1024).toFixed(1)} KB`)
}

// --- Generador pseudoaleatorio con semilla (mulberry32) ---------------------
// Determinista: la misma semilla produce siempre la misma red de demostración.
function prng(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Normal estándar por el método de Box-Muller. */
function normal(rand) {
  let u = 0
  while (u === 0) u = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

// --- Red de pozos ----------------------------------------------------------
// DATOS DE DEMOSTRACIÓN. Red sintética, coherente en magnitud y tendencia con
// lo descrito en la literatura (Buitrago & Donado, 2000; CARSUCRE, 2024), usada
// solo para validar la visualización mientras se integra el histórico oficial.
const POZOS = [
  ['POZ-SIN-01', 'Sincelejo Norte', 'Sincelejo', -75.382, 9.335, 310, 213, 62.0, 0.85],
  ['POZ-SIN-02', 'La Palma', 'Sincelejo', -75.401, 9.302, 340, 205, 68.4, 1.05],
  ['POZ-SIN-03', 'Venecia', 'Sincelejo', -75.365, 9.287, 295, 198, 59.1, 0.92],
  ['POZ-SIN-04', 'El Cortijo', 'Sincelejo', -75.406, 9.276, 360, 186, 71.8, 1.18],
  ['POZ-MOR-01', 'Morroa Cabecera', 'Morroa', -75.309, 9.333, 240, 248, 41.6, 0.48],
  ['POZ-MOR-02', 'Sabaneta', 'Morroa', -75.33, 9.362, 225, 262, 36.9, 0.35],
  ['POZ-COR-01', 'Corozal Centro', 'Corozal', -75.296, 9.318, 280, 172, 54.3, 0.74],
  ['POZ-COR-02', 'Las Llanadas', 'Corozal', -75.278, 9.293, 305, 165, 57.7, 0.81],
  ['POZ-SAM-01', 'Sampués Cabecera', 'Sampués', -75.379, 9.185, 330, 145, 64.2, 0.96],
  ['POZ-SAM-02', 'Segovia', 'Sampués', -75.402, 9.208, 315, 152, 60.8, 0.88],
  ['POZ-LPA-01', 'Los Palmitos Cabecera', 'Los Palmitos', -75.274, 9.378, 265, 188, 47.5, 0.61],
  ['POZ-LPA-02', 'Sabanas de Pedro', 'Los Palmitos', -75.29, 9.408, 250, 201, 43.2, 0.52],
  ['POZ-OVE-01', 'Ovejas Cabecera', 'Ovejas', -75.23, 9.527, 210, 268, 33.4, 0.29],
  ['POZ-OVE-02', 'Canutal', 'Ovejas', -75.205, 9.493, 235, 241, 38.7, 0.37],
  ['POZ-OVE-03', 'Don Gabriel', 'Ovejas', -75.248, 9.462, 220, 255, 35.1, 0.31],
  ['POZ-SJB-01', 'San Juan de Betulia', 'San Juan de Betulia', -75.282, 9.274, 290, 158, 52.9, 0.69],
  ['POZ-SIN-05', 'Chochó', 'Sincelejo', -75.352, 9.262, 300, 191, 57.4, 0.87],
  ['POZ-COR-03', 'Hato Nuevo', 'Corozal', -75.265, 9.345, 270, 178, 49.8, 0.66],
]

const ANIO_INI = 2010
const ANIO_FIN = 2025
// Régimen bimodal del Caribe seco colombiano: recuperación en mayo y sep-oct.
const ESTACIONAL = [1.35, 1.55, 1.7, 1.2, -0.45, -0.8, -0.25, -0.6, -1.4, -1.65, -0.55, 0.65]
const N_MESES = (ANIO_FIN - ANIO_INI + 1) * 12

const redondear = (v, d = 2) => Number(v.toFixed(d))

function generar() {
  mkdirSync(SALIDA, { recursive: true })

  escribir('acuifero-morroa.geojson', fc([{
    type: 'Feature',
    properties: {
      nombre: 'Acuifero Morroa',
      unidad: 'Formacion Morroa (Tpm)',
      area_km2: 1120,
      espesor_medio_m: 320,
      fuente: 'Digitalizado sobre mapa geologico Fm. Morroa y mapa de recarga 2023',
    },
    geometry: { type: 'Polygon', coordinates: anillo(ACUIFERO) },
  }]))

  escribir('zona-recarga.geojson', fc([{
    type: 'Feature',
    properties: {
      nombre: 'Zona de recarga directa',
      unidad: 'Afloramiento Fm. Morroa (Tpm)',
      recarga_mm_ano: 172,
      fuente: 'Mapa de Recarga Anual 2023 (IDEAM / Google Earth Engine)',
    },
    geometry: { type: 'Polygon', coordinates: anillo([...RECARGA_W, ...RECARGA_E]) },
  }]))

  const rand = prng(20260916)
  const features = POZOS.map(([codigo, nombre, municipio, lon, lat, prof, cota, ne0, tend]) => {
    const niveles = []
    let ruido = 0
    for (let i = 0; i < N_MESES; i += 1) {
      const mes = i % 12
      ruido = 0.72 * ruido + normal(rand) * 0.3 // persistencia interanual
      niveles.push(redondear(ne0 + (tend * i) / 12 + ESTACIONAL[mes] * 0.55 + ruido))
    }
    const actual = niveles.at(-1)
    const suma = niveles.reduce((a, b) => a + b, 0)
    return {
      type: 'Feature',
      properties: {
        codigo,
        nombre,
        municipio,
        profundidad_m: prof,
        cota_terreno_msnm: cota,
        nivel_estatico_m: actual,
        cota_piezometrica_msnm: redondear(cota - actual),
        tendencia_m_ano: tend,
        descenso_acumulado_m: redondear(actual - niveles[0]),
        minimo_m: redondear(Math.min(...niveles)),
        maximo_m: redondear(Math.max(...niveles)),
        promedio_m: redondear(suma / niveles.length),
        periodo: `${ANIO_INI}-${ANIO_FIN}`,
        n_registros: niveles.length,
        inicio: `${ANIO_INI}-01`,
        niveles,
        origen: 'demo',
      },
      geometry: { type: 'Point', coordinates: [lon, lat] },
    }
  })

  escribir('pozos.geojson', fc(features))
}

generar()
