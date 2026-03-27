// src/pages/BasicInfo/User/DataList/useDataList.js
import { computed, reactive, ref } from 'vue';
import { UserListGet, UserCreatePost, UserUpdatePatch, UserDeleteById, UserGetByID } from '@/assets/API/User';
import { dataList } from '@/assets/API/api';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { debounce } from 'lodash';

export function useDataList(t, showMessage = () => {}) {
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();

  const MAX_AVATAR_SIZE = 5 * 1024 * 1024; //5MB
  const MIN_PASSWORD_LENGTH = 8; //最小密碼長度
  const userPhoto = ref(false); //大頭照功能開關（先暫時隱藏）
  const jobTypeOptions = [
    { label: t('jobTypeDriver'), value: 'DRIVER' },
    { label: t('jobTypeSales'), value: 'SALES' },
    { label: t('jobTypeWarehouse'), value: 'WAREHOUSE' },
    { label: t('jobTypeAdmin'), value: 'ADMIN' },
    { label: t('jobTypeManager'), value: 'MANAGER' },
    { label: t('jobTypeAccountant'), value: 'ACCOUNTANT' },
  ];
  const statusFilterOptions = [
    { label: t('all'), value: 'all' },
    { label: t('statusActive'), value: 'ACTIVE' },
    { label: t('statusInactive'), value: 'INACTIVE' },
  ];
  const jobTypeFilterOptions = computed(() => [{ label: '全部', value: '' }, ...jobTypeOptions]);
  const formatDate = (value, format = 'YYYY/MM/DD') => timezoneStore.formatDate(value, format);
  const getJobTypeLabel = (jobTypeValue) => jobTypeOptions.find((option) => option.value === jobTypeValue)?.label || jobTypeValue || '—';
  const trimFields = (obj, fields) => {
    return fields.reduce((acc, field) => {
      acc[field] = obj[field]?.trim();
      return acc;
    }, {});
  };
  const responseDataToList = (user = {}) => {
    return {
      ...user,
      id: user.id || user.userId || user._id,
      role: user.role,
      jobType: user.jobType || '',
      phone: user.phone ?? t('unset'),
      email: user.email ?? t('unset'),
      idNumber: user.idNumber ?? user.nationalId ?? t('unset'),
      hireDate: formatDate(user.hireDate) || t('unset'),
      lastLoginAt: formatDate(user.lastLoginAt, 'YYYY/MM/DD HH:mm:ss'),
      createdAt: formatDate(user.createdAt, 'YYYY/MM/DD HH:mm:ss'),
      updatedAt: formatDate(user.updatedAt, 'YYYY/MM/DD HH:mm:ss'),
      isActive: user.isActive !== false && user.status !== 'INACTIVE',
      raw: user,
    };
  };

  /** 篩選與排序相關 **/
  const sortField = ref('');
  const sortDirection = ref('asc');
  const sortFieldMap = {
    fullName: 'fullName',
    email: 'email',
    hireDate: 'hireDate',
    lastLoginAt: 'lastLoginAt',
  };
  const searchFields = reactive({
    name: '',
    email: '',
    phone: '',
  });
  const defaultFilters = {
    role: '',
    status: 'all',
    jobType: '',
    hireDateFrom: '',
    hireDateTo: '',
  };
  const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');
  const handleColumnSort = async ({ field, order }) => {
    if (!field) return;
    if (!order) {
      sortField.value = '';
      sortDirection.value = 'asc';
    } else {
      sortField.value = field;
      sortDirection.value = order;
    }
    await getAPI();
  };

  /** 列表資料取得相關 **/
  const wrappedUserListGet = (params) => {
    const processedParams = { ...params };
    const searchTerm = searchFields.email.trim() || searchFields.name.trim() || '';
    if (searchTerm) processedParams.search = searchTerm;
    if (params.status && params.status !== 'all') {
      processedParams.isActive = params.status === 'ACTIVE';
    }
    delete processedParams.status;
    if (params.role) {
      processedParams.role = params.role?.name;
    }
    if (searchFields.phone.trim()) {
      processedParams.phone = searchFields.phone.trim();
    }
    if (params.hireDateFrom) {
      processedParams.hireDateFrom = formatDate(params.hireDateFrom);
    }
    if (params.hireDateTo) {
      processedParams.hireDateTo = formatDate(params.hireDateTo);
    }
    if (sortField.value && sortFieldMap[sortField.value]) {
      processedParams.sortField = sortFieldMap[sortField.value];
      processedParams.sortOrder = sortDirection.value;
    }
    return UserListGet(processedParams);
  };
  const {
    basicDataList,
    filters,
    pagination,
    pageSizeOptions,
    getDefaultAPI,
    handleFiltersChange,
    clearFilter: clearFilterBase,
    CurrentChange,
    SizeChange,
  } = usePaginatedSearchApi(wrappedUserListGet, defaultFilters, {
    responseDataToList,
    pageSizeOptions: [10, 20, 50, 100, 200],
  });
  const getAPI = async () => {
    await getDefaultAPI();
  };
  const handleFilterChange = handleFiltersChange;
  const clearFilter = () => {
    searchFields.name = '';
    searchFields.email = '';
    searchFields.phone = '';
    clearFilterBase();
  };
  const clearHireDateFilter = async () => {
    filters.hireDateFrom = '';
    filters.hireDateTo = '';
    await handleFiltersChange();
  };

  /** 新增編輯相關 **/
  const dialogMode = ref('create');
  const editingId = ref(null);
  const dialogVisible = ref(false);
  const isSaving = ref(false);
  const basicFormRef = ref(null);
  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');
  const isEditing = computed(() => Boolean(editingId.value));
  const initializeForm = () => ({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    jobType: '',
    idNumber: '',
    birthday: '',
    hireDate: '',
    password: '',
    role: null,
    isActive: true,
    avatar: '',
    //司機專用欄位
    licenseNumber: '',
    licenseExpiry: '',
  });
  const basicForm = ref(initializeForm());
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValidator = (value, callback) => {
    if (!value || emailPattern.test(value)) {
      callback();
    } else {
      callback(new Error('電子信箱格式不正確'));
    }
  };
  const passwordValidator = (requirePassword) => (value, callback) => {
    if (!requirePassword && !value) {
      callback();
      return;
    }
    if (!value) {
      callback(new Error('請設定登入密碼'));
      return;
    }
    if (String(value).length < MIN_PASSWORD_LENGTH) {
      callback(new Error(`密碼至少需 ${MIN_PASSWORD_LENGTH} 碼`));
      return;
    }
    callback();
  };
  const basicFormRules = computed(() => {
    const requirePassword = !isEditing.value;
    const requireIdentity = !isEditing.value;
    const isDriver = basicForm.value.jobType === 'DRIVER';
    const requireDriverFields = !isEditing.value && isDriver;

    return {
      fullName: [{ required: true, message: t('fullNameRequired'), trigger: 'blur' }],
      username: [...(requireIdentity ? [{ required: true, message: t('usernameRequired'), trigger: 'blur' }] : [])],
      email: [...(requireIdentity ? [{ required: true, message: t('emailRequired'), trigger: ['blur', 'change'] }] : []), { validator: emailValidator, trigger: ['blur', 'change'] }],
      role: [{ required: true, message: t('roleRequired'), trigger: 'change' }],
      hireDate: [{ required: true, message: t('pleaseSelect'), trigger: 'change' }],
      password: [{ validator: passwordValidator(requirePassword), trigger: 'blur' }],
      jobType: [{ required: true, message: t('jobTypeRequired'), trigger: 'change' }],
      licenseNumber: [...(requireDriverFields ? [{ required: true, message: t('licenseNumberRequired'), trigger: 'blur' }] : [])],
      licenseExpiry: [...(requireDriverFields ? [{ required: true, message: t('licenseExpiryRequired'), trigger: 'change' }] : [])],
    };
  });
  const resetForm = () => {
    basicForm.value = initializeForm();
    basicFormRef.value?.clearValidate?.();
  };
  const getDataInfo = (user) => {
    const primaryRole = Array.isArray(user.roles) ? user.roles[0] || null : user.roles || null;
    basicForm.value = {
      ...initializeForm(),
      fullName: user.fullName,
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      jobType: user.jobType || '',
      idNumber: user.idNumber || '',
      birthday: user.birthday ? formatDate(user.birthday, 'YYYY-MM-DD') : '',
      hireDate: user.hireDate ? formatDate(user.hireDate, 'YYYY-MM-DD') : user.createdAt ? formatDate(user.createdAt) : '',
      role: primaryRole || null,
      isActive: user.isActive !== false && user.status !== 'INACTIVE',
      avatar: user.avatar || '',
    };
  };
  const getData = async (id) => {
    if (!id) return;
    mainStore.setLoading(true);
    try {
      const response = await UserGetByID(id);
      const detail = response?.data?.data ?? response?.data ?? response;
      if (detail) getDataInfo(detail);
    } catch (error) {
      await mainStore.SWAL_Error(error);
    } finally {
      mainStore.setLoading(false);
    }
  };
  const openCreateDialog = () => {
    dialogMode.value = 'create';
    editingId.value = null;
    resetForm();
    dialogVisible.value = true;
  };
  const editData = (employee) => {
    if (!employee?.id) return;
    dialogMode.value = 'edit';
    editingId.value = employee.id;
    getDataInfo(employee.raw || employee);
    dialogVisible.value = true;
    getData(employee.id);
  };
  const closeDialog = () => {
    isSaving.value = false;
    dialogVisible.value = false;
    basicFormRef.value?.clearValidate?.();
  };
  const generateDriverEmployeeId = (email) => {
    const prefix = email?.split('@')[0] || 'driver';
    const timestamp = Date.now();
    return `${prefix}_${timestamp}`;
  };
  const preparePayload = (isUpdate) => {
    const formState = basicForm.value;
    const resolvedRole = formState.role;
    const payload = {
      ...trimFields(formState, ['fullName', 'phone', 'address', 'jobType', 'idNumber']),
      birthday: formState.birthday,
      hireDate: formState.hireDate,
      roleIds: [resolvedRole.id] || '',
      roleNames: [resolvedRole.name] || '',
    };

    if (formState.birthday === '') delete payload.birthday;

    if (!isUpdate) {
      payload.email = formState.email?.trim();
      payload.password = formState.password;

      //新增時，若為司機則加入 driverInfo
      if (formState.jobType === 'DRIVER') {
        payload.driverInfo = {
          employeeId: generateDriverEmployeeId(formState.email),
          licenseNumber: formState.licenseNumber?.trim() || '',
          licenseExpiry: formState.licenseExpiry || null,
        };
      }
    }

    if (isUpdate) {
      //if (formState.password) payload.password = formState.password;
      payload.isActive = Boolean(formState.isActive);
      payload.avatar = formState.avatar?.trim() || '';
    }

    return payload;
  };
  const updateAvatar = async (userId, avatarUrl) => {
    if (!avatarUrl || !userId) return;

    try {
      await UserUpdatePatch(userId, { avatar: avatarUrl });
    } catch (error) {
      await mainStore.SWAL_Error(error);
    }
  };
  const _submitForm = async () => {
    const validateResult = await basicFormRef.value.validate();
    if (validateResult) return false;

    const isUpdate = Boolean(editingId.value);
    const payload = preparePayload(isUpdate);
    if (!payload) return;

    try {
      isSaving.value = true;

      if (isCreate.value) {
        const createResponse = await UserCreatePost(payload);
        const createdUser = createResponse?.data?.data ?? createResponse?.data ?? createResponse;
        const createdUserId = createdUser?.id;

        const avatarValue = basicForm.value.avatar?.trim();
        await updateAvatar(createdUserId, avatarValue);
      }
      if (isEdite.value) {
        await UserUpdatePatch(editingId.value, payload);
      }

      await mainStore.SWAL_Success(t('saveSuccess'));
      await getAPI();
      closeDialog();
    } catch (error) {
      await mainStore.SWAL_Error(error);
      isSaving.value = false;
    }
  };
  const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });
  const deleteData = async (id) => {
    if (!id) return;
    await mainStore.SWAL_DeleteConfirm({
      onConfirm: async () => {
        try {
          await UserDeleteById(id);
          await mainStore.SWAL_Success(t('deleteSuccess'));
          if (basicDataList.value.length === 1 && pagination.value.page > 1) pagination.value.page -= 1;
          await getAPI();
        } catch (error) {
          await mainStore.SWAL_Error(error);
        }
      },
    });
  };

  /** 圖片相關 **/
  const imagePickerVisible = ref(false);
  const photoPreview = ref(false);
  const photoSrc = ref('');
  const openPhoto = () => {
    photoSrc.value = basicForm.value.avatar;
    photoPreview.value = true;
  };
  const visibleChange = (v) => {
    photoPreview.value = v;
  };
  const openImagePicker = () => {
    imagePickerVisible.value = true;
  };
  const clearAvatar = () => {
    basicForm.value.avatar = '';
  };
  const uploadImageViaApi = async (file) => {
    if (!file) return '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'user-avatar');

    const response = await dataList.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileInfo = response?.data?.data?.data ?? response?.data?.data ?? response?.data;
    const fileUrl = fileInfo?.url || fileInfo?.thumbnailUrl;

    if (!fileUrl) throw new Error('未取得圖片網址');
    return fileUrl;
  };

  return {
    MAX_AVATAR_SIZE,
    MIN_PASSWORD_LENGTH,
    userPhoto,
    jobTypeOptions,
    statusFilterOptions,
    jobTypeFilterOptions,
    formatDate,
    getJobTypeLabel,

    //篩選相關
    sortField,
    sortDirection,
    searchFields,
    filters,
    getColumnOrder,
    handleColumnSort,
    handleFilterChange,
    clearFilter,
    clearHireDateFilter,

    //列表相關
    basicDataList,
    pagination,
    pageSizeOptions,
    getAPI,
    CurrentChange,
    SizeChange,

    //新增編輯相關
    dialogMode,
    editingId,
    dialogVisible,
    isSaving,
    basicFormRef,
    isCreate,
    isEdite,
    isEditing,
    basicForm,
    basicFormRules,
    resetForm,
    openCreateDialog,
    editData,
    closeDialog,
    saveData,
    deleteData,

    //圖片相關
    imagePickerVisible,
    photoPreview,
    photoSrc,
    openPhoto,
    visibleChange,
    openImagePicker,
    clearAvatar,
    uploadImageViaApi,
  };
}
