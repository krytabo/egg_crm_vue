<template>
  <div v-bind="contentAttrs">
    <p v-if="props.label" class="font-medium">{{ props.label }}</p>
    <ul class="space-y-1">
      <li
        v-for="item in props.items"
        :key="item.name || item.label"
        class="flex items-center justify-between text-gray-600"
      >
        <span>{{ item.label || item.name }}</span>
        <span class="font-medium text-gray-900">{{ item.value }}</span>
      </li>
    </ul>
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiChartTooltipContent' })

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  }
})

const attrs = useAttrs()

const contentAttrs = computed(() => ({
  ...attrs,
  class: cn('grid gap-1.5', attrs.class)
}))
</script>
