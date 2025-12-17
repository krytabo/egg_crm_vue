<template>
  <p v-bind="descriptionAttrs" :id="ids.formDescriptionId">
    <slot />
  </p>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'
import { useFormField } from './form-context'

defineOptions({ name: 'UiFormDescription' })

const attrs = useAttrs()
const ids = useFormField()

const descriptionAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm text-gray-500', attrs.class)
}))
</script>
