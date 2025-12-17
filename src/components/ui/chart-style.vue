<template>
  <style v-if="styleRules">
    {{ `[data-chart="${props.id}"] {\n${styleRules}\n}` }}
  </style>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'UiChartStyle' })

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

const styleRules = computed(() =>
  Object.entries(props.config)
    .filter(([, value]) => value && (value.color || value.theme))
    .map(([key, value]) => `  --color-${key}: ${value.color || value.theme?.light || ''};`)
    .join('\n')
)
</script>
