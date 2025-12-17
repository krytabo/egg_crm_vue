<template>
  <tfoot v-bind="sectionAttrs">
    <slot />
  </tfoot>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableFooter' })

const attrs = useAttrs()
const baseClass = 'bg-gray-50 border-t font-medium [&>tr]:last:border-b-0'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
