<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  pozos: { type: Array, default: () => [] },
  seleccionado: { type: String, default: null },
})
defineEmits(['seleccionar'])

const busqueda = ref('')
const municipio = ref('todos')

const municipios = computed(() => [
  'todos',
  ...[...new Set(props.pozos.map((p) => p.municipio))].sort((a, b) => a.localeCompare(b, 'es')),
])

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return props.pozos.filter((p) => {
    const coincideMunicipio = municipio.value === 'todos' || p.municipio === municipio.value
    const coincideTexto =
      !q || p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    return coincideMunicipio && coincideTexto
  })
})

function colorTendencia(t) {
  if (t >= 0.9) return '#f87171'
  if (t >= 0.6) return '#fbbf24'
  return '#4ade80'
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="space-y-2 border-b border-borde/60 p-3">
      <label class="block">
        <span class="sr-only">Buscar pozo por nombre o código</span>
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar pozo por nombre o código…"
          class="w-full rounded-lg border border-borde/70 bg-abismo px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-agua focus:outline-none"
        />
      </label>
      <label class="block">
        <span class="sr-only">Filtrar por municipio</span>
        <select
          v-model="municipio"
          class="w-full rounded-lg border border-borde/70 bg-abismo px-3 py-1.5 text-sm text-slate-100 focus:border-agua focus:outline-none"
        >
          <option v-for="m in municipios" :key="m" :value="m">
            {{ m === 'todos' ? 'Todos los municipios' : m }}
          </option>
        </select>
      </label>
      <p class="text-[11px] text-slate-400">
        {{ filtrados.length }} de {{ pozos.length }} pozos de monitoreo
      </p>
    </div>

    <ul class="scroll-fino flex-1 overflow-y-auto p-2">
      <li v-for="p in filtrados" :key="p.codigo">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition"
          :class="
            seleccionado === p.codigo
              ? 'bg-agua/15 ring-1 ring-agua/40'
              : 'hover:bg-white/5'
          "
          @click="$emit('seleccionar', p)"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ backgroundColor: colorTendencia(p.tendencia_m_ano) }"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm text-slate-100">{{ p.nombre }}</span>
            <span class="block font-mono text-[11px] text-slate-400">
              {{ p.codigo }} · {{ p.municipio }}
            </span>
          </span>
          <span class="shrink-0 text-right">
            <span class="block font-mono text-sm text-sky-100">
              {{ p.nivel_estatico_m.toFixed(1) }}
            </span>
            <span class="block text-[10px] text-slate-500">m</span>
          </span>
        </button>
      </li>
      <li v-if="!filtrados.length" class="px-3 py-6 text-center text-sm text-slate-400">
        No hay pozos que coincidan con la búsqueda.
      </li>
    </ul>
  </div>
</template>
