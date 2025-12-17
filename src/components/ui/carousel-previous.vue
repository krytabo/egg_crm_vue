<template>
  <Button v-bind="buttonAttrs" variant="outline" size="icon" @click="handleClick">
    <slot>‹</slot>
    <span class="sr-only">{{ props.label }}</span>
  </Button>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Button } from './button'
import { cn } from './utils'
import { useCarousel } from './carousel-context'

defineOptions({ name: 'UiCarouselPrevious' })

const props = defineProps({
  label: {
    type: String,
    default: 'Previous slide'
  }
})

const attrs = useAttrs()
const ctx = useCarousel()

const buttonAttrs = computed(() => ({
  ...attrs,
  class: cn('absolute top-1/2 -translate-y-1/2', attrs.class)
}))

const handleClick = () => ctx?.scrollPrev()
</script>
