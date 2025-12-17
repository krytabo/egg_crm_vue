<template>
  <p v-bind="descriptionAttrs">
    <slot />
  </p>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiDialogDescription' })

const attrs = useAttrs()

const descriptionAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm text-gray-600', attrs.class)
}))
</script>
