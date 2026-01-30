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
          <a-button v-if="permissionStore.hasPermission('ORDER', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addOrder', '新增訂單') }}</a-button>
        </div>
      </template>
    </a-tabs>
    <CardContent class="flex flex-col gap-4">
      <!-- 篩選區塊 -->
      <div class="mb-4 flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm layout="vertical">
          <AFormItem field="orderDate" :label="t('orderDate', '訂單日期')">
            <div class="flex items-center gap-2">
              <TinyDatePicker v-model="filters.orderDateFrom" :placeholder="t('pleaseSelectDate', '請選擇日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
              <span>-</span>
              <TinyDatePicker v-model="filters.orderDateTo" :placeholder="t('pleaseSelectDate', '請選擇日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />

              <TinyButton type="danger" plain @click="clearHireDateFilter">{{ t('clearDate', '清除日期') }}</TinyButton>
            </div>
          </AFormItem>
        </AForm>
      </div>

      <!-- 訂單列表 -->
      <!--<JsonViewer :value="basicDataList" boxed copyable />-->
      <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id">
        <CustomTinyGridColumn field="orderNumber" :title="t('orderNumber', '訂單編號')" width="220">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('orderNumber', '訂單編號') }}</span>
              <TinyInput v-model="filters.orderNumber" :placeholder="t('pleaseEnter', '請輸入')" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </div>
          </template>
        </CustomTinyGridColumn>

        <CustomTinyGridColumn v-if="isCustomer" field="targetName" :title="t('customer', '客戶')" width="220">
          <template #header>
            <div class="flex w-full flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('customer', '客戶') }}</span>
              <InfiniteSelect
                v-model="filters.customerId"
                emitValue
                dataSource="customers"
                :placeholder="t('pleaseSelect', '請選擇')"
                type="outline"
                class="w-[185px]!"
                allowClear
                @change="handleFiltersChange"
              />
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn v-if="isVendor" field="targetName" :title="t('vendor', '廠商')" width="220">
          <template #header>
            <div class="flex w-full flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('vendor', '廠商') }}</span>
              <InfiniteSelect
                v-model="filters.vendorId"
                emitValue
                dataSource="vendors"
                :placeholder="t('pleaseSelect', '請選擇')"
                type="outline"
                class="w-[185px]!"
                allowClear
                @change="handleFiltersChange"
              />
            </div>
          </template>
        </CustomTinyGridColumn>

        <CustomTinyGridColumn field="contact" :title="t('contact', '聯絡人')" width="120" />
        <CustomTinyGridColumn field="phone" :title="t('phone', '電話')" width="170" />
        <CustomTinyGridColumn field="orderDate" :title="t('orderDate', '訂單日期')" width="140" />
        <CustomTinyGridColumn field="shipDate" :title="t('shipDate', '出貨日期')" width="140" />
        <CustomTinyGridColumn field="paymentMethod" :title="t('paymentMethod', '付款方式')" width="100" />
        <CustomTinyGridColumn field="shipMethod" :title="t('shipMethodLabel', '出貨方式')" width="100" />

        <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="150" align="center">
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

        <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" width="150" align="right" header-align="right">
          <template #default="{ row }">{{ formatCurrencyNumber(row.totalAmount) }}</template>
        </CustomTinyGridColumn>

        <CustomTinyGridColumn :title="t('actions', '操作')" width="100" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button v-if="permissionStore.hasPermission('ORDER', 'DELETE')" class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button v-if="permissionStore.hasPermission('ORDER', 'UPDATE')" class="table-button" @click="editData(row)">
                <Eye v-if="['DELIVERED', 'CANCELLED'].includes(row.status)" class="size-4" />
                <SquarePen v-else class="size-4" />
              </button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <!-- 分頁 -->
      <AppPagination
        class="md:w-auto"
        :current="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-size-options="pageSizeOptions"
        @change="CurrentChange"
        @page-size-change="SizeChange"
      />
    </CardContent>
  </Card>

  <!-- 訂單編輯彈窗 -->
  <a-modal v-model:visible="dialogVisible" :top="30" draggable :fullscreen="fullscreen" :mask-closable="false" :closable="false" width="900px">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center">
          {{ isReadOnly ? t('viewOrder', '檢視訂單') : isCreate ? t('addOrder', '新增訂單') : t('editOrder', '編輯訂單') }}
        </div>
        <button v-if="!fullscreen" class="ml-[-32px]!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="ml-[-32px]!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>

    <perfect-scrollbar :class="fullscreen ? 'h-[calc(100vh-170px)]' : 'h-[calc(100vh-350px)]'">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="col-span-2 flex flex-col gap-4">
            <!-- 訂購人資訊 -->
            <div class="flex flex-col rounded-lg border bg-gray-50 p-4">
              <h4 class="mb-4 text-[18px] font-medium text-gray-700">{{ t('orderBasicInfo', '訂單基本資訊') }}</h4>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <AFormItem :label="t('targetType', '出貨對象類型')" field="targetType">
                  <CustomField v-model="basicForm.targetType" type="select" :options="targetTypeOptions" :readonly="!canModifyTarget" @change="changeTargetType" />
                </AFormItem>
                <AFormItem v-if="basicForm.targetType === 'CUSTOMER'" :label="t('customer', '客戶')" field="targetId">
                  <InfiniteSelect
                    v-model="basicForm.targetId"
                    dataSource="customers"
                    :placeholder="t('pleaseSelectCustomer', '請選擇客戶')"
                    :readonly="!canModifyTarget"
                    @change="(value) => changeTarget(value, 'customer')"
                  />
                </AFormItem>
                <AFormItem v-else-if="basicForm.targetType === 'VENDOR'" :label="t('vendor', '廠商')" field="targetId">
                  <InfiniteSelect
                    v-model="basicForm.targetId"
                    dataSource="vendors"
                    :placeholder="t('pleaseSelectVendor', '請選擇廠商')"
                    :disabled="!canModifyTarget"
                    @change="(value) => changeTarget(value, 'vendor')"
                  />
                </AFormItem>
                <AFormItem :label="t('contact', '聯絡人')">
                  <CustomField v-model="basicForm.contact" type="input" :placeholder="t('pleaseEnterContact', '請輸入聯絡人')" :readonly="isReadOnly" />
                </AFormItem>
                <AFormItem :label="t('phone', '電話')">
                  <CustomField v-model="basicForm.phone" type="input" :placeholder="t('pleaseEnterPhone', '請輸入電話')" :readonly="isReadOnly" />
                </AFormItem>
              </div>
            </div>

            <!-- 訂單明細 -->
            <div class="my-4 rounded-lg border p-4">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="mb-4 text-[18px] font-medium text-gray-700">{{ t('orderItems', '訂單明細') }}</h4>
                <div class="flex items-center gap-2">
                  <span v-if="!canModifyItems && !isReadOnly" class="text-sm text-amber-600">{{ t('itemsLockedHint', '此狀態下無法修改項目') }}</span>
                  <Button v-if="canModifyItems && !isReadOnly" @click="addItem">{{ t('addItem', '新增項目') }}</Button>
                </div>
              </div>
              <div v-if="!basicForm.items.length" class="text-center text-gray-500">{{ t('noItems', '目前尚未新增商品') }}</div>
              <div v-else class="space-y-3">
                <div v-for="(item, index) in basicForm.items" :key="index" class="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-7">
                    <AFormItem :label="t('product', '商品')" :field="`items[${index}].productId`" :rules="[{ required: true, message: t('productRequired') }]" class="col-span-2">
                      <InfiniteSelect
                        v-model="item.productId"
                        dataSource="products"
                        :placeholder="t('pleaseSelectProduct', '請選擇商品')"
                        :readonly="!canModifyItems"
                        @change="(product) => changeProduct(product, index)"
                        :filters="{ categoryId: props.categoryId }"
                      />
                    </AFormItem>
                    <AFormItem :label="t('basePriceAmount', '建議單價')">
                      <p class="h-8 w-full text-right text-[16px]">{{ item.basePriceAmount }}</p>
                    </AFormItem>
                    <AFormItem :label="t('unit', '規格')">
                      <CustomField v-model="item.unit" type="input" :readonly="!canModifyItems" />
                    </AFormItem>
                    <AFormItem :label="t('unitPrice', '實際單價')">
                      <CustomField v-model="item.unitPrice.amount" type="number" :min="0" :readonly="!canModifyItems" />
                    </AFormItem>
                    <AFormItem :label="t('quantity', '數量')" :field="`items[${index}].quantity`" :rules="[{ required: true, message: t('quantityRequired') }]">
                      <CustomField v-model="item.quantity" type="number" :min="0.001" :readonly="!canModifyItems" />
                    </AFormItem>
                    <AFormItem :label="t('subtotal', '小計')">
                      <p class="h-8 w-full text-right text-[16px] text-emerald-500">{{ item.total }}</p>
                    </AFormItem>
                  </div>
                  <button v-if="canModifyItems && !isReadOnly" class="table-button mt-8" @click="removeItem(index)"><Trash2 class="size-4 text-rose-500" /></button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col rounded-lg border bg-gray-50 p-4">
              <AFormItem :label="t('orderDate', '訂單日期')" field="orderDate">
                <CustomField v-model="basicForm.orderDate" type="date-picker" class="w-full" :readonly="!canModifyItems" />
              </AFormItem>
              <AFormItem :label="t('shipDate', '出貨日期')">
                <CustomField v-model="basicForm.shipDate" type="date-picker" class="w-full" :readonly="isReadOnly" />
              </AFormItem>
              <AFormItem :label="t('notes', '備註')">
                <CustomField v-model="basicForm.notes" type="textarea" :rows="3" :placeholder="t('pleaseEnterNotes', '請輸入備註')" :readonly="isReadOnly" />
              </AFormItem>
              <AFormItem v-if="isEdite" :label="t('status', '狀態')" field="status">
                <CustomField v-model="basicForm.status" type="select" :options="editableStatusOptions" :readonly="isReadOnly" />
              </AFormItem>
            </div>

            <!-- 付款與出貨資訊 -->
            <div class="mb-4 rounded-lg border bg-gray-50 p-4">
              <h4 class="mb-4 text-[18px] font-medium text-gray-700">{{ t('paymentAndShipping', '付款與出貨資訊') }}</h4>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <AFormItem :label="t('paymentMethod', '付款方式')">
                  <CustomField v-model="basicForm.paymentTerm" type="select" :options="paymentTermOptions" :readonly="isReadOnly" />
                </AFormItem>
                <AFormItem :label="t('shipMethodLabel', '出貨方式')">
                  <CustomField v-model="basicForm.shipMethod" type="select" :options="shipMethodOptions" :readonly="isReadOnly" @change="basicForm.driverId = {}" />
                </AFormItem>
                <AFormItem v-if="basicForm.shipMethod === 'DRIVER_DELIVERY'" :label="t('driver', '司機')">
                  <InfiniteSelect v-model="basicForm.driverId" dataSource="users" :placeholder="t('pleaseSelectDriver', '請選擇司機')" :readonly="isReadOnly" allowClear />
                </AFormItem>
              </div>
            </div>

            <!-- 訂單金額 -->
            <div class="mb-4 rounded-lg border bg-gray-50 p-4">
              <h4 class="mb-4 text-[18px] font-medium text-gray-700">{{ t('orderAmount', '訂單金額') }}</h4>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2" v-if="!isReadOnly">
                <AFormItem :label="t('discount', '折扣')">
                  <CustomField v-model="basicForm.discountAmount" type="number" :min="0" :readonly="isReadOnly" thousands />
                </AFormItem>
                <AFormItem :label="t('shippingFee', '運費')">
                  <CustomField v-model="basicForm.shippingAmount" type="number" :min="0" :readonly="isReadOnly" thousands />
                </AFormItem>
              </div>
              <!-- 金額摘要 -->
              <div class="mt-4 flex flex-col items-end gap-1 border-t pt-4 text-right">
                <div class="flex w-48 justify-between">
                  <span class="text-gray-600">{{ t('subtotal', '小計') }}：</span>
                  <span class="font-medium">{{ formatNumber(orderSubtotal) }}</span>
                </div>
                <div class="flex w-48 justify-between">
                  <span class="text-gray-600">{{ t('discount', '折扣') }}：</span>
                  <span class="text-rose-500">- {{ formatNumber(Number(basicForm.discountAmount) || 0) }}</span>
                </div>
                <div class="flex w-48 justify-between">
                  <span class="text-gray-600">{{ t('shippingFee', '運費') }}：</span>
                  <span>+ {{ formatNumber(Number(basicForm.shippingAmount) || 0) }}</span>
                </div>
                <div class="mt-2 flex w-48 justify-between border-t pt-2">
                  <span class="text-lg font-semibold text-gray-900">{{ t('totalAmount', '總計') }}：</span>
                  <span class="text-lg font-semibold text-emerald-600">{{ formatCurrencyNumber(orderTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="mx-2 flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ isReadOnly ? t('close', '關閉') : t('cancel', '取消') }}</a-button>
        <Button v-if="!isReadOnly" :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { OrderCreatePost, OrderDeleteById, OrderGetByID, OrderListGet, OrderUpdatePatch, OrderStatusUpdatePatch } from '@/assets/API/Order';
import AppPagination from '@/components/ui/AppPagination.vue';
import CustomField from '@/components/Form/CustomField.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { Button } from '@/components/ui/button';
import { TinyButton, TinyDatePicker, TinyInput, TinySelect } from '@opentiny/vue';
import { Card, CardContent } from '@/components/ui/card';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { SquarePen, Trash2, Expand, Shrink, Eye } from 'lucide-vue-next';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Form as AForm, FormItem as AFormItem } from '@arco-design/web-vue';
import { endOfDay } from 'date-fns';
import { JsonViewer } from 'vue3-json-viewer';
import { usePermissionStore } from '@/stores/PermissionStore';

const permissionStore = usePermissionStore();

const props = defineProps({
  pageTitle: { type: String, required: true },
  categoryId: { type: String, default: undefined },
  categoryCode: { type: String, default: undefined },
});
import { useCurrencyStore } from '@/stores/currency';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();
const { formatNumber, formatCurrencyNumber } = currencyStore;
const formatDate = (value, format = 'YYYY-MM-DD HH:mm') => timezoneStore.formatDate(value, format);

const isCreate = computed(() => dialogMode.value === 'create');
const isEdite = computed(() => dialogMode.value === 'edit');
const EMPTY_PLACEHOLDER = t('unset', '未設定');

/** 分頁頁籤相關 **/
const TAB_KEYS = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
};
const activeKey = ref('CUSTOMER');
const isCustomer = computed(() => activeKey.value === 'CUSTOMER');
const isVendor = computed(() => activeKey.value === 'VENDOR');

/** 下拉選單選項相關 **/
const targetTypeOptions = [
  { label: t('customer', '客戶'), value: 'CUSTOMER' },
  { label: t('vendor', '廠商'), value: 'VENDOR' },
];
const paymentTermOptions = [
  { label: t('cash', '現金'), value: 'CASH' },
  { label: t('monthly', '月結'), value: 'MONTHLY' },
  { label: t('prepaid', '預付'), value: 'PREPAID' },
];
const shipMethodOptions = [
  { label: t('pickup', '自取'), value: 'PICKUP' },
  { label: t('driverDelivery', '司機送貨'), value: 'DRIVER_DELIVERY' },
  { label: t('courier', '宅配'), value: 'COURIER' },
];
const statusOptions = [
  { label: t('all', '全部'), value: 'all' },
  { label: t('PENDING', '待出貨'), value: 'PENDING' },
  { label: t('PROCESSING', '處理中'), value: 'PROCESSING' },
  { label: t('DELIVERED', '已完成'), value: 'DELIVERED' },
  { label: t('CANCELLED', '取消'), value: 'CANCELLED' },
];
const statusBackendToKeyMap = {
  待出貨: 'PENDING',
  處理中: 'PROCESSING',
  已完成: 'DELIVERED',
  取消: 'CANCELLED',
};
const targetTypeMap = { 客戶: 'CUSTOMER', 廠商: 'VENDOR', 臨時客戶: 'TEMPORARY_CUSTOMER' };
const paymentMethodMap = { 現金: 'CASH', 月結: 'MONTHLY', 預付: 'PREPAID' };
const shipMethodMap = { 自取: 'PICKUP', 司機送貨: 'DRIVER_DELIVERY', 宅配: 'COURIER' };
const statusSubmitMap = { PENDING: 'PENDING', PROCESSING: 'PROCESSING', DELIVERED: 'DELIVERED', CANCELLED: 'CANCELLED' };
const statusFilterMap = {
  PENDING: ['DRAFT', 'PENDING', 'CONFIRMED'],
  PROCESSING: ['PROCESSING', 'SHIPPED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED', 'RETURNED'],
};
const defaultFilters = {
  search: '',
  status: 'all',
  orderNumber: '',
  targetType: '',
  orderDateFrom: '',
  orderDateTo: '',
};

/** 狀態變更與轉換邏輯 **/
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
  return originalStatus.value === 'PENDING';
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

/** 共用工具函數 **/
const toggleActiveKey = async (type) => {
  activeKey.value = type;
  filters.targetType = type;
  await getAPI();
}; //切換客戶/廠商頁籤

/** 列表資料取得相關 **/
const responseDataToList = (item = {}) => {
  const statusKey = statusBackendToKeyMap[item.status] || item.status;
  return {
    id: item.id,
    orderNumber: item.orderNumber,
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
    statusLabel: item.status,
    orderDate: item.orderDate,
    shipDate: item.shipDate,
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    raw: item,
  };
}; //列表資料轉換
const wrappedOrdersListGet = (params) => {
  const processedParams = { ...params };
  // if (props.categoryId) processedParams.categoryId = props.categoryId;
  if (props.categoryCode) processedParams.categoryCode = props.categoryCode;

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
const dialogMode = ref('create');
const fullscreen = ref(true);
const dialogVisible = ref(false);
const editingId = ref(null);
const originalStatus = ref(null);
const basicFormRef = ref(null);
const isSaving = ref(false);
const initializeForm = () => ({
  targetType: 'CUSTOMER',
  targetId: '',
  temporaryCustomerName: '',
  categoryId: props.categoryId,
  orderDate: new Date(),
  expectedDeliveryDate: null,
  phone: '',
  contact: '',
  paymentTerm: 'CASH',
  shipMethod: 'PICKUP',
  shipDate: null,
  driverId: '',
  items: [],
  discountAmount: 0,
  shippingAmount: 0,
  shippingAddress: {},
  notes: '',
  internalNotes: '',
  status: 'PENDING',
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  targetId: [
    {
      required: true,
      message: t('targetRequired'),
      validator: (value, callback) => {
        if (basicForm.value.targetType !== 'TEMPORARY_CUSTOMER' && !value) {
          callback(t('targetRequired'));
        } else {
          callback();
        }
      },
    },
  ],
  orderDate: [{ required: true, message: t('orderDateRequired') }],
  items: [{ type: 'array', min: 1, message: t('orderItemsRequired') }],
}; //表單驗證規則
const changeTargetType = () => {
  basicForm.value.contact = '';
  basicForm.value.phone = '';
}; //選擇出貨對象類型變更
const changeTarget = (item, type = 'customer') => {
  if (type === 'vendor') basicForm.value.contact = item.contactPerson;
  if (type === 'customer') {
    basicForm.value.contact = item.customFields?.contacts?.find((c) => c.isPrimary)?.name ?? '';
  }
  basicForm.value.phone = item.contactInfo?.phone;
}; //選擇對象變更
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
  });
}; //新增訂單項目
const removeItem = (index) => {
  basicForm.value.items.splice(index, 1);
}; //移除訂單項目
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
    const statusKey = statusBackendToKeyMap[orderData.status] || orderData.status || 'PENDING';
    originalStatus.value = statusKey;
    const targetTypeValue = targetTypeMap[orderData.targetType] || orderData.targetType || 'CUSTOMER';
    const paymentTermValue = paymentMethodMap[orderData.paymentMethod] || orderData.paymentTerm || 'CASH';
    const shipMethodValue = shipMethodMap[orderData.shipMethod] || orderData.shipMethod || 'PICKUP';

    const items = (orderData.products || orderData.items || []).map((item, index) => {
      const unitPriceAmount = Number(item.actualPrice ?? item.unitPrice?.amount ?? item.unitPriceAmount ?? 0);
      const quantity = Number(item.quantity || 0);
      const basePriceAmount = Number(item.retailPrice ?? item.basePriceAmount ?? item.product?.basePriceAmount ?? 0);
      return {
        id: item.id ?? index + 1,
        productId: { id: item.productId, name: item.productName, ...item },
        productName: item.productName || item.product?.name || '',
        basePriceAmount,
        unit: item.unit || item.product?.unit || '',
        quantity,
        unitPrice: { amount: unitPriceAmount, currency: item.unitPrice?.currency || 'TWD' },
        total: unitPriceAmount * quantity,
      };
    });

    basicForm.value = {
      targetType: targetTypeValue,
      targetId: { id: orderData.targetId, name: orderData.targetName },
      temporaryCustomerName: orderData.temporaryCustomerName || '',
      categoryId: orderData.categoryId || props.categoryId,
      orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
      expectedDeliveryDate: orderData.expectedDeliveryDate ? new Date(orderData.expectedDeliveryDate) : null,
      phone: orderData.phone || '',
      contact: orderData.contact || '',
      paymentTerm: paymentTermValue,
      shipMethod: shipMethodValue,
      shipDate: orderData.shipDate ? new Date(orderData.shipDate) : null,
      driverId: orderData.driverId || orderData.employeeId || '',
      items,
      discountAmount: Number(orderData.discount ?? orderData.discountAmount?.amount ?? 0),
      shippingAmount: Number(orderData.shippingFee ?? orderData.shippingAmount?.amount ?? 0),
      shippingAddress: orderData.shippingAddress || {},
      notes: orderData.note || orderData.notes || '',
      internalNotes: orderData.internalNotes || '',
      status: statusKey,
    };
    dialogVisible.value = true;
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
}; //提取 UUID
const preparePayload = () => {
  const form = basicForm.value;
  const payload = {
    targetType: form.targetType,
    categoryId: form.categoryId || props.categoryId,
    paymentTerm: form.paymentTerm,
    shipMethod: form.shipMethod,
    notes: form.notes || undefined,
    items: form.items.map((item) => ({
      productId: extractUUID(item.productId),
      quantity: Number(item.quantity),
      unitPrice: item.unitPrice?.amount ? { amount: Number(item.unitPrice.amount), currency: 'TWD' } : undefined,
    })),
  };

  if (isCreate.value) {
    payload.orderDate = form.orderDate;
  }

  if (form.targetType === 'CUSTOMER') payload.customerId = extractUUID(form.targetId);
  if (form.targetType === 'VENDOR') payload.vendorId = extractUUID(form.targetId);
  if (form.targetType === 'TEMPORARY_CUSTOMER') payload.temporaryCustomerName = form.temporaryCustomerName;
  if (form.phone) payload.phone = form.phone;
  if (form.contact) payload.contact = form.contact;
  if (form.shipDate) payload.shipDate = form.shipDate;
  if (form.driverId) payload.driverId = extractUUID(form.driverId);
  if (form.expectedDeliveryDate) payload.expectedDeliveryDate = form.expectedDeliveryDate;
  if (form.discountAmount > 0) payload.discountAmount = { amount: Number(form.discountAmount), currency: 'TWD' };
  if (form.shippingAmount > 0) payload.shippingAmount = { amount: Number(form.shippingAmount), currency: 'TWD' };

  return payload;
}; //整理儲存 Payload
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
  if (validateResult) return;

  const fullPayload = preparePayload();
  if (!fullPayload) return;

  try {
    isSaving.value = true;
    if (isCreate.value) {
      await OrderCreatePost(fullPayload);
    } else {
      const form = basicForm.value;
      const statusChanged = form.status !== originalStatus.value;
      const contentPayload = { ...fullPayload };
      delete contentPayload.status;
      // 非 DRAFT/PENDING 狀態不能修改 items
      if (!['DRAFT', 'PENDING'].includes(originalStatus.value)) {
        delete contentPayload.items;
      }
      await OrderUpdatePatch(editingId.value, contentPayload);
      if (statusChanged) {
        const statusKey = statusSubmitMap[form.status] || form.status;
        await updateOrderStatusWithAutoPromote(editingId.value, statusKey);
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

onMounted(getAPI);
watch(
  () => basicForm.value.items.map((item) => ({ unitPrice: item.unitPrice?.amount, quantity: item.quantity })),
  () => updateAllItemTotals(),
  { deep: true },
); //監聽訂單項目變化更新小計
</script>
