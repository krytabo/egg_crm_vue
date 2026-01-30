<!-- src/pages/BasicInfo/Car/DataList/MobileView.vue 車輛管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('vehicleList', '車輛列表') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="permissionStore.hasPermission('VEHICLE', 'CREATE')" fill="clear" @click="openCreateDialog">
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
            :value="filters.search"
            :placeholder="t('searchVehiclePlaceholder', '搜尋車牌、品牌、型號')"
            @ionInput="filters.search = $event.detail.value"
            @ionClear="handleClearSearch"
            debounce="500"
          />
          <div class="filter-actions">
            <ion-button size="small" fill="outline" color="danger" @click="clearFilter">
              {{ t('clearFilter', '清除篩選') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 車輛列表 -->
      <ion-list class="vehicle-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="editData(item)">
            <ion-label>
              <h2>{{ item.plateNumber }}</h2>
              <p>{{ item.brand }} {{ item.model }} <span v-if="item.year">({{ item.year }})</span></p>
              <p class="text-sm text-gray-500">
                {{ vehicleTypeMap[item.type] || item.type }} · {{ item.assignedDriver?.name || t('unassigned', '未指派') }}
              </p>
            </ion-label>
            <ion-chip :color="getStatusColor(item.status)" slot="end" size="small">
              {{ statusMap[item.status] || item.status }}
            </ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" color="primary" @click="editData(item)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'DELETE')" color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="carOutline" size="large" color="medium" />
            <p>{{ t('noVehicles', '尚無車輛資料') }}</p>
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

    <!-- 新增/編輯 Modal -->
    <ion-modal :is-open="dialogVisible" @didDismiss="closeDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ isCreate ? t('addVehicle', '新增車輛') : t('editVehicle', '編輯車輛') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveData" :disabled="isSaving">
              {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <!-- 基本資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('basicInfo', '基本資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('plateNumber', '車牌號碼') }} *</ion-label>
              <ion-input v-model="basicForm.plateNumber" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item button @click="openTypePicker">
              <ion-label>{{ t('vehicleType', '車輛類型') }} *</ion-label>
              <ion-note slot="end">{{ vehicleTypeMap[basicForm.type] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('brand', '品牌') }}</ion-label>
              <ion-input v-model="basicForm.brand" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('model', '型號') }}</ion-label>
              <ion-input v-model="basicForm.model" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('year', '出廠年份') }}</ion-label>
              <ion-input v-model="basicForm.year" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('capacity', '載重量') }}</ion-label>
              <ion-input v-model="basicForm.capacity" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('fuelType', '燃料類型') }}</ion-label>
              <ion-input v-model="basicForm.fuelType" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 狀態 (編輯時顯示) -->
          <ion-item-group v-if="isEdite">
            <ion-item-divider>
              <ion-label>{{ t('statusInfo', '狀態資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item button @click="openStatusPicker">
              <ion-label>{{ t('status', '狀態') }}</ion-label>
              <ion-note slot="end">{{ statusMap[basicForm.status] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
          </ion-item-group>

          <!-- 備註 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('otherInfo', '其他資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
              <ion-textarea v-model="basicForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 車輛類型選擇 Modal -->
    <ion-modal :is-open="typePickerVisible" @didDismiss="closeTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectVehicleType', '選擇車輛類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in vehicleTypeOptions" :key="option.value" button @click="selectType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.type === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 狀態選擇 Modal -->
    <ion-modal :is-open="statusPickerVisible" @didDismiss="closeStatusPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeStatusPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectStatus', '選擇狀態') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in statusOptions" :key="option.value" button @click="selectStatus(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.status === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
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
  IonItemOptions,
  IonItemOption,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonNote,
  IonInput,
  IonTextarea,
  IonChip,
  IonIcon,
  IonSearchbar,
  IonModal,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  alertController,
} from '@ionic/vue';
import { addOutline, createOutline, trashOutline, checkmarkOutline, carOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useDataList } from './useDataList';

const { t } = useI18n();
const permissionStore = usePermissionStore();

// 使用共用邏輯
const {
  vehicleTypeOptions,
  vehicleTypeMap,
  statusOptions,
  statusMap,
  basicDataList,
  filters,
  pagination,
  getAPI,
  clearFilter: _clearFilter,
  dialogVisible,
  isSaving,
  isCreate,
  isEdite,
  basicForm,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,
} = useDataList(t);

// ===== 手機版專用狀態 =====
const loading = ref(false);
const hasMore = ref(true);
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);

// 選擇器狀態
const typePickerVisible = ref(false);
const statusPickerVisible = ref(false);

const openTypePicker = () => (typePickerVisible.value = true);
const closeTypePicker = () => (typePickerVisible.value = false);
const selectType = (value) => {
  basicForm.value.type = value;
  closeTypePicker();
};

const openStatusPicker = () => (statusPickerVisible.value = true);
const closeStatusPicker = () => (statusPickerVisible.value = false);
const selectStatus = (value) => {
  basicForm.value.status = value;
  closeStatusPicker();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'medium';
    case 'MAINTENANCE':
      return 'warning';
    case 'RETIRED':
      return 'danger';
    default:
      return 'medium';
  }
};

const clearFilter = () => {
  _clearFilter();
};

const handleClearSearch = () => {
  filters.search = '';
};

// 刪除確認
const handleDelete = async (item) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteVehicleConfirm', '確定要刪除此車輛嗎？'),
    buttons: [
      { text: t('cancel', '取消'), role: 'cancel' },
      {
        text: t('delete', '刪除'),
        role: 'destructive',
        handler: () => deleteData(item.id),
      },
    ],
  });
  await alert.present();
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
watch(
  () => filters.search,
  async () => {
    pagination.page = 1;
    hasMore.value = true;
    await getAPI();
  },
);

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

.vehicle-list {
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
</style>
