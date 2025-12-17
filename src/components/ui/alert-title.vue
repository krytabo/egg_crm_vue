<template>
  <p v-bind="titleAttrs">
    <slot />
  </p>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiAlertTitle' })

const attrs = useAttrs()

const titleAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm font-semibold', attrs.class)
}))
</script>
