<template>
  <div v-bind="avatarAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs } from 'vue'
import { cn } from './utils'
import { AvatarSymbol } from './avatar-context'

defineOptions({ name: 'UiAvatar' })

const attrs = useAttrs()
const hasLoaded = ref(false)
const attempted = ref(false)

const setLoaded = (state) => {
  attempted.value = true
  hasLoaded.value = state
}

provide(AvatarSymbol, { hasLoaded, attempted, setLoaded })

const avatarAttrs = computed(() => ({
  ...attrs,
  class: cn('relative flex size-10 shrink-0 overflow-hidden rounded-full bg-gray-100', attrs.class)
}))
</script>
