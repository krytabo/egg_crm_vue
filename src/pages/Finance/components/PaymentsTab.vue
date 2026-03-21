<!-- src/pages/billing/components/PaymentsTab.vue 付款記錄 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 篩選區塊 -->
    <CustomForm :col="3">
      <CustomFormItem :label="t('paymentDate', '付款日期')">
        <div class="flex items-center gap-2">
          <TinyDatePicker v-model="filters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
          <span>-</span>
          <TinyDatePicker v-model="filters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
        </div>
      </CustomFormItem>
      <CustomFormItem :label="t('customer', '客戶')">
        <InfiniteSelect v-model="filters.customerId" dataSource="customers" :placeholder="t('all', '全部')" allowClear class="w-48" @change="handleFiltersChange" />
      </CustomFormItem>
      <CustomFormItem :label="t('search', '關鍵字')">
        <CustomField v-model="filters.search" type="input" :placeholder="t('remittanceAccount', '匯款帳號')" @keyup.enter="handleFiltersChange" />
      </CustomFormItem>
    </CustomForm>

    <!-- 付款記錄列表 -->
    <!--<JsonViewer :value="basicDataList" boxed copyable />-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
      <CustomTinyGridColumn field="customer" :title="t('customer', '客戶')" min-width="180" fixed="left">
        <template #default="{ row }">{{ row.customer?.name }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="amount" :title="t('paymentAmount', '付款金額')" width="140" align="right">
        <template #default="{ row }">
          <span class="font-medium text-green-600">{{ formatCurrencyNumber(row.amount) }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="method" :title="t('paymentMethod', '付款方式')" width="120">
        <template #default="{ row }">
          <TinyBadge :type="getMethodType(row.method)">{{ getMethodLabel(row.method) }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="reference" :title="t('remittanceAccount', '匯款帳號')" width="150">
        <template #default="{ row }">{{ row.reference || EMPTY_PLACEHOLDER }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="paidAt" :title="t('paidAt', '付款時間')" width="160" />
      <CustomTinyGridColumn field="invoiceStatus" :title="t('invoiceStatus', '發票狀態')" width="120">
        <template #default="{ row }">
          <TinyBadge :type="getInvoiceStatusType(row.invoiceStatus)">{{ getInvoiceStatusLabel(row.invoiceStatus) }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="notes" :title="t('notes', '備註')" min-width="150">
        <template #default="{ row }">{{ row.notes || EMPTY_PLACEHOLDER }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn
        field="createdAt"
        :title="t('createdAt', '建立時間')"
        width="160"
        sortable
        :sort-field="'createdAt'"
        :current-order="getColumnOrder('createdAt')"
        @sort="handleColumnSort"
      />
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
  </div>

  <!-- 新增付款彈窗 -->
  <a-modal v-model:visible="dialogVisible" :title="t('processPayment', '處理付款')" width="500px" :mask-closable="false">
    <perfect-scrollbar class="max-h-[calc(100vh-400px)] pr-4">
      <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <!--<AFormItem :label="t('invoiceNumber', '發票號碼')" field="invoiceId">
          &lt;!&ndash;<InfiniteSelect
            v-model="basicForm.invoiceId"
            dataSource="invoices"
            :placeholder="t('pleaseSelect', '請選擇')"
            :disabled="!!preselectedInvoice"
            :filter-params="{ status: ['SENT', 'PARTIAL', 'OVERDUE'] }"
            @change="handleInvoiceChange"
          />&ndash;&gt;
          <CustomField v-model="basicForm.invoiceId" :placeholder="t('invoiceNumberPlaceholder', '請輸入已開立的發票號碼')" />
        </AFormItem>-->

        <!-- 發票資訊顯示 -->
        <div v-if="selectedInvoiceInfo" class="mb-4 rounded bg-blue-50 p-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('totalAmount', '總金額') }}：</span>
            <span class="font-medium">{{ formatCurrencyNumber(selectedInvoiceInfo.totalAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('paidAmount', '已付金額') }}：</span>
            <span class="text-green-600">{{ formatCurrencyNumber(selectedInvoiceInfo.paidAmount) }}</span>
          </div>
          <div class="flex justify-between border-t border-blue-200 pt-2">
            <span class="text-gray-600">{{ t('remainingAmount', '未付金額') }}：</span>
            <span class="font-medium text-orange-600">{{ formatCurrencyNumber(selectedInvoiceInfo.remainingAmount) }}</span>
          </div>
        </div>

        <AFormItem :label="t('receivedAmount', '收款金額')" field="amount">
          <CustomField v-model="basicForm.amount" type="number" :min="0" :max="selectedInvoiceInfo?.remainingAmount || 999999999" />
        </AFormItem>
        <AFormItem :label="t('paymentMethod', '付款方式')" field="method">
          <TinySelect v-model="basicForm.method" :options="methodOptions" :placeholder="t('pleaseSelect', '請選擇')" />
        </AFormItem>
        <AFormItem :label="t('remittanceAccount', '匯款帳號')">
          <CustomField v-model="basicForm.reference" type="input" :placeholder="t('referenceHint', '如：銀行轉帳編號')" />
        </AFormItem>
        <AFormItem :label="t('paidAt', '付款時間')" field="paidAt">
          <TinyDatePicker v-model="basicForm.paidAt" :placeholder="t('pleaseSelect', '請選擇')" value-format="yyyy-MM-dd HH:mm:ss" type="datetime" class="w-full" />
        </AFormItem>
        <AFormItem :label="t('notes', '備註')">
          <CustomField v-model="basicForm.notes" type="textarea" :placeholder="t('pleaseEnterNotes', '請輸入備註')" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="dialogVisible = false">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :loading="isSaving" @click="handleSubmit">{{ isSaving ? t('processing', '處理中') : t('confirmPayment', '確認付款') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue';
import { PaymentListGet, PaymentProcessPost, PaymentGetById } from '@/assets/API/Billing';
import { InvoiceGetById } from '@/assets/API/Billing';
import { TinySelect, TinyBadge, TinyDatePicker } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { useWindowSize } from '@vueuse/core';
import { useCurrencyStore } from '@/stores/currency';
import { useI18n } from 'vue-i18n';
import { endOfDay, format } from 'date-fns';
import { debounce } from 'lodash';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const systemStore = useSystemStore();
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 440, 100));
const currencyStore = useCurrencyStore();
const { formatNumber, formatCurrencyNumber } = currencyStore;
const { t } = useI18n();

/** 付款方式相關 **/
const EMPTY_PLACEHOLDER = '—';
const methodOptions = [
  { label: t('cash', '現金'), value: 'CASH' },
  { label: t('card', '信用卡'), value: 'CARD' },
  { label: t('transfer', '轉帳'), value: 'TRANSFER' },
  { label: t('check', '支票'), value: 'CHECK' },
];
const getMethodLabel = (method) => {
  const map = {
    CASH: t('cash', '現金'),
    CARD: t('card', '信用卡'),
    TRANSFER: t('transfer', '轉帳'),
    CHECK: t('check', '支票'),
  };
  return map[method] || method;
}; //取得付款方式標籤
const getMethodType = (method) => {
  const map = {
    CASH: 'success',
    CARD: 'info',
    TRANSFER: 'warning',
    CHECK: 'info',
  };
  return map[method] || 'info';
}; //取得付款方式顏色

/** 發票狀態相關 **/
const getInvoiceStatusLabel = (status) => {
  const map = {
    DRAFT: t('draft', '草稿'),
    SENT: t('sent', '已發送'),
    PAID: t('paid', '已付款'),
    PARTIAL: t('partial', '部分付款'),
    OVERDUE: t('overdue', '逾期'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
}; //取得發票狀態標籤
const getInvoiceStatusType = (status) => {
  const map = {
    DRAFT: 'info',
    SENT: 'warning',
    PAID: 'success',
    PARTIAL: 'warning',
    OVERDUE: 'danger',
    CANCELLED: 'info',
  };
  return map[status] || 'info';
}; //取得發票狀態顏色

/** 排序相關 **/
const sortField = ref('createdAt');
const sortDirection = ref(null);
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');
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
  ...item,
  id: item.id,
  invoiceId: item.invoiceId,
  customer: item.invoice?.customer || EMPTY_PLACEHOLDER,
  amount: item.amount || 0,
  method: item.method,
  reference: item.reference || '',
  paidAt: timezoneStore.formatDate(item.paidAt) || EMPTY_PLACEHOLDER,
  invoiceStatus: item.invoice?.status || '',
  invoiceTotalAmount: item.invoice?.totalAmount || 0,
  notes: item.notes || '',
  createdAt: timezoneStore.formatDate(item.createdAt) || EMPTY_PLACEHOLDER,
  raw: item,
}); //結果轉換
const defaultFilters = {
  customerId: '',
  startDate: '',
  endDate: '',
  search: '',
};
const wrappedPaymentListGet = (params) => {
  const processedParams = { ...params };
  processedParams.customerId = params.customerId?.id;
  if (processedParams.endDate) {
    processedParams.endDate = endOfDay(new Date(processedParams.endDate));
  }
  if (sortField.value && sortDirection.value) {
    processedParams.sortBy = sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }
  return PaymentListGet(processedParams);
}; //包裝 API 處理日期與排序
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedPaymentListGet,
  defaultFilters,
  {
    responseDataToList,
  },
);
const getAPI = () => getDefaultAPI();

/** 新增付款 **/
const dialogVisible = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const preselectedInvoice = ref(null);
const selectedInvoiceInfo = ref(null);
const initializeForm = () => ({
  invoiceId: '',
  amount: 0,
  method: 'CASH',
  reference: '',
  paidAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  notes: '',
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  invoiceId: [{ required: true, message: t('required', '此欄位必填') }],
  amount: [{ required: true, message: t('required', '此欄位必填') }],
  method: [{ required: true, message: t('required', '此欄位必填') }],
};
const openPaymentDialog = async (invoice = null) => {
  basicForm.value = initializeForm();
  selectedInvoiceInfo.value = null;
  if (invoice) {
    preselectedInvoice.value = invoice;
    basicForm.value.invoiceId = invoice.id;
    // basicForm.value.invoiceId = '';
    selectedInvoiceInfo.value = {
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount || 0,
      remainingAmount: invoice.remainingAmount || invoice.totalAmount,
    };
    basicForm.value.amount = selectedInvoiceInfo.value.remainingAmount;
  } else {
    preselectedInvoice.value = null;
  }
  dialogVisible.value = true;
}; //開啟付款對話框
const preparePayload = () => {
  return {
    invoiceId: basicForm.value.invoiceId,
    amount: Number(basicForm.value.amount),
    method: basicForm.value.method,
    reference: basicForm.value.reference || undefined,
    paidAt: basicForm.value.paidAt ? new Date(basicForm.value.paidAt).toISOString() : undefined,
    notes: basicForm.value.notes || undefined,
  };
}; //準備送出資料
const _saveForm = async () => {
  const validateResult = await formRef.value?.validate();
  if (validateResult) return;

  mainStore.setLoading(true);
  isSaving.value = true;
  try {
    const payload = preparePayload();
    await PaymentProcessPost(payload);
    await mainStore.SWAL_Success(t('paymentSuccess', '付款成功'));
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
    isSaving.value = false;
  }
}; //儲存
const handleSubmit = debounce(_saveForm, 300, { leading: true, trailing: false });

defineExpose({
  openPaymentDialog,
  clearFilter,
  getAPI,
});
const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
});
</script>
