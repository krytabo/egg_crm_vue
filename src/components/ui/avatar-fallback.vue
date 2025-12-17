<template>
  <div v-if="isVisible" v-bind="fallbackAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'
import { useAvatarContext } from './avatar-context'

defineOptions({ name: 'UiAvatarFallback' })

const attrs = useAttrs()
const ctx = useAvatarContext()

const isVisible = computed(() => !ctx || ctx.attempted.value === false || ctx.hasLoaded.value === false)

const fallbackAttrs = computed(() => ({
  ...attrs,
  class: cn('flex size-full items-center justify-center text-sm font-medium text-gray-600', attrs.class)
}))
</script>
