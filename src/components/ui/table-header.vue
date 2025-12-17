<template>
  <thead v-bind="sectionAttrs">
    <slot />
  </thead>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTableHeader' })

const attrs = useAttrs()
const baseClass = '[&_tr]:border-b'

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}))
</script>
