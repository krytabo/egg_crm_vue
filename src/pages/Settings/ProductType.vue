<!-- src/pages/parameter-settings/ProductTypeSettingsPage.vue 產品類型設定 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('productTypeSettingsTitle') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <a-button type="danger" plain @click="clearFilter">{{ t('clearAllSearch') }}</a-button>
        <a-button v-if="permissionStore.hasPermission('ROLE', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addProductType') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         篩選區塊         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="2" class="mb-4">
      <CustomFormItem :label="t('nameCode')">
        <TinyInput v-model="filters.keyword" :placeholder="t('pleaseEnterNameOrCode')" clearable class="h-9 text-sm" @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
      </CustomFormItem>
      <CustomFormItem :label="t('isDeletable')">
        <TinySelect v-model="filters.deletable" :options="deletableFilterOptions" :placeholder="t('all')" class="h-9 text-sm" @update:model-value="handleFiltersChange" />
      </CustomFormItem>
    </CustomForm>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id" :row-id="'id'">
      <CustomTinyGridColumn field="name" :title="t('name')" min-width="220">
        <template #default="{ row }">
          <div class="flex flex-col">
            <span class="text-base font-medium text-gray-900">{{ row.name }}</span>
            <span class="text-xs text-gray-500">{{ t('codeColon') }}{{ row.code }}</span>
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="description" :title="t('description')" min-width="260">
        <template #default="{ row }">{{ row.description || t('unset') }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="isDeletable" :title="t('isDeletable')" :width="140" align="center">
        <template #default="{ row }">
          <TinyBadge :type="row.isDeletable ? 'success' : 'info'">{{ row.isDeletable ? t('canBeDeleted') : t('systemDefault') }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="createdAt" :title="t('createdAt')" :width="160">
        <template #default="{ row }">{{ row.createdAt }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="updatedAt" :title="t('updatedAt')" :width="160">
        <template #default="{ row }">{{ row.updatedAt }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions')" :width="200" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button v-if="permissionStore.hasPermission('ROLE', 'DELETE')" class="table-button" @click="deleteData(row.id)">
              <Trash2 class="size-4 text-rose-500" />
            </button>
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
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       新增編輯視窗        -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="dialogVisible" :title="isCreate ? t('addProductType') : t('editProductType')" :top="30" draggable :maskClosable="false" :closable="false" width="520px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('code')" field="code">
            <CustomField v-model="basicForm.code" type="input" :placeholder="t('finishedGoodExample')" :disabled="dialogMode === 'edit'" allowClear />
          </AFormItem>
          <AFormItem :label="t('name')" field="name">
            <CustomField v-model="basicForm.name" type="input" :placeholder="t('pleaseEnterName')" allowClear />
          </AFormItem>
        </div>
        <AFormItem :label="t('description')">
          <CustomField v-model="basicForm.description" type="textarea" :rows="4" :placeholder="t('supplementaryNotes')" allowClear />
        </AFormItem>
        <AFormItem :label="t('allowDelete')">
          <CustomField v-model="basicForm.isDeletable" type="checkbox" :label="t('thisTypeCanBeDeleted')" />
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
import { ProductTypeListGet, ProductTypeCreatePost, ProductTypeUpdatePatch, ProductTypeDeleteById, ProductTypeGetByID } from '@/assets/API/ProductType';
import { TinyForm, TinyFormItem, TinyInput, TinySelect, TinyBadge } from '@opentiny/vue';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Button } from '@/components/ui/button';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { SquarePen, Trash2 } from 'lucide-vue-next';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const permissionStore = usePermissionStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

/** 常數相關 **/
const EMPTY_PLACEHOLDER = t('unset');

/** 選項相關 **/
const deletableFilterOptions = [
  { label: t('all'), value: 'all' },
  { label: t('showDeletableOnly'), value: 'true' },
  { label: t('showSystemDefaultOnly'), value: 'false' },
];

