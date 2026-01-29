import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { DeliveryReportGetById, DeliveryReportUpdatePut } from '@/assets/API/DeliveryReports.js';
import { Message } from '@arco-design/web-vue'; // Notice: This might need to be abstract if we want pure logic, but Message is often used in logic. For mobile, Vant uses showToast.
// We should probably abstract the feedback mechanism, but for now I'll keep it or use a store wrapper.
// The mainStore uses SWAL, which is library agnostic enough.
// Message is Arco specific. I should probably use a callback or a unified feedback hook.
// For now, I'll import Message but be aware Mobile might need Vant's Toast.
import { useI18n } from 'vue-i18n';

// Constants
const EMPTY_PLACEHOLDER = '—';

export function useDeliveryReportForm(props) {
  const router = useRouter();
  const systemStore = useSystemStore();
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();
  const { t } = useI18n();
  const { paymentOptions, categoryColors, weekDayOptions } = useSelectOptions();

  // State
  const saving = ref(false);
  const basicForm = ref({
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
  const editedProducts = ref([]);
  const fuelExpense = ref(0);
  const otherExpense = ref(0);
  
  // Add Product Dialog State
  const addProductDialogVisible = ref(false);
  const selectedProduct = ref(null);
  const selectedCustomer = ref(null);
  const newProductQuantity = ref(1);
  const newProductUnitPrice = ref(0);
  const newProductPaymentMethod = ref('現金');
  const newProductNote = ref('');

  // Computed
  const totalAmount = computed(() => editedProducts.value.reduce((sum, p) => sum + Number(p.amount || 0), 0));
  const totalActualAmount = computed(() => editedProducts.value.reduce((sum, p) => sum + Number(p.actualAmount || 0), 0));
  
  const customerCustomPrice = computed(() => {
    if (!selectedProduct.value || !selectedCustomer.value) return null;
    return getCustomPrice(selectedCustomer.value, selectedProduct.value.id);
  });

  // Helpers
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

  const sortEditedProducts = () => {
    editedProducts.value = [...editedProducts.value].sort((a, b) => {
      const aProductId = a.productId?.id || '';
      const bProductId = b.productId?.id || '';
      return aProductId.localeCompare(bProductId);
    });
  };

  // Actions
  const getData = async () => {
    if (!props.uuid) {
      await mainStore.SWAL_Error(t('reportNotFound', '找不到報表資料'));
      return;
    }

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
      await mainStore.SWAL_Error(error);
    } finally {
      mainStore.setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!basicForm.value) return;
    saving.value = true;
    mainStore.setLoading(true);
    try {
      const updateData = {
        reportDate: basicForm.value.reportDateRaw || basicForm.value.reportDate,
        driverId: basicForm.value.drivers?.id,
        vehicleId: basicForm.value.vehicleId,
        deliveryDays: basicForm.value.deliveryDays,
        note: basicForm.value.note,
        fuelExpense: Number(fuelExpense.value) || 0,
        otherExpense: Number(otherExpense.value) || 0,
        items: editedProducts.value.map((item) => ({
          productId: item.productId?.id,
          productName: item.productId?.name || item.productName,
          productCategory: item.productId?.categoryName || item.productCategory,
          customerId: item.customerId?.id,
          customerName: item.customerId?.name || item.customerName,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          amount: Number(item.amount) || 0,
          actualPaymentAmount: Number(item.actualAmount) || 0,
          paymentMethod: item.paymentMethod || item.customerId?.customFields?.paymentMethod || item.customer?.customFields?.paymentMethod || '現金',
          note: item.note || '',
        })),
      };
      await DeliveryReportUpdatePut(basicForm.value.uuid, updateData);
      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    } catch (error) {
      await mainStore.SWAL_Error(error);
    } finally {
      saving.value = false;
      mainStore.setLoading(false);
    }
  };

  const handleBack = () => router.push({ name: 'delivery-report-new' });

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
    await mainStore.SWAL_Confirm({
      title: t('confirmDeleteRow', '確定要刪除此筆記錄嗎？'),
      text: t('cannotUndo', '此操作無法復原'),
      onConfirm: () => {
        editedProducts.value.splice(index, 1);
      },
    });
  };

  const handleClearAll = async () => {
    if (!editedProducts.value.length) return;
    await mainStore.SWAL_Confirm({
      title: t('confirmClearAll', '確定要清除所有商品嗎？'),
      text: t('cannotUndo', '此操作無法復原'),
      onConfirm: () => {
        editedProducts.value = [];
      },
    });
  };

  const openAddProductDialog = () => {
    selectedProduct.value = null;
    selectedCustomer.value = null;
    newProductQuantity.value = 1;
    newProductUnitPrice.value = 0;
    newProductPaymentMethod.value = '現金';
    newProductNote.value = '';
    addProductDialogVisible.value = true;
  };

  const closeAddProductDialog = () => (addProductDialogVisible.value = false);

  const handleConfirmAddProduct = () => {
    if (!selectedProduct.value || !selectedCustomer.value) {
      // Use SWAL or similar for cross-platform, or return error to view
      // Message.warning is Arco specific.
      // We'll leave it for now, but in Mobile view we might need to intercept or Message works globally?
      // Actually Arco Message is DOM based, it works on Mobile too usually, but Vant Toast is better.
      // For now, let's just keep it.
      Message.warning(t('selectProductAndCustomer', '請選擇商品和客戶'));
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
    Message.success(t('productAdded', '已新增商品「{name}」', { name: product.name }));
  };

  // Watchers
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

  return {
    // State
    basicForm,
    editedProducts,
    fuelExpense,
    otherExpense,
    saving,
    
    // Add Dialog
    addProductDialogVisible,
    selectedProduct,
    selectedCustomer,
    newProductQuantity,
    newProductUnitPrice,
    newProductPaymentMethod,
    newProductNote,
    
    // Computed
    totalAmount,
    totalActualAmount,
    customerCustomPrice,
    
    // Options
    paymentOptions,
    weekDayOptions,
    
    // Actions
    getData,
    handleSave,
    handleBack,
    handleDeleteRow,
    handleClearAll,
    recalculateRow,
    handleCustomerChange,
    openAddProductDialog,
    closeAddProductDialog,
    handleConfirmAddProduct,
    formatNumber,
    getProductCategoryColor
  };
}
