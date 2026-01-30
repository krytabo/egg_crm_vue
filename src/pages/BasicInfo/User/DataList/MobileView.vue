<!-- src/pages/BasicInfo/User/DataList/MobileView.vue 員工資料（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('employeeListTitle', '員工資料') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="openCreateDialog">
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
            <div class="summary-item">
              <span class="summary-label">{{ t('statusActive', '啟用中') }}</span>
              <span class="summary-value text-blue">{{ activeCount }} {{ t('count', '人') }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 篩選區 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-list lines="none">
            <ion-item>
              <ion-label>{{ t('searchName', '搜尋姓名') }}</ion-label>
              <ion-input v-model="searchFields.name" :placeholder="t('pleaseEnter', '請輸入')" @ionChange="handleFilterChange" />
            </ion-item>
            <ion-item button @click="openRolePicker">
              <ion-label>{{ t('role', '角色') }}</ion-label>
              <ion-note slot="end">{{ filters.role?.name || t('all', '全部') }}</ion-note>
            </ion-item>
            <ion-item button @click="openJobTypePicker">
              <ion-label>{{ t('jobType', '職務類型') }}</ion-label>
              <ion-note slot="end">{{ getJobTypeLabel(filters.jobType) || t('all', '全部') }}</ion-note>
            </ion-item>
            <ion-item button @click="openStatusPicker">
              <ion-label>{{ t('status', '狀態') }}</ion-label>
              <ion-note slot="end">{{ getStatusLabel(filters.status) }}</ion-note>
            </ion-item>
          </ion-list>
          <div class="filter-actions">
            <ion-button size="small" fill="outline" color="danger" @click="clearFilter">
              {{ t('clearFilter', '清除篩選') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 員工列表 -->
      <ion-list class="employee-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="editData(item)">
            <ion-avatar slot="start" v-if="item.avatar">
              <img :src="item.avatar" alt="avatar" />
            </ion-avatar>
            <ion-avatar slot="start" v-else>
              <ion-icon :icon="personCircleOutline" size="large" color="medium" />
            </ion-avatar>
            <ion-label>
              <h2>{{ item.fullName }}</h2>
              <p>{{ item.role || '—' }} · {{ getJobTypeLabel(item.jobType) }}</p>
              <p class="text-sm text-gray-500">{{ item.phone }} · {{ item.email }}</p>
            </ion-label>
            <ion-chip :color="item.isActive ? 'success' : 'danger'" slot="end" size="small">
              {{ item.isActive ? t('statusActive', '啟用') : t('statusInactive', '停用') }}
            </ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="editData(item)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="peopleOutline" size="large" color="medium" />
            <p>{{ t('noEmployees', '尚無員工資料') }}</p>
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

    <!-- 角色選擇 Modal -->
    <ion-modal :is-open="rolePickerVisible" @didDismiss="closeRolePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeRolePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectRole', '選擇角色') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item button @click="selectRole(null)">
            <ion-label>{{ t('all', '全部') }}</ion-label>
            <ion-icon v-if="!filters.role" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
          <ion-item v-for="role in roleOptions" :key="role.id" button @click="selectRole(role)">
            <ion-label>{{ role.name }}</ion-label>
            <ion-icon v-if="filters.role?.id === role.id" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 職務類型選擇 Modal -->
    <ion-modal :is-open="jobTypePickerVisible" @didDismiss="closeJobTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeJobTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectJobType', '選擇職務類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item button @click="selectJobType('')">
            <ion-label>{{ t('all', '全部') }}</ion-label>
            <ion-icon v-if="!filters.jobType" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
          <ion-item v-for="option in jobTypeOptions" :key="option.value" button @click="selectJobType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="filters.jobType === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
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
          <ion-item v-for="option in statusFilterOptions" :key="option.value" button @click="selectStatus(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="filters.status === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 新增/編輯 Modal -->
    <ion-modal :is-open="dialogVisible" @didDismiss="closeDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ isEdite ? t('editEmployee', '編輯員工') : t('addEmployee', '新增員工') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveData" :disabled="isSaving">
              {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-label position="stacked">{{ t('fullName', '姓名') }} *</ion-label>
            <ion-input v-model="basicForm.fullName" :placeholder="t('pleaseEnterFullName', '請輸入姓名')" />
          </ion-item>
          <ion-item v-if="editingId">
            <ion-label>{{ t('accountStatus', '帳號狀態') }}</ion-label>
            <ion-toggle v-model="basicForm.isActive" slot="end" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('idNumber', '身分證號') }}</ion-label>
            <ion-input v-model="basicForm.idNumber" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item button @click="openFormRolePicker">
            <ion-label>{{ t('permissionSetting', '權限設定') }} *</ion-label>
            <ion-note slot="end">{{ basicForm.role?.name || t('pleaseSelect', '請選擇') }}</ion-note>
          </ion-item>
          <ion-item button @click="openFormJobTypePicker">
            <ion-label>{{ t('jobType', '職務類型') }} *</ion-label>
            <ion-note slot="end">{{ getJobTypeLabel(basicForm.jobType) || t('pleaseSelect', '請選擇') }}</ion-note>
          </ion-item>
          <!-- 司機專用欄位（僅新增時顯示） -->
          <template v-if="!isEditing && basicForm.jobType === 'DRIVER'">
            <ion-item>
              <ion-label position="stacked">{{ t('licenseNumber', '駕照號碼') }} *</ion-label>
              <ion-input v-model="basicForm.licenseNumber" :placeholder="t('pleaseEnterLicenseNumber', '請輸入駕照號碼')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('licenseExpiry', '駕照到期日') }} *</ion-label>
              <ion-datetime-button datetime="licenseExpiry" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="licenseExpiry" :value="basicForm.licenseExpiry" presentation="date" @ionChange="onLicenseExpiryChange" />
              </ion-modal>
            </ion-item>
          </template>
          <ion-item>
            <ion-label position="stacked">{{ t('phone', '電話') }}</ion-label>
            <ion-input v-model="basicForm.phone" type="tel" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('birthday', '生日') }}</ion-label>
            <ion-datetime-button datetime="birthday" />
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="birthday" :value="basicForm.birthday" presentation="date" @ionChange="onBirthdayChange" />
            </ion-modal>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('emailLoginAccount', '電子信箱（登入帳號）') }} *</ion-label>
            <ion-input v-model="basicForm.email" type="email" :placeholder="t('pleaseEnterEmail', '請輸入電子信箱')" :disabled="isEditing" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('address', '地址') }}</ion-label>
            <ion-input v-model="basicForm.address" :placeholder="t('pleaseEnterAddress', '請輸入地址')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('hireDate', '入職日期') }}</ion-label>
            <ion-datetime-button datetime="hireDate" />
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="hireDate" :value="basicForm.hireDate" presentation="date" @ionChange="onHireDateChange" />
            </ion-modal>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('password', '密碼') }}</ion-label>
            <ion-input v-model="basicForm.password" type="password" :placeholder="isEdite ? t('resetPasswordHint', '留空則不更改') : t('pleaseEnter', '請輸入')" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 表單角色選擇 Modal -->
    <ion-modal :is-open="formRolePickerVisible" @didDismiss="closeFormRolePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeFormRolePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectRole', '選擇角色') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="role in roleOptions" :key="role.id" button @click="selectFormRole(role)">
            <ion-label>{{ role.name }}</ion-label>
            <ion-icon v-if="basicForm.role?.id === role.id" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 表單職務類型選擇 Modal -->
    <ion-modal :is-open="formJobTypePickerVisible" @didDismiss="closeFormJobTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeFormJobTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectJobType', '選擇職務類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in jobTypeOptions" :key="option.value" button @click="selectFormJobType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.jobType === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
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
  IonLabel,
  IonNote,
  IonInput,
  IonChip,
  IonIcon,
  IonAvatar,
  IonToggle,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  toastController,
  alertController,
} from '@ionic/vue';
import {
  addOutline,
  createOutline,
  trashOutline,
  checkmarkOutline,
  personCircleOutline,
  peopleOutline,
} from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { RoleListGet } from '@/assets/API/Role';
import { useDataList } from './useDataList';

