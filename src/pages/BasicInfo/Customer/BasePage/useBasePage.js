// src/pages/BasicInfo/Customer/BasePage/useBasePage.js 客戶/潛在客戶管理共用邏輯
import { computed, reactive, ref, watch, toRaw } from 'vue';
import { OrderListGet } from '@/assets/API/Order';
import {
  CustomersListGet,
  CustomersCreatePost,
  CustomersUpdatePatch,
  CustomersDeleteById,
  CustomersGetByID,
  CustomersImportExcel,
  CustomersStoredGetByID,
  CustomersStoredCreatePost,
  CustomersStoredUpdatePatch,
  CustomersStoredDeleteById,
} from '@/assets/API/Customers';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';
import { getUserInfo } from '@/utils/auth';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { mockProducts } from '@/lib/mock-products';
import { orderStatusColors } from '@/lib/mock-orders';
import { CATEGORY_IDS } from '@/constants/categories';

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
    orderStatusLabelMap,
    orderStatusDisplayMap,
  } = useSelectOptions();

  //頁面判斷相關
  const isProspect = computed(() => props.pageType === 'prospect');
  const defaultStatus = computed(() => (isProspect.value ? 'PROSPECT' : 'ACTIVE'));

  const EMPTY_PLACEHOLDER = '未設定';
  const orderPageSizeOptions = [5, 10, 20];
  const FORM_TEMPLATES = {
    contact: { isPrimary: true, sameAsCompanyName: false, name: '', phone: '', address: '', email: '' },
    company: { companyName: '', companyPhone: '', companyEmail: '', companyAddress: '', taxId: '', registeredDate: '' },
    other: { paymentMethod: 'CASH', deposit: '', invoiceTitle: '', invoiceTaxId: '', note: '' },
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

  //選項相關
  const typeLabelMap = computed(() => buildLabelMap(customerTypeOptions.value));
  const segmentLabelMap = computed(() => buildLabelMap(customerSegmentOptions.value));
  const sourceLabelMap = computed(() => buildLabelMap(customerSourceOptions.value));
  const statusLabelMap = computed(() => buildLabelMap(customerStatusOptions.value));
  const typeFilterOptions = computed(() => buildSelectOptionsWithAll(customerTypeOptions.value));
  const segmentFilterOptions = computed(() => buildSelectOptionsWithAll(customerSegmentOptions.value));
  const sourceFilterOptions = computed(() => buildSelectOptionsWithAll(customerSourceOptions.value));
  const statusFilterOptions = computed(() => customerStatusOptions.value);
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

  // 根據訂單類型或商品推導 categoryId
  const inferCategoryId = (item = {}) => {
    // 優先使用 API 返回的 categoryId
    if (item.categoryId) return item.categoryId;

    // 次選：根據 mock 數據中的 type 字段推導
    if (item.type) {
      const typeMap = {
        egg: CATEGORY_IDS.EGG,
        water: CATEGORY_IDS.WATER,
        dispenser: CATEGORY_IDS.DISPENSER,
      };
      return typeMap[item.type] || null;
    }

    // 最後：根據商品分類推導（如果有 products 數據）
    if (item.products && item.products.length > 0) {
      const firstProduct = item.products[0];
      // 假設首個商品包含 categoryId 字段
      if (firstProduct.categoryId) return firstProduct.categoryId;
    }

    return null;
  };

  const orderResponseDataToList = (item = {}) => {
    const statusKey = orderStatusLabelMap[item.status] || item.status; //後端中文 → 英文 key
    return {
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
      status: statusKey,
      statusLabel: orderStatusDisplayMap.value[statusKey] || item.status, //英文 key → 前端顯示文字
      orderDate: item.orderDate,
      shipDate: item.shipDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      products: item.products || [], //訂單商品明細
      categoryId: inferCategoryId(item), // 商品分類 ID（用於訂單分類）
      raw: item,
    };
  }; //訂單資料轉換

  //篩選與查詢相關
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

  //列表資料取得相關
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
      categories: customer.productCategories || [],
      paymentMethod: customer.paymentTerm || '',
      deposit: Number(customFields.deposit ?? 0),
      invoiceTitle: customFields.invoiceTitle ?? '',
      invoiceTaxId: customFields.invoiceTaxId ?? '',
      note: customer.notes || '',
      registeredDate: (customFields.registeredDate ?? '').split('T')[0] || '',
      deliveryDays: customer.deliveryDays || [],
      customPrices: customFields.customPrices || [],
      status: customer.status || defaultStatus.value,
      tags: Array.isArray(customer.tags) ? customer.tags : [],
      createdAt: customer.createdAt || '',
      createdAtDisplay: formatDateValue(customer.createdAt),
      orderLookupId: customFields.orderLookupId || customer.id || customer.code,
      customFields, // 保留原始 customFields 供 fillFormFromRecord 讀取
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
  watch(() => [filters.type, filters.segment, filters.source, filters.status], handleFiltersChange);

  //匯入下載模板相關
  const fileInputRef = ref(null);
  const handleImportSelect = (value) => {
    if (value === 'Import') {
      fileInputRef.value?.click();
    } else if (value === 'Download') {
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

  //新增編輯相關
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
  const basicForm = ref(initializeForm()); //基本資料
  const categoriesForm = ref([]); //客戶類別
  const deliveryDaysForm = ref([]); //出貨星期
  const customPriceForm = ref([]); //商品價格調整
  const waterDepositsForm = ref([]); //儲值管理
  const _originalDepositIds = ref(new Set()); // 記錄從 API 取得的儲值 ID，用於判斷新增/更新/刪除
  const resetForm = () => {
    basicForm.value = initializeForm(); //基本資料
    categoriesForm.value = []; //客戶類別
    deliveryDaysForm.value = []; //出貨星期
    customPriceForm.value = []; //商品價格調整
    waterDepositsForm.value = []; //儲值管理
    _originalDepositIds.value = new Set(); //儲值管理原始ID
    activeTab.value = 'infoData';
    basicFormRef.value?.clearValidate?.();
    sameAsCompanyInfo.value = false;
  };
  const fillFormFromRecord = (record = {}) => {
    basicForm.value.contactsForm = (record.contacts?.length ? record.contacts : [{ isPrimary: true, sameAsCompanyName: false, name: '', phone: '', address: '', email: '' }]).map((contact, index) => ({
      id: contact.id ?? index + 1,
      isPrimary: contact.isPrimary ?? index === 0,
      sameAsCompanyName: false,
      name: contact.name || '',
      phone: contact.phone || '',
      address: contact.address || '',
      email: contact.email || '',
    })); //聯絡人
    basicForm.value.companyForm = {
      companyName: record.companyName || '',
      companyPhone: record.companyPhone || '',
      companyEmail: record.companyEmail || '',
      companyAddress: record.companyAddress || '',
      taxId: record.taxId || '',
      registeredDate: record.registeredDate || '',
    }; //公司資料

    //付款方式轉換
    const paymentMethodMap = { 現金: 'CASH', 月結: 'MONTHLY', 預付: 'PREPAID' };
    const rawPaymentMethod = record.paymentMethod || 'MONTHLY';
    const normalizedPaymentMethod = paymentMethodMap[rawPaymentMethod] || rawPaymentMethod;
    basicForm.value.otherForm = {
      paymentMethod: normalizedPaymentMethod,
      deposit: Number(record.deposit ?? 0),
      invoiceTitle: record.invoiceTitle || '',
      invoiceTaxId: record.invoiceTaxId || '',
      note: record.note || '',
    }; //其他資料
    basicForm.value.metaForm = {
      type: record.type || FORM_TEMPLATES.meta.type,
      segment: record.segment || FORM_TEMPLATES.meta.segment,
      source: record.source || FORM_TEMPLATES.meta.source,
      salesRepId: record.salesRepId || '',
      tags: Array.isArray(record.tags) ? record.tags.join(',') : record.tags || '',
      status: record.status || FORM_TEMPLATES.meta.status,
    }; //公司資訊

    //客戶類別轉換
    const categoryMap = { 飲水: 'BOTTLED_WATER', 桶裝水: 'BOTTLED_WATER', 雞蛋: 'EGG', 飲水機: 'DISPENSER' };
    const rawCategories = record.categories || [];
    categoriesForm.value = rawCategories.map((cat) => categoryMap[cat] || cat); //客戶類別
    deliveryDaysForm.value = record.deliveryDays || []; //出貨星期
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
    }); //商品價格調整
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
  const getDeposits = async (customerId) => {
    if (!customerId) return;
    try {
      const response = await CustomersStoredGetByID(customerId);
      const list = response?.data?.data?.data ?? [];
      _originalDepositIds.value = new Set(list.map((item) => item.id));
      waterDepositsForm.value = list.map((item) => ({
        id: item.id,
        productId: item.product ?? item.productId ?? '',
        productName: item.product?.name ?? '',
        unit: item.unit ?? '',
        quantity: item.quantity ?? null,
        amount: item.amount ?? null,
        remainingQuantity: item.remainingQuantity ?? null, //系統維護，唯讀
        remainingAmount: item.remainingAmount ?? null, //系統維護，唯讀
        notes: item.notes ?? null,
      }));
    } catch (error) {
      console.error('getDeposits error', error);
    }
  };
  const openCreateDialog = () => {
    dialogMode.value = 'create';
    editingCustomerId.value = null;
    resetForm();
    const currentUser = getUserInfo();
    if (currentUser?.id) {
      basicForm.value.metaForm.salesRepId = { ...currentUser };
    }
    dialogVisible.value = true;
  };
  const editData = (customer) => {
    dialogMode.value = 'edit';
    editingCustomerId.value = customer.id;
    fillFormFromRecord(customer);
    activeTab.value = 'infoData';
    dialogVisible.value = true;
    getData(customer.id);
    getDeposits(customer.id);
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

  //聯絡人操作
  const addContact = () => {
    const nextItem = { ...FORM_TEMPLATES.contact, isPrimary: true, id: Date.now() };
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
    basicForm.value.contactsForm[index].isPrimary = !basicForm.value.contactsForm[index].isPrimary;
  };

  //客製價格操作
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

  /** 儲值管理相關操作 **/
  const addWaterDeposit = () => {
    waterDepositsForm.value.push({
      id: Date.now(),
      productId: '',
      productName: '',
      unit: '',
      quantity: 0,
      amount: 0,
      remainingQuantity: null,
      remainingAmount: null,
    });
  };
  const removeWaterDeposit = (id) => {
    waterDepositsForm.value = waterDepositsForm.value.filter((item) => item.id !== id);
  };
  const changeDepositProduct = (product, index) => {
    if (!product) return;
    const item = waterDepositsForm.value[index];
    if (!item) return;
    item.productName = product.name || '';
    item.unit = product.unit || '';
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

    // 儲值管理：已由獨立 API 處理，不放在 customFields 內
    const payload = {
      name: companyForm.companyName || primaryContact?.name || t('unnamedCustomer', '未命名客戶'),
      type: metaForm.type || FORM_TEMPLATES.meta.type,
      segment: metaForm.segment || FORM_TEMPLATES.meta.segment,
      source: metaForm.source || FORM_TEMPLATES.meta.source,
      contactInfo: {
        phone: companyForm.companyPhone || undefined,
        email: companyForm.companyEmail || undefined,
      },
      taxId: companyForm.taxId || '',
      notes: otherForm.note || '',
      salesRepId: (typeof metaForm.salesRepId === 'object' ? metaForm.salesRepId?.id : metaForm.salesRepId) || '',
      deliveryDays: deliveryDaysForm.value,
      productCategories: categoriesForm.value, //客戶類型
      paymentTerm: otherForm.paymentMethod, //收付方式
      customFields: {
        contacts: formContacts,
        deposit: Number(otherForm.deposit || 0),
        invoiceTitle: otherForm.invoiceTitle,
        invoiceTaxId: otherForm.invoiceTaxId,
        customPrices: processedCustomPrices,
        registeredDate: companyForm.registeredDate,
        companyAddress: companyForm.companyAddress,
      },
    };
    const tagValues = parseTagsInput(metaForm.tags);
    payload.tags = tagValues;

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
      let customerId = editingCustomerId.value;
      if (isCreate.value) {
        const createRes = await CustomersCreatePost(payload);
        customerId = createRes?.data?.data?.id ?? createRes?.data?.id ?? null;
      }
      if (isEdite.value) await CustomersUpdatePatch(customerId, payload);

      // 儲值管理：同步 CRUD
      const depositsWithProductId = waterDepositsForm.value.filter((item) => item.productId);
      const buildDepositPayload = (item) => ({
        productId: typeof item.productId === 'object' ? item.productId?.id : item.productId,
        quantity: item.quantity !== null && item.quantity !== '' ? Number(item.quantity) : undefined,
        amount: item.amount !== null && item.amount !== '' ? Number(item.amount) : undefined,
        unit: item.unit || undefined,
        notes: item.notes || undefined,
      });

      if (customerId) {
        const currentIds = new Set(depositsWithProductId.map((item) => item.id));

        // 刪除：原本有、現在沒有的
        const deletePromises = [..._originalDepositIds.value].filter((id) => !currentIds.has(id)).map((id) => CustomersStoredDeleteById(customerId, id));

        // 新增或更新
        const upsertPromises = depositsWithProductId.map((item) =>
          _originalDepositIds.value.has(item.id) ? CustomersStoredUpdatePatch(customerId, item.id, buildDepositPayload(item)) : CustomersStoredCreatePost(customerId, buildDepositPayload(item)),
        );

        await Promise.all([...deletePromises, ...upsertPromises]);
      }

      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
      await getAPI();
      closeDialog();
    } catch (error) {
      await mainStore.SWAL_Error(error);
      isSaving.value = false;
    }
  };
  const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });

  //訂單相關
  const customerData = ref(false);
  const drawerVisible = ref(false);
  const drawerCustomer = ref(null);
  const orderList = ref([]);
  const orderPagination = reactive({ page: 1, limit: 20, total: 0 });
  const selectedOrderCategory = ref('all'); //選中的訂單分類：all 或 CATEGORY_IDS 的值

  // 訂單分類配置 - 使用 CATEGORY_IDS
  const orderCategories = computed(() => [
    {
      key: 'all',
      label: t('allOrders', '全部訂單'),
    },
    {
      key: CATEGORY_IDS.EGG,
      label: t('orderEgg', '雞蛋訂單'),
    },
    {
      key: CATEGORY_IDS.WATER,
      label: t('orderWater', '飲水訂單'),
    },
  ]);

  const openCustomerData = () => (customerData.value = !customerData.value);

  const openDrawer = async (customer) => {
    drawerCustomer.value = customer;
    orderPagination.page = 1;
    selectedOrderCategory.value = 'all'; // 重置為全部
    await loadCustomerOrders(customer.id, 'all');
    drawerVisible.value = true;
  };

  // 根據 categoryId 構建 API 參數
  const buildOrderListParams = (customerId, categoryId = 'all') => {
    const params = {
      customerId,
      page: orderPagination.page,
      limit: orderPagination.limit,
    };

    // 只有不是「全部」時才傳遞 categoryId
    if (categoryId !== 'all') {
      params.categoryId = categoryId;
    }

    return params;
  };

  const loadCustomerOrders = async (customerId, categoryId = 'all') => {
    mainStore.setLoading(true);
    const params = buildOrderListParams(customerId, categoryId);
    const response = await OrderListGet(params);
    const rawData = response?.data?.data?.data ?? [];
    const metaInfo = response?.data?.data?.pagination ?? {};

    // 訂單數據轉換
    orderList.value = Array.isArray(rawData) ? rawData.map(orderResponseDataToList) : [];

    // 更新分頁信息
    orderPagination.total = metaInfo.total ?? orderList.value.length;
    orderPagination.page = metaInfo.page ?? orderPagination.page;

    mainStore.setLoading(false);
  };

  const handleOrderPageChange = async (page) => {
    orderPagination.page = page;
    await loadCustomerOrders(drawerCustomer.value.id, selectedOrderCategory.value);
  };

  const handleOrderPageSizeChange = async (size) => {
    orderPagination.limit = Number(size);
    orderPagination.page = 1;
    await loadCustomerOrders(drawerCustomer.value.id, selectedOrderCategory.value);
  };

  const handleOrderCategoryChange = async (category) => {
    selectedOrderCategory.value = category;
    orderPagination.page = 1;
    await loadCustomerOrders(drawerCustomer.value.id, category);
  };

  //假資料產生
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
    basicForm.value.otherForm.paymentMethod = 'MONTHLY';
    basicForm.value.otherForm.deposit = 20000;
    basicForm.value.otherForm.invoiceTitle = `${basicForm.value.companyForm.companyName} 發票抬頭`;
    basicForm.value.otherForm.invoiceTaxId = basicForm.value.companyForm.taxId;
    basicForm.value.otherForm.note = '此為快速產生的測試資料';
    categoriesForm.value = ['BOTTLED_WATER', 'EGG', 'DISPENSER'];
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
    //頁面類型
    isProspect,
    defaultStatus,

    EMPTY_PLACEHOLDER,
    orderPageSizeOptions,
    FORM_TEMPLATES,
    orderStatusColors,

    //選項
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

    currency,
    getPrimaryContact,
    findProductById,
    formatDateValue,
    formatWeekDays,
    toggleArrayItem,

    //篩選相關
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

    //列表相關
    basicDataList,
    pagination,
    pageSizeOptions,
    totalCustomers,
    getAPI,
    CurrentChange,
    SizeChange,

    //匯入相關
    fileInputRef,
    handleImportSelect,
    handleFileChange,

    //新增編輯相關
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

    //聯絡人操作
    addContact,
    removeContact,
    setPrimaryContact,

    //客製價格操作
    changeProduct,
    addCustomPrice,
    removeCustomPrice,

    //儲值管理操作
    waterDepositsForm,
    addWaterDeposit,
    removeWaterDeposit,
    changeDepositProduct,

    //訂單相關
    customerData,
    drawerVisible,
    drawerCustomer,
    orderList,
    orderPagination,
    selectedOrderCategory,
    orderCategories,
    openCustomerData,
    openDrawer,
    loadCustomerOrders,
    handleOrderPageChange,
    handleOrderPageSizeChange,
    handleOrderCategoryChange,

    //假資料
    generateFakeCustomer,
  };
}
