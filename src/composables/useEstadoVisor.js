import { inject, provide, ref } from 'vue'

import { FORMACIONES } from '../data/formaciones.js'

export const CLAVE_ESTADO = Symbol('estado-visor')

/**
 * Estado compartido entre el mapa geoespacial, el corte geológico y los paneles
 * de control. Se crea una sola vez en App.vue y se entrega por provide/inject:
 * al ser un store mutable, pasarlo como prop obligaría a los hijos a mutar una
 * prop, que es justo lo que este patrón evita.
 */
export function crearEstadoVisor() {
  const estado = {
    fondo: ref('satelite'),
    capas: ref({
      terreno: true,
      acuifero: true,
      recarga: true,
      bloque: false,
      pozos: true,
      municipios: true,
    }),
    estratosVisibles: ref(FORMACIONES.map((f) => f.id)),
    exageracion: ref(2.2),
    exageracionBloque: ref(10),
    alturaSuelo: ref(4500),
    escalaPozos: ref(55),
    separacion: ref(0),
    pozoSeleccionado: ref(null),
    formacionActiva: ref('Tpm'),
  }
  provide(CLAVE_ESTADO, estado)
  return estado
}

/** Acceso al estado compartido desde cualquier componente descendiente. */
export function usarEstadoVisor() {
  const estado = inject(CLAVE_ESTADO)
  if (!estado) {
    throw new Error('usarEstadoVisor() requiere que un ancestro llame a crearEstadoVisor()')
  }
  return estado
}
