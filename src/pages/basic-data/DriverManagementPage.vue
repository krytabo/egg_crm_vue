<!-- src/pages/basic-data/DriverManagementPage.vue 司機管理 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>司機列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ pagination.total }} 筆資料</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button status="danger" plain @click="clearFilter">清除篩選</a-button>
        <!--<a-button type="primary" @click="openCreateDialog">新增司機</a-button>-->
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="employeeId" title="員工編號" :width="140" fixed="left">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">員工編號</span>
              <TinyInput v-model="searchFields.employeeId" placeholder="輸入員工編號" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="font-medium text-gray-900">{{ row.employeeId }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="fullName" title="姓名" min-width="160">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">姓名</span>
              <TinyInput v-model="searchFields.fullName" placeholder="輸入姓名" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="font-medium text-gray-900">{{ row.fullName }}</span>
              <span class="text-xs text-gray-500">{{ row.phone || '—' }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="licenseNumber" title="駕照號碼" :width="160">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">駕照號碼</span>
              <TinyInput v-model="searchFields.licenseNumber" placeholder="輸入駕照號碼" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.licenseNumber || '—' }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="licenseExpiry" title="駕照到期日" :width="160">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span :class="getLicenseExpiryClass(row.licenseExpiry)">{{ formatDate(row.licenseExpiry) }}</span>
              <a-tag v-if="isLicenseExpiringSoon(row.licenseExpiry)" color="orange" size="small">即將到期</a-tag>
              <a-tag v-if="isLicenseExpired(row.licenseExpiry)" color="red" size="small">已過期</a-tag>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="phone" title="聯絡電話" :width="140">
          <template #default="{ row }">{{ row.phone || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="email" title="電子郵件" min-width="200">
          <template #default="{ row }">{{ row.email || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="address" title="地址" min-width="200">
          <template #default="{ row }">{{ row.address || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="hireDate" title="入職日期" :width="140">
          <template #default="{ row }">{{ formatDate(row.hireDate) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" :width="130" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">狀態</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" placeholder="全部" class="h-8 text-xs" @change="handleFiltersChange" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="getStatusColor(row.status)" size="large">{{ getStatusLabel(row.status) }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" title="建立時間" :width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </CustomTinyGridColumn>
        <!--<CustomTinyGridColumn title="操作" :width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
            </div>
          </template>
        </CustomTinyGridColumn>-->
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

  <a-modal v-model:visible="dialogVisible" :title="isEdite ? '編輯司機' : '新增司機'" :top="30" draggable :maskClosable="false" :closable="false" width="700px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width layout="vertical">
        <div class="mb-3 text-sm font-semibold text-gray-700">基本資料</div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem label="員工編號" field="employeeId">
            <CustomField v-model="basicForm.employeeId" type="input" placeholder="輸入員工編號" allowClear />
          </AFormItem>
          <AFormItem label="姓名" field="fullName">
            <CustomField v-model="basicForm.fullName" type="input" placeholder="輸入姓名" allowClear :disabled="isEdite" />
          </AFormItem>
        </div>

        <div class="mb-3 text-sm font-semibold text-gray-700">駕照與任職資訊</div>
        <div class="grid gap-4 md:grid-cols-3">
          <AFormItem label="駕照號碼" field="licenseNumber">
            <CustomField v-model="basicForm.licenseNumber" type="input" placeholder="輸入駕照號碼" allowClear />
          </AFormItem>
          <AFormItem label="駕照到期日" field="licenseExpiry">
            <CustomField v-model="basicForm.licenseExpiry" type="date-picker" placeholder="選擇駕照到期日" />
          </AFormItem>
          <AFormItem label="入職日期" field="hireDate">
            <CustomField v-model="basicForm.hireDate" type="date-picker" placeholder="選擇入職日期" :disabled="isEdite" />
          </AFormItem>
        </div>

        <div class="mb-3 text-sm font-semibold text-gray-700">聯絡資訊</div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem label="電話">
            <CustomField v-model="basicForm.phone" type="input" placeholder="輸入電話" allowClear :disabled="isEdite" />
          </AFormItem>
          <AFormItem label="電子郵件">
            <CustomField v-model="basicForm.email" type="email" placeholder="輸入電子郵件" allowClear :disabled="isEdite" />
          </AFormItem>
        </div>
        <AFormItem label="地址">
          <CustomField v-model="basicForm.address" type="input" placeholder="輸入地址" allowClear :disabled="isEdite" />
        </AFormItem>

        <AFormItem label="備註">
          <CustomField v-model="basicForm.notes" type="textarea" :rows="3" placeholder="輸入備註" allowClear />
        </AFormItem>

        <AFormItem label="狀態">
          <CustomField v-model="basicForm.status" type="select" :options="statusSelectOptions" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">取消</a-button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? '儲存中...' : '儲存' }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { DriverListGet, DriverCreatePost, DriverUpdatePatch, DriverDeleteById, DriverGetById } from '@/assets/API/Drivers';
import { TinyInput, TinySelect } from '@opentiny/vue';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import CustomField from '@/components/Form/CustomField.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useSystemStore } from '@/stores/system';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { debounce } from 'lodash';

const mainStore = useMainStore();
const systemStore = useSystemStore();
const timezoneStore = useTimezoneStore();
const { containerRef } = useContentWidth();

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create');
const isEdite = computed(() => dialogMode.value === 'edit');

/** 狀態相關 **/
const STATUS_MAP = {
  AVAILABLE: { label: '可用', color: 'green' },
  ASSIGNED: { label: '已指派', color: 'blue' },
  ON_TRIP: { label: '配送中', color: 'orange' },
  OFF_DUTY: { label: '休假', color: 'gray' },
  INACTIVE: { label: '停用', color: 'red' },
};
const getStatusLabel = (status) => STATUS_MAP[status]?.label || status;
const getStatusColor = (status) => STATUS_MAP[status]?.color || 'gray';
const statusFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '可用', value: 'AVAILABLE' },
  { label: '已指派', value: 'ASSIGNED' },
  { label: '配送中', value: 'ON_TRIP' },
  { label: '休假', value: 'OFF_DUTY' },
  { label: '停用', value: 'INACTIVE' },
];
const statusSelectOptions = [
  { label: '可用', value: 'AVAILABLE' },
  { label: '已指派', value: 'ASSIGNED' },
  { label: '配送中', value: 'ON_TRIP' },
  { label: '休假', value: 'OFF_DUTY' },
  { label: '停用', value: 'INACTIVE' },
];

