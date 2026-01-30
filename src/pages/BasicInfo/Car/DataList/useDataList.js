// src/pages/BasicInfo/Car/DataList/useDataList.js
// 車輛資料列表 - 共用業務邏輯（Desktop / Mobile 共用）

import { computed, ref } from 'vue';
import { VehicleListGet, VehicleCreatePost, VehicleUpdatePatch, VehicleDeleteById, VehicleGetByID } from '@/assets/API/Vehicle';
import { useMainStore } from '@/stores/LoadingStore';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';

/**
 * 車輛資料列表共用邏輯
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 */
export function useDataList(t, showMessage = () => {}) {
  const mainStore = useMainStore();

  // ===== 選項相關 =====
  const vehicleTypeOptions = [
    { label: t('vehicleTypeTruck', '貨車'), value: 'TRUCK' },
    { label: t('vehicleTypeVan', '廂型車'), value: 'VAN' },
    { label: t('vehicleTypeMotorcycle', '機車'), value: 'MOTORCYCLE' },
    { label: t('vehicleTypeCar', '轎車'), value: 'CAR' },
    { label: t('vehicleTypeOther', '其他'), value: 'OTHER' },
  ];
  const vehicleTypeMap = Object.fromEntries(vehicleTypeOptions.map((opt) => [opt.value, opt.label]));

  const statusOptions = [
    { label: t('statusActive', '可用'), value: 'ACTIVE' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
    { label: t('statusMaintenance', '維修中'), value: 'MAINTENANCE' },
    { label: t('statusRetired', '已報廢'), value: 'RETIRED' },
  ];
  const statusMap = Object.fromEntries(statusOptions.map((opt) => [opt.value, opt.label]));

  // ===== 工具函式 =====
  const getStatusType = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'RETIRED':
        return 'danger';
      default:
        return 'info';
    }
  };

  // ===== 列表資料取得相關 =====
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
    notes: item.notes,
    assignedDriver: item.assignedDriver
      ? {
          id: item.assignedDriver.id,
          name: `${item.assignedDriver.firstName} ${item.assignedDriver.lastName}`.trim(),
        }
      : null,
    raw: item,
  });

  const defaultFilters = {
    search: '',
    type: '',
    status: '',
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
    SizeChange,
  } = usePaginatedSearchApi(VehicleListGet, defaultFilters, {
    responseDataToList,
  });

  const getAPI = async () => {
    mainStore.setLoading(true);
    try {
      await getDefaultAPI();
    } finally {
      mainStore.setLoading(false);
    }
  };

  // ===== 新增編輯相關 =====
  const dialogMode = ref('create');
  const dialogVisible = ref(false);
  const editingId = ref(null);
  const basicFormRef = ref(null);
  const isSaving = ref(false);

  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');

  const initializeForm = () => ({
    plateNumber: '',
    type: 'TRUCK',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 0,
    fuelType: '',
    status: 'ACTIVE',
    notes: '',
  });

  const basicForm = ref(initializeForm());

  const basicFormRules = {
    plateNumber: [{ required: true, message: t('required', '此欄位必填') }],
    type: [{ required: true, message: t('required', '此欄位必填') }],
  };

  const openCreateDialog = () => {
    dialogMode.value = 'create';
    editingId.value = null;
    basicForm.value = initializeForm();
    basicFormRef.value?.clearValidate();
    dialogVisible.value = true;
  };

  const editData = async (row) => {
    dialogMode.value = 'edit';
    editingId.value = row.id;
    mainStore.setLoading(true);
    try {
      const response = await VehicleGetByID(row.id);
      const data = response.data;
      basicForm.value = {
        plateNumber: data.plateNumber,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        capacity: data.capacity,
        fuelType: data.fuelType,
        status: data.status,
        notes: data.notes,
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
      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
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
          await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
          if (basicDataList.value.length === 1 && pagination.page > 1) {
            pagination.page -= 1;
          }
          await getAPI();
        } catch (error) {
          await mainStore.SWAL_Error(error);
        } finally {
          mainStore.setLoading(false);
        }
      },
    });
  };

  return {
    // 選項
    vehicleTypeOptions,
    vehicleTypeMap,
    statusOptions,
    statusMap,

    // 工具函式
    getStatusType,

    // 列表資料
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

    // 新增編輯
    dialogMode,
    dialogVisible,
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
