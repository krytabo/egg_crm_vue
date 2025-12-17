<template>
  <nav v-bind="sectionAttrs">
    <slot />
  </nav>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarMenu' })

const attrs = useAttrs()
const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-col gap-1', attrs.class)
}))
</script>
