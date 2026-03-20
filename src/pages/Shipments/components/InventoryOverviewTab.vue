<!-- src/pages/inventory-reports/components/InventoryOverviewTab.vue 庫存總覽 -->
<template>
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         統計區塊         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <div class="grid grid-cols-4 gap-3 rounded-md bg-[#f5f7fb] p-4">
    <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
      <p class="text-[18px]">{{ t('totalInventoryValue', '庫存總價值') }}</p>
      <p class="text-2xl font-semibold text-gray-900">NT$ {{ formatNumber(summaryData.totalValue) }}</p>
    </div>
    <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
      <p class="text-[18px]">{{ t('lowStockItems', '低庫存項目') }}</p>
      <div class="flex items-end gap-2">
        <p class="text-2xl font-semibold text-orange-600">{{ summaryData.lowStockCount }}</p>
        <p class="text-gray-500">{{ t('items', '項') }}</p>
      </div>
    </div>
    <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
      <p class="text-[18px]">{{ t('outOfStockItems', '缺貨項目') }}</p>
      <div class="flex items-end gap-2">
        <p class="text-2xl font-semibold text-red-600">{{ summaryData.outOfStockCount }}</p>
        <p class="text-gray-500">{{ t('items', '項') }}</p>
      </div>
    </div>
    <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
      <p class="text-[18px]">{{ t('reorderItems', '待補貨項目') }}</p>
      <div class="flex items-end gap-2">
        <p class="text-2xl font-semibold text-blue-600">{{ summaryData.reorderCount }}</p>
        <p class="text-gray-500">{{ t('items', '項') }}</p>
      </div>
    </div>
  </div>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         篩選區塊         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <CustomForm :col="3">
    <CustomFormItem :label="t('keyword', '關鍵字')">
      <TinyInput v-model="filters.search" :placeholder="t('searchProductNameOrCode', '搜尋產品名稱或編號')" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
    </CustomFormItem>
    <CustomFormItem :label="t('location', '存放位置')">
      <InfiniteSelect
        v-model="filters.location"
        dataSource="InventoryLocations"
        :placeholder="t('all', '全部')"
        type="outline"
        allowClear
        :filters="{ status: 'active' }"
        @change="handleFiltersChange"
      />
    </CustomFormItem>
    <CustomFormItem :label="t('stockStatus', '庫存狀態')">
      <TinySelect v-model="filters.stockStatus" :options="stockStatusOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
    </CustomFormItem>
  </CustomForm>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--          列表            -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <CustomTinyGrid :data="basicDataList" :height="TableScrollY" row-key="productId">
    <CustomTinyGridColumn field="productName" :title="t('productName', '產品名稱')" min-width="200" fixed="left" />
    <CustomTinyGridColumn field="productCode" :title="t('productCode', '產品編號')" width="200" />
    <CustomTinyGridColumn field="unit" :title="t('unit', '單位')" width="80" align="center" />
    <CustomTinyGridColumn field="currentStock" :title="t('currentStock', '目前庫存')" width="100" align="right">
      <template #default="{ row }">
        <span :class="getStockClass(row)">{{ row.currentStock }}</span>
      </template>
    </CustomTinyGridColumn>
    <CustomTinyGridColumn field="minStock" :title="t('minStock', '最低庫存')" width="100" align="right" />
    <CustomTinyGridColumn field="maxStock" :title="t('maxStock', '最高庫存')" width="100" align="right" />
    <CustomTinyGridColumn field="reorderPoint" :title="t('reorderPoint', '補貨點')" width="100" align="right" />
    <CustomTinyGridColumn field="costPrice" :title="t('unitCost', '單位成本')" width="120" align="right">
      <template #default="{ row }">NT$ {{ formatNumber(row.costPrice) }}</template>
    </CustomTinyGridColumn>
    <CustomTinyGridColumn field="totalValue" :title="t('totalValue', '庫存總價值')" width="130" align="right">
      <template #default="{ row }">NT$ {{ formatNumber(row.totalValue) }}</template>
    </CustomTinyGridColumn>
    <CustomTinyGridColumn field="updatedAt" :title="t('updatedAt', '更新時間')" width="160" sortable :sort-field="'updatedAt'" :current-order="getColumnOrder('updatedAt')" @sort="handleColumnSort" />
    <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="100" align="center" fixed="right">
      <template #default="{ row }">
        <TinyBadge v-if="row.isOutOfStock" type="danger">{{ t('outOfStock', '缺貨') }}</TinyBadge>
        <TinyBadge v-else-if="row.isLowStock" type="warning">{{ t('lowStock', '低庫存') }}</TinyBadge>
        <TinyBadge v-else type="success">{{ t('normal', '正常') }}</TinyBadge>
      </template>
    </CustomTinyGridColumn>
  </CustomTinyGrid>
  <AppPagination
    class="md:w-auto"
    :current="pagination.page"
    :page-size="pagination.limit"
    :total="pagination.total"
    :page-size-options="pageSizeOptions"
    @change="CurrentChange"
    @page-size-change="SizeChange"
  />
