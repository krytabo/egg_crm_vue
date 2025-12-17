<template>
  <component v-if="controlVNode" :is="controlVNode" />
</template>

<script setup>
import { cloneVNode, computed, useSlots } from 'vue'
import { useFormField } from './form-context'

defineOptions({ name: 'UiFormControl' })

const slots = useSlots()
const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

const controlVNode = computed(() => {
  const child = slots.default?.()[0]
  if (!child) return null
  return cloneVNode(child, {
    id: formItemId,
    'aria-describedby': error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    'aria-invalid': !!error
  })
})
</script>
