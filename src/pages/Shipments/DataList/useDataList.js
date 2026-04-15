// src/pages/inventory-reports/DataList/useDataList.js
import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  DeliveryReportListGet,
  DeliveryReportCreatePost,
  DeliveryReportDeleteById,
  DeliveryReportConvertToOrderPost,
  DeliveryReportDailyExportGet,
  DeliveryReportReviewPost,
  DeliveryReportDailyGet,
} from '@/assets/API/DeliveryReports.js';
import { OrderListGet } from '@/assets/API/Order.js';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { useFileExport } from '@/composables/useFileExport.js';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { getCategoryIdByCode } from '@/constants';

// 出貨報表 productCategory（後端 enum 中文值）→ categoryCode
const PRODUCT_CATEGORY_TO_CODE = {
  桶裝水: 'WATER',
  雞蛋: 'EGG',
  飲水機: 'DISPENSER',
};

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

  const EMPTY_PLACEHOLDER = '—';
  const todayDate = new Date().toISOString().split('T')[0];
  const statusOptions = [
    { label: t('draft', '草稿'), value: '草稿' },
    { label: t('submitted', '已提交'), value: '已提交' },
    { label: t('approved', '已審核'), value: '已審核' },
    { label: t('rejected', '已退回'), value: '已退回' },
  ];
  const formatNumber = (value) => {
    if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
    return Number(value).toLocaleString();
  };

  // 報表狀態檢查
  // 草稿：編輯=true, 審核=false, 刪除=true
  // 已提交：編輯=false(檢視), 審核=true, 刪除=false
  // 已審核：編輯=false(檢視), 審核=false, 刪除=false
  // 已退回：編輯=false(檢視), 審核=false, 刪除=false
  const canReviewReport = (row) => row?.status === '已提交'; // 只有已提交才能審核
  const canDeleteReport = (row) => row?.status === '草稿'; // 只有草稿可刪除
  const canEditReport = (row) => row?.status === '草稿'; // 只有草稿可編輯
  const isViewOnlyReport = (row) => row?.status === '已提交' || row?.status === '已審核' || row?.status === '已退回'; // 已提交、已審核、已退回只能檢視

  /*  // 草稿：編輯=true, 審核=false, 刪除=true
  // 已提交：編輯=false(檢視), 審核=true, 刪除=false
  // 已審核：編輯=false(檢視), 審核=false, 刪除=false
  // 已退回：編輯=true, 審核=false, 刪除=true
  const canReviewReport = (row) => row?.status === '已提交'; //只有已提交才能審核
  const canDeleteReport = (row) => row?.status === '草稿' || row?.status === '已退回'; //草稿或已退回可刪除
  const canEditReport = (row) => row?.status === '草稿' || row?.status === '已退回'; //草稿或已退回可編輯
  const isViewOnlyReport = (row) => row?.status === '已提交' || row?.status === '已審核'; //已提交或已審核只能檢視*/

  /** 統計數據相關 **/
  const summaryData = reactive({
    todayReports: 0,
    todayAmount: 0,
    totalReports: 0,
    totalAmount: 0,
  });
  const fetchTodaySummary = async () => {
    try {
      const response = await DeliveryReportDailyGet({ reportDate: todayDate });
      const data = response?.data?.data ?? response?.data ?? response;
      summaryData.todayReports = data?.reportCount ?? 0;
      summaryData.todayAmount = data?.grandTotal ?? 0;
    } catch {
      summaryData.todayReports = 0;
      summaryData.todayAmount = 0;
    }
  };
  const calculateSummary = (response) => {
    const pagination = response?.data?.data;
    summaryData.totalReports = pagination?.pagination?.total ?? 0; //總報表筆數
    summaryData.totalAmount = pagination?.summary.totalAmount ?? 0; //總報表金額
  }; //搜尋總結果

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
    calculateSummary(response);
  };

  // 初始化日期篩選為當月
  const getInitialMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      reportDateFrom: formatDate(firstDay),
      reportDateTo: formatDate(lastDay),
    };
  };

  const { reportDateFrom, reportDateTo } = getInitialMonthDates();
  const defaultFilters = {
    driverId: '',
    reportDateFrom,
    reportDateTo,
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
  const getAPI = async () => {
    await Promise.all([getDefaultAPI(), fetchTodaySummary()]);
  };

  /** 匯出彈窗相關 **/
  const exportDialogVisible = ref(false);
  const exportLoading = ref(false);
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
  }; //計算當月第一天和最後一天
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
  const getDateDiff = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包含頭尾
  }; //計算日期差距
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
      await mainStore.SWAL_Error(exportDateError.value);
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
      const filename = `${t('dailyReport', '日報表')}_${exportFilters.reportDateFrom}_${exportFilters.reportDateTo}.xlsx`;
      await downloadFile(DeliveryReportDailyExportGet, data, filename);
      closeExportDialog();
      await mainStore.SWAL_Success(t('exportSuccess', '匯出成功'));
    } catch (error) {
      await mainStore.SWAL_Error(t('exportFailed', '匯出失敗'));
    } finally {
      exportLoading.value = false;
    }
  }; // 驗證日期範圍

  /** 新增編輯刪除報表相關 **/
  const createDialogVisible = ref(false);
  const openCreateDialog = () => (createDialogVisible.value = true);
  const handleReportCreated = async (payload) => {
    try {
      const reportData = {
        reportDate: payload.reportDate,
        driverId: payload.driverId,
        note: payload.note,
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
      router.push({ name: 'm-shipments-report-edit', params: { uuid: row.id } });
    } else {
      router.push({ name: 'shipments-report-edit', params: { uuid: row.id } });
    }
  };
  const handleDelete = async (row) => {
    const doDelete = async () => {
      try {
        await DeliveryReportDeleteById(row.id);
        if (isMobile.value && showMessage) {
          showMessage('success', t('reportDeleted', '報表已刪除'));
        } else {
          mainStore.SWAL_Success(t('reportDeleted', '報表已刪除'));
        }
        await getAPI();
      } catch (error) {
        if (isMobile.value && showMessage) {
          showMessage('error', t('deleteReportFailed', '刪除報表失敗'));
        } else {
          mainStore.SWAL_Error(t('deleteReportFailed', '刪除報表失敗'));
        }
      }
    };

    if (isMobile.value && showConfirm) {
      await showConfirm({
        title: t('confirmDeleteReport', '確定要刪除報表 #{id} 嗎？', { id: row.id }),
        message: t('cannotUndo', '此操作無法復原'),
        onConfirm: doDelete,
      });
    } else {
      try {
        await mainStore.SWAL_Confirm(t('confirmDeleteReport', '確定要刪除報表 #{id} 嗎？', { id: row.id }), t('cannotUndo', '此操作無法復原'));
        await doDelete();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('刪除報表失敗:', error);
        }
      }
    }
  }; //刪除單筆
  const handleCheck = async (row) => {
    const performReview = async (action) => {
      try {
        await DeliveryReportReviewPost(row.id, { action });
        const successMsg = action === 'approve' ? t('statusChangedToApproved', '狀態已變更為「已審核」') : t('statusChangedToRejected', '狀態已變更為「已退回」');
        if (isMobile.value && showMessage) {
          showMessage('success', successMsg);
        } else {
          await mainStore.SWAL_Success(successMsg);
        }
        await getAPI();
      } catch (error) {
        const failMsg = action === 'approve' ? t('approveFailed', '審核通過失敗') : t('rejectFailed', '退回失敗');
        if (isMobile.value && showMessage) {
          showMessage('error', failMsg);
        } else {
          await mainStore.SWAL_Error(failMsg);
        }
      }
    };

    if (isMobile.value && showConfirm) {
      await showConfirm({
        title: t('reviewReport', '審核報表'),
        message: t('selectReviewAction', '請選擇審核動作'),
        buttons: [
          { text: t('approve', '通過'), handler: () => performReview('approve') },
          { text: t('reject', '退回'), handler: () => performReview('reject') },
          { text: t('cancel', '取消'), role: 'cancel' },
        ],
      });
    } else {
      await mainStore.SWAL_Confirm({
        title: t('reviewReport', '審核報表'),
        text: t('selectReviewAction', '請選擇審核動作'),
        confirmButtonText: t('approve', '通過'),
        cancelButtonText: t('cancel', '取消'),
        showDenyButton: true,
        denyButtonText: t('reject', '退回'),
        onConfirm: async (action) => {
          await performReview('approve');
        },
        onDeny: async (action) => {
          await performReview('reject');
        },
      });
      /*const result = await Swal.fire({
        title: t('reviewReport', '審核報表'),
        text: t('selectReviewAction', '請選擇審核動作'),
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: t('approve', '通過'),
        denyButtonText: t('reject', '退回'),
        cancelButtonText: t('cancel', '取消'),
        confirmButtonColor: '#52c41a',
        denyButtonColor: '#ff4d4f',
      });

      if (result.isConfirmed) {
        await performReview('approve');
      } else if (result.isDenied) {
        await performReview('reject');
      }*/
    }
  }; //審核單筆
  const buildEditLink = (row) => {
    const resolved = router.resolve({ name: 'delivery-report-edit', params: { uuid: row.id } });
    return `${window.location.origin}${resolved.href}`;
  }; //編輯單筆
  const handleCopyLink = (row) => {
    const editUrl = buildEditLink(row);
    navigator.clipboard
      .writeText(editUrl)
      .then(async () => {
        if (isMobile.value && showMessage) {
          showMessage('success', t('linkCopied', '鏈接已複製'));
        } else {
          await mainStore.SWAL_Success(t('linkCopied', '鏈接已複製'));
        }
      })
      .catch(async () => {
        if (isMobile.value && showMessage) {
          showMessage('warning', t('copyFailed', '複製失敗，請手動複製'));
        } else {
          await mainStore.SWAL_Error(t('copyFailed', '複製失敗，請手動複製'));
        }
      });
  }; //複製連結

  /** 列印報表相關 **/
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
  const handleDoPrint = async () => {
    window.print();
    closePrintDialog();
    if (isMobile.value && showMessage) {
      showMessage('success', t('printSent', '已送出列印'));
    } else {
      await mainStore.SWAL_Success(t('printSent', '已送出列印'));
    }
  };

  /** 轉入訂單相關 **/
  const convertDialogVisible = ref(false);
  const convertingReport = ref(null);
  const selectedProductIndexes = ref([]);
  const convertMode = ref('new');
  const convertLoading = ref(false);
  const convertShipDate = ref('');
  const convertNote = ref('');
  const convertCategoryId = ref(null); //建立新訂單時的產品種類

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
  // 目前已選商品所屬的客戶 ID（強制同一客戶）
  const selectedConvertCustomerId = computed(() => {
    if (!selectedProductIndexes.value.length) return null;
    const firstItem = convertProductList.value.find((item) => item._index === selectedProductIndexes.value[0]);
    return firstItem?.customerId || firstItem?.customer?.id || null;
  });
  const selectedConvertCustomerName = computed(() => {
    if (!selectedProductIndexes.value.length) return null;
    const firstItem = convertProductList.value.find((item) => item._index === selectedProductIndexes.value[0]);
    return firstItem?.customerName || firstItem?.customer?.name || null;
  });
  // 目前已選商品的類別（強制同一客戶＋同一類別）
  const selectedConvertProductCategory = computed(() => {
    if (!selectedProductIndexes.value.length) return null;
    const firstItem = convertProductList.value.find((item) => item._index === selectedProductIndexes.value[0]);
    return firstItem?.productCategory || null;
  });
  const isProductSelectableForConvert = (item) => {
    if (item.isConvertedToOrder) return false;
    if (!selectedConvertCustomerId.value) return true;
    const itemCustomerId = item.customerId || item.customer?.id;
    if (itemCustomerId !== selectedConvertCustomerId.value) return false;
    if (selectedConvertProductCategory.value && item.productCategory !== selectedConvertProductCategory.value) return false;
    return true;
  };
  const selectableProductIndexes = computed(() => {
    return convertProductList.value.filter((item) => isProductSelectableForConvert(item)).map((item) => item._index);
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
      const item = convertProductList.value.find((p) => p._index === index);
      const itemCustomerId = item?.customerId || item?.customer?.id;
      const itemCategory = item?.productCategory;
      // 客戶不同，或類別不同 → 清空重選
      if (
        selectedConvertCustomerId.value &&
        (itemCustomerId !== selectedConvertCustomerId.value || itemCategory !== selectedConvertProductCategory.value)
      ) {
        selectedProductIndexes.value = [index];
      } else if (!selectedProductIndexes.value.includes(index)) {
        selectedProductIndexes.value = [...selectedProductIndexes.value, index];
      }
    } else {
      selectedProductIndexes.value = selectedProductIndexes.value.filter((i) => i !== index);
    }
  };
  const handleConvertToOrder = async (row) => {
    //檢查報表狀態，只有「已提交」可以轉入訂單
    /*if (row.status !== '已提交') {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('reportNotSubmitted', '該報表尚未提交，請先提交後再轉入訂單'));
      } else {
        await mainStore.SWAL_Error(t('reportNotSubmitted', '該報表尚未提交，請先提交後再轉入訂單'));
      }
      return;
    }*/

    if (row.status !== '已審核') {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('reportNotApprovedYet', '該報表尚未審核通過，請先審核後再轉入訂單'));
      } else {
        await mainStore.SWAL_Error(t('reportNotApprovedYet', '該報表尚未審核通過，請先審核後再轉入訂單'));
      }
      return;
    }

    convertingReport.value = row;
    const products = row.products || [];
    // 只自動選取第一個有未轉入商品的客戶 + 同類別的商品
    const firstUnconvertedItem = products.find((item) => !item.isConvertedToOrder);
    const firstCustomerId = firstUnconvertedItem?.customerId || firstUnconvertedItem?.customer?.id || null;
    const firstCategory = firstUnconvertedItem?.productCategory || null;
    selectedProductIndexes.value = products
      .map((item, index) => {
        if (item.isConvertedToOrder) return null;
        const itemCustomerId = item.customerId || item.customer?.id;
        if (itemCustomerId !== firstCustomerId) return null;
        if (firstCategory && item.productCategory !== firstCategory) return null;
        return index;
      })
      .filter((v) => v !== null);
    convertMode.value = 'new';
    // 根據第一筆商品的 productCategory 自動判斷類別，免去手動選擇
    const firstProduct = (row.products || []).find((item) => !item.isConvertedToOrder);
    const autoCode = firstProduct?.productCategory ? PRODUCT_CATEGORY_TO_CODE[firstProduct.productCategory] || null : null;
    convertCategoryId.value = autoCode;
    selectedExistingOrder.value = null;
    convertShipDate.value = todayDate;
    convertNote.value = t('convertNoteDefault', '從送貨報表轉入');
    convertDialogVisible.value = true;
  }; //轉入訂單
  const closeConvertDialog = () => {
    convertDialogVisible.value = false;
    convertingReport.value = null;
    selectedProductIndexes.value = [];
    selectedExistingOrder.value = null;
    convertShipDate.value = '';
    convertNote.value = '';
    convertCategoryId.value = null;
  };
  const handleDoConvert = async () => {
    if (!convertingReport.value || !selectedProductIndexes.value.length) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('selectProductsFirst', '請選擇要轉入的商品'));
      } else {
        await mainStore.SWAL_Error(t('selectProductsFirst', '請選擇要轉入的商品'));
      }
      return;
    } //未選擇商品
    if (convertMode.value === 'new' && !convertCategoryId.value) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('selectCategoryFirst', '請選擇產品種類'));
      } else {
        await mainStore.SWAL_Error(t('selectCategoryFirst', '請選擇產品種類'));
      }
      return;
    } //未選擇產品種類（建立新訂單時必填）
    if (convertMode.value === 'existing' && !selectedExistingOrder.value) {
      if (isMobile.value && showMessage) {
        showMessage('warning', t('selectOrderFirst', '請選擇要加入的訂單'));
      } else {
        await mainStore.SWAL_Error(t('selectOrderFirst', '請選擇要加入的訂單'));
      }
      return;
    } //未選擇轉入訂單

    convertLoading.value = true;
    try {
      const convertData = {
        mode: convertMode.value, //模式：new(新訂單), existing(現有訂單)
        productIndexes: [...selectedProductIndexes.value].sort((a, b) => a - b), //商品index
      };
      if (convertMode.value === 'new') {
        convertData.categoryId = getCategoryIdByCode(convertCategoryId.value); //產品種類
      }
      if (convertMode.value === 'existing') {
        convertData.existingOrderId = selectedExistingOrder.value.id; //訂單ID
        convertData.shipDate = convertShipDate.value || todayDate; //出貨日期
        convertData.note = convertNote.value || ''; //備註
      }
      await DeliveryReportConvertToOrderPost(convertingReport.value.id, convertData);

      const successMsg = convertMode.value === 'new' ? t('newOrderCreated', '已建立新訂單') : t('addedToOrder', '已加入既有訂單');
      if (isMobile.value && showMessage) {
        showMessage('success', successMsg);
      } else {
        await mainStore.SWAL_Success(successMsg);
      }
      closeConvertDialog();
      await getAPI();
    } catch (error) {
      if (isMobile.value && showMessage) {
        showMessage('error', t('convertFailed', '轉入訂單失敗'));
      } else {
        await mainStore.SWAL_Error(t('convertFailed', '轉入訂單失敗'));
      }
    } finally {
      convertLoading.value = false;
    }
  };

  /** 搜尋既有訂單相關 **/
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
        params.search = orderSearchTerm.value;
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
    orderSearchTerm.value = selectedConvertCustomerName.value || '';
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
  const handleSelectExistingOrder = async (order) => {
    selectedExistingOrder.value = order;
    orderSearchDialogVisible.value = false;
    const msg = t('orderSelected', '已選擇訂單 {orderNumber}', { orderNumber: order.orderNumber || '#' + order.id });
    if (isMobile.value && showMessage) {
      showMessage('success', msg);
    } else {
      await mainStore.SWAL_Success(msg);
    }
  };

  const cleanupResize = systemStore.initializeWindowResize(); //窗口調整
  const initializeData = async () => {
    await getAPI();
    if (!isMobile.value) {
      await nextTick();
      systemStore.updateTableHeight(520);
    }
  };
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
    canReviewReport,
    canDeleteReport,
    canEditReport,
    isViewOnlyReport,

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
    handleCheck,
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
    convertCategoryId,
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
    selectedConvertCustomerId,
    selectedConvertCustomerName,
    selectedConvertProductCategory,
    isProductSelectableForConvert,

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
