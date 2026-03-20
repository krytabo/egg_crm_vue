<!-- src/pages/inventory-reports/components/InventoryMovementsTab.vue 異動記錄 -->
<template>
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         篩選區塊         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <CustomForm :col="1">
    <CustomFormItem :label="t('transactionDate', '異動日期')">
      <div class="flex items-center gap-2">
        <TinyDatePicker v-model="filters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
        <span>-</span>
        <TinyDatePicker v-model="filters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
      </div>
    </CustomFormItem>
  </CustomForm>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--          列表            -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
    <CustomTinyGridColumn field="productName" :title="t('product', '商品')" min-width="200" fixed="left" />
    <!--<CustomTinyGridColumn field="id" :title="t('id', 'ID')" width="200" />-->
    <CustomTinyGridColumn field="type" :title="t('transactionType', '異動類型')" width="160">
      <template #header>
        <div class="flex flex-col gap-1">
          <span class="text-[16px] text-[#111827]">{{ t('transactionType', '異動類型') }}</span>
          <TinySelect v-model="filters.type" :options="typeOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
        </div>
      </template>
      <template #default="{ row }">
        <TinyBadge :type="getTypeColor(row.type)">{{ getTypeLabel(row.type) }}</TinyBadge>
      </template>
    </CustomTinyGridColumn>
    <CustomTinyGridColumn field="location" :title="t('location', '位置')" width="120" />
    <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="100" align="right">
      <template #default="{ row }">
        <span :class="row.quantity > 0 ? 'text-green-600' : 'text-red-600'">{{ row.quantity > 0 ? '+' : '' }}{{ row.quantity }}</span>
      </template>
    </CustomTinyGridColumn>
    <CustomTinyGridColumn field="reason" :title="t('reason', '原因')" min-width="150" />
    <CustomTinyGridColumn field="createdAt" :title="t('createdAt', '建立時間')" width="160" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort" />
    <CustomTinyGridColumn field="createdBy" :title="t('operator', '操作人員')" width="120" fixed="right">
      <template #default="{ row }">{{ row.createdBy?.name }}</template>
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

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--          彈窗            -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!-- 新增異動彈窗 -->
  <a-modal v-model:visible="createDialogVisible" :title="t('addTransaction', '新增異動')" :width="1300" :maskClosable="false" :closable="false" :fullscreen="fullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">
          {{ t('addTransaction', '新增異動') }}
        </div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>

    <div :class="['grid grid-cols-3 gap-4', fullscreen ? 'h-[calc(100vh-165px)]' : 'h-[calc(100vh-270px)]']">
      <!-- 左側：異動基本資訊 -->
      <perfect-scrollbar class="flex-1 pr-4">
        <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
          <AFormItem :label="t('transactionType', '異動類型')" field="transactionType">
            <CustomField v-model="basicForm.transactionType" type="select" :options="formTypeOptions" />
          </AFormItem>
          <!-- 調撥類型：來源/目標位置 -->
          <template v-if="basicForm.transactionType === 'TRANSFER'">
            <AFormItem :label="t('fromLocation', '來源位置')" field="fromLocation">
              <a-select v-model="basicForm.fromLocation" :placeholder="t('pleaseSelect', '請選擇')" allow-create>
                <a-option v-for="item in locationOption" :key="item" :label="item" :value="item" />
              </a-select>
            </AFormItem>
            <AFormItem :label="t('toLocation', '目標位置')" field="toLocation">
              <a-select v-model="basicForm.toLocation" :placeholder="t('pleaseSelect', '請選擇')" allow-create>
                <a-option v-for="item in locationOption" :key="item" :label="item" :value="item" />
              </a-select>
            </AFormItem>
          </template>
          <!-- 其他類型：單一存放位置 -->
          <AFormItem v-else :label="t('location', '存放位置')" field="location">
            <a-select v-model="basicForm.location" :placeholder="t('pleaseSelect', '請選擇')" allow-create>
              <a-option v-for="item in locationOption" :key="item" :label="item" :value="item" />
            </a-select>
          </AFormItem>
          <template v-if="basicForm.transactionType === 'STOCK_IN'">
            <AFormItem :label="t('unitCostAmount', '單位成本')" field="unitCostAmount">
              <CustomField v-model="basicForm.unitCostAmount" type="number" :min="0" />
            </AFormItem>
          </template>
          <AFormItem :label="t('reason', basicForm.transactionType === 'ADJUSTMENT' ? '調整原因（必填）' : '原因')" :required="basicForm.transactionType === 'ADJUSTMENT'">
            <CustomField v-model="basicForm.reason" type="input" />
          </AFormItem>
          <AFormItem :label="t('notes', '備註')">
            <CustomField v-model="basicForm.notes" type="textarea" />
          </AFormItem>
        </AForm>
      </perfect-scrollbar>

      <!-- 右側：商品選擇表格 -->
      <div class="col-span-2 border-l border-gray-200 pl-4">
        <h3 class="mb-3 text-sm font-semibold">{{ t('selectProducts', '選擇商品') }}</h3>
        <ProductSelectionTable
          ref="productSelectionTableRef"
          v-model="basicForm.items"
          :visibleColumns="['name', 'unit', 'tags', 'primaryVendor']"
          :showUnitPrice="false"
          :readonly="false"
          :pageSize="20"
          :extraColumns="extraColumns"
          :fullscreen="fullscreen"
          :quantityTitle="quantityTitle"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="createDialogVisible = false">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :disabled="isSaving || basicForm.items.length === 0" :loading="isSaving" @click="handleSubmit">
          {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue';
import { InventoryMovementsGet, InventoryBulkUploadPost, InventoryBulkStockOutPost, InventoryBulkTransferPost, InventoryBulkAdjustmentPost, InventoryLocationsGet } from '@/assets/API/Inventory';
import { TinySelect, TinyBadge, TinyDatePicker } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';
import CustomField from '@/components/Form/CustomField.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';
import { endOfDay } from 'date-fns';
import { debounce } from 'lodash';
import { Expand, Shrink } from 'lucide-vue-next';

const systemStore = useSystemStore();
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const { t } = useI18n();

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 340, 100));

