<template>
  <div class="space-y-2">
    <Skeleton v-for="line in props.lines" :key="line" class="h-4 w-full" />
  </div>
</template>

<script setup>

import { Skeleton } from './skeleton'

defineOptions({ name: 'UiSidebarMenuSkeleton' })

const props = defineProps({
  lines: {
    type: Number,
    default: 4
  }
})
</script>
