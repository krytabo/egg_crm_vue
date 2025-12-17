<template>
  <div v-bind="railAttrs">
    <TinyButton size="small" @click="handleClick">
      <slot>{{ ctx.open.value ? '收合' : '展開' }}</slot>
    </TinyButton>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { cn } from './utils'
import { useSidebar } from './sidebar-context'

defineOptions({ name: 'UiSidebarRail' })

const attrs = useAttrs()
const ctx = useSidebar()

const railAttrs = computed(() => ({
  ...attrs,
  class: cn('hidden w-10 md:flex md:flex-col md:items-center md:justify-center', attrs.class)
}))

const handleClick = () => ctx.toggleSidebar()
</script>
