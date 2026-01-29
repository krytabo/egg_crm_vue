<!-- src/pages/EmployeeManagementPage.vue 員工資料 -->
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
      <a-button type="primary" @click="openCreateDialog">{{ t('addEmployee') }}</a-button>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent>
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--         其他搜尋         -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <div class="mb-4 flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm layout="vertical">
          <AFormItem :label="t('hireDate')">
            <div class="flex gap-2">
              <TinyDatePicker v-model="filters.hireDateFrom" type="date" :placeholder="t('pleaseSelectDate')" format="yyyy-MM-dd" @change="handleFilterChange" />
              <TinyDatePicker v-model="filters.hireDateTo" type="date" :placeholder="t('pleaseSelectDate')" format="yyyy-MM-dd" @change="handleFilterChange" />

              <TinyButton type="danger" plain @click="clearHireDateFilter">{{ t('clearHireDate') }}</TinyButton>
            </div>
          </AFormItem>
        </AForm>
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
                <!--<span class="text-xs text-gray-500">ID：{{ row.id }}</span>-->
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
              <button class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
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
  <a-modal v-model:visible="dialogVisible" :title="isEdite ? t('editEmployee') : t('addEmployee')" :top="30" draggable :maskClosable="false" :closable="false" width="700px">
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
          <AFormItem :label="t('jobType')">
            <CustomField v-model="basicForm.jobType" type="select" :placeholder="t('pleaseSelectJobType')" :options="jobTypeOptions" allowClear />
          </AFormItem>
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

          <AFormItem :label="t('hireDate')">
            <CustomField v-model="basicForm.hireDate" type="date-picker" :placeholder="t('pleaseSelectDate')" allowClear />
          </AFormItem>
          <AFormItem :label="t('password')" field="password">
            <CustomField v-model="basicForm.password" type="input" password :placeholder="isEdite ? t('resetPasswordHint') : t('passwordMinLengthHint', { length: MIN_PASSWORD_LENGTH })" allowClear />
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
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { UserListGet, UserCreatePost, UserUpdatePatch, UserDeleteById, UserGetByID } from '@/assets/API/User';
import { dataList } from '@/assets/API/api';
import { TinyInput, TinySelect, TinyDatePicker, TinyButton } from '@opentiny/vue';
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
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const systemStore = useSystemStore();
const { t } = useI18n();

/** 常數相關 **/
const userPhoto = ref(false); //大頭照(先暫時隱藏)
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; //5MB
const DEFAULT_DATE_FORMAT = 'YYYY/MM/DD'; //預設日期格式
const DATETIME_FORMAT = 'YYYY/MM/DD HH:mm:ss'; //日期時間格式
const MIN_PASSWORD_LENGTH = 8; //最小密碼長度
const isEditing = computed(() => Boolean(editingId.value)); //是否為編輯模式

/** 選項相關 **/
const jobTypeOptions = [
  { label: t('jobTypeDriver'), value: 'DRIVER' },
  { label: t('jobTypeSales'), value: 'SALES' },
  { label: t('jobTypeWarehouse'), value: 'WAREHOUSE' },
  { label: t('jobTypeAdmin'), value: 'ADMIN' },
  { label: t('jobTypeManager'), value: 'MANAGER' },
  { label: t('jobTypeAccountant'), value: 'ACCOUNTANT' },
]; //職務類型選項
const statusFilterOptions = [
  { label: t('all'), value: 'all' },
  { label: t('statusActive'), value: 'ACTIVE' },
  { label: t('statusInactive'), value: 'INACTIVE' },
]; //狀態篩選選項
const jobTypeFilterOptions = computed(() => [{ label: '全部', value: '' }, ...jobTypeOptions]); //職務類型篩選選項

/** 共用工具 **/
const formatDate = (value, format = DEFAULT_DATE_FORMAT) => timezoneStore.formatDate(value, format); //日期格式化
const getJobTypeLabel = (jobTypeValue) => jobTypeOptions.find((option) => option.value === jobTypeValue)?.label || jobTypeValue || '—'; //取得職務類型顯示文字
const trimFields = (obj, fields) => {
  return fields.reduce((acc, field) => {
    acc[field] = obj[field]?.trim();
    return acc;
  }, {});
}; //批次 trim 欄位
const responseDataToList = (user = {}) => {
  return {
    ...user,
    id: user.id || user.userId || user._id,
    role: user.role, //權限
    jobType: user.jobType || '',
    phone: user.phone ?? t('unset'),
    email: user.email ?? t('unset'),
    idNumber: user.idNumber ?? user.nationalId ?? t('unset'),
    hireDate: formatDate(user.hireDate) || t('unset'),
    lastLoginAt: formatDate(user.lastLoginAt, DATETIME_FORMAT),
    createdAt: formatDate(user.createdAt, DATETIME_FORMAT),
    updatedAt: formatDate(user.updatedAt, DATETIME_FORMAT),
    isActive: user.isActive !== false && user.status !== 'INACTIVE',
    raw: user,
  };
}; //轉換列表列資料

