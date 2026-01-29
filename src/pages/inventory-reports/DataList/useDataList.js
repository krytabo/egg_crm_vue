// src/pages/inventory-reports/DataList/useDataList.js
// 司機送貨報表列表 - 共用業務邏輯（Desktop / Mobile 共用）

import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { DeliveryReportListGet, DeliveryReportCreatePost, DeliveryReportDeleteById, DeliveryReportConvertToOrderPost, DeliveryReportDailyExportGet } from '@/assets/API/DeliveryReports.js';
import { OrderListGet } from '@/assets/API/Order.js';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { useFileExport } from '@/composables/useFileExport.js';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { Message } from '@arco-design/web-vue';

/**
 * 司機送貨報表列表共用邏輯
 * @param {Function} t - i18n 翻譯函式
 * @param {Function} showMessage - 顯示訊息函式（Desktop/Mobile 各自實作）
 * @param {Function} showConfirm - 顯示確認對話框函式
 */
export function useDataList(t, showMessage = () => {}, showConfirm = null) {
  const router = useRouter();
  const systemStore = useSystemStore();
  const mainStore = useMainStore();
  const timezoneStore = useTimezoneStore();
  const { formatWeekDays, weekDayOptions } = useSelectOptions();
  const { downloadFile } = useFileExport();
  const { isMobile, displayMode } = useDisplayMode();

  // ===== 常數 =====
  const EMPTY_PLACEHOLDER = '—';
  const todayDate = new Date().toISOString().split('T')[0];

  const statusOptions = [
    { label: t('draft', '草稿'), value: '草稿' },
    { label: t('submitted', '已提交'), value: '已提交' },
    { label: t('approved', '已審核'), value: '已審核' },
    { label: t('rejected', '已退回'), value: '已退回' },
  ];

  // ===== 共用工具函式 =====
  const formatNumber = (value) => {
    if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
    return Number(value).toLocaleString();
  };

  // ===== 統計數據 =====
  const summaryData = reactive({
    todayReports: 0,
    todayAmount: 0,
    totalReports: 0,
    totalAmount: 0,
  });

  const calculateSummary = (items) => {
    if (!Array.isArray(items)) items = [];
    const todayReports = items.filter((item) => item.reportDate === todayDate);
    summaryData.todayReports = todayReports.length;
    summaryData.todayAmount = todayReports.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    summaryData.totalReports = items.length;
    summaryData.totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  };

  /** 取得資料 **/
  const responseDataToList = (item = {}) => ({
    id: item.id,
    reportNumber: item.reportNumber || EMPTY_PLACEHOLDER,
    driverId: item.driverId,
    driverName: item.driverName || EMPTY_PLACEHOLDER,
    employeeName: item.driverName || EMPTY_PLACEHOLDER,
    reportDate: timezoneStore.formatDate(item.reportDate) || item.reportDate || EMPTY_PLACEHOLDER,
    weekDays: item.deliveryDays?.length ? formatWeekDays(item.deliveryDays) : item.note || EMPTY_PLACEHOLDER,
    deliveryDays: item.deliveryDays || [],
    status: item.status || EMPTY_PLACEHOLDER,
    products: item.items || [],
    totalAmount: item.totalAmount ?? 0,
    itemCount: item.itemCount ?? 0,
    raw: item,
  });
  const afterApiCall = (response) => {
    let items = response?.data?.data || response?.data?.items || response?.data || [];
    if (!Array.isArray(items)) items = [];
    calculateSummary(items);
  };
  const defaultFilters = {
    driverId: '',
    reportDateFrom: '',
    reportDateTo: '',
    status: '',
  };
  const wrappedDeliveryReportListGet = (params) => {
    const processedParams = { ...params };
    if (processedParams.limit !== undefined) {
      processedParams.pageSize = processedParams.limit;
      delete processedParams.limit;
    }
    processedParams.driverId = processedParams.driverId?.id;
    return DeliveryReportListGet(processedParams);
  };
  const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
    wrappedDeliveryReportListGet,
    defaultFilters,
    {
      responseDataToList,
      afterApiCall,
    },
  );
  const getAPI = async () => await getDefaultAPI();

  // ===== 匯出彈窗 =====
  const exportDialogVisible = ref(false);
  const exportLoading = ref(false);

  // 計算當月第一天和最後一天
  const getMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // 使用本地時間格式化，避免時區問題
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return {
      start: formatDate(firstDay),
      end: formatDate(lastDay),
    };
  };

  const exportFilters = reactive({
    driverId: null,
    reportDateFrom: '',
    reportDateTo: '',
    status: '',
    deliveryDays: [],
  });

  const openExportDialog = () => {
    // 重置為當月日期範圍
    const { start, end } = getMonthDateRange();
    exportFilters.driverId = null;
    exportFilters.reportDateFrom = start;
    exportFilters.reportDateTo = end;
    exportFilters.status = '';
    exportFilters.deliveryDays = [];
    exportDialogVisible.value = true;
  };

  const closeExportDialog = () => {
    exportDialogVisible.value = false;
  };

  // 計算日期差距（天數）
  const getDateDiff = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包含頭尾
  };

  // 驗證日期範圍
  const exportDateError = computed(() => {
    if (!exportFilters.reportDateFrom || !exportFilters.reportDateTo) {
      return t('pleaseSelectDateRange', '請選擇日期範圍');
    }
    if (exportFilters.reportDateFrom > exportFilters.reportDateTo) {
      return t('startDateMustBeforeEndDate', '起始日期必須早於結束日期');
    }
    const days = getDateDiff(exportFilters.reportDateFrom, exportFilters.reportDateTo);
    if (days > 31) {
      return t('dateRangeMax31Days', '日期範圍不能超過 31 天（目前選擇 {days} 天）', { days });
    }
    return '';
  });

  const canExport = computed(() => !exportDateError.value);

  const handleExport = async () => {
    if (!canExport.value) {
      Message.warning(exportDateError.value);
      return;
    }

    exportLoading.value = true;
    try {
      const data = {
        driverId: exportFilters.driverId?.id || null,
        reportDateFrom: exportFilters.reportDateFrom,
        reportDateTo: exportFilters.reportDateTo,
        status: exportFilters.status || null,
        deliveryDays: exportFilters.deliveryDays?.length ? exportFilters.deliveryDays : [],
      };
      const filename = `日報表_${exportFilters.reportDateFrom}_${exportFilters.reportDateTo}.xlsx`;
      await downloadFile(DeliveryReportDailyExportGet, data, filename);
      closeExportDialog();
      Message.success(t('exportSuccess', '匯出成功'));
    } catch (error) {
      console.error('匯出失敗:', error);
      Message.error(t('exportFailed', '匯出失敗'));
    } finally {
      exportLoading.value = false;
    }
  };

  // ===== 新增編輯刪除報表 =====
  const createDialogVisible = ref(false);
  const openCreateDialog = () => (createDialogVisible.value = true);
  const handleReportCreated = async (payload) => {
    try {
      const reportData = {
        reportDate: payload.reportDate,
        driverId: payload.driverId,
        note: payload.weekDayLabel,
        deliveryDays: payload.deliveryDays,
        items: payload.products.flatMap((product) =>
          product.rows.map((row) => ({
            customerId: row.customerId,
            customerName: row.customerName,
            productId: product.productId,
            productName: product.productName,
            productCategory: product.productCategory,
            quantity: row.quantity ?? 1,
            unitPrice: row.unitPrice ?? 0,
            paymentMethod: row.paymentMethod,
            note: row.note || '',
            // hasCustomPrice: row.hasCustomPrice || false,
          })),
        ),
      };
      await DeliveryReportCreatePost(reportData);

      if (isMobile.value && showMessage) {
        showMessage('success', t('saveSuccess', '儲存成功'));
      } else {
        await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
      }
      await getAPI();
    } catch (error) {
      if (isMobile.value && showMessage) {
        const errorMsg = error?.response?.data?.message || error?.message || t('saveFailed', '儲存失敗');
        showMessage('error', errorMsg);
      } else {
        await mainStore.SWAL_Error(error);
      }
    }
  };

  const handleEdit = (row) => {
    if (isMobile.value) {
      router.push({ name: 'm-delivery-report-edit2', params: { uuid: row.id } });
    } else {
      router.push({ name: 'delivery-report-edit2', params: { uuid: row.id } });
    }
  };

  const handleDelete = async (row) => {
    const doDelete = async () => {
      try {
        await DeliveryReportDeleteById(row.id);
        if (isMobile.value && showMessage) {
          showMessage('success', t('reportDeleted', '報表已刪除'));
        } else {
          Message.success(t('reportDeleted', '報表已刪除'));
        }
        await getAPI();
      } catch (error) {
        if (isMobile.value && showMessage) {
          showMessage('error', t('deleteReportFailed', '刪除報表失敗'));
        } else {
          Message.error(t('deleteReportFailed', '刪除報表失敗'));
        }
      }
    };

    if (isMobile.value && showConfirm) {
      await showConfirm({
        title: t('confirmDeleteReport', `確定要刪除報表 #${row.id} 嗎？`),
        message: t('cannotUndo', '此操作無法復原'),
        onConfirm: doDelete,
      });
    } else {
      try {
        await mainStore.SWAL_Confirm(t('confirmDeleteReport', `確定要刪除報表 #${row.id} 嗎？`), t('cannotUndo', '此操作無法復原'));
        await doDelete();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('刪除報表失敗:', error);
        }
      }
    }
  };

  const buildEditLink = (row) => {
    const resolved = router.resolve({ name: 'delivery-report-edit', params: { uuid: row.id } });
    return `${window.location.origin}${resolved.href}`;
  };

  const handleCopyLink = (row) => {
    const editUrl = buildEditLink(row);
    navigator.clipboard
      .writeText(editUrl)
      .then(() => {
        if (isMobile.value && showMessage) {
          showMessage('success', t('linkCopied', '鏈接已複製'));
        } else {
          Message.success(t('linkCopied', '鏈接已複製'));
        }
      })
      .catch(() => {
        if (isMobile.value && showMessage) {
          showMessage('warning', t('copyFailed', '複製失敗，請手動複製'));
        } else {
          Message.warning(t('copyFailed', '複製失敗，請手動複製'));
        }
      });
  };

  // ===== 列印報表 =====
  const printDialogVisible = ref(false);
  const printingReport = ref(null);

  const handlePrint = (row) => {
    printingReport.value = row;
    printDialogVisible.value = true;
  };

  const closePrintDialog = () => {
    printDialogVisible.value = false;
    printingReport.value = null;
  };

  const handleDoPrint = () => {
    window.print();
    closePrintDialog();
    if (isMobile.value && showMessage) {
      showMessage('success', t('printSent', '已送出列印'));
    } else {
      Message.success(t('printSent', '已送出列印'));
    }
  };

  // ===== 轉入訂單 =====
  const convertDialogVisible = ref(false);
  const convertingReport = ref(null);
  const selectedProductIndexes = ref([]);
  const convertMode = ref('new');
  const convertLoading = ref(false);
  const convertShipDate = ref('');
  const convertNote = ref('');

  const TAB_KEYS = {
    PROJECT: 1,
    ORDER: 2,
  };
  const activeTab = ref(TAB_KEYS.PROJECT);
  const isProject = computed(() => activeTab.value === TAB_KEYS.PROJECT);
  const isOrder = computed(() => activeTab.value === TAB_KEYS.ORDER);

  const handleTabChange = (key = TAB_KEYS.PROJECT) => {
    activeTab.value = key;
  };

  const convertProductList = computed(() => {
    const products = convertingReport.value?.products || [];
    return products.map((item, index) => ({
      ...item,
      _index: index,
    }));
  });

  const selectableProductIndexes = computed(() => {
    return convertProductList.value.filter((item) => !item.isConvertedToOrder).map((item) => item._index);
  });

  const isAllProductsSelected = computed(() => {
    if (selectableProductIndexes.value.length === 0) return false;
    return selectableProductIndexes.value.every((idx) => selectedProductIndexes.value.includes(idx));
  });

  const isProductsIndeterminate = computed(() => {
    if (selectedProductIndexes.value.length === 0) return false;
    if (isAllProductsSelected.value) return false;
    return selectedProductIndexes.value.some((idx) => selectableProductIndexes.value.includes(idx));
  });

  const handleSelectAllProducts = (checked) => {
    if (checked) {
      selectedProductIndexes.value = [...selectableProductIndexes.value];
    } else {
      selectedProductIndexes.value = [];
    }
  };

  const handleToggleProduct = (index, checked) => {
    if (checked) {
      if (!selectedProductIndexes.value.includes(index)) {
        selectedProductIndexes.value = [...selectedProductIndexes.value, index];
      }
    } else {
      selectedProductIndexes.value = selectedProductIndexes.value.filter((i) => i !== index);
    }
  };

  const handleConvertToOrder = (row) => {
    convertingReport.value = row;
    const products = row.products || [];
    selectedProductIndexes.value = products.map((item, index) => (!item.isConvertedToOrder ? index : null)).filter((v) => v !== null);
    convertMode.value = 'new';
    selectedExistingOrder.value = null;
    convertShipDate.value = todayDate;
    convertNote.value = t('convertNoteDefault', '從送貨報表轉入');
    convertDialogVisible.value = true;
  };

  const closeConvertDialog = () => {
    convertDialogVisible.value = false;
    convertingReport.value = null;
    selectedProductIndexes.value = [];
    selectedExistingOrder.value = null;
    convertShipDate.value = '';
    convertNote.value = '';
  };

  const handleDoConvert = async () => {
    if (!convertingReport.value || !selectedProductIndexes.value.length) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('selectProductsFirst', '請選擇要轉入的商品'));
      } else {
        Message.warning(t('selectProductsFirst', '請選擇要轉入的商品'));
      }
      return;
    }

    if (convertMode.value === 'existing' && !selectedExistingOrder.value) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('selectOrderFirst', '請選擇要加入的訂單'));
      } else {
        Message.warning(t('selectOrderFirst', '請選擇要加入的訂單'));
      }
      return;
    }

    convertLoading.value = true;
    try {
      const convertData = {
        mode: convertMode.value,
        productIndexes: [...selectedProductIndexes.value].sort((a, b) => a - b),
      };

      if (convertMode.value === 'existing') {
        convertData.existingOrderId = selectedExistingOrder.value.id;
        convertData.shipDate = convertShipDate.value || todayDate;
        convertData.note = convertNote.value || '';
      }

      await DeliveryReportConvertToOrderPost(convertingReport.value.id, convertData);

      const successMsg = convertMode.value === 'new' ? t('newOrderCreated', '已建立新訂單') : t('addedToOrder', '已加入既有訂單');
      if (isMobile.value && showMessage) {
        showMessage('success', successMsg);
      } else {
        Message.success(successMsg);
      }
      closeConvertDialog();
      await getAPI();
    } catch (error) {
      console.error('轉入訂單失敗:', error);
      if (isMobile.value && showMessage) {
        showMessage('error', t('convertFailed', '轉入訂單失敗'));
      } else {
        Message.error(t('convertFailed', '轉入訂單失敗'));
      }
    } finally {
      convertLoading.value = false;
    }
  };

  // ===== 搜尋既有訂單 =====
  const orderSearchDialogVisible = ref(false);
  const orderSearchTerm = ref('');
  const existingOrders = ref([]);
  const selectedExistingOrder = ref(null);
  const orderSearchPagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
  });

  const searchExistingOrders = async (page = 1) => {
    mainStore.setLoading(true);
    try {
      const params = {
        page: page,
        limit: orderSearchPagination.limit,
      };
      if (orderSearchTerm.value) {
        params.keyword = orderSearchTerm.value;
      }
      const response = await OrderListGet(params);
      const responseData = response?.data?.data || response?.data || {};
      const data = responseData?.data || responseData || [];
      const paginationData = responseData?.pagination || {};

      existingOrders.value = Array.isArray(data) ? data : [];
      orderSearchPagination.page = paginationData.page || page;
      orderSearchPagination.total = paginationData.total || 0;
    } catch (error) {
      console.error('搜尋訂單失敗:', error);
      existingOrders.value = [];
      orderSearchPagination.total = 0;
    } finally {
      mainStore.setLoading(false);
    }
  };

  const handleSearchExistingOrder = async () => {
    orderSearchTerm.value = '';
    orderSearchPagination.page = 1;
    orderSearchDialogVisible.value = true;
    await searchExistingOrders(1);
  };

  const handleOrderSearch = () => {
    orderSearchPagination.page = 1;
    searchExistingOrders(1);
  };

  const handleOrderPageChange = (page) => {
    searchExistingOrders(page);
  };

  const handleSelectExistingOrder = (order) => {
    selectedExistingOrder.value = order;
    orderSearchDialogVisible.value = false;
    const msg = t('orderSelected', `已選擇訂單 ${order.orderNumber || '#' + order.id}`);
    if (isMobile.value && showMessage) {
      showMessage('success', msg);
    } else {
      Message.success(msg);
    }
  };

  // ===== 窗口調整 =====
  const cleanupResize = systemStore.initializeWindowResize();

  // ===== 初始化 =====
  const initializeData = async () => {
    await getAPI();
    if (!isMobile.value) {
      await nextTick();
      systemStore.updateTableHeight(520);
    }
  };

  // ===== Return =====
  return {
    // 狀態
    isMobile,
    displayMode,

    // 常數
    EMPTY_PLACEHOLDER,
    todayDate,
    statusOptions,
    weekDayOptions,
    TAB_KEYS,

    // 工具函式
    formatNumber,

    // 統計數據
    summaryData,

    // 列表資料
    basicDataList,
    filters,
    pagination,
    pageSizeOptions,
    getAPI,
    handleFiltersChange,
    clearFilter,
    CurrentChange,
    SizeChange,

    // 匯出彈窗
    exportDialogVisible,
    exportLoading,
    exportFilters,
    exportDateError,
    canExport,
    openExportDialog,
    closeExportDialog,
    handleExport,

    // 新增編輯刪除
    createDialogVisible,
    openCreateDialog,
    handleReportCreated,
    handleEdit,
    handleDelete,
    buildEditLink,
    handleCopyLink,

    // 列印
    printDialogVisible,
    printingReport,
    handlePrint,
    closePrintDialog,
    handleDoPrint,

    // 轉入訂單
    convertDialogVisible,
    convertingReport,
    selectedProductIndexes,
    convertMode,
    convertLoading,
    convertShipDate,
    convertNote,
    activeTab,
    isProject,
    isOrder,
    handleTabChange,
    convertProductList,
    selectableProductIndexes,
    isAllProductsSelected,
    isProductsIndeterminate,
    handleSelectAllProducts,
    handleToggleProduct,
    handleConvertToOrder,
    closeConvertDialog,
    handleDoConvert,

    // 搜尋既有訂單
    orderSearchDialogVisible,
    orderSearchTerm,
    existingOrders,
    selectedExistingOrder,
    orderSearchPagination,
    searchExistingOrders,
    handleSearchExistingOrder,
    handleOrderSearch,
    handleOrderPageChange,
    handleSelectExistingOrder,

    // 窗口調整
    cleanupResize,

    // 初始化
    initializeData,

    // Store 引用（供視圖使用）
    systemStore,
    mainStore,
  };
}
