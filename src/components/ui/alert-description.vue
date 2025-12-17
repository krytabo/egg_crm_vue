<template>
  <div v-bind="descriptionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiAlertDescription' })

const attrs = useAttrs()

const descriptionAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm text-gray-600 [&>p]:leading-relaxed', attrs.class)
}))
</script>
