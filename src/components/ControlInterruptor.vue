<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  etiqueta: { type: String, required: true },
  descripcion: { type: String, default: '' },
  color: { type: String, default: '#38bdf8' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label
    class="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
  >
    <input
      type="checkbox"
      class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-borde bg-abismo checked:border-transparent"
      :style="modelValue ? { backgroundColor: color } : null"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="min-w-0">
      <span class="block text-sm text-slate-100">{{ etiqueta }}</span>
      <span v-if="descripcion" class="block text-xs leading-snug text-slate-400">
        {{ descripcion }}
      </span>
    </span>
  </label>
</template>
