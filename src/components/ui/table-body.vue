<template>
  <tbody v-bind="sectionAttrs">
    <slot />
  </tbody>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableBody' })

const attrs = useAttrs()
const baseClass = '[&_tr:last-child]:border-0'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
