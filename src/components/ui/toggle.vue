<template>
  <button v-bind="buttonAttrs" @click="toggle">
    <slot />
  </button>
</template>

<script setup>
import { computed, ref, useAttrs, watch } from 'vue'
import { cn } from './utils'
import { toggleVariants } from './toggle-utils'

defineOptions({ name: 'UiToggle' })

const props = defineProps({
  pressed: {
    type: Boolean,
    default: undefined
  },
  defaultPressed: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:pressed', 'change'])
const attrs = useAttrs()

const state = ref(typeof props.pressed === 'boolean' ? props.pressed : props.defaultPressed)

watch(
  () => props.pressed,
  (value) => {
    if (typeof value === 'boolean') {
      state.value = value
    }
  }
)

const toggle = () => {
  if (props.disabled) return
  const next = !state.value
  state.value = next
  emit('update:pressed', next)
  emit('change', next)
}

const buttonAttrs = computed(() => ({
  ...attrs,
  type: 'button',
  'data-state': state.value ? 'on' : 'off',
  'aria-pressed': state.value,
  disabled: props.disabled,
  class: cn(toggleVariants({ variant: props.variant, size: props.size }), attrs.class)
}))
</script>
