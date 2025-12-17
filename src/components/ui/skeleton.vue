<template>
  <div v-bind="skeletonAttrs"></div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSkeleton' })

const attrs = useAttrs()

const skeletonAttrs = computed(() => ({
  ...attrs,
  class: cn('animate-pulse rounded-md bg-gray-200', attrs.class)
}))
</script>
