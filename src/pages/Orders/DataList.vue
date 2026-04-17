<!-- src/pages/order-management/components/OrderManagementBase.vue 訂單基本頁面 -->
<template>
  <Card ref="containerRef">
    <a-tabs class="flex-1" :active-key="activeKey" @tab-click="toggleActiveKey">
      <a-tab-pane :key="TAB_KEYS.CUSTOMER" :title="t('customer', '客戶')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.VENDOR" :title="t('vendor', '廠商')"></a-tab-pane>

      <template #extra>
        <div class="flex items-center gap-3">
          <TinyInput v-model="filters.search" :placeholder="t('pleaseEnterKeyword', '請輸入關鍵字')" @keyup.enter="handleGlobalSearch" />
          <a-button status="danger" @click="clearFilter">{{ t('clearAllSearch', '清除篩選') }}</a-button>
          <a-button @click="batchPrint"><Printer class="mr-1 size-4" />{{ t('batchPrint', '批次列印') }}</a-button>
          <a-button v-if="categoryCode" @click="batchPrintTriplicate"><Printer class="mr-1 size-4" />{{ t('batchTriplicate', '批次三聯單') }}</a-button>
          <a-button v-if="permissionStore.hasPermission('ORDER', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addOrder', '新增訂單') }}</a-button>
        </div>
      </template>
    </a-tabs>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         篩選區塊         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="1">
      <CustomFormItem :label="t('orderDate', '訂單日期')">
        <div class="flex items-center gap-2">
          <TinyDatePicker v-model="filters.orderDateFrom" :placeholder="t('pleaseSelectDate', '請選擇日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
          <span>-</span>
          <TinyDatePicker v-model="filters.orderDateTo" :placeholder="t('pleaseSelectDate', '請選擇日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
          <TinyButton type="danger" plain @click="clearHireDateFilter">{{ t('clearDate', '清除日期') }}</TinyButton>
        </div>
      </CustomFormItem>
    </CustomForm>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid ref="orderGridRef" :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
      <CustomTinyGridColumn field="" type="selection" title="" :width="50" />
      <!--<CustomTinyGridColumn field="orderNumber" :title="t('orderNumber', '訂單編號')" :width="220">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('orderNumber', '訂單編號') }}</span>
            <TinyInput v-model="filters.orderNumber" :placeholder="t('pleaseEnter', '請輸入')" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
          </div>
        </template>
      </CustomTinyGridColumn>-->
      <CustomTinyGridColumn v-if="isCustomer" field="targetName" :title="t('customer', '客戶')" :width="220">
        <template #header>
          <div class="flex w-full flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('customer', '客戶') }}</span>
            <InfiniteSelect
              v-model="filters.customerId"
              emitValue
              dataSource="customers"
              :placeholder="t('pleaseSelect', '請選擇')"
              type="outline"
              class="w-46.25!"
              allowClear
              :filters="{ status: 'ACTIVE' }"
              @change="handleFiltersChange"
            />
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn v-if="isVendor" field="targetName" :title="t('vendor', '廠商')" :width="220">
        <template #header>
          <div class="flex w-full flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('vendor', '廠商') }}</span>
            <InfiniteSelect
              v-model="filters.vendorId"
              emitValue
              dataSource="vendors"
              :placeholder="t('pleaseSelect', '請選擇')"
              type="outline"
              class="w-46.25!"
              allowClear
              :filters="{ status: 'active' }"
              @change="handleFiltersChange"
            />
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="contact" :title="t('contact', '聯絡人')" :width="120" />
      <CustomTinyGridColumn field="phone" :title="t('phone', '電話')" :width="170" />
      <CustomTinyGridColumn field="orderDate" :title="t('orderDate', '訂單日期')" :width="140" />
      <CustomTinyGridColumn field="shipDate" :title="t('shipDate', '出貨日期')" :width="140" />
      <CustomTinyGridColumn field="paymentMethod" :title="t('paymentMethod', '付款方式')" :width="100">
        <template #default="{ row }">{{ paymentDisplayMap[row.paymentMethod] || row.paymentMethod || '—' }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="shipMethod" :title="t('shipMethodLabel', '出貨方式')" :width="100">
        <template #default="{ row }">{{ shipDisplayMap[row.shipMethod] || row.shipMethod || '—' }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" :width="150" align="right" header-align="right">
        <template #default="{ row }">{{ formatCurrencyNumber(row.totalAmount) }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" :width="180" align="center" fixed="right">
        <template #header>
          <div class="flex flex-col gap-1 text-center">
            <span class="text-[16px] text-[#111827]">{{ t('status', '狀態') }}</span>
            <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('pleaseSelect', '請選擇')" class="h-8 text-xs" clearable @change="handleFiltersChange" />
          </div>
        </template>
        <template #default="{ row }">
          <a-tag size="large" v-if="row.status === 'PENDING'">{{ row.statusLabel }}</a-tag>
          <a-tag size="large" v-else-if="row.status === 'PROCESSING'" color="green">{{ row.statusLabel }}</a-tag>
          <a-tag size="large" v-else-if="row.status === 'DELIVERED'" color="arcoblue">{{ row.statusLabel }}</a-tag>
          <a-tag size="large" v-else-if="row.status === 'CANCELLED'" color="red">{{ row.statusLabel }}</a-tag>
          <a-tag size="large" v-else>{{ row.statusLabel }}</a-tag>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions', '操作')" :width="150" fixed="right" align="center" header-align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button v-if="permissionStore.hasPermission('ORDER', 'DELETE')" class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
            <button class="table-button" @click="printReport(row)"><Printer class="size-4 text-green-500" /></button>
            <button v-if="categoryCode" class="table-button" :title="t('printTriplicate', '列印三聯單')" @click="printTriplicate(row)"><ScrollText class="size-4 text-blue-500" /></button>
            <button v-if="permissionStore.hasPermission('ORDER', 'UPDATE')" class="table-button" @click="editData(row)">
              <Eye v-if="['DELIVERED', 'CANCELLED'].includes(row.status)" class="size-4" />
              <SquarePen v-else class="size-4" />
            </button>
          </div>
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
  </Card>

  <!-- 列印訂單 -->
  <OrderPrintSlip ref="orderPrintSlipRef" :orders="printOrders" />

  <!--三聯單-->
  <WaterTriplicateSlip ref="waterTriplicateRef" :orders="triplicateOrders" />
  <EggTriplicateSlip ref="eggTriplicateRef" :orders="triplicateOrders" />

  <!-- 訂單編輯彈窗 -->
  <a-modal v-model:visible="dialogVisible" :top="20" :width="1300" draggable :fullscreen="fullscreen" :mask-closable="false" :closable="false">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">
          {{ isReadOnly ? t('viewOrder', '檢視訂單') : isCreate ? t('addOrder', '新增訂單') : t('editOrder', '編輯訂單') }}
        </div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>

    <!--<JsonViewer :value="basicForm" boxed copyable />-->
    <a-form ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width>
      <div class="grid grid-cols-7 gap-2 h-[calc(100vh-165px)]!">
        <div class="flex gap-2 flex-col col-span-2">
          <!--<JsonViewer :value="basicForm" boxed copyable />-->
          <!-- 基本資訊區塊 -->
          <div class="form-section">
            <!--<div class="section-title">{{ t('orderBasicInfo', '訂單基本資訊') }}</div>-->

            <a-form-item v-if="showAllCategories" :label="t('productCategory', '商品種類')" field="categoryCode">
              <CustomField type="select" v-model="basicForm.categoryCode" :options="categoryOptions" :readonly="!canModifyTarget" @change="handleCategoryChange" />
            </a-form-item>
            <a-form-item :label="t('targetType', '對象類型')" field="targetType">
              <CustomField type="select" v-model="basicForm.targetType" :options="targetTypeOptions" :readonly="!canModifyTarget" @change="changeTargetType" />
            </a-form-item>
            <a-form-item v-if="basicForm.targetType === 'CUSTOMER'" :label="t('customer', '客戶')" field="targetId">
              <InfiniteSelect v-model="basicForm.targetId" dataSource="customers" :readonly="!canModifyTarget" @change="(v) => changeTarget(v, 'customer')" :filters="{ status: 'ACTIVE' }" />
            </a-form-item>
            <a-form-item v-else-if="basicForm.targetType === 'VENDOR'" :label="t('vendor', '廠商')" field="targetId">
              <InfiniteSelect v-model="basicForm.targetId" dataSource="vendors" :disabled="!canModifyTarget" @change="(v) => changeTarget(v, 'vendor')" :filters="{ status: 'active' }" />
            </a-form-item>
            <a-form-item :label="t('contact', '聯絡人')" field="contact">
              <a-input v-model="basicForm.contact" :placeholder="t('pleaseEnter', '請輸入')" :readonly="isReadOnly" />
            </a-form-item>
            <a-form-item :label="t('phone', '電話')" field="phone">
              <a-input v-model="basicForm.phone" :placeholder="t('pleaseEnter', '請輸入')" :readonly="isReadOnly" />
            </a-form-item>
            <a-form-item :label="t('address', '地址')">
              <a-input v-model="basicForm.shippingAddress" :placeholder="t('pleaseEnter', '請輸入')" :readonly="isReadOnly" />
            </a-form-item>
            <a-form-item :label="t('orderDate', '訂單日期')" field="orderDate">
              <a-date-picker v-model="basicForm.orderDate" :disabled="!canModifyItems" class="w-full" />
            </a-form-item>
            <a-form-item :label="t('shipDate', '出貨日期')" field="shipDate">
              <a-date-picker v-model="basicForm.shipDate" :disabled="isReadOnly" class="w-full" />
            </a-form-item>
            <a-form-item :label="t('paymentMethod', '付款方式')" field="paymentTerm">
              <a-select v-model="basicForm.paymentTerm" :options="orderPaymentTermOptions" :disabled="isReadOnly" />
            </a-form-item>
            <a-form-item :label="t('shipMethodLabel', '出貨方式')" field="shipMethod">
              <a-select v-model="basicForm.shipMethod" :options="shipMethodOptions" :disabled="isReadOnly" @change="basicForm.driverId = ''" />
            </a-form-item>
            <a-form-item v-if="basicForm.shipMethod === 'DRIVER_DELIVERY'" :label="t('driver', '司機')" field="driverId">
              <InfiniteSelect v-model="basicForm.driverId" dataSource="drivers" :placeholder="t('pleaseSelect', '請選擇')" :readonly="isReadOnly" allowClear />
            </a-form-item>
          </div>

          <!-- 備註與金額區塊 -->
          <div class="form-section">
            <a-form-item :label="t('notes', '備註')" field="notes" class="mb-0">
              <a-textarea v-model="basicForm.notes" :placeholder="t('pleaseEnterNotes', '請輸入備註')" :disabled="isReadOnly" :auto-size="{ minRows: 3, maxRows: 5 }" />
            </a-form-item>

            <div class="amount-section">
              <div v-if="!isReadOnly">
                <a-form-item :label="t('discount', '折扣')" field="discountAmount" class="mb-2">
                  <a-input-number v-model="basicForm.discountAmount" :min="0" :disabled="isReadOnly" class="w-full" hide-button />
                </a-form-item>
                <a-form-item :label="t('shippingFee', '運費')" field="shippingAmount" class="mb-2">
                  <a-input-number v-model="basicForm.shippingAmount" :min="0" :disabled="isReadOnly" class="w-full" hide-button />
                </a-form-item>
              </div>
              <div class="amount-summary">
                <div class="amount-row">
                  <span>{{ t('subtotal', '小計') }}：</span><span>{{ formatCurrencyNumber(orderSubtotal) }}</span>
                </div>
                <div class="amount-row">
                  <span>{{ t('discount', '折扣') }}：</span><span class="text-rose-500">- {{ formatNumber(Number(basicForm.discountAmount) || 0) }}</span>
                </div>
                <div class="amount-row">
                  <span>{{ t('shippingFee', '運費') }}：</span><span>+ {{ formatNumber(Number(basicForm.shippingAmount) || 0) }}</span>
                </div>
                <div class="amount-row total">
                  <span>{{ t('totalAmount', '總計') }}：</span><span class="text-emerald-600">{{ formatCurrencyNumber(orderTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 訂單明細區塊 -->
        <div class="form-section col-span-5">
          <div class="section-header">
            <!--<div class="section-title">{{ t('orderItems', '訂單明細') }}</div>-->

            <a-form-item v-if="isEdite" :label="t('status', '狀態')" field="status" class="w-75!">
              <a-select v-model="basicForm.status" :options="editableStatusOptions" :disabled="isReadOnly" class="w-75" />
            </a-form-item>
          </div>
          <!-- 商品選擇表格 -->
          <ProductSelectionTable
            ref="productSelectionTableRef"
            v-model="basicForm.items"
            showUnitPrice
            :visible-columns="['name', 'basePriceAmount']"
            :target-object="basicForm.targetId"
            :readonly="!canModifyItems || isReadOnly"
            :category-id="props.categoryId"
            :fullscreen="fullscreen"
            :extra-columns="[
              ...depositExtraColumns,
              { key: 'recoveredQuantity', title: t('recoveredQuantity', '回收數量'), type: 'number', width: isReadOnly ? 100 : 160, align: 'center', fixed: 'right', min: 0 },
            ]"
            :extra-row-class="depositRowClass"
          />
        </div>
      </div>
    </a-form>

    <template #footer>
      <div class="flex w-full items-center justify-center gap-3">
        <a-button size="large" @click="closeDialog">{{ isReadOnly ? t('close', '關閉') : t('cancel', '取消') }}</a-button>
        <a-button v-if="!isReadOnly" type="primary" size="large" :loading="isSaving" @click="saveData">
          {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { OrderCreatePost, OrderDeleteById, OrderGetByID, OrderListGet, OrderStatusUpdatePatch, OrderUpdatePatch } from '@/assets/API/Order';
import { CustomersStoredGetByID, CustomersGetByID } from '@/assets/API/Customers';
import { VendorGetByID } from '@/assets/API/Vendor';
import AppPagination from '@/components/ui/AppPagination.vue';
import CustomField from '@/components/Form/CustomField.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';
import OrderPrintSlip from '@/components/dialogs/OrderPrintSlip.vue';
import WaterTriplicateSlip from '@/components/dialogs/WaterTriplicateSlip.vue';
import EggTriplicateSlip from '@/components/dialogs/EggTriplicateSlip.vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form as AForm, FormItem as AFormItem } from '@arco-design/web-vue';
import { TinyButton, TinyDatePicker, TinyInput, TinySelect } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { CATEGORIES, getCategoryIdByCode } from '@/constants/categories';
import { Expand, Eye, Printer, ScrollText, Shrink, SquarePen, Trash2 } from 'lucide-vue-next';
import { useVueToPrint } from 'vue-to-print';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { endOfDay } from 'date-fns';

const permissionStore = usePermissionStore();
const {
  targetTypeOptions,
  orderPaymentTermOptions,
  shipMethodOptions,
  orderStatusOptions,
  orderStatusLabelMap,
  orderStatusDisplayMap,
  targetTypeLabelMap,
  paymentMethodLabelMap,
  shipMethodLabelMap,
  buildSelectOptionsWithAll,
  buildLabelMap,
} = useSelectOptions();
const paymentDisplayMap = computed(() => buildLabelMap(orderPaymentTermOptions.value));
const shipDisplayMap = computed(() => buildLabelMap(shipMethodOptions.value));
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();
const { formatNumber, formatCurrencyNumber } = currencyStore;

const props = defineProps({
  pageTitle: { type: String, required: true },
  categoryId: { type: String, default: undefined },
  categoryCode: { type: String, default: undefined },
});
const formatDate = (value, format = 'YYYY-MM-DD HH:mm') => timezoneStore.formatDate(value, format);
const isCreate = computed(() => dialogMode.value === 'create');
const isEdite = computed(() => dialogMode.value === 'edit');
const EMPTY_PLACEHOLDER = t('unset', '未設定');

/** 商品種類相關 **/
const showAllCategories = computed(() => !props.categoryId && !props.categoryCode); //是否顯示所有類別模式
const categoryOptions = computed(() =>
  CATEGORIES.map((c) => ({
    label: c.name,
    value: c.code,
  })),
);
const getCategoryName = (categoryCode) => {
  const category = CATEGORIES.find((c) => c.code === categoryCode);
  return category?.name || categoryCode || EMPTY_PLACEHOLDER;
};
const productCategoryId = computed(() => {
  return props.categoryId || basicForm.value.categoryId || getCategoryIdByCode(basicForm.value.categoryCode);
});

/** 分頁頁籤相關 **/
const TAB_KEYS = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
};
const activeKey = ref('CUSTOMER');
const isCustomer = computed(() => activeKey.value === 'CUSTOMER');
const isVendor = computed(() => activeKey.value === 'VENDOR');

/** 狀態下拉選單相關 **/
const statusOptions = buildSelectOptionsWithAll(orderStatusOptions.value); //訂單狀態篩選選項（含全部）
const statusFilterMap = {
  PENDING: ['DRAFT', 'PENDING', 'CONFIRMED'],
  PROCESSING: ['PROCESSING', 'SHIPPED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED', 'RETURNED'],
}; //狀態篩選對應後端狀態陣列
const defaultFilters = {
  search: '',
  status: 'all',
  orderNumber: '',
  targetType: '',
  orderDateFrom: '',
  orderDateTo: '',
  categoryCode: 'all', //商品種類篩選
};
const STATUS_TRANSITIONS = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};
const editableStatusOptions = computed(() => {
  if (!originalStatus.value) return [];
  const allowedTransitions = STATUS_TRANSITIONS[originalStatus.value] || [];
  const allowedValues = [originalStatus.value, ...allowedTransitions];
  return statusOptions.filter((opt) => allowedValues.includes(opt.value));
});
const canModifyTarget = computed(() => {
  if (isReadOnly.value) return false;
  if (isCreate.value) return true;
  if (!originalStatus.value) return true; //新訂單尚未有狀態，允許修改對象
});
const canModifyItems = computed(() => {
  if (isReadOnly.value) return false;
  if (isCreate.value) return true;
  return originalStatus.value === 'PENDING';
});
const isReadOnly = computed(() => {
  return ['DELIVERED', 'CANCELLED'].includes(originalStatus.value);
});
const orderSubtotal = computed(() => {
  return basicForm.value.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
});
const orderTotal = computed(() => {
  const subtotal = orderSubtotal.value;
  const discount = Number(basicForm.value.discountAmount) || 0;
  const shipping = Number(basicForm.value.shippingAmount) || 0;
  return subtotal + shipping - discount;
});
const toggleActiveKey = async (type) => {
  activeKey.value = type;
  filters.targetType = type;
  await getAPI();
}; //切換客戶/廠商頁籤

/** 列表資料取得相關 **/
const responseDataToList = (item = {}) => {
  const statusKey = orderStatusLabelMap[item.status] || item.status;
  return {
    id: item.id,
    orderNumber: item.orderNumber,
    categoryCode: item.categoryCode || '',
    categoryName: getCategoryName(item.categoryCode),
    targetType: item.targetType || t('customer', '客戶'),
    targetName: item.targetName || item.customer?.name || t('unset', '未設定'),
    phone: item.phone || EMPTY_PLACEHOLDER,
    contact: item.contact || EMPTY_PLACEHOLDER,
    paymentMethod: item.paymentMethod || EMPTY_PLACEHOLDER,
    shipMethod: item.shipMethod || EMPTY_PLACEHOLDER,
    employeeName: item.employeeName || EMPTY_PLACEHOLDER,
    totalAmount: item.totalAmount ?? item.totalAmount?.amount ?? 0,
    discount: item.discount ?? 0,
    shippingFee: item.shippingFee ?? 0,
    status: statusKey,
    statusLabel: orderStatusDisplayMap.value[statusKey] || item.status, //英文 key → 前端顯示文字
    orderDate: item.orderDate,
    shipDate: item.shipDate,
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    raw: item,
  };
}; //列表資料轉換
const wrappedOrdersListGet = (params) => {
  const processedParams = { ...params };
  /*if (props.categoryCode) {
    processedParams.categoryCode = props.categoryCode;
  } else {
    delete processedParams.categoryCode;
  }*/
  if (props.categoryId) {
    processedParams.categoryId = props.categoryId;
  } else {
    delete processedParams.categoryId;
  }

  if (processedParams.status && statusFilterMap[processedParams.status]) {
    processedParams.status = statusFilterMap[processedParams.status];
  }
  if (processedParams.orderDateTo) {
    processedParams.orderDateTo = endOfDay(new Date(processedParams.orderDateTo));
  }
  processedParams.targetType = activeKey.value;
  return OrderListGet(processedParams);
}; //包裝 API 請求
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange, handleSort } = usePaginatedSearchApi(
  wrappedOrdersListGet,
  defaultFilters,
  {
    responseDataToList,
  },
);
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    await getDefaultAPI();
  } finally {
    mainStore.setLoading(false);
  }
}; //取得列表資料
const clearHireDateFilter = async () => {
  filters.orderDateFrom = '';
  filters.orderDateTo = '';
  await handleFiltersChange();
}; //清除日期篩選

