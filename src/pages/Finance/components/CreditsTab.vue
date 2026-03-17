<!-- src/pages/billing/components/CreditMemosTab.vue 折讓單 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 篩選區塊 -->
    <div class="flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
      <AForm layout="vertical">
        <div class="grid grid-cols-2 gap-2">
          <AFormItem :label="t('status', '狀態')">
            <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable class="w-32" @change="handleFiltersChange" />
          </AFormItem>
          <AFormItem :label="t('invoice', '發票')">
            <InfiniteSelect
              v-model="filters.invoiceId"
              dataSource="Invoice"
              :placeholder="t('all', '全部')"
              allowClear
              class="w-48"
              @change="handleFiltersChange"
              emitValue
              :filters="{ status: 'active' }"
            />
          </AFormItem>
        </div>
      </AForm>
    </div>

    <!-- 折讓單列表 -->
    <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" row-key="id">
      <CustomTinyGridColumn field="creditMemoNumber" :title="t('creditMemoNumber', '折讓單號')" width="220" fixed="left" />
      <!--<CustomTinyGridColumn field="invoiceNumber" :title="t('invoiceNumber', '發票號碼')" width="160" />-->
      <CustomTinyGridColumn field="customerName" :title="t('customer', '客戶')" min-width="180" />
      <CustomTinyGridColumn field="amount" :title="t('creditAmount', '折讓金額')" width="140" align="right">
        <template #default="{ row }">
          <span class="font-medium text-red-600">-NT$ {{ formatNumber(row.amount) }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="100">
        <template #default="{ row }">
          <TinyBadge :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="reason" :title="t('reason', '原因')" min-width="200">
        <template #default="{ row }">{{ row.reason || EMPTY_PLACEHOLDER }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="appliedAt" :title="t('appliedAt', '套用時間')" width="160">
        <template #default="{ row }">{{ row.appliedAt || EMPTY_PLACEHOLDER }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="createdAt" :title="t('createdAt', '建立時間')" width="160" />
      <CustomTinyGridColumn field="actions" :title="t('actions', '操作')" width="160" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-2">
            <a-button v-if="row.status === 'DRAFT'" type="text" status="success" @click="handleApplyCreditMemo(row)">{{ t('apply', '套用') }}</a-button>
            <a-button v-if="row.status === 'DRAFT'" type="text" status="danger" @click="handleCancelCreditMemo(row)">{{ t('cancel', '取消') }}</a-button>
            <a-button v-if="row.status === 'APPLIED'" type="text" status="danger" @click="handleCancelCreditMemo(row)">{{ t('void', '作廢') }}</a-button>
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
  </div>

  <!-- 新增折讓單彈窗 -->
  <a-modal v-model:visible="dialogVisible" :title="t('createCreditMemo', '新增折讓單')" width="500px" :mask-closable="false">
    <perfect-scrollbar class="h-[calc(100vh-400px)] pr-4">
      <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <AFormItem :label="t('invoice', '發票')" field="invoiceId">
          <InfiniteSelect
            v-model="basicForm.invoiceId"
            dataSource="Invoice"
            :placeholder="t('pleaseSelect', '請選擇')"
            :filter-params="{ status: ['SENT', 'PARTIAL', 'PAID', 'OVERDUE'] }"
            @change="handleInvoiceChange"
          />
        </AFormItem>

        <!-- 發票資訊顯示 -->
        <div v-if="selectedInvoiceInfo" class="mb-4 rounded bg-blue-50 p-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('totalAmount', '總金額') }}：</span>
            <span class="font-medium">NT$ {{ formatNumber(selectedInvoiceInfo.totalAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('paidAmount', '已付金額') }}：</span>
            <span class="text-green-600">NT$ {{ formatNumber(selectedInvoiceInfo.paidAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('creditedAmount', '已折讓金額') }}：</span>
            <span class="text-red-600">NT$ {{ formatNumber(selectedInvoiceInfo.creditedAmount) }}</span>
          </div>
          <div class="flex justify-between border-t border-blue-200 pt-2">
            <span class="text-gray-600">{{ t('maxCreditAmount', '可折讓金額') }}：</span>
            <span class="font-medium text-orange-600">NT$ {{ formatNumber(selectedInvoiceInfo.maxCreditAmount) }}</span>
          </div>
        </div>

        <AFormItem :label="t('payment', '付款記錄（選填）')">
          <TinySelect v-model="basicForm.paymentId" :options="paymentOptions" :placeholder="t('selectPayment', '選擇特定付款記錄')" clearable />
        </AFormItem>

        <AFormItem :label="t('creditAmount', '折讓金額')" field="amount">
          <CustomField v-model="basicForm.amount" type="number" :min="0.01" :max="selectedInvoiceInfo?.maxCreditAmount || 999999999" />
        </AFormItem>

        <AFormItem :label="t('reason', '折讓原因')" field="reason">
          <CustomField v-model="basicForm.reason" type="textarea" :placeholder="t('pleaseEnterReason', '請輸入折讓原因')" :max-length="500" />
        </AFormItem>

        <AFormItem :label="t('notes', '備註')">
          <CustomField v-model="basicForm.notes" type="textarea" :placeholder="t('pleaseEnterNotes', '請輸入備註')" :max-length="1000" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="dialogVisible = false">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :disabled="isSaving" :loading="isSaving" @click="handleSubmit">{{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { CreditMemoListGet, CreditMemoCreatePost, CreditMemoGetById, CreditMemoApplyPost, CreditMemoCancelPost, InvoiceSendPost } from '@/assets/API/Billing';
import { InvoiceGetById } from '@/assets/API/Billing';
import { TinySelect, TinyBadge } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const systemStore = useSystemStore();
const { t } = useI18n();

/** 常數相關 **/
const EMPTY_PLACEHOLDER = '—';
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString();
}; //格式化數字

/** 狀態相關 **/
const statusOptions = [
  { label: t('draft', '草稿'), value: 'DRAFT' },
  { label: t('applied', '已套用'), value: 'APPLIED' },
  { label: t('cancelled', '已取消'), value: 'CANCELLED' },
];
const getStatusLabel = (status) => {
  const map = {
    DRAFT: t('draft', '草稿'),
    APPLIED: t('applied', '已套用'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
}; //取得狀態標籤
const getStatusType = (status) => {
  const map = {
    DRAFT: 'info',
    APPLIED: 'success',
    CANCELLED: 'warning',
  };
  return map[status] || 'info';
}; //取得狀態顏色

/** 列表資料 **/
const responseDataToList = (item = {}) => ({
  id: item.id,
  creditMemoNumber: item.creditMemoNumber || EMPTY_PLACEHOLDER,
  invoiceId: item.invoiceId,
  invoiceNumber: item.invoice?.invoiceNumber || item.invoiceId || EMPTY_PLACEHOLDER,
  customerName: item.invoice?.customer?.name || EMPTY_PLACEHOLDER,
  amount: item.amount || 0,
  reason: item.reason || '',
  status: item.status,
  appliedAt: item.appliedAt ? timezoneStore.formatDate(item.appliedAt) : null,
  createdAt: timezoneStore.formatDate(item.createdAt) || EMPTY_PLACEHOLDER,
  notes: item.notes || '',
  raw: item,
}); //結果轉換
const defaultFilters = {
  status: '',
  invoiceId: '',
};
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(CreditMemoListGet, defaultFilters, {
  responseDataToList,
});
const getAPI = () => getDefaultAPI();

/** 新增折讓單 **/
const dialogVisible = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const selectedInvoiceInfo = ref(null);
const paymentOptions = ref([]);
const initializeForm = () => ({
  invoiceId: '',
  paymentId: '',
  amount: 0,
  reason: '',
  notes: '',
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  invoiceId: [{ required: true, message: t('required', '此欄位必填') }],
  amount: [{ required: true, message: t('required', '此欄位必填') }],
  reason: [{ required: true, message: t('required', '此欄位必填') }],
};

const openCreateDialog = () => {
  basicForm.value = initializeForm();
  selectedInvoiceInfo.value = null;
  paymentOptions.value = [];
  dialogVisible.value = true;
}; //開啟新增對話框

const handleInvoiceChange = async (invoice) => {
  if (!invoice) {
    selectedInvoiceInfo.value = null;
    paymentOptions.value = [];
    return;
  }

  const invoiceId = typeof invoice === 'object' ? invoice.id : invoice;
  mainStore.setLoading(true);
  try {
    const response = await InvoiceGetById(invoiceId);
    const data = response?.data?.data || response?.data || {};

    const paidAmount = data.paidAmount || 0;
    const creditedAmount = data.creditedAmount || 0;
    const maxCreditAmount = paidAmount - creditedAmount;

    selectedInvoiceInfo.value = {
      totalAmount: data.totalAmount || 0,
      paidAmount: paidAmount,
      creditedAmount: creditedAmount,
      maxCreditAmount: maxCreditAmount > 0 ? maxCreditAmount : 0,
    };

    //建立付款記錄選項
    paymentOptions.value = (data.payments || []).map((payment) => ({
      label: `${timezoneStore.formatDate(payment.paidAt, 'YYYY-MM-DD')} - NT$ ${formatNumber(payment.amount)} (${getPaymentMethodLabel(payment.method)})`,
      value: payment.id,
    }));
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //發票選擇變更

const getPaymentMethodLabel = (method) => {
  const map = {
    CASH: t('cash', '現金'),
    CARD: t('card', '信用卡'),
    TRANSFER: t('transfer', '轉帳'),
    CHECK: t('check', '支票'),
  };
  return map[method] || method;
}; //取得付款方式標籤

const preparePayload = () => {
  return {
    invoiceId: typeof basicForm.value.invoiceId === 'object' ? basicForm.value.invoiceId.id : basicForm.value.invoiceId,
    paymentId: basicForm.value.paymentId || undefined,
    amount: Number(basicForm.value.amount),
    reason: basicForm.value.reason,
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
    await CreditMemoCreatePost(payload);
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
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

/** 套用折讓單 **/
const handleApplyCreditMemo = async (row) => {
  await mainStore.SWAL_Confirm({
    title: t('confirmApplyCreditMemo', '確定要套用此折讓單嗎？套用後將影響發票金額。'),
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await CreditMemoApplyPost(row.id);
        await mainStore.SWAL_Success(t('applySuccess', '套用成功'));
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
}; //套用折讓單

/** 取消折讓單 **/
const handleCancelCreditMemo = async (row) => {
  const message = row.status === 'APPLIED' ? t('confirmVoidCreditMemo', '確定要作廢此折讓單嗎？將會恢復發票原金額。') : t('confirmCancelCreditMemo', '確定要取消此折讓單嗎？');
  await mainStore.SWAL_Confirm({
    title: message,
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await CreditMemoCancelPost(row.id);
        await mainStore.SWAL_Success(row.status === 'APPLIED' ? t('voidSuccess', '作廢成功') : t('cancelSuccess', '取消成功'));
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
}; //取消折讓單

defineExpose({
  openCreateDialog,
  clearFilter,
  getAPI,
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(440);
});
</script>
