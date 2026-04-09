<!-- src/pages/BasicInfo/User/DataList/DesktopView.vue 員工資料（桌面版） -->
<template>
  <Card>
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-1 flex-col">
        <div class="icon-egg"></div>
        <CardTitle>{{ t('employeeListTitle') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }) }}</p>
      </div>
      <a-button status="danger" plain @click="clearFilter">{{ t('clearFilter') }}</a-button>
      <a-button type="primary" v-if="permissionStore.hasPermission('USER', 'CREATE')" @click="openCreateDialog">{{ t('addEmployee') }}</a-button>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         篩選區塊         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="1">
      <CustomFormItem :label="t('hireDate')">
        <div class="flex items-center gap-2">
          <TinyDatePicker v-model="filters.hireDateFrom" :placeholder="t('selectDate', '請選擇日期')" value-format="yyyy-MM-dd" clearable @change="handleFilterChange" class="w-full" />
          <span>-</span>
          <TinyDatePicker v-model="filters.hireDateTo" :placeholder="t('selectDate', '請選擇日期')" value-format="yyyy-MM-dd" clearable @change="handleFilterChange" class="w-full" />
          <a-button status="danger" @click="clearHireDateFilter">{{ t('clearHireDate') }}</a-button>
        </div>
      </CustomFormItem>
    </CustomForm>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" :row-id="'id'">
      <CustomTinyGridColumn field="fullName" :title="t('fullName')" fixed="left" :width="260" sortable :sort-field="'fullName'" :current-order="getColumnOrder('fullName')" @sort="handleColumnSort">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('fullName') }}</span>
            <div class="flex items-center gap-1">
              <TinyInput
                v-model="searchFields.name"
                :placeholder="t('pleaseEnter')"
                class="h-8 flex-1 text-xs"
                clearable
                @keyup.enter="handleFilterChange('name')"
                @clear="handleFilterChange('name')"
              />
            </div>
          </div>
        </template>
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <img v-if="row.avatar" :src="row.avatar" alt="avatar" class="h-10 w-10 rounded-full object-cover" />
            <div class="flex flex-col">
              <span class="text-base font-medium text-gray-900">{{ row.fullName }}</span>
            </div>
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="roleLabel" :title="t('role')" :width="180">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('role') }}</span>
            <InfiniteSelect v-model="filters.role" dataSource="roles" type="outline" :placeholder="t('pleaseSelectPermission')" allowClear @change="handleFilterChange" />
          </div>
        </template>
        <template #default="{ row }">
          <div class="text-[16px]">{{ row.role }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="jobType" :title="t('jobType')" :width="200">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('jobType') }}</span>
            <TinySelect v-model="filters.jobType" :options="jobTypeFilterOptions" :placeholder="t('all')" class="h-8 text-xs" clearable @change="handleFilterChange" />
          </div>
        </template>
        <template #default="{ row }">
          <div class="text-[16px]">{{ getJobTypeLabel(row.jobType) }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="phone" :title="t('phone')" :width="180">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('phone') }}</span>
            <TinyInput
              v-model="searchFields.phone"
              :placeholder="t('pleaseEnter')"
              class="h-8 flex-1 text-xs"
              clearable
              @keyup.enter="handleFilterChange('phone')"
              @clear="handleFilterChange('phone')"
            />
          </div>
        </template>
        <template #default="{ row }">
          <div class="text-[16px]">{{ row.phone }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="email" :title="t('email')" :min-width="220" sortable :sort-field="'email'" :current-order="getColumnOrder('email')" @sort="handleColumnSort">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-[#111827]">{{ t('email') }}</span>
            <div class="flex items-center gap-1">
              <TinyInput
                v-model="searchFields.email"
                :placeholder="t('pleaseEnter')"
                class="h-8 flex-1 text-xs"
                clearable
                @keyup.enter="handleFilterChange('email')"
                @clear="handleFilterChange('email')"
              />
            </div>
          </div>
        </template>
        <template #default="{ row }">
          <div class="text-[16px]">{{ row.email }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="hireDate" :title="t('hireDate')" :width="150" sortable :sort-field="'hireDate'" :current-order="getColumnOrder('hireDate')" @sort="handleColumnSort">
        <template #default="{ row }">
          <div class="text-[16px]">{{ formatDate(row.hireDate) }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="lastLoginAt" :title="t('lastLoginAt')" :width="180" sortable :sort-field="'lastLoginAt'" :current-order="getColumnOrder('lastLoginAt')" @sort="handleColumnSort">
        <template #default="{ row }">
          <div class="text-[16px]">{{ formatDate(row.lastLoginAt) || '—' }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="createdAt" :title="t('createdAt')" :width="180" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort">
        <template #default="{ row }">
          <div class="text-[16px]">{{ formatDate(row.createdAt) || '—' }}</div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status')" :width="150" align="center" fixed="right">
        <template #header>
          <div class="flex flex-col gap-1 text-center">
            <span class="text-[16px] text-[#111827]">{{ t('status') }}</span>
            <TinySelect v-model="filters.status" :options="statusFilterOptions" :placeholder="t('all')" class="h-8 text-xs" @change="handleFilterChange" />
          </div>
        </template>
        <template #default="{ row }">
          <a-tag :color="row.isActive ? 'arcoblue' : 'red'" size="large">{{ row.isActive ? t('statusActive') : t('statusInactive') }}</a-tag>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions')" :width="150" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <a-tooltip v-if="permissionStore.hasPermission('USER', 'DELETE')" :content="isSystemAdmin(row) && !isDevEnv ? t('systemAdminCannotDelete', '系統管理員無法刪除') : t('delete')">
              <button
                class="table-button"
                :disabled="isSystemAdmin(row) && !isDevEnv"
                :class="{ 'cursor-not-allowed opacity-40': isSystemAdmin(row) && !isDevEnv }"
                @click="!isSystemAdmin(row) || isDevEnv ? deleteData(row.id) : null"
              >
                <Trash2 class="size-4 text-rose-500" />
              </button>
            </a-tooltip>
            <a-tooltip v-if="permissionStore.hasPermission('USER', 'UPDATE')" :content="isSystemAdmin(row) && !isDevEnv ? t('systemAdminCannotEdit', '系統管理員無法編輯') : t('changePassword')">
              <button
                class="table-button"
                :disabled="isSystemAdmin(row) && !isDevEnv"
                :class="{ 'cursor-not-allowed opacity-40': isSystemAdmin(row) && !isDevEnv }"
                @click="!isSystemAdmin(row) || isDevEnv ? openChangePassword(row) : null"
              >
                <KeyRound class="size-4 text-amber-500" />
              </button>
            </a-tooltip>
            <a-tooltip v-if="permissionStore.hasPermission('USER', 'UPDATE')" :content="isSystemAdmin(row) && !isDevEnv ? t('systemAdminCannotEdit', '系統管理員無法編輯') : t('edit')">
              <button
                class="table-button"
                :disabled="isSystemAdmin(row) && !isDevEnv"
                :class="{ 'cursor-not-allowed opacity-40': isSystemAdmin(row) && !isDevEnv }"
                @click="!isSystemAdmin(row) || isDevEnv ? editData(row) : null"
              >
                <SquarePen class="size-4" />
              </button>
            </a-tooltip>
          </div>
        </template>
      </CustomTinyGridColumn>
    </CustomTinyGrid>
    <AppPagination
      class="md:w-auto"
      :current="pagination.page"
      :page-size="pagination.limit"
      :total="pagination.total"
      :page-size-options="pageSizeOptions"
      @change="CurrentChange"
      @page-size-change="SizeChange"
    />
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       新增編輯視窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="dialogVisible" :top="30" draggable :maskClosable="false" :closable="false" width="700px" :unmount-on-close="true" :fullscreen="fullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ isEdite ? t('editEmployee') : t('addEmployee') }}</div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>
    <perfect-scrollbar :class="[fullscreen ? 'h-[calc(100vh-120px)]' : userPhoto ? 'h-[calc(100vh-320px)]' : 'h-[calc(100vh-350px)]']">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <template v-if="userPhoto">
          <div class="relative mx-auto size-27.5 overflow-hidden rounded-[15px] border border-gray-200" @click="basicForm.avatar && openPhoto()">
            <a-image :src="basicForm.avatar" class="h-full w-full cursor-pointer rounded-full object-cover" :preview-visible="false" />

            <div class="absolute bottom-0 flex w-27.5 items-center justify-end gap-1 p-1">
              <a-button v-if="basicForm.avatar" shape="circle" status="danger" @click.stop="clearAvatar">
                <i class="ri-delete-bin-fill font-[16px]" />
              </a-button>
              <a-button shape="circle" @click.stop="openImagePicker">
                <i class="ri-pencil-fill font-[16px]" />
              </a-button>
            </div>
          </div>
          <a-divider class="col-span-2 my-4" />
        </template>
        <div class="grid grid-cols-2 gap-x-3">
          <AFormItem :label="t('fullName', '姓名')" field="fullName">
            <CustomField v-model="basicForm.fullName" type="input" :placeholder="t('pleaseEnterFullName')" allowClear />
          </AFormItem>
          <AFormItem :label="t('emailLoginAccount', '電子信箱')" field="email">
            <AEmailAutocomplete v-model="basicForm.email" :placeholder="t('pleaseEnterEmail')" :display-only="isEditing" />
          </AFormItem>
          <AFormItem :label="t('birthday', '生日')">
            <CustomField v-model="basicForm.birthday" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
          </AFormItem>
          <AFormItem :label="t('idNumber', '身分證字號')">
            <CustomField v-model="basicForm.idNumber" type="input" :placeholder="t('pleaseEnter')" allowClear />
          </AFormItem>
          <AFormItem :label="t('phone', '電話')">
            <CustomField v-model="basicForm.phone" type="input" :placeholder="t('pleaseEnter')" allowClear />
          </AFormItem>
          <AFormItem :label="t('hireDate', '入職日期')" field="hireDate">
            <CustomField v-model="basicForm.hireDate" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
          </AFormItem>
          <AFormItem :label="t('address', '地址')" class="col-span-2">
            <CustomField v-model="basicForm.address" type="input" :placeholder="t('pleaseEnterAddress')" allowClear />
          </AFormItem>
          <AFormItem :label="t('permissionSetting', '權限設定')" field="role">
            <InfiniteSelect v-model="basicForm.role" dataSource="roles" :placeholder="t('pleaseSelectPermission')" />
          </AFormItem>
          <AFormItem :label="t('jobType', '職務類型')" field="jobType">
            <CustomField v-model="basicForm.jobType" type="select" :placeholder="t('pleaseSelectJobType')" :options="jobTypeOptions" allowClear />
          </AFormItem>
          <!-- 司機專用欄位 -->
          <template v-if="basicForm.jobType === 'DRIVER'">
            <AFormItem :label="t('licenseNumber')" field="licenseNumber">
              <CustomField v-model="basicForm.licenseNumber" type="input" :placeholder="t('pleaseEnterLicenseNumber')" :readonly="isDriverDataLocked" allowClear />
            </AFormItem>
            <AFormItem :label="t('licenseExpiry')" field="licenseExpiry">
              <CustomField v-model="basicForm.licenseExpiry" type="date-picker" :placeholder="t('pleaseSelectDate')" :readonly="isDriverDataLocked" allowClear />
            </AFormItem>

            <div v-if="isDriverDataLocked" class="bg-rose-50 px-4 py-2 rounded-md text-rose-500 col-span-2">{{ t('driverInfoEditNote') }}</div>
          </template>
          <a-divider class="col-span-2 my-4" />
          <AFormItem v-if="!isEdite" :label="t('password', '密碼')" field="password" class="col-span-2">
            <a-input-password
              v-model="basicForm.password"
              :placeholder="isEdite ? t('resetPasswordHint') : t('passwordMinLengthHint', { length: MIN_PASSWORD_LENGTH })"
              allowClear
              autocomplete="new-password"
            />
          </AFormItem>
        </div>
      </AForm>

      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="horizontal" :rules="basicFormRules">
        <AFormItem v-if="editingId" :label="t('accountStatus', '狀態')">
          <a-switch v-model="basicForm.isActive" checked-color="#165dff" unchecked-color="#F53F3F">
            <template #checked>{{ t('statusActive') }}</template>
            <template #unchecked>{{ t('statusInactive') }}</template>
          </a-switch>
        </AFormItem>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button @click="closeDialog">{{ t('cancel') }}</a-button>
        <a-button type="primary" :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? t('saving') : t('save') }}</a-button>
      </div>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         圖片預覽         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <ImagePreview :src="photoSrc" v-model:visible="photoPreview" @VisibleChange="visibleChange" />

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         圖片上傳         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <ImagePickerModal v-model="basicForm.avatar" v-model:visible="imagePickerVisible" :max-size="MAX_AVATAR_SIZE" :upload-api="uploadImageViaApi" />

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--        變更密碼視窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="passwordDialogVisible" :title="t('changePassword', '變更密碼')" :top="100" draggable :maskClosable="false" :closable="false" width="450px" :unmount-on-close="true">
    <AForm ref="passwordFormRef" auto-label-width :model="passwordForm" layout="vertical" :rules="passwordFormRules">
      <AFormItem :label="t('employee', '員工')">
        <a-input :model-value="passwordForm.userName" disabled />
      </AFormItem>
      <AFormItem :label="t('oldPassword', '舊密碼')" field="oldPassword">
        <a-input-password v-model="passwordForm.oldPassword" :placeholder="t('pleaseEnterOldPassword', '請輸入舊密碼')" allowClear autocomplete="new-password" />
      </AFormItem>
      <AFormItem :label="t('newPassword', '新密碼')" field="newPassword">
        <a-input-password v-model="passwordForm.newPassword" :placeholder="t('passwordMinLengthHint', { length: PASSWORD_MIN_LENGTH })" allowClear autocomplete="new-password" />
      </AFormItem>
      <AFormItem :label="t('confirmNewPassword', '確認新密碼')" field="confirmPassword">
        <a-input-password v-model="passwordForm.confirmPassword" :placeholder="t('pleaseConfirmNewPassword', '請再次輸入新密碼')" allowClear autocomplete="new-password" />
      </AFormItem>
    </AForm>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button @click="closePasswordDialog">{{ t('cancel') }}</a-button>
        <a-button type="primary" @click="submitChangePassword" :loading="isChangingPassword">{{ isChangingPassword ? t('saving') : t('save') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { AuthPasswordChangePost } from '@/assets/API/Auth';
import Swal from 'sweetalert2';
import { TinyDatePicker, TinyInput, TinySelect } from '@opentiny/vue';
import { SquarePen, Trash2, KeyRound, Expand, Shrink } from 'lucide-vue-next';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePreview } from '@kousum/semi-ui-vue';
import { Button } from '@/components/ui/button';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import ImagePickerModal from '@/components/Form/ImagePickerModal.vue';
import AEmailAutocomplete from '@/components/Form/AEmailAutocomplete.vue';
import CustomField from '@/components/Form/CustomField.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useSystemStore } from '@/stores/system';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useI18n } from 'vue-i18n';
import { useDataList } from './useDataList';

const systemStore = useSystemStore();
const permissionStore = usePermissionStore();
const { t } = useI18n();

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 360, 100));

const isDevEnv = import.meta.env.DEV;
const isSystemAdmin = (row) => row.role === '系統管理員'; //判斷是否為系統管理員

//＝＝＝＝＝＝＝＝＝ 變更密碼相關 ＝＝＝＝＝＝＝＝＝
const fullscreen = ref(false);
const passwordDialogVisible = ref(false);
const isChangingPassword = ref(false);
const passwordFormRef = ref(null);
const passwordForm = ref({
  userId: null,
  userName: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const PASSWORD_MIN_LENGTH = 6; //密碼最小長度
const passwordFormRules = {
  oldPassword: [{ required: true, message: t('pleaseEnterOldPassword', '請輸入舊密碼') }],
  newPassword: [
    { required: true, message: t('pleaseEnterNewPassword', '請輸入新密碼') },
    { minLength: PASSWORD_MIN_LENGTH, message: t('passwordMinLengthHint', { length: PASSWORD_MIN_LENGTH }) },
  ],
  confirmPassword: [
    { required: true, message: t('pleaseConfirmNewPassword', '請再次輸入新密碼') },
    {
      validator: (value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(t('passwordNotMatch', '兩次輸入的密碼不一致'));
        } else {
          callback();
        }
      },
    },
  ],
};
const openChangePassword = (row) => {
  passwordForm.value = {
    userId: row.id,
    userName: row.fullName,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  passwordDialogVisible.value = true;
}; //開啟變更密碼視窗
const closePasswordDialog = () => {
  passwordDialogVisible.value = false;
  passwordFormRef.value?.resetFields();
}; //關閉變更密碼視窗
const submitChangePassword = async () => {
  try {
    const valid = await passwordFormRef.value?.validate();
    if (valid) return false;

    isChangingPassword.value = true;
    await AuthPasswordChangePost({
      userId: passwordForm.value.userId,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    Swal.fire({
      icon: 'success',
      title: t('success', '成功'),
      text: t('passwordChangedSuccess', '密碼變更成功'),
      timer: 1500,
      showConfirmButton: false,
    });

    closePasswordDialog();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('error', '錯誤'),
      text: error?.response?.data?.message || t('passwordChangedFailed', '密碼變更失敗'),
    });
  } finally {
    isChangingPassword.value = false;
  }
}; //提交變更密碼

const {
  //常數
  MAX_AVATAR_SIZE,
  MIN_PASSWORD_LENGTH,
  userPhoto,

  //選項
  jobTypeOptions,
  statusFilterOptions,
  jobTypeFilterOptions,

  //工具函式
  formatDate,
  getJobTypeLabel,

  //篩選相關
  searchFields,
  filters,
  getColumnOrder,
  handleColumnSort,
  handleFilterChange,
  clearFilter,
  clearHireDateFilter,

  //列表相關
  basicDataList,
  pagination,
  pageSizeOptions,
  getAPI,
  CurrentChange,
  SizeChange,

  //新增編輯相關
  editingId,
  dialogVisible,
  isSaving,
  basicFormRef,
  isEdite,
  isEditing,
  isDriverDataLocked,
  basicForm,
  basicFormRules,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,

  //圖片相關
  imagePickerVisible,
  photoPreview,
  photoSrc,
  openPhoto,
  visibleChange,
  openImagePicker,
  clearAvatar,
  uploadImageViaApi,
} = useDataList(t);

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await getAPI();
  await nextTick();
});
</script>

<style scoped>
.tiny-form-item {
  margin-bottom: 4px !important;
}
.avatar-edit-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d5db;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}
.group:hover .avatar-edit-trigger {
  opacity: 1;
}
</style>
