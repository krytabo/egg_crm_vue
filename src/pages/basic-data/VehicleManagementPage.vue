<template>
  <Card ref="containerRef">
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t("vehicleList", "車輛列表") }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t("totalCount", { total: pagination.total }, `共 ${pagination.total} 筆`) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">{{ t("clearAllSearch", "清除全部搜尋") }}</Button>
        <Button type="primary" @click="openCreateDialog">{{ t("addVehicle", "新增車輛") }}</Button>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <!-- 篩選區塊 -->
      <TinyForm label-width="100px" label-position="left" class="grid gap-3 rounded-[10px] bg-[#f5f7fb] px-5 py-4 md:grid-cols-3">
        <TinyFormItem :label="t('keyword', '關鍵字')">
          <TinyInput
            v-model="filters.search"
            :placeholder="t('searchVehiclePlaceholder', '搜尋車牌、品牌、型號')"
            clearable
            @keyup.enter="handleGlobalSearch"
            @clear="handleGlobalSearch"
          />
        </TinyFormItem>
        <TinyFormItem :label="t('vehicleType', '車輛類型')">
          <TinySelect
            v-model="filters.type"
            :options="vehicleTypeOptions"
            :placeholder="t('all', '全部')"
            clearable
            @change="handleFiltersChange"
          />
        </TinyFormItem>
        <TinyFormItem :label="t('status', '狀態')">
          <TinySelect
            v-model="filters.status"
            :options="statusOptions"
            :placeholder="t('all', '全部')"
            clearable
            @change="handleFiltersChange"
          />
        </TinyFormItem>
      </TinyForm>

      <!-- 表格 -->
      <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id">
        <CustomTinyGridColumn field="plateNumber" :title="t('plateNumber', '車牌號碼')" width="150" sortable />
        <CustomTinyGridColumn field="type" :title="t('vehicleType', '車輛類型')" width="120">
          <template #default="{ row }">
            <TinyBadge type="info">{{ vehicleTypeMap[row.type] || row.type }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="brandModel" :title="t('vehicleModel', '品牌/型號')" width="200">
          <template #default="{ row }">
            {{ row.brand }} {{ row.model }} <span v-if="row.year">({{ row.year }})</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="assignedDriver" :title="t('assignedDriver', '指派司機')" width="150">
          <template #default="{ row }">
            {{ row.assignedDriver?.name || t("unassigned", "未指派") }}
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="100" align="center">
          <template #default="{ row }">
            <TinyTag :type="getStatusType(row.status)">{{ statusMap[row.status] || row.status }}</TinyTag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn :title="t('actions', '操作')" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <!-- 分頁 -->
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

  <!-- 新增/編輯彈窗 -->
  <a-modal v-model:visible="dialogVisible" :title="isCreate ? t('addVehicle', '新增車輛') : t('editVehicle', '編輯車輛')" :top="30" draggable :mask-closable="false" :closable="false" width="600px">
    <perfect-scrollbar class="h-[calc(100vh-300px)] pr-4">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AFormItem :label="t('plateNumber', '車牌號碼')" field="plateNumber">
            <CustomField v-model="basicForm.plateNumber" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('vehicleType', '車輛類型')" field="type">
            <CustomField v-model="basicForm.type" type="select" :options="vehicleTypeOptions" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
          <AFormItem :label="t('brand', '品牌')">
            <CustomField v-model="basicForm.brand" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('model', '型號')">
            <CustomField v-model="basicForm.model" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem :label="t('year', '出廠年份')">
            <CustomField v-model="basicForm.year" type="number" :min="1900" :max="2100" />
          </AFormItem>
          <AFormItem :label="t('capacity', '載重量')">
            <CustomField v-model="basicForm.capacity" type="number" :min="0" />
          </AFormItem>
          <AFormItem :label="t('fuelType', '燃料類型')">
            <CustomField v-model="basicForm.fuelType" type="input" :placeholder="t('pleaseEnter', '請輸入')" />
          </AFormItem>
          <AFormItem v-if="isEdite" :label="t('status', '狀態')" field="status">
            <CustomField v-model="basicForm.status" type="select" :options="statusOptions" />
          </AFormItem>
        </div>
        <AFormItem :label="t('notes', '備註')">
          <CustomField v-model="basicForm.notes" type="textarea" :rows="3" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t("cancel", "取消") }}</a-button>
        <Button :disabled="isSaving" :loading="isSaving" @click="saveData">
          {{ isSaving ? t("saving", "儲存中") : t("save", "儲存") }}
        </Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { VehicleListGet, VehicleCreatePost, VehicleUpdatePatch, VehicleDeleteById, VehicleGetByID } from "@/assets/API/Vehicle";
