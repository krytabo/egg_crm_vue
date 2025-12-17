<template>
  <div class="overflow-hidden">
    <div v-bind="contentAttrs" :style="transformStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'
import { useCarousel } from './carousel-context'

defineOptions({ name: 'UiCarouselContent' })

const attrs = useAttrs()
const ctx = useCarousel()

const isHorizontal = computed(() => ctx?.orientation !== 'vertical')
const offset = computed(() => `${(ctx?.current.value || 0) * -100}%`)

const transformStyle = computed(() => ({
  transform: isHorizontal.value ? `translateX(${offset.value})` : `translateY(${offset.value})`
}))

const contentAttrs = computed(() => ({
  ...attrs,
  class: cn('flex transition-transform duration-500 ease-out', attrs.class, {
    'flex-col': !isHorizontal.value
  })
}))
</script>
