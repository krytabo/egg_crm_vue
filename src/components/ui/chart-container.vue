<template>
  <div v-bind="containerAttrs" :data-chart="chartId">
    <ChartStyle :id="chartId" :config="props.config" />
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs } from 'vue'
import { cn } from './utils'
import ChartStyle from './chart-style.vue'
import { ChartSymbol } from './chart-context'

defineOptions({ name: 'UiChartContainer' })

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

const attrs = useAttrs()
const generatedId = ref(`chart-${Math.random().toString(36).slice(2)}`)
const chartId = computed(() => props.id || generatedId.value)

provide(ChartSymbol, {
  id: chartId,
  config: props.config
})

const containerAttrs = computed(() => ({
  ...attrs,
  class: cn('relative flex aspect-video w-full justify-center', attrs.class)
}))
</script>
