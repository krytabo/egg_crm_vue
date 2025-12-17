<template>
  <span v-bind="ellipsisAttrs" aria-hidden="true">…</span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbEllipsis' })

const attrs = useAttrs()

const ellipsisAttrs = computed(() => ({
  ...attrs,
  class: cn('text-gray-400', attrs.class)
}))
</script>
