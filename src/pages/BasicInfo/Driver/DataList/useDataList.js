// src/pages/BasicInfo/Driver/DataList/useDataList.js
// 司機資料列表 - 共用業務邏輯（Desktop / Mobile 共用）

import { computed, reactive, ref } from 'vue';
import { DriverListGet, DriverCreatePost, DriverUpdatePatch, DriverDeleteById, DriverGetById } from '@/assets/API/Drivers';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';

/**
 * 司機資料列表共用邏輯
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 */
export function useDataList(t, showMessage = () => {}) {
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();

  // ===== 狀態相關 =====
  const STATUS_MAP = {
    AVAILABLE: { label: t('statusAvailable', '可用'), color: 'green' },
    ASSIGNED: { label: t('statusAssigned', '已指派'), color: 'blue' },
    ON_TRIP: { label: t('statusOnTrip', '配送中'), color: 'orange' },
    OFF_DUTY: { label: t('statusOffDuty', '休假'), color: 'gray' },
    INACTIVE: { label: t('statusInactive', '停用'), color: 'red' },
  };
  const getStatusLabel = (status) => STATUS_MAP[status]?.label || status;
  const getStatusColor = (status) => STATUS_MAP[status]?.color || 'gray';

  const statusFilterOptions = [
    { label: t('all', '全部'), value: 'all' },
    { label: t('statusAvailable', '可用'), value: 'AVAILABLE' },
    { label: t('statusAssigned', '已指派'), value: 'ASSIGNED' },
    { label: t('statusOnTrip', '配送中'), value: 'ON_TRIP' },
    { label: t('statusOffDuty', '休假'), value: 'OFF_DUTY' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
  ];

  const statusSelectOptions = [
    { label: t('statusAvailable', '可用'), value: 'AVAILABLE' },
    { label: t('statusAssigned', '已指派'), value: 'ASSIGNED' },
    { label: t('statusOnTrip', '配送中'), value: 'ON_TRIP' },
    { label: t('statusOffDuty', '休假'), value: 'OFF_DUTY' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
  ];

  // ===== 駕照到期相關 =====
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

  // ===== 共用工具 =====
  const formatDate = (value) => {
    if (!value) return '—';
    return timezoneStore.formatDate(value, 'YYYY-MM-DD');
  };

  // ===== 篩選與查詢相關 =====
  const searchFields = reactive({
    employeeId: '',
    fullName: '',
    licenseNumber: '',
  });

  // ===== 列表資料取得相關 =====
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

  // ===== 新增編輯相關 =====
  const dialogVisible = ref(false);
  const dialogMode = ref('create');
  const editingId = ref(null);
  const basicFormRef = ref(null);
  const isSaving = ref(false);

  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');

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
    employeeId: [{ required: true, message: t('employeeIdRequired', '請輸入員工編號') }],
    fullName: [{ required: true, message: t('fullNameRequired', '請輸入姓名') }],
    licenseNumber: [{ required: true, message: t('licenseNumberRequired', '請輸入駕照號碼') }],
    licenseExpiry: [{ required: true, message: t('licenseExpiryRequired', '請選擇駕照到期日') }],
    hireDate: [{ required: true, message: t('hireDateRequired', '請選擇入職日期') }],
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
      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
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
          await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
          if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
          await getAPI();
        } catch (error) {
          await mainStore.SWAL_Error(error);
        }
      },
    });
  };

  return {
    // 狀態選項
    STATUS_MAP,
    getStatusLabel,
    getStatusColor,
    statusFilterOptions,
    statusSelectOptions,

    // 駕照到期
    isLicenseExpired,
    isLicenseExpiringSoon,
    getLicenseExpiryClass,

    // 工具函式
    formatDate,

    // 篩選與查詢
    searchFields,
    handleGlobalSearch,
    handleFiltersChange,
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