import { TinyInput, TinySelect, TinyBadge, TinyTag, TinyForm, TinyFormItem, TinyButton } from "@opentiny/vue";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppPagination from "@/components/ui/AppPagination.vue";
import CustomField from "@/components/Form/CustomField.vue";
import { usePaginatedSearchApi } from "@/composables/usePaginatedSearchApi";
import { Trash2, SquarePen } from "lucide-vue-next";
import { debounce } from "lodash";
import { useMainStore } from "@/stores/LoadingStore";
import { useI18n } from "vue-i18n";
import { Form as AForm, FormItem as AFormItem } from "@arco-design/web-vue";

const mainStore = useMainStore();
const { t } = useI18n();

/** 常數與選項 **/
const vehicleTypeOptions = [
  { label: t("vehicleTypeTruck", "貨車"), value: "TRUCK" },
  { label: t("vehicleTypeVan", "廂型車"), value: "VAN" },
  { label: t("vehicleTypeMotorcycle", "機車"), value: "MOTORCYCLE" },
  { label: t("vehicleTypeCar", "轎車"), value: "CAR" },
  { label: t("vehicleTypeOther", "其他"), value: "OTHER" }
];
const vehicleTypeMap = Object.fromEntries(vehicleTypeOptions.map(opt => [opt.value, opt.label]));

const statusOptions = [
  { label: t("statusActive", "可用"), value: "ACTIVE" },
  { label: t("statusInactive", "停用"), value: "INACTIVE" },
  { label: t("statusMaintenance", "維修中"), value: "MAINTENANCE" },
  { label: t("statusRetired", "已報廢"), value: "RETIRED" }
];
const statusMap = Object.fromEntries(statusOptions.map(opt => [opt.value, opt.label]));

const getStatusType = (status) => {
  switch (status) {
    case "ACTIVE": return "success";
    case "INACTIVE": return "info";
    case "MAINTENANCE": return "warning";
    case "RETIRED": return "danger";
    default: return "info";
  }
};

/** 列表資料取得相關 **/
const responseDataToList = (item = {}) => ({
  id: item.id,
  plateNumber: item.plateNumber,
  type: item.type,
  brand: item.brand,
  model: item.model,
  year: item.year,
  capacity: item.capacity,
  fuelType: item.fuelType,
  status: item.status,
  assignedDriver: item.assignedDriver ? {
    id: item.assignedDriver.id,
    name: `${item.assignedDriver.firstName} ${item.assignedDriver.lastName}`.trim()
  } : null,
  raw: item
});

const defaultFilters = {
  search: "",
  type: "",
  status: ""
};

const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleGlobalSearch,
  handleFiltersChange,
  clearFilter,
  CurrentChange,
  SizeChange
} = usePaginatedSearchApi(VehicleListGet, defaultFilters, {
  responseDataToList
});

const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    await getDefaultAPI();
  } finally {
    mainStore.setLoading(false);
  }
};

/** 新增編輯相關 **/
const dialogMode = ref("create");
const dialogVisible = ref(false);
const editingId = ref(null);
const basicFormRef = ref(null);
const isSaving = ref(false);

const isCreate = computed(() => dialogMode.value === "create");
const isEdite = computed(() => dialogMode.value === "edit");

const initializeForm = () => ({
  plateNumber: "",
  type: "TRUCK",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  capacity: 0,
  fuelType: "",
  status: "ACTIVE",
  notes: ""
});

const basicForm = ref(initializeForm());

const basicFormRules = {
  plateNumber: [{ required: true, message: t("required", "此欄位必填") }],
  type: [{ required: true, message: t("required", "此欄位必填") }]
};

const openCreateDialog = () => {
  dialogMode.value = "create";
  editingId.value = null;
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate();
  dialogVisible.value = true;
};

const editData = async (row) => {
  dialogMode.value = "edit";
  editingId.value = row.id;
  mainStore.setLoading(true);
  try {
    const response = await VehicleGetByID(row.id);
    const data = response.data; // 根據實際 API 回傳結構調整，通常是 response.data 或 response.data.data
    basicForm.value = {
      plateNumber: data.plateNumber,
      type: data.type,
      brand: data.brand,
      model: data.model,
      year: data.year,
      capacity: data.capacity,
      fuelType: data.fuelType,
      status: data.status,
      notes: data.notes
    };
    dialogVisible.value = true;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
};

const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate();
};

const _submitForm = async () => {
  const validateResult = await basicFormRef.value?.validate();
  if (validateResult) return;

  try {
    isSaving.value = true;
    if (isCreate.value) {
      await VehicleCreatePost(basicForm.value);
    } else {
      await VehicleUpdatePatch(editingId.value, basicForm.value);
    }
    await mainStore.SWAL_Success(t("saveSuccess", "儲存成功"));
    closeDialog();
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSaving.value = false;
  }
};

const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });

const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await VehicleDeleteById(id);
        await mainStore.SWAL_Success(t("deleteSuccess", "刪除成功"));
        if (basicDataList.value.length === 1 && pagination.page > 1) {
          pagination.page -= 1;
        }
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    }
  });
};

onMounted(() => {
  getAPI();
});
</script>