/** 篩選與查詢相關 **/
const sortField = ref(''); //目前排序欄位
const sortDirection = ref('asc'); //排序方向
const sortFieldMap = {
  fullName: 'fullName',
  email: 'email',
  hireDate: 'hireDate',
  lastLoginAt: 'lastLoginAt',
}; //排序欄位映射
const searchFields = reactive({
  name: '',
  email: '',
  phone: '',
}); //獨立搜尋欄位
const defaultFilters = {
  role: '',
  status: 'all',
  jobType: '',
  hireDateFrom: '',
  hireDateTo: '',
}; //預設篩選條件
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ''); //取得欄位排序顯示
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = '';
    sortDirection.value = 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getAPI();
}; //切換排序
const clearHireDateFilter = async () => {
  filters.hireDateFrom = '';
  filters.hireDateTo = '';
  await handleFiltersChange();
}; //清除入職日期條件

/** 列表資料取得相關 **/
const wrappedUserListGet = (params) => {
  const processedParams = { ...params };
  const searchTerm = searchFields.email.trim() || searchFields.name.trim() || '';
  if (searchTerm) processedParams.search = searchTerm;
  if (params.status && params.status !== 'all') {
    processedParams.isActive = params.status === 'ACTIVE';
  }
  delete processedParams.status;
  if (params.role) {
    processedParams.role = params.role?.name;
  }
  if (searchFields.phone.trim()) {
    processedParams.phone = searchFields.phone.trim();
  }
  if (params.hireDateFrom) {
    processedParams.hireDateFrom = formatDate(params.hireDateFrom);
  }
  if (params.hireDateTo) {
    processedParams.hireDateTo = formatDate(params.hireDateTo);
  }
  if (sortField.value && sortFieldMap[sortField.value]) {
    processedParams.sortField = sortFieldMap[sortField.value];
    processedParams.sortOrder = sortDirection.value;
  }
  return UserListGet(processedParams);
};
const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleFiltersChange,
  clearFilter: clearFilterBase,
  CurrentChange,
  SizeChange,
} = usePaginatedSearchApi(wrappedUserListGet, defaultFilters, {
  responseDataToList,
  pageSizeOptions: [10, 20, 50, 100, 200],
}); //使用分頁搜尋 API composable
const getAPI = async () => {
  await getDefaultAPI();
}; //取得員工列表
const handleFilterChange = handleFiltersChange; //篩選條件變更
const clearFilter = () => {
  searchFields.name = '';
  searchFields.email = '';
  searchFields.phone = '';
  clearFilterBase();
}; //清除搜尋與篩選

