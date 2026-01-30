// src/pages/BasicInfo/Vendor/DataList/useDataList.js
// 供應商資料列表 - 共用業務邏輯（Desktop / Mobile 共用）

import { computed, reactive, ref, watch } from 'vue';
import { VendorListGet, VendorCreatePost, VendorUpdatePatch, VendorDeleteById, VendorGetByID } from '@/assets/API/Vendor';
import { ProductTypeListGet } from '@/assets/API/ProductType';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';

/**
 * 供應商資料列表共用邏輯
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 */
export function useDataList(t, showMessage = () => {}) {
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();

  // ===== 選項相關 =====
  const productTypeOptions = ref([]);
  const statusFilterOptions = [
    { label: t('all'), value: 'all' },
    { label: t('statusActive'), value: 'active' },
    { label: t('statusInactive'), value: 'inactive' },
  ];
  const statusSelectOptions = [
    { label: t('statusActive'), value: true },
    { label: t('statusInactive'), value: false },
  ];
  const productTypeFilterOptions = computed(() => [
    { label: '全部', value: 'all' },
    ...productTypeOptions.value.map((option) => ({ label: option.label, value: option.value })),
  ]);

  // ===== 共用工具函式 =====
  const formatDate = (value) => {
    if (!value) return t('unset');
    return timezoneStore.formatDate(value, 'YYYY-MM-DD') || t('unset');
  };
  const formatAddress = (fullAddress) => {
    return fullAddress || t('unset');
  };
  const findProductTypeByCode = (code) => productTypeOptions.value.find((option) => option.value === code);

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
  };

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
  };

  // ===== 篩選與查詢相關 =====
  const searchFields = reactive({
    name: '',
    contactName: '',
    contactPhone: '',
  });
  const activeSearchKey = ref('name');
  const sortField = ref('');
  const sortDirection = ref('desc');
  const sortFieldMap = {
    name: 'name',
    contactPerson: 'contactPerson',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };
  const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');
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
  };

  // ===== 列表資料取得相關 =====
  const defaultFilters = {
    productTypeCode: 'all',
    status: 'all',
  };
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
  };

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

  const handleGlobalSearch = async (key) => {
    if (key) activeSearchKey.value = key;
    await _handleGlobalSearch();
  };

  const clearFilter = async () => {
    searchFields.name = '';
    searchFields.contactName = '';
    searchFields.contactPhone = '';
    sortField.value = '';
    sortDirection.value = 'desc';
    activeSearchKey.value = 'name';
    _clearFilter();
  };

  // 監聽篩選條件變化
  watch(
    () => [filters.productTypeCode, filters.status],
    () => {
      handleFiltersChange();
    },
  );

  // ===== 新增編輯相關 =====
  const dialogVisible = ref(false);
  const dialogMode = ref('create');
  const editingId = ref(null);
  const basicFormRef = ref(null);
  const isSaving = ref(false);

  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');

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
  });

  const basicForm = ref(initializeForm());

  const basicFormRules = {
    name: [{ required: true, message: t('vendorNameRequired'), trigger: 'blur' }],
    contactPerson: [{ required: true, message: t('contactPersonRequired'), trigger: 'blur' }],
    email: [{ required: true, message: t('emailRequired'), trigger: 'blur' }],
    phone: [{ required: true, message: t('contactPhoneRequired'), trigger: 'blur' }],
    fullAddress: [{ required: true, message: t('companyAddressRequired'), trigger: 'blur' }],
  };

  const resetFormState = () => {
    basicForm.value = initializeForm();
    basicFormRef.value?.clearValidate?.();
  };

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
  };

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
  };

  const openCreateDialog = () => {
    dialogMode.value = 'create';
    editingId.value = null;
    resetFormState();
    dialogVisible.value = true;
  };

  const editData = (row) => {
    if (!row?.id) return;
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
  };

  const _submitForm = async () => {
    const validateResult = await basicFormRef.value.validate();
    if (validateResult) return false;
    const payload = preparePayload();
    isSaving.value = true;
    try {
      if (isCreate.value) await VendorCreatePost(payload);
      if (isEdite.value) await VendorUpdatePatch(editingId.value, payload);
      await mainStore.SWAL_Success(t('saveSuccess'));
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
  };

  return {
    // 選項
    productTypeOptions,
    productTypeFilterOptions,
    statusFilterOptions,
    statusSelectOptions,

    // 工具函式
    formatDate,
    loadProductTypes,
    findProductTypeByCode,

    // 篩選與查詢
    searchFields,
    activeSearchKey,
    sortField,
    sortDirection,
    getColumnOrder,
    handleColumnSort,
    handleGlobalSearch,
    clearFilter,

    // 列表資料
    basicDataList,
    filters,
    pagination,
    pageSizeOptions,
    getAPI,
    CurrentChange,
    SizeChange,

    // 新增編輯
    dialogVisible,
    dialogMode,
    editingId,
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
  };
}
