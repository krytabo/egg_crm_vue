<template>
  <input
    ref="inputRef"
    v-bind="slotAttrs"
    :value="char"
    maxlength="1"
    inputmode="numeric"
    autocomplete="one-time-code"
    @input="handleInput"
    @keydown="handleKeyDown"
    @focus="handleFocus"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { cn } from './utils'
import { useInputOTP } from './input-otp-context'

defineOptions({ name: 'UiInputOTPSlot' })

const props = defineProps({
  index: {
    type: Number,
    required: true
  }
})

const attrs = useAttrs()
const ctx = useInputOTP()
const inputRef = ref(null)

onMounted(() => ctx.register(props.index, inputRef.value))
onBeforeUnmount(() => ctx.unregister(props.index))

const char = computed(() => ctx.values.value[props.index] || '')
const isActive = computed(() => ctx.activeIndex.value === props.index)

const slotAttrs = computed(() => ({
  ...attrs,
  class: cn(
    'h-10 w-10 rounded-md border border-gray-200 text-center text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-200',
    isActive.value && 'border-blue-500 ring-2 ring-blue-200',
    attrs.class
  )
}))

const handleInput = (event) => {
  const value = event.target.value.replace(/\s+/g, '').slice(-1)
  ctx.setChar(props.index, value)
  event.target.value = value
}

const handleKeyDown = (event) => {
  if (event.key === 'Backspace') {
    event.preventDefault()
    if (char.value) {
      ctx.clearChar(props.index)
    } else {
      ctx.clearChar(Math.max(0, props.index - 1))
    }
  }
}

const handleFocus = () => ctx.focusInput(props.index)
</script>
