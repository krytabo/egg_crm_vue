<!-- src/pages/parameter-settings/PermissionSettingsPage.vue 權限設定 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('permissionSettingsTitle') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">{{ t('clearAllSearch') }}</Button>
        <Button v-if="permissionStore.hasPermission('ROLE', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addPermission') }}</Button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--         其他搜尋         -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <div class="mb-4 flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm layout="vertical">
          <div class="grid gap-3 md:grid-cols-3">
            <AFormItem :label="t('keyword')">
              <TinyInput v-model="filters.keyword" :placeholder="t('pleaseEnterResourceOrAction')" clearable class="h-9 text-sm" @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </AFormItem>
            <AFormItem :label="t('resource')">
              <TinySelect v-model="filters.resource" :options="resourceFilterOptions" :placeholder="t('all')" clearable class="h-9 text-sm" @update:model-value="handleFiltersChange" />
            </AFormItem>
            <AFormItem :label="t('action')">
              <TinySelect v-model="filters.action" :options="actionFilterOptions" :placeholder="t('all')" clearable class="h-9 text-sm" @update:model-value="handleFiltersChange" />
            </AFormItem>
          </div>
        </AForm>
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--          列表            -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="resource" :title="t('resource')" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-base font-semibold text-gray-900">{{ row.resourceLabel }}</span>
              <TinyTag type="primary" size="mini">{{ row.actionLabel }}</TinyTag>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="conditions" :title="t('conditions')" min-width="260">
          <template #default="{ row }">
            <span class="text-gray-700">{{ row.ownOnlyLabel }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" :title="t('createdAt')" :width="160">
          <template #default="{ row }">{{ row.createdAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="updatedAt" :title="t('updatedAt')" :width="160">
          <template #default="{ row }">{{ row.updatedAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn :title="t('actions')" :width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button v-if="permissionStore.hasPermission('ROLE', 'DELETE')" class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button v-if="permissionStore.hasPermission('ROLE', 'UPDATE')" class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
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
  <a-modal v-model:visible="dialogVisible" :title="dialogTitle" :top="30" draggable :maskClosable="false" :closable="false" width="560px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('resourceWithHint')" field="resource">
            <CustomField v-model="basicForm.resource" type="select" :options="RESOURCE_LABELS" :placeholder="t('pleaseSelectResource')" allowClear />
          </AFormItem>
          <AFormItem :label="t('actionWithHint')" field="action">
            <CustomField v-model="basicForm.action" type="select" :options="actionOptions" :placeholder="t('pleaseSelectAction')" allowClear />
          </AFormItem>
        </div>
        <AFormItem :label="t('conditionsLimit')">
          <CustomField v-model="basicForm.ownOnlyMode" type="select" :options="ownOnlyOptions" :placeholder="t('pleaseSelectLimit')" />
          <template #extra>
            <p class="text-xs text-gray-500">{{ t('ownOnlyHint') }}</p>
          </template>
        </AFormItem>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel') }}</a-button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? t('saving') : t('save') }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { PermissionListGet, PermissionCreatePost, PermissionUpdatePatch, PermissionDeleteById, PermissionGetByID } from '@/assets/API/Permission';
import AppPagination from '@/components/ui/AppPagination.vue';
import { TinyForm, TinyFormItem, TinyInput, TinyTag, TinySelect } from '@opentiny/vue';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Button } from '@/components/ui/button';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { SquarePen, Trash2 } from 'lucide-vue-next';
import { useSelectOptions } from '@/composables/useSelectOptions';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const permissionStore = usePermissionStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

// 使用共用選項
const {
  permissionResourceOptions,
  permissionResourceLabelMap,
  permissionActionOptions,
  permissionActionLabelMap,
  permissionOwnOnlyOptions,
  buildSelectOptionsWithAll,
} = useSelectOptions();

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式

/** 選項相關 **/
const RESOURCE_LABELS = permissionResourceOptions; // 資源選項
const actionOptions = permissionActionOptions; // 操作選項
const resourceFilterOptions = computed(() => [{ label: t('all'), value: '' }, ...permissionResourceOptions.value]);
const actionFilterOptions = computed(() => [{ label: t('all'), value: '' }, ...permissionActionOptions.value]);
const resourceLabelMap = permissionResourceLabelMap; // 資源標籤映射
const actionLabelMap = permissionActionLabelMap; // 操作標籤映射
const ownOnlyOptions = permissionOwnOnlyOptions; // 條件限制選項

