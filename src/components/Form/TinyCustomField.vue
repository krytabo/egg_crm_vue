<!-- src/components/Form/TinyCustomField.vue -->
<!-- TinyVue 版本的自訂表單欄位組件 -->
<template>
  <!-- 輸入框 -->
  <template v-if="type === 'input'">
    <TinyInput
      v-if="!readonly"
      ref="inputRef"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || t('pleaseEnter', '請輸入')"
      :clearable="props.allowClear"
      :style="{ width: props.width }"
      @change="handleChange"
      @clear="() => handleChange('')"
    />
    <template v-else>
      <p>{{ modelValueProxy || '-' }}</p>
    </template>
  </template>

  <!-- 數字輸入框 -->
  <template v-if="type === 'number'">
    <div v-if="!readonly" class="flex flex-col w-full">
      <TinyNumeric
        ref="numberRef"
        v-model="modelValueProxy"
        :placeholder="props.placeholder || t('pleaseEnter', '請輸入')"
        :min="props.min"
        :max="props.max"
        :format="numericFormat"
        @change="handleChange"
        @focus="handleNumberFocus"
        class="w-full!"
      />
      <p v-if="isExceedMaxNumber" class="text-sm text-red-500">{{ t('exceededMaxValue', '超過最大值') }} {{ props.maxNumber }}</p>
    </div>
    <div v-else class="flex gap-2">
      <p>{{ formattedReadonlyValue }}</p>
    </div>
  </template>

  <!-- 文本框 -->
  <template v-if="type === 'textarea'">
    <TinyInput
      v-if="!readonly"
      ref="textareaRef"
      type="textarea"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || t('pleaseEnter', '請輸入')"
      :rows="props.textareaRows"
      @change="handleChange"
    />
    <template v-else>
      <div v-html="(modelValueProxy || '-').replace(/\n/g, '<br>')"></div>
    </template>
  </template>

  <!-- 下拉選擇 -->
  <template v-if="type === 'select'">
    <TinySelect
      v-if="!readonly"
      ref="selectRef"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || t('pleaseSelect', '請選擇')"
      :clearable="props.allowClear"
      :options="props.options"
      :value-key="props.valueKey"
      :label-key="props.labelKey"
      @change="handleChange"
      @clear="clearItem"
    />
    <template v-else>
      <p>{{ selectedLabel || '-' }}</p>
    </template>
  </template>

  <!-- 日期選擇器 -->
  <template v-if="type === 'date-picker'">
    <TinyDatePicker
      v-if="!readonly"
      ref="datePickerRef"
      v-model="modelValueProxy"
      :format="props.displayFormat || 'yyyy-MM-dd'"
      :clearable="props.allowClear"
      :disabled-date="props.disabledDate"
      class="w-full"
      @change="handleChange"
      @clear="() => handleChange(null)"
    />
    <template v-else>
      <p>{{ formatDateWithTimezone(modelValueProxy, props.dateFormat || 'YYYY/MM/DD') || '-' }}</p>
    </template>
  </template>

  <!-- 日期區間 -->
  <template v-if="type === 'range-picker'">
    <TinyDatePicker
      v-if="!readonly"
      ref="rangePickerRef"
      v-model="modelValueProxy"
      :format="props.displayFormat || 'yyyy-MM-dd'"
      :clearable="props.allowClear"
      range
      class="w-full"
      @change="handleChange"
      @clear="() => handleChange([])"
    />
    <template v-else>
      <p>{{ formatRangeWithTimezone || '-' }}</p>
    </template>
  </template>

  <!-- 日期時間選擇器 -->
  <template v-if="type === 'datetime-picker'">
    <TinyDatePicker
      v-if="!readonly"
      ref="datetimePickerRef"
      v-model="modelValueProxy"
      :format="props.displayFormat || 'yyyy-MM-dd HH:mm:ss'"
      :clearable="props.allowClear"
      type="datetime"
      class="w-full"
      @change="handleChange"
      @clear="() => handleChange(null)"
    />
    <template v-else>
      <p>{{ formatDateWithTimezone(modelValueProxy, props.dateFormat || 'YYYY/MM/DD HH:mm:ss') || '-' }}</p>
    </template>
  </template>

  <!-- 複選框 -->
  <template v-if="type === 'checkbox'">
    <TinyCheckbox v-if="!readonly" ref="checkboxRef" :model-value="modelValueProxy === trueLabel" @change="handleCheckboxChange">
      <slot></slot>
    </TinyCheckbox>
    <template v-else>
      <div class="readonly-checkbox flex items-center gap-1">
        <span class="checkbox-indicator text-[20px]" :class="{ 'is-checked': modelValueProxy === trueLabel }">
          <span v-if="modelValueProxy === trueLabel" class="checkmark"><i class="ri-checkbox-circle-fill text-[#165dff]"></i></span>
          <span v-else><i class="ri-close-circle-fill text-gray-300"></i></span>
        </span>
        <span class="checkbox-label"><slot></slot></span>
      </div>
    </template>
  </template>

  <!-- 複選框組 -->
  <template v-if="type === 'checkbox-group'">
    <TinyCheckboxGroup v-if="!readonly" ref="checkboxGroupRef" v-model="modelValueProxy" @change="handleChange">
      <TinyCheckbox v-for="item in props.options" :key="item[props.valueKey]" :value="item[props.valueKey]" :disabled="item.disabled === true">
        {{ item[props.labelKey] || item.name }}
      </TinyCheckbox>
    </TinyCheckboxGroup>
    <template v-else>
      <template v-if="selectedCheckboxGroupLabels && selectedCheckboxGroupLabels.length">
        <TinyTag v-for="item in selectedCheckboxGroupLabels" :key="item" class="mr-2 last:mr-0">
          {{ item }}
        </TinyTag>
      </template>
      <p v-else class="text-gray-400">{{ t('noData', '無資料') }}</p>
    </template>
  </template>

  <!-- 單選按鈕 -->
  <template v-if="type === 'radio'">
    <TinyRadio v-if="!readonly" ref="radioRef" :model-value="modelValueProxy === trueLabel" @change="handleRadioChange">
      <slot></slot>
    </TinyRadio>
    <template v-else>
      <div class="readonly-radio flex items-center gap-1">
        <span class="radio-indicator text-[20px]" :class="{ 'is-checked': modelValueProxy === trueLabel }">
          <span v-if="modelValueProxy === trueLabel" class="radio-checked"><i class="ri-radio-button-fill text-[#165dff]"></i></span>
          <span v-else><i class="ri-radio-button-line text-gray-300"></i></span>
        </span>
        <span class="radio-label"><slot></slot></span>
      </div>
    </template>
  </template>

  <!-- 單選按鈕組 -->
  <template v-if="type === 'radio-group'">
    <TinyRadioGroup v-if="!readonly" ref="radioGroupRef" v-model="modelValueProxy" @change="handleChange">
      <TinyRadio v-for="item in props.options" :key="item[props.valueKey]" :value="item[props.valueKey]" :disabled="item.disabled === true">
        {{ item[props.labelKey] || item.name }}
      </TinyRadio>
    </TinyRadioGroup>
    <template v-else>
      <p>{{ selectedRadioLabel || '-' }}</p>
    </template>
  </template>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { TinyInput, TinySelect, TinyDatePicker, TinyCheckbox, TinyCheckboxGroup, TinyRadio, TinyRadioGroup, TinyTag, TinyNumeric } from '@opentiny/vue';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import dayjs from 'dayjs';