</template>

<script setup>
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue';
import { InventoryListGet, InventoryLowStockGet, InventoryOutOfStockGet, InventoryReorderAlertsGet } from '@/assets/API/Inventory';
import { TinyInput, TinySelect, TinyBadge } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useI18n } from 'vue-i18n';

const systemStore = useSystemStore();
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const { t } = useI18n();

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 460, 100));

const EMPTY_PLACEHOLDER = '—';
const stockStatusOptions = [
  { label: t('all', '全部'), value: 'all' },
  { label: t('lowStock', '低庫存'), value: 'low' },
  { label: t('outOfStock', '缺貨'), value: 'outOfStock' },
  { label: t('normal', '正常'), value: 'normal' },
]; //選單
const formatNumber = (value) => {
  if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
  return Number(value).toLocaleString();
}; // 格式化數字
const getStockClass = (row) => {
  if (row.isOutOfStock) return 'text-red-600 font-semibold';
  if (row.isLowStock) return 'text-orange-600 font-semibold';
  return '';
}; // 取得庫存狀態樣式

/** 排序相關 **/
const sortField = ref('updatedAt'); //排序欄位
const sortDirection = ref(null); //排序方向
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ''); //取得欄位排序狀態
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = 'updatedAt';
    sortDirection.value = null;
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getDefaultAPI();
}; //切換排序

/** 統計數據 **/
const summaryData = reactive({
  totalValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  reorderCount: 0,
});
const loadSummaryData = async () => {
  try {
    const [lowStockRes, outOfStockRes, reorderRes] = await Promise.all([InventoryLowStockGet(), InventoryOutOfStockGet(), InventoryReorderAlertsGet()]);
    // 處理不同的回傳格式
    const getLengthFromResponse = (res) => {
      const data = res?.data?.data || res?.data?.items || res?.data;
      return Array.isArray(data) ? data.length : 0;
    };
    summaryData.lowStockCount = getLengthFromResponse(lowStockRes);
    summaryData.outOfStockCount = getLengthFromResponse(outOfStockRes);
    summaryData.reorderCount = getLengthFromResponse(reorderRes);
  } catch (error) {
    console.error('Failed to load summary data:', error);
  }
}; //載入統計數據

/** 列表資料 **/
const responseDataToList = (item = {}) => ({
  productId: item.productId,
  productCode: item.productCode || EMPTY_PLACEHOLDER,
  productName: item.productName || EMPTY_PLACEHOLDER,
  unit: item.unit || EMPTY_PLACEHOLDER,
  currentStock: item.currentStock ?? 0,
  minStock: item.minStock ?? 0,
  maxStock: item.maxStock ?? 0,
  reorderPoint: item.reorderPoint ?? 0,
  costPrice: item.costPrice?.amount ?? 0,
  totalValue: item.totalValue?.amount ?? 0,
  isLowStock: item.isLowStock ?? false,
  isOutOfStock: item.isOutOfStock ?? false,
  updatedAt: timezoneStore.formatDate(item.updatedAt) || EMPTY_PLACEHOLDER,
  raw: item,
}); //結果轉換
const afterApiCall = (response) => {
  // 計算庫存總價值
  let items = response?.data?.data || response?.data?.items || response?.data || [];
  // 確保 items 是陣列
  if (!Array.isArray(items)) {
    items = [];
  }
  summaryData.totalValue = items.reduce((sum, item) => sum + (item.totalValue?.amount || 0), 0);
}; //API回調後計算總價值
const defaultFilters = {
  search: '',
  location: '',
  stockStatus: 'all',
};
const wrappedInventoryListGet = (params) => {
  const processedParams = { ...params };
  // 處理庫存狀態篩選
  if (processedParams.stockStatus === 'low') {
    processedParams.lowStock = true;
    delete processedParams.outOfStock;
  } else if (processedParams.stockStatus === 'outOfStock') {
    processedParams.outOfStock = true;
    delete processedParams.lowStock;
  }
  delete processedParams.stockStatus;
  //排序參數
  if (sortField.value && sortDirection.value) {
    processedParams.sortBy = sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }
  return InventoryListGet(processedParams);
}; //包裝 API 處理篩選與排序
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedInventoryListGet,
  defaultFilters,
  {
    responseDataToList,
    afterApiCall,
  },
);
const getAPI = async () => {
  await getDefaultAPI();
  await loadSummaryData();
}; //取得列表資料

defineExpose({
  clearFilter,
  getAPI,
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await getAPI();
});
</script>
