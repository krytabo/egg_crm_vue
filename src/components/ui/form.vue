<template>
  <form v-bind="formAttrs">
    <slot />
  </form>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiForm' })

const attrs = useAttrs()

const formAttrs = computed(() => ({
  ...attrs,
  class: cn('space-y-4', attrs.class)
}))
</script>
