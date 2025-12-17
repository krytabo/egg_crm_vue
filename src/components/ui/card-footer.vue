<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiCardFooter' })

const attrs = useAttrs()
const baseClass = 'px-6 pb-6 flex items-center justify-between gap-3'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
