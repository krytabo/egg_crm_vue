// src/pages/BasicInfo/Customer/BasePage/useBasePage.js
// 客戶/潛在客戶管理 - 共用業務邏輯（Desktop / Mobile 共用）

import { computed, reactive, ref, watch, toRaw } from 'vue';
import { OrderListGet } from '@/assets/API/Order';
import { CustomersListGet, CustomersCreatePost, CustomersUpdatePatch, CustomersDeleteById, CustomersGetByID, CustomersImportExcel } from '@/assets/API/Customers';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { mockProducts } from '@/lib/mock-products';
import { orderStatusColors } from '@/lib/mock-orders';

/**
 * 客戶/潛在客戶管理共用邏輯
 * @param {Object} props - 元件 props（需包含 pageType）
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 */
export function useBasePage(props, t, showMessage = () => {}) {
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();
  const currencyStore = useCurrencyStore();
  const { formatCurrencyNumber } = currencyStore;
  const {
    customerCategories,
    paymentOptions,
    customerTypeOptions,
    customerSegmentOptions,
    customerSourceOptions,
    customerStatusOptions,
    weekDayOptions,
    statusColorMap,
    buildLabelMap,
    buildSelectOptionsWithAll,
    formatWeekDays,
  } = useSelectOptions();

  // ===== 頁面類型判斷 =====
  const isProspect = computed(() => props.pageType === 'prospect');
  const defaultStatus = computed(() => (isProspect.value ? 'PROSPECT' : 'ACTIVE'));

  // ===== 常數 =====
  const EMPTY_PLACEHOLDER = '未設定';
  const orderPageSizeOptions = [5, 10, 20];
  const FORM_TEMPLATES = {
    contact: { isPrimary: true, name: '', phone: '', address: '', email: '' },
    company: { companyName: '', companyPhone: '', companyEmail: '', companyAddress: '', taxId: '', registeredDate: '' },
    other: { paymentMethod: t('cash', '現金'), deposit: '', invoiceTitle: '', invoiceTaxId: '', note: '' },
    meta: { type: 'COMPANY', segment: 'RETAIL', source: 'OTHER', salesRepId: '', tags: '', status: 'ACTIVE' },
  };
  const SORT_FIELD_MAP = {
    name: 'name',
    type: 'type',
    segment: 'segment',
    source: 'source',
    salesRepId: 'salesRepId',
    createdAt: 'createdAt',
    status: 'status',
  };

  const getDefaultMeta = () => ({ ...FORM_TEMPLATES.meta, status: props.pageType === 'prospect' ? 'PROSPECT' : 'ACTIVE' });

  // ===== 選項相關 =====
  const typeLabelMap = computed(() => buildLabelMap(customerTypeOptions.value));
  const segmentLabelMap = computed(() => buildLabelMap(customerSegmentOptions.value));
  const sourceLabelMap = computed(() => buildLabelMap(customerSourceOptions.value));
  const statusLabelMap = computed(() => buildLabelMap(customerStatusOptions.value));
  const typeFilterOptions = computed(() => buildSelectOptionsWithAll(customerTypeOptions.value));
  const segmentFilterOptions = computed(() => buildSelectOptionsWithAll(customerSegmentOptions.value));
  const sourceFilterOptions = computed(() => buildSelectOptionsWithAll(customerSourceOptions.value));
  const statusFilterOptions = computed(() => customerStatusOptions.value);

  // ===== 共用工具函式 =====
  const currency = (val) => formatCurrencyNumber(val);
  const getPrimaryContact = (customer) => customer.contacts?.find((c) => c.isPrimary) || customer.contacts?.[0];
  const findProductById = (productId) => mockProducts.find((item) => item.id === productId) || null;
  const parseTagsInput = (value) =>
    String(value || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  const formatDateValue = (value) => {
    if (!value) return '—';
    return timezoneStore.formatDate(value, 'YYYY-MM-DD') || '—';
  };
  const toggleArrayItem = (array, item) => (array.includes(item) ? array.filter((i) => i !== item) : [...array, item]);

  // ===== 訂單資料轉換 =====
  const orderResponseDataToList = (item = {}) => ({
    id: item.id,
    orderNumber: item.orderNumber,
    targetType: item.targetType || '客戶',
    targetName: item.targetName || item.customer?.name || EMPTY_PLACEHOLDER,
    phone: item.phone || EMPTY_PLACEHOLDER,
    contact: item.contact || EMPTY_PLACEHOLDER,
    paymentMethod: item.paymentMethod || EMPTY_PLACEHOLDER,
    shipMethod: item.shipMethod || EMPTY_PLACEHOLDER,
    employeeName: item.employeeName || EMPTY_PLACEHOLDER,
    totalAmount: item.totalAmount ?? item.totalAmount?.amount ?? 0,
    discount: item.discount ?? 0,
    shippingFee: item.shippingFee ?? 0,
    status: item.status,
    statusLabel: item.status,
    orderDate: item.orderDate,
    shipDate: item.shipDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    raw: item,
  });

  // ===== 篩選與查詢相關 =====
  const globalSearch = ref('');
  const sortField = ref('createdAt');
  const sortDirection = ref('desc');

  const getDefaultFilters = () => ({
    type: 'all',
    segment: 'all',
    source: 'all',
    status: props.pageType === 'prospect' ? 'PROSPECT' : 'ACTIVE',
    salesRepId: '',
    tags: '',
  });

  const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');

  const handleColumnSort = async ({ field, order }) => {
    if (!field) return;
    if (!order) {
      sortField.value = 'createdAt';
      sortDirection.value = 'desc';
    } else {
      sortField.value = field;
      sortDirection.value = order;
    }
    await getAPI();
  };

  const clearGlobalSearch = async () => {
    if (!globalSearch.value) return;
    globalSearch.value = '';
    await handleGlobalSearch();
  };

  // ===== 列表資料取得相關 =====
  const responseDataToList = (customer = {}) => {
    const customFields = customer.customFields || {};
    const contacts = (
      customFields.contacts?.length
        ? customFields.contacts
        : [
            {
              id: 1,
              isPrimary: true,
              name: customer.contactInfo?.name || customer.name || t('unnamedCustomer', '未命名客戶'),
              phone: customer.contactInfo?.phone || '',
              address: [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(' '),
              email: customer.contactInfo?.email || '',
            },
          ]
    ).map((contact, index) => ({
      id: contact.id ?? index + 1,
      isPrimary: contact.isPrimary ?? index === 0,
      name: contact.name || '',
      phone: contact.phone || '',
      address: contact.address || '',
      email: contact.email || '',
    }));

    return {
      id: customer.id || customer.code || `customer-${Date.now()}`,
      displayCode: customer.code || customer.id,
      type: customer.type || 'COMPANY',
      segment: customer.segment || 'RETAIL',
      source: customer.source || 'OTHER',
      salesRepId: customer.salesRep || '',
      contacts,
      companyName: customer.name || '—',
      companyPhone: customer.contactInfo?.phone || '',
      companyEmail: customer.contactInfo?.email || '',
      companyAddress:
        customFields.companyAddress || [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(' '),
      companyAddressFields: customer.address || {},
      taxId: customer.taxId || '',
      categories: customFields.categories || [],
      paymentMethod: customFields.paymentMethod || '',
      deposit: Number(customFields.deposit ?? 0),
      invoiceTitle: customFields.invoiceTitle || customer.name || '',
      invoiceTaxId: customFields.invoiceTaxId || customer.taxId || '',
      note: customer.notes || '',
      registeredDate: (customFields.registeredDate || customer.createdAt || '').split('T')[0] || '',
      deliveryDays: customer.deliveryDays || [],
      customPrices: customFields.customPrices || [],
      status: customer.status || defaultStatus.value,
      tags: Array.isArray(customer.tags) ? customer.tags : [],
      createdAt: customer.createdAt || '',
      createdAtDisplay: formatDateValue(customer.createdAt),
      orderLookupId: customFields.orderLookupId || customer.id || customer.code,
      raw: customer,
    };
  };

  const wrappedCustomersListGet = (params) => {
    const rawParams = toRaw(params);
    const processedParams = {};

    Object.keys(rawParams).forEach((key) => {
      const value = rawParams[key];
      processedParams[key] = typeof value === 'object' && value !== null ? toRaw(value) : value;
    });

    const searchTerm = globalSearch.value?.trim();
    if (searchTerm) processedParams.search = searchTerm;
    if (params.tags) {
      const tagFilters = parseTagsInput(params.tags);
      if (tagFilters.length) {
        processedParams.tags = tagFilters;
      } else {
        delete processedParams.tags;
      }
    }
    if (sortField.value) {
      processedParams.sortBy = SORT_FIELD_MAP[sortField.value] || sortField.value;
      processedParams.sortOrder = sortDirection.value;
    }
    if (isProspect.value) {
      processedParams.status = 'PROSPECT';
    }
    return CustomersListGet(processedParams);
  };

  const {
    basicDataList,
    filters,
    pagination,
    pageSizeOptions,
    getDefaultAPI,
    handleGlobalSearch,
    handleFiltersChange,
    clearFilter: clearFilterBase,
    CurrentChange,
    SizeChange,
  } = usePaginatedSearchApi(wrappedCustomersListGet, getDefaultFilters(), {
    responseDataToList,
  });

  const totalCustomers = computed(() => pagination.total);
  const getAPI = () => getDefaultAPI();

  const clearFilter = async () => {
    globalSearch.value = '';
    clearFilterBase();
  };

  // 監聽篩選條件變化
  watch(() => [filters.type, filters.segment, filters.source, filters.status], handleFiltersChange);

  // ===== 匯入下載模板相關 =====
  const fileInputRef = ref(null);

  const handleImportSelect = (value) => {
    if (value === 'Import') {
      fileInputRef.value?.click();
    } else if (value === 'Download') {
      // 下載客戶資料模板
      const link = document.createElement('a');
      link.href = '/客戶資料模板.xlsx';
      link.download = '客戶資料模板.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      mainStore.setLoading(true);
      await CustomersImportExcel(formData);
      await mainStore.SWAL_Success(t('swal.importSuccess'));
      await getAPI();
    } catch (error) {
      await mainStore.SWAL_Error(error);
    } finally {
      mainStore.setLoading(false);
    }
    event.target.value = '';
  };

  // ===== 新增編輯相關 =====
  const dialogMode = ref('create');
  const dialogVisible = ref(false);
  const activeTab = ref('infoData');
  const editingCustomerId = ref(null);
  const isSaving = ref(false);
  const detailLoading = ref(false);
  const sameAsCompanyInfo = ref(false);
  const basicFormRef = ref(null);
  const basicFormRules = {};

  const isCreate = computed(() => dialogMode.value === 'create');
  const isEdite = computed(() => dialogMode.value === 'edit');

  const initializeForm = () => ({
    contactsForm: [{ ...FORM_TEMPLATES.contact }],
    companyForm: { ...FORM_TEMPLATES.company },
    otherForm: { ...FORM_TEMPLATES.other },
    metaForm: getDefaultMeta(),
  });

  const basicForm = ref(initializeForm());
  const categoriesForm = ref([]);
  const deliveryDaysForm = ref([]);
  const customPriceForm = ref([]);

  const resetForm = () => {
    basicForm.value = initializeForm();
    categoriesForm.value = [];
    deliveryDaysForm.value = [];
    customPriceForm.value = [];
    activeTab.value = 'infoData';
    basicFormRef.value?.clearValidate?.();
    sameAsCompanyInfo.value = false;
  };

  const fillFormFromRecord = (record = {}) => {
    basicForm.value.contactsForm = (record.contacts?.length ? record.contacts : [{ isPrimary: true, name: '', phone: '', address: '', email: '' }]).map((contact, index) => ({
      id: contact.id ?? index + 1,
      isPrimary: contact.isPrimary ?? index === 0,
      name: contact.name || '',
      phone: contact.phone || '',
      address: contact.address || '',
      email: contact.email || '',
    }));
    basicForm.value.companyForm = {
      companyName: record.companyName || '',
      companyPhone: record.companyPhone || '',
      companyEmail: record.companyEmail || '',
      companyAddress: record.companyAddress || '',
      taxId: record.taxId || '',
      registeredDate: record.registeredDate || '',
    };
    basicForm.value.otherForm = {
      paymentMethod: record.paymentMethod || '月結',
      deposit: Number(record.deposit ?? 0),
      invoiceTitle: record.invoiceTitle || '',
      invoiceTaxId: record.invoiceTaxId || '',
      note: record.note || '',
    };
    basicForm.value.metaForm = {
      type: record.type || FORM_TEMPLATES.meta.type,
      segment: record.segment || FORM_TEMPLATES.meta.segment,
      source: record.source || FORM_TEMPLATES.meta.source,
      salesRepId: record.salesRepId || '',
      tags: Array.isArray(record.tags) ? record.tags.join(',') : record.tags || '',
      status: record.status || FORM_TEMPLATES.meta.status,
    };
    categoriesForm.value = record.categories || [];
    deliveryDaysForm.value = record.deliveryDays || [];
    customPriceForm.value = (record.customPrices || []).map((item, index) => {
      const product = item.product || null;
      const productId = product?.id || item.productId || '';
      const basePriceAmount = Number(product?.basePriceAmount ?? item.basePriceAmount ?? 0);
      const finalPrice = Number(item.price ?? 0);
      const adjustment = finalPrice ? finalPrice - basePriceAmount : Number(item.adjustment ?? 0);
      return {
        id: item.id ?? index + 1,
        productId: product || productId,
        basePriceAmount,
        adjustment,
      };
    });
  };

  const handleInvoiceSameAsCompany = (checked) => {
    sameAsCompanyInfo.value = checked;
    if (!checked) return;
    const companyForm = basicForm.value.companyForm || {};
    const otherForm = basicForm.value.otherForm || {};
    otherForm.invoiceTitle = companyForm.companyName || '';
    otherForm.invoiceTaxId = companyForm.taxId || '';
  };

  const getData = async (id) => {
    if (!id) return;
    detailLoading.value = true;
    try {
      const response = await CustomersGetByID(id);
      const detail = response?.data?.data ?? response?.data ?? response;
      if (detail) fillFormFromRecord(responseDataToList(detail));
    } catch (error) {
      console.error(error);
      await mainStore.SWAL_Error(error);
    } finally {
      detailLoading.value = false;
    }
  };

  const openCreateDialog = () => {
    dialogMode.value = 'create';
    editingCustomerId.value = null;
    resetForm();
    dialogVisible.value = true;
  };

  const editData = (customer) => {
    dialogMode.value = 'edit';
    editingCustomerId.value = customer.id;
    fillFormFromRecord(customer);
    activeTab.value = 'infoData';
    dialogVisible.value = true;
    getData(customer.id);
  };

  const closeDialog = () => {
    isSaving.value = false;
    dialogVisible.value = false;
    basicFormRef.value?.clearValidate?.();
  };

  const deleteData = async (id) => {
    if (!id) return;
    await mainStore.SWAL_DeleteConfirm({
      onConfirm: async () => {
        mainStore.setLoading(true);
        try {
          await CustomersDeleteById(id);
          await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
          if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
          await getAPI();
        } catch (error) {
          await mainStore.SWAL_Error(error);
        } finally {
          mainStore.setLoading(false);
        }
      },
    });
  };

  // 聯絡人操作
  const addContact = () => {
    const nextItem = { ...FORM_TEMPLATES.contact, isPrimary: false, id: Date.now() };
    basicForm.value.contactsForm.push(nextItem);
  };

  const removeContact = (index) => {
    if (basicForm.value.contactsForm.length === 1) return;
    basicForm.value.contactsForm = basicForm.value.contactsForm.filter((_, i) => i !== index);
    if (!basicForm.value.contactsForm.some((contact) => contact.isPrimary) && basicForm.value.contactsForm.length) {
      basicForm.value.contactsForm[0].isPrimary = true;
    }
  };

  const setPrimaryContact = (index) => {
    basicForm.value.contactsForm = basicForm.value.contactsForm.map((contact, i) => ({ ...contact, isPrimary: i === index }));
  };

  // 客製價格操作
  const changeProduct = (product, index) => {
    if (!product) return;
    const item = customPriceForm.value[index];
    if (!item) return;
    item.basePriceAmount = Number(product.basePriceAmount) || 0;
  };

  const addCustomPrice = () => {
    customPriceForm.value.push({
      id: Date.now(),
      productId: '',
      basePriceAmount: 0,
      adjustment: 0,
      total: 0,
    });
  };

  const removeCustomPrice = (id) => {
    customPriceForm.value = customPriceForm.value.filter((item) => item.id !== id);
  };

  const preparePayload = () => {
    const formContacts = basicForm.value.contactsForm.length ? basicForm.value.contactsForm : [{ ...FORM_TEMPLATES.contact }];
    const primaryContact = formContacts.find((contact) => contact.isPrimary) || formContacts[0];
    const companyForm = basicForm.value.companyForm;
    const otherForm = basicForm.value.otherForm;
    const metaForm = basicForm.value.metaForm || FORM_TEMPLATES.meta;
    const processedCustomPrices = customPriceForm.value
      .filter((item) => item.productId)
      .map((item) => ({
        productId: typeof item.productId === 'object' ? item.productId?.id : item.productId,
        price: (Number(item.basePriceAmount) || 0) + (Number(item.adjustment) || 0),
      }))
      .filter((item) => item.productId);

    const payload = {
      name: companyForm.companyName || primaryContact?.name || t('unnamedCustomer', '未命名客戶'),
      type: metaForm.type || FORM_TEMPLATES.meta.type,
      segment: metaForm.segment || FORM_TEMPLATES.meta.segment,
      source: metaForm.source || FORM_TEMPLATES.meta.source,
      contactInfo: {
        phone: companyForm.companyPhone || primaryContact?.phone || undefined,
        email: companyForm.companyEmail || primaryContact?.email || undefined,
      },
      taxId: companyForm.taxId || undefined,
      notes: otherForm.note || undefined,
      salesRepId: typeof metaForm.salesRepId === 'object' ? metaForm.salesRepId?.id : metaForm.salesRepId || undefined,
      deliveryDays: deliveryDaysForm.value,
      customFields: {
        contacts: formContacts,
        categories: categoriesForm.value,
        paymentMethod: otherForm.paymentMethod,
        deposit: Number(otherForm.deposit || 0),
        invoiceTitle: otherForm.invoiceTitle,
        invoiceTaxId: otherForm.invoiceTaxId,
        customPrices: processedCustomPrices,
        registeredDate: companyForm.registeredDate,
        companyAddress: companyForm.companyAddress,
      },
    };
    const tagValues = parseTagsInput(metaForm.tags);
    if (tagValues.length) payload.tags = tagValues;

    if (isCreate.value && isProspect.value) {
      payload.status = 'PROSPECT';
    } else if (isEdite.value && metaForm.status) {
      payload.status = metaForm.status;
    }
    return payload;
  };

  const _submitForm = async () => {
    const validateResult = await basicFormRef.value?.validate();
    if (validateResult) return false;
    try {
      const payload = preparePayload();
      isSaving.value = true;
      if (isCreate.value) await CustomersCreatePost(payload);
      if (isEdite.value) await CustomersUpdatePatch(editingCustomerId.value, payload);

      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
      await getAPI();
      closeDialog();
    } catch (error) {
      await mainStore.SWAL_Error(error);
    }
  };

  const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });

  // ===== 訂單相關（僅客戶頁面使用） =====
  const customerData = ref(false);
  const drawerVisible = ref(false);
  const drawerCustomer = ref(null);
  const orderList = ref([]);
  const orderPagination = reactive({ page: 1, limit: 20, total: 0 });

  const openCustomerData = () => (customerData.value = !customerData.value);

  const openDrawer = async (customer) => {
    drawerCustomer.value = customer;
    orderPagination.page = 1;
    await loadCustomerOrders(customer.id);
    drawerVisible.value = true;
  };

  const loadCustomerOrders = async (customerId) => {
    mainStore.setLoading(true);
    const response = await OrderListGet({ customerId, page: orderPagination.page, limit: orderPagination.limit });
    const rawData = response?.data?.data?.data ?? [];
    const metaInfo = response?.data?.data?.pagination ?? {};
    orderList.value = Array.isArray(rawData) ? rawData.map(orderResponseDataToList) : [];
    orderPagination.total = metaInfo.total ?? orderList.value.length;
    orderPagination.page = metaInfo.page ?? orderPagination.page;
    mainStore.setLoading(false);
  };

  const handleOrderPageChange = async (page) => {
    orderPagination.page = page;
    await loadCustomerOrders(drawerCustomer.value.id);
  };

  const handleOrderPageSizeChange = async (size) => {
    orderPagination.limit = Number(size);
    orderPagination.page = 1;
    await loadCustomerOrders(drawerCustomer.value.id);
  };

  // ===== Mock 假資料產生（開發用） =====
  const randomPhone = () => `09${Math.floor(Math.random() * 90000000 + 10000000)}`;

  const generateFakeCustomer = () => {
    const seed = Date.now();
    basicForm.value.contactsForm = [
      { isPrimary: true, name: `聯絡人${seed % 100}`, phone: randomPhone(), address: '台北市中正區', email: `contact${seed}@example.com` },
      { isPrimary: false, name: `助理${seed % 50}`, phone: randomPhone(), address: '台北市信義區', email: `assistant${seed}@example.com` },
    ];
    basicForm.value.companyForm.companyName = `測試有限公司 ${seed % 1000}`;
    basicForm.value.companyForm.companyPhone = '02-1234-5678';
    basicForm.value.companyForm.companyEmail = `company${seed}@mail.com`;
    basicForm.value.companyForm.companyAddress = '台北市信義區忠孝東路 100 號';
    basicForm.value.companyForm.taxId = `${Math.floor(Math.random() * 90000000 + 10000000)}`;
    basicForm.value.companyForm.registeredDate = format(new Date(), 'yyyy-MM-dd');
    basicForm.value.otherForm.paymentMethod = '月結';
    basicForm.value.otherForm.deposit = 20000;
    basicForm.value.otherForm.invoiceTitle = `${basicForm.value.companyForm.companyName} 發票抬頭`;
    basicForm.value.otherForm.invoiceTaxId = basicForm.value.companyForm.taxId;
    basicForm.value.otherForm.note = '此為快速產生的測試資料';
    categoriesForm.value = customerCategories;
    deliveryDaysForm.value = [1, 3, 5];
    customPriceForm.value = [{ id: Date.now(), productId: mockProducts[0]?.id || 'water-1', adjustment: 200 }];
    basicForm.value.metaForm = {
      ...FORM_TEMPLATES.meta,
      type: 'COMPANY',
      segment: 'WHOLESALE',
      source: 'REFERRAL',
      salesRepId: `sales-${seed % 10}`,
      tags: 'VIP,重點客戶',
      status: defaultStatus.value,
    };
  };

  return {
    // 頁面類型
    isProspect,
    defaultStatus,

    // 常數
    EMPTY_PLACEHOLDER,
    orderPageSizeOptions,
    FORM_TEMPLATES,
    orderStatusColors,

    // 選項
    customerCategories,
    paymentOptions,
    customerTypeOptions,
    customerSegmentOptions,
    customerSourceOptions,
    customerStatusOptions,
    weekDayOptions,
    statusColorMap,
    typeLabelMap,
    segmentLabelMap,
    sourceLabelMap,
    statusLabelMap,
    typeFilterOptions,
    segmentFilterOptions,
    sourceFilterOptions,
    statusFilterOptions,

    // 工具函式
    currency,
    getPrimaryContact,
    findProductById,
    formatDateValue,
    formatWeekDays,
    toggleArrayItem,

    // 篩選相關
    globalSearch,
    sortField,
    sortDirection,
    filters,
    getColumnOrder,
    handleColumnSort,
    clearGlobalSearch,
    clearFilter,
    handleGlobalSearch,
    handleFiltersChange,

    // 列表相關
    basicDataList,
    pagination,
    pageSizeOptions,
    totalCustomers,
    getAPI,
    CurrentChange,
    SizeChange,

    // 匯入相關
    fileInputRef,
    handleImportSelect,
    handleFileChange,

    // 新增編輯相關
    dialogMode,
    dialogVisible,
    activeTab,
    editingCustomerId,
    isSaving,
    detailLoading,
    sameAsCompanyInfo,
    basicFormRef,
    basicFormRules,
    isCreate,
    isEdite,
    basicForm,
    categoriesForm,
    deliveryDaysForm,
    customPriceForm,
    resetForm,
    openCreateDialog,
    editData,
    closeDialog,
    deleteData,
    saveData,
    handleInvoiceSameAsCompany,

    // 聯絡人操作
    addContact,
    removeContact,
    setPrimaryContact,

    // 客製價格操作
    changeProduct,
    addCustomPrice,
    removeCustomPrice,

    // 訂單相關
    customerData,
    drawerVisible,
    drawerCustomer,
    orderList,
    orderPagination,
    openCustomerData,
    openDrawer,
    loadCustomerOrders,
    handleOrderPageChange,
    handleOrderPageSizeChange,

    // Mock 資料
    generateFakeCustomer,
  };
}