/** 共用工具 **/
const formatDate = (value, format = 'YYYY-MM-DD') => {
  if (!value) return t('unset');
  return timezoneStore.formatDate(value, format) || t('unset');
}; //日期格式化
const responseDataToList = (item = {}) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description || '',
  isDeletable: item.isDeletable !== false,
  createdAt: formatDate(item.createdAt),
  updatedAt: formatDate(item.updatedAt),
  raw: item,
}); //轉換列表列資料

/** 篩選與查詢相關 **/
const defaultFilters = {
  keyword: '',
  deletable: 'all',
}; //預設篩選條件

// 包裝 API 函數以處理特殊參數轉換
const wrappedProductTypeListGet = (params) => {
  const processedParams = { ...params };

  // 將 keyword 轉換為 search
  if (params.keyword) {
    processedParams.search = params.keyword.trim();
    delete processedParams.keyword;
  }

  // 將 deletable 轉換為 isDeletable
  if (params.deletable && params.deletable !== 'all') {
    processedParams.isDeletable = params.deletable === 'true';
  }
  delete processedParams.deletable;

  return ProductTypeListGet(processedParams);
}; //包裝 API 函數

/** 列表資料取得相關 **/
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedProductTypeListGet,
  defaultFilters,
  {
    responseDataToList,
  },
); //使用分頁搜尋 API composable
const getAPI = () => getDefaultAPI();

/** 新增編輯相關 **/
const initializeForm = () => ({
  code: '',
  name: '',
  description: '',
  isDeletable: true,
}); //初始化表單資料
const dialogVisible = ref(false); //彈窗開關
const dialogMode = ref('create'); //彈窗模式
const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增產品類型' : '編輯產品類型')); //彈窗標題
const editingId = ref(null); //目前編輯的 ID
const basicFormRef = ref(null); //表單 ref
const basicForm = ref(initializeForm()); //表單資料
const isSaving = ref(false); //儲存中
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式
const basicFormRules = {
  code: [
    { required: true, message: t('codeRequired'), trigger: 'blur' },
    {
      validator: (value, callback) => {
        if (!value) return callback();
        const isValid = /^[A-Za-z0-9_]+$/.test(value);
        if (!isValid) {
          callback(new Error(t('codeInvalidFormat')));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: t('nameRequired'), trigger: 'blur' }],
}; //驗證表單
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
watch(dialogVisible, (visible) => {
  if (!visible) {
    resetForm();
    dialogMode.value = 'create';
    editingId.value = null;
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
    code: record.code || '',
    name: record.name || '',
    description: record.description || '',
    isDeletable: record.isDeletable !== false,
  };
}; //表單填值
const loadProductTypeDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await ProductTypeGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入產品類型詳細資料
const editData = (row) => {
  if (!row?.id) return;
  dialogMode.value = 'edit';
  editingId.value = row.id;
  fillFormFromRecord(row.raw || row);
  dialogVisible.value = true;
  loadProductTypeDetail(row.id);
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const buildPayload = () => {
  const formValue = basicForm.value;
  const payload = {
    code: formValue.code?.trim()?.toUpperCase(),
    name: formValue.name?.trim(),
    description: formValue.description?.trim() || undefined,
    isDeletable: Boolean(formValue.isDeletable),
  };
  if (!payload.code || !payload.name) return null;
  if (dialogMode.value === 'edit') {
    delete payload.code;
  }
  return payload;
}; //整理送出資料
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return;
  const payload = buildPayload();
  if (!payload) return;
  try {
    isSaving.value = true;
    if (isCreate.value) await ProductTypeCreatePost(payload); //新增儲存
    if (isEdite.value) await ProductTypeUpdatePatch(editingId.value, payload); //編輯儲存

    await mainStore.SWAL_Success(t('saveSuccess'));
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //新增編輯儲存
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖
const deleteData = async (id) => {
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await ProductTypeDeleteById(id);
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
}; //刪除產品類型

onMounted(getAPI);
</script>
