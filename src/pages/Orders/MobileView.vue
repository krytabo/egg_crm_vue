<!-- src/pages/Orders/MobileView.vue 訂單管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="permissionStore.hasPermission('ORDER', 'CREATE')" fill="clear" @click="openCreateOrder">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <!-- Tab 切換 (客戶/廠商) -->
      <ion-toolbar>
        <ion-segment :value="activeTab" @ionChange="activeTab = $event.detail.value">
          <ion-segment-button value="CUSTOMER">
            <ion-label>{{ t('customer', '客戶') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="VENDOR">
            <ion-label>{{ t('vendor', '廠商') }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 下拉刷新 -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 搜尋欄 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-searchbar
            :value="searchKeyword"
            :placeholder="t('searchOrder', '搜尋訂單...')"
            @ionInput="searchKeyword = $event.detail.value"
            debounce="500"
          />
        </ion-card-content>
      </ion-card>

      <!-- Loading 狀態 -->
      <div v-if="isLoading && orderList.length === 0" class="ion-text-center ion-padding">
        <ion-spinner name="crescent" />
      </div>

      <!-- 訂單列表 -->
      <ion-list v-else>
        <ion-item v-for="order in orderList" :key="order.id" button @click="viewOrder(order)">
          <ion-label>
            <h2>{{ order.orderNumber }}</h2>
            <p>{{ order.targetName }} · {{ order.contact }}</p>
            <p class="text-xs text-gray-500">{{ order.orderDate }} {{ order.shipDate ? `→ ${order.shipDate}` : '' }}</p>
          </ion-label>
          <div slot="end" class="flex flex-col items-end gap-1">
            <ion-badge :color="getStatusColor(order.status)">{{ order.statusLabel }}</ion-badge>
            <span class="text-sm font-medium">{{ formatCurrency(order.totalAmount) }}</span>
          </div>
        </ion-item>
        <ion-item v-if="!isLoading && orderList.length === 0">
          <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- 無限滾動 -->
      <ion-infinite-scroll v-if="pagination.hasMore" @ionInfinite="loadMoreOrders($event)">
        <ion-infinite-scroll-content loading-spinner="crescent" />
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
import { OrderListGet } from '@/assets/API/Order';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';

const props = defineProps({
  pageTitle: { type: String, default: '訂單管理' },
  categoryId: { type: String, default: '' },
  categoryCode: { type: String, default: '' },
});

const { t } = useI18n();
const permissionStore = usePermissionStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const { formatCurrencyNumber } = currencyStore;

/** Tab 相關 (客戶/廠商) **/
const activeTab = ref('CUSTOMER');

/** 搜尋相關 **/
const searchKeyword = ref('');

/** Loading 狀態 **/
const isLoading = ref(false);

/** 列表資料 **/
const orderList = ref([]);

/** 分頁相關 **/
const pagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });

/** 格式化金額 **/
const formatCurrency = (value) => {
  if (!value) return 'NT$ 0';
  return `NT$ ${Number(value).toLocaleString()}`;
};

/** 狀態相關 **/
const getStatusColor = (status) => {
  const colors = {
    PENDING: 'medium',
    PROCESSING: 'success',
    DELIVERED: 'primary',
    CANCELLED: 'danger',
  };
  return colors[status] || 'medium';
};

const getStatusLabel = (status) => {
  const map = {
    PENDING: t('pending', '待處理'),
    PROCESSING: t('processing', '處理中'),
    DELIVERED: t('delivered', '已出貨'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
};

/** 載入訂單列表 **/
const loadOrders = async (reset = false) => {
  if (reset) {
    pagination.value.page = 1;
    pagination.value.hasMore = true;
    orderList.value = [];
  }
  if (!pagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      targetType: activeTab.value,
    };
    if (props.categoryId) params.categoryId = props.categoryId;
    if (props.categoryCode) params.categoryCode = props.categoryCode;
    if (searchKeyword.value) params.keyword = searchKeyword.value;

    const response = await OrderListGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const paginationData = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      orderNumber: item.orderNumber || `#${item.id}`,
      targetName: item.targetName || '—',
      contact: item.contact || '',
      phone: item.phone || '',
      orderDate: item.orderDate ? timezoneStore.formatDate(item.orderDate, 'YYYY-MM-DD') : '—',
      shipDate: item.shipDate ? timezoneStore.formatDate(item.shipDate, 'YYYY-MM-DD') : '',
      totalAmount: item.totalAmount || 0,
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      raw: item,
    }));

    if (reset) {
      orderList.value = formattedData;
    } else {
      orderList.value.push(...formattedData);
    }

    pagination.value.total = paginationData.total || 0;
    pagination.value.hasMore = orderList.value.length < pagination.value.total;
  } catch (error) {
    console.error('載入訂單失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 無限滾動載入更多 **/
const loadMoreOrders = async (event) => {
  pagination.value.page++;
  await loadOrders(false);
  event.target.complete();
};

/** 下拉刷新 **/
const handleRefresh = async (event) => {
  await loadOrders(true);
  event.target.complete();
};

/** Tab 切換時重新載入 **/
watch(activeTab, () => {
  loadOrders(true);
});

/** 搜尋防抖 **/
let searchTimeout;
watch(searchKeyword, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadOrders(true), 500);
});

/** 操作函式 **/
const openCreateOrder = () => {
  // TODO: 開啟新增訂單 Modal (可考慮使用 Ionic Modal 或導航到新頁面)
  console.log('Open create order');
};

const viewOrder = (order) => {
  // TODO: 查看訂單詳情 (可考慮使用 Ionic Modal 或導航到詳情頁面)
  console.log('View order', order);
};

/** 初始載入 **/
onMounted(() => {
  loadOrders(true);
});
</script>

<style scoped>
.filter-card {
  margin: 8px;
}

ion-segment-button {
  --padding-start: 8px;
  --padding-end: 8px;
}
</style>