/** 共用工具 **/
const formatDate = (value, format = 'YYYY-MM-DD HH:mm') => {
  if (!value) return t('unset');
  return timezoneStore.formatDate(value, format) || t('unset');
}; //日期格式化
const responseDataToList = (item = {}) => {
  const ownOnly = item.conditions?.ownOnly === true;
  return {
    id: item.id,
    resource: item.resource || t('unset'),
    action: item.action || t('unset'),
    resourceLabel: resourceLabelMap.value[item.resource] || item.resource || t('unset'),
    actionLabel: actionLabelMap.value[item.action] || item.action || t('unset'),
    ownOnlyLabel: ownOnly ? t('ownOnlyLabelTrue') : t('ownOnlyLabelNoLimit'),
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    raw: item,
  };
}; //轉換列表列資料

/** 篩選與查詢相關 **/
const defaultFilters = {
  keyword: '',
  resource: '',
  action: '',
}; //預設篩選條件

// 包裝 API 函數以處理特殊參數轉換
const wrappedPermissionListGet = (params) => {
  const processedParams = { ...params };

  // 將 keyword 轉換為 search
  if (params.keyword) {
    processedParams.search = params.keyword.trim();
    delete processedParams.keyword;
  }

  return PermissionListGet(processedParams);
}; //包裝 API 函數

/** 列表資料取得相關 **/
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedPermissionListGet,
  defaultFilters,
  {
    responseDataToList,
  },
); //使用分頁搜尋 API composable
const getAPI = () => getDefaultAPI();

/** 新增編輯相關 **/
const dialogMode = ref('create'); //彈窗模式
const initializeForm = () => ({
  resource: '',
  action: '',
  ownOnlyMode: 'ANY',
}); //初始化表單資料
const dialogVisible = ref(false); //彈窗開關
const dialogTitle = computed(() => (isCreate.value ? t('addPermission') : t('editPermission'))); //彈窗標題
const editingId = ref(null); //目前編輯的 ID
const basicFormRef = ref(null); //表單 ref
const basicForm = ref(initializeForm()); //表單資料
const isSaving = ref(false); //儲存中
const basicFormRules = {
  resource: [{ required: true, message: t('resourceRequired'), trigger: 'change' }],
  action: [{ required: true, message: t('actionRequired'), trigger: 'change' }],
}; //驗證表單
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
watch(dialogVisible, (visible) => {
  if (!visible) {
    resetForm();
    editingId.value = null;
    dialogMode.value = 'create';
  }
}); //彈窗關閉時重置驗證
const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增視窗
const fillFormFromRecord = (record = {}) => {
  basicForm.value = {
    resource: record.resource || '',
    action: record.action || '',
    ownOnlyMode: record.conditions?.ownOnly === true ? 'OWN' : 'ANY',
  };
}; //表單填值
const loadPermissionDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await PermissionGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入權限詳細資料
const editData = (row) => {
  if (!row?.id) return;
  dialogMode.value = 'edit';
  editingId.value = row.id;
  fillFormFromRecord(row.raw || row);
  dialogVisible.value = true;
  loadPermissionDetail(row.id);
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const buildPayload = () => {
  const formValue = basicForm.value;
  const payload = {
    resource: formValue.resource || '',
    action: formValue.action || '',
  };
  if (!payload.resource || !payload.action) return null;
  payload.conditions = { ownOnly: formValue.ownOnlyMode === 'OWN' ? true : null };
  return payload;
}; //整理送出資料
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return;
  const payload = buildPayload();
  if (!payload) return;
  try {
    isSaving.value = true;
    if (isCreate.value) await PermissionCreatePost(payload); //新增儲存
    if (isEdite.value) await PermissionUpdatePatch(editingId.value, payload); //編輯儲存

    await mainStore.SWAL_Success(t('saveSuccess'));
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //新增編輯儲存
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖
const deleteData = async (row) => {
  if (!row?.id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await PermissionDeleteById(row.id);
        await mainStore.SWAL_Success(t('deleteSuccess'));
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
}; //刪除權限

onMounted(getAPI);
</script>
