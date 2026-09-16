<script setup>
import { onMounted, ref } from 'vue'
import { useMapaAcuifero } from '../composables/useMapaAcuifero.js'
import { usarEstadoVisor } from '../composables/useEstadoVisor.js'

const emit = defineEmits(['pozo', 'listo'])

const estado = usarEstadoVisor()

const contenedor = ref(null)
const rotando = ref(false)

const { cargando, error, iniciar, volarA, enfocarPozo, alternarRotacion } = useMapaAcuifero(
  contenedor,
  estado,
  {
    onSeleccionarPozo: (p) => emit('pozo', p),
    onListo: (d) => emit('listo', d),
  },
)

function rotar() {
  rotando.value = !rotando.value
  alternarRotacion(rotando.value)
}

onMounted(iniciar)

defineExpose({ volarA, enfocarPozo, rotar, rotando })
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="contenedor" class="h-full w-full" />

    <!-- Estado de carga -->
    <div
      v-if="cargando && !error"
      class="pointer-events-none absolute inset-0 grid place-items-center bg-abismo/70"
    >
      <div class="flex flex-col items-center gap-3">
        <span
          class="h-8 w-8 animate-spin rounded-full border-2 border-borde border-t-agua"
          aria-hidden="true"
        />
        <p class="text-sm text-slate-300">Cargando el modelo del acuífero…</p>
      </div>
    </div>

    <!-- Error de carga -->
    <div v-if="error" class="absolute inset-0 grid place-items-center bg-abismo/85 p-6">
      <div class="max-w-sm rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
        <p class="text-sm font-medium text-red-200">No se pudo iniciar el visor</p>
        <p class="mt-1 text-xs text-red-200/80">{{ error }}</p>
      </div>
    </div>

    <!-- Nota metodológica sobre el bloque levantado -->
    <p
      v-if="estado.capas.value.bloque"
      class="pointer-events-none absolute bottom-16 left-3 max-w-xs rounded-lg border border-borde/60 bg-abismo/85 px-3 py-2 text-[11px] leading-relaxed text-slate-300"
    >
      Bloque diagramático levantado sobre la huella real del acuífero. Conserva el orden y el
      espesor relativo de las unidades; la escala vertical está exagerada.
    </p>
  </div>
</template>
