<template>
  <TinyGrid v-bind="gridAttrs" :data="props.data">
    <slot />
  </TinyGrid>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { Grid as TinyGrid } from "@opentiny/vue";
import { cn } from "./utils";

defineOptions({ name: "UiGrid" });

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const attrs = useAttrs();

const gridAttrs = computed(() => ({
  ...attrs,
  class: cn("rounded-xl border border-gray-200", attrs.class)
}));
</script>
