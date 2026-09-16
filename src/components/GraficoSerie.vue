<script setup>
import { computed } from 'vue'

const props = defineProps({
  serie: { type: Array, required: true },
  alto: { type: Number, default: 120 },
})

const ANCHO = 320
const MARGEN = { arriba: 8, derecha: 6, abajo: 18, izquierda: 34 }

/**
 * La serie llega como [['AAAA-MM', nivel], ...]. El eje Y se invierte porque un
 * nivel estático mayor significa agua más profunda, es decir, peor condición.
 */
const grafico = computed(() => {
  const s = props.serie
  if (!s?.length) return null

  const niveles = s.map((p) => p[1])
  const min = Math.min(...niveles)
  const max = Math.max(...niveles)
  const rango = max - min || 1
  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha
  const altoUtil = props.alto - MARGEN.arriba - MARGEN.abajo

  const x = (i) => MARGEN.izquierda + (i / (s.length - 1)) * anchoUtil
  const y = (v) => MARGEN.arriba + ((v - min) / rango) * altoUtil

  const linea = s.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`)
  const area = `${linea.join(' ')} L${x(s.length - 1).toFixed(1)},${props.alto - MARGEN.abajo} L${MARGEN.izquierda},${props.alto - MARGEN.abajo} Z`

  // Tendencia por mínimos cuadrados, expresada luego en m/año.
  const n = s.length
  const sx = (n - 1) / 2
  const sy = niveles.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  niveles.forEach((v, i) => {
    num += (i - sx) * (v - sy)
    den += (i - sx) ** 2
  })
  const m = den ? num / den : 0
  const tendencia = `M${x(0).toFixed(1)},${y(sy - m * sx).toFixed(1)} L${x(n - 1).toFixed(1)},${y(sy + m * sx).toFixed(1)}`

  const anios = s.filter((p, i) => p[0].endsWith('-01') && i % 36 === 0)
  return {
    linea: linea.join(' '),
    area,
    tendencia,
    min,
    max,
    etiquetasX: anios.map((p) => ({ texto: p[0].slice(0, 4), x: x(s.indexOf(p)) })),
  }
})
</script>

<template>
  <figure v-if="grafico" class="m-0">
    <svg
      :viewBox="`0 0 ${ANCHO} ${alto}`"
      class="w-full"
      role="img"
      aria-label="Serie temporal del nivel estático"
    >
      <defs>
        <linearGradient id="degradadoSerie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38" />
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <line
        :x1="MARGEN.izquierda"
        :y1="MARGEN.arriba"
        :x2="MARGEN.izquierda"
        :y2="alto - MARGEN.abajo"
        stroke="#1e3d58"
      />
      <line
        :x1="MARGEN.izquierda"
        :y1="alto - MARGEN.abajo"
        :x2="ANCHO - MARGEN.derecha"
        :y2="alto - MARGEN.abajo"
        stroke="#1e3d58"
      />

      <path :d="grafico.area" fill="url(#degradadoSerie)" />
      <path :d="grafico.linea" fill="none" stroke="#7dd3fc" stroke-width="1.4" />
      <path
        :d="grafico.tendencia"
        fill="none"
        stroke="#f97362"
        stroke-width="1.4"
        stroke-dasharray="5 3"
      />

      <text :x="MARGEN.izquierda - 4" :y="MARGEN.arriba + 4" text-anchor="end" class="eje">
        {{ grafico.min.toFixed(0) }}
      </text>
      <text :x="MARGEN.izquierda - 4" :y="alto - MARGEN.abajo" text-anchor="end" class="eje">
        {{ grafico.max.toFixed(0) }}
      </text>
      <text
        v-for="e in grafico.etiquetasX"
        :key="e.texto"
        :x="e.x"
        :y="alto - 5"
        text-anchor="middle"
        class="eje"
      >
        {{ e.texto }}
      </text>
    </svg>
    <figcaption class="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
      <span class="flex items-center gap-1">
        <span class="inline-block h-0.5 w-4 bg-sky-300" /> nivel estático (m)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block h-0.5 w-4 bg-[#f97362]" /> tendencia
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.eje {
  fill: #64748b;
  font-size: 9px;
  font-family: ui-monospace, monospace;
}
</style>