/** 表單操作相關 **/
const orderGridRef = ref(null); //列表 grid ref（用於取得勾選列）
const dialogMode = ref('create');
const fullscreen = ref(true);
const dialogVisible = ref(false);
const editingId = ref(null);
const editingOrderProducts = ref([]);
const originalStatus = ref(null);
const basicFormRef = ref(null);
const productSelectionTableRef = ref(null);
const isSaving = ref(false);
const initializeForm = () => ({
  targetType: 'CUSTOMER', //出貨對象類型 (CUSTOMER=客戶 / VENDOR=廠商 / TEMPORARY_CUSTOMER=臨時客戶)
  targetId: '', //出貨對象UUID
  temporaryCustomerName: '', //臨時客戶名稱（當 targetType=TEMPORARY_CUSTOMER 時使用）
  categoryId: props.categoryId, //商品種類ID（用於篩選商品）
  categoryCode: props.categoryCode || 'EGG', //商品種類代碼（用於所有訂單頁面）
  expectedDeliveryDate: null, //預計配送日期
  contact: '', //聯絡人姓名
  phone: '', //聯絡電話
  orderDate: new Date(), //訂單日期
  shipDate: new Date(), //出貨日期
  paymentTerm: 'PREPAID', //付款方式 (CASH=現金 / MONTHLY=月結 / PREPAID=預付)
  shipMethod: 'PICKUP', //出貨方式 (PICKUP=自取 / DRIVER_DELIVERY=司機送貨 / COURIER=宅配)
  driverId: '', //司機UUID（當 shipMethod=DRIVER_DELIVERY 時使用）
  shippingAddress: '', //配送地址
  notes: '', //訂單備註（對外）
  internalNotes: '', //內部備註（僅供內部查看）
  discountAmount: 0, //折扣金額
  shippingAmount: 0, //運費金額
  taxAmount: 0, //稅金金額
  items: [], //商品明細 [{ productId, quantity, unitPrice }]
  status: 'PENDING', //訂單狀態 (PENDING=待出貨 / PROCESSING=處理中 / DELIVERED=已完成 / CANCELLED=取消)
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = computed(() => ({
  targetId: [
    {
      required: basicForm.value.targetType !== 'TEMPORARY_CUSTOMER',
      message: t('targetRequired', '請選擇對象'),
    },
  ],
  orderDate: [{ required: true, message: t('orderDateRequired', '請選擇訂單日期') }],
  shipDate: [{ required: true, message: t('pleaseSelect', '請選擇') }],
  items: [{ type: 'array', minLength: 1, message: t('orderItemsRequired', '請至少新增一個商品') }],
  'items.*.productId': [{ required: true, message: t('productRequired', '請選擇商品') }],
  'items.*.quantity': [{ required: true, message: t('quantityRequired', '請輸入數量') }],
})); //表單驗證規則
const changeTargetType = () => {
  basicForm.value.contact = '';
  basicForm.value.phone = '';
}; //選擇出貨對象類型變更
const handleCategoryChange = () => {
  basicForm.value.items = [];
  basicForm.value.categoryId = getCategoryIdByCode(basicForm.value.categoryCode);
}; //商品種類變更
const changeTarget = (item, type = 'customer') => {
  if (type === 'vendor') basicForm.value.contact = item.contactPerson;
  if (type === 'customer') {
    basicForm.value.contact = item.customFields?.contacts?.find((c) => c.isPrimary)?.name ?? '';
    basicForm.value.notes = item.notes || '';
    originalQtyMap.value = {}; // 新訂單選客戶，無原始數量基準
    fetchDeposits(item?.id);

    const addr1 = item.customFields?.companyAddress || '';
    const addr2 = item.customFields?.companyAddress2 || '';
    const street = [addr1, addr2].filter(Boolean).join(', ');
    basicForm.value.shippingAddress = [addr1, addr2].filter(Boolean).join(', ');
  }
  basicForm.value.phone = [item.contactInfo?.phone, item.contactInfo?.phone2].filter(Boolean).join(', ');
}; //選擇對象變更

/**
 * 編輯「處理中」訂單時，將對象最新資料補齊進訂單欄位
 * 規則：原本有的維持在前，對象有但訂單沒有的才往後補，不覆蓋任何既有內容
 */
const mergeTargetFieldsIntoForm = (target, type) => {
  const form = basicForm.value;

  // ── 電話：比對每個號碼，只補進去沒有的 ──
  const existingPhones = form.phone
    ? form.phone
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const targetPhones = [target.contactInfo?.phone, target.contactInfo?.phone2].filter(Boolean);
  const newPhones = targetPhones.filter((p) => !existingPhones.includes(p));
  if (newPhones.length) {
    form.phone = [...existingPhones, ...newPhones].join(', ');
  }

  // ── 地址（僅客戶）：比對每段地址，只補進去沒有的 ──
  if (type === 'CUSTOMER') {
    const existingAddrs = form.shippingAddress
      ? form.shippingAddress
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const targetAddrs = [target.customFields?.companyAddress, target.customFields?.companyAddress2].filter(Boolean);
    const newAddrs = targetAddrs.filter((a) => !existingAddrs.includes(a));
    if (newAddrs.length) {
      form.shippingAddress = [...existingAddrs, ...newAddrs].join(', ');
    }

    // ── 備註（僅客戶）：對象有備註且訂單備註尚未包含時，換行後附加 ──
    const targetNotes = target.notes?.trim();
    if (targetNotes && !form.notes?.includes(targetNotes)) {
      form.notes = form.notes ? `${form.notes}\n${targetNotes}` : targetNotes;
    }
  }
};

/** 儲值狀況相關 **/
const depositMap = ref({});
const originalQtyMap = ref({}); //記錄打開訂單時各商品的「原始數量」，用來計算 delta（只有 delta 不為 0 才做預覽計算）
const fetchDeposits = async (customerId) => {
  if (!customerId) {
    depositMap.value = {};
    return;
  }
  try {
    const res = await CustomersStoredGetByID(customerId, { limit: 100 });
    const list = res?.data?.data?.data ?? [];
    const map = {};
    list.forEach((item) => {
      if (item.productId) {
        map[item.productId] = {
          remainingQuantity: item.remainingQuantity ?? 0,
          remainingAmount: item.remainingAmount ?? 0,
        };
      }
    });
    depositMap.value = map;
  } catch {
    depositMap.value = {};
  }
}; //取得最新儲值狀況
const getDepositDisplay = (record) => {
  const deposit = depositMap.value[record.id];
  if (!deposit) return null;

  const orderedItem = basicForm.value.items.find((i) => i.productId === record.id);
  const orderedQty = Number(orderedItem?.quantity ?? 0);
  const originalQty = Number(originalQtyMap.value[record.id] ?? 0);
  const delta = orderedQty - originalQty;

  // 沒有改過數量，直接顯示 API 原始值
  if (delta === 0) {
    return { remainingQuantity: deposit.remainingQuantity, remainingAmount: deposit.remainingAmount };
  }

  // 使用者改了數量，以 API 原始值 + delta 做預覽計算
  const customPrices = basicForm.value.targetId?.customFields?.customPrices ?? [];
  const customPrice = customPrices.find((cp) => {
    const cpProductId = typeof cp.product === 'object' ? cp.product?.id : cp.productId;
    return cpProductId === record.id;
  });
  const unitPrice = Number(customPrice?.amount ?? customPrice?.priceAmount ?? record.basePriceAmount ?? 0);

  let newQty = deposit.remainingQuantity - delta;
  let newAmt = deposit.remainingAmount;

  if (newQty < 0 && unitPrice > 0) {
    const overflow = -newQty;
    const bottlesCoveredByAmt = Math.floor(deposit.remainingAmount / unitPrice);
    const covered = Math.min(overflow, bottlesCoveredByAmt);
    const uncovered = overflow - covered;
    newAmt = deposit.remainingAmount - covered * unitPrice;
    newQty = uncovered > 0 ? -uncovered : 0;
  }

  return { remainingQuantity: newQty, remainingAmount: Math.round(newAmt) };
};
const depositExtraColumns = computed(() => {
  //使用者沒有改過數量 → 直接顯示 API 原始數據（後端每次儲存後都會更新）
  //使用者改了數量 → 以 API 原始數據為基礎，加減 delta 做即時預覽
  if (!Object.keys(depositMap.value).length) return [];
  return [
    {
      key: 'depositStatus',
      title: t('depositStatus', '儲值狀況'),
      width: 150,
      align: 'center',
      editable: false,
      getValue: (record) => {
        const result = getDepositDisplay(record);
        if (!result) return '-';
        return `${result.remainingQuantity} 桶 / $${result.remainingAmount}`;
      },
    },
  ];
}); //剩餘數量與金額
const depositRowClass = (record) => {
  const result = getDepositDisplay(record);
  if (!result) return '';
  if (result.remainingQuantity > 0 || result.remainingAmount > 0) return 'deposit-row-positive';
  if (result.remainingQuantity < 0) return 'deposit-row-negative';
  return '';
};
const changeProduct = (product, index) => {
  if (!product || index === null || index === undefined) return;
  const row = basicForm.value.items?.[index];
  if (!row) return;

  row.productId = product.id;
  row.unit = product.unit || '';
  const productBasePrice = Number(product.basePriceAmount ?? product.basePrice?.amount ?? 0) || 0;
  let finalPrice = productBasePrice;

  if (basicForm.value.targetType === 'CUSTOMER' && basicForm.value.targetId) {
    const target = basicForm.value.targetId;
    const customPrices = target?.customFields?.customPrices || [];
    const customPrice = customPrices.find((cp) => {
      const cpProductId = typeof cp.product === 'object' ? cp.product?.id : cp.productId;
      return cpProductId === product.id;
    });
    if (customPrice) finalPrice = Number(customPrice.price) || productBasePrice;
  }

  row.basePriceAmount = finalPrice;
  if (!row.unitPrice) row.unitPrice = { amount: 0, currency: 'TWD' };
  row.unitPrice.amount = finalPrice;
  updateItemTotal(row);
}; //選擇商品變更
const updateItemTotal = (item) => {
  const unitPrice = Number(item.unitPrice?.amount ?? 0) || 0;
  const quantity = Number(item.quantity ?? 0) || 0;
  item.total = unitPrice * quantity;
}; //更新單項小計
const updateAllItemTotals = () => {
  basicForm.value.items.forEach((item) => updateItemTotal(item));
}; //更新所有項目小計

const addItem = () => {
  basicForm.value.items.push({
    productId: '',
    basePriceAmount: 0,
    unit: '',
    quantity: 1,
    unitPrice: { amount: 0, currency: 'TWD' },
    total: 0,
    recoveredQuantity: 0,
  });
}; //新增訂單項目(待刪除)
const removeItem = (index) => {
  basicForm.value.items.splice(index, 1);
}; //移除訂單項目(待刪除)
const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  originalStatus.value = null;
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate();
  dialogVisible.value = true;
}; //開啟新增視窗
const editData = async (row) => {
  if (!row.id) {
    await mainStore.SWAL_Error(new Error('訂單 ID 不存在'));
    return;
  }
  dialogMode.value = 'edit';
  editingId.value = row.id;
  mainStore.setLoading(true);
  try {
    const response = await OrderGetByID(row.id);
    const orderData = response.data?.data || response.data;
    const statusKey = orderStatusLabelMap[orderData.status] || orderData.status || 'PENDING';
    originalStatus.value = statusKey;
    const targetTypeValue = targetTypeLabelMap[orderData.targetType] || orderData.targetType || 'CUSTOMER';
    const paymentTermValue = paymentMethodLabelMap[orderData.paymentMethod] || orderData.paymentTerm || 'CASH';
    const shipMethodValue = shipMethodLabelMap[orderData.shipMethod] || orderData.shipMethod || 'PICKUP';
    editingOrderProducts.value = orderData.products || orderData.items || []; //暫存訂單商品資料，供 watch 使用
    basicForm.value = {
      targetType: targetTypeValue,
      targetId: { id: orderData.targetId, name: orderData.targetName },
      temporaryCustomerName: orderData.temporaryCustomerName || '',
      categoryId: orderData.categoryId || props.categoryId,
      categoryCode: orderData.categoryCode || props.categoryCode || 'EGG',
      orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
      expectedDeliveryDate: orderData.expectedDeliveryDate ? new Date(orderData.expectedDeliveryDate) : null,
      phone: orderData.phone || '',
      contact: orderData.contact || '',
      paymentTerm: paymentTermValue,
      shipMethod: shipMethodValue,
      shipDate: orderData.shipDate ? new Date(orderData.shipDate) : null,
      driverId: { id: orderData.employeeId, name: orderData.employeeName },
      items: [], // 先設為空，等商品加載完再設置
      discountAmount: Number(orderData.discount ?? orderData.discountAmount?.amount ?? 0),
      shippingAmount: Number(orderData.shippingFee ?? orderData.shippingAmount?.amount ?? 0),
      shippingAddress: orderData.address || orderData.shippingAddress || '', //配送地址（後端回傳欄位為 address）
      notes: orderData.note || orderData.notes || '',
      internalNotes: orderData.internalNotes || '',
      status: statusKey,
    };
    dialogVisible.value = true;

    // 編輯既有訂單時，若對象是客戶，自動載入儲值狀況
    if (targetTypeValue === 'CUSTOMER' && orderData.targetId) {
      fetchDeposits(orderData.targetId);
    }

    // 狀態為「待出貨」時，重新取得對象最新資料並補齊訂單欄位（不覆蓋既有內容）
    if (statusKey === 'PENDING' && orderData.targetId) {
      try {
        let targetRes;
        if (targetTypeValue === 'CUSTOMER') {
          targetRes = await CustomersGetByID(orderData.targetId);
        } else if (targetTypeValue === 'VENDOR') {
          targetRes = await VendorGetByID(orderData.targetId);
        }
        const target = targetRes?.data?.data || targetRes?.data;
        if (target) {
          mergeTargetFieldsIntoForm(target, targetTypeValue);
        }
      } catch {
        // 無法取得對象資料時靜默失敗，不影響開啟訂單
      }
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate();
  depositMap.value = {};
  originalQtyMap.value = {};
}; //關閉彈窗
const isUUID = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); //檢查 UUID
const extractUUID = (obj) => {
  if (!obj) return undefined;
  if (typeof obj === 'string') return isUUID(obj) ? obj : undefined;
  if (typeof obj === 'object') {
    if (isUUID(obj.id)) return obj.id;
    if (isUUID(obj.uuid)) return obj.uuid;
    if (isUUID(obj.customerId)) return obj.customerId;
    if (isUUID(obj.vendorId)) return obj.vendorId;
  }
  return undefined;
}; //取得UUID
const preparePayload = () => {
  const form = basicForm.value;
  const finalCategoryId = props.categoryId || form.categoryId || getCategoryIdByCode(form.categoryCode);
  const payload = {
    targetType: form.targetType, //對象類型(客戶/廠商)
    categoryId: finalCategoryId, //種類ID
    paymentTerm: form.paymentTerm, //付款方式
    shipMethod: form.shipMethod, //出貨方式
    notes: form.notes || undefined, //備註
    items: form.items.map((item) => ({
      productId: extractUUID(item.productId), //商品ID
      quantity: Number(item.quantity), //數量
      unitPrice: item.unitPrice?.amount ? { amount: Number(item.unitPrice.amount), currency: 'TWD' } : undefined, //金額
      recoveredQuantity: Number(item.recoveredQuantity ?? 0), //回收數量
    })), //商品明細
  };

  if (isCreate.value) payload.orderDate = form.orderDate; //訂單建立日期
  if (form.targetType === 'CUSTOMER') payload.customerId = extractUUID(form.targetId); //客戶
  if (form.targetType === 'VENDOR') payload.vendorId = extractUUID(form.targetId); //廠商
  if (form.targetType === 'TEMPORARY_CUSTOMER') payload.temporaryCustomerName = form.temporaryCustomerName; //臨時客戶(暫定)
  if (form.phone) payload.phone = form.phone; //手機號碼
  if (form.contact) payload.contact = form.contact; //
  if (form.shipDate) payload.shipDate = form.shipDate; //出貨日期
  if (form.driverId) payload.driverId = extractUUID(form.driverId); //司機UUID
  if (form.expectedDeliveryDate) payload.expectedDeliveryDate = form.expectedDeliveryDate; //預計配送日期
  if (form.discountAmount > 0) payload.discountAmount = { amount: Number(form.discountAmount), currency: 'TWD' }; //折扣金額
  if (form.shippingAmount > 0) payload.shippingAmount = { amount: Number(form.shippingAmount), currency: 'TWD' }; //運費金額
  if (form.shippingAddress) payload.shippingAddress = form.shippingAddress; //配送地址

  return payload;
}; //整理儲存Payload
const updateOrderStatusWithAutoPromote = async (id, targetStatus) => {
  if (targetStatus === 'PROCESSING') {
    try {
      await OrderStatusUpdatePatch(id, { status: 'PENDING' });
    } catch (e) {
      /* ignore */
    }
    await OrderStatusUpdatePatch(id, { status: 'PROCESSING' });
  } else if (targetStatus === 'DELIVERED') {
    try {
      await OrderStatusUpdatePatch(id, { status: 'SHIPPED' });
    } catch (e) {
      /* ignore */
    }
    await OrderStatusUpdatePatch(id, { status: 'DELIVERED' });
  } else {
    await OrderStatusUpdatePatch(id, { status: targetStatus });
  }
}; //自動晉升狀態邏輯
const _submitForm = async () => {
  const validateResult = await basicFormRef.value?.validate();
  if (validateResult) return false;

  const fullPayload = preparePayload();
  if (!fullPayload) return false;

  try {
    isSaving.value = true;
    if (isCreate.value) {
      await OrderCreatePost(fullPayload);
    } else {
      const form = basicForm.value;
      const statusChanged = form.status !== originalStatus.value;
      const contentPayload = { ...fullPayload };
      delete contentPayload.status;
      if (!['DRAFT', 'PENDING'].includes(originalStatus.value)) {
        delete contentPayload.items;
      }
      await OrderUpdatePatch(editingId.value, contentPayload);
      if (statusChanged) {
        await updateOrderStatusWithAutoPromote(editingId.value, form.status);
      }
    }
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    closeDialog();
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSaving.value = false;
  }
}; //提交表單資料
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //儲存防抖
const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await OrderDeleteById(id);
        await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
        if (basicDataList.value.length === 1 && pagination.page > 1) {
          pagination.page -= 1;
        }
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
}; //刪除訂單

/** 列印相關 **/
const printOrders = ref([]); //待列印的訂單資料
const orderPrintSlipRef = ref(null); //列印元件 ref
const waterTriplicateRef = ref(null);
const eggTriplicateRef = ref(null);
const triplicateOrders = ref([]);
const triplicatePageStyle = `@page { size: 241mm 140mm; margin: 0; } body { margin: 0; }`;
const { handlePrint } = useVueToPrint({
  content: () => orderPrintSlipRef.value?.printContentRef, //取得子元件暴露的 DOM ref
  documentTitle: '訂單出貨單',
  /*pageStyle: `
    @page { size: A4; margin: 0; }
    body { margin: 0; }
  `,*/
  removeAfterPrint: true,
});
const { handlePrint: handleWaterTriplicatePrint } = useVueToPrint({
  content: () => waterTriplicateRef.value?.printContentRef,
  documentTitle: '飲水送貨三聯單',
  pageStyle: triplicatePageStyle,
  removeAfterPrint: true,
  suppressErrors: true, // 不等待圖片/資源載入，直接列印
});
const { handlePrint: handleEggTriplicatePrint } = useVueToPrint({
  content: () => eggTriplicateRef.value?.printContentRef,
  documentTitle: '雞蛋出貨三聯單',
  pageStyle: triplicatePageStyle,
  removeAfterPrint: true,
});
const printReport = async (row) => {
  mainStore.setLoading(true);
  try {
    const response = await OrderGetByID(row.id);
    const orderData = response.data?.data || response.data;
    printOrders.value = [orderData];
    await nextTick(); //等 DOM 更新
    await orderPrintSlipRef.value?.prepare?.(); //動態計算空白行數
    handlePrint();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //單筆列印
const batchPrint = async () => {
  const selectedRows = orderGridRef.value?.getSelectRecords?.() ?? [];
  if (!selectedRows.length) {
    await mainStore.SWAL_Success(t('selectRowsFirst', '請先勾選要列印的訂單'), '', 'warning');
    return;
  }
  mainStore.setLoading(true);
  try {
    const results = await Promise.all(selectedRows.map((row) => OrderGetByID(row.id)));
    printOrders.value = results.map((res) => res.data?.data || res.data);
    await nextTick(); //等 DOM 更新
    await orderPrintSlipRef.value?.prepare?.(); //動態計算空白行數
    handlePrint();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //批次列印
const printTriplicate = async (row) => {
  mainStore.setLoading(true);
  try {
    const response = await OrderGetByID(row.id);
    const orderData = response.data?.data || response.data;
    await attachPreDeliveryContact([orderData]);
    triplicateOrders.value = [orderData];
    await nextTick();
    if (props.categoryCode === 'WATER') handleWaterTriplicatePrint();
    else handleEggTriplicatePrint();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //單筆三聯單
const batchPrintTriplicate = async () => {
  const selectedRows = orderGridRef.value?.getSelectRecords?.() ?? [];
  if (!selectedRows.length) {
    await mainStore.SWAL_Success(t('selectRowsFirst', '請先勾選要列印的訂單'), '', 'warning');
    return;
  }
  mainStore.setLoading(true);
  try {
    const results = await Promise.all(selectedRows.map((row) => OrderGetByID(row.id)));
    const orders = results.map((res) => res.data?.data || res.data);
    await attachPreDeliveryContact(orders);
    triplicateOrders.value = orders;
    await nextTick();
    if (props.categoryCode === 'WATER') handleWaterTriplicatePrint();
    else handleEggTriplicatePrint();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //批次三聯單

/** 列印前補上客戶的 preDeliveryContact（後端訂單API不含此欄位）**/
const attachPreDeliveryContact = async (orders) => {
  const customerOrders = orders.filter((o) => {
    const typeKey = targetTypeLabelMap[o.targetType] || o.targetType;
    return typeKey === 'CUSTOMER' && o.targetId;
  });
  await Promise.allSettled(
    customerOrders.map(async (o) => {
      try {
        const res = await CustomersGetByID(o.targetId);
        const customer = res?.data?.data || res?.data;
        if (customer) o.preDeliveryContact = customer.preDeliveryContact ?? false;
      } catch {}
    }),
  );
};

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
import { JsonViewer } from 'vue3-json-viewer';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 350, 100));

onMounted(getAPI);
watch(
  () => dialogVisible.value,
  async (newVal) => {
    if (newVal && productSelectionTableRef.value) {
      await productSelectionTableRef.value.loadProducts();
      if (dialogMode.value === 'edit' && editingOrderProducts.value.length > 0) {
        const items = editingOrderProducts.value.map((item) => {
          const unitPriceAmount = Number(item.actualPrice ?? item.unitPrice?.amount ?? item.unitPriceAmount ?? 0);
          const quantity = Number(item.quantity || 0);
          const basePriceAmount = Number(item.retailPrice ?? item.basePriceAmount ?? item.product?.basePriceAmount ?? 0);

          return {
            productId: item.productId,
            product: item.product || {},
            unit: item.unit || item.product?.unit || '',
            quantity,
            basePriceAmount,
            unitPrice: { amount: unitPriceAmount, currency: item.unitPrice?.currency || 'TWD' },
            total: unitPriceAmount * quantity,
            recoveredQuantity: Number(item.recoveredQuantity ?? 0),
          };
        });

        basicForm.value.items = items;
        // 記錄原始數量，作為儲值預覽計算的基準
        const qtySnapshot = {};
        items.forEach((item) => {
          if (item.productId) qtySnapshot[item.productId] = item.quantity;
        });
        originalQtyMap.value = qtySnapshot;
        editingOrderProducts.value = [];
      }
    }
  },
); //當彈窗打開時加載商品列表
watch(
  () => basicForm.value.items.map((item) => ({ unitPrice: item.unitPrice?.amount, quantity: item.quantity })),
  () => updateAllItemTotals(),
  { deep: true },
); //監聯訂單項目變化更新小計
</script>

<style scoped>
.form-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* 表單欄位尺寸 */
.form-item-sm {
  width: 140px;
}

.form-item-md {
  width: 200px;
}

.form-item-lg {
  width: 280px;
}

/* 訂單明細表格 */
.empty-items {
  text-align: center;
  color: #9ca3af;
  padding: 24px;
  background: #fafafa;
  border-radius: 6px;
}

.items-table {
  border-radius: 6px;
  overflow: hidden;
}

.items-table :deep(.arco-table-th) {
  background: #f8fafc;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  padding: 8px 12px;
}

.items-table :deep(.arco-table-td) {
  padding: 6px 12px;
  vertical-align: middle;
}

.items-table :deep(.arco-form-item-wrapper-col) {
  flex: 1;
}

.items-table :deep(.arco-form-item-content-flex) {
  justify-content: stretch;
}

/* 金額區塊 */
.amount-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-inputs {
  display: flex;
  gap: 16px;
}

.amount-inputs .arco-form-item {
  flex: 1;
}

.amount-summary {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px 16px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.amount-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* 調整 Arco 表單樣式 */
:deep(.arco-form-item) {
  margin-bottom: 0;
}

:deep(.arco-form-item-label) {
  font-size: 13px;
  color: #6b7280;
}

:deep(.arco-form-layout-inline .arco-form-item) {
  margin-right: 0;
}
</style>
