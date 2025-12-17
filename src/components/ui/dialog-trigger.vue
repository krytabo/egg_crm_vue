<template>
  <component v-if="triggerVNode" :is="triggerVNode" />
</template>

<script setup>
import { cloneVNode, computed, useSlots } from 'vue'
import { useDialogContext } from './dialog-context'

defineOptions({ name: 'UiDialogTrigger' })

const slots = useSlots()
const ctx = useDialogContext()

const triggerVNode = computed(() => {
  const child = slots.default?.()[0]
  if (!child) return null
  const onClick = (...args) => {
    child.props?.onClick?.(...args)
    ctx.setOpen(true)
  }
  return cloneVNode(child, { onClick })
})
</script>
