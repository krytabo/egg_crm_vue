<!-- packages/shared/components/Form/CustomField.vue -->
<template>
  <!--輸入框-->
  <template v-if="type === 'input'">
    <a-input
      ref="inputRef"
      v-if="!readonly"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || $t('pleaseEnter')"
      @change="handleChange"
      :allow-clear="props.allowClear"
      @clear="() => handleChange('')"
      :style="{ width: props.width }"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="$slots.suffix" #suffix>
        <slot name="suffix" />
      </template>
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </a-input>
    <template v-else>
      <p>{{ modelValueProxy || '-' }}</p>
    </template>
  </template>
  <!--數字輸入框-->
  <template v-if="type === 'number'">
    <div class="flex flex-col" v-if="!readonly">
      <a-input-number
        v-bind="attrs"
        ref="numberRef"
        v-model="modelValueProxy"
        :placeholder="props.placeholder || $t('pleaseEnter')"
        mode="button"
        :min="props.min"
        :max="props.max"
        :precision="props.precision"
        :step="props.steps"
        :allow-clear="props.allowClear"
        :formatter="actualFormatter"
        :parser="actualParser"
        model-event="input"
        @focus="handleNumberFocus"
      >
        <template v-if="$slots.prefix" #prefix>
          <slot name="prefix" />
        </template>
        <template v-if="$slots.suffix" #suffix>
          <slot name="suffix" />
        </template>
      </a-input-number>
      <p v-if="isExceedMaxNumber" class="text-sm text-red-500">{{ t('exceededMaxValue') }} {{ props.maxNumber }}</p>
    </div>
    <div v-else class="flex gap-2">
      <p>{{ formattedReadonlyValue }}</p>
      <p v-if="$slots.suffix" class="text-gray-500">
        <slot name="suffix" />
      </p>
    </div>
  </template>
  <!--文本框-->
  <template v-if="type === 'textarea'">
    <a-textarea v-if="!readonly" :rows="props.textareaRows" v-model="modelValueProxy" :placeholder="props.placeholder || $t('pleaseEnter')" />
    <template v-else>
      <div v-html="(modelValueProxy || '-').replace(/\n/g, '<br>')"></div>
    </template>
  </template>
  <!-- Email 自動完成 -->
  <template v-if="type === 'email'">
    <EmailAutocomplete
      v-if="!readonly"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || $t('pleaseEnterEmail')"
      @clear="
        () => {
          emit('update:modelValue', '');
          emit('clear');
        }
      "
    />
    <template v-else>
      <p>{{ modelValueProxy }}</p>
    </template>
  </template>

  <!--下拉選擇-->
  <template v-if="type === 'select'">
    <a-select
      ref="selectRef"
      v-if="!readonly"
      v-model="modelValueProxy"
      :placeholder="props.placeholder || $t('pleaseSelect')"
      @change="handleChange"
      :allow-clear="props.allowClear"
      :allowCreate="props.allowCreate"
      @clear="clearItem"
    >
      <a-option v-for="item in props.options" :key="item[props.valueKey]" :label="item[props.labelKey]" :value="item[props.valueKey]" :disabled="item.disabled === true" />
    </a-select>
    <template v-else>
      <p>{{ selectedLabel || '-' }}</p>
    </template>
  </template>

  <!--日期選擇器-->
  <template v-if="type === 'date-picker'">
    <a-date-picker
      ref="datePickerRef"
      v-if="!readonly"
      v-model="modelValueProxy"
      :disabledDate="props.disabledDate"
      :format="props.displayFormat"
      class="w-full"
      @change="handleChange"
      :allow-clear="props.allowClear"
      @clear="() => handleChange([])"
      @picker-value-change="(visible) => emit('picker-value-change', visible)"
    />
    <template v-else>
      <p>{{ formatDateWithTimezone(modelValueProxy, props.dateFormat || 'YYYY/MM/DD') || '-' }}</p>
    </template>
  </template>
  <!--日期區間-->
  <template v-if="type === 'range-picker'">
    <a-range-picker v-if="!readonly" v-model="modelValueProxy" class="w-full" @change="handleChange" :allow-clear="props.allowClear" @clear="() => handleChange([])" />
    <template v-else>
      <!--<p>{{ formattedRange }}</p>-->
      <p>{{ formatRangeWithTimezone || '-' }}</p>
    </template>
  </template>
  <!--日期時間選擇器-->
  <template v-if="type === 'datetime-picker'">
    <a-date-picker
      v-if="!readonly"
      v-model="modelValueProxy"
      :display-format="props.displayFormat || 'HH:mm:ss'"
      :internal-format="props.internalFormat || 'HH:mm:ss'"
      :min-date="props.minDate"
      :max-date="props.maxDate"
      :disabled-date="props.disabledDate"
      :disabled-hours="props.disabledHours"
      :disabled-minutes="props.disabledMinutes"
      :disabled-seconds="props.disabledSeconds"
      :step="props.step"
      :has-error="mergedError"
      :allow-clear="props.allowClear"
      @change="handleChange"
      @validate="handleValidate"
    />
    <template v-else>
      <!--<p>{{ formattedDateTime }}</p>-->
      <p>{{ formatDateWithTimezone(modelValueProxy, props.dateFormat || 'YYYY/MM/DD HH:mm:ss') || '-' }}</p>
    </template>
  </template>

  <!--複選框-->
  <template v-if="type === 'checkbox'">
    <a-checkbox ref="checkboxRef" v-if="!readonly" :model-value="modelValueProxy === trueLabel" @change="handleCheckboxChange">
      <slot></slot>
    </a-checkbox>
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
  <!--複選框組-->
  <template v-if="type === 'checkbox-group'">
    <a-checkbox-group v-if="!readonly" v-model="modelValueProxy" @change="handleChange">
      <a-checkbox v-for="item in props.options" :key="item[props.valueKey]" :value="item[props.valueKey]" :disabled="item.disabled === true">{{ item[props.labelKey] }}</a-checkbox>
    </a-checkbox-group>
    <template v-else>
      <template v-if="selectedCheckboxGroupLabels.length">
        <a-tag v-for="item in selectedCheckboxGroupLabels" :key="item" class="mr-2 last:mr-0" color="arcoblue">{{ item }}</a-tag>
      </template>
      <p v-else class="text-gray-400">{{ $t('noData') }}</p>
    </template>
  </template>

  <!--單選按鈕-->
  <template v-if="type === 'radio'">
    <a-radio ref="radioRef" v-if="!readonly" v-model="modelValueProxy" :value="trueLabel" @change="handleRadioChange">
      <slot></slot>
    </a-radio>
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
  <!--單選按鈕組-->
  <template v-if="type === 'radio-group'">
    <a-radio-group ref="radioGroupRef" v-if="!readonly" v-model="modelValueProxy" @change="handleChange" :type="props.groupType">
      <a-radio v-for="item in props.options" :key="item[props.valueKey]" :value="item[props.valueKey]" :disabled="item.disabled === true">{{ item[props.labelKey] || item.name }}</a-radio>
    </a-radio-group>
    <template v-else>
      <p>{{ selectedRadioLabel || '-' }}</p>
    </template>
  </template>
