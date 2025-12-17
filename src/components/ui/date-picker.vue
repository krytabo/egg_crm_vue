<template>
  <TinyDatePicker
    v-bind="pickerAttrs"
    :type="props.type"
    :model-value="props.modelValue"
    :placeholder="props.placeholder"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { DatePicker as TinyDatePicker } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiDatePicker' })

const props = defineProps({
  modelValue: {
    type: [String, Date, Array],
    default: undefined
  },
  type: {
    type: String,
    default: 'date'
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const pickerAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full', attrs.class)
}))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
