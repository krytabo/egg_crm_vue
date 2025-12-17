<template>
  <div v-bind="footerAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiDialogFooter' })

const attrs = useAttrs()

const footerAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', attrs.class)
}))
</script>
