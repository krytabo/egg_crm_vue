<template>
  <Dialog
    :model-value="props.modelValue"
    :visible="props.visible"
    @update:model-value="handleUpdate"
    @update:visible="handleUpdate"
    @open-change="handleUpdate"
  >
    <DialogContent v-bind="contentAttrs" :title="props.title" :width="props.width">
      <slot />
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Dialog, DialogContent } from './dialog'

defineOptions({ name: 'UiDialogBox' })

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined
  },
  visible: {
    type: Boolean,
    default: undefined
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '600px'
  }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'open-change'])
const attrs = useAttrs()

const contentAttrs = computed(() => ({
  ...attrs
}))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('update:visible', value)
  emit('open-change', value)
}
</script>
