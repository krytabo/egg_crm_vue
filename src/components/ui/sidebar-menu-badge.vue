<template>
  <span v-bind="sectionAttrs">
    <slot />
  </span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarMenuBadge' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600', attrs.class)
}))
</script>
