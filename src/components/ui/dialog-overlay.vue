<template>
  <div v-bind="overlayAttrs"></div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiDialogOverlay' })

const attrs = useAttrs()

const overlayAttrs = computed(() => ({
  ...attrs,
  class: cn('fixed inset-0 z-40 bg-black/50', attrs.class)
}))
</script>
