<template>
  <div v-bind="otpAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs, watch } from 'vue'
import { cn } from './utils'
import { InputOTPSymbol } from './input-otp-context'

defineOptions({ name: 'UiInputOTP' })

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  length: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue', 'complete', 'change'])
const attrs = useAttrs()

const values = ref(Array.from({ length: props.length }, (_, index) => props.modelValue?.[index] || ''))
const activeIndex = ref(0)
const inputs = new Map()

watch(
  () => props.modelValue,
  (value) => {
    if (typeof value === 'string' && value !== values.value.join('')) {
      values.value = Array.from({ length: props.length }, (_, index) => value[index] || '')
    }
  }
)

const focusInput = (index) => {
  const target = inputs.get(index)
  target?.focus()
  activeIndex.value = index
}

const updateValue = () => {
  const next = values.value.join('').slice(0, props.length)
  emit('update:modelValue', next)
  emit('change', next)
  if (next.length === props.length) {
    emit('complete', next)
  }
}

const setChar = (index, char) => {
  values.value[index] = char
  updateValue()
  if (char && index < props.length - 1) {
    focusInput(index + 1)
  }
}

const clearChar = (index) => {
  values.value[index] = ''
  updateValue()
  if (index > 0) {
    focusInput(index - 1)
  }
}

provide(InputOTPSymbol, {
  values,
  activeIndex,
  length: props.length,
  register: (index, el) => {
    if (el) inputs.set(index, el)
  },
  unregister: (index) => inputs.delete(index),
  setChar,
  clearChar,
  focusInput
})

const otpAttrs = computed(() => ({
  ...attrs,
  class: cn('flex items-center gap-2', attrs.class)
}))
</script>
