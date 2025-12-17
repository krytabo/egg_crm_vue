<template>
  <Input placeholder="搜尋" v-bind="attrs" />
</template>

<script setup>
import { useAttrs } from 'vue'
import { Input } from './input'

defineOptions({ name: 'UiSidebarInput' })

const attrs = useAttrs()
</script>
