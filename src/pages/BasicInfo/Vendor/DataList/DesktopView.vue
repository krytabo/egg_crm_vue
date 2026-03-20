<!-- src/pages/BasicInfo/Vendor/DataList/DesktopView.vue 供應商管理（桌面版） -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>{{ t('vendorListTitle') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }) }}</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button status="danger" plain @click="clearFilter">{{ t('clearAllSearch') }}</a-button>
        <a-button v-if="permissionStore.hasPermission('VENDOR', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('addVendor') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id" :row-id="'id'">
      <CustomTinyGridColumn field="name" :title="t('vendorName')" :min-width="240" fixed="left" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-gray-600">{{ t('vendorName') }}</span>
            <TinyInput
              v-model="searchFields.name"
              :placeholder="t('pleaseEnterVendorName')"
              class="h-8 text-xs"
              clearable
              @keyup.enter="handleGlobalSearch('name')"
              @clear="handleGlobalSearch('name')"
            />
          </div>
        </template>
        <template #default="{ row }">
          <div class="flex flex-col gap-0.5">
            <span class="font-medium text-gray-900">{{ row.name }}</span>
            <span class="text-xs text-gray-500">{{ t('codeColon') }}{{ row.code || '—' }}</span>
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn
        field="contactPerson"
        :title="t('contactPerson')"
        :width="200"
        sortable
        :sort-field="'contactPerson'"
        :current-order="getColumnOrder('contactPerson')"
        @sort="handleColumnSort"
      >
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-gray-600">{{ t('contactPerson') }}</span>
            <TinyInput
              v-model="searchFields.contactName"
              :placeholder="t('pleaseEnterContactPerson')"
              class="h-8 text-xs"
              clearable
              @keyup.enter="handleGlobalSearch('contactName')"
              @clear="handleGlobalSearch('contactName')"
            />
          </div>
        </template>
        <template #default="{ row }">
          {{ row.contactPerson }}
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="phone" :title="t('contactPhone')" :width="200">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-gray-600">{{ t('contactPhone') }}</span>
            <TinyInput
              v-model="searchFields.contactPhone"
              :placeholder="t('pleaseEnterContactPhone')"
              class="h-8 text-xs"
              clearable
              @keyup.enter="handleGlobalSearch('contactPhone')"
              @clear="handleGlobalSearch('contactPhone')"
            />
          </div>
        </template>
        <template #default="{ row }">
          {{ row.phone }}
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="email" :title="t('email')" :min-width="220">
        <template #default="{ row }">{{ row.email }}</template>
      </CustomTinyGridColumn>
      <!--<CustomTinyGridColumn field="productType" :title="t('productType')" :width="180">
        <template #header>
          <div class="flex flex-col gap-1">
            <span class="text-[16px] text-gray-600">{{ t('productType') }}</span>
            <InfiniteSelect v-model="filters.productTypeId" dataSource="productTypes" :placeholder="t('pleaseSelect', '請選擇')" type="outline" class="w-[145px]!" />
            &lt;!&ndash;<TinySelect v-model="filters.productTypeId" :options="productTypeFilterOptions" :placeholder="t('all')" class="h-8 text-xs" />&ndash;&gt;
          </div>
        </template>
        <template #default="{ row }">
          <TinyBadge type="info">{{ row.productTypeName || t('uncategorized') }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>-->
      <CustomTinyGridColumn field="address" :title="t('address')" min-width="260">
        <template #default="{ row }">{{ row.addressDisplay }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="paymentTerms" :title="t('paymentTerms')" :width="140" align="center">
        <template #default="{ row }">{{ row.paymentTerms ? t('paymentTermsDays', { days: row.paymentTerms }) : '—' }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="createdAt" :title="t('createdAt')" :width="160" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort">
        <template #default="{ row }">{{ row.createdAt }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="updatedAt" :title="t('updatedAt')" :width="160" sortable :sort-field="'updatedAt'" :current-order="getColumnOrder('updatedAt')" @sort="handleColumnSort">
        <template #default="{ row }">{{ row.updatedAt }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status')" :width="130" align="center" fixed="right">
        <template #header>
          <div class="flex flex-col gap-1 text-center">
            <span class="text-[16px] text-gray-600">{{ t('status') }}</span>
            <TinySelect v-model="filters.status" :options="statusFilterOptions" :placeholder="t('all')" class="h-8 text-xs" />
          </div>
        </template>
        <template #default="{ row }">
          <a-tag :color="row.isActive ? 'arcoblue' : 'red'" size="large">{{ row.isActive ? t('statusActive') : t('statusInactive') }}</a-tag>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions')" :width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button v-if="permissionStore.hasPermission('VENDOR', 'DELETE')" class="table-button" :title="t('disable', '停用')" @click="deleteData(row.id)">
              <PowerOff class="size-4 text-orange-500" />
            </button>
            <button v-if="permissionStore.hasPermission('VENDOR', 'UPDATE')" class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
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

  <a-modal v-model:visible="dialogVisible" :top="30" draggable :maskClosable="false" :closable="false" width="700px" :fullscreen="fullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ isEdite ? t('editVendor') : t('addVendor') }}</div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>
    <perfect-scrollbar :class="[fullscreen ? 'h-[calc(100vh-120px)]' : 'h-[calc(100vh-370px)]']">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width layout="vertical">
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('vendorName')" field="name">
            <CustomField v-model="basicForm.name" type="input" :placeholder="t('pleaseEnterVendorName')" allowClear />
          </AFormItem>
          <AFormItem :label="t('productType')" field="productTypeId">
            <InfiniteSelect v-model="basicForm.productTypeId" dataSource="productTypes" value-key="id" :placeholder="t('pleaseSelectProductType')" allowClear />
          </AFormItem>
          <AFormItem :label="t('taxId')">
            <CustomField v-model="basicForm.taxId" type="input" :placeholder="t('pleaseEnterTaxId')" allowClear />
          </AFormItem>
          <AFormItem :label="t('contactPerson')" field="contactPerson">
            <CustomField v-model="basicForm.contactPerson" type="input" :placeholder="t('pleaseEnterContactPerson')" allowClear />
          </AFormItem>
          <AFormItem :label="t('contactPhone')" field="phone">
            <CustomField v-model="basicForm.phone" type="input" :placeholder="t('pleaseEnterContactPhone')" allowClear />
          </AFormItem>
          <AFormItem :label="t('companyPhone')">
            <CustomField v-model="basicForm.companyPhone" type="input" :placeholder="t('pleaseEnterCompanyPhone')" allowClear />
          </AFormItem>
          <AFormItem :label="t('email')">
            <CustomField v-model="basicForm.email" type="email" :placeholder="t('pleaseEnterEmail')" allowClear />
          </AFormItem>
          <AFormItem :label="t('paymentTermsDaysLabel')">
            <CustomField v-model="basicForm.paymentTerms" type="number" :min="0" :placeholder="t('defaultPaymentTerms')" allowClear />
          </AFormItem>
        </div>

        <AFormItem :label="t('companyAddress')" field="fullAddress">
          <CustomField v-model="basicForm.fullAddress" type="textarea" :rows="2" :placeholder="t('pleaseEnterFullAddressHint')" allowClear />
        </AFormItem>

        <div class="mb-3 text-sm font-semibold text-gray-700">{{ t('bankInfo') }}</div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('bankAccountName')">
            <CustomField v-model="basicForm.bankAccountName" type="input" :placeholder="t('pleaseEnterBankAccountName')" allowClear />
          </AFormItem>
          <AFormItem :label="t('bankAccountNumber')">
            <CustomField v-model="basicForm.bankAccountNumber" type="input" :placeholder="t('pleaseEnterBankAccountNumber')" allowClear />
          </AFormItem>
          <AFormItem :label="t('bankName')">
            <CustomField v-model="basicForm.bankName" type="input" :placeholder="t('pleaseEnterBankNameHint')" allowClear />
          </AFormItem>
          <AFormItem :label="t('branchName')">
            <CustomField v-model="basicForm.branchName" type="input" :placeholder="t('pleaseEnterBranchNameHint')" allowClear />
          </AFormItem>
        </div>

        <AFormItem :label="t('notes')">
          <CustomField v-model="basicForm.notes" type="textarea" :rows="3" :placeholder="t('pleaseEnterNotes')" allowClear />
        </AFormItem>

        <AFormItem :label="t('status')">
          <CustomField v-model="basicForm.isActive" type="select" :options="statusSelectOptions" />
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
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { TinyInput, TinySelect } from '@opentiny/vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Form as AForm, FormItem as AFormItem } from '@arco-design/web-vue';
import CustomField from '@/components/Form/CustomField.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useContentWidth } from '@/composables/useContentWidth';
import { useI18n } from 'vue-i18n';
import { SquarePen, Trash2, Expand, Shrink, PowerOff } from 'lucide-vue-next';
import { useSystemStore } from '@/stores/system';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useWindowSize } from '@vueuse/core';
import { useDataList } from './useDataList';

const systemStore = useSystemStore();
const permissionStore = usePermissionStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

/** Table高度 **/
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 290, 100));

const fullscreen = ref(false);
const {
  //篩選與查詢
  statusFilterOptions,
  statusSelectOptions,
  searchFields,
  loadProductTypes,
  getColumnOrder,
  handleColumnSort,
  handleGlobalSearch,
  clearFilter,

  //列表資料
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getAPI,
  CurrentChange,
  SizeChange,

  //新增編輯
  dialogVisible,
  basicFormRef,
  isSaving,
  isEdite,
  basicForm,
  basicFormRules,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,
} = useDataList(t);

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await loadProductTypes();
  await getAPI();
  await nextTick();
});
</script>
