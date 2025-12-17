<template>
  <div v-bind="calendarAttrs">
    <TinyDatePicker
      v-bind="pickerAttrs"
      :type="props.type"
      :model-value="props.modelValue"
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { DatePicker as TinyDatePicker } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiCalendar' })

const props = defineProps({
  modelValue: {
    type: [Date, String, Array],
    default: undefined
  },
  type: {
    type: String,
    default: 'date'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const calendarAttrs = computed(() => ({
  class: cn('p-3', attrs.class)
}))

const pickerAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
