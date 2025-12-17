<template>
  <label v-bind="labelAttrs">
    <slot />
  </label>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiLabel' })

const attrs = useAttrs()

const labelAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm font-medium text-gray-700 flex items-center gap-2', attrs.class)
}))
</script>
