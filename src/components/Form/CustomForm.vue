<!-- src/components/Form/CustomForm.vue -->
<template>
  <div class="grid gap-5 rounded-md bg-[#f5f7fb] p-4" :class="`grid-cols-${col}`">
    <slot />
  </div>
</template>

<script setup>
import { provide } from 'vue';

const props = defineProps({
  col: {
    type: [Number, String],
    default: 4,
  },
  labelWidth: {
    type: [Number, String],
    default: null,
  },
});

provide('customFormLabelWidth', () => props.labelWidth);
</script>
