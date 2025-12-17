<template>
  <li v-bind="itemAttrs">
    <slot />
  </li>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbItem' })

const attrs = useAttrs()

const itemAttrs = computed(() => ({
  ...attrs,
  class: cn('inline-flex items-center gap-1', attrs.class)
}))
</script>
