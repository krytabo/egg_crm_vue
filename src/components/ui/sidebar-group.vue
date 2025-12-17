<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarGroup' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('space-y-2', attrs.class)
}))
</script>
