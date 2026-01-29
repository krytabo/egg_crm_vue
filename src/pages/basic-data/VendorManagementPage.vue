<!-- src/pages/basic-data/VendorManagementPage.vue 供應商管理 -->
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
        <a-button type="primary" @click="openCreateDialog">{{ t('addVendor') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="name" :title="t('vendorName')" min-width="240" fixed="left" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
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
            <span class="text-sm text-gray-900">{{ row.contactPerson }}</span>
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
            <span class="text-sm text-gray-900">{{ row.phone }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="email" :title="t('email')" min-width="220">
          <template #default="{ row }">{{ row.email }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="productType" :title="t('productType')" :width="180">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('productType') }}</span>
              <TinySelect v-model="filters.productTypeCode" :options="productTypeFilterOptions" :placeholder="t('all')" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge type="info">{{ row.productTypeName || t('uncategorized') }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
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
        <CustomTinyGridColumn field="status" :title="t('status')" :width="130" align="center">
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
        <CustomTinyGridColumn :title="t('actions')" :width="180" fixed="right" align="center">
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

  <a-modal v-model:visible="dialogVisible" :title="isEdite ? t('editVendor') : t('addVendor')" :top="30" draggable :maskClosable="false" :closable="false" width="700px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width layout="vertical">
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('vendorName')" field="name">
            <CustomField v-model="basicForm.name" type="input" :placeholder="t('pleaseEnterVendorName')" allowClear />
          </AFormItem>
          <AFormItem :label="t('productType')">
            <InfiniteSelect v-model="basicForm.productTypeCode" dataSource="productTypes" :placeholder="t('pleaseSelectProductType')" allowClear emitValue />
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
          <AFormItem :label="t('email')" field="email">
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
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { VendorListGet, VendorCreatePost, VendorUpdatePatch, VendorDeleteById, VendorGetByID } from '@/assets/API/Vendor';
import { ProductTypeListGet } from '@/assets/API/ProductType';
import { TinyInput, TinySelect, TinyBadge, TinyButton } from '@opentiny/vue';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Form as AForm, FormItem as AFormItem } from '@arco-design/web-vue';
import CustomField from '@/components/Form/CustomField.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { ScrollText, SquarePen, Trash2 } from 'lucide-vue-next';
import { useSystemStore } from '@/stores/system';

const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const systemStore = useSystemStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式
const EMPTY_PLACEHOLDER = t('unset'); //空值顯示

/** 選項相關 **/
const productTypeOptions = ref([]); //產品類型選項
const statusFilterOptions = [
  { label: t('all'), value: 'all' },
  { label: t('statusActive'), value: 'active' },
  { label: t('statusInactive'), value: 'inactive' },
]; //狀態篩選選項
const statusSelectOptions = [
  { label: t('statusActive'), value: true },
  { label: t('statusInactive'), value: false },
]; //表單狀態選項
const productTypeFilterOptions = computed(() => [{ label: '全部', value: 'all' }, ...productTypeOptions.value.map((option) => ({ label: option.label, value: option.value }))]); //產品類型篩選選單

/** 共用工具 **/
const formatDate = (value) => {
  if (!value) return t('unset');
  return timezoneStore.formatDate(value, 'YYYY-MM-DD') || t('unset');
}; //日期格式化
const formatAddress = (fullAddress) => {
  return fullAddress || t('unset');
}; //地址格式化
const findProductTypeByCode = (code) => productTypeOptions.value.find((option) => option.value === code); //尋找產品類型選項
const responseDataToList = (vendor = {}) => {
  const productTypeCode = vendor.primaryProductType?.code || vendor.productType?.code || vendor.productTypeCode || '';
  const productTypeName = findProductTypeByCode(productTypeCode)?.label || vendor.primaryProductType?.name || vendor.productType?.name || productTypeCode || '';
  return {
    id: vendor.id || vendor.code || `vendor-${Date.now()}`,
    code: vendor.code || '',
    name: vendor.name || t('unset'),
    contactPerson: vendor.contactPerson || vendor.contactName || t('unset'),
    phone: vendor.phone || t('unset'),
    companyPhone: vendor.companyPhone || t('unset'),
    email: vendor.email || t('unset'),
    productTypeCode,
    productTypeName: productTypeName || t('uncategorized'),
    addressDisplay: formatAddress(vendor.fullAddress),
    fullAddress: vendor.fullAddress || '',
    paymentTerms: vendor.paymentTerms ?? '',
    bankAccountName: vendor.bankAccountName || '',
    bankAccountNumber: vendor.bankAccountNumber || '',
    bankName: vendor.bankName || '',
    branchName: vendor.branchName || '',
    notes: vendor.notes || '',
    isActive: vendor.isActive !== false && vendor.status !== 'inactive',
    createdAt: formatDate(vendor.createdAt),
    updatedAt: formatDate(vendor.updatedAt),
    raw: vendor,
  };
}; //轉換列表列資料
const loadProductTypes = async () => {
  try {
    const response = await ProductTypeListGet({ page: 1, limit: 200 });
    const payload = response?.data ?? response ?? {};
    const items = payload.data ?? payload.items ?? [];
    productTypeOptions.value = items.map((item) => ({
      label: item.name || item.code,
      value: item.code,
    }));
  } catch (error) {
    console.error('Failed to load product types', error);
  }
}; //載入產品類型選項

/** 篩選與查詢相關 **/
const searchFields = reactive({
  name: '',
  contactName: '',
  contactPhone: '',
}); //表頭搜尋欄位
const activeSearchKey = ref('name'); //目前使用的搜尋欄位
const sortField = ref(''); //目前排序欄位
const sortDirection = ref('desc'); //目前排序方向
const sortFieldMap = {
  name: 'name',
  contactPerson: 'contactPerson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}; //對應後端排序欄位
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ''); //取得欄位排序狀態
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  const normalizedOrder = order === 'descending' ? 'desc' : order === 'ascending' ? 'asc' : order;
  if (!normalizedOrder) {
    sortField.value = '';
    sortDirection.value = 'desc';
  } else {
    sortField.value = field;
    sortDirection.value = normalizedOrder;
  }
  await getAPI();
}; //切換排序
const handleGlobalSearch = async (key) => {
  if (key) activeSearchKey.value = key;
  await _handleGlobalSearch();
}; //表頭搜尋觸發

/** 列表資料取得相關 **/
const defaultFilters = {
  productTypeCode: 'all',
  status: 'all',
}; //預設篩選條件
const wrappedVendorListGet = (params) => {
  const processedParams = { ...params };

  // 處理表頭搜索：合併三個搜索欄位為單個 search 參數
  const key = activeSearchKey.value;
  const prioritized = searchFields[key]?.trim();
  let searchTerm = '';
  if (prioritized) {
    searchTerm = prioritized;
  } else {
    const fallback = [searchFields.name, searchFields.contactName, searchFields.contactPhone].map((value) => value?.trim()).find((value) => !!value);
    searchTerm = fallback || '';
  }
  if (searchTerm) {
    processedParams.search = searchTerm;
  }

  // 處理排序
  if (sortField.value) {
    processedParams.sortBy = sortFieldMap[sortField.value] || sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }

  return VendorListGet(processedParams);
}; //包裝 API 函數
const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleGlobalSearch: _handleGlobalSearch,
  handleFiltersChange,
  clearFilter: _clearFilter,
  CurrentChange,
  SizeChange,
} = usePaginatedSearchApi(wrappedVendorListGet, defaultFilters, {
  responseDataToList,
});
const getAPI = () => getDefaultAPI();
const clearFilter = async () => {
  searchFields.name = '';
  searchFields.contactName = '';
  searchFields.contactPhone = '';
  sortField.value = '';
  sortDirection.value = 'desc';
  activeSearchKey.value = 'name';
  _clearFilter();
}; //清除所有篩選

/** 新增編輯相關 **/
const dialogVisible = ref(false); //彈窗狀態
const dialogMode = ref('create'); //彈窗模式
const editingId = ref(null); //編輯ID
const basicFormRef = ref(null); //表單實體
const isSaving = ref(false); //儲存中
const initializeForm = () => ({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  companyPhone: '',
  productTypeCode: '',
  taxId: '',
  paymentTerms: '30',
  isActive: true,
  fullAddress: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  branchName: '',
  notes: '',
}); //建立預設表單
const basicForm = ref(initializeForm()); //表單資料
const dialogTitle = computed(() => (editingId.value ? '編輯供應商' : '新增供應商')); //彈窗標題
const basicFormRules = {
  name: [{ required: true, message: t('vendorNameRequired'), trigger: 'blur' }],
  contactPerson: [{ required: true, message: t('contactPersonRequired'), trigger: 'blur' }],
  email: [{ required: true, message: t('emailRequired'), trigger: 'blur' }],
  phone: [{ required: true, message: t('contactPhoneRequired'), trigger: 'blur' }],
  fullAddress: [{ required: true, message: t('companyAddressRequired'), trigger: 'blur' }],
}; //表單驗證規則
const resetFormState = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
const fillFormFromRecord = (record = {}) => {
  const vendor = record.raw || record;
  basicForm.value.name = vendor.name || '';
  basicForm.value.contactPerson = vendor.contactPerson || vendor.contactName || '';
  basicForm.value.email = vendor.email || '';
  basicForm.value.phone = vendor.phone || '';
  basicForm.value.companyPhone = vendor.companyPhone || '';
  basicForm.value.productTypeCode = vendor.primaryProductType?.code || vendor.productType?.code || vendor.productTypeCode || '';
  basicForm.value.taxId = vendor.taxId || '';
  basicForm.value.paymentTerms = vendor.paymentTerms != null ? String(vendor.paymentTerms) : '';
  basicForm.value.isActive = vendor.isActive !== false && vendor.status !== 'inactive';
  basicForm.value.fullAddress = vendor.fullAddress || '';
  basicForm.value.bankAccountName = vendor.bankAccountName || '';
  basicForm.value.bankAccountNumber = vendor.bankAccountNumber || '';
  basicForm.value.bankName = vendor.bankName || '';
  basicForm.value.branchName = vendor.branchName || '';
  basicForm.value.notes = vendor.notes || '';
}; //填入表單資料
const getData = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await VendorGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord({ raw: detail });
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //取得單筆詳細資料
const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetFormState();
  dialogVisible.value = true;
}; //開啟新增彈窗
const editData = (row) => {
  if (!row?.id) return;
  dialogMode.value = 'edit';
  editingId.value = row.id;
  fillFormFromRecord(row);
  dialogVisible.value = true;
  getData(row.id);
}; //開啟編輯彈窗
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const preparePayload = () => {
  const payload = {
    name: basicForm.value.name.trim(),
    contactPerson: basicForm.value.contactPerson.trim(),
    email: basicForm.value.email.trim(),
    phone: basicForm.value.phone.trim(),
    productTypeCode: basicForm.value.productTypeCode || undefined,
    isActive: Boolean(basicForm.value.isActive),
  };

  // 選填欄位
  if (basicForm.value.companyPhone?.trim()) {
    payload.companyPhone = basicForm.value.companyPhone.trim();
  }
  if (basicForm.value.fullAddress?.trim()) {
    payload.fullAddress = basicForm.value.fullAddress.trim();
  }
  if (basicForm.value.taxId?.trim()) {
    payload.taxId = basicForm.value.taxId.trim();
  }
  if (basicForm.value.paymentTerms) {
    payload.paymentTerms = Number(basicForm.value.paymentTerms);
  }
  if (basicForm.value.bankAccountName?.trim()) {
    payload.bankAccountName = basicForm.value.bankAccountName.trim();
  }
  if (basicForm.value.bankAccountNumber?.trim()) {
    payload.bankAccountNumber = basicForm.value.bankAccountNumber.trim();
  }
  if (basicForm.value.bankName?.trim()) {
    payload.bankName = basicForm.value.bankName.trim();
  }
  if (basicForm.value.branchName?.trim()) {
    payload.branchName = basicForm.value.branchName.trim();
  }
  if (basicForm.value.notes?.trim()) {
    payload.notes = basicForm.value.notes.trim();
  }

  return payload;
}; //整理表單送出資料
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return false;
  const payload = preparePayload();
  isSaving.value = true;
  try {
    if (isCreate.value) await VendorCreatePost(payload); //新增儲存
    if (isEdite.value) await VendorUpdatePatch(editingId.value, payload); //編輯儲存
    await mainStore.SWAL_Success(t('saveSuccess'));
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //新增編輯儲存
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖
const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await VendorDeleteById(id);
        await mainStore.SWAL_Success(t('deleteSuccess'));
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
}; //刪除供應商

watch(
  () => [filters.productTypeCode, filters.status],
  () => {
    handleFiltersChange();
  },
); //偵測篩選條件變化

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await loadProductTypes();
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(320);
});
</script>
