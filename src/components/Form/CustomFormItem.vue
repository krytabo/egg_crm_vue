<!-- src/components/Form/CustomFormItem.vue -->
<template>
  <div class="flex items-center gap-2">
    <p v-if="label" class="shrink-0 whitespace-nowrap" :style="labelStyle">{{ label }}</p>
    <slot />
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
});

const getLabelWidth = inject('customFormLabelWidth', () => null);

const labelStyle = computed(() => {
  const width = getLabelWidth?.();
  if (!width) return {};
  return { width: typeof width === 'number' ? `${width}px` : width };
});
</script>
