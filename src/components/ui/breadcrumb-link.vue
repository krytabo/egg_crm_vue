<template>
  <component :is="props.tag" v-bind="linkAttrs">
    <slot />
  </component>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiBreadcrumbLink' })

const props = defineProps({
  tag: {
    type: String,
    default: 'a'
  }
})

const attrs = useAttrs()

const linkAttrs = computed(() => ({
  ...attrs,
  class: cn('hover:text-gray-900 transition-colors', attrs.class)
}))
</script>
