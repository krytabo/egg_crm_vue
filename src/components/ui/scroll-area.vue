<template>
  <div v-bind="areaAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiScrollArea' })

const attrs = useAttrs()

const areaAttrs = computed(() => ({
  ...attrs,
  class: cn('relative overflow-auto', attrs.class)
}))
</script>
