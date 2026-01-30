<!-- src/components/Form/InfiniteSelect.vue 通用無限捲動選擇器 -->
<template>
  <div class="relative w-full" ref="triggerRef">
    <button
      v-if="!props.readonly"
      type="button"
      class="infinite-select-trigger"
      :class="['type-' + type, { 'is-open': isOpen, disabled }]"
      :disabled="disabled"
      @click="toggleDropdown"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div class="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
        <template v-if="selectedDisplay.length">
          <template v-for="tag in visibleTags" :key="tag.value">
            <span v-if="props.multiple" class="tag-chip">{{ tag.label }}</span>
            <p v-else class="truncate">{{ tag.label }}</p>
          </template>
          <span v-if="exceedCount > 0" class="tag-chip">+{{ exceedCount }}</span>
        </template>

        <span v-else class="placeholder truncate">{{ placeholder }}</span>
      </div>

      <button v-if="selectedDisplay.length && allowClear && isHovered && !disabled" class="clear-btn ml-auto shrink-0" @click.stop="clearSelection">
        <X class="size-4" />
      </button>

      <ChevronDown v-else class="size-4.5 shrink-0 fill-none! text-base text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': isOpen }" />
    </button>
    <div v-if="props.readonly">
      <template v-if="selectedDisplay.length">
        <template v-for="tag in visibleTags" :key="tag.value">
          <span v-if="props.multiple" class="tag-chip">{{ tag.label }}</span>
          <p v-else class="truncate">{{ tag.label }}</p>
        </template>
        <span v-if="exceedCount > 0" class="tag-chip">+{{ exceedCount }}</span>
      </template>
    </div>

    <teleport to="body">
      <div v-if="isOpen" class="infinite-select-dropdown" :style="dropdownStyle" ref="dropdownRef">
        <div class="border-b p-2" v-if="allowSearch">
          <input v-model="searchTerm" type="text" class="search-input" placeholder="輸入關鍵字搜尋" />
        </div>
        <div class="options-container" ref="listRef" @scroll="handleScroll">
          <template v-if="options.length">
            <div v-for="option in options" :key="option.value" class="option-row" :class="{ selected: isSelected(option.value) }" @click="toggleValue(option)">
              <i class="ri-check-line mr-2" v-if="isSelected(option.value)"></i>
              <span class="flex-1 truncate">{{ option.label }}</span>
            </div>
          </template>
          <div v-else-if="!loading" class="py-6 text-center text-sm text-gray-400">查無資料</div>
          <div v-if="loading" class="py-4 text-center text-sm text-gray-500">
            <i class="ri-loader-4-line animate-spin"></i>
            <span class="ml-2">載入中...</span>
          </div>
          <div v-else-if="!hasMore && options.length" class="py-2 text-center text-xs text-gray-400">沒有更多資料</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { PermissionListGet } from '@/assets/API/Permission';
import { RoleListGet } from '@/assets/API/Role';
import { UserListGet } from '@/assets/API/User';
import { ProductTypeListGet } from '@/assets/API/ProductType';
import { VendorListGet } from '@/assets/API/Vendor';
import { CustomersListGet } from '@/assets/API/Customers';
import { ProductListGet } from '@/assets/API/Product';
import { InventoryLocationsGet } from '@/assets/API/Inventory';
import { DriverListGet } from '@/assets/API/Drivers';
import { X, ChevronDown } from 'lucide-vue-next';
import { DeliveryByDaysGet } from '@/assets/API/DeliveryReports';

