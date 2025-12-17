<template>
  <TinySelect
    v-bind="selectAttrs"
    :model-value="props.modelValue"
    :options="props.options"
    :placeholder="props.placeholder"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Select as TinySelect } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiSelect' })

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array],
    default: undefined
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const selectAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full', attrs.class),
  filterable: attrs.filterable ?? true,
  clearable: attrs.clearable ?? true
}))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
