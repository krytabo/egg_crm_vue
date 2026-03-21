<!-- src/pages/billing/components/BillingReportsTab.vue 帳務報表 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 報表類型切換 -->
    <a-radio-group v-model="reportType" type="button" @change="handleReportTypeChange">
      <a-radio value="revenue">{{ t('revenueReport', '營收報表') }}</a-radio>
      <a-radio value="outstanding">{{ t('outstandingReport', '未收款報表') }}</a-radio>
    </a-radio-group>

    <!-- 營收報表 -->
    <template v-if="reportType === 'revenue'">
      <!-- 篩選區塊 -->
      <CustomForm :col="3">
        <CustomFormItem :label="t('dateRange', '日期範圍')">
          <div class="flex items-center gap-2">
            <TinyDatePicker v-model="revenueFilters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" />
            <span>-</span>
            <TinyDatePicker v-model="revenueFilters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" />
          </div>
        </CustomFormItem>
        <CustomFormItem :label="t('groupBy', '分組方式')">
          <TinySelect v-model="revenueFilters.groupBy" :options="groupByOptions" />
        </CustomFormItem>
        <CustomFormItem :label="t('customer', '客戶')">
          <div class="flex gap-2 w-full">
            <InfiniteSelect v-model="revenueFilters.customerId" dataSource="customers" type="outline" :placeholder="t('all', '全部')" allowClear class="w-full" />
            <a-button type="primary" @click="loadRevenueReport">{{ t('query', '查詢') }}</a-button>
          </div>
        </CustomFormItem>
      </CustomForm>

      <!-- 營收摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('totalRevenue', '總營收') }}</div>
            <div class="mt-1 text-2xl font-semibold text-blue-600">NT$ {{ formatNumber(revenueData.summary.totalRevenue) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('totalInvoices', '總發票數') }}</div>
            <div class="mt-1 text-2xl font-semibold">{{ formatNumber(revenueData.summary.totalInvoices) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('paidInvoices', '已付款發票') }}</div>
            <div class="mt-1 text-2xl font-semibold text-green-600">{{ formatNumber(revenueData.summary.paidInvoices) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('paidAmount', '已收款金額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-green-600">NT$ {{ formatNumber(revenueData.summary.paidAmount) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('pendingAmount', '待收款金額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-orange-600">NT$ {{ formatNumber(revenueData.summary.pendingAmount) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('overdueAmount', '逾期金額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-red-600">NT$ {{ formatNumber(revenueData.summary.overdueAmount) }}</div>
          </div>
        </Card>
      </div>

      <!-- 期間營收明細 -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('periodRevenue', '期間營收明細') }}</CardTitle>
        </CardHeader>
        <div>
          <CustomTinyGrid :data="revenueData.periodData" :height="250" row-key="period">
            <CustomTinyGridColumn field="period" :title="t('period', '期間')" width="150" />
            <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="150" align="right">
              <template #default="{ row }">NT$ {{ formatNumber(row.revenue) }}</template>
            </CustomTinyGridColumn>
            <CustomTinyGridColumn field="invoiceCount" :title="t('invoiceCount', '發票數')" width="120" align="right" />
          </CustomTinyGrid>
        </div>
      </Card>

      <div class="grid gap-4 lg:grid-cols-2">
        <!-- 客戶營收排行 -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t('topCustomers', '客戶營收排行') }}</CardTitle>
          </CardHeader>
          <div>
            <CustomTinyGrid :data="revenueData.customerStats" :height="250" row-key="customerId">
              <CustomTinyGridColumn type="index" :title="t('rank', '排名')" width="60" align="center" />
              <CustomTinyGridColumn field="customerName" :title="t('customer', '客戶')" min-width="150" />
              <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="130" align="right">
                <template #default="{ row }">NT$ {{ formatNumber(row.revenue) }}</template>
              </CustomTinyGridColumn>
              <CustomTinyGridColumn field="invoiceCount" :title="t('invoiceCount', '發票數')" width="100" align="right" />
            </CustomTinyGrid>
          </div>
        </Card>

        <!-- 產品營收排行 -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t('topProducts', '產品營收排行') }}</CardTitle>
          </CardHeader>
          <div>
            <CustomTinyGrid :data="revenueData.productStats" :height="250" row-key="productId">
              <CustomTinyGridColumn type="index" :title="t('rank', '排名')" width="60" align="center" />
              <CustomTinyGridColumn field="productName" :title="t('product', '產品')" min-width="150" />
              <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="100" align="right" />
              <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="130" align="right">
                <template #default="{ row }">NT$ {{ formatNumber(row.revenue) }}</template>
              </CustomTinyGridColumn>
            </CustomTinyGrid>
          </div>
        </Card>
      </div>
    </template>

    <!-- 未收款報表 -->
    <template v-if="reportType === 'outstanding'">
      <!-- 未收款摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('totalOutstanding', '未收款總額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-orange-600">NT$ {{ formatNumber(outstandingData.summary.totalOutstanding) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('overdueAmount', '逾期金額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-red-600">NT$ {{ formatNumber(outstandingData.summary.overdueAmount) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('currentAmount', '未到期金額') }}</div>
            <div class="mt-1 text-2xl font-semibold text-blue-600">NT$ {{ formatNumber(outstandingData.summary.currentAmount) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('customersWithOutstanding', '有未收款客戶數') }}</div>
            <div class="mt-1 text-2xl font-semibold">{{ formatNumber(outstandingData.summary.customersWithOutstanding) }}</div>
          </div>
        </Card>
        <Card>
          <div class="pt-4">
            <div class="text-sm text-gray-500">{{ t('invoicesCount', '未收款發票數') }}</div>
            <div class="mt-1 text-2xl font-semibold">{{ formatNumber(outstandingData.summary.invoicesCount) }}</div>
          </div>
        </Card>
      </div>

      <!-- 帳齡分析 -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('agingAnalysis', '帳齡分析') }}</CardTitle>
        </CardHeader>
        <div>
          <div class="grid gap-4 md:grid-cols-5">
            <div v-for="bracket in outstandingData.agingBrackets" :key="bracket.range" class="rounded-lg border p-4 text-center" :class="getAgingBracketClass(bracket.range)">
              <div class="text-sm text-gray-600">{{ getAgingRangeLabel(bracket.range) }}</div>
              <div class="mt-2 text-xl font-semibold">NT$ {{ formatNumber(bracket.amount) }}</div>
              <div class="mt-1 text-sm text-gray-500">{{ bracket.count }} {{ t('invoices', '張發票') }}</div>
            </div>
          </div>
        </div>
      </Card>

      <!-- 未收款客戶排行 -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('topOutstandingCustomers', '未收款客戶排行') }}</CardTitle>
        </CardHeader>
        <div>
          <CustomTinyGrid :data="outstandingData.topOutstandingCustomers" :height="300" row-key="customerId">
            <CustomTinyGridColumn type="index" :title="t('rank', '排名')" width="60" align="center" />
            <CustomTinyGridColumn field="customerName" :title="t('customer', '客戶')" min-width="180" />
            <CustomTinyGridColumn field="customerCode" :title="t('customerCode', '客戶編號')" width="120" />
            <CustomTinyGridColumn field="totalOutstanding" :title="t('outstandingAmount', '未收款金額')" width="150" align="right">
              <template #default="{ row }">
                <span class="font-medium text-orange-600">NT$ {{ formatNumber(row.totalOutstanding) }}</span>
              </template>
            </CustomTinyGridColumn>
            <CustomTinyGridColumn field="oldestInvoiceDate" :title="t('oldestInvoiceDate', '最早發票日期')" width="140">
              <template #default="{ row }">{{ formatDate(row.oldestInvoiceDate, 'YYYY-MM-DD') }}</template>
            </CustomTinyGridColumn>
          </CustomTinyGrid>
        </div>
      </Card>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ReportRevenueGet, ReportOutstandingGet } from '@/assets/API/Billing';
