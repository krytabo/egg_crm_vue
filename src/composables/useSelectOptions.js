// src/composables/useSelectOptions.js
// 共用選項管理 - 統一管理前端自定義的下拉選單選項
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useSelectOptions() {
  const { t } = useI18n();

  /** 客戶類別 **/
  const customerCategories = computed(() => [
    { label: t('categoryBottledWater', '桶裝水'), text: t('categoryBottledWater', '桶裝水') },
    { label: t('categoryEgg', '雞蛋'), text: t('categoryEgg', '雞蛋') },
    { label: t('categoryDispenser', '飲水機'), text: t('categoryDispenser', '飲水機') },
  ]);

  /** 付款方式 **/
  const paymentOptions = computed(() => [
    { label: t('cash', '現金'), value: '現金' },
    { label: t('monthly', '月結'), value: '月結' },
    { label: t('預付', '預付'), value: '預付' },
    // { label: t('transfer', '轉帳'), value: '轉帳' },
    // { label: t('check', '票據'), value: '票據' },
  ]);

  /** 客戶類型 **/
  const customerTypeOptions = computed(() => [
    { label: t('typeCompany', '公司'), value: 'COMPANY' },
    { label: t('typeIndividual', '個人'), value: 'INDIVIDUAL' },
  ]);

  /** 客戶分類 **/
  const customerSegmentOptions = computed(() => [
    { label: t('segmentRetail', '零售'), value: 'RETAIL' },
    { label: t('segmentWholesale', '批發'), value: 'WHOLESALE' },
    { label: t('segmentVip', 'VIP'), value: 'VIP' },
    { label: t('segmentCorporate', '企業'), value: 'CORPORATE' },
  ]);

  /** 客戶來源 **/
  const customerSourceOptions = computed(() => [
    { label: t('sourceWebsite', '網站'), value: 'WEBSITE' },
    { label: t('sourceReferral', '推薦'), value: 'REFERRAL' },
    { label: t('sourceColdCall', '陌生開發'), value: 'COLD_CALL' },
    { label: t('sourceSocial', '社群媒體'), value: 'SOCIAL_MEDIA' },
    { label: t('sourceTradeShow', '展覽'), value: 'TRADE_SHOW' },
    { label: t('sourceOther', '其他'), value: 'OTHER' },
  ]);

  /** 客戶狀態 **/
  const customerStatusOptions = computed(() => [
    { label: t('statusActive', '啟用'), value: 'ACTIVE' },
    { label: t('statusInactive', '停用'), value: 'INACTIVE' },
    { label: t('statusDeleted', '已刪除'), value: 'DELETED' },
  ]);

  /** 訂單類型分頁 **/
  const orderTypeTabs = computed(() => [
    { key: 'water', tabLabel: t('orderTabWater', '桶裝水'), title: t('orderTitleWater', '桶裝水訂單') },
    { key: 'egg', tabLabel: t('orderTabEgg', '雞蛋'), title: t('orderTitleEgg', '雞蛋訂單') },
    { key: 'dispenser', tabLabel: t('orderTabDispenser', '飲水機'), title: t('orderTitleDispenser', '飲水機訂單') },
  ]);

  /** 出貨星期 (label=數字值, text=顯示文字) **/
  const weekDayOptions = computed(() => [
    { label: 1, text: t('weekdayMon', '星期一') },
    { label: 2, text: t('weekdayTue', '星期二') },
    { label: 3, text: t('weekdayWed', '星期三') },
    { label: 4, text: t('weekdayThu', '星期四') },
    { label: 5, text: t('weekdayFri', '星期五') },
    { label: 6, text: t('weekdaySat', '星期六') },
    { label: 7, text: t('weekdaySun', '星期日') },
  ]);

  /** 產品類別顏色 (用於比對來源資料) **/
  const categoryColors = {
    桶裝水: 'blue',
    雞蛋: 'orange',
    飲水機: 'green',
  };

  /** 狀態顏色 **/
  const statusColorMap = {
    ACTIVE: 'arcoblue',
    INACTIVE: 'orange',
    DELETED: 'red',
  };

  /** 工具函式：選項轉顯示文字 Map **/
  const buildLabelMap = (options) => {
    return options.reduce((map, option) => {
      map[option.value] = option.label;
      return map;
    }, {});
  };

  /** 工具函式：建立帶「全部」的下拉選項 **/
  const buildSelectOptionsWithAll = (options) => [{ label: t('all', '全部'), value: 'all' }, ...options];

  /** 工具函式：數字轉星期文字 **/
  const getWeekDayText = (num) => weekDayOptions.value.find((o) => o.label === num)?.text || '';

  /** 工具函式：星期文字轉數字 **/
  const getWeekDayNumber = (text) => weekDayOptions.value.find((o) => o.text === text)?.label || null;

  /** 工具函式：數字陣列轉星期文字（用於顯示） **/
  const formatWeekDays = (nums) =>
    (nums || [])
      .map((n) => getWeekDayText(n))
      .filter(Boolean)
      .join('、') || '—';

  /** 工具函式：中文星期陣列轉數字陣列 **/
  const convertWeekDaysToNumbers = (days) => (days || []).map((d) => getWeekDayNumber(d)).filter((n) => n !== null);

  /** 工具函式：數字陣列轉中文星期陣列 **/
  const convertNumbersToWeekDays = (nums) => (nums || []).map((n) => getWeekDayText(n)).filter(Boolean);

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
