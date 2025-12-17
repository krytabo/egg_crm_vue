<template>
  <TinyButton size="small" v-bind="attrs">
    <slot />
  </TinyButton>
</template>

<script setup>
import { useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'

defineOptions({ name: 'UiSidebarMenuAction' })

const attrs = useAttrs()
</script>
