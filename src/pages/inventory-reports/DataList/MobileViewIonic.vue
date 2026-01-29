<!-- src/pages/inventory-reports/DataList/MobileViewIonic.vue 司機送貨報表-列表（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('deliveryReportList', '送貨報表') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="handleCreate">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 統計卡片區 -->
      <ion-card class="summary-card">
        <ion-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">{{ t('todayReports', '今日報表') }}</span>
              <span class="summary-value">{{ summaryData.todayReports }} {{ t('count', '筆') }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ t('todayAmount', '今日總額') }}</span>
              <span class="summary-value text-blue">NT$ {{ formatNumber(summaryData.todayAmount) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ t('totalReports', '總報表數') }}</span>
              <span class="summary-value">{{ summaryData.totalReports }} {{ t('count', '筆') }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ t('totalAmount', '累計金額') }}</span>
              <span class="summary-value text-green">NT$ {{ formatNumber(summaryData.totalAmount) }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 篩選區 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-list lines="none">
            <ion-item button @click="openDriverPicker">
              <ion-label>{{ t('driver', '司機') }}</ion-label>
              <ion-note slot="end">{{ filters.driverId?.fullName || t('all', '全部') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('startDate', '起始日期') }}</ion-label>
              <ion-datetime-button datetime="startDate" slot="end" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="startDate" :value="startTime" presentation="date" @ionChange="onStartDateChange" />
              </ion-modal>
            </ion-item>

            <ion-item>
              <ion-label>{{ t('endDate', '結束日期') }}</ion-label>
              <ion-datetime-button datetime="endDate" slot="end" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="endDate" :value="endTime" presentation="date" @ionChange="onEndDateChange" />
              </ion-modal>
            </ion-item>
          </ion-list>
          <div class="filter-actions">
            <ion-button size="small" fill="outline" color="danger" @click="clearFilter">
              {{ t('clearFilter', '清除篩選') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 報表列表 -->
      <ion-list class="report-list">
        <ion-item-sliding v-for="item in mobileList" :key="item.id">
          <ion-item button @click="handleEdit(item)">
            <div class="report-item">
              <div class="report-header">
                <span class="driver-name">{{ item.employeeName }}</span>
                <ion-chip :color="getStatusColor(item.status)" size="small" class="px-3">
                  {{ item.status }}
                </ion-chip>
              </div>
              <div class="report-info">
                <span class="report-date">{{ item.reportDate }}</span>
                <span class="week-days">{{ item.weekDays }}</span>
              </div>
              <div class="report-amount">
                <span class="amount-label">{{ t('totalAmount', '總金額') }}</span>
                <span class="amount-value">NT$ {{ formatNumber(item.totalAmount) }}</span>
              </div>
            </div>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="handleCopyLink(item)">
              <ion-icon slot="icon-only" :icon="linkOutline" />
            </ion-item-option>
            <ion-item-option color="success" @click="handleConvertToOrder(item)">
              <ion-icon slot="icon-only" :icon="cartOutline" />
            </ion-item-option>
            <ion-item-option color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!mobileList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="documentTextOutline" size="large" color="medium" />
            <p>{{ t('noReports', '尚無報表資料') }}</p>
          </ion-label>
        </ion-item>

        <!-- 載入中（首次載入） -->
        <ion-item v-if="loading && !mobileList.length">
          <ion-label class="ion-text-center">
            <ion-spinner name="crescent" />
            <p>{{ t('loading', '載入中...') }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- 無限捲動 -->
      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!hasMore || loading">
        <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="t('loading', '載入中...')" />
      </ion-infinite-scroll>

      <!-- 沒有更多資料提示 -->
      <div v-if="noMoreData && mobileList.length > 0" class="no-more-data">
        <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
      </div>

      <!-- 底部留白 -->
      <div class="bottom-spacer"></div>
    </ion-content>

    <!-- 司機選擇 Modal -->
    <ion-modal :is-open="driverPickerVisible" @didDismiss="closeDriverPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDriverPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectDriver', '選擇司機') }}</ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar :placeholder="t('searchDriver', '搜尋司機')" :value="driverSearch" @ionInput="driverSearch = $event.detail.value" debounce="300" />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item button @click="selectDriver(null)">
            <ion-label>{{ t('all', '全部') }}</ion-label>
            <ion-icon v-if="!filters.driverId" slot="end" :icon="checkmarkOutline" color="primary" />
          </ion-item>
          <ion-item v-for="driver in driverList" :key="driver.id" button @click="selectDriver(driver)">
            <ion-label>{{ driver.fullName }}</ion-label>
            <ion-icon v-if="filters.driverId?.id === driver.id" slot="end" :icon="checkmarkOutline" color="primary" />
          </ion-item>

          <!-- 載入中 -->
          <ion-item v-if="driverLoading">
            <ion-label class="ion-text-center">
              <ion-spinner name="crescent" />
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限捲動 -->
        <ion-infinite-scroll @ionInfinite="loadMoreDrivers" :disabled="!driverHasMore">
          <ion-infinite-scroll-content loading-spinner="crescent" />
        </ion-infinite-scroll>
      </ion-content>
    </ion-modal>

    <!-- 轉入訂單 Modal -->
    <ion-modal :is-open="convertDialogVisible" @didDismiss="closeConvertDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeConvertDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('convertToOrder', '轉入訂單') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="handleDoConvert" :disabled="convertLoading">
              {{ t('confirm', '確認') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <!-- 選擇模式 -->
        <ion-list>
          <ion-radio-group :value="convertMode" @ionChange="convertMode = $event.detail.value">
            <ion-item>
              <ion-label>
                <h3>{{ t('createNewOrder', '建立新訂單') }}</h3>
                <p>{{ t('createNewOrderDesc', '將所選商品建立為新的訂單') }}</p>
              </ion-label>
              <ion-radio slot="end" value="new" />
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>{{ t('addToExistingOrder', '加入既有訂單') }}</h3>
                <p>{{ t('addToExistingOrderDesc', '選擇既有訂單繼續累計') }}</p>
              </ion-label>
              <ion-radio slot="end" value="existing" />
            </ion-item>
          </ion-radio-group>
        </ion-list>

        <!-- 商品列表 -->
        <ion-card>
          <ion-card-header>
            <ion-card-title class="text-base"> {{ t('selectProducts', '選擇商品') }} ({{ selectedProductIndexes.length }}) </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="item in convertProductList" :key="item._index">
                <ion-checkbox
                  slot="start"
                  :checked="selectedProductIndexes.includes(item._index)"
                  :disabled="item.isConvertedToOrder"
                  @ionChange="handleToggleProduct(item._index, $event.detail.checked)"
                />
                <ion-label>
                  <h3>{{ item.product?.name || item.productName || '—' }}</h3>
                  <p>{{ item.customer?.name || item.customerName || '—' }} | {{ item.quantity }} x NT$ {{ formatNumber(item.unitPrice) }}</p>
                </ion-label>
                <ion-chip v-if="item.isConvertedToOrder" slot="end" color="success" size="small">
                  {{ t('converted', '已轉入') }}
                </ion-chip>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonNote,
  IonChip,
  IonIcon,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonDatetime,
  IonDatetimeButton,
  IonRadioGroup,
  IonRadio,
  IonCheckbox,
  toastController,
  alertController,
} from '@ionic/vue';
import { addOutline, trashOutline, linkOutline, cartOutline, documentTextOutline, checkmarkOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useDataList } from './useDataList';
import { DriverListGet } from '@/assets/API/Drivers.js';

const { t } = useI18n();
const router = useRouter();

// 新增報表 - 導航到編輯頁面（新增模式）
const handleCreate = () => {
  router.push({ name: 'm-delivery-report-edit2' });
};

const showMessage = async (type, content) => {
  const colors = { success: 'success', error: 'danger', warning: 'warning', info: 'primary' };
  const toast = await toastController.create({
    message: content,
    duration: 2000,
    position: 'top',
    color: colors[type] || 'primary',
  });
  await toast.present();
}; //Ionic Toast 訊息顯示
const showConfirm = async ({ title, message, onConfirm }) => {
  const alert = await alertController.create({
    header: title,
    message: message,
    buttons: [
      {
        text: t('cancel', '取消'),
        role: 'cancel',
      },
      {
        text: t('confirm', '確認'),
        role: 'confirm',
        handler: () => {
          if (onConfirm) onConfirm();
        },
      },
    ],
  });
  await alert.present();
}; //Ionic 確認對話框
const {
  formatNumber,

  //統計數據
  summaryData,

  //列表資料
  basicDataList,
  filters,
  pagination,
  getAPI,
  handleFiltersChange: _handleFiltersChange,
  clearFilter: _clearFilter,

  //編輯刪除
  handleEdit,
  handleDelete,
  handleCopyLink,

  //轉入訂單
  convertDialogVisible,
  selectedProductIndexes,
  convertMode,
  convertLoading,
  convertProductList,
  handleToggleProduct,
  handleConvertToOrder,
  closeConvertDialog,
  handleDoConvert,

  //初始化
  initializeData: _initializeData,
  mainStore,
} = useDataList(t, showMessage, showConfirm);

// ===== 手機版無限捲動狀態 =====
const loading = ref(false);
const mobileList = ref([]); // 手機版專用列表（用於累加）
const lastFetchedCount = ref(0); // 上次取得的資料筆數
const pageSize = 10; // 每頁筆數
const noMoreData = ref(false); // 是否沒有更多資料

// 判斷是否還有更多資料
const hasMore = computed(() => {
  if (noMoreData.value) return false;
  // 如果上次取得的資料筆數小於 pageSize，表示沒有更多資料
  if (lastFetchedCount.value > 0 && lastFetchedCount.value < pageSize) return false;
  // 如果已載入的資料筆數 >= 總筆數，也沒有更多資料
  return mobileList.value.length < pagination.total;
});

// 手機版初始化（載入第一頁）
const initializeData = async () => {
  loading.value = true;
  mobileList.value = [];
  noMoreData.value = false;
  pagination.page = 1;
  pagination.limit = pageSize;

  await getAPI();

  // 同步 basicDataList 到 mobileList
  mobileList.value = [...basicDataList.value];
  lastFetchedCount.value = basicDataList.value.length;

  // 檢查是否已經沒有更多資料
  if (lastFetchedCount.value < pageSize) {
    noMoreData.value = true;
  }

  loading.value = false;
};

// 包裝 handleFiltersChange，重置手機版狀態
const handleFiltersChange = async () => {
  mobileList.value = [];
  noMoreData.value = false;
  pagination.page = 1;
  lastFetchedCount.value = 0;

  await _handleFiltersChange();

  // 同步資料
  mobileList.value = [...basicDataList.value];
  lastFetchedCount.value = basicDataList.value.length;

  if (lastFetchedCount.value < pageSize) {
    noMoreData.value = true;
  }
};

// 包裝 clearFilter，重置手機版狀態
const clearFilter = async () => {
  mobileList.value = [];
  noMoreData.value = false;
  lastFetchedCount.value = 0;

  await _clearFilter();

  // 同步資料
  mobileList.value = [...basicDataList.value];
  lastFetchedCount.value = basicDataList.value.length;

  if (lastFetchedCount.value < pageSize) {
    noMoreData.value = true;
  }
};
const getStatusColor = (status) => {
  const colorMap = {
    草稿: 'medium',
    已提交: 'primary',
    已審核: 'success',
    已退回: 'danger',
  };
  return colorMap[status] || 'medium';
}; //狀態顏色

/** 司機選擇相關 **/
const driverPickerVisible = ref(false);
const driverList = ref([]);
const driverPage = ref(1);
const driverTotal = ref(0);
const driverLoading = ref(false);
const driverSearch = ref('');
const driverHasMore = computed(() => driverList.value.length < driverTotal.value);
const normalizeResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const total = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total };
};
const loadDrivers = async (page = 1, append = false) => {
  if (driverLoading.value) return;
  driverLoading.value = true;
  try {
    const params = { page, limit: 20 };
    if (driverSearch.value.trim()) {
      params.search = driverSearch.value.trim();
    }
    const response = await DriverListGet(params);
    const { data, total } = normalizeResponse(response);

    if (append) {
      driverList.value = [...driverList.value, ...data];
    } else {
      driverList.value = data;
    }
    driverTotal.value = total;
    driverPage.value = page;
  } catch (error) {
    console.error('Failed to load drivers:', error);
  } finally {
    driverLoading.value = false;
  }
};
const openDriverPicker = async () => {
  driverSearch.value = '';
  driverList.value = [];
  driverPage.value = 1;
  driverPickerVisible.value = true;
  await loadDrivers(1);
};
const closeDriverPicker = () => (driverPickerVisible.value = false);
const loadMoreDrivers = async (event) => {
  if (driverHasMore.value) await loadDrivers(driverPage.value + 1, true);
  event.target.complete();
};
const selectDriver = (driver) => {
  filters.driverId = driver;
  closeDriverPicker();
  handleFiltersChange();
};
watch(driverSearch, () => {
  loadDrivers(1);
});

/** 日期相關 **/
const formatDateTime = (timestamp) => {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-` + `${pad(d.getMonth() + 1)}-` + `${pad(d.getDate())}T` + `${pad(d.getHours())}:` + `${pad(d.getMinutes())}:` + `${pad(d.getSeconds())}`;
}; //日期格式化 ISO 8601 Date-Time
const startTime = formatDateTime(Date.now());
const endTime = formatDateTime(Date.now());
const onStartDateChange = (event) => {
  const value = event.detail.value;
  filters.reportDateFrom = value ? formatDateTime(value) : '';
  handleFiltersChange();
}; //變更開始日期
const onEndDateChange = (event) => {
  const value = event.detail.value;
  filters.reportDateTo = value ? formatDateTime(value) : '';
  handleFiltersChange();
}; //變更結束日期

const loadMore = async (event) => {
  if (hasMore.value && !loading.value) {
    loading.value = true;
    pagination.page++;

    await getAPI();

    // 將新資料追加到 mobileList
    const newItems = basicDataList.value;
    lastFetchedCount.value = newItems.length;

    if (newItems.length > 0) {
      mobileList.value = [...mobileList.value, ...newItems];
    }

    // 檢查是否沒有更多資料
    if (newItems.length < pageSize) {
      noMoreData.value = true;
    }

    loading.value = false;
  }
  event.target.complete();
}; //載入更多

onMounted(async () => {
  await initializeData();
});
</script>

<style scoped>
.summary-card {
  margin: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
}

.summary-value.text-blue {
  color: var(--ion-color-primary);
}

.summary-value.text-green {
  color: var(--ion-color-success);
}

.filter-card {
  margin: 12px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.report-list {
  margin: 0 12px;
}

.report-item {
  width: 100%;
  padding: 8px 0;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.driver-name {
  font-weight: 600;
  font-size: 15px;
}

.report-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.report-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.amount-value {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.empty-state {
  padding: 40px;
}

.empty-state ion-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bottom-spacer {
  height: 40px;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

ion-header ion-toolbar {
  --background: #ffffff;
  --border-color: #e5e5e5;
}

ion-header ion-title {
  font-weight: 600;
  font-size: 17px;
}

ion-toolbar {
  --background: inherit;
  --border-style: none;
}
</style>
