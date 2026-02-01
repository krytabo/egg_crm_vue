// src/composables/useSelectOptions.js
// 共用選項管理 - 統一管理前端自定義的下拉選單選項
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useSelectOptions() {
  const { t } = useI18n();
  const customerCategories = computed(() => [
    { label: 'BOTTLED_WATER', text: t('categoryBottledWater', '桶裝水') },
    { label: 'EGG', text: t('categoryEgg', '雞蛋') },
    { label: 'DISPENSER', text: t('categoryDispenser', '飲水機') },
  ]); //客戶類別（label 為存儲值，text 為顯示文字）
  const paymentOptions = computed(() => [
    { label: t('cash', '現金'), value: 'CASH' },
    { label: t('monthly', '月結'), value: 'MONTHLY' },
    { label: t('prepaid', '預付'), value: 'PREPAID' },
  ]); //付款方式
  const customerTypeOptions = computed(() => [
    { label: t('typeCompany', '公司'), value: 'COMPANY' },
    { label: t('typeIndividual', '個人'), value: 'INDIVIDUAL' },
  ]); //客戶類型
  const customerSegmentOptions = computed(() => [
    { label: t('segmentRetail', '零售'), value: 'RETAIL' },
    { label: t('segmentWholesale', '批發'), value: 'WHOLESALE' },
    { label: t('segmentVip', 'VIP'), value: 'VIP' },
    { label: t('segmentCorporate', '企業'), value: 'CORPORATE' },
  ]); //客戶分類
  const customerSourceOptions = computed(() => [
    { label: t('sourceWebsite', '網站'), value: 'WEBSITE' },
    { label: t('sourceReferral', '推薦'), value: 'REFERRAL' },
    { label: t('sourceColdCall', '陌生開發'), value: 'COLD_CALL' },
    { label: t('sourceSocial', '社群媒體'), value: 'SOCIAL_MEDIA' },
    { label: t('sourceTradeShow', '展覽'), value: 'TRADE_SHOW' },
    { label: t('sourceOther', '其他'), value: 'OTHER' },
  ]); //客戶分類
  const customerStatusOptions = computed(() => [
    { label: t('statusActive', '啟用'), value: 'ACTIVE' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
    { label: t('statusDeleted', '已刪除'), value: 'DELETED' },
  ]); //客戶狀態
  const orderTypeTabs = computed(() => [
    { key: 'water', tabLabel: t('orderTabWater', '桶裝水'), title: t('orderTitleWater', '桶裝水訂單') },
    { key: 'egg', tabLabel: t('orderTabEgg', '雞蛋'), title: t('orderTitleEgg', '雞蛋訂單') },
    { key: 'dispenser', tabLabel: t('orderTabDispenser', '飲水機'), title: t('orderTitleDispenser', '飲水機訂單') },
  ]); //訂單類型分頁
  const weekDayOptions = computed(() => [
    { label: 1, text: t('weekdayMon', '星期一') },
    { label: 2, text: t('weekdayTue', '星期二') },
    { label: 3, text: t('weekdayWed', '星期三') },
    { label: 4, text: t('weekdayThu', '星期四') },
    { label: 5, text: t('weekdayFri', '星期五') },
    { label: 6, text: t('weekdaySat', '星期六') },
    { label: 7, text: t('weekdaySun', '星期日') },
  ]); //出貨星期(label=數字值, text=顯示文字)
  const categoryColors = {
    桶裝水: 'blue',
    雞蛋: 'orange',
    飲水機: 'green',
  }; //產品類別顏色 (用於比對來源資料)
  const statusColorMap = {
    ACTIVE: 'arcoblue',
    INACTIVE: 'orange',
    DELETED: 'red',
  }; //狀態顏色

  /** 工具函式 **/
  const buildLabelMap = (options) => {
    return options.reduce((map, option) => {
      map[option.value] = option.label;
      return map;
    }, {});
  }; //選項轉顯示文字
  const buildSelectOptionsWithAll = (options) => [{ label: t('all', '全部'), value: 'all' }, ...options]; //建立帶「全部」的下拉選項
  const getWeekDayText = (num) => weekDayOptions.value.find((o) => o.label === num)?.text || ''; //數字轉星期文字
  const getWeekDayNumber = (text) => weekDayOptions.value.find((o) => o.text === text)?.label || null; //星期文字轉數字
  const formatWeekDays = (nums) =>
    (nums || [])
      .map((n) => getWeekDayText(n))
      .filter(Boolean)
      .join('、') || '—'; //數字陣列轉星期文字（用於顯示）
  const convertWeekDaysToNumbers = (days) => (days || []).map((d) => getWeekDayNumber(d)).filter((n) => n !== null); //中文星期陣列轉數字陣列
  const convertNumbersToWeekDays = (nums) => (nums || []).map((n) => getWeekDayText(n)).filter(Boolean); //數字陣列轉中文星期陣列

  /** 權限相關 **/
  const permissionResourceOptions = computed(() => [
    { label: t('resourceKpi', '儀表板'), value: 'KPI' },
    { label: t('resourceUser', '員工管理'), value: 'USER' },
    { label: t('resourceCustomer', '客戶管理'), value: 'CUSTOMER' },
    { label: t('resourceVendor', '廠商管理'), value: 'VENDOR' },
    { label: t('resourceVehicle', '車輛管理'), value: 'VEHICLE' },
    { label: t('resourceDriver', '司機管理'), value: 'DRIVER' },
    { label: t('resourceProduct', '商品管理'), value: 'PRODUCT' },
    { label: t('resourceOrder', '訂單管理'), value: 'ORDER' },
    { label: t('resourceInventory', '庫存管理'), value: 'INVENTORY' },
    { label: t('resourceReport', '報表管理'), value: 'REPORT' },
    { label: t('resourceBilling', '帳務管理'), value: 'BILLING' },
    { label: t('resourceFile', '檔案管理'), value: 'FILE' },
    { label: t('resourceNotification', '通知管理'), value: 'NOTIFICATION' },
    { label: t('resourceRole', '角色管理'), value: 'ROLE' },
  ]); //權限資源選項
  const permissionResourceLabelMap = computed(() => buildLabelMap(permissionResourceOptions.value)); //權限資源 Map（value -> label）
  const permissionActionOptions = computed(() => [
    { label: t('actionCreate', '新增資料'), value: 'CREATE' },
    { label: t('actionRead', '讀取 / 查詢資料'), value: 'READ' },
    { label: t('actionUpdate', '更新 / 修改資料'), value: 'UPDATE' },
    { label: t('actionDelete', '刪除資料'), value: 'DELETE' },
    { label: t('actionExport', '匯出資料'), value: 'EXPORT' },
    { label: t('actionImport', '匯入資料'), value: 'IMPORT' },
  ]); //權限操作選項
  const permissionActionShortOptions = computed(() => [
    { label: t('actionCreateShort', '新增'), value: 'CREATE' },
    { label: t('actionReadShort', '讀取/查詢'), value: 'READ' },
    { label: t('actionUpdateShort', '更新'), value: 'UPDATE' },
    { label: t('actionDeleteShort', '刪除'), value: 'DELETE' },
    { label: t('actionExportShort', '匯出'), value: 'EXPORT' },
    { label: t('actionImportShort', '匯入'), value: 'IMPORT' },
  ]); //權限操作簡短標籤（用於 TreeSelect 等）
  const permissionActionLabelMap = computed(() => buildLabelMap(permissionActionOptions.value)); //權限操作 Map（value -> label）
  const permissionActionShortLabelMap = computed(() => buildLabelMap(permissionActionShortOptions.value));
  const permissionOwnOnlyOptions = computed(() => [
    { label: t('ownOnlyOptionAny', '不限制（可存取全部資料）'), value: 'ANY' },
    { label: t('ownOnlyOptionOwn', '僅限自己（只能存取自己的資料）'), value: 'OWN' },
  ]); //權限條件限制選項
  const roleTypeOptions = computed(() => [
    { label: t('all', '全部'), value: 'all' },
    { label: t('systemRole', '系統角色'), value: 'system' },
    { label: t('customRole', '自訂角色'), value: 'custom' },
  ]); //角色類型選項

  /** 訂單相關選項 **/
  const targetTypeOptions = computed(() => [
    { label: t('customer', '客戶'), value: 'CUSTOMER' },
    { label: t('vendor', '廠商'), value: 'VENDOR' },
  ]); //出貨對象類型
  const orderPaymentTermOptions = computed(() => [
    { label: t('cash', '現金'), value: 'CASH' },
    { label: t('monthly', '月結'), value: 'MONTHLY' },
    { label: t('prepaid', '預付'), value: 'PREPAID' },
  ]); //訂單付款方式
  const shipMethodOptions = computed(() => [
    { label: t('pickup', '自取'), value: 'PICKUP' },
    { label: t('driverDelivery', '司機送貨'), value: 'DRIVER_DELIVERY' },
    { label: t('courier', '宅配'), value: 'COURIER' },
  ]); //出貨方式
  const orderStatusOptions = computed(() => [
    { label: t('pending', '待出貨'), value: 'PENDING' },
    { label: t('processing', '處理中'), value: 'PROCESSING' },
    { label: t('delivered', '已完成'), value: 'DELIVERED' },
    { label: t('cancelled', '取消'), value: 'CANCELLED' },
  ]); //訂單狀態

  /** 訂單狀態轉換 Map **/
  const orderStatusLabelMap = {
    待出貨: 'PENDING',
    處理中: 'PROCESSING',
    已完成: 'DELIVERED',
    取消: 'CANCELLED',
  }; //後端中文狀態 → 前端 key
  const targetTypeLabelMap = {
    客戶: 'CUSTOMER',
    廠商: 'VENDOR',
    臨時客戶: 'TEMPORARY_CUSTOMER',
  }; //對象類型中文 → 英文
  const paymentMethodLabelMap = {
    現金: 'CASH',
    月結: 'MONTHLY',
    預付: 'PREPAID',
  }; //付款方式中文 → 英文
  const shipMethodLabelMap = {
    自取: 'PICKUP',
    司機送貨: 'DRIVER_DELIVERY',
    宅配: 'COURIER',
  }; //出貨方式中文 → 英文

  return {
    // 選項
    customerCategories,
    paymentOptions,
    customerTypeOptions,
    customerSegmentOptions,
    customerSourceOptions,
    customerStatusOptions,
    orderTypeTabs,
    weekDayOptions,
    categoryColors,
    statusColorMap,
    // 權限相關選項
    permissionResourceOptions,
    permissionResourceLabelMap,
    permissionActionOptions,
    permissionActionShortOptions,
    permissionActionLabelMap,
    permissionActionShortLabelMap,
    permissionOwnOnlyOptions,
    // 角色相關選項
    roleTypeOptions,
    // 訂單相關選項
    targetTypeOptions,
    orderPaymentTermOptions,
    shipMethodOptions,
    orderStatusOptions,
    // 訂單狀態轉換 Map
    orderStatusLabelMap,
    targetTypeLabelMap,
    paymentMethodLabelMap,
    shipMethodLabelMap,
    // 工具函式
    buildLabelMap,
    buildSelectOptionsWithAll,
    getWeekDayText,
    getWeekDayNumber,
    formatWeekDays,
    convertWeekDaysToNumbers,
    convertNumbersToWeekDays,
  };
}
