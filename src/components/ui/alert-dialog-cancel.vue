<template>
  <DialogClose>
    <TinyButton v-bind="buttonAttrs">
      <slot>取消</slot>
    </TinyButton>
  </DialogClose>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { cn } from './utils'
import { DialogClose } from './dialog'

defineOptions({ name: 'UiAlertDialogCancel' })

const attrs = useAttrs()

const buttonAttrs = computed(() => ({
  ...attrs,
  class: cn('min-w-[96px]', attrs.class)
}))
</script>
