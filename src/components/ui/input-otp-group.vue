<template>
  <div v-bind="groupAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiInputOTPGroup' })

const attrs = useAttrs()

const groupAttrs = computed(() => ({
  ...attrs,
  class: cn('flex items-center gap-1', attrs.class)
}))
</script>
