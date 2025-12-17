<template>
  <div v-bind="legendContentAttrs">
    <template v-if="props.items.length === 0">
      <slot />
    </template>
    <template v-else>
      <span
        v-for="item in props.items"
        :key="item.key || item.name"
        class="inline-flex items-center gap-2 text-gray-600"
      >
        <span
          class="h-2 w-2 rounded-sm"
          :style="{ backgroundColor: item.color || chartConfig[item.key || item.name]?.color || 'var(--color-primary, #2563eb)' }"
        />
        {{ chartConfig[item.key || item.name]?.label || item.label || item.key || item.name }}
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, useAttrs } from 'vue'
import { cn } from './utils'
import { ChartSymbol } from './chart-context'

defineOptions({ name: 'UiChartLegendContent' })

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const attrs = useAttrs()
const chart = inject(ChartSymbol, null)

const chartConfig = computed(() => chart?.config || {})

const legendContentAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-wrap items-center justify-center gap-4', attrs.class)
}))
</script>
