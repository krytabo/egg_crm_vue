<template>
  <div v-bind="carouselAttrs" role="region" aria-roledescription="carousel">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs, watch } from 'vue'
import { cn } from './utils'
import { CarouselSymbol } from './carousel-context'

defineOptions({ name: 'UiCarousel' })

const props = defineProps({
  modelValue: {
    type: Number,
    default: undefined
  },
  defaultIndex: {
    type: Number,
    default: 0
  },
  orientation: {
    type: String,
    default: 'horizontal'
  },
  loop: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const itemCount = ref(0)
const current = ref(typeof props.modelValue === 'number' ? props.modelValue : props.defaultIndex)

watch(
  () => props.modelValue,
  (value) => {
    if (typeof value === 'number') {
      current.value = value
    }
  }
)

const clampIndex = (value) => {
  if (props.loop) {
    if (itemCount.value === 0) return 0
    return (value + itemCount.value) % itemCount.value
  }
  return Math.max(0, Math.min(value, Math.max(0, itemCount.value - 1)))
}

const setIndex = (value) => {
  const next = clampIndex(value)
  current.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

const registerItem = () => {
  const id = itemCount.value
  itemCount.value += 1
  return id
}

const scrollNext = () => setIndex(current.value + 1)
const scrollPrev = () => setIndex(current.value - 1)

provide(CarouselSymbol, {
  orientation: props.orientation,
  current,
  registerItem,
  scrollNext,
  scrollPrev,
  itemCount,
  loop: props.loop
})

const carouselAttrs = computed(() => ({
  ...attrs,
  class: cn('relative', attrs.class)
}))
</script>
