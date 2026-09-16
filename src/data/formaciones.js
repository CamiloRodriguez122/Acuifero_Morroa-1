/**
 * Columna estratigrafica del sistema acuifero Morroa.
 *
 * Unidades y colores tomados de la leyenda del Mapa Geologico de la Formacion
 * Morroa. `techo` y `base` se expresan en metros bajo la superficie del terreno
 * y corresponden a espesores medios representativos del sector central del
 * acuifero (Sincelejo - Corozal - Morroa); en campo varian lateralmente.
 *
 * `rol` clasifica el comportamiento hidrogeologico de cada unidad:
 *   acuifero | acuitardo | semiconfinante | basamento
 */
export const FORMACIONES = [
  {
    id: 'Qal',
    sigla: 'Qal',
    nombre: 'Depósitos aluviales',
    color: '#d7d7d7',
    techo: 0,
    base: 18,
    rol: 'acuitardo',
    litologia: 'Gravas, arenas y limos de cauce reciente.',
    descripcion:
      'Cobertura reciente sobre valles y cauces. Espesor reducido y discontinuo; transmite la infiltración hacia las unidades subyacentes pero no constituye el acuífero explotado.',
  },
  {
    id: 'Qpb',
    sigla: 'Qpb',
    nombre: 'Formación Betulia',
    color: '#f2ef9a',
    techo: 18,
    base: 95,
    rol: 'semiconfinante',
    litologia: 'Arcillas arenosas, limos y niveles de arena fina.',
    descripcion:
      'Cobertura cuaternaria que domina el sector oriental del área. Actúa como capa semiconfinante: reduce la infiltración directa y protege el acuífero de la contaminación superficial.',
  },
  {
    id: 'Tpa',
    sigla: 'Tpa',
    nombre: 'Formación Antonio',
    color: '#c58fd6',
    techo: 95,
    base: 128,
    rol: 'acuitardo',
    litologia: 'Arcillolitas y limolitas con lentes arenosos.',
    descripcion:
      'Aflora en lentes reducidos al occidente de Morroa. Baja permeabilidad; localmente separa niveles productores dentro del sistema.',
  },
  {
    id: 'Tmc',
    sigla: 'Tmc',
    nombre: 'Formación El Carmen',
    color: '#dcecc4',
    techo: 128,
    base: 172,
    rol: 'acuitardo',
    litologia: 'Lodolitas y arcillolitas con intercalaciones calcáreas.',
    descripcion:
      'Unidad de transición hacia el acuífero principal. Confina parcialmente la Formación Morroa en el sector oriental del sistema.',
  },
  {
    id: 'Tpm',
    sigla: 'Tpm',
    nombre: 'Formación Morroa',
    color: '#7fe7e0',
    techo: 172,
    base: 432,
    rol: 'acuifero',
    principal: true,
    litologia: 'Areniscas cuarzosas de grano medio a grueso, friables, con intercalaciones de arcillolita.',
    descripcion:
      'Unidad acuífera principal de la región. Su franja de afloramiento al occidente constituye la zona de recarga directa; hacia el oriente se profundiza y queda confinada. Abastece al 98 % de la población de los municipios bajo jurisdicción de CARSUCRE.',
  },
  {
    id: 'Tpss',
    sigla: 'Tpss',
    nombre: 'Formación Sincelejo Superior',
    color: '#f0a44a',
    techo: 432,
    base: 520,
    rol: 'acuitardo',
    litologia: 'Arcillolitas abigarradas con niveles de arenisca.',
    descripcion:
      'Limita el acuífero hacia el occidente. Su baja permeabilidad restringe el flujo lateral y define el borde hidráulico del sistema.',
  },
  {
    id: 'Tpsi',
    sigla: 'Tpsi',
    nombre: 'Formación Sincelejo Inferior',
    color: '#e08a2e',
    techo: 520,
    base: 640,
    rol: 'acuitardo',
    litologia: 'Arcillolitas compactas con conglomerados basales.',
    descripcion:
      'Unidad basal del conjunto Sincelejo. Constituye el piso hidráulico efectivo del acuífero explotado.',
  },
  {
    id: 'Tct',
    sigla: 'Tct',
    nombre: 'Formación Toluviejo',
    color: '#7a4a3a',
    techo: 640,
    base: 760,
    rol: 'basamento',
    litologia: 'Calizas arrecifales y areniscas calcáreas.',
    descripcion:
      'Basamento hidrogeológico del sistema. No se explota para abastecimiento en el área de estudio.',
  },
]

export const ROLES = {
  acuifero: { etiqueta: 'Unidad acuífera', color: '#38bdf8' },
  semiconfinante: { etiqueta: 'Semiconfinante', color: '#c4b483' },
  acuitardo: { etiqueta: 'Acuitardo', color: '#9aa7b4' },
  basamento: { etiqueta: 'Basamento', color: '#8a6350' },
}

/** Profundidad total representada en el modelo, en metros. */
export const PROFUNDIDAD_MODELO = FORMACIONES[FORMACIONES.length - 1].base

/** Formación acuífera principal, usada como referencia en varias vistas. */
export const FORMACION_PRINCIPAL = FORMACIONES.find((f) => f.principal)