/** 駕照到期相關 **/
const isLicenseExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};
const isLicenseExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  return expiry >= today && expiry <= thirtyDaysLater;
};
const getLicenseExpiryClass = (dateStr) => {
  if (isLicenseExpired(dateStr)) return 'text-red-600 font-semibold';
  if (isLicenseExpiringSoon(dateStr)) return 'text-orange-600 font-semibold';
  return '';
};

/** 共用工具 **/
const formatDate = (value) => {
  if (!value) return '—';
  return timezoneStore.formatDate(value, 'YYYY-MM-DD');
};

/** 篩選與查詢相關 **/
const searchFields = reactive({
  employeeId: '',
  fullName: '',
  licenseNumber: '',
});

/** 列表資料取得相關 **/
const wrappedDriverListGet = (params) => {
  const processedParams = { ...params };
  if (searchFields.employeeId) processedParams.employeeId = searchFields.employeeId;
  if (searchFields.fullName) processedParams.search = searchFields.fullName;
  if (searchFields.licenseNumber) processedParams.licenseNumber = searchFields.licenseNumber;
  return DriverListGet(processedParams);
};
const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleGlobalSearch,
  handleFiltersChange,
  clearFilter: _clearFilter,
  CurrentChange,
  SizeChange,
} = usePaginatedSearchApi(wrappedDriverListGet, { status: 'all' });

const getAPI = () => getDefaultAPI();
const clearFilter = () => {
  searchFields.employeeId = '';
  searchFields.fullName = '';
  searchFields.licenseNumber = '';
  _clearFilter();
};

/** 新增編輯相關 **/
const dialogVisible = ref(false);
const dialogMode = ref('create');
const editingId = ref(null);
const basicFormRef = ref(null);
const isSaving = ref(false);

const initializeForm = () => ({
  employeeId: '',
  fullName: '',
  licenseNumber: '',
  licenseExpiry: '',
  hireDate: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  status: 'AVAILABLE',
});
const basicForm = ref(initializeForm());
const basicFormRules = {
  employeeId: [{ required: true, message: '請輸入員工編號' }],
  fullName: [{ required: true, message: '請輸入姓' }],
  licenseNumber: [{ required: true, message: '請輸入駕照號碼' }],
  licenseExpiry: [{ required: true, message: '請選擇駕照到期日' }],
  hireDate: [{ required: true, message: '請選擇入職日期' }],
};

const resetFormState = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
};

const fillFormFromRecord = (driver) => {
  basicForm.value.employeeId = driver.employeeId || '';
  basicForm.value.fullName = driver.fullName || '';
  basicForm.value.licenseNumber = driver.licenseNumber || '';
  basicForm.value.licenseExpiry = formatDate(driver.licenseExpiry) || '';
  basicForm.value.hireDate = formatDate(driver.hireDate) || '';
  basicForm.value.phone = driver.phone || '';
  basicForm.value.email = driver.email || '';
  basicForm.value.address = driver.address || '';
  basicForm.value.notes = driver.notes || '';
  basicForm.value.status = driver.status || 'AVAILABLE';
};

const getData = async (id) => {
  mainStore.setLoading(true);
  try {
    const response = await DriverGetById(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    fillFormFromRecord(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
};

const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetFormState();
  dialogVisible.value = true;
};

const editData = (row) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  fillFormFromRecord(row);
  dialogVisible.value = true;
  getData(row.id);
};

const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
};

/** 準備 payload - 根據 API 規格區分新增和編輯 **/
const prepareCreatePayload = () => ({
  employeeId: basicForm.value.employeeId,
  fullName: basicForm.value.fullName,
  licenseNumber: basicForm.value.licenseNumber,
  licenseExpiry: basicForm.value.licenseExpiry,
  hireDate: basicForm.value.hireDate,
  phone: basicForm.value.phone || undefined,
  email: basicForm.value.email || undefined,
  address: basicForm.value.address ? { fullAddress: basicForm.value.address } : undefined,
  notes: basicForm.value.notes || undefined,
  status: basicForm.value.status,
});

const prepareUpdatePayload = () => ({
  employeeId: basicForm.value.employeeId,
  licenseNumber: basicForm.value.licenseNumber,
  licenseExpiry: basicForm.value.licenseExpiry,
  notes: basicForm.value.notes || undefined,
  status: basicForm.value.status,
});

const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return;

  isSaving.value = true;
  try {
    if (isCreate.value) {
      const payload = prepareCreatePayload();
      await DriverCreatePost(payload);
    }
    if (isEdite.value) {
      const payload = prepareUpdatePayload();
      await DriverUpdatePatch(editingId.value, payload);
    }
    await mainStore.SWAL_Success('儲存成功');
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSaving.value = false;
  }
};
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });

const deleteData = async (id) => {
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await DriverDeleteById(id);
        await mainStore.SWAL_Success('刪除成功');
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
};

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(320);
});
</script>
