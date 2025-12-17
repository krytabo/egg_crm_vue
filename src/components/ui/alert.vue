<template>
  <div v-bind="alertAttrs" role="alert">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiAlert' })

const variantClasses = {
  default: 'border-gray-200 bg-white text-gray-900',
  destructive: 'border-red-200 bg-red-50 text-red-700'
}

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  }
})

const attrs = useAttrs()

const alertAttrs = computed(() => ({
  ...attrs,
  class: cn(
    'grid w-full gap-1.5 rounded-lg border px-4 py-3 text-sm',
    variantClasses[props.variant] || variantClasses.default,
    attrs.class
  )
}))
</script>