defineOptions({
  name: 'TinyCustomField',
});

const { t } = useI18n();
const timezoneStore = useTimezoneStore();

const props = defineProps({
  type: {
    type: String,
    default: 'input',
    validator: (value) => ['input', 'number', 'textarea', 'select', 'date-picker', 'range-picker', 'datetime-picker', 'checkbox', 'checkbox-group', 'radio', 'radio-group'].includes(value),
  },
  width: String,
  modelValue: [String, Number, Array, Boolean, null],
  options: {
    type: Array,
    default: () => [],
  },
  readonly: Boolean,
  allowClear: Boolean,
  min: Number,
  max: Number,
  maxNumber: Number,
  steps: [Number, String],
  fraction: Number,
  formatter: {
    type: Function,
    default: undefined,
  },
  precision: {
    type: Number,
    default: 0,
  },
  groupSize: {
    type: Function,
    default: undefined,
  },
  thousands: {
    type: Boolean,
    default: false,
  },
  trueLabel: {
    type: [String, Number, Boolean],
    default: true,
  },
  falseLabel: {
    type: [String, Number, Boolean],
    default: false,
  },
  textareaRows: {
    type: Number,
    default: 4,
  },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  placeholder: { type: String, default: '' },
  displayFormat: String,
  dateFormat: String,
  disabledDate: Function,
});

const emit = defineEmits(['update:modelValue', 'change', 'input', 'clear']);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 下拉選擇 - 取得選中的標籤
const selectedLabel = computed(() => {
  const valueKey = props.valueKey || 'value';
  const labelKey = props.labelKey || 'label';
  const found = props.options.find((opt) => opt?.[valueKey] === props.modelValue);
  return found ? (found?.[labelKey] ?? '') : '';
});

