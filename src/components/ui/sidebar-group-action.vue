<template>
  <TinyButton text v-bind="attrs">
    <slot />
  </TinyButton>
</template>

<script setup>
import { useAttrs } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'

defineOptions({ name: 'UiSidebarGroupAction' })

const attrs = useAttrs()
</script>
