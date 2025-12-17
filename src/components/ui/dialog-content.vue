<!-- src/components/ui/dialog-content.vue -->
<template>
  <TinyDialogBox v-model:visible="visible" v-bind="contentAttrs" :title="title" :width="width" :show-close="showClose" :close-on-click-modal="closeOnClickModal">
    <template #default>
      <slot :close="handleClose" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :close="handleClose" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" :close="handleClose" />
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { DialogBox as TinyDialogBox } from "@opentiny/vue";
import { cn } from "./utils";

defineOptions({ name: "UiDialogContent" });

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  width: {
    type: [String, Number],
    default: "600px"
  },
  showClose: {
    type: Boolean,
    default: false
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue", "close"]);

const attrs = useAttrs();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};

const contentAttrs = computed(() => ({
  ...attrs,
  class: cn("max-w-full", attrs.class)
}));
</script>
