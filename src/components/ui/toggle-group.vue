<template>
  <div v-bind="groupAttrs" role="group">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs, watch } from 'vue'
import { cn } from './utils'
import { ToggleGroupSymbol } from './toggle-group-symbol'

defineOptions({ name: 'UiToggleGroup' })

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: undefined
  },
  defaultValue: {
    type: [String, Array],
    default: undefined
  },
  type: {
    type: String,
    default: 'single'
  },
  variant: {
    type: String,
    default: 'outline'
  },
  size: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const state = ref(
  props.modelValue ?? props.defaultValue ?? (props.type === 'multiple' ? [] : '')
)

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      state.value = value
    }
  }
)

const updateValue = (value) => {
  state.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

const toggleItem = (value) => {
  if (props.type === 'multiple') {
    const current = Array.isArray(state.value) ? [...state.value] : []
    const index = current.indexOf(value)
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(value)
    }
    updateValue(current)
  } else {
    updateValue(state.value === value ? '' : value)
  }
}

provide(ToggleGroupSymbol, {
  state,
  toggleItem,
  type: computed(() => props.type),
  variant: computed(() => props.variant),
  size: computed(() => props.size)
})

const groupAttrs = computed(() => ({
  ...attrs,
  class: cn('inline-flex rounded-md shadow-sm', attrs.class)
}))
</script>