</template>

<script setup>
defineOptions({
  name: 'AFormItemCompatible',
});
import { computed, ref, useAttrs, useSlots } from 'vue';
import EmailAutocomplete from './AEmailAutocomplete.vue';
import { useFormItem } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import dayjs from 'dayjs';
const attrs = useAttrs();

/** 時間戳相關 **/
import { useTimezoneStore } from '@/stores/TimezoneStore';
const timezoneStore = useTimezoneStore();
const formatDate = computed(() => timezoneStore.formatDate); //依照時區將時間戳轉換格式

/**
 * @typedef {'select' | 'input' | 'email' | 'number' | 'textarea' | 'date-picker' | 'range-picker' | 'datetime-picker' | 'checkbox' | 'checkbox-group' | 'radio' | 'radio-group', 'userSelect' } FormType
 */
/**
 * @typedef {'multipleAll' | 'multipleInternal' | 'multipleExternal' | 'singleAll' | 'singleInternal' | 'singleExternal'} UserSelectMode
 */
const props = defineProps({
  /**
   * 表單元件類型
   * @type {FormType}
   */
  type: {
    type: String,
    default: 'input',
    validator: (value) =>
      ['select', 'input', 'number', 'email', 'textarea', 'date-picker', 'range-picker', 'datetime-picker', 'checkbox', 'checkbox-group', 'radio', 'radio-group', 'userSelect'].includes(value),
  },
  width: String,
  modelValue: [String, Number, Array, null, Boolean, null],
  options: {
    type: Array,
    default: () => [],
  },
  readonly: Boolean,
  allowClear: Boolean,
  allowCreate: Boolean,
  min: Number,
  max: Number,
  maxNumber: Number,
  steps: [Number, String],
  precision: Number, //數字精度，設定0代表只能整數
  formatter: {
    type: Function,
    default: undefined,
  }, //定義數字輸入框展示值
  parser: {
    type: Function,
    default: undefined,
  }, //需與formatter搭配
  thousands: {
    type: Boolean,
    default: false,
  }, //是否使用formatter、parser
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
  labelKey: { type: String, default: 'label' }, //預設label
  valueKey: { type: String, default: 'value' }, //預設value
  placeholder: { type: String, default: '' }, //預設value
  groupType: { type: String, default: null }, //單選框類型

  //成員選擇相關
  userTitle: {
    type: String,
    default: '標題',
  },
  /**
   * 使用者選擇模式
   * @type {UserSelectMode}
   */
  userMode: {
    type: String,
    default: 'multipleAll',
    validator: (value) => ['multipleAll', 'multipleInternal', 'multipleExternal', 'singleAll', 'singleInternal', 'singleExternal'].includes(value),
  },
  /**
   * 顯示的最大標籤數量，超過後會顯示 +N
   * @type {Number}
   */
  maxTagCount: {
    type: Number,
    default: null,
  },

  //DateTimePicker相關
  displayFormat: String,
  internalFormat: String,
  minDate: [String, Date],
  maxDate: [String, Date],
  disabledDate: Function,
  disabledHours: [Array, Function],
  disabledMinutes: [Array, Function],
  disabledSeconds: [Array, Function],
  step: Object,
  hasError: Boolean,
  dateFormat: String,
});
const emit = defineEmits(['update:modelValue', 'change', 'input', 'validate', 'clear', 'picker-value-change']);
const { mergedDisabled, mergedError, eventHandlers } = useFormItem({
  disabled: computed(() => props.readonly),
  error: computed(() => props.hasError),
}); //使用 useFormItem 來獲取表單驗證狀態

