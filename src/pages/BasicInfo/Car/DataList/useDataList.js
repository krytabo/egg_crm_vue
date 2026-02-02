// src/pages/BasicInfo/Car/DataList/useDataList.js
// 車輛資料列表 - 共用業務邏輯（Desktop / Mobile 共用）
import { computed, ref } from 'vue';
import { VehicleListGet, VehicleCreatePost, VehicleUpdatePatch, VehicleDeleteById, VehicleGetByID, VehicleAssignDriverPost, VehicleUnassignDriverPost } from '@/assets/API/Vehicle';
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

  /** 選項相關 **/
  const statusOptions = [
    { label: t('statusActive', '可用'), value: 'ACTIVE' },
    { label: t('statusMaintenance', '維修中'), value: 'MAINTENANCE' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
  ];
  const statusMap = Object.fromEntries(statusOptions.map((opt) => [opt.value, opt.label]));
  const fuelTypeOptions = [
    { label: t('fuelDiesel', '柴油'), value: 'DIESEL' },
    { label: t('fuelGasoline', '汽油'), value: 'GASOLINE' },
    { label: t('fuelElectric', '電動'), value: 'ELECTRIC' },
    { label: t('fuelHybrid', '油電混合'), value: 'HYBRID' },
    { label: t('fuelOther', '其他'), value: 'OTHER' },
  ];
  const fuelTypeMap = Object.fromEntries(fuelTypeOptions.map((opt) => [opt.value, opt.label]));
  const getStatusType = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'MAINTENANCE':
        return 'warning';
      case 'INACTIVE':
        return 'info';
      default:
        return 'info';
    }
  };

  /** 取得資料相關 **/
  const responseDataToList = (item = {}) => ({
    ...item,
    id: item.id,
    licensePlate: item.licensePlate,
    make: item.brand,
    model: item.model,
    year: item.year,
    vin: item.vin,
    engineNumber: item.engineNumber,
    fuelType: item.fuelType,
    capacity: item.capacity,
    color: item.color,
    status: item.status,
    insuranceExpiry: item.insuranceExpiry,
    registrationExpiry: item.registrationExpiry,
    inspectionExpiry: item.inspectionExpiry,
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
    status: '',
  };
  const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
    VehicleListGet,
    defaultFilters,
    {
      responseDataToList,
    },
  );
  const getAPI = async () => {
    mainStore.setLoading(true);
    try {
      await getDefaultAPI();
    } finally {
      mainStore.setLoading(false);
    }
  };

  /** 新增編輯相關 **/
  const dialogMode = ref('create');
  const dialogVisible = ref(false);
  const editingId = ref(null);
  const basicFormRef = ref(null);
  const isSaving = ref(false);
  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');
  const initializeForm = () => ({
    licensePlate: '', //車牌號碼
    make: '', //品牌
    model: '', //型號
    year: new Date().getFullYear(), //出廠年份
    vin: '', //車身號碼
    engineNumber: '', //引擎號碼
    fuelType: '', //燃料類型
    capacity: null, //載重量 (kg)
    status: 'ACTIVE', //狀態
    insuranceExpiry: null, //保險到期日
    registrationExpiry: null, //行照到期日
    inspectionExpiry: null, //驗車到期日
    notes: '', //備註
  });
  const basicForm = ref(initializeForm());
  const basicFormRules = {
    licensePlate: [{ required: true, message: t('required', '此欄位必填') }],
    make: [{ required: true, message: t('required', '此欄位必填') }],
    model: [{ required: true, message: t('required', '此欄位必填') }],
    year: [{ required: true, message: t('required', '此欄位必填') }],
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
      const data = response.data?.data;
      basicForm.value = {
        licensePlate: data.licensePlate || '', //車牌號碼
        make: data.brand || '', //品牌
        model: data.model || '', //型號
        year: data.year || new Date().getFullYear(), //出廠年份
        vin: data.vin || '', //車身號碼
        engineNumber: data.engineNumber || '', //引擎號碼
        fuelType: data.fuelType || '', //燃料類型
        capacity: data.capacity || null, //載重量 (kg)
        status: data.status || 'ACTIVE', //狀態
        insuranceExpiry: data.insuranceExpiry || null, //保險到期日
        registrationExpiry: data.registrationExpiry || null, //行照到期日
        inspectionExpiry: data.inspectionExpiry || null, //驗車到期日
        notes: data.notes || '', //備註
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
    if (validateResult) return false;

    try {
      isSaving.value = true;
      if (isCreate.value) {
        delete basicForm.value.color;
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

  /** 指派司機相關 **/
  const driverDialogVisible = ref(false); //指派司機彈窗
  const selectedVehicle = ref(null); //選中的車輛
  const selectedDriverId = ref(null); //選中的司機 ID
  const isAssigning = ref(false); //是否正在指派中
  const openDriverDialog = async (vehicle) => {
    selectedVehicle.value = vehicle;
    selectedDriverId.value = vehicle.assignedDriver?.id || null;
    driverDialogVisible.value = true;
  }; //開啟指派司機彈窗
  const closeDriverDialog = () => {
    driverDialogVisible.value = false;
    selectedVehicle.value = null;
    selectedDriverId.value = null;
  }; //關閉指派司機彈窗
  const assignDriver = async () => {
    if (!selectedVehicle.value || !selectedDriverId.value) return;
    isAssigning.value = true;
    mainStore.setLoading(true);
    try {
      await VehicleAssignDriverPost(selectedVehicle.value.id, { driverId: selectedDriverId.value?.id });
      await mainStore.SWAL_Success(t('assignDriverSuccess', '指派司機成功'));
      closeDriverDialog();
      await getAPI();
    } catch (error) {
      await mainStore.SWAL_Error(error);
    } finally {
      isAssigning.value = false;
      mainStore.setLoading(false);
    }
  }; //指派司機
  const unassignDriver = async (vehicleId) => {
    if (!vehicleId) return;
    await mainStore.SWAL_Confirm({
      title: t('confirmUnassignDriver', '確認解除指派'),
      text: t('unassignDriverConfirmText', '確定要解除此車輛的司機指派嗎？'),
      onConfirm: async () => {
        mainStore.setLoading(true);
        try {
          await VehicleUnassignDriverPost(vehicleId);
          await mainStore.SWAL_Success(t('unassignDriverSuccess', '已解除司機指派'));
          await getAPI();
        } catch (error) {
          await mainStore.SWAL_Error(error);
        } finally {
          mainStore.setLoading(false);
        }
      },
    });
  }; //解除司機指派

  return {
    // 選項
    statusOptions,
    statusMap,
    fuelTypeOptions,
    fuelTypeMap,

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

    // 指派司機
    driverDialogVisible,
    selectedVehicle,
    selectedDriverId,
    isAssigning,
    openDriverDialog,
    closeDriverDialog,
    assignDriver,
    unassignDriver,
  };
}
