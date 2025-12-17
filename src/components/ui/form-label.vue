<template>
  <Label v-bind="labelAttrs" :for="ids.formItemId">
    <slot />
  </Label>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Label } from './label'
import { useFormField } from './form-context'
import { cn } from './utils'

defineOptions({ name: 'UiFormLabel' })

const attrs = useAttrs()
const ids = useFormField()

const labelAttrs = computed(() => ({
  ...attrs,
  class: cn(ids.error ? 'text-red-600' : '', attrs.class)
}))
</script>
