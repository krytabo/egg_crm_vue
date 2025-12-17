<template>
  <td v-bind="sectionAttrs">
    <slot />
  </td>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableCell' })

const attrs = useAttrs()
const baseClass = 'p-2 align-middle text-sm'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
