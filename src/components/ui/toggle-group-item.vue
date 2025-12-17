<template>
  <button v-bind="itemAttrs" @click="handleClick">
    <slot />
  </button>
</template>

<script setup>
import { computed, inject, useAttrs } from 'vue'
import { cn } from './utils'
import { toggleVariants } from './toggle-utils'
import { ToggleGroupSymbol } from './toggle-group-symbol'

defineOptions({ name: 'UiToggleGroupItem' })

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: undefined
  },
  size: {
    type: String,
    default: undefined
  }
})

const attrs = useAttrs()
const ctx = inject(ToggleGroupSymbol)

if (!ctx) {
  throw new Error('ToggleGroupItem must be used within <ToggleGroup>.')
}

const isActive = computed(() => {
  if (ctx.type?.value === 'multiple') {
    return Array.isArray(ctx.state.value) && ctx.state.value.includes(props.value)
  }
  return ctx.state.value === props.value
})

const resolvedVariant = computed(() => props.variant || ctx.variant?.value || 'default')
const resolvedSize = computed(() => props.size || ctx.size?.value || 'default')

const itemAttrs = computed(() => ({
  ...attrs,
  type: 'button',
  'data-state': isActive.value ? 'on' : 'off',
  'aria-pressed': isActive.value,
  disabled: props.disabled,
  class: cn(
    toggleVariants({ variant: resolvedVariant.value, size: resolvedSize.value }),
    'rounded-none first:rounded-l-md last:rounded-r-md',
    attrs.class
  )
}))

const handleClick = () => {
  if (props.disabled) return
  ctx.toggleItem(props.value)
}
</script>
