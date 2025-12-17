<template>
  <div v-bind="sectionAttrs">
    <slot />
  </div>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { cn } from "./utils";

defineOptions({ name: "UiCardTitle" });

const attrs = useAttrs();
const baseClass = "text-[22px] font-semibold text-gray-900";

const sectionAttrs = computed(() => ({
  ...attrs,
  class: cn(baseClass, attrs.class)
}));
</script>
