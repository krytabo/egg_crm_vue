<template>
  <th v-bind="sectionAttrs">
    <slot />
  </th>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableHead' })

const attrs = useAttrs()
const baseClass = 'h-10 px-2 text-left font-medium text-gray-600'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
