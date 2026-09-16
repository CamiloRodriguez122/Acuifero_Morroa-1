<script setup>
import { computed } from 'vue'
import GraficoSerie from './GraficoSerie.vue'

const props = defineProps({
  pozo: { type: Object, default: null },
})
defineEmits(['cerrar', 'enfocar'])

const estado = computed(() => {
  const t = props.pozo?.tendencia_m_ano ?? 0
  if (t >= 0.9) return { texto: 'Descenso acelerado', color: 'text-red-300', fondo: 'bg-red-500/15' }
  if (t >= 0.6) return { texto: 'Descenso sostenido', color: 'text-amber-300', fondo: 'bg-amber-500/15' }
  return { texto: 'Descenso moderado', color: 'text-emerald-300', fondo: 'bg-emerald-500/15' }
})

const campos = computed(() => {
  const p = props.pozo
  if (!p) return []
  return [
    ['Municipio', p.municipio],
    ['Profundidad del pozo', `${p.profundidad_m} m`],
    ['Cota del terreno', `${p.cota_terreno_msnm} m s. n. m.`],
    ['Nivel estático actual', `${p.nivel_estatico_m.toFixed(2)} m`],
    ['Cota piezométrica', `${p.cota_piezometrica_msnm.toFixed(2)} m s. n. m.`],
    ['Periodo de registro', p.periodo],
    ['Registros disponibles', `${p.n_registros} mediciones`],
  ]
})

const resumen = computed(() => {
  const p = props.pozo
  if (!p) return []
  return [
    ['Mínimo', `${p.minimo_m.toFixed(1)} m`],
    ['Promedio', `${p.promedio_m.toFixed(1)} m`],
    ['Máximo', `${p.maximo_m.toFixed(1)} m`],
    ['Descenso total', `${p.descenso_acumulado_m.toFixed(1)} m`],
  ]
})
</script>

<template>
  <aside
    v-if="pozo"
    class="scroll-fino flex h-full flex-col overflow-y-auto border-l border-borde/70 bg-profundo/95 backdrop-blur"
  >
    <header class="sticky top-0 z-10 border-b border-borde/60 bg-profundo/95 px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-mono text-xs text-agua">{{ pozo.codigo }}</p>
          <h3 class="truncate text-base font-semibold text-sky-50">{{ pozo.nombre }}</h3>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-borde/70 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/5"
          aria-label="Cerrar ficha del pozo"
          @click="$emit('cerrar')"
        >
          Cerrar
        </button>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <span
          class="rounded-full px-2 py-0.5 text-[11px] font-medium"
          :class="[estado.fondo, estado.color]"
        >
          {{ estado.texto }} · {{ pozo.tendencia_m_ano.toFixed(2) }} m/año
        </span>
        <button
          type="button"
          class="rounded-full border border-borde/70 px-2 py-0.5 text-[11px] text-slate-300 transition hover:border-agua hover:text-sky-100"
          @click="$emit('enfocar', pozo)"
        >
          Centrar en el mapa
        </button>
      </div>
    </header>

    <div class="space-y-5 p-4">
      <section>
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Serie de nivel estático
        </h4>
        <GraficoSerie :serie="pozo.serie" />
        <dl class="mt-3 grid grid-cols-2 gap-2">
          <div
            v-for="[k, v] in resumen"
            :key="k"
            class="rounded-lg border border-borde/60 bg-abismo/60 px-2.5 py-2"
          >
            <dt class="text-[11px] text-slate-400">{{ k }}</dt>
            <dd class="font-mono text-sm text-sky-100">{{ v }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ficha técnica
        </h4>
        <dl class="divide-y divide-borde/40">
          <div v-for="[k, v] in campos" :key="k" class="flex justify-between gap-3 py-1.5">
            <dt class="text-xs text-slate-400">{{ k }}</dt>
            <dd class="text-right text-xs text-slate-100">{{ v }}</dd>
          </div>
        </dl>
      </section>

      <p class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200/90">
        Serie de demostración generada para validar la visualización. Se sustituye por el histórico
        oficial de CARSUCRE al conectar Supabase.
      </p>
    </div>
  </aside>
</template>