import { TinySelect, TinyDatePicker } from '@opentiny/vue';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';
import { useI18n } from 'vue-i18n';
import { format, subMonths } from 'date-fns';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const { t } = useI18n();

/** 常數相關 **/
/*const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString();
}; //格式化數字
const formatDate = (date) => {
  if (!date) return '—';
  return timezoneStore.formatDate(date, 'YYYY-MM-DD');
}; //格式化日期*/
const { formatNumber, formatCurrencyNumber } = currencyStore;
const formatDate = computed(() => timezoneStore.formatDate);

/** 報表類型 **/
const reportType = ref('revenue');
const handleReportTypeChange = (value) => {
  if (value === 'revenue' && !revenueDataLoaded.value) {
    loadRevenueReport();
  } else if (value === 'outstanding' && !outstandingDataLoaded.value) {
    loadOutstandingReport();
  }
}; //報表類型切換

/** 分組選項 **/
const groupByOptions = [
  { label: t('byDay', '按日'), value: 'day' },
  { label: t('byWeek', '按週'), value: 'week' },
  { label: t('byMonth', '按月'), value: 'month' },
  { label: t('byYear', '按年'), value: 'year' },
];

/** 營收報表 **/
const revenueDataLoaded = ref(false);
const revenueFilters = reactive({
  startDate: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  groupBy: 'month',
  customerId: '',
});
const revenueData = reactive({
  period: '',
  summary: {
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  },
  periodData: [],
  customerStats: [],
  productStats: [],
});
const loadRevenueReport = async () => {
  mainStore.setLoading(true);
  try {
    const params = {
      startDate: revenueFilters.startDate,
      endDate: revenueFilters.endDate,
      groupBy: revenueFilters.groupBy,
    };
    if (revenueFilters.customerId) {
      params.customerId = typeof revenueFilters.customerId === 'object' ? revenueFilters.customerId.id : revenueFilters.customerId;
    }
    const response = await ReportRevenueGet(params);
    const data = response?.data?.data || response?.data || {};

    revenueData.period = data.period || '';
    revenueData.summary = data.summary || {
      totalRevenue: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    };
    revenueData.periodData = data.periodData || [];
    revenueData.customerStats = data.customerStats || [];
    revenueData.productStats = data.productStats || [];
    revenueDataLoaded.value = true;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入營收報表

/** 未收款報表 **/
const outstandingDataLoaded = ref(false);
const outstandingData = reactive({
  summary: {
    totalOutstanding: 0,
    overdueAmount: 0,
    currentAmount: 0,
    customersWithOutstanding: 0,
    invoicesCount: 0,
  },
  agingBrackets: [],
  topOutstandingCustomers: [],
});
const loadOutstandingReport = async () => {
  mainStore.setLoading(true);
  try {
    const response = await ReportOutstandingGet();
    const data = response?.data?.data || response?.data || {};

    outstandingData.summary = data.summary || {
      totalOutstanding: 0,
      overdueAmount: 0,
      currentAmount: 0,
      customersWithOutstanding: 0,
      invoicesCount: 0,
    };
    outstandingData.agingBrackets = data.agingBrackets || [];
    outstandingData.topOutstandingCustomers = data.topOutstandingCustomers || [];
    outstandingDataLoaded.value = true;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入未收款報表

/** 帳齡相關 **/
const getAgingRangeLabel = (range) => {
  const map = {
    current: t('current', '未到期'),
    '1-30': t('overdue1to30', '逾期 1-30 天'),
    '31-60': t('overdue31to60', '逾期 31-60 天'),
    '61-90': t('overdue61to90', '逾期 61-90 天'),
    '90+': t('overdue90plus', '逾期 90+ 天'),
  };
  return map[range] || range;
}; //取得帳齡範圍標籤
const getAgingBracketClass = (range) => {
  const map = {
    current: 'border-blue-200 bg-blue-50',
    '1-30': 'border-yellow-200 bg-yellow-50',
    '31-60': 'border-orange-200 bg-orange-50',
    '61-90': 'border-red-200 bg-red-50',
    '90+': 'border-red-400 bg-red-100',
  };
  return map[range] || 'border-gray-200 bg-gray-50';
}; //取得帳齡區塊樣式

/** 清除篩選 **/
const clearFilter = () => {
  revenueFilters.startDate = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
  revenueFilters.endDate = format(new Date(), 'yyyy-MM-dd');
  revenueFilters.groupBy = 'month';
  revenueFilters.customerId = '';
  if (reportType.value === 'revenue') {
    loadRevenueReport();
  }
}; //清除篩選

defineExpose({
  clearFilter,
});

onMounted(async () => {
  await loadRevenueReport();
});
</script>