const slots = useSlots();
const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
const selectedLabel = computed(() => {
  const valueKey = props.valueKey || 'value';
  const labelKey = props.labelKey || 'label';
  const found = props.options.find((opt) => opt?.[valueKey] === props.modelValue);
  return found ? (found?.[labelKey] ?? '') : '';
}); //下拉選擇
const handleChange = (value) => {
  let val = value ?? modelValueProxy.value;
  if (props.type === 'date-picker' && (val === '' || Array.isArray(val) || val == null)) {
    val = null;
  }
  if (props.type === 'range-picker' && (val === '' || val == null)) {
    val = [];
  }
  emit('update:modelValue', val);
  emit('change', val);
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
}; //全部-點擊觸發
const clearItem = (val) => {
  emit('clear', val);
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
}; //清除項目
const handleCheckboxChange = (checked) => {
  const newValue = checked ? props.trueLabel : props.falseLabel;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  emit('validate');
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
}; //複選框-點擊觸發

/** 金額相關 **/
const isExceedMaxNumber = computed(() => {
  if (props.maxNumber === undefined || props.maxNumber === null) return false;
  const currentValue = Number(modelValueProxy.value);
  return !isNaN(currentValue) && currentValue > props.maxNumber;
});
const defaultFormatter = (value) => {
  if (!props.thousands) return value;
  const n = Number(value);
  return isNaN(n) ? value : n.toLocaleString();
}; //千分位格式化
const defaultParser = (value) => {
  if (!props.thousands) return value;
  return String(value).replace(/,/g, '');
}; //解析
const actualFormatter = computed(() => {
  return props.formatter || (props.thousands ? defaultFormatter : undefined);
}); //實際使用的格式化
const actualParser = computed(() => {
  return props.parser || (props.thousands ? defaultParser : undefined);
}); //實際使用的解析
const formattedReadonlyValue = computed(() => {
  const value = modelValueProxy.value || 0;
  if (actualFormatter.value && typeof actualFormatter.value === 'function') return actualFormatter.value(value);
  return value;
}); //readonly時的格式化顯示
const handleNumberFocus = (e) => {
  const inputElement = e.target.querySelector('input') || e.target;
  if (inputElement) {
    inputElement.select();
  }
}; //數值點擊觸發全選