const props = defineProps({
  modelValue: {
    type: [Array, String, Number, Object, null],
    default: null,
  },
  dataSource: {
    type: String,
    default: '',
  },
  fetcher: {
    type: Function,
    default: null,
  },
  valueKey: {
    type: String,
    default: 'id',
  },
  labelKey: {
    type: String,
    default: 'name',
  },
  optionFormatter: {
    type: Function,
    default: null,
  },
  placeholder: {
    type: String,
    default: '請選擇',
  },
  limit: {
    type: Number,
    default: 20,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  allowClear: {
    type: Boolean,
    default: false,
  },
  allowSearch: {
    type: Boolean,
    default: true,
  },
  maxTagCount: {
    type: Number,
    default: 5,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  emitValue: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'default', // default: 灰底樣式；可傳入 'outline' 使用白底樣式
  },
});
const emit = defineEmits(['update:modelValue', 'change']);

/** 權限名稱對應相關 **/
const RESOURCE_LABELS = {
  USER: '使用者管理',
  ROLE: '角色管理',
  CUSTOMER: '客戶管理',
  ORDER: '訂單管理',
  PRODUCT: '產品管理',
  INVENTORY: '庫存管理',
  BILLING: '帳務管理',
  VENDOR: '供應商管理',
  VEHICLE: '車輛管理',
  DRIVER: '司機管理',
  REPORT: '報表管理',
  FILE: '檔案管理',
  NOTIFICATION: '通知管理',
  KPI: 'KPI 儀表板',
};
const ACTION_LABELS = {
  CREATE: '新增資料',
  READ: '讀取 / 查詢資料',
  UPDATE: '更新 / 修改資料',
  DELETE: '刪除資料',
  EXPORT: '匯出資料',
  IMPORT: '匯入資料',
};
const DATA_SOURCE_MAP = {
  permissions: {
    api: PermissionListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: `${RESOURCE_LABELS[item.resource] || item.resource}:${ACTION_LABELS[item.action] || item.action}`,
      raw: item,
    }),
  }, //權限
  roles: {
    api: RoleListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: item.name || item.description,
      raw: item,
    }),
  }, //角色
  users: {
    api: UserListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: `${item.fullName || item.username || item.email || item.id}`.trim(),
      raw: item,
    }),
  }, //使用者
  drivers: {
    api: DriverListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: `${item.fullName || item.username || item.email || item.id}`.trim(),
      raw: item,
    }),
  }, //司機
  productTypes: {
    api: ProductTypeListGet,
    valueKey: 'code',
    formatOption: (item) => ({
      value: item.code,
      label: item.name || item.code,
      raw: item,
    }),
  }, //產品類型
  InventoryLocations: {
    api: InventoryLocationsGet,
    valueKey: 'code',
    formatOption: (item) => {
      if (typeof item === 'string') {
        return { value: item, label: item, raw: item };
      }
      return {
        value: item.code,
        label: item.name || item.code,
        raw: item,
      };
    },
  }, //存放位置-倉庫
  vendors: {
    api: VendorListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: item.name || item.code || item.id,
      raw: item,
    }),
  }, //廠商
  customers: {
    api: CustomersListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: item.name || item.code || item.id,
      raw: item,
    }),
  }, //客戶
  DeliveryCustomers: {
    api: DeliveryByDaysGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: item.name || item.code || item.id,
      raw: item,
    }),
  }, //依出貨日期尋找廠商或客戶
  products: {
    api: ProductListGet,
    valueKey: 'id',
    formatOption: (item) => ({
      value: item.id,
      label: item.name || item.code || item.id,
      raw: item,
    }),
  }, //產品
}; //選單API

