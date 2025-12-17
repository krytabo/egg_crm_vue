<template>
  <TinyButton v-bind="buttonProps" class="mx-0!">
    <slot />
  </TinyButton>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { Button as TinyButton } from "@opentiny/vue";
import { cn } from "./utils";

defineOptions({ name: "UiButton" });

const variantMap = {
  default: { type: "primary" },
  destructive: { type: "danger" },
  outline: { type: "default", plain: true },
  secondary: { type: "success" },
  ghost: { type: "text" },
  link: { type: "text" }
};

const sizeMap = {
  default: "medium",
  medium: "medium",
  sm: "small",
  lg: "large",
  icon: "small"
};

const props = defineProps({
  variant: {
    type: String,
    default: "default"
  },
  size: {
    type: String,
    default: "default"
  },
  asChild: {
    type: Boolean,
    default: false
  }
});

const attrs = useAttrs();

const buttonProps = computed(() => {
  const variantProps = variantMap[props.variant] || variantMap.default;
  const resolvedSize = sizeMap[props.size] || sizeMap.default;
  const explicitType = attrs.type;
  const type = explicitType || variantProps.type;
  const plain = attrs.plain ?? variantProps.plain ?? false;
  const isText = type === "text";

  return {
    ...attrs,
    class: cn("inline-flex items-center gap-2", attrs.class),
    type,
    size: resolvedSize,
    plain,
    text: isText,
    "reset-time": 0
  };
});
</script>
