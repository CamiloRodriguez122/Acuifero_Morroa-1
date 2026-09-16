<script setup>
defineProps({
  titulo: { type: String, default: '' },
  subtitulo: { type: String, default: '' },
})
</script>

<template>
  <section
    class="rounded-xl border border-borde/70 bg-profundo/70 backdrop-blur-sm shadow-lg shadow-black/30"
  >
    <header v-if="titulo" class="border-b border-borde/60 px-4 py-3">
      <h3 class="text-sm font-semibold tracking-wide text-sky-100">{{ titulo }}</h3>
      <p v-if="subtitulo" class="mt-0.5 text-xs text-slate-400">{{ subtitulo }}</p>
    </header>
    <div class="p-4">
      <slot />
    </div>
  </section>
</template>
