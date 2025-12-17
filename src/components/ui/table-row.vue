<template>
  <tr v-bind="sectionAttrs">
    <slot />
  </tr>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableRow' })

const attrs = useAttrs()
const baseClass = 'border-b transition-colors hover:bg-gray-50'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
