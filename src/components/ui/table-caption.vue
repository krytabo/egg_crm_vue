<template>
  <caption v-bind="sectionAttrs">
    <slot />
  </caption>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableCaption' })

const attrs = useAttrs()
const baseClass = 'mt-4 text-sm text-gray-500'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
