<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarMenuItem' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-col gap-1', attrs.class)
}))
</script>
