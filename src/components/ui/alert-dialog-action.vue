<template>
  <TinyButton v-bind="actionAttrs" type="primary">
    <slot>確認</slot>
  </TinyButton>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiAlertDialogAction' })

const attrs = useAttrs()

const actionAttrs = computed(() => ({
  ...attrs,
  class: cn('min-w-[96px]', attrs.class)
}))
</script>
