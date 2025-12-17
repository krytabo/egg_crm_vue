<template>
  <div v-bind="legendAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiChartLegend' })

const attrs = useAttrs()

const legendAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-wrap justify-center gap-3 text-xs text-gray-500', attrs.class)
}))
</script>