/** 新增編輯相關 **/
const dialogMode = ref('create'); //彈窗模式
const editingId = ref(null); //目前編輯的 ID
const dialogVisible = ref(false); //彈窗開關
const isSaving = ref(false); //儲存中
const basicFormRef = ref(null); //表單 ref
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式
const initializeForm = () => ({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  jobType: '',
  idNumber: '',
  birthday: '',
  hireDate: '',
  password: '',
  role: null,
  isActive: true,
  avatar: '',
}); //初始化表單資料
const basicForm = ref(initializeForm()); //表單資料
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Email 格式
const emailValidator = (value, callback) => {
  if (!value || emailPattern.test(value)) {
    callback();
  } else {
    callback(new Error('電子信箱格式不正確'));
  }
}; //Email 驗證器
const passwordValidator = (requirePassword) => (value, callback) => {
  if (!requirePassword && !value) {
    callback();
    return;
  }
  if (!value) {
    callback(new Error('請設定登入密碼'));
    return;
  }
  if (String(value).length < MIN_PASSWORD_LENGTH) {
    callback(new Error(`密碼至少需 ${MIN_PASSWORD_LENGTH} 碼`));
    return;
  }
  callback();
}; //密碼驗證器
const basicFormRules = computed(() => {
  const requirePassword = !isEditing.value;
  const requireIdentity = !isEditing.value;
  return {
    fullName: [{ required: true, message: t('fullNameRequired'), trigger: 'blur' }],
    username: [...(requireIdentity ? [{ required: true, message: t('usernameRequired'), trigger: 'blur' }] : [])],
    email: [...(requireIdentity ? [{ required: true, message: t('emailRequired'), trigger: ['blur', 'change'] }] : []), { validator: emailValidator, trigger: ['blur', 'change'] }],
    role: [{ required: true, message: t('roleRequired'), trigger: 'change' }],
    password: [{ validator: passwordValidator(requirePassword), trigger: 'blur' }],
  };
}); //驗證表單
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
const getDataInfo = (user) => {
  const primaryRole = Array.isArray(user.roles) ? user.roles[0] || null : user.roles || null;
  basicForm.value = {
    ...initializeForm(),
    fullName: user.fullName,
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    jobType: user.jobType || '',
    idNumber: user.idNumber || '',
    birthday: user.birthday ? formatDate(user.birthday, 'YYYY-MM-DD') : '',
    hireDate: user.hireDate ? formatDate(user.hireDate, 'YYYY-MM-DD') : user.createdAt ? formatDate(user.createdAt) : '',
    role: primaryRole || null,
    isActive: user.isActive !== false && user.status !== 'INACTIVE',
    avatar: user.avatar || '',
  };
}; //表單填值
const getData = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await UserGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) getDataInfo(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //取得單筆資料
const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增視窗
const editData = (employee) => {
  if (!employee?.id) return;
  dialogMode.value = 'edit';
  editingId.value = employee.id;
  getDataInfo(employee.raw || employee);
  dialogVisible.value = true;
  getData(employee.id);
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const preparePayload = (isUpdate) => {
  const formState = basicForm.value;
  const resolvedRole = formState.role;
  const payload = {
    ...trimFields(formState, ['fullName', 'phone', 'address', 'jobType', 'idNumber']),
    birthday: formState.birthday,
    hireDate: formState.hireDate,
    roleIds: [resolvedRole.id] || '', //權限ID
    roleNames: [resolvedRole.name] || '', //權限名稱
  };

  if (formState.birthday === '') delete payload.birthday; //生日

  //新增時傳遞信箱跟密碼
  if (!isUpdate) {
    payload.email = formState.email?.trim();
    payload.password = formState.password;
  }

  if (isUpdate) {
    payload.isActive = Boolean(formState.isActive);
    payload.avatar = formState.avatar?.trim() || '';
  }

  return payload;
}; //整理送出資料
const updateAvatar = async (userId, avatarUrl) => {
  if (!avatarUrl || !userId) return;

  try {
    await UserUpdatePatch(userId, { avatar: avatarUrl });
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //更新頭像
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return false;

  const isUpdate = Boolean(editingId.value);
  const payload = preparePayload(isUpdate);
  if (!payload) return;

  try {
    isSaving.value = true;

    if (isCreate.value) {
      const createResponse = await UserCreatePost(payload);
      const createdUser = createResponse?.data?.data ?? createResponse?.data ?? createResponse;
      const createdUserId = createdUser?.id;

      const avatarValue = basicForm.value.avatar?.trim();
      await updateAvatar(createdUserId, avatarValue);
    }
    if (isEdite.value) {
      await UserUpdatePatch(editingId.value, payload);
    }

    await mainStore.SWAL_Success(t('saveSuccess'));
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
    isSaving.value = false;
  }
}; //新增編輯儲存
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖
const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await UserDeleteById(id);
        await mainStore.SWAL_Success(t('deleteSuccess'));
        if (basicDataList.value.length === 1 && pagination.value.page > 1) pagination.value.page -= 1;
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
}; //刪除員工

/** 圖片相關 **/
const imagePickerVisible = ref(false); //圖片選擇器顯示狀態
const photoPreview = ref(false); //照片預覽顯示狀態
const photoSrc = ref(''); //照片來源
const openPhoto = () => {
  photoSrc.value = basicForm.value.avatar;
  photoPreview.value = true;
}; //開啟照片預覽
const visibleChange = (v) => {
  photoPreview.value = v;
}; //照片預覽狀態變更
const openImagePicker = () => {
  imagePickerVisible.value = true;
}; //開啟圖片選擇器
const clearAvatar = () => {
  basicForm.value.avatar = '';
}; //移除照片
const uploadImageViaApi = async (file) => {
  if (!file) return '';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'user-avatar');

  const response = await dataList.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const fileInfo = response?.data?.data?.data ?? response?.data?.data ?? response?.data;
  const fileUrl = fileInfo?.url || fileInfo?.thumbnailUrl;

  if (!fileUrl) throw new Error('未取得圖片網址');
  return fileUrl;
}; //透過 API 上傳圖片

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();

  /** Table高度相關 **/
  await nextTick();
  systemStore.updateTableHeight(430); //修改table高度
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
