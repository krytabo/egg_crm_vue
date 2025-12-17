<template>
  <TinyCheckbox
    v-bind="checkboxAttrs"
    :model-value="props.modelValue"
    @update:model-value="handleUpdate"
  >
    <slot>{{ props.label }}</slot>
  </TinyCheckbox>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Checkbox as TinyCheckbox } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiCheckbox' })

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const checkboxAttrs = computed(() => ({
  ...attrs,
  class: cn('items-center gap-2 text-sm', attrs.class)
}))

const handleUpdate = (value) => emit('update:modelValue', value)
</script>
