<!-- src/pages/Shipments/InventoryMobileView.vue 庫存管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('inventory', '商品庫存') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="activeTab === 'MOVEMENTS' && permissionStore.hasPermission('INVENTORY', 'CREATE')" fill="clear" @click="openCreateMovement">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <!-- Tab 切換 -->
      <ion-toolbar>
        <ion-segment :value="activeTab" @ionChange="activeTab = $event.detail.value">
          <ion-segment-button value="OVERVIEW">
            <ion-label>{{ t('overview', '總覽') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="MOVEMENTS">
            <ion-label>{{ t('movements', '異動') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ALERTS">
            <ion-label>{{ t('alerts', '警示') }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 下拉刷新 -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 庫存總覽 Tab -->
      <template v-if="activeTab === 'OVERVIEW'">
        <ion-card class="filter-card">
          <ion-card-content>
            <ion-searchbar
              :value="overviewSearch"
              :placeholder="t('searchProduct', '搜尋商品...')"
              @ionInput="overviewSearch = $event.detail.value"
              debounce="500"
            />
          </ion-card-content>
        </ion-card>

        <!-- Loading 狀態 -->
        <div v-if="isLoading && inventoryList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="item in inventoryList" :key="item.id" button @click="viewInventoryDetail(item)">
            <ion-label>
              <h2>{{ item.productName }}</h2>
              <p>{{ item.productCode }}</p>
            </ion-label>
            <div slot="end" class="flex flex-col items-end gap-1">
              <span class="text-lg font-semibold" :class="getStockClass(item)">{{ item.currentStock }} {{ item.unit }}</span>
              <ion-badge v-if="item.isLowStock" color="warning">{{ t('lowStock', '低庫存') }}</ion-badge>
              <ion-badge v-if="item.isOutOfStock" color="danger">{{ t('outOfStock', '缺貨') }}</ion-badge>
            </div>
          </ion-item>
          <ion-item v-if="!isLoading && inventoryList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
          </ion-item>
        </ion-list>

        <ion-infinite-scroll v-if="overviewPagination.hasMore" @ionInfinite="loadMoreInventory($event)">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </template>

      <!-- 異動記錄 Tab -->
      <template v-if="activeTab === 'MOVEMENTS'">
        <ion-card class="filter-card">
          <ion-card-content>
            <ion-searchbar
              :value="movementSearch"
              :placeholder="t('searchMovement', '搜尋異動記錄...')"
              @ionInput="movementSearch = $event.detail.value"
              debounce="500"
            />
          </ion-card-content>
        </ion-card>

        <!-- Loading 狀態 -->
        <div v-if="isLoading && movementList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="movement in movementList" :key="movement.id">
            <ion-label>
              <h2>{{ movement.productName }}</h2>
              <p>{{ movement.movementTypeLabel }} · {{ movement.createdAt }}</p>
              <p v-if="movement.reason" class="text-xs text-gray-500">{{ movement.reason }}</p>
            </ion-label>
            <div slot="end" class="flex flex-col items-end gap-1">
              <span class="text-lg font-semibold" :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                {{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}
              </span>
            </div>
          </ion-item>
          <ion-item v-if="!isLoading && movementList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noData', '暫無資料') }}</ion-label>
          </ion-item>
        </ion-list>

        <ion-infinite-scroll v-if="movementPagination.hasMore" @ionInfinite="loadMoreMovements($event)">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </template>

      <!-- 庫存警示 Tab -->
      <template v-if="activeTab === 'ALERTS'">
        <!-- Loading 狀態 -->
        <div v-if="isLoading && alertList.length === 0" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" />
        </div>

        <ion-list v-else>
          <ion-item v-for="alert in alertList" :key="alert.id">
            <ion-label>
              <h2>{{ alert.productName }}</h2>
              <p>
                {{ t('currentStock', '目前庫存') }}: {{ alert.currentStock }} {{ alert.unit }}
                <span class="text-gray-500"> / {{ t('minStock', '最低庫存') }}: {{ alert.minStock }}</span>
              </p>
            </ion-label>
            <ion-badge slot="end" :color="alert.isOutOfStock ? 'danger' : 'warning'">
              {{ alert.isOutOfStock ? t('outOfStock', '缺貨') : t('lowStock', '低庫存') }}
            </ion-badge>
          </ion-item>
          <ion-item v-if="!isLoading && alertList.length === 0">
            <ion-label class="ion-text-center text-gray-500">{{ t('noAlerts', '目前無庫存警示') }}</ion-label>
          </ion-item>
        </ion-list>
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
import { InventoryListGet, InventoryMovementsGet, InventoryLowStockGet, InventoryOutOfStockGet } from '@/assets/API/Inventory';
import { useTimezoneStore } from '@/stores/TimezoneStore';

const { t } = useI18n();
const permissionStore = usePermissionStore();
const timezoneStore = useTimezoneStore();

/** Tab 相關 **/
const activeTab = ref('OVERVIEW');

/** 搜尋相關 **/
const overviewSearch = ref('');
const movementSearch = ref('');

/** Loading 狀態 **/
const isLoading = ref(false);

/** 列表資料 **/
const inventoryList = ref([]);
const movementList = ref([]);
const alertList = ref([]);

/** 分頁相關 **/
const overviewPagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });
const movementPagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });

/** 異動類型標籤 **/
const getMovementTypeLabel = (type) => {
  const map = {
    STOCK_IN: t('stockIn', '入庫'),
    STOCK_OUT: t('stockOut', '出庫'),
    ADJUSTMENT: t('adjustment', '調整'),
    TRANSFER_IN: t('transferIn', '調撥入'),
    TRANSFER_OUT: t('transferOut', '調撥出'),
  };
  return map[type] || type;
};

/** 庫存顏色判斷 **/
const getStockClass = (item) => {
  if (item.isOutOfStock) return 'text-red-600';
  if (item.isLowStock) return 'text-orange-600';
  return 'text-green-600';
};

/** 載入庫存列表 **/
const loadInventory = async (reset = false) => {
  if (reset) {
    overviewPagination.value.page = 1;
    overviewPagination.value.hasMore = true;
    inventoryList.value = [];
  }
  if (!overviewPagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: overviewPagination.value.page,
      limit: overviewPagination.value.limit,
    };
    if (overviewSearch.value) params.keyword = overviewSearch.value;

    const response = await InventoryListGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      productId: item.product?.id || item.productId,
      productName: item.product?.name || item.productName || '—',
      productCode: item.product?.code || item.productCode || '',
      unit: item.product?.unit || item.unit || '',
      currentStock: item.currentStock || 0,
      minStock: item.minStock || 0,
      maxStock: item.maxStock || 0,
      reorderPoint: item.reorderPoint || 0,
      isLowStock: item.currentStock <= item.minStock && item.currentStock > 0,
      isOutOfStock: item.currentStock <= 0,
    }));

    if (reset) {
      inventoryList.value = formattedData;
    } else {
      inventoryList.value.push(...formattedData);
    }

    overviewPagination.value.total = pagination.total || 0;
    overviewPagination.value.hasMore = inventoryList.value.length < overviewPagination.value.total;
  } catch (error) {
    console.error('載入庫存失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 載入異動記錄 **/
const loadMovements = async (reset = false) => {
  if (reset) {
    movementPagination.value.page = 1;
    movementPagination.value.hasMore = true;
    movementList.value = [];
  }
  if (!movementPagination.value.hasMore && !reset) return;

  isLoading.value = true;
  try {
    const params = {
      page: movementPagination.value.page,
      limit: movementPagination.value.limit,
    };
    if (movementSearch.value) params.keyword = movementSearch.value;

    const response = await InventoryMovementsGet(params);
    const data = response?.data?.data?.data || response?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};

    const formattedData = data.map((item) => ({
      id: item.id,
      productName: item.product?.name || item.productName || '—',
      movementType: item.movementType,
      movementTypeLabel: getMovementTypeLabel(item.movementType),
      quantity: item.quantity || 0,
      reason: item.reason || '',
      createdAt: item.createdAt ? timezoneStore.formatDate(item.createdAt, 'YYYY-MM-DD HH:mm') : '—',
    }));

    if (reset) {
      movementList.value = formattedData;
    } else {
      movementList.value.push(...formattedData);
    }

    movementPagination.value.total = pagination.total || 0;
    movementPagination.value.hasMore = movementList.value.length < movementPagination.value.total;
  } catch (error) {
    console.error('載入異動記錄失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 載入庫存警示 **/
const loadAlerts = async () => {
  isLoading.value = true;
  try {
    const [lowStockRes, outOfStockRes] = await Promise.all([
      InventoryLowStockGet(),
      InventoryOutOfStockGet(),
    ]);

    const lowStockData = lowStockRes?.data?.data || [];
    const outOfStockData = outOfStockRes?.data?.data || [];

    const formattedLowStock = lowStockData.map((item) => ({
      id: `low-${item.id || item.productId}`,
      productName: item.product?.name || item.productName || '—',
      currentStock: item.currentStock || 0,
      minStock: item.minStock || 0,
      unit: item.product?.unit || item.unit || '',
      isLowStock: true,
      isOutOfStock: false,
    }));

    const formattedOutOfStock = outOfStockData.map((item) => ({
      id: `out-${item.id || item.productId}`,
      productName: item.product?.name || item.productName || '—',
      currentStock: item.currentStock || 0,
      minStock: item.minStock || 0,
      unit: item.product?.unit || item.unit || '',
      isLowStock: false,
      isOutOfStock: true,
    }));

    alertList.value = [...formattedOutOfStock, ...formattedLowStock];
  } catch (error) {
    console.error('載入庫存警示失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

/** 無限滾動載入更多 **/
const loadMoreInventory = async (event) => {
  overviewPagination.value.page++;
  await loadInventory(false);
  event.target.complete();
};

const loadMoreMovements = async (event) => {
  movementPagination.value.page++;
  await loadMovements(false);
  event.target.complete();
};

/** 下拉刷新 **/
const handleRefresh = async (event) => {
  if (activeTab.value === 'OVERVIEW') {
    await loadInventory(true);
  } else if (activeTab.value === 'MOVEMENTS') {
    await loadMovements(true);
  } else if (activeTab.value === 'ALERTS') {
    await loadAlerts();
  }
  event.target.complete();
};

/** Tab 切換時載入對應資料 **/
watch(activeTab, (newTab) => {
  if (newTab === 'OVERVIEW' && inventoryList.value.length === 0) {
    loadInventory(true);
  } else if (newTab === 'MOVEMENTS' && movementList.value.length === 0) {
    loadMovements(true);
  } else if (newTab === 'ALERTS' && alertList.value.length === 0) {
    loadAlerts();
  }
});

/** 搜尋防抖 **/
let overviewSearchTimeout;
watch(overviewSearch, () => {
  clearTimeout(overviewSearchTimeout);
  overviewSearchTimeout = setTimeout(() => loadInventory(true), 500);
});

let movementSearchTimeout;
watch(movementSearch, () => {
  clearTimeout(movementSearchTimeout);
  movementSearchTimeout = setTimeout(() => loadMovements(true), 500);
});

/** 操作函式 **/
const openCreateMovement = () => {
  // TODO: 開啟新增異動 Modal
  console.log('Open create movement');
};

const viewInventoryDetail = (item) => {
  // TODO: 查看庫存詳情
  console.log('View inventory detail', item);
};

/** 初始載入 **/
onMounted(() => {
  loadInventory(true);
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
