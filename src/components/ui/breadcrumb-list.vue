<template>
  <ol v-bind="listAttrs">
    <slot />
  </ol>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbList' })

const attrs = useAttrs()

const listAttrs = computed(() => ({
  ...attrs,
  class: cn('flex flex-wrap items-center gap-2 text-gray-500', attrs.class)
}))
</script>
