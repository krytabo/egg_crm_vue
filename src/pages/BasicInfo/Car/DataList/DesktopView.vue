<!-- src/pages/BasicInfo/Car/DataList/DesktopView.vue 車輛管理（桌面版） -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>{{ t('vehicleList', '車輛列表') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }, `共 ${pagination.total} 筆`) }}</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button status="danger" plain @click="clearFilter">{{ t('clearAllSearch', '清除全部搜尋') }}</a-button>
        <a-button v-if="permissionStore.hasPermission('VEHICLE', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addVehicle', '新增車輛') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         篩選區塊         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="2">
      <CustomFormItem :label="t('keyword', '關鍵字')">
        <TinyInput v-model="filters.search" :placeholder="t('searchVehiclePlaceholder', '搜尋車牌、品牌、型號')" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
      </CustomFormItem>
      <CustomFormItem :label="t('status', '狀態')">
        <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
      </CustomFormItem>
    </CustomForm>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
      <CustomTinyGridColumn field="licensePlate" :title="t('licensePlate', '車牌號碼')" min-width="120" fixed="left" />
      <CustomTinyGridColumn field="makeModel" :title="t('makeModel', '品牌/型號')" min-width="220">
        <template #default="{ row }">
          {{ row.brand }} - {{ row.model }} <span v-if="row.year">({{ row.year }})</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="fuelType" :title="t('fuelType', '燃料類型')" width="100">
        <template #default="{ row }">
          {{ fuelTypeMap[row.fuelType] || row.fuelType || '-' }}
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="capacity" :title="t('capacity', '載重量')" width="100" align="right">
        <template #default="{ row }">
          {{ row.capacity ? `${row.capacity} kg` : '-' }}
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="assignedDriver" :title="t('assignedDriver', '指派司機')" min-width="120">
        <template #default="{ row }">
          {{ row.assignedDriver?.user?.fullName || '-' }}
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="100" align="center">
        <template #default="{ row }">
          <a-tag :color="getStatusColor(row.status)" size="large">{{ statusMap[row.status] || row.status }}</a-tag>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions', '操作')" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button v-if="permissionStore.hasPermission('VEHICLE', 'READ')" class="table-button" :title="t('viewDetail', '詳細資料')" @click="openDetailDrawer(row)">
              <FileText class="size-4 text-gray-500" />
            </button>
            <button v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" class="table-button" :title="t('assignDriver', '指派司機')" @click="openDriverDialog(row)">
              <UserCheck class="size-4 text-blue-500" />
            </button>
            <button v-if="permissionStore.hasPermission('VEHICLE', 'DELETE')" class="table-button" :title="t('disable', '停用')" @click="deleteData(row.id)">
              <PowerOff class="size-4 text-orange-500" />
            </button>
            <button v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" class="table-button" :title="t('edit', '編輯')" @click="editData(row)"><SquarePen class="size-4" /></button>
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
  <!--      新增/編輯彈窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="dialogVisible" :top="30" draggable :mask-closable="false" :closable="false" width="700px" :fullscreen="fullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ isCreate ? t('addVehicle', '新增車輛') : t('editVehicle', '編輯車輛') }}</div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>
    <perfect-scrollbar :class="['pr-4', fullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[calc(100vh-300px)]']">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <!-- 基本資訊 -->
        <div class="mb-4 text-sm font-medium text-gray-700">{{ t('basicInfo', '基本資訊') }}</div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AFormItem :label="t('licensePlate', '車牌號碼')" field="licensePlate">
            <CustomField v-model="basicForm.licensePlate" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('make', '品牌')" field="make">
            <CustomField v-model="basicForm.make" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('model', '型號')" field="model">
            <CustomField v-model="basicForm.model" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('year', '出廠年份')" field="year">
            <CustomField v-model="basicForm.year" type="number" :min="1900" :max="2100" />
          </AFormItem>
          <AFormItem v-if="isEdite" :label="t('status', '狀態')" field="status">
            <CustomField v-model="basicForm.status" type="select" :options="statusOptions" />
          </AFormItem>
        </div>

        <!-- 車輛規格 -->
        <div class="mb-4 mt-6 text-sm font-medium text-gray-700">{{ t('vehicleSpecs', '車輛規格') }}</div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AFormItem :label="t('vin', '車身號碼')">
            <CustomField v-model="basicForm.vin" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('engineNumber', '引擎號碼')">
            <CustomField v-model="basicForm.engineNumber" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('fuelType', '燃料類型')">
            <CustomField v-model="basicForm.fuelType" type="select" :options="fuelTypeOptions" :placeholder="t('pleaseSelect', '請選擇')" allow-clear />
          </AFormItem>
          <AFormItem :label="t('capacity', '載重量 (kg)')">
            <CustomField v-model="basicForm.capacity" type="number" :min="0" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
        </div>

        <!-- 證照日期 -->
        <div class="mb-4 mt-6 text-sm font-medium text-gray-700">{{ t('licenseDates', '證照日期') }}</div>
        <div class="grid gap-4 grid-cols-3">
          <AFormItem :label="t('insuranceExpiry', '保險到期日')">
            <CustomField v-model="basicForm.insuranceExpiry" type="date-picker" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
          <AFormItem :label="t('registrationExpiry', '行照到期日')">
            <CustomField v-model="basicForm.registrationExpiry" type="date-picker" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
          <AFormItem :label="t('inspectionExpiry', '驗車到期日')">
            <CustomField v-model="basicForm.inspectionExpiry" type="date-picker" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
        </div>

        <!-- 備註 -->
        <AFormItem :label="t('notes', '備註')" class="mt-4">
          <CustomField v-model="basicForm.notes" type="textarea" :rows="3" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel', '取消') }}</a-button>
        <Button :disabled="isSaving" :loading="isSaving" @click="saveData">
          {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
        </Button>
      </div>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       指派司機彈窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="driverDialogVisible" :title="t('assignDriver', '指派司機')" :top="100" draggable :mask-closable="false" :closable="false" width="450px">
    <div class="py-2">
      <p class="mb-4 text-gray-600">
        {{ t('assignDriverFor', '為車輛 {plate} 指派司機', { plate: selectedVehicle?.licensePlate }) }}
      </p>
      <AForm layout="vertical">
        <AFormItem :label="t('selectDriver', '選擇司機')">
          <InfiniteSelect v-model="selectedDriverId" dataSource="drivers" :placeholder="t('pleaseSelect', '請選擇')" />
        </AFormItem>
      </AForm>
      <div v-if="selectedVehicle?.assignedDriver" class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
        <p>
          {{ t('currentDriver', '目前指派司機') }}: <strong>{{ selectedVehicle.assignedDriver.name }}</strong>
        </p>
        <a-button class="mt-2" size="small" status="warning" @click="handleUnassignDriver">
          {{ t('unassignDriver', '解除指派') }}
        </a-button>
      </div>
    </div>
    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDriverDialog">{{ t('cancel', '取消') }}</a-button>
        <Button :disabled="isAssigning || !selectedDriverId" :loading="isAssigning" @click="assignDriver">
          {{ isAssigning ? t('assigning', '指派中') : t('confirmAssign', '確認指派') }}
        </Button>
      </div>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--      車輛詳細資料抽屜       -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <VehicleDetailDrawer v-model="detailDrawerVisible" :vehicle="detailVehicle" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { TinyInput, TinySelect, TinyForm, TinyFormItem, TinyDatePicker } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SquarePen, UserCheck, FileText, Expand, Shrink, PowerOff } from 'lucide-vue-next';
