<template>
  <TinyBadge v-bind="badgeProps">
    <slot />
  </TinyBadge>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Badge as TinyBadge } from '@opentiny/vue'
import { cn } from './utils'

defineOptions({ name: 'UiBadge' })

const variantMap = {
  default: 'primary',
  secondary: 'success',
  destructive: 'danger',
  outline: 'default'
}

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  }
})

const attrs = useAttrs()

const badgeProps = computed(() => ({
  ...attrs,
  type: variantMap[props.variant] || variantMap.default,
  class: cn('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium', attrs.class)
}))
</script>
