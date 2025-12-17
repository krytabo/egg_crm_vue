<template>
  <img v-bind="imageAttrs" :src="props.src" :alt="props.alt" @load="handleLoad" @error="handleError" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'
import { useAvatarContext } from './avatar-context'

defineOptions({ name: 'UiAvatarImage' })

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  }
})

const attrs = useAttrs()
const ctx = useAvatarContext()

const imageAttrs = computed(() => ({
  ...attrs,
  class: cn('size-full object-cover', attrs.class)
}))

const handleLoad = () => ctx?.setLoaded(true)
const handleError = () => ctx?.setLoaded(false)
</script>
