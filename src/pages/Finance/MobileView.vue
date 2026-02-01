<!-- src/pages/Finance/MobileView.vue 帳務管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('billingManagement', '帳務管理') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="activeTab === 'INVOICES' && permissionStore.hasPermission('BILLING', 'CREATE')" fill="clear" @click="openCreateInvoice">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
          <ion-button v-if="activeTab === 'PAYMENTS' && permissionStore.hasPermission('BILLING', 'CREATE')" fill="clear" @click="openCreatePayment">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
          <ion-button v-if="activeTab === 'CREDIT_MEMOS' && permissionStore.hasPermission('BILLING', 'CREATE')" fill="clear" @click="openCreateCreditMemo">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <!-- Tab 切換 -->
      <ion-toolbar>
        <ion-segment :value="activeTab" @ionChange="activeTab = $event.detail.value">
          <ion-segment-button value="INVOICES">
            <ion-label>{{ t('billingRequests', '請款單') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="PAYMENTS">
            <ion-label>{{ t('payments', '付款') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="CREDIT_MEMOS">
            <ion-label>{{ t('creditMemos', '折讓') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="REPORTS">
            <ion-label>{{ t('reports', '報表') }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 下拉刷新 -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 請款單 Tab -->
      <template v-if="activeTab === 'INVOICES'">
        <ion-card class="filter-card">
          <ion-card-content>
            <ion-searchbar
              :value="invoiceSearch"
              :placeholder="t('searchInvoice', '搜尋請款單...')"
              @ionInput="invoiceSearch = $event.detail.value"
              debounce="500"
            />
          </ion-card-content>
        </ion-card>

        <!-- Loading 狀態 -->
        <div v-if="isLoading && invoiceList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="invoice in invoiceList" :key="invoice.id" button @click="viewInvoice(invoice)">
            <ion-label>
              <h2>{{ invoice.invoiceNumber }}</h2>
              <p>{{ invoice.customerName }} · {{ formatCurrency(invoice.totalAmount) }}</p>
              <p class="text-xs text-gray-500">{{ invoice.invoiceDate }}</p>
            </ion-label>
            <ion-badge slot="end" :color="getStatusColor(invoice.status)">{{ invoice.statusLabel }}</ion-badge>
          </ion-item>
          <ion-item v-if="!isLoading && invoiceList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限滾動 -->
        <ion-infinite-scroll v-if="invoicePagination.hasMore" @ionInfinite="loadMoreInvoices($event)">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </template>

      <!-- 付款記錄 Tab -->
      <template v-if="activeTab === 'PAYMENTS'">
        <ion-card class="filter-card">
          <ion-card-content>
            <ion-searchbar
              :value="paymentSearch"
              :placeholder="t('searchPayment', '搜尋付款記錄...')"
              @ionInput="paymentSearch = $event.detail.value"
              debounce="500"
            />
          </ion-card-content>
        </ion-card>

        <!-- Loading 狀態 -->
        <div v-if="isLoading && paymentList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="payment in paymentList" :key="payment.id" button @click="viewPayment(payment)">
            <ion-label>
              <h2>{{ payment.paymentNumber }}</h2>
              <p>{{ payment.customerName }} · {{ formatCurrency(payment.amount) }}</p>
              <p class="text-xs text-gray-500">{{ payment.paymentDate }}</p>
            </ion-label>
            <ion-badge slot="end" :color="getPaymentStatusColor(payment.status)">{{ payment.statusLabel }}</ion-badge>
          </ion-item>
          <ion-item v-if="!isLoading && paymentList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限滾動 -->
        <ion-infinite-scroll v-if="paymentPagination.hasMore" @ionInfinite="loadMorePayments($event)">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </template>

      <!-- 折讓單 Tab -->
      <template v-if="activeTab === 'CREDIT_MEMOS'">
        <ion-card class="filter-card">
          <ion-card-content>
            <ion-searchbar
              :value="creditMemoSearch"
              :placeholder="t('searchCreditMemo', '搜尋折讓單...')"
              @ionInput="creditMemoSearch = $event.detail.value"
              debounce="500"
            />
          </ion-card-content>
        </ion-card>

        <!-- Loading 狀態 -->
        <div v-if="isLoading && creditMemoList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="memo in creditMemoList" :key="memo.id" button @click="viewCreditMemo(memo)">
            <ion-label>
              <h2>{{ memo.creditMemoNumber }}</h2>
              <p>{{ memo.customerName }} · {{ formatCurrency(memo.amount) }}</p>
              <p class="text-xs text-gray-500">{{ memo.creditMemoDate }}</p>
            </ion-label>
            <ion-badge slot="end" :color="getCreditMemoStatusColor(memo.status)">{{ memo.statusLabel }}</ion-badge>
          </ion-item>
          <ion-item v-if="!isLoading && creditMemoList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限滾動 -->
        <ion-infinite-scroll v-if="creditMemoPagination.hasMore" @ionInfinite="loadMoreCreditMemos($event)">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </template>

      <!-- 報表 Tab -->
      <template v-if="activeTab === 'REPORTS'">
        <ion-card>
          <ion-card-content>
            <p class="text-center text-gray-500">{{ t('reportsComingSoon', '報表功能開發中...') }}</p>
          </ion-card-content>
        </ion-card>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonIcon,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { InvoiceListGet, PaymentListGet, CreditMemoListGet } from '@/assets/API/Billing';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useMainStore } from '@/stores/LoadingStore';

const { t } = useI18n();
const permissionStore = usePermissionStore();
const timezoneStore = useTimezoneStore();
const mainStore = useMainStore();

/** Tab 相關 **/
const activeTab = ref('INVOICES');

/** 搜尋相關 **/
const invoiceSearch = ref('');
const paymentSearch = ref('');
const creditMemoSearch = ref('');

/** Loading 狀態 **/
const isLoading = ref(false);

/** 列表資料 **/
const invoiceList = ref([]);
const paymentList = ref([]);
const creditMemoList = ref([]);

/** 分頁相關 **/
const invoicePagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });
const paymentPagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });
const creditMemoPagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });

