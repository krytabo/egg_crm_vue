<template>
  <h2 v-bind="titleAttrs">
    <slot />
  </h2>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiDialogTitle' })

const attrs = useAttrs()

const titleAttrs = computed(() => ({
  ...attrs,
  class: cn('text-lg font-semibold text-gray-900', attrs.class)
}))
</script>
