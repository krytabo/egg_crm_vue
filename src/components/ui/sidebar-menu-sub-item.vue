<template>
  <div v-bind="attrs">
    <slot />
  </div>
</template>

<script setup>
import { useAttrs } from 'vue'

defineOptions({ name: 'UiSidebarMenuSubItem' })

const attrs = useAttrs()
</script>
