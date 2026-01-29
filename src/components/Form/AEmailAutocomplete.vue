<!-- src/components/Form/AEmailAutocomplete.vue -->
<template>
  <a-auto-complete v-if="!displayOnly" v-bind="attrs" :model-value="internalValue" :data="suggestions" :placeholder="placeholder" :disabled="displayOnly || attrs.disabled" allow-clear @update:model-value="handleUpdate" @clear="handleClear" />
  <p v-if="displayOnly">{{ modelValue }}</p>
</template>

<script setup>
import { computed, useAttrs } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "請輸入"
  },
  displayOnly: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["update:modelValue", "clear"]);
const attrs = useAttrs();

const emailSuffixes = [
  "@gmail.com",
  "@hotmail.com",
  "@yahoo.com.tw",
  "@yahoo.com",
  "@outlook.com",
  "@icloud.com",
  "@mail.com",
  "@aol.com",
  "@protonmail.com",
  "@gmx.com",
  "@zoho.com",
  "@yandex.com",
  "@me.com",
  "@live.com",
  "@qq.com",
  "@naver.com",
  "@hanmail.net",
  "@163.com",
  "@126.com",
  "@sina.com",
  "@yeah.net",
  "@foxmail.com",
  "@example.com"
];

const suggestions = computed(() => {
  const text = (props.modelValue || "").trim();
  if (!text) return [];
  const atIndex = text.indexOf("@");
  if (atIndex > -1) {
    const prefix = text.slice(0, atIndex);
    const suffixInput = text.slice(atIndex);
    return emailSuffixes.filter((suffix) => suffix.startsWith(suffixInput)).map((suffix) => `${prefix}${suffix}`);
  }
  return emailSuffixes.map((suffix) => `${text}${suffix}`);
});

const internalValue = computed(() => props.modelValue ?? "");
const handleUpdate = (value) => {
  emit("update:modelValue", value);
};
const handleClear = () => {
  emit("clear");
};
</script>
