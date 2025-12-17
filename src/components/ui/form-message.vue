<template>
  <p v-if="hasContent" v-bind="messageAttrs" :id="ids.formMessageId">
    <template v-if="ids.error">
      {{ ids.error }}
    </template>
    <template v-else>
      <slot />
    </template>
  </p>
</template>

<script setup>
import { computed, useAttrs, useSlots } from 'vue'
import { cn } from './utils'
import { useFormField } from './form-context'

defineOptions({ name: 'UiFormMessage' })

const attrs = useAttrs()
const slots = useSlots()
const ids = useFormField()

const hasContent = computed(() => Boolean(ids.error) || Boolean(slots.default?.()))

const messageAttrs = computed(() => ({
  ...attrs,
  class: cn('text-sm text-red-600', attrs.class)
}))
</script>
