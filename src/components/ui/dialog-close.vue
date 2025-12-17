<template>
  <component v-if="closeVNode" :is="closeVNode" />
  <component v-else-if="props.as" :is="props.as" v-bind="buttonAttrs" @click="handleClick">
    <slot>關閉</slot>
  </component>
  <TinyButton v-else v-bind="buttonAttrs" @click="handleClick">
    <slot>關閉</slot>
  </TinyButton>
</template>

<script setup>
import { cloneVNode, computed, useAttrs, useSlots } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { cn } from './utils'
import { useDialogContext } from './dialog-context'

defineOptions({ name: 'UiDialogClose' })

const props = defineProps({
  as: {
    type: String,
    default: null
  }
})

const attrs = useAttrs()
const slots = useSlots()
const ctx = useDialogContext()

const handleClick = (event) => {
  attrs?.onClick?.(event)
  ctx.setOpen(false)
}

const closeVNode = computed(() => {
  const child = slots.default?.()[0]
  if (!child) return null
  return cloneVNode(child, { onClick: handleClick })
})

const buttonAttrs = computed(() => ({
  ...attrs,
  class: cn(attrs.class)
}))
</script>
