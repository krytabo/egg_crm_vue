<template>
  <TinyInput
    v-bind="textareaAttrs"
    type="textarea"
    :rows="props.rows"
    :model-value="props.modelValue"
    resize="vertical"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Input as TinyInput } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiTextarea' })

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  rows: {
    type: [String, Number],
    default: 4
  }
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const textareaAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full', attrs.class)
}))

const handleUpdate = (value) => emit('update:modelValue', value)
</script>