const { t } = useI18n();

// 訊息顯示（Mobile 使用 Ionic Toast）
const showMessage = async (type, content) => {
  const toast = await toastController.create({
    message: content,
    duration: 2000,
    position: 'top',
    color: type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary',
  });
  await toast.present();
};

// 使用共用邏輯
const {
  // 選項
  jobTypeOptions,
  statusFilterOptions,

  // 工具函式
  getJobTypeLabel,

  // 篩選相關
  searchFields,
  filters,
  handleFilterChange,
  clearFilter,

  // 列表相關
  basicDataList,
  pagination,
  getAPI,

  // 新增編輯相關
  editingId,
  dialogVisible,
  isSaving,
  basicFormRef,
  isEdite,
  isEditing,
  basicForm,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,
} = useDataList(t, showMessage);

// ===== 手機版專用狀態 =====
const loading = ref(false);
const hasMore = ref(true);
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);
const activeCount = computed(() => basicDataList.value.filter((item) => item.isActive).length);

// 角色選項
const roleOptions = ref([]);
const loadRoleOptions = async () => {
  try {
    const response = await RoleListGet({ limit: 100 });
    roleOptions.value = response?.data?.data?.items || response?.data?.items || [];
  } catch (error) {
    console.error('Failed to load roles:', error);
  }
};