// 處理變更
const handleChange = (value) => {
  let val = value ?? modelValueProxy.value;
  if (props.type === 'date-picker' && (val === '' || val == null)) {
    val = null;
  }
  if (props.type === 'range-picker' && (val === '' || val == null)) {
    val = [];
  }
  emit('update:modelValue', val);
  emit('change', val);
};

// 清除項目
const clearItem = (val) => {
  emit('clear', val);
};

// 複選框變更
const handleCheckboxChange = (checked) => {
  const newValue = checked ? props.trueLabel : props.falseLabel;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 單選按鈕變更
const handleRadioChange = (value) => {
  const newValue = value ? props.trueLabel : props.falseLabel;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 金額相關
const isExceedMaxNumber = computed(() => {
  if (props.maxNumber === undefined || props.maxNumber === null) return false;
  const currentValue = Number(modelValueProxy.value);
  return !isNaN(currentValue) && currentValue > props.maxNumber;
});

const defaultFormatter = (value) => {
  if (!props.thousands) return value;
  const n = Number(value);
  return isNaN(n) ? value : n.toLocaleString();
};

const defaultParser = (value) => {
  if (!props.thousands) return value;
  return String(value).replace(/,/g, '');
};

const actualFormatter = computed(() => {
  return props.formatter || (props.thousands ? defaultFormatter : undefined);
});

const actualParser = computed(() => {
  return props.groupSize || (props.thousands ? defaultParser : undefined);
});

// TinyNumeric format 配置
const numericFormat = computed(() => {
  const formatConfig = {
    zeroize: true, // 不保留多余的 0 字符
    fraction: props.precision, // 保留小數位數
    groupSeparator: props.thousands ? ',' : '', // 整數部分分組分隔符
    secondaryGroupSize: 0, // 不使用第二級分組
    decimalSeparator: '.', // 小數點符號
  };
  if (props.precision === 0) delete formatConfig.fraction;
  return formatConfig;
});

const formattedReadonlyValue = computed(() => {
  const value = modelValueProxy.value || 0;
  if (actualFormatter.value && typeof actualFormatter.value === 'function') return actualFormatter.value(value);
  // 使用 TinyNumeric 的格式化邏輯
  if (props.thousands || props.precision !== undefined) {
    const num = Number(value);
    if (isNaN(num)) return value;

    let formatted = num.toFixed(props.precision ?? 2);
    if (props.thousands) {
      const [intPart, decPart] = formatted.split('.');
      const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = decPart ? `${withComma}.${decPart}` : withComma;
    }
    return formatted;
  }
  return value;
});

const handleNumberFocus = (e) => {
  const inputElement = e.target?.querySelector('input') || e.target;
  if (inputElement) {
    inputElement.select();
  }
};

// 時間顯示相關
const formatDateWithTimezone = (date, format) => {
  if (!date) return;
  return timezoneStore.formatDate(date, format);
};

const formatRangeWithTimezone = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    const format = props.dateFormat || 'YYYY/MM/DD';
    const startDate = formatDateWithTimezone(props.modelValue[0], format) || '';
    const endDate = formatDateWithTimezone(props.modelValue[1], format) || '';
    return `${startDate} ~ ${endDate}`;
  }
  return '-';
});

// 複選框組相關
const selectedCheckboxGroupLabels = computed(() => {
  const selected = Array.isArray(props.modelValue) ? props.modelValue : [];
  return props.options.filter((item) => selected.includes(item[props.valueKey])).map((item) => item[props.labelKey] || item.name);
});

// 單選按鈕組相關
const selectedRadioLabel = computed(() => {
  const found = props.options.find((opt) => opt[props.valueKey] === props.modelValue);
  return found ? found[props.labelKey] || found.name : '';
});

// 模板引用
const inputRef = ref(null);
const numberRef = ref(null);
const textareaRef = ref(null);
const selectRef = ref(null);
const datePickerRef = ref(null);
const rangePickerRef = ref(null);
const datetimePickerRef = ref(null);
const checkboxRef = ref(null);
const checkboxGroupRef = ref(null);
const radioRef = ref(null);
const radioGroupRef = ref(null);

defineExpose({
  inputRef,
  numberRef,
  textareaRef,
  selectRef,
  datePickerRef,
  rangePickerRef,
  datetimePickerRef,
  checkboxRef,
  checkboxGroupRef,
  radioRef,
  radioGroupRef,
  focus() {
    inputRef.value?.focus?.();
    selectRef.value?.focus?.();
    numberRef.value?.focus?.();
    checkboxRef.value?.focus?.();
    datePickerRef.value?.focus?.();
    radioRef.value?.focus?.();
    radioGroupRef.value?.focus?.();
  },
});
</script>

<style scoped>
.readonly-checkbox,
.readonly-radio {
  align-items: center;
}

.checkbox-indicator,
.radio-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
}
</style>
