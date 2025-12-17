<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarInset' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('flex-1 p-6', attrs.class)
}))
</script>
