<!-- src/pages/BasicInfo/Vendor/DataList/MobileView.vue 供應商管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('vendorListTitle', '供應商管理') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="permissionStore.hasPermission('VENDOR', 'CREATE')" fill="clear" @click="openCreateDialog">
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
            :value="globalSearch"
            :placeholder="t('searchPlaceholder', '搜尋供應商...')"
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

      <!-- 供應商列表 -->
      <ion-list class="vendor-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="editData(item)">
            <ion-label>
              <h2>{{ item.name }}</h2>
              <p>{{ item.contactPerson }} · {{ item.phone }}</p>
              <p class="text-sm text-gray-500">{{ item.productTypeName }} · {{ item.addressDisplay }}</p>
            </ion-label>
            <ion-chip :color="item.isActive ? 'success' : 'warning'" slot="end" size="small">
              {{ item.isActive ? t('statusActive', '啟用') : t('statusInactive', '停用') }}
            </ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option v-if="permissionStore.hasPermission('VENDOR', 'UPDATE')" color="primary" @click="editData(item)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('VENDOR', 'DELETE')" color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="storefrontOutline" size="large" color="medium" />
            <p>{{ t('noVendors', '尚無供應商資料') }}</p>
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
          <ion-title>{{ isEdite ? t('editVendor', '編輯供應商') : t('addVendor', '新增供應商') }}</ion-title>
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
              <ion-label position="stacked">{{ t('vendorName', '供應商名稱') }}</ion-label>
              <ion-input v-model="basicForm.name" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item button @click="openProductTypePicker">
              <ion-label>{{ t('productType', '產品類型') }}</ion-label>
              <ion-note slot="end">{{ getProductTypeLabel(basicForm.productTypeCode) || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('taxId', '統一編號') }}</ion-label>
              <ion-input v-model="basicForm.taxId" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 聯絡資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('contactInfo', '聯絡資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('contactPerson', '聯絡人') }}</ion-label>
              <ion-input v-model="basicForm.contactPerson" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('contactPhone', '聯絡電話') }}</ion-label>
              <ion-input v-model="basicForm.phone" type="tel" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('companyPhone', '公司電話') }}</ion-label>
              <ion-input v-model="basicForm.companyPhone" type="tel" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('email', '電子信箱') }}</ion-label>
              <ion-input v-model="basicForm.email" type="email" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('companyAddress', '公司地址') }}</ion-label>
              <ion-input v-model="basicForm.fullAddress" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 付款資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('paymentInfo', '付款資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('paymentTermsDaysLabel', '付款天數') }}</ion-label>
              <ion-input v-model="basicForm.paymentTerms" type="number" :placeholder="t('defaultPaymentTerms', '預設 30 天')" />
            </ion-item>
          </ion-item-group>

          <!-- 銀行資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('bankInfo', '銀行資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('bankAccountName', '戶名') }}</ion-label>
              <ion-input v-model="basicForm.bankAccountName" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('bankAccountNumber', '帳號') }}</ion-label>
              <ion-input v-model="basicForm.bankAccountNumber" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('bankName', '銀行名稱') }}</ion-label>
              <ion-input v-model="basicForm.bankName" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('branchName', '分行名稱') }}</ion-label>
              <ion-input v-model="basicForm.branchName" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 其他資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('otherInfo', '其他資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
              <ion-textarea v-model="basicForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
            </ion-item>
            <ion-item button @click="openStatusPicker">
              <ion-label>{{ t('status', '狀態') }}</ion-label>
              <ion-note slot="end">{{ basicForm.isActive ? t('statusActive', '啟用') : t('statusInactive', '停用') }}</ion-note>
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 產品類型選擇 Modal -->
    <ion-modal :is-open="productTypePickerVisible" @didDismiss="closeProductTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeProductTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectProductType', '選擇產品類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in productTypeOptions" :key="option.value" button @click="selectProductType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.productTypeCode === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
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
          <ion-item v-for="option in statusSelectOptions" :key="option.value" button @click="selectStatus(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.isActive === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
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
  IonMenuButton,
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
import { addOutline, createOutline, trashOutline, checkmarkOutline, storefrontOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useDataList } from './useDataList';

const { t } = useI18n();
const permissionStore = usePermissionStore();

// 使用共用邏輯
const {
  productTypeOptions,
  statusSelectOptions,
  loadProductTypes,
  findProductTypeByCode,
  clearFilter: _clearFilter,
  basicDataList,
  pagination,
  getAPI,
  dialogVisible,
  isSaving,
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
const globalSearch = ref('');
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);

// 選擇器狀態
const productTypePickerVisible = ref(false);
const statusPickerVisible = ref(false);

const openProductTypePicker = () => (productTypePickerVisible.value = true);
const closeProductTypePicker = () => (productTypePickerVisible.value = false);
const selectProductType = (value) => {
  basicForm.value.productTypeCode = value;
  closeProductTypePicker();
};

const openStatusPicker = () => (statusPickerVisible.value = true);
const closeStatusPicker = () => (statusPickerVisible.value = false);
const selectStatus = (value) => {
  basicForm.value.isActive = value;
  closeStatusPicker();
};

const getProductTypeLabel = (code) => findProductTypeByCode(code)?.label || '';

const clearGlobalSearch = () => {
  globalSearch.value = '';
};

const clearFilter = () => {
  globalSearch.value = '';
  _clearFilter();
};

// 刪除確認
const handleDelete = async (item) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteVendorConfirm', '確定要刪除此供應商嗎？'),
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
watch(globalSearch, async (newValue) => {
  // 透過 API 搜尋（簡化版，後續可加入更複雜的搜尋邏輯）
  pagination.page = 1;
  hasMore.value = true;
  await getAPI();
});

// 生命週期
onMounted(async () => {
  loading.value = true;
  await loadProductTypes();
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

.vendor-list {
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
