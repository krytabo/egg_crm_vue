<template>
  <div v-bind="headerAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiDialogHeader' })

const attrs = useAttrs()

const headerAttrs = computed(() => ({
  ...attrs,
  class: cn('space-y-1.5', attrs.class)
}))
</script>
