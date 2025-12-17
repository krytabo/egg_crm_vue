<template>
  <div v-bind="itemAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, useAttrs } from 'vue'
import { cn } from './utils'
import { FormItemSymbol } from './form-context'

defineOptions({ name: 'UiFormItem' })

const attrs = useAttrs()
const id = `form-item-${Math.random().toString(36).slice(2)}`

provide(FormItemSymbol, { id })

const itemAttrs = computed(() => ({
  ...attrs,
  class: cn('grid gap-2', attrs.class)
}))
</script>
