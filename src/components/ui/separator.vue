<template>
  <div v-bind="separatorAttrs" role="separator" :aria-orientation="props.orientation"></div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSeparator' })

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal'
  }
})

const attrs = useAttrs()

const separatorAttrs = computed(() => {
  const isVertical = props.orientation === 'vertical'
  return {
    ...attrs,
    class: cn('bg-gray-200', isVertical ? 'w-px h-full' : 'h-px w-full', attrs.class)
  }
})
</script>
