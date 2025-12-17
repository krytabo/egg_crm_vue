<template>
  <PerfectScrollbar v-bind="sectionAttrs">
    <slot />
  </PerfectScrollbar>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { cn } from "./utils";

defineOptions({ name: "UiCardContent" });

const attrs = useAttrs();
const baseClass = "py-4 overflow-hidden h-[calc(100vh-240px)]";

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}));
</script>
