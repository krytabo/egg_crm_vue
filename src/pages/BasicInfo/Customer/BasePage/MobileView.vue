<!-- src/pages/BasicInfo/Customer/BasePage/MobileView.vue 客戶/潛在客戶管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isProspect ? t('potentialListTitle', '潛在客戶') : t('listTitle', '客戶列表') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="permissionStore.hasPermission('CUSTOMER', 'CREATE')" fill="clear" @click="openCreateDialog">
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
              <span class="summary-value">{{ totalCustomers }} {{ t('count', '筆') }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 搜尋區 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-searchbar
            :value="globalSearch"
            :placeholder="t('searchPlaceholder', '搜尋客戶...')"
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

      <!-- 客戶列表 -->
      <ion-list class="customer-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="editData(item)">
            <ion-label>
              <h2>{{ item.companyName }}</h2>
              <p>{{ getPrimaryContact(item)?.name || '—' }} · {{ getPrimaryContact(item)?.phone || '—' }}</p>
              <p class="text-sm text-gray-500">{{ typeLabelMap[item.type] || '—' }} · {{ segmentLabelMap[item.segment] || '—' }}</p>
            </ion-label>
            <ion-chip v-if="!isProspect" :color="item.status === 'ACTIVE' ? 'success' : 'warning'" slot="end" size="small">
              {{ statusLabelMap[item.status] || item.status }}
            </ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option v-if="permissionStore.hasPermission('CUSTOMER', 'UPDATE')" color="primary" @click="editData(item)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('CUSTOMER', 'DELETE')" color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="peopleOutline" size="large" color="medium" />
            <p>{{ t('noCustomers', '尚無客戶資料') }}</p>
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

    <!-- 新增/編輯 Modal (簡化版) -->
    <ion-modal :is-open="dialogVisible" @didDismiss="closeDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ isEdite ? t('editCustomer', '編輯客戶') : t('newCustomer', '新增客戶') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveData" :disabled="isSaving">
              {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <!-- 公司資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('companyInfo', '公司資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('companyName', '公司名稱') }}</ion-label>
              <ion-input v-model="basicForm.companyForm.companyName" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('companyPhone', '公司電話') }}</ion-label>
              <ion-input v-model="basicForm.companyForm.companyPhone" type="tel" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('companyEmail', '公司信箱') }}</ion-label>
              <ion-input v-model="basicForm.companyForm.companyEmail" type="email" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('companyAddress', '公司地址') }}</ion-label>
              <ion-input v-model="basicForm.companyForm.companyAddress" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('taxId', '統一編號') }}</ion-label>
              <ion-input v-model="basicForm.companyForm.taxId" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 主要聯絡人 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('primaryContact', '主要聯絡人') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('name', '姓名') }}</ion-label>
              <ion-input v-model="basicForm.contactsForm[0].name" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('phone', '電話') }}</ion-label>
              <ion-input v-model="basicForm.contactsForm[0].phone" type="tel" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('email', '電子信箱') }}</ion-label>
              <ion-input v-model="basicForm.contactsForm[0].email" type="email" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('address', '地址') }}</ion-label>
              <ion-input v-model="basicForm.contactsForm[0].address" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 其他資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('otherInfo', '其他資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item button @click="openTypePicker">
              <ion-label>{{ t('customerType', '客戶類型') }}</ion-label>
              <ion-note slot="end">{{ typeLabelMap[basicForm.metaForm.type] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
            <ion-item button @click="openSegmentPicker">
              <ion-label>{{ t('customerSegment', '客戶分類') }}</ion-label>
              <ion-note slot="end">{{ segmentLabelMap[basicForm.metaForm.segment] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('note', '備註') }}</ion-label>
              <ion-textarea v-model="basicForm.otherForm.note" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 類型選擇 Modal -->
    <ion-modal :is-open="typePickerVisible" @didDismiss="closeTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectType', '選擇類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in customerTypeOptions" :key="option.value" button @click="selectType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.metaForm.type === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 分類選擇 Modal -->
    <ion-modal :is-open="segmentPickerVisible" @didDismiss="closeSegmentPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeSegmentPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectSegment', '選擇分類') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in customerSegmentOptions" :key="option.value" button @click="selectSegment(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.metaForm.segment === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
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
import { addOutline, createOutline, trashOutline, checkmarkOutline, peopleOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useBasePage } from './useBasePage';

const props = defineProps({
  pageType: { type: String, default: 'customer', validator: (v) => ['customer', 'prospect'].includes(v) },
});

const { t } = useI18n();
const permissionStore = usePermissionStore();

// 使用共用邏輯
const {
  isProspect,
  customerTypeOptions,
  customerSegmentOptions,
  typeLabelMap,
  segmentLabelMap,
  statusLabelMap,
  getPrimaryContact,
  globalSearch,
  clearGlobalSearch,
  clearFilter,
  handleGlobalSearch,
  basicDataList,
  pagination,
  totalCustomers,
  getAPI,
  dialogVisible,
  isSaving,
  isEdite,
  basicForm,
  openCreateDialog,
  editData,
  closeDialog,
  deleteData,
  saveData,
} = useBasePage(props, t);

// ===== 手機版專用狀態 =====
const loading = ref(false);
const hasMore = ref(true);
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);

// 選擇器狀態
const typePickerVisible = ref(false);
const segmentPickerVisible = ref(false);

const openTypePicker = () => (typePickerVisible.value = true);
const closeTypePicker = () => (typePickerVisible.value = false);
const selectType = (value) => {
  basicForm.value.metaForm.type = value;
  closeTypePicker();
};

const openSegmentPicker = () => (segmentPickerVisible.value = true);
const closeSegmentPicker = () => (segmentPickerVisible.value = false);
const selectSegment = (value) => {
  basicForm.value.metaForm.segment = value;
  closeSegmentPicker();
};

// 刪除確認
const handleDelete = async (item) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteCustomerConfirm', '確定要刪除此客戶嗎？'),
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
  const currentPage = pagination.value.page;
  const totalPages = Math.ceil(pagination.value.total / pagination.value.limit);

  if (currentPage >= totalPages) {
    hasMore.value = false;
    event.target.complete();
    loading.value = false;
    return;
  }

  pagination.value.page += 1;
  await getAPI();
  event.target.complete();
  loading.value = false;
};

// 監聽搜尋變化
watch(globalSearch, () => {
  handleGlobalSearch();
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

.customer-list {
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
