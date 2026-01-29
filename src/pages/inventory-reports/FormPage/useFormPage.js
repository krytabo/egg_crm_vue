// src/pages/inventory-reports/FormPage/useFormPage.js
// 送貨報表編輯頁 - 共用業務邏輯（Desktop / Mobile 共用）

import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useFileExport } from '@/composables/useFileExport.js';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { DeliveryReportExportGet, DeliveryReportGetById, DeliveryReportUpdatePut, DeliveryReportCreatePost } from '@/assets/API/DeliveryReports.js';

/**
 * 送貨報表編輯頁共用邏輯
 * @param {Object} props - 元件 props（需包含 uuid）
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 * @param {Function} showConfirm - 顯示確認對話框函式（Mobile 專用，可選）
 */
export function useFormPage(props, t, showMessage = () => {}, showConfirm = null) {
  const router = useRouter();
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();
  const { paymentOptions, categoryColors, weekDayOptions } = useSelectOptions();
  const { downloadFile } = useFileExport();
  const { isMobile, displayMode } = useDisplayMode();

  // ===== 常數 =====
  const EMPTY_PLACEHOLDER = '—';

  // ===== 共用工具函式 =====
  const formatNumber = (value) => {
    if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
    return Number(value).toLocaleString();
  };

  const getProductCategoryColor = (category) => categoryColors[category] || 'gray';

  const getCustomPrice = (customer, productId) => {
    const customPrices = customer?.customFields?.customPrices || [];
    const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
    return customPrice?.price ?? null;
  };

  // ===== 狀態管理 =====
  const saving = ref(false);
  const loading = ref(false);

  const initializeForm = () => ({
    id: '',
    uuid: '',
    drivers: null,
    vehicleId: null,
    reportDate: '',
    reportDateRaw: '',
    note: '',
    deliveryDays: [],
    products: [],
    fuelExpense: 0,
    otherExpense: 0,
    totalAmount: 0,
    status: '',
  });

  const basicForm = ref(initializeForm());
  const editedProducts = ref([]);
  const fuelExpense = ref(0);
  const otherExpense = ref(0);

  // ===== 新增商品彈窗狀態 =====
  const addProductDialogVisible = ref(false);
  const selectedProduct = ref(null);
  const selectedCustomer = ref(null);
  const newProductQuantity = ref(1);
  const newProductUnitPrice = ref(0);
  const newProductPaymentMethod = ref('現金');
  const newProductNote = ref('');

  // ===== 計算屬性 =====
  const totalAmount = computed(() =>
    editedProducts.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  );

  const totalActualAmount = computed(() =>
    editedProducts.value.reduce((sum, p) => sum + Number(p.actualAmount || 0), 0)
  );

  const finalTotal = computed(() =>
    totalActualAmount.value - fuelExpense.value - otherExpense.value
  );

  const customerCustomPrice = computed(() => {
    if (!selectedProduct.value || !selectedCustomer.value) return null;
    return getCustomPrice(selectedCustomer.value, selectedProduct.value.id);
  });

  // 表格欄位合併設定（Desktop 使用）
  const rowSpanConfig = [{ field: 'productName' }];

  // ===== 排序函式 =====
  const sortEditedProducts = () => {
    editedProducts.value = [...editedProducts.value].sort((a, b) => {
      const aProductId = a.productId?.id || '';
      const bProductId = b.productId?.id || '';
      return aProductId.localeCompare(bProductId);
    });
  };

  // ===== 新增/編輯模式 =====
  const isCreateMode = computed(() => !props.uuid);

  // ===== API 操作 =====
  const getData = async () => {
    // 新增模式：初始化空表單
    if (!props.uuid) {
      const today = new Date().toISOString().split('T')[0];
      basicForm.value = {
        ...initializeForm(),
        reportDate: today,
        reportDateRaw: today,
        status: '草稿',
      };
      editedProducts.value = [];
      fuelExpense.value = 0;
      otherExpense.value = 0;
      return;
    }

    // 編輯模式：載入現有資料
    loading.value = true;
    mainStore.setLoading(true);
    try {
      const response = await DeliveryReportGetById(props.uuid);
      const data = response?.data?.data;

      basicForm.value = {
        id: data.id,
        reportNumber: data.reportNumber,
        uuid: data.id,
        drivers: { id: data.driverId, name: data.driverName },
        vehicleId: data.vehicleId || null,
        reportDate: timezoneStore.formatDate(data.reportDate) || data.reportDate,
        reportDateRaw: data.reportDate,
        note: data.note || '',
        deliveryDays: data.deliveryDays || [],
        products: data.items || [],
        fuelExpense: data.fuelExpense || 0,
        otherExpense: data.otherExpense || 0,
        totalAmount: data.totalAmount || 0,
        status: data.status,
      };

      editedProducts.value = (data.items || []).map((item, index) => {
        const product = item.product || null;
        const customer = item.customer || null;
        const unitPrice = item.unitPrice || product?.basePriceAmount || 0;
        const quantity = item.quantity || 0;
        const amount = item.amount || quantity * unitPrice;

        return {
          rowKey: `${item.id || index}-${Date.now()}`,
          id: item.id,
          productId: product,
          customerId: customer,
          productName: product?.name || item.productName || '',
          productCategory: product?.categoryName || item.productCategory || '',
          customerName: customer?.name || item.customerName || '',
          quantity,
          unitPrice,
          amount,
          actualAmount: item.actualPaymentAmount || amount || 0,
          paymentMethod: item.paymentMethod || customer?.customFields?.paymentMethod || '現金',
          note: item.note || '',
          isConvertedToOrder: item.isConvertedToOrder || false,
          orderId: item.orderId,
        };
      });

      sortEditedProducts();
      fuelExpense.value = data.fuelExpense || 0;
      otherExpense.value = data.otherExpense || 0;
    } catch (error) {
      if (isMobile.value && showMessage) {
        const errorMsg = error?.response?.data?.message || error?.message || t('loadFailed', '載入失敗');
        showMessage('error', errorMsg);
      } else {
        await mainStore.SWAL_Error(error);
      }
    } finally {
      loading.value = false;
      mainStore.setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!basicForm.value) return;

    // 驗證必填欄位
    if (!basicForm.value.drivers?.id) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('pleaseSelectDriver', '請選擇司機'));
      } else {
        await mainStore.SWAL_Warning(t('pleaseSelectDriver', '請選擇司機'));
      }
      return;
    }

    saving.value = true;
    mainStore.setLoading(true);
    try {
      if (isCreateMode.value) {
        // 新增模式 - 簡化 payload
        const createData = {
          reportDate: basicForm.value.reportDateRaw || basicForm.value.reportDate,
          driverId: basicForm.value.drivers?.id,
          note: basicForm.value.note,
          deliveryDays: basicForm.value.deliveryDays,
          items: editedProducts.value.map((item) => ({
            customerId: item.customerId?.id,
            customerName: item.customerId?.name || item.customerName,
            productId: item.productId?.id,
            productName: item.productId?.name || item.productName,
            productCategory: item.productId?.categoryName || item.productCategory,
            quantity: Number(item.quantity) || 1,
            unitPrice: item.unitPrice,
            paymentMethod: item.paymentMethod || '現金',
            note: item.note || '',
          })),
        };
        const response = await DeliveryReportCreatePost(createData);
        const newId = response?.data?.data?.id;
        if (isMobile.value && showMessage) {
          showMessage('success', t('createSuccess', '新增成功'));
          // 手機版新增成功後返回列表
          handleBack();
        } else {
          await mainStore.SWAL_Success(t('createSuccess', '新增成功'));
          // 桌面版新增成功後導航到編輯頁面
          if (newId) {
            router.replace({ name: 'delivery-report-edit2', params: { uuid: newId } });
          } else {
            handleBack();
          }
        }
      } else {
        // 編輯模式 - 完整 payload
        const updateData = {
          reportDate: basicForm.value.reportDateRaw || basicForm.value.reportDate,
          driverId: basicForm.value.drivers?.id,
          vehicleId: basicForm.value.vehicleId,
          deliveryDays: basicForm.value.deliveryDays,
          note: basicForm.value.note,
          fuelExpense: Number(fuelExpense.value) || 0,
          otherExpense: Number(otherExpense.value) || 0,
          items: editedProducts.value.map((item) => ({
            customerId: item.customerId?.id,
            customerName: item.customerId?.name || item.customerName,
            productId: item.productId?.id,
            productName: item.productId?.name || item.productName,
            productCategory: item.productId?.categoryName || item.productCategory,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            amount: Number(item.amount) || 0,
            actualPaymentAmount: Number(item.actualAmount) || 0,
            paymentMethod: item.paymentMethod || '現金',
            note: item.note || '',
          })),
        };
        await DeliveryReportUpdatePut(basicForm.value.uuid, updateData);
        if (isMobile.value && showMessage) {
          showMessage('success', t('saveSuccess', '儲存成功'));
        } else {
          await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
        }
      }
    } catch (error) {
      if (isMobile.value && showMessage) {
        const errorMsg = error?.response?.data?.message || error?.message || t('saveFailed', '儲存失敗');
        showMessage('error', errorMsg);
      } else {
        await mainStore.SWAL_Error(error);
      }
    } finally {
      saving.value = false;
      mainStore.setLoading(false);
    }
  };

  const exportFile = async () => {
    await downloadFile(DeliveryReportExportGet, basicForm.value.id, 'DownloadFile.xlsx');
  };

  // ===== 導航操作 =====
  const handleBack = () => {
    // 根據模式返回對應的列表路由
    if (isMobile.value) {
      router.push({ name: 'm-delivery-report-new' });
    } else {
      router.push({ name: 'delivery-report-new' });
    }
  };

  // ===== 資料列操作 =====
  const recalculateRow = (index) => {
    const row = editedProducts.value[index];
    const quantity = Number(row.quantity) || 0;
    const unitPrice = Number(row.unitPrice) || 0;
    const amount = quantity * unitPrice;
    row.amount = amount;
    row.actualAmount = amount;
  };

  const handleCustomerChange = (index, customerValue) => {
    if (!customerValue) {
      editedProducts.value[index].customerId = null;
      editedProducts.value[index].customerName = '';
      return;
    }

    const row = editedProducts.value[index];
    row.customerId = customerValue;
    row.customerName = customerValue.name || '';

    const paymentMethod = customerValue.customFields?.paymentMethod;
    if (paymentMethod) row.paymentMethod = paymentMethod;

    const productId = row.productId?.id || row.productId;
    if (productId) {
      const customPrice = getCustomPrice(customerValue, productId);
      if (customPrice !== null) {
        row.unitPrice = customPrice;
        const quantity = Number(row.quantity) || 0;
        row.amount = quantity * customPrice;
        row.actualAmount = row.amount;
      }
    }
  };

  const handleDeleteRow = async (index) => {
    const doDelete = () => {
      editedProducts.value.splice(index, 1);
    };

    if (isMobile.value && showConfirm) {
      // Mobile 版使用傳入的確認對話框
      await showConfirm({
        title: t('confirmDeleteRow', '確定要刪除此筆記錄嗎？'),
        message: t('cannotUndo', '此操作無法復原'),
        onConfirm: doDelete,
      });
    } else {
      // Desktop 版使用 SweetAlert
      await mainStore.SWAL_Confirm({
        title: t('confirmDeleteRow', '確定要刪除此筆記錄嗎？'),
        text: t('cannotUndo', '此操作無法復原'),
        onConfirm: doDelete,
      });
    }
  };

  const handleClearAll = async () => {
    if (!editedProducts.value.length) return;

    const doClear = () => {
      editedProducts.value = [];
    };

    if (isMobile.value && showConfirm) {
      await showConfirm({
        title: t('confirmClearAll', '確定要清除所有商品嗎？'),
        message: t('cannotUndo', '此操作無法復原'),
        onConfirm: doClear,
      });
    } else {
      await mainStore.SWAL_Confirm({
        title: t('confirmClearAll', '確定要清除所有商品嗎？'),
        text: t('cannotUndo', '此操作無法復原'),
        onConfirm: doClear,
      });
    }
  };

  // ===== 新增商品彈窗操作 =====
  const openAddProductDialog = () => {
    selectedProduct.value = null;
    selectedCustomer.value = null;
    newProductQuantity.value = 1;
    newProductUnitPrice.value = 0;
    newProductPaymentMethod.value = '現金';
    newProductNote.value = '';
    addProductDialogVisible.value = true;
  };

  const closeAddProductDialog = () => {
    addProductDialogVisible.value = false;
  };

  const handleConfirmAddProduct = () => {
    if (!selectedProduct.value || !selectedCustomer.value) {
      showMessage('warning', t('selectProductAndCustomer', '請選擇商品和客戶'));
      return;
    }

    const product = selectedProduct.value;
    const customer = selectedCustomer.value;
    const quantity = Number(newProductQuantity.value) || 0;

    const customPrice = getCustomPrice(customer, product.id);
    const basePrice = product.basePriceAmount || 0;
    const unitPrice = Number(newProductUnitPrice.value) || customPrice || basePrice;
    const amount = quantity * unitPrice;

    editedProducts.value.push({
      rowKey: `new-${Date.now()}`,
      id: null,
      productId: product,
      customerId: customer,
      productName: product.name || '',
      productCategory: product.category?.name || '',
      customerName: customer?.name || '',
      quantity,
      unitPrice,
      amount,
      actualAmount: amount,
      paymentMethod: newProductPaymentMethod.value || customer?.customFields?.paymentMethod || '現金',
      note: newProductNote.value,
    });

    sortEditedProducts();
    closeAddProductDialog();
    showMessage('success', t('productAdded', '已新增商品「{name}」', { name: product.name }));
  };

  // ===== Watch =====
  watch(selectedProduct, (product) => {
    if (!product) {
      newProductUnitPrice.value = 0;
      return;
    }
    const basePrice = product.basePriceAmount || 0;

    if (selectedCustomer.value) {
      const customPrice = getCustomPrice(selectedCustomer.value, product.id);
      newProductUnitPrice.value = customPrice !== null ? customPrice : basePrice;
    } else {
      newProductUnitPrice.value = basePrice;
    }
  });

  watch(selectedCustomer, (customer) => {
    if (!customer) return;

    const paymentMethod = customer.customFields?.paymentMethod;
    if (paymentMethod) newProductPaymentMethod.value = paymentMethod;

    if (selectedProduct.value) {
      const product = selectedProduct.value;
      const customPrice = getCustomPrice(customer, product.id);
      if (customPrice !== null) {
        newProductUnitPrice.value = customPrice;
      }
    }
  });

  // ===== Return =====
  return {
    // 狀態
    saving,
    loading,
    basicForm,
    editedProducts,
    fuelExpense,
    otherExpense,
    isCreateMode,

    // 新增商品彈窗
    addProductDialogVisible,
    selectedProduct,
    selectedCustomer,
    newProductQuantity,
    newProductUnitPrice,
    newProductPaymentMethod,
    newProductNote,

    // 計算屬性
    totalAmount,
    totalActualAmount,
    finalTotal,
    customerCustomPrice,
    rowSpanConfig,

    // 選項資料
    paymentOptions,
    categoryColors,
    weekDayOptions,

    // 工具函式
    formatNumber,
    getProductCategoryColor,
    getCustomPrice,

    // 顯示模式
    isMobile,
    displayMode,

    // API 操作
    getData,
    handleSave,
    exportFile,

    // 導航
    handleBack,

    // 資料列操作
    recalculateRow,
    handleCustomerChange,
    handleDeleteRow,
    handleClearAll,
    sortEditedProducts,

    // 彈窗操作
    openAddProductDialog,
    closeAddProductDialog,
    handleConfirmAddProduct,
  };
}
