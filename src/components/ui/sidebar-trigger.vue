<template>
  <TinyButton text v-bind="triggerAttrs" @click="handleClick">
    <slot>切換側邊欄</slot>
  </TinyButton>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { cn } from './utils'
import { useSidebar } from './sidebar-context'

defineOptions({ name: 'UiSidebarTrigger' })

const attrs = useAttrs()
const ctx = useSidebar()

const triggerAttrs = computed(() => ({
  ...attrs,
  class: cn('mb-4', attrs.class)
}))

const handleClick = () => ctx.toggleSidebar()
</script>
