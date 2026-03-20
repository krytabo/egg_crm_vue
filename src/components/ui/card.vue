<template>
  <div v-bind="cardAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import { cn } from './utils';
defineOptions({ name: 'UiCard' });

const attrs = useAttrs();
const cardAttrs = computed(() => ({
  ...attrs,
  class: cn('p-4 overflow-hidden h-full gap-2 flex flex-col', attrs.class),
}));
</script>
