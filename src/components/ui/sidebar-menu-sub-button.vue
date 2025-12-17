<template>
  <button v-bind="buttonAttrs" type="button">
    <slot />
  </button>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarMenuSubButton' })

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
    'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
    props.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100',
    attrs.class
  )
}))
</script>
