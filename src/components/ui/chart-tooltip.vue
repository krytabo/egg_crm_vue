<template>
  <div v-bind="tooltipAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiChartTooltip' })

const attrs = useAttrs()

const tooltipAttrs = computed(() => ({
  ...attrs,
  class: cn('max-w-xs rounded-lg border bg-white p-3 text-xs shadow-lg', attrs.class)
}))
</script>