/** 基本資料 **/
const isHovered = ref(false);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const listRef = ref(null);
const isOpen = ref(false);
const options = ref([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const hasMore = ref(true);
const searchTerm = ref('');
let searchTimer = null;
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' });
const valueLabelMap = ref(new Map());

const resolvedConfig = computed(() => {
  if (typeof props.fetcher === 'function') {
    return { fetcher: props.fetcher };
  }
  if (props.dataSource && DATA_SOURCE_MAP[props.dataSource]) {
    const config = DATA_SOURCE_MAP[props.dataSource];
    return {
      fetcher: async ({ page, limit, search, filters }) => {
        const params = { page, limit, ...filters };
        if (search) params.search = search;
        return config.api(params);
      },
      valueKey: config.valueKey,
      formatOption: config.formatOption,
    };
  }
  return { fetcher: null };
});
const resolvedValueKey = computed(() => props.valueKey || resolvedConfig.value.valueKey || 'value');
const resolvedLabelKey = computed(() => props.labelKey || 'label');
const isMultiple = computed(() => props.multiple === true);

const formatOption = (item) => {
  if (props.optionFormatter) return props.optionFormatter(item);
  if (resolvedConfig.value.formatOption) return resolvedConfig.value.formatOption(item);
  return {
    value: item?.[resolvedValueKey.value],
    label: item?.[resolvedLabelKey.value] ?? item?.[resolvedValueKey.value],
    raw: item,
  };
}; //顯示格式化
const extractValue = (item) => {
  if (item === null || item === undefined) return item;
  if (typeof item === 'object') return item[resolvedValueKey.value];
  return item;
}; //label欄位
const guessLabel = (item) => {
  if (item === null || item === undefined) return '';
  if (typeof item === 'object') {
    return item[resolvedLabelKey.value] || item.label || item.name || String(item[resolvedValueKey.value] ?? '');
  }
  return String(item);
}; //value欄位
const selectedValues = computed(() => {
  if (isMultiple.value) return Array.isArray(props.modelValue) ? props.modelValue : [];
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return [];
  return [props.modelValue];
});
const type = computed(() => props.type || 'default');

const selectedDisplay = computed(() =>
  selectedValues.value.map((value) => {
    const optionValue = extractValue(value);
    return {
      value: optionValue,
      label: valueLabelMap.value.get(optionValue) || guessLabel(value) || String(optionValue),
    };
  }),
);
const visibleTags = computed(() => {
  if (!isMultiple.value) return selectedDisplay.value.slice(0, 1);
  if (props.maxTagCount <= 0) return selectedDisplay.value;
  return selectedDisplay.value.slice(0, props.maxTagCount);
});
const exceedCount = computed(() => {
  if (!isMultiple.value || props.maxTagCount <= 0) return 0;
  return Math.max(0, selectedDisplay.value.length - props.maxTagCount);
});

/** 選單相關 **/
const toggleDropdown = async () => {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
    return;
  }
  await openDropdown();
}; //開關選單
const openDropdown = async () => {
  isOpen.value = true;
  await nextTick();
  updateDropdownPosition();
  if (!options.value.length) await getAPI(1, false);
  document.addEventListener('mousedown', handleOutsideClick);
}; //開啟選單
const closeDropdown = () => {
  isOpen.value = false;
  document.removeEventListener('mousedown', handleOutsideClick);
}; //關閉選單
const handleOutsideClick = (event) => {
  if (dropdownRef.value?.contains(event.target) || triggerRef.value?.contains(event.target)) return;
  closeDropdown();
}; //點擊範圍外
const updateDropdownPosition = () => {
  const rect = triggerRef.value?.getBoundingClientRect();
  if (!rect) return;
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
};

/** 取得資料相關 **/
const normalizeResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const total = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total };
};
const getAPI = async (targetPage = 1, append = false) => {
  if (loading.value) return;
  const fetcher = resolvedConfig.value.fetcher;
  if (!fetcher) return;
  loading.value = true;
  try {
    const { data, total: totalCount } = normalizeResponse(
      await fetcher({
        page: targetPage,
        limit: props.limit,
        search: searchTerm.value.trim() || undefined,
        filters: props.filters,
      }),
    );
    const formatted = data.map((item) => formatOption(item)).filter((item) => item?.value !== undefined && item?.value !== null);
    formatted.forEach((item) => valueLabelMap.value.set(item.value, item.label));
    total.value = totalCount;
    if (append) {
      const merged = [...options.value];
      formatted.forEach((option) => {
        if (!merged.some((opt) => opt.value === option.value)) merged.push(option);
      });
      options.value = merged;
    } else {
      options.value = formatted;
      page.value = 1;
    }
    hasMore.value = options.value.length < total.value;
    page.value = targetPage + 1;
  } catch (error) {
    console.error('InfiniteSelect fetch error', error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
}; //取得資料
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  await getAPI(page.value, true);
}; //取得更多
const handleScroll = (event) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  if (scrollTop + clientHeight >= scrollHeight - 24) loadMore();
}; //捲動
const handleSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    getAPI(1, false);
  }, 250);
}; //搜尋抖動
watch(searchTerm, () => {
  if (!isOpen.value) return;
  handleSearchDebounced();
});
watch(
  () => props.filters,
  () => {
    options.value = [];
    page.value = 1;
    hasMore.value = true;
    if (isOpen.value) getAPI(1, false);
  },
  { deep: true },
);

