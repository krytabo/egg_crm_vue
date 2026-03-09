<!-- src/pages/inventory-reports/components/InventoryTransferTab.vue 庫存調撥 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 篩選區塊 -->
    <div class="flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
      <AForm layout="vertical">
        <div class="flex gap-2">
          <AFormItem :label="t('transactionDate', '異動日期')">
            <div class="flex items-center gap-2">
              <TinyDatePicker v-model="filters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
              <span>-</span>
              <TinyDatePicker v-model="filters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
            </div>
          </AFormItem>
          <AFormItem :label="t('location', '位置')">
            <InfiniteSelect v-model="filters.location" dataSource="InventoryLocations" type="outline" :placeholder="t('all', '全部')" allowClear @change="handleFiltersChange" />
          </AFormItem>
        </div>
      </AForm>
    </div>

    <!-- 調撥記錄列表 -->
    <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" row-key="id">
      <!--<CustomTinyGridColumn field="id" :title="t('id', 'ID')" width="80" />-->
      <CustomTinyGridColumn field="productName" :title="t('product', '商品')" min-width="220" fixed="left" />
      <CustomTinyGridColumn field="type" :title="t('transactionType', '異動類型')" width="100">
        <template #default="{ row }">
          <TinyBadge :type="row.type === 'TRANSFER_IN' ? 'success' : 'warning'">
            {{ row.type === "TRANSFER_IN" ? t("transferIn", "調撥入") : t("transferOut", "調撥出") }}
          </TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="fromLocation" :title="t('fromLocation', '來源位置')" width="120" />
      <CustomTinyGridColumn field="toLocation" :title="t('toLocation', '目標位置')" width="120" />
      <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="100" align="right">
        <template #default="{ row }">
          <span :class="row.type === 'TRANSFER_IN' ? 'text-green-600' : 'text-orange-600'">{{ row.type === "TRANSFER_IN" ? "+" : "-" }}{{ Math.abs(row.quantity) }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="notes" :title="t('notes', '備註')" min-width="150" />
      <CustomTinyGridColumn field="createdAt" :title="t('createdAt', '建立時間')" width="160" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort" />
      <CustomTinyGridColumn field="createdBy" :title="t('operator', '操作人員')" width="120" fiexd="right" />
    </CustomTinyGrid>
    <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
  </div>

  <!-- 新增調撥彈窗 -->
  <a-modal v-model:visible="transferDialogVisible" :title="t('newTransfer', '新增調撥')" width="1300px" :mask-closable="false">
    <div class="grid grid-cols-3 gap-4 h-[calc(100vh-300px)]">
      <!-- 左側：調撥基本資訊 -->
      <perfect-scrollbar class="flex-1 pr-4">
        <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
          <AFormItem :label="t('fromLocation', '來源位置')" field="fromLocation">
            <InfiniteSelect v-model="basicForm.fromLocation" dataSource="InventoryLocations" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>

          <AFormItem :label="t('toLocation', '目標位置')" field="toLocation">
            <InfiniteSelect v-model="basicForm.toLocation" dataSource="InventoryLocations" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>

          <AFormItem :label="t('notes', '備註')">
            <CustomField v-model="basicForm.notes" type="textarea" :placeholder="t('pleaseEnterNotes', '請輸入備註')" />
          </AFormItem>
        </AForm>
      </perfect-scrollbar>

      <!-- 右側：商品選擇表格 -->
      <div class="col-span-2 border-l border-gray-200 pl-4">
        <h3 class="mb-3 text-sm font-semibold">{{ t('selectProducts', '選擇商品') }}</h3>
        <ProductSelectionTable
          ref="productSelectionTableRef"
          v-model="basicForm.items"
          :visible-columns="['name', 'unit', 'tags', 'primaryVendor']"
          :show-unit-price="false"
          :readonly="false"
          :page-size="20"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="transferDialogVisible = false">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :disabled="isSaving || basicForm.items.length === 0" :loading="isSaving" @click="handleSubmit">
          {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue';
import { InventoryMovementsGet, InventoryTransferPost } from '@/assets/API/Inventory';
import { TinyBadge, TinyDatePicker } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';
import { endOfDay } from 'date-fns';
import { debounce } from 'lodash';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const systemStore = useSystemStore();
const { t } = useI18n();

/** 常數相關 **/
const EMPTY_PLACEHOLDER = '—';

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

/** 列表資料 **/
const responseDataToList = (item = {}) => ({
  id: item.id,
  type: item.type,
  productName: item.product?.name || item.productId || EMPTY_PLACEHOLDER,
  fromLocation: item.locationFrom || EMPTY_PLACEHOLDER,
  toLocation: item.locationTo || EMPTY_PLACEHOLDER,
  quantity: item.quantity,
  notes: item.notes || EMPTY_PLACEHOLDER,
  createdAt: timezoneStore.formatDate(item.createdAt) || EMPTY_PLACEHOLDER,
  createdBy: item.createdBy?.name || EMPTY_PLACEHOLDER,
  raw: item
}); //結果轉換
const defaultFilters = {
  startDate: '',
  endDate: '',
  location: ''
};
const wrappedTransferMovementsGet = (params) => {
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
const getListFromResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const payload = responseData?.data ?? responseData ?? {};
  let items = payload?.data ?? payload?.items ?? [];
  if (!Array.isArray(items)) items = [];
  //只保留調撥相關的異動記錄
  const filteredItems = items.filter((item) => ['TRANSFER_IN', 'TRANSFER_OUT'].includes(item.type));
  const meta = payload?.meta ?? payload?.pagination ?? {};
  return { items: filteredItems, meta };
}; //自訂資料處理：過濾只保留調撥記錄
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(wrappedTransferMovementsGet, defaultFilters, {
  getListFromResponse,
  responseDataToList
});
const getAPI = () => getDefaultAPI(); //取得列表資料

/** 新增調撥 **/
const transferDialogVisible = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const productSelectionTableRef = ref(null);
const initializeForm = () => ({
  fromLocation: '',
  toLocation: '',
  items: [],
  notes: ''
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  fromLocation: [{ required: true, message: t('required', '此欄位必填') }],
  toLocation: [
    { required: true, message: t('required', '此欄位必填') },
    {
      validator: (value, callback) => {
        if (value === basicForm.value.fromLocation) {
          callback(t('sameLocationError', '來源位置與目標位置不可相同'));
        } else {
          callback();
        }
      }
    }
  ]
};
const openTransferDialog = () => {
  basicForm.value = initializeForm();
  transferDialogVisible.value = true;
}; //開啟新增調撥對話框
const preparePayload = () => {
  // 準備批量調撥資料
  const items = basicForm.value.items.filter((item) => item.quantity > 0).map((item) => ({
    productId: typeof item.productId === 'object' ? item.productId.id : item.productId,
    quantity: Number(item.quantity),
  }));
  
  return {
    transactionType: 'TRANSFER',
    items,
    fromLocation: typeof basicForm.value.fromLocation === 'object' ? basicForm.value.fromLocation.value : basicForm.value.fromLocation,
    toLocation: typeof basicForm.value.toLocation === 'object' ? basicForm.value.toLocation.value : basicForm.value.toLocation,
    ...(basicForm.value.notes && { notes: basicForm.value.notes }),
  };
}; //準備送出資料
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
    const payload = preparePayload();
    
    // 使用批量 API 一次提交所有商品
    await InventoryTransferPost(payload);

    await mainStore.SWAL_Success(t('transferSuccess', '調撥成功'));
    transferDialogVisible.value = false;
    await getAPI(); //重新載入列表
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
  () => transferDialogVisible.value,
  async (newVal) => {
    if (newVal && productSelectionTableRef.value) {
      await productSelectionTableRef.value.loadProducts();
    }
  }
); //當對話框打開時加載商品列表

defineExpose({
  openTransferDialog,
  clearFilter,
  getAPI
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await getAPI();

  /** Table高度相關 **/
  await nextTick();
  systemStore.updateTableHeight(440); //修改table高度
});
</script>
