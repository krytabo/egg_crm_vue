<!-- src/pages/BasicInfo/Driver/DataList/MobileView.vue 司機管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('driverList', '司機列表') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 統計卡片區 -->
      <ion-card class="summary-card">
        <ion-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">{{ t('totalCount', '總筆數') }}</span>
              <span class="summary-value">{{ pagination.total }} {{ t('count', '筆') }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 搜尋區 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-searchbar
            :value="globalSearch"
            :placeholder="t('searchDriverPlaceholder', '搜尋司機姓名、員工編號...')"
            @ionInput="globalSearch = $event.detail.value"
            @ionClear="clearGlobalSearch"
            debounce="500"
          />
          <div class="filter-actions">
            <ion-button size="small" fill="outline" color="danger" @click="clearFilter">
              {{ t('clearFilter', '清除篩選') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 司機列表 -->
      <ion-list class="driver-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="viewDetail(item)">
            <ion-label>
              <h2>{{ item.fullName }}</h2>
              <p>{{ item.employeeId }} · {{ item.phone || '—' }}</p>
              <p class="text-sm">
                <span :class="getLicenseExpiryClass(item.licenseExpiry)">
                  {{ t('licenseExpiry', '駕照到期') }}: {{ formatDate(item.licenseExpiry) }}
                </span>
                <span v-if="isLicenseExpiringSoon(item.licenseExpiry)" class="text-orange-500"> ({{ t('expiringSoon', '即將到期') }})</span>
                <span v-if="isLicenseExpired(item.licenseExpiry)" class="text-red-500"> ({{ t('expired', '已過期') }})</span>
              </p>
            </ion-label>
            <ion-chip :color="getStatusChipColor(item.status)" slot="end" size="small">
              {{ getStatusLabel(item.status) }}
            </ion-chip>
          </ion-item>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="personOutline" size="large" color="medium" />
            <p>{{ t('noDrivers', '尚無司機資料') }}</p>
          </ion-label>
        </ion-item>

        <!-- 載入中 -->
        <ion-item v-if="loading && !basicDataList.length">
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
      <div v-if="noMoreData && basicDataList.length > 0" class="no-more-data">
        <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
      </div>

      <!-- 底部留白 -->
      <div class="bottom-spacer"></div>
    </ion-content>

    <!-- 詳情 Modal -->
    <ion-modal :is-open="detailVisible" @didDismiss="closeDetail">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDetail">{{ t('close', '關閉') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('driverDetail', '司機詳情') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list v-if="selectedDriver">
          <!-- 基本資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('basicInfo', '基本資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>{{ t('employeeId', '員工編號') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.employeeId }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('fullName', '姓名') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.fullName }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('status', '狀態') }}</ion-label>
              <ion-chip :color="getStatusChipColor(selectedDriver.status)" slot="end" size="small">
                {{ getStatusLabel(selectedDriver.status) }}
              </ion-chip>
            </ion-item>
          </ion-item-group>

          <!-- 駕照資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('licenseInfo', '駕照資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>{{ t('licenseNumber', '駕照號碼') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.licenseNumber || '—' }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('licenseExpiry', '駕照到期日') }}</ion-label>
              <ion-note slot="end" :class="getLicenseExpiryClass(selectedDriver.licenseExpiry)">
                {{ formatDate(selectedDriver.licenseExpiry) }}
                <span v-if="isLicenseExpiringSoon(selectedDriver.licenseExpiry)"> ({{ t('expiringSoon', '即將到期') }})</span>
                <span v-if="isLicenseExpired(selectedDriver.licenseExpiry)"> ({{ t('expired', '已過期') }})</span>
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('hireDate', '入職日期') }}</ion-label>
              <ion-note slot="end">{{ formatDate(selectedDriver.hireDate) }}</ion-note>
            </ion-item>
          </ion-item-group>

          <!-- 聯絡資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('contactInfo', '聯絡資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>{{ t('phone', '電話') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.phone || '—' }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('email', '電子郵件') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.email || '—' }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('address', '地址') }}</ion-label>
              <ion-note slot="end">{{ selectedDriver.address || '—' }}</ion-note>
            </ion-item>
          </ion-item-group>

          <!-- 其他 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('otherInfo', '其他資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>{{ t('createdAt', '建立時間') }}</ion-label>
              <ion-note slot="end">{{ formatDate(selectedDriver.createdAt) }}</ion-note>
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonNote,
  IonChip,
  IonIcon,
  IonSearchbar,
  IonModal,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/vue';
import { personOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { useDataList } from './useDataList';

const { t } = useI18n();

// 使用共用邏輯
const {
  getStatusLabel,
  getStatusColor,
  isLicenseExpired,
  isLicenseExpiringSoon,
  getLicenseExpiryClass,
  formatDate,
  searchFields,
  clearFilter: _clearFilter,
  basicDataList,
  pagination,
  getAPI,
} = useDataList(t);

// ===== 手機版專用狀態 =====
const loading = ref(false);
const hasMore = ref(true);
const globalSearch = ref('');
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);

// 詳情 Modal
const detailVisible = ref(false);
const selectedDriver = ref(null);

const viewDetail = (item) => {
  selectedDriver.value = item;
  detailVisible.value = true;
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDriver.value = null;
};

const getStatusChipColor = (status) => {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'ASSIGNED':
      return 'primary';
    case 'ON_TRIP':
      return 'warning';
    case 'OFF_DUTY':
      return 'medium';
    case 'INACTIVE':
      return 'danger';
    default:
      return 'medium';
  }
};

const clearGlobalSearch = () => {
  globalSearch.value = '';
};

const clearFilter = () => {
  globalSearch.value = '';
  _clearFilter();
};

// 無限捲動
const loadMore = async (event) => {
  if (loading.value || !hasMore.value) {
    event.target.complete();
    return;
  }

  loading.value = true;
  const currentPage = pagination.page;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (currentPage >= totalPages) {
    hasMore.value = false;
    event.target.complete();
    loading.value = false;
    return;
  }

  pagination.page += 1;
  await getAPI();
  event.target.complete();
  loading.value = false;
};

// 監聽搜尋變化
watch(globalSearch, async (newValue) => {
  searchFields.fullName = newValue;
  pagination.page = 1;
  hasMore.value = true;
  await getAPI();
});

// 生命週期
onMounted(async () => {
  loading.value = true;
  await getAPI();
  loading.value = false;
});
</script>

<style scoped>
.summary-card {
  margin: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
}

.filter-card {
  margin: 8px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.driver-list {
  margin-top: 8px;
}

.empty-state {
  --min-height: 200px;
}

.empty-state ion-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.bottom-spacer {
  height: 80px;
}

.text-orange-500 {
  color: #f97316;
}

.text-red-500 {
  color: #ef4444;
}
</style>
