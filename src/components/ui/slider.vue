<template>
  <TinySlider
    v-bind="sliderAttrs"
    :model-value="props.modelValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Slider as TinySlider } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiSlider' })

const props = defineProps({
  modelValue: {
    type: [Number, Array],
    default: undefined
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const sliderAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full max-w-full', attrs.class)
}))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
