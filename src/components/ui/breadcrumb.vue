<template>
  <nav v-bind="breadcrumbAttrs" aria-label="breadcrumb">
    <slot />
  </nav>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumb' })

const attrs = useAttrs()

const breadcrumbAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm', attrs.class)
}))
</script>
