<template>
  <div v-bind="wrapperAttrs">
    <div :style="{ paddingBottom }" />
    <div class="absolute inset-0">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiAspectRatio' })

const props = defineProps({
  ratio: {
    type: Number,
    default: 16 / 9
  }
})

const attrs = useAttrs()
const paddingBottom = computed(() => `${100 / (props.ratio || 1)}%`)

const wrapperAttrs = computed(() => ({
  ...attrs,
  class: cn('relative w-full', attrs.class)
}))
</script>
