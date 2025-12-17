<template>
  <div v-bind="itemAttrs" role="group" aria-roledescription="slide" :aria-label="ariaLabel">
    <slot />
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'
import { cn } from './utils'
import { useCarousel } from './carousel-context'

defineOptions({ name: 'UiCarouselItem' })

const attrs = useAttrs()
const ctx = useCarousel()
const index = ref(ctx?.registerItem() ?? 0)
const isHorizontal = computed(() => ctx?.orientation !== 'vertical')

const ariaLabel = computed(() => `${index.value + 1} of ${ctx?.itemCount.value || 1}`)

const itemAttrs = computed(() => ({
  ...attrs,
  class: cn('shrink-0 grow-0 basis-full', isHorizontal.value ? 'pr-4' : 'pb-4', attrs.class)
}))
</script>