import VehicleDetailDrawer from './VehicleDetailDrawer.vue';
import CustomField from '@/components/Form/CustomField.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useDataList } from './useDataList';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const permissionStore = usePermissionStore();

/** Table高度 **/
import { useWindowSize } from '@vueuse/core';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 340, 100));

const {
  //選項
  statusOptions,
  statusMap,
  fuelTypeOptions,
  fuelTypeMap,
  getStatusColor,

  //列表資料
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getAPI,
  handleGlobalSearch,
  handleFiltersChange,
  clearFilter,
  CurrentChange,
  SizeChange,

  //新增編輯
  dialogVisible,
  basicFormRef,
  isSaving,
  isCreate,
  isEdite,
  basicForm,
  basicFormRules,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,

  //指派司機
  driverDialogVisible,
  selectedVehicle,
  selectedDriverId,
  isAssigning,
  openDriverDialog,
  closeDriverDialog,
  assignDriver,
  unassignDriver,
} = useDataList(t);

const handleUnassignDriver = () => {
  if (selectedVehicle.value?.id) {
    closeDriverDialog();
    unassignDriver(selectedVehicle.value.id);
  }
};

/** 詳細資料抽屜 **/
const fullscreen = ref(false);
const detailDrawerVisible = ref(false);
const detailVehicle = ref(null);
const openDetailDrawer = (vehicle) => {
  detailVehicle.value = vehicle;
  detailDrawerVisible.value = true;
};

onMounted(() => {
  getAPI();
});
</script>