/** 時間顯示相關 **/
const formatDateWithTimezone = (date, format) => {
  if (!date) return;
  // 統一使用 formatDate，它會正確處理 Date 物件、數字和字串，並返回格式化字串
  return timezoneStore.formatDate(date, format);
}; //時間戳轉換用
const formattedDate = computed(() => {
  if (props.modelValue) {
    return formatDateWithTimezone(props.modelValue, props.dateFormat || 'YYYY/MM/DD');
  }
  return '';
}); //日期
const formattedRange = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    return `${dayjs(props.modelValue[0]).format('YYYY-MM-DD')} ~ ${dayjs(props.modelValue[1]).format('YYYY-MM-DD')}`;
  }
  return '';
}); //日期區間
const formattedDateTime = computed(() => {
  if (props.modelValue) {
    return formatDateWithTimezone(props.modelValue, props.dateFormat || 'YYYY/MM/DD　HH:mm:ss');
  }
  return '';
}); //日期＋時間
const formatRangeWithTimezone = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    const format = props.dateFormat || 'YYYY/MM/DD';
    const startDate = formatDateWithTimezone(props.modelValue[0], format) || '';
    const endDate = formatDateWithTimezone(props.modelValue[1], format) || '';
    return `${startDate} ~ ${endDate}`;
  }
  return '-';
});

/**  複選框相關 **/
const selectedCheckboxGroupLabels = computed(() => {
  const selected = Array.isArray(props.modelValue) ? props.modelValue : [];
  return props.options.filter((item) => selected.includes(item[props.valueKey])).map((item) => item[props.labelKey]);
});

/** 單選按鈕相關 **/
const handleRadioChange = (value) => {
  const newValue = value ? props.trueLabel : props.falseLabel;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  emit('validate');
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
}; //單選框-點擊觸發
const selectedRadioLabel = computed(() => {
  const found = props.options.find((opt) => opt.value === props.modelValue);
  return found ? found.name || found.label : '';
}); //單選按鈕組-取值

/** 成員選擇相關 **/
const displayedTags = computed(() => {
  if (!Array.isArray(modelValueProxy.value)) return [];
  if (!props.maxTagCount || modelValueProxy.value.length <= props.maxTagCount) {
    return modelValueProxy.value;
  }
  return modelValueProxy.value.slice(0, props.maxTagCount);
}); //計算要顯示的標籤
const hasMoreTags = computed(() => {
  return props.maxTagCount > 0 && Array.isArray(modelValueProxy.value) && modelValueProxy.value.length > props.maxTagCount;
}); //是否還有更多標籤沒有顯示
const attendeesModal = ref(false);
const isHovered = ref(false);
const showClearButton = computed(() => {
  return Array.isArray(modelValueProxy.value) && modelValueProxy.value.length > 0 && isHovered.value;
});
const handleMouseEnter = () => {
  if (Array.isArray(modelValueProxy.value) && modelValueProxy.value.length > 0) {
    isHovered.value = true;
  }
};
const handleMouseLeave = () => {
  isHovered.value = false;
};
const openAttendeesModal = () => {
  attendeesModal.value = true;
};
const handleAttendeesConfirm = (selectedAttendees) => {
  modelValueProxy.value = selectedAttendees;
  emit('change', selectedAttendees);
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
  attendeesModal.value = false;
};
const handleUserRemove = (item) => {
  modelValueProxy.value = modelValueProxy.value.filter((user) => user.id !== item.id);
  emit('change', modelValueProxy.value);
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
};
const handleUserRemoveAll = () => {
  modelValueProxy.value = [];
  isHovered.value = false;
  emit('change', []);
  eventHandlers.value?.onChange?.(); //Arco 驗證表單通知
};

const inputRef = ref(null);
const selectRef = ref(null);
const numberRef = ref(null);
const checkboxRef = ref(null);
const datePickerRef = ref(null);
const checkboxGroupRef = ref(null);
const radioRef = ref(null);
const radioGroupRef = ref(null);
const textareaRef = ref(null);

defineExpose({
  inputRef,
  selectRef,
  numberRef,
  checkboxRef,
  datePickerRef,
  checkboxGroupRef,
  radioRef,
  radioGroupRef,
  textareaRef,
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
