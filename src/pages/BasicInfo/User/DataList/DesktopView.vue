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
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent>
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--         其他搜尋         -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <div class="mb-4 flex items-center gap-3 rounded-md bg-[#f5f7fb] p-4">
        <span class="text-sm font-medium text-gray-700">{{ t('hireDate') }}</span>
        <a-date-picker v-model="filters.hireDateFrom" :placeholder="t('pleaseSelectDate')" format="YYYY-MM-DD" @change="handleFilterChange" />
        <span>-</span>
        <a-date-picker v-model="filters.hireDateTo" :placeholder="t('pleaseSelectDate')" format="YYYY-MM-DD" @change="handleFilterChange" />
        <a-button status="danger" @click="clearHireDateFilter">{{ t('clearHireDate') }}</a-button>
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--          列表            -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" :row-id="'id'">
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
        <CustomTinyGridColumn field="email" :title="t('email')" min-width="220" sortable :sort-field="'email'" :current-order="getColumnOrder('email')" @sort="handleColumnSort">
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
        <CustomTinyGridColumn field="status" :title="t('status')" :width="150" align="center">
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
        <CustomTinyGridColumn field="" :title="t('actions')" :width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <a-tooltip v-if="permissionStore.hasPermission('USER', 'DELETE')" :content="isSystemAdmin(row) && !isDevEnv ? t('systemAdminCannotDelete', '系統管理員無法刪除') : ''">
                <button class="table-button" :disabled="isSystemAdmin(row) && !isDevEnv" :class="{ 'cursor-not-allowed opacity-40': isSystemAdmin(row) && !isDevEnv }" @click="!isSystemAdmin(row) || isDevEnv ? deleteData(row.id) : null">
                  <Trash2 class="size-4 text-rose-500" />
                </button>
              </a-tooltip>
              <a-tooltip v-if="permissionStore.hasPermission('USER', 'UPDATE')" :content="isSystemAdmin(row) && !isDevEnv ? t('systemAdminCannotEdit', '系統管理員無法編輯') : ''">
                <button class="table-button" :disabled="isSystemAdmin(row) && !isDevEnv" :class="{ 'cursor-not-allowed opacity-40': isSystemAdmin(row) && !isDevEnv }" @click="!isSystemAdmin(row) || isDevEnv ? editData(row) : null">
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
    </CardContent>
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       新增編輯視窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="dialogVisible" :title="isEdite ? t('editEmployee') : t('addEmployee')" :top="30" draggable :maskClosable="false" :closable="false" width="700px" :unmount-on-close="true">
    <perfect-scrollbar class="h-[calc(100vh-370px)]" :class="userPhoto ? 'h-[calc(100vh-370px)]' : 'h-[calc(100vh-470px)]'">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <template v-if="userPhoto">
          <div class="relative mx-auto size-[110px] overflow-hidden rounded-[15px] border border-gray-200" @click="basicForm.avatar && openPhoto()">
            <a-image :src="basicForm.avatar" class="h-full w-full cursor-pointer rounded-full object-cover" :preview-visible="false" />

            <div class="absolute bottom-0 flex w-[110px] items-center justify-end gap-1 p-1">
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
          <AFormItem :label="t('fullName')" field="fullName" :class="editingId ? 'col-span-1' : 'col-span-2'">
            <CustomField v-model="basicForm.fullName" type="input" :placeholder="t('pleaseEnterFullName')" allowClear />
          </AFormItem>
          <AFormItem v-if="editingId" :label="t('accountStatus')">
            <a-switch v-model="basicForm.isActive" checked-color="#165dff" unchecked-color="#F53F3F">
              <template #checked>{{ t('statusActive') }}</template>
              <template #unchecked>{{ t('statusInactive') }}</template>
            </a-switch>
          </AFormItem>
          <AFormItem :label="t('idNumber')">
            <CustomField v-model="basicForm.idNumber" type="input" :placeholder="t('pleaseEnter')" allowClear />
          </AFormItem>
          <AFormItem :label="t('permissionSetting')" field="role">
            <InfiniteSelect v-model="basicForm.role" dataSource="roles" :placeholder="t('pleaseSelectPermission')" />
          </AFormItem>
          <AFormItem :label="t('jobType')" field="jobType">
            <CustomField v-model="basicForm.jobType" type="select" :placeholder="t('pleaseSelectJobType')" :options="jobTypeOptions" allowClear />
          </AFormItem>
          <!-- 司機專用欄位（僅新增時顯示） -->
          <template v-if="!isEditing && basicForm.jobType === 'DRIVER'">
            <AFormItem :label="t('licenseNumber')" field="licenseNumber">
              <CustomField v-model="basicForm.licenseNumber" type="input" :placeholder="t('pleaseEnterLicenseNumber')" allowClear />
            </AFormItem>
            <AFormItem :label="t('licenseExpiry')" field="licenseExpiry">
              <CustomField v-model="basicForm.licenseExpiry" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
            </AFormItem>
          </template>
          <AFormItem :label="t('phone')">
            <CustomField v-model="basicForm.phone" type="input" :placeholder="t('pleaseEnter')" allowClear />
          </AFormItem>
          <AFormItem :label="t('birthday')">
            <CustomField v-model="basicForm.birthday" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
          </AFormItem>
          <AFormItem :label="t('emailLoginAccount')" field="email">
            <AEmailAutocomplete v-model="basicForm.email" :placeholder="t('pleaseEnterEmail')" :display-only="isEditing" />
          </AFormItem>
          <AFormItem :label="t('address')" class="col-span-2">
            <CustomField v-model="basicForm.address" type="input" :placeholder="t('pleaseEnterAddress')" allowClear />
          </AFormItem>

          <a-divider class="col-span-2 my-4" />

          <AFormItem :label="t('hireDate')" field="hireDate">
            <CustomField v-model="basicForm.hireDate" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
          </AFormItem>
          <AFormItem v-if="!isEdite" :label="t('password')" field="password">
            <a-input-password
              v-model="basicForm.password"
              :placeholder="isEdite ? t('resetPasswordHint') : t('passwordMinLengthHint', { length: MIN_PASSWORD_LENGTH })"
              allowClear
              autocomplete="new-password"
            />
          </AFormItem>
        </div>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel') }}</a-button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? t('saving') : t('save') }}</Button>
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
</template>

<script setup>
import { nextTick, onMounted, onUnmounted } from 'vue';
import { TinyInput, TinySelect } from '@opentiny/vue';
import { SquarePen, Trash2 } from 'lucide-vue-next';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ImagePreview } from '@kousum/semi-ui-vue';
import { Button } from '@/components/ui/button';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
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

// 判斷是否為本地開發環境
const isDevEnv = import.meta.env.DEV;

// 判斷是否為系統管理員
const isSystemAdmin = (row) => {
  return row.role === '系統管理員';
};

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
  systemStore.updateTableHeight(430);
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
