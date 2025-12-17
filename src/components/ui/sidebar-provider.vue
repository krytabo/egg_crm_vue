<template>
  <div v-bind="providerAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide, ref, useAttrs, watch } from 'vue'
import { cn } from './utils'
import { useIsMobile } from './use-mobile'
import { SidebarSymbol } from './sidebar-context'

defineOptions({ name: 'UiSidebarProvider' })

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined
  },
  defaultOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'open-change'])
const attrs = useAttrs()

const isMobile = useIsMobile()
const open = ref(typeof props.modelValue === 'boolean' ? props.modelValue : props.defaultOpen)

watch(
  () => props.modelValue,
  (value) => {
    if (typeof value === 'boolean') {
      open.value = value
    }
  }
)

const setOpen = (value) => {
  open.value = value
  emit('update:modelValue', value)
  emit('open-change', value)
}

const toggleSidebar = () => setOpen(!open.value)

provide(SidebarSymbol, { open, setOpen, toggleSidebar, isMobile })

const providerAttrs = computed(() => ({
  ...attrs,
  class: cn('flex min-h-screen w-full bg-gray-50', attrs.class)
}))
</script>
