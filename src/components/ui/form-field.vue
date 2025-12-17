<template>
  <slot v-bind="slotProps" />
</template>

<script setup>
import { computed, provide } from 'vue'
import { FormFieldSymbol } from './form-context'

defineOptions({ name: 'UiFormField' })

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  error: {
    type: [String, Object],
    default: ''
  }
})

const slotProps = computed(() => ({ name: props.name, error: props.error }))

provide(FormFieldSymbol, props)
</script>
