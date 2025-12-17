<template>
  <aside v-bind="sidebarAttrs" role="complementary">
    <div class="h-full overflow-y-auto p-4">
      <slot />
    </div>
  </aside>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'
import { useSidebar } from './sidebar-context'

defineOptions({ name: 'UiSidebar' })

const props = defineProps({
  side: {
    type: String,
    default: 'left'
  }
})

const attrs = useAttrs()
const ctx = useSidebar()

const sidebarAttrs = computed(() => ({
  ...attrs,
  'data-side': props.side,
  class: cn(
    'bg-white text-gray-900 shadow-sm transition-all duration-200',
    ctx.open.value ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16',
    attrs.class
  )
}))
</script>
