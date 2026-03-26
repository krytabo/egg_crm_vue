<!--
  TagTextarea.vue
  輸入框：每行一個 tag，按 Enter 換行輸入下一個。
  v-model 值為字串陣列，例如 ["桶押金150*5=750", "水機自備"]
  Props:
    - modelValue: Array<string>（必填）
    - height: string  — textarea 高度，預設 '120px'
    - placeholder: string
    - readonly: boolean
-->
<template>
  <div class="tag-textarea-wrapper">
    <!-- 編輯模式 -->
    <textarea
      v-if="!readonly"
      ref="textareaRef"
      v-model="localText"
      class="tag-textarea"
      :style="{ height: height }"
      :placeholder="placeholder || $t('pleaseEnter', '請輸入')"
      @keydown.enter.stop
      @blur="commitValue"
    />
    <!-- 唯讀模式 -->
    <template v-else>
      <p v-if="!modelValue?.length">—</p>
      <ul v-else class="tag-readonly-list">
        <li v-for="(tag, i) in modelValue" :key="i">{{ tag }}</li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: '120px',
  },
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const textareaRef = ref(null);

/** 確保值永遠是乾淨陣列（相容舊格式逗號字串） */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 將多行文字轉為 tag 陣列，過濾空白行與前後空格 */
function parseRaw(raw) {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// 本地文字狀態，textarea 用 v-model 綁定這裡，不讓 props 直接控制 DOM
const localText = ref(toArray(props.modelValue).join('\n'));

// 外部 modelValue 變動時（非使用者輸入），同步到 localText
watch(
  () => props.modelValue,
  (val) => {
    if (document.activeElement !== textareaRef.value) {
      localText.value = toArray(val).join('\n');
    }
  },
);

// localText 改變時即時 emit（每次按鍵都同步，含換行中間狀態）
watch(localText, (text) => {
  const tags = parseRaw(text);
  emit('update:modelValue', tags);
  emit('change', tags);
});

// blur 時整理：去掉尾端空行，重新寫回 localText
function commitValue() {
  const tags = parseRaw(localText.value);
  localText.value = tags.join('\n');
}
</script>

<style scoped>
.tag-textarea-wrapper {
  width: 100%;
}

.tag-textarea {
  width: 100%;
  resize: vertical;
  padding: 6px 10px;
  border: 1px solid #f2f3f5;
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
  background: #f2f3f5;
  outline: none;
  line-height: 1.6;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.tag-textarea:focus {
  border-color: #165dff;
  background: #fff;
}

.tag-textarea::placeholder {
  color: var(--color-text-4, #c9cdd4);
}

.tag-readonly-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tag-readonly-list li {
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
  line-height: 1.6;
}
</style>