/** 載入請款單列表 **/
const loadInvoices = async (reset = false) => {
  if (reset) {
    invoicePagination.value.page = 1;
    invoicePagination.value.hasMore = true;
    invoiceList.value = [];
  }
  if (!invoicePagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: invoicePagination.value.page,
      limit: invoicePagination.value.limit,
    };
    if (invoiceSearch.value) params.search = invoiceSearch.value;

    const response = await InvoiceListGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      invoiceNumber: item.id,
      customerName: item.customer?.name || '—',
      totalAmount: item.totalAmount || 0,
      invoiceDate: item.createdAt ? timezoneStore.formatDate(item.createdAt, 'YYYY-MM-DD') : '—',
      status: item.status,
      statusLabel: getStatusLabel(item.status),
    }));

    if (reset) {
      invoiceList.value = formattedData;
    } else {
      invoiceList.value.push(...formattedData);
    }

    invoicePagination.value.total = pagination.total || 0;
    invoicePagination.value.hasMore = invoiceList.value.length < invoicePagination.value.total;
  } catch (error) {
    console.error('載入請款單失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 載入付款記錄列表 **/
const loadPayments = async (reset = false) => {
  if (reset) {
    paymentPagination.value.page = 1;
    paymentPagination.value.hasMore = true;
    paymentList.value = [];
  }
  if (!paymentPagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: paymentPagination.value.page,
      limit: paymentPagination.value.limit,
    };
    if (paymentSearch.value) params.search = paymentSearch.value;

    const response = await PaymentListGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      paymentNumber: item.id,
      customerName: item.customer?.name || '—',
      amount: item.amount || 0,
      paymentDate: item.paidAt ? timezoneStore.formatDate(item.paidAt, 'YYYY-MM-DD') : '—',
      status: item.status,
      statusLabel: getPaymentStatusLabel(item.status),
    }));

    if (reset) {
      paymentList.value = formattedData;
    } else {
      paymentList.value.push(...formattedData);
    }

    paymentPagination.value.total = pagination.total || 0;
    paymentPagination.value.hasMore = paymentList.value.length < paymentPagination.value.total;
  } catch (error) {
    console.error('載入付款記錄失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 載入折讓單列表 **/
const loadCreditMemos = async (reset = false) => {
  if (reset) {
    creditMemoPagination.value.page = 1;
    creditMemoPagination.value.hasMore = true;
    creditMemoList.value = [];
  }
  if (!creditMemoPagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: creditMemoPagination.value.page,
      limit: creditMemoPagination.value.limit,
    };
    if (creditMemoSearch.value) params.search = creditMemoSearch.value;

    const response = await CreditMemoListGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      creditMemoNumber: item.id,
      customerName: item.customer?.name || '—',
      amount: item.amount || 0,
      creditMemoDate: item.createdAt ? timezoneStore.formatDate(item.createdAt, 'YYYY-MM-DD') : '—',
      status: item.status,
      statusLabel: getCreditMemoStatusLabel(item.status),
    }));

    if (reset) {
      creditMemoList.value = formattedData;
    } else {
      creditMemoList.value.push(...formattedData);
    }

    creditMemoPagination.value.total = pagination.total || 0;
    creditMemoPagination.value.hasMore = creditMemoList.value.length < creditMemoPagination.value.total;
  } catch (error) {
    console.error('載入折讓單失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 狀態標籤 **/
const getStatusLabel = (status) => {
  const map = {
    DRAFT: t('draft', '草稿'),
    SENT: t('sent', '已發送'),
    PAID: t('paid', '已付款'),
    PARTIAL: t('partial', '部分付款'),
    OVERDUE: t('overdue', '逾期'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
};

const getPaymentStatusLabel = (status) => {
  const map = {
    PENDING: t('pending', '待處理'),
    COMPLETED: t('completed', '已完成'),
    FAILED: t('failed', '失敗'),
    REFUNDED: t('refunded', '已退款'),
  };
  return map[status] || status;
};

const getCreditMemoStatusLabel = (status) => {
  const map = {
    DRAFT: t('draft', '草稿'),
    APPROVED: t('approved', '已核准'),
    APPLIED: t('applied', '已套用'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
};

/** Tab 切換時載入對應資料 **/
watch(activeTab, (newTab) => {
  if (newTab === 'INVOICES' && invoiceList.value.length === 0) {
    loadInvoices(true);
  } else if (newTab === 'PAYMENTS' && paymentList.value.length === 0) {
    loadPayments(true);
  } else if (newTab === 'CREDIT_MEMOS' && creditMemoList.value.length === 0) {
    loadCreditMemos(true);
  }
});

/** 搜尋防抖 **/
let invoiceSearchTimeout;
watch(invoiceSearch, () => {
  clearTimeout(invoiceSearchTimeout);
  invoiceSearchTimeout = setTimeout(() => loadInvoices(true), 500);
});

let paymentSearchTimeout;
watch(paymentSearch, () => {
  clearTimeout(paymentSearchTimeout);
  paymentSearchTimeout = setTimeout(() => loadPayments(true), 500);
});

let creditMemoSearchTimeout;
watch(creditMemoSearch, () => {
  clearTimeout(creditMemoSearchTimeout);
  creditMemoSearchTimeout = setTimeout(() => loadCreditMemos(true), 500);
});

/** 無限滾動載入更多 **/
const loadMoreInvoices = async (event) => {
  invoicePagination.value.page++;
  await loadInvoices(false);
  event.target.complete();
};

const loadMorePayments = async (event) => {
  paymentPagination.value.page++;
  await loadPayments(false);
  event.target.complete();
};

const loadMoreCreditMemos = async (event) => {
  creditMemoPagination.value.page++;
  await loadCreditMemos(false);
  event.target.complete();
};

/** 下拉刷新 **/
const handleRefresh = async (event) => {
  if (activeTab.value === 'INVOICES') {
    await loadInvoices(true);
  } else if (activeTab.value === 'PAYMENTS') {
    await loadPayments(true);
  } else if (activeTab.value === 'CREDIT_MEMOS') {
    await loadCreditMemos(true);
  }
  event.target.complete();
};

/** 初始載入 **/
onMounted(() => {
  loadInvoices(true);
});

/** 工具函式 **/
const formatCurrency = (value) => {
  if (!value) return 'NT$ 0';
  return `NT$ ${Number(value).toLocaleString()}`;
};

const getStatusColor = (status) => {
  const colors = {
    DRAFT: 'medium',
    PENDING: 'warning',
    PAID: 'success',
    OVERDUE: 'danger',
    CANCELLED: 'dark',
  };
  return colors[status] || 'medium';
};

const getPaymentStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger',
    REFUNDED: 'tertiary',
  };
  return colors[status] || 'medium';
};

const getCreditMemoStatusColor = (status) => {
  const colors = {
    DRAFT: 'medium',
    APPROVED: 'success',
    APPLIED: 'primary',
    CANCELLED: 'dark',
  };
  return colors[status] || 'medium';
};

/** 操作函式 **/
const openCreateInvoice = () => {
  // TODO: 開啟新增請款單 Modal
  console.log('Open create invoice');
};

const openCreatePayment = () => {
  // TODO: 開啟新增付款 Modal
  console.log('Open create payment');
};

const openCreateCreditMemo = () => {
  // TODO: 開啟新增折讓單 Modal
  console.log('Open create credit memo');
};

const viewInvoice = (invoice) => {
  // TODO: 查看請款單詳情
  console.log('View invoice', invoice);
};

const viewPayment = (payment) => {
  // TODO: 查看付款詳情
  console.log('View payment', payment);
};

const viewCreditMemo = (memo) => {
  // TODO: 查看折讓單詳情
  console.log('View credit memo', memo);
};
</script>

<style scoped>
.filter-card {
  margin: 8px;
}

ion-segment-button {
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 12px;
}
</style>