const fullscreen = ref(false);

/** 選單相關 **/
const typeOptions = [
  { label: t('all', '全部'), value: 'all' },
  { label: t('stockIn', '入庫'), value: 'PURCHASE' },
  { label: t('stockOut', '出庫'), value: 'SALE' },
  { label: t('transferIn', '調撥入'), value: 'TRANSFER_IN' },
  { label: t('transferOut', '調撥出'), value: 'TRANSFER_OUT' },
  { label: t('adjustmentIn', '調整入'), value: 'ADJUSTMENT_IN' },
  { label: t('adjustmentOut', '調整出'), value: 'ADJUSTMENT_OUT' },
];
const formTypeOptions = [
  { label: t('stockIn', '入庫'), value: 'STOCK_IN' },
  { label: t('stockOut', '出庫'), value: 'STOCK_OUT' },
  { label: t('transfer', '調撥'), value: 'TRANSFER' },
  { label: t('adjustment', '調整'), value: 'ADJUSTMENT' },
];
const locationOption = ref([]);
const getTypeLabel = (type) => {
  const map = {
    PURCHASE: t('stockIn', '入庫'),
    SALE: t('stockOut', '出庫'),
    TRANSFER_IN: t('transferIn', '調撥入'),
    TRANSFER_OUT: t('transferOut', '調撥出'),
    ADJUSTMENT_IN: t('adjustmentIn', '調整入'),
    ADJUSTMENT_OUT: t('adjustmentOut', '調整出'),
    PRODUCTION: t('production', '生產'),
    WASTE: t('waste', '報廢'),
    RETURN: t('return', '退貨'),
  };
  return map[type] || type;
}; //取得異動類型標籤
const getTypeColor = (type) => {
  if (['PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'PRODUCTION', 'RETURN'].includes(type)) return 'success';
  return 'warning';
}; //取得異動類型顏色
const getOption = async () => {
  try {
    const response = await InventoryLocationsGet();
    locationOption.value = response?.data?.data || response?.data?.items || response?.data || [];
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //取存存放位置

/** 列表資料 **/
const responseDataToList = (item = {}) => ({
  id: item.id,
  type: item.type,
  productName: item.product?.name || item.productId,
  location: item.locationTo || '—',
  quantity: item.quantity,
  reason: item.reason || '—',
  createdAt: timezoneStore.formatDate(item.createdAt),
  createdBy: item.createdBy || '—',
  raw: item,
}); //結果轉換
const defaultFilters = {
  type: 'all',
  startDate: '',
  endDate: '',
};

/** 排序相關 **/
const sortField = ref('createdAt'); //排序欄位
const sortDirection = ref(null); //排序方向
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ''); //取得欄位排序狀態
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = 'createdAt';
    sortDirection.value = null;
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getDefaultAPI();
}; //切換排序

const wrappedInventoryMovementsGet = (params) => {
  const processedParams = { ...params };
  if (processedParams.endDate) {
    processedParams.endDate = endOfDay(new Date(processedParams.endDate));
  }
  //排序參數
  if (sortField.value && sortDirection.value) {
    processedParams.sortBy = sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }
  return InventoryMovementsGet(processedParams);
}; //包裝 API 處理日期與排序
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedInventoryMovementsGet,
  defaultFilters,
  {
    responseDataToList,
  },
);
const getAPI = () => getDefaultAPI(); //取得列表資料

/** 新增異動 **/
const createDialogVisible = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const productSelectionTableRef = ref(null);
const extraColumns = computed(() => {
  if (basicForm.value.transactionType === 'STOCK_IN') {
    return [
      {
        key: 'batchNumber',
        title: t('batchNumber', '批號'),
        width: 120,
        type: 'input',
        align: 'center',
        fixed: 'right',
        editable: true,
      },
      {
        key: 'expiryDate',
        title: t('expiryDate', '到期日'),
        width: 150,
        type: 'date-picker',
        align: 'center',
        fixed: 'right',
        editable: true,
      },
    ];
  }
  return [];
}); //各異動類型的自訂欄位

const quantityTitle = computed(() => {
  if (basicForm.value.transactionType === 'ADJUSTMENT') return t('newQuantity', '調整後數量');
  return null;
}); //數量欄位標題（ADJUSTMENT 改為「調整後數量」）
const initializeForm = () => ({
  transactionType: 'STOCK_IN',
  items: [],
  location: 'MAIN_WAREHOUSE',
  fromLocation: 'MAIN_WAREHOUSE',
  toLocation: '',
  unitCostAmount: '',
  reason: '',
  notes: '',
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = computed(() => ({
  transactionType: [{ required: true, message: t('required', '此欄位必填') }],
  ...(basicForm.value.transactionType !== 'TRANSFER'
    ? { location: [{ required: true, message: t('required', '此欄位必填') }] }
    : {
        fromLocation: [{ required: true, message: t('required', '此欄位必填') }],
        toLocation: [{ required: true, message: t('required', '此欄位必填') }],
      }),
}));
const openCreateDialog = async (product = null) => {
  basicForm.value = initializeForm();
  basicForm.value.transactionType = 'STOCK_IN';
  basicForm.value.location = 'MAIN_WAREHOUSE';

  // 如果有傳入產品物件，預先添加到商品清單
  if (product) {
    basicForm.value.items = [
      {
        productId: product.id || product,
        quantity: product.suggestedQuantity || 1,
        product: product,
      },
    ];
  }

  createDialogVisible.value = true;
  await nextTick();
  formRef.value?.clearValidate();
}; //開啟新增異動對話框（可帶入產品物件）

const preparePayload = null; // 已移至 _saveForm 各類型分支

const _saveForm = async () => {
  const validateResult = await formRef.value?.validate();
  if (validateResult) return;

  // 驗證是否有選中商品
  if (!basicForm.value.items || basicForm.value.items.length === 0) {
    await mainStore.SWAL_Error(new Error(t('pleaseSelectProduct', '請選擇至少一個商品')));
    return;
  }

  mainStore.setLoading(true);
  isSaving.value = true;
  try {
    const form = basicForm.value;
    const transactionType = form.transactionType;
    const getProductId = (item) => (typeof item.productId === 'object' ? item.productId.id : item.productId);

    if (transactionType === 'STOCK_IN') {
      const payload = {
        items: form.items.map((item) => ({
          productId: getProductId(item),
          quantity: Number(item.quantity),
          ...(item.batchNumber && { batchNumber: item.batchNumber }),
          ...(item.expiryDate && { expiryDate: item.expiryDate }),
          ...(form.unitCostAmount && { unitCostAmount: Number(form.unitCostAmount) }),
        })),
        location: form.location,
        ...(form.reason && { reason: form.reason }),
        ...(form.notes && { notes: form.notes }),
      };
      await InventoryBulkUploadPost(payload);
    } else if (transactionType === 'STOCK_OUT') {
      const payload = {
        items: form.items.map((item) => ({
          productId: getProductId(item),
          quantity: Number(item.quantity),
        })),
        location: form.location,
        ...(form.reason && { reason: form.reason }),
        ...(form.notes && { notes: form.notes }),
      };
      await InventoryBulkStockOutPost(payload);
    } else if (transactionType === 'TRANSFER') {
      const payload = {
        items: form.items.map((item) => ({
          productId: getProductId(item),
          quantity: Number(item.quantity),
        })),
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        ...(form.reason && { reason: form.reason }),
        ...(form.notes && { notes: form.notes }),
      };
      await InventoryBulkTransferPost(payload);
    } else if (transactionType === 'ADJUSTMENT') {
      const payload = {
        items: form.items.map((item) => ({
          productId: getProductId(item),
          newQuantity: Number(item.quantity),
          location: form.location,
          reason: form.reason || t('adjustment', '調整'),
          ...(item.notes && { notes: item.notes }),
        })),
        location: form.location,
        ...(form.reason && { reason: form.reason }),
        ...(form.notes && { notes: form.notes }),
      };
      await InventoryBulkAdjustmentPost(payload);
    }

    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    createDialogVisible.value = false;
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
    isSaving.value = false;
  }
}; //儲存
const handleSubmit = debounce(_saveForm, 300, { leading: true, trailing: false }); //編輯儲存-防抖

// 監聽對話框打開，自動加載商品列表
watch(
  () => createDialogVisible.value,
  async (newVal) => {
    if (newVal && productSelectionTableRef.value) {
      await productSelectionTableRef.value.loadProducts();
    }
  },
); //當對話框打開時加載商品列表

// 監聽異動類型變更，更新自訂欄位
watch(
  () => basicForm.value.transactionType,
  (newVal) => {
    // transactionType 變更時，extraColumns 會自動更新（因為是計算屬性）
    // 同時清除非 STOCK_IN 類型的自訂欄位數據
    if (newVal !== 'STOCK_IN') {
      basicForm.value.items = basicForm.value.items.map((item) => {
        const { batchNumber, expiryDate, ...rest } = item;
        return rest;
      });
    }
  },
); //當異動類型變更時更新自訂欄位

defineExpose({
  openCreateDialog,
  clearFilter,
  getAPI,
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await Promise.all([getAPI(), getOption()]);
});
</script>
