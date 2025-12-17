<template>
  <p v-bind="sectionAttrs">
    <slot />
  </p>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiCardDescription' })

const attrs = useAttrs()
const baseClass = 'text-sm text-gray-500'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
