<template>
  <p v-bind="sectionAttrs">
    <slot />
  </p>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarGroupLabel' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('text-xs font-medium text-gray-500 uppercase tracking-wide', attrs.class)
}))
</script>
