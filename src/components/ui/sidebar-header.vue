<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarHeader' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('mb-4 text-sm font-semibold uppercase text-gray-500', attrs.class)
}))
</script>
