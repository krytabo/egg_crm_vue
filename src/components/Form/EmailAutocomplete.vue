<!-- src/components/Form/EmailAutocomplete.vue -->
<template>
  <TinyAutocomplete
    v-bind="contentAttrs"
    :model-value="props.modelValue"
    @update:model-value="(value) => $emit('update:modelValue', value)"
    :fetch-suggestions="handleFetchSuggestions"
    value-key="value"
    :placeholder="props.placeholder"
    trigger-on-focus
    clearable
    @clear="handleClear"
  />
</template>

<script setup>
import { computed, useAttrs, watch } from "vue";
import { TinyAutocomplete } from "@opentiny/vue";

const attrs = useAttrs();
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: "請輸入"
  }
});
const emit = defineEmits(["update:modelValue", "clear"]);

const contentAttrs = computed(() => ({
  ...attrs
}));
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
const formatSuggestions = (keyword) => {
  const text = (keyword || "").trim();
  if (!text) return [];
  const atIndex = text.indexOf("@");
  if (atIndex > -1) {
    const prefix = text.slice(0, atIndex);
    const suffixInput = text.slice(atIndex);
    return emailSuffixes.filter((suffix) => suffix.startsWith(suffixInput)).map((suffix) => `${prefix}${suffix}`);
  }
  return emailSuffixes.map((suffix) => `${text}${suffix}`);
};
const handleFetchSuggestions = (queryString, callback) => {
  const suggestions = formatSuggestions(queryString);
  callback(suggestions.map((value) => ({ value })));
};

const handleClear = () => {
  emit("clear");
};
watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      emit("clear");
    }
  }
);
</script>