const isSelected = (value) => selectedValues.value.some((item) => extractValue(item) === value);
const buildPayload = (option) => (props.emitValue ? option.value : option.raw || option);
const toggleValue = (option) => {
  if (!option || option.value === undefined || option.value === null) return;
  if (isMultiple.value) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    let newValue;
    if (isSelected(option.value)) {
      newValue = currentValue.filter((item) => extractValue(item) !== option.value);
    } else {
      const valueToAdd = buildPayload(option);
      newValue = [...currentValue, valueToAdd];
    }
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    const payload = buildPayload(option);
    emit('update:modelValue', payload);
    emit('change', payload);
    closeDropdown();
  }
};
const clearSelection = () => {
  const cleared = isMultiple.value ? [] : null;
  emit('update:modelValue', cleared);
  emit('change', cleared);
};
watch(
  () => props.modelValue,
  (newValue) => {
    if (isMultiple.value) {
      (Array.isArray(newValue) ? newValue : []).forEach((value) => {
        const extracted = extractValue(value);
        if (extracted === undefined || extracted === null) return;
        if (!valueLabelMap.value.has(extracted)) {
          valueLabelMap.value.set(extracted, guessLabel(value) || String(extracted));
        }
      });
    } else if (newValue !== null && newValue !== undefined && newValue !== '') {
      const extracted = extractValue(newValue);
      if (extracted !== undefined && !valueLabelMap.value.has(extracted)) {
        valueLabelMap.value.set(extracted, guessLabel(newValue) || String(extracted));
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped>
/* 灰底樣式） */
.infinite-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 14px;
  text-align: left;
  transition: border 0.3s ease;
  height: 32px;
  cursor: pointer;
}
.infinite-select-trigger.type-default {
  background: #f2f3f5;
  border-color: #f2f3f5;
}
.infinite-select-trigger.type-default:hover {
  background: #e5e6eb;
}
.infinite-select-trigger.type-default.is-open {
  background: #fff;
  border-color: #165dff;
}

/* 白底樣式 */
.infinite-select-trigger.type-outline {
  background: #fff;
  border-radius: 8px;
  border-color: #c2c2c2;
}
.infinite-select-trigger.type-outline:hover {
  border-color: #000;
}
.infinite-select-trigger.type-outline.is-open {
  border-color: #000;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.1);
}
.infinite-select-trigger.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.placeholder {
  color: #9ca3af;
}
.tag-chip {
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}
.clear-btn {
  margin-left: 4px;
  color: #9ca3af;
}
.clear-btn:hover {
  color: #4b5563;
}
.infinite-select-dropdown {
  position: absolute;
  z-index: 999999;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-height: 360px;
}
.search-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}
.search-input:focus {
  border-color: #2563eb;
  outline: none;
}
.options-container {
  max-height: 300px;
  overflow-y: auto;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}
.option-row:hover {
  background: #f9fafb;
}
.option-row.selected {
  background: #eff6ff;
  color: #1d4ed8;
}
</style>
