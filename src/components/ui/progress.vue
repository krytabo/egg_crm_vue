<template>
  <TinyProgress v-bind="progressAttrs" :percentage="clampedValue" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Progress as TinyProgress } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiProgress' })

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})

const attrs = useAttrs()

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))

const progressAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full', attrs.class),
  'stroke-width': attrs['stroke-width'] ?? 6
}))
</script>
