<template>
  <TinyInput
    v-bind="inputAttrs"
    :type="props.type"
    :model-value="props.modelValue"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Input as TinyInput } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiInput' })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  type: {
    type: String,
    default: 'text'
  }
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const inputAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full min-w-0', attrs.class),
  clearable: attrs.clearable ?? true
}))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
}
</script>
