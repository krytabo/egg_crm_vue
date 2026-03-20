<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import { cn } from './utils';

defineOptions({ name: 'UiCardHeader' });

const attrs = useAttrs();
const baseClass = 'border-b pb-2 flex gap-2 items-center justify-center mb-2.5';

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class),
}));
</script>