// 篩選 Modal 狀態
const rolePickerVisible = ref(false);
const jobTypePickerVisible = ref(false);
const statusPickerVisible = ref(false);

const openRolePicker = () => (rolePickerVisible.value = true);
const closeRolePicker = () => (rolePickerVisible.value = false);
const selectRole = (role) => {
  filters.role = role;
  closeRolePicker();
  handleFilterChange();
};

const openJobTypePicker = () => (jobTypePickerVisible.value = true);
const closeJobTypePicker = () => (jobTypePickerVisible.value = false);
const selectJobType = (value) => {
  filters.jobType = value;
  closeJobTypePicker();
  handleFilterChange();
};

const openStatusPicker = () => (statusPickerVisible.value = true);
const closeStatusPicker = () => (statusPickerVisible.value = false);
const selectStatus = (value) => {
  filters.status = value;
  closeStatusPicker();
  handleFilterChange();
};

const getStatusLabel = (status) => {
  const option = statusFilterOptions.find((opt) => opt.value === status);
  return option?.label || t('all', '全部');
};

// 表單內的選擇 Modal
const formRolePickerVisible = ref(false);
const formJobTypePickerVisible = ref(false);

const openFormRolePicker = () => (formRolePickerVisible.value = true);
const closeFormRolePicker = () => (formRolePickerVisible.value = false);
const selectFormRole = (role) => {
  basicForm.value.role = role;
  closeFormRolePicker();
};

const openFormJobTypePicker = () => (formJobTypePickerVisible.value = true);
const closeFormJobTypePicker = () => (formJobTypePickerVisible.value = false);
const selectFormJobType = (value) => {
  basicForm.value.jobType = value;
  closeFormJobTypePicker();
};

// 日期選擇
const onBirthdayChange = (event) => {
  basicForm.value.birthday = event.detail.value?.split('T')[0] || '';
};

const onHireDateChange = (event) => {
  basicForm.value.hireDate = event.detail.value?.split('T')[0] || '';
};

const onLicenseExpiryChange = (event) => {
  basicForm.value.licenseExpiry = event.detail.value?.split('T')[0] || '';
};

// 刪除確認
const handleDelete = async (item) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteEmployeeConfirm', '確定要刪除此員工嗎？'),
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

// 生命週期
onMounted(async () => {
  loading.value = true;
  await Promise.all([getAPI(), loadRoleOptions()]);
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

.summary-value.text-blue {
  color: var(--ion-color-primary);
}

.filter-card {
  margin: 8px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.employee-list {
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
