<template>
  <button v-bind="buttonAttrs" type="button">
    <slot />
  </button>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarMenuButton' })

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})

const attrs = useAttrs()

const buttonAttrs = computed(() => ({
  ...attrs,
  class: cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
    props.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100',
    attrs.class
  )
}))
</script>
