<template>
  <span v-bind="pageAttrs" aria-current="page">
    <slot />
  </span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbPage' })

const attrs = useAttrs()

const pageAttrs = computed(() => ({
  ...attrs,
  class: cn('text-gray-900 font-medium', attrs.class)
}))
</script>
