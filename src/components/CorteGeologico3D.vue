<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCorteGeologico } from '../composables/useCorteGeologico.js'
import { usarEstadoVisor } from '../composables/useEstadoVisor.js'
import { FORMACIONES, ROLES } from '../data/formaciones.js'
import ControlRango from './ControlRango.vue'

const estado = usarEstadoVisor()

const contenedor = ref(null)
const etiquetas = ref([])
const resaltada = ref(null)
const detalle = ref('Tpm')

const { iniciar, encuadrar, NIVEL_ACTUAL, NIVEL_PROYECTADO } = useCorteGeologico(
  contenedor,
  estado,
  {
    onEtiquetas: (e) => {
      etiquetas.value = e
    },
    onResaltar: (id) => {
      resaltada.value = id
    },
    onSeleccionar: (id) => {
      detalle.value = id
    },
  },
)

const formacion = computed(() => FORMACIONES.find((f) => f.id === detalle.value))
const siglas = computed(() => Object.fromEntries(FORMACIONES.map((f) => [f.id, f])))

onMounted(iniciar)
</script>

<template>
  <div class="grid h-full grid-cols-1 lg:grid-cols-[1fr_320px]">
    <!-- Lienzo 3D -->
    <div class="relative min-h-[380px] bg-gradient-to-b from-[#0e2438] to-[#061422]">
      <div ref="contenedor" class="absolute inset-0" />

      <!-- Etiquetas de unidad proyectadas desde la escena -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          v-for="e in etiquetas"
          :key="e.id"
          class="absolute -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] transition-opacity"
          :class="resaltada && resaltada !== e.id ? 'opacity-30' : 'opacity-100'"
          :style="{
            left: `${e.x + 10}px`,
            top: `${e.yPos}px`,
            color: siglas[e.id].color,
            backgroundColor: 'rgba(6,20,34,0.72)',
          }"
        >
          {{ siglas[e.id].sigla }}
        </span>
      </div>

      <div
        class="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-borde/60 bg-abismo/85 px-3 py-2 text-[11px] text-slate-300"
      >
        <p>Arrastra para orbitar · rueda para acercar</p>
        <p class="mt-1.5 flex items-center gap-1.5 text-slate-300">
          <span class="inline-block h-2 w-3 rounded-sm bg-[#38bdf8]" aria-hidden="true" />
          Nivel piezométrico actual · {{ NIVEL_ACTUAL }} m
        </p>
        <p class="mt-0.5 flex items-center gap-1.5 text-slate-300">
          <span class="inline-block h-2 w-3 rounded-sm bg-[#f97362]" aria-hidden="true" />
          Proyectado 2035 · ≈ {{ NIVEL_PROYECTADO }} m
        </p>
      </div>

      <div class="absolute right-3 top-3 flex flex-col gap-1.5">
        <button
          type="button"
          class="rounded-lg border border-borde/70 bg-profundo/85 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          @click="encuadrar"
        >
          Reencuadrar
        </button>
      </div>
    </div>

    <!-- Panel de la unidad seleccionada -->
    <div class="scroll-fino overflow-y-auto border-t border-borde/70 p-4 lg:border-l lg:border-t-0">
      <ControlRango
        v-model="estado.separacion.value"
        etiqueta="Separar unidades"
        :min="0"
        :max="1"
        :paso="0.05"
        :decimales="2"
      />

      <div class="mt-3 flex flex-wrap gap-1">
        <button
          v-for="f in FORMACIONES"
          :key="f.id"
          type="button"
          class="rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition"
          :class="
            detalle === f.id
              ? 'border-transparent text-abismo'
              : 'border-borde/70 text-slate-300 hover:bg-white/5'
          "
          :style="detalle === f.id ? { backgroundColor: f.color } : null"
          @click="detalle = f.id"
        >
          {{ f.sigla }}
        </button>
      </div>

      <article v-if="formacion" class="mt-4">
        <div class="flex items-center gap-2">
          <span
            class="h-5 w-5 shrink-0 rounded border border-black/40"
            :style="{ backgroundColor: formacion.color }"
          />
          <h3 class="text-sm font-semibold text-sky-50">{{ formacion.nombre }}</h3>
        </div>
        <p class="mt-1 text-xs text-slate-400">
          {{ formacion.sigla }} · {{ ROLES[formacion.rol].etiqueta }} ·
          {{ formacion.techo }}–{{ formacion.base }} m de profundidad
        </p>
        <p class="mt-3 text-xs leading-relaxed text-slate-300">
          <strong class="text-slate-200">Litología.</strong> {{ formacion.litologia }}
        </p>
        <p class="mt-2 text-xs leading-relaxed text-slate-300">{{ formacion.descripcion }}</p>
      </article>
    </div>
  </div>
</template>
