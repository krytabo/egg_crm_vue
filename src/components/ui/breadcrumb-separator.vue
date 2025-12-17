<template>
  <span v-bind="separatorAttrs" aria-hidden="true">
    <slot>›</slot>
  </span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbSeparator' })

const attrs = useAttrs()

const separatorAttrs = computed(() => ({
  ...attrs,
  class: cn('text-gray-400', attrs.class)
}))
</script>
