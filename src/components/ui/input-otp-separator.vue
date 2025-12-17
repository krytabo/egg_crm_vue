<template>
  <span v-bind="separatorAttrs">-</span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiInputOTPSeparator' })

const attrs = useAttrs()

const separatorAttrs = computed(() => ({
  ...attrs,
  class: cn('px-1 text-gray-400', attrs.class)
}))
</script>
