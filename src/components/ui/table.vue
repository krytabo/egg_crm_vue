<template>
  <div class="relative w-full overflow-x-auto">
    <table v-bind="tableAttrs">
      <slot />
    </table>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { cn } from './utils'

defineOptions({ name: 'UiTable' })

const attrs = useAttrs()

const tableAttrs = computed(() => ({
  ...attrs,
  class: cn('w-full caption-bottom text-sm', attrs.class)
}))
</script>
