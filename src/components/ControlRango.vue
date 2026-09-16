<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  etiqueta: { type: String, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1 },
  paso: { type: Number, default: 0.1 },
  sufijo: { type: String, default: '' },
  decimales: { type: Number, default: 1 },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="px-2 py-1.5">
    <div class="mb-1.5 flex items-baseline justify-between gap-2">
      <span class="text-sm text-slate-100">{{ etiqueta }}</span>
      <span class="font-mono text-xs text-agua">
        {{ modelValue.toFixed(decimales) }}{{ sufijo }}
      </span>
    </div>
    <input
      type="range"
      class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-borde accent-agua"
      :min="min"
      :max="max"
      :step="paso"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
  </div>
</template>
