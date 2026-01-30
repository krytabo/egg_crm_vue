<!-- src/pages/parameter-settings/RoleSettingsPage.vue 角色設定 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('roleSettingsTitle') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">{{ t('clearAllSearch') }}</Button>
        <Button v-if="permissionStore.hasPermission('ROLE', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addRole') }}</Button>
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
          <div class="grid gap-3 md:grid-cols-2">
            <AFormItem :label="t('keyword')">
              <TinyInput v-model="filters.keyword" :placeholder="t('pleaseEnterNameOrDescription')" clearable class="h-9 text-sm" @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </AFormItem>
            <AFormItem :label="t('roleType')">
              <TinySelect v-model="filters.type" :options="roleTypeOptions" :placeholder="t('all')" class="h-9 text-sm" clearable @update:model-value="handleFiltersChange" />
            </AFormItem>
          </div>
        </AForm>
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--          列表            -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="name" :title="t('role')" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-base font-semibold text-gray-900">{{ row.displayName }}</span>
              <span class="text-xs text-gray-500">{{ t('codeColon') }}{{ row.displayCode || '—' }}</span>
              <span class="text-xs text-gray-500">{{ row.description || t('unset') }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="isSystem" :title="t('type')" :width="120" align="center">
          <template #default="{ row }">
            <TinyBadge :type="row.isSystem ? 'info' : 'success'">{{ row.isSystem ? t('system') : t('custom') }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="permissions" :title="t('permissions')" min-width="260">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <TinyTag v-for="permission in row.permissionPreview" :key="permission" size="mini" type="info">{{ permission }}</TinyTag>
              <TinyTag v-if="row.permissionOverflow > 0" size="mini" effect="dark">+{{ row.permissionOverflow }}</TinyTag>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="updatedAt" :title="t('updatedAt')" :width="160">
          <template #default="{ row }">{{ row.updatedAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn :title="t('actions')" :width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <a-button v-if="permissionStore.hasPermission('ROLE', 'DELETE')" type="text" status="danger" :disabled="row.isSystem || row.id === '5445966e-f790-461d-8686-7070d06100ea'" @click="deleteData(row)"><Trash2 class="size-4" /></a-button>
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
  <a-modal v-model:visible="dialogVisible" :title="dialogTitle" :top="30" draggable :maskClosable="false" :closable="false" width="800px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" auto-label-width :model="basicForm" layout="vertical" :rules="basicFormRules">
        <div class="flex gap-4">
          <div class="flex flex-col gap-2">
            <div class="col-span-2 grid gap-4 md:grid-cols-2">
              <AFormItem :label="t('roleName')" field="name">
                <CustomField v-model="basicForm.name" type="input" :placeholder="t('pleaseEnterName')" allowClear />
              </AFormItem>
            </div>
            <AFormItem :label="t('isSystemRole')">
              <a-checkbox :model-value="basicForm.isSystem" :disabled="isEdite" @update:model-value="(val) => (basicForm.isSystem = val)">{{ t('thisRoleIsSystemRole') }}</a-checkbox>
            </AFormItem>
            <AFormItem :label="t('description')" class="col-span-2">
              <CustomField v-model="basicForm.description" type="textarea" :rows="3" :placeholder="t('pleaseEnterDescription')" allowClear />
            </AFormItem>
          </div>

          <AFormItem :label="t('permissionList')" field="permissionIds" class="w-[500px]">
            <PermissionTreeSelect v-model="basicForm.permissionIds" :placeholder="t('pleaseSelectPermission')" hideTrigger />
            <template #extra>
              <p class="text-xs text-gray-500">{{ t('permissionIdsHint') }}</p>
            </template>
          </AFormItem>
        </div>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel') }}</a-button>
        <Button :disabled="isSaving" @click="saveRole" :loading="isSaving">{{ isSaving ? t('saving') : t('save') }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RoleListGet, RoleCreatePost, RoleGetByID, RoleUpdatePatch, RoleDeleteById, RoleAssignPermissionsPost } from '@/assets/API/Role';
import { TinyForm, TinyFormItem, TinyInput, TinySelect, TinyBadge, TinyTag } from '@opentiny/vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import PermissionTreeSelect from '@/components/Form/PermissionTreeSelect.vue';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { SquarePen, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { usePermissionStore } from '@/stores/PermissionStore';

const mainStore = useMainStore();
const permissionStore = usePermissionStore();
const timezoneStore = useTimezoneStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

// 使用共用選項
const { roleTypeOptions, permissionResourceLabelMap, permissionActionShortLabelMap } = useSelectOptions();

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式
const EMPTY_PLACEHOLDER = t('unset');

/** 共用工具 **/
const formatDate = (value, format = 'YYYY-MM-DD HH:mm') => {
  if (!value) return t('unset');
  return timezoneStore.formatDate(value, format) || t('unset');
}; //日期格式化
const toPermissionLabel = (permission = {}) => {
  const resource = permission.resource || '';
  const action = permission.action || '';
  const resourceLabel = permissionResourceLabelMap.value[resource] || resource;
  const actionLabel = permissionActionShortLabelMap.value[action] || action;
  return `${resourceLabel}：${actionLabel}`;
}; //轉換權限標籤
const responseDataToList = (item = {}) => {
  const permissions = Array.isArray(item.permissions) ? item.permissions : [];
  const labels = permissions.map(toPermissionLabel).filter(Boolean);
  return {
    id: item.id,
    displayName: item.displayName || item.name || t('unset'),
    name: item.name || '',
    displayCode: item.name || '',
    description: item.description || '',
    isSystem: item.isSystem === true,
    permissions: labels,
    permissionPreview: labels.slice(0, 4),
    permissionOverflow: labels.length > 4 ? labels.length - 4 : 0,
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    raw: item,
  };
}; //轉換列表列資料

/** 列表資料取得相關 **/
const defaultFilters = {
  keyword: '',
  type: 'all',
}; //預設篩選條件
const wrappedRoleListGet = (params) => {
  const processedParams = { ...params };
  if (params.keyword) {
    processedParams.search = params.keyword.trim();
    delete processedParams.keyword;
  }
  if (params.type === 'system') {
    processedParams.isSystem = true;
  } else if (params.type === 'custom') {
    processedParams.isSystem = false;
  }
  delete processedParams.type;

  return RoleListGet(processedParams);
};
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedRoleListGet,
  defaultFilters,
  {
    responseDataToList,
  },
);
const getAPI = () => getDefaultAPI();

/** 新增編輯相關 **/
const initializeForm = () => ({
  name: '',
  displayName: '',
  description: '',
  isSystem: false,
  permissionIds: [],
}); //初始化表單資料
const dialogVisible = ref(false); //彈窗開關
const dialogMode = ref('create'); //彈窗模式
const dialogTitle = computed(() => (isCreate.value ? t('addRole') : t('editRole'))); //彈窗標題
const editingId = ref(null); //目前編輯的 ID
const basicFormRef = ref(null); //表單 ref
const basicForm = ref(initializeForm()); //表單資料
const isSaving = ref(false); //儲存中
const basicFormRules = {
  name: [
    { required: true, message: t('roleNameRequired'), trigger: 'blur' },
    { min: 2, message: t('roleNameMinLength', { min: 2 }), trigger: 'blur' },
  ],
  permissionIds: [{ type: 'array', required: true, message: t('permissionsRequired'), trigger: 'change' }],
}; //驗證表單
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
watch(dialogVisible, (visible) => {
  if (!visible) {
    closeDialog();
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
    name: record.name || '',
    displayName: record.displayName || '',
    description: record.description || '',
    isSystem: Boolean(record.isSystem),
    permissionIds: (record.permissions || record.permissionIds || [])
      .map((permission) => {
        if (typeof permission === 'string') return permission;
        return permission.id;
      })
      .filter(Boolean),
  };
}; //表單填值
const loadRoleDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await RoleGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入角色詳細資料
const editData = (row) => {
  if (!row?.id) return;
  dialogMode.value = 'edit';
  editingId.value = row.id;
  fillFormFromRecord(row.raw || row);
  dialogVisible.value = true;
  loadRoleDetail(row.id);
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const buildBasePayload = () => {
  const formValue = basicForm.value;
  return {
    name: formValue.name?.trim(),
    description: formValue.description?.trim() || undefined,
  };
}; //整理基本資料
const buildPermissionPayload = () => {
  const permissions = Array.isArray(basicForm.value.permissionIds) ? basicForm.value.permissionIds.filter(Boolean) : [];
  return {
    permissionIds: permissions,
  };
}; //整理權限資料
const saveRole = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return;
  const basePayload = buildBasePayload();
  const permissionPayload = buildPermissionPayload();
  if (!basePayload.name || !permissionPayload.permissionIds.length) return;
  isSaving.value = true;
  try {
    if (isEdite.value && editingId.value) {
      await RoleUpdatePatch(editingId.value, basePayload);
      if (!basicForm.value.isSystem) {
        await RoleAssignPermissionsPost(editingId.value, permissionPayload);
      }
    } else {
      const createPayload = {
        ...basePayload,
        permissionIds: permissionPayload.permissionIds,
        isSystem: basicForm.value.isSystem === true ? true : undefined,
      };
      await RoleCreatePost(createPayload);
    }
    closeDialog();
    await mainStore.SWAL_Success(t('saveSuccess'));
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSaving.value = false;
  }
}; //儲存角色
const deleteData = async (row) => {
  await mainStore.SWAL_DeleteConfirm({
    title: t('swal.aboutToDelete'),
    text: t('swal.dataCannotBeRecovered'),
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await RoleDeleteById(row.id);
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
}; //刪除角色

onMounted(async () => {
  await getAPI();
});
</script>
