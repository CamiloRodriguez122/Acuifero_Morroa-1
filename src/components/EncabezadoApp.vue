<script setup>
defineProps({
  vista: { type: String, required: true },
})
defineEmits(['cambiar-vista'])

const VISTAS = [
  { id: 'mapa', nombre: 'Mapa 3D' },
  { id: 'corte', nombre: 'Corte geológico' },
  { id: 'proyecto', nombre: 'El proyecto' },
]
</script>

<template>
  <header class="z-20 border-b border-borde/70 bg-profundo/90 backdrop-blur">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
      <div class="flex min-w-0 items-center gap-2.5">
        <svg viewBox="0 0 64 64" class="h-7 w-7 shrink-0" aria-hidden="true">
          <rect width="64" height="64" rx="12" fill="#0e2a44" />
          <path d="M8 22h48v8H8z" fill="#7dd3fc" opacity=".55" />
          <path d="M8 34h48v8H8z" fill="#38bdf8" opacity=".75" />
          <path d="M8 46h48v8H8z" fill="#0ea5e9" opacity=".9" />
          <path d="M32 6c5 7 9 11 9 15a9 9 0 0 1-18 0c0-4 4-8 9-15z" fill="#e0f2fe" />
        </svg>
        <div class="min-w-0">
          <h1 class="truncate text-sm font-semibold leading-tight text-sky-50">
            Acuífero Morroa
          </h1>
          <p class="truncate text-[11px] leading-tight text-slate-400">
            Visor hidrogeológico interactivo · Sucre, Colombia
          </p>
        </div>
      </div>

      <nav class="flex gap-1" aria-label="Secciones">
        <button
          v-for="v in VISTAS"
          :key="v.id"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
          :class="
            vista === v.id
              ? 'bg-agua/15 text-sky-100 ring-1 ring-agua/40'
              : 'text-slate-300 hover:bg-white/5'
          "
          :aria-current="vista === v.id ? 'page' : undefined"
          @click="$emit('cambiar-vista', v.id)"
        >
          {{ v.nombre }}
        </button>
      </nav>

      <span
        class="ml-auto hidden rounded-full border border-borde/70 px-2.5 py-1 text-[11px] text-slate-400 sm:inline"
      >
        Fase 1 · prototipo de visualización
      </span>
    </div>
  </header>
</template>
