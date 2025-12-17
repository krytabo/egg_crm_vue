<template>
  <Separator v-bind="separatorAttrs" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Separator } from './separator'
import { cn } from './utils'

defineOptions({ name: 'UiSidebarSeparator' })

const attrs = useAttrs()

const separatorAttrs = computed(() => ({
  ...attrs,
  class: cn('my-2', attrs.class)
}))
</script>
