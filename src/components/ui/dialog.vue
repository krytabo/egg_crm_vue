<template>
  <slot />
</template>

<script setup>
import { provide, ref, watch } from 'vue'
import { DialogSymbol } from './dialog-context'

defineOptions({ name: 'UiDialog' })

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined
  },
  visible: {
    type: Boolean,
    default: undefined
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'open-change'])

const open = ref(
  typeof props.modelValue === 'boolean'
    ? props.modelValue
    : typeof props.visible === 'boolean'
      ? props.visible
      : props.defaultOpen
)

watch(
  () => [props.modelValue, props.visible],
  ([modelValue, visible]) => {
    if (typeof modelValue === 'boolean') {
      open.value = modelValue
    } else if (typeof visible === 'boolean') {
      open.value = visible
    }
  }
)

const setOpen = (value) => {
  open.value = value
  emit('update:modelValue', value)
  emit('update:visible', value)
  emit('open-change', value)
}

provide(DialogSymbol, { open, setOpen })
</script>
