<!-- src/pages/dashboard/DashboardPage.vue 儀表板 -->
<template>
  <div class="p-2">
    <!-- 頁面標題與操作 -->
    <!--<div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">{{ t("dashboard", "儀表板") }}</h1>
        <p class="text-gray-500">{{ t("welcomeBack", "歡迎回到 CRM 管理系統") }}</p>
      </div>
      <a-button type="primary" @click="openShippingDialog">{{ t("generateDailyReport", "產生出貨日報表") }}</a-button>
    </div>-->

    <!-- Tab 頁籤 -->
    <a-tabs v-model:active-key="activeTab" @tab-click="handleTabChange">
      <a-tab-pane :key="TAB_KEYS.OVERVIEW" :title="t('overview', '總覽')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.SALES" :title="t('salesStatistics', '銷售統計')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.INVENTORY" :title="t('inventoryStatistics', '庫存統計')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.CUSTOMERS" :title="t('customerStatistics', '客戶統計')"></a-tab-pane>
    </a-tabs>

    <!-- 總覽 Tab -->
    <div v-if="isOverview" class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
      <!-- 摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4" v-for="card in summaryCards" :key="card.title">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
            <p class="mt-1 text-xs" :class="card.trendClass">{{ card.trend }}</p>
          </div>
        </div>
      </div>

      <!-- 訂單統計區塊 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="flex flex-col items-center justify-start gap-6 rounded-md bg-white p-5" v-for="block in orderBlocks" :key="block.title">
          <div class="flex w-full items-center justify-start gap-1">
            <component :is="block.icon" class="tiny-svg-size text-blue-500" />
            <p class="text-[20px]">{{ block.title }}</p>
          </div>
          <div class="flex w-full flex-col items-center gap-3 text-[16px]">
            <div v-for="item in block.stats" :key="item.label" class="flex w-full items-center">
              <span class="flex-1 text-gray-600">{{ item.label }}</span>
              <span class="font-medium text-gray-900">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期活動 -->
      <div class="flex flex-col gap-6 rounded-md bg-white p-6">
        <p class="flex-1 text-[22px]">{{ t('recentActivity', '近期活動') }}</p>
        <PerfectScrollbar class="flex flex-col gap-2" :style="{ height: `${systemStore.tableHeight}px` }">
          <div v-if="activities.length === 0" class="py-8 text-center text-gray-500">{{ t('noRecentActivity', '暫無近期活動') }}</div>
          <div v-for="activity in activities" :key="activity.id" class="flex items-center justify-between border-b border-gray-100 px-4 pb-3 last:border-none last:pb-0">
            <div>
              <p class="text-gray-900">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ activity.userName }}</p>
            </div>
            <span class="text-xs text-gray-500">{{ activity.relativeTime }}</span>
          </div>
        </PerfectScrollbar>
      </div>
    </div>

    <!-- 銷售統計 Tab -->
    <div v-if="isSales" class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
      <!-- 篩選區塊 -->
      <div class="flex flex-wrap items-end gap-4 rounded-md bg-white p-4">
        <AForm layout="vertical">
          <div class="flex flex-wrap gap-4">
            <AFormItem :label="t('dateRange', '日期範圍')">
              <div class="flex items-center gap-2">
                <TinyDatePicker v-model="salesFilters.dateFrom" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" />
                <span>-</span>
                <TinyDatePicker v-model="salesFilters.dateTo" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" />
              </div>
            </AFormItem>
            <AFormItem :label="t('groupBy', '分組方式')">
              <TinySelect v-model="salesFilters.groupBy" :options="groupByOptions" :placeholder="t('pleaseSelect', '請選擇')" class="w-32" />
            </AFormItem>
            <AFormItem :label="t('productCategory', '產品類別')">
              <TinySelect v-model="salesFilters.productCategory" :options="productCategoryOptions" :placeholder="t('all', '全部')" clearable class="w-32" />
            </AFormItem>
            <AFormItem :label="' '">
              <a-button type="primary" @click="loadSalesStatistics">{{ t('query', '查詢') }}</a-button>
            </AFormItem>
          </div>
        </AForm>
      </div>

      <!-- 銷售摘要 -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('totalOrders', '總訂單數') }}</p>
          <div class="text-2xl font-semibold text-gray-900">{{ formatNumber(salesData.summary.totalOrders) }}</div>
        </div>
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('totalRevenue', '總營收') }}</p>
          <div class="text-2xl font-semibold text-blue-600">{{ formatCurrencyNumber(salesData.summary.totalRevenue) }}</div>
        </div>
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('averageOrderValue', '平均訂單金額') }}</p>
          <div class="text-2xl font-semibold text-green-600">{{ formatCurrencyNumber(salesData.summary.averageOrderValue) }}</div>
        </div>
      </div>

      <!-- 銷售明細列表 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('salesBreakdown', '銷售明細') }}</p>
        <CustomTinyGrid :data="salesData.breakdown" :height="systemStore.tableHeight" row-key="period">
          <CustomTinyGridColumn field="period" :title="t('period', '期間')" width="150" />
          <CustomTinyGridColumn field="orderCount" :title="t('orderCount', '訂單數')" width="120" align="right" />
          <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.revenue) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="topProducts" :title="t('topProducts', '熱銷商品')" min-width="300">
            <template #default="{ row }">
              <div v-if="row.topProducts && row.topProducts.length > 0" class="flex flex-wrap gap-1">
                <TinyBadge v-for="product in row.topProducts.slice(0, 3)" :key="product.productId" type="info">{{ product.productName }}</TinyBadge>
              </div>
              <span v-else class="text-gray-400">—</span>
            </template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </div>

    <!-- 庫存統計 Tab -->
    <div v-if="isInventory" class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
      <!-- 類別庫存 -->
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="category in inventoryData.byCategory" :key="category.category" class="flex flex-col gap-4 rounded-md bg-white p-4">
          <div class="flex items-center justify-between">
            <p class="text-[18px]">{{ category.category }}</p>
            <TinyBadge v-if="category.lowStockItems > 0" type="warning">{{ category.lowStockItems }} {{ t('lowStock', '低庫存') }}</TinyBadge>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-[16px]">
              <span class="text-gray-600">{{ t('totalItems', '總品項數') }}</span>
              <span class="font-medium text-gray-900">{{ category.totalItems }}</span>
            </div>
            <div class="flex justify-between text-[16px]">
              <span class="text-gray-600">{{ t('totalValue', '總價值') }}</span>
              <span class="font-medium text-blue-600">{{ formatCurrencyNumber(category.totalValue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期異動 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('recentTransactions', '近期庫存異動') }}</p>
        <CustomTinyGrid :data="inventoryData.recentTransactions" :height="systemStore.tableHeight" row-key="date">
          <CustomTinyGridColumn field="date" :title="t('date', '日期')" width="150" />
          <CustomTinyGridColumn field="type" :title="t('type', '類型')" width="120">
            <template #default="{ row }">
              <TinyBadge :type="row.type === 'IN' ? 'success' : 'warning'">{{ row.type === 'IN' ? t('stockIn', '入庫') : t('stockOut', '出庫') }}</TinyBadge>
            </template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="count" :title="t('quantity', '數量')" width="120" align="right" />
        </CustomTinyGrid>
      </div>
    </div>

    <!-- 客戶統計 Tab -->
    <div v-if="isCustomers" class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
      <!-- 客戶摘要 -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('newCustomersThisMonth', '本月新客戶') }}</p>
          <div class="text-2xl font-semibold text-green-600">{{ customerData.newCustomersThisMonth }}</div>
        </div>
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('topCustomerCount', 'Top 客戶數') }}</p>
          <div class="text-2xl font-semibold text-gray-900">{{ customerData.topCustomers.length }}</div>
        </div>
        <div class="flex flex-col gap-2 rounded-md bg-white p-4">
          <p class="text-[16px] text-gray-500">{{ t('categoryCount', '客戶類別數') }}</p>
          <div class="text-2xl font-semibold text-gray-900">{{ customerData.byCategory.length }}</div>
        </div>
      </div>

      <!-- Top 客戶 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('topCustomers', 'Top 客戶排名') }}</p>
        <CustomTinyGrid :data="customerData.topCustomers" :height="300" row-key="customerId">
          <CustomTinyGridColumn type="index" field="" :title="t('rank', '排名')" width="80" align="center" />
          <CustomTinyGridColumn field="customerName" :title="t('customerName', '客戶名稱')" min-width="200" />
          <CustomTinyGridColumn field="totalOrders" :title="t('totalOrders', '總訂單數')" width="120" align="right" />
          <CustomTinyGridColumn field="totalRevenue" :title="t('totalRevenue', '總營收')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.totalRevenue) }}</template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>

      <!-- 客戶類別分佈 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('customerByCategory', '客戶類別分佈') }}</p>
        <CustomTinyGrid :data="customerData.byCategory" :height="300" row-key="category">
          <CustomTinyGridColumn field="category" :title="t('category', '類別')" min-width="200" />
          <CustomTinyGridColumn field="count" :title="t('customerCount', '客戶數')" width="120" align="right" />
          <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.revenue) }}</template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </div>

    <!-- 出貨日報表彈窗 -->
    <DailyShippingReportDialog v-model="isDialogOpen" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, markRaw, nextTick, onUnmounted } from 'vue';
import { StatisticsDashboardGet, StatisticsSalesGet, StatisticsInventoryGet, StatisticsCustomersGet } from '@/assets/API/Statistics';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { TinyDatePicker, TinySelect, TinyBadge } from '@opentiny/vue';
import DailyShippingReportDialog from '@/components/dialogs/DailyShippingReportDialog.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useSystemStore } from '@/stores/system';
import { useCurrencyStore } from '@/stores/currency';
import { Waves, Droplet, Egg, ShoppingCart, Users, Box, TrendingUp } from 'lucide-vue-next';
import { format, subDays } from 'date-fns';
import { useI18n } from 'vue-i18n';

const mainStore = useMainStore();
const systemStore = useSystemStore();
const currencyStore = useCurrencyStore();
const { t } = useI18n();
const { formatNumber, formatCurrencyNumber } = currencyStore;
const makeLucideIcon = (IconComp) => markRaw(IconComp);
const LucideDropletIcon = makeLucideIcon(Droplet);
const LucideEggIcon = makeLucideIcon(Egg);
const LucideWavesIcon = makeLucideIcon(Waves);
const userIcon = makeLucideIcon(Users);
const ShoppingCartIcon = makeLucideIcon(ShoppingCart);
const BoxIcon = makeLucideIcon(Box);
const TrendingUpIcon = makeLucideIcon(TrendingUp);

/** 常數相關 **/
const EMPTY_PLACEHOLDER = '—';
const formatPercentage = (value) => {
  if (value === null || value === undefined) return '';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}%`;
}; //格式化百分比

/** Tab 相關 **/
const TAB_KEYS = {
  OVERVIEW: 1, //總覽
  SALES: 2, //銷售統計
  INVENTORY: 3, //庫存統計
  CUSTOMERS: 4, //客戶統計
};
const activeTab = ref(TAB_KEYS.OVERVIEW);
const isOverview = computed(() => activeTab.value === TAB_KEYS.OVERVIEW);
const isSales = computed(() => activeTab.value === TAB_KEYS.SALES);
const isInventory = computed(() => activeTab.value === TAB_KEYS.INVENTORY);
const isCustomers = computed(() => activeTab.value === TAB_KEYS.CUSTOMERS);
const handleTabChange = async (key = TAB_KEYS.OVERVIEW) => {
  if (isOverview.value) await loadDashboardStatistics();
  if (isSales.value) await loadSalesStatistics();
  if (isInventory.value) await loadInventoryStatistics();
  if (isCustomers.value) await loadCustomerStatistics();
}; //切換 Tab

/** 總覽相關 **/
const isDialogOpen = ref(false);
const summaryCards = ref([
  { title: t('totalCustomers', '客戶總數'), value: '—', trend: '', trendClass: 'text-gray-500', icon: userIcon },
  { title: t('monthlyOrders', '本月訂單'), value: '—', trend: '', trendClass: 'text-gray-500', icon: ShoppingCartIcon },
  { title: t('inventoryAlerts', '庫存警示'), value: '—', trend: '', trendClass: 'text-gray-500', icon: BoxIcon },
  { title: t('monthlyRevenue', '本月營收'), value: '—', trend: '', trendClass: 'text-gray-500', icon: TrendingUpIcon },
]); //摘要卡片
const orderBlocks = ref([]); //訂單統計
const activities = ref([]); //近期活動
const openShippingDialog = () => {
  isDialogOpen.value = true;
}; //開啟日報表

const loadDashboardStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const response = await StatisticsDashboardGet();
    const data = response?.data?.data || response?.data || {};

    //更新摘要卡片
    if (data.summaryCards) {
      const cards = data.summaryCards;
      summaryCards.value = [
        {
          title: t('totalCustomers', '客戶總數'),
          value: formatNumber(cards.totalCustomers?.value),
          trend: cards.totalCustomers?.percentageChange !== null ? `${formatPercentage(cards.totalCustomers?.percentageChange)} ${t('vsLastMonth', '較上月')}` : '',
          trendClass: cards.totalCustomers?.percentageChange > 0 ? 'text-green-600' : cards.totalCustomers?.percentageChange < 0 ? 'text-red-600' : 'text-gray-500',
          icon: userIcon,
        },
        {
          title: t('monthlyOrders', '本月訂單'),
          value: formatNumber(cards.monthlyOrders?.value),
          trend: cards.monthlyOrders?.percentageChange !== null ? `${formatPercentage(cards.monthlyOrders?.percentageChange)} ${t('vsLastMonth', '較上月')}` : '',
          trendClass: cards.monthlyOrders?.percentageChange > 0 ? 'text-green-600' : cards.monthlyOrders?.percentageChange < 0 ? 'text-red-600' : 'text-gray-500',
          icon: ShoppingCartIcon,
        },
        {
          title: t('inventoryAlerts', '庫存警示'),
          value: formatNumber(cards.inventoryAlerts?.value),
          trend: cards.inventoryAlerts?.label || t('belowSafetyStock', '低於安全庫存'),
          trendClass: cards.inventoryAlerts?.value > 0 ? 'text-orange-600' : 'text-gray-500',
          icon: BoxIcon,
        },
        {
          title: t('monthlyRevenue', '本月營收'),
          value: formatCurrencyNumber(cards.monthlyRevenue?.value),
          trend: cards.monthlyRevenue?.percentageChange !== null ? `${formatPercentage(cards.monthlyRevenue?.percentageChange)} ${t('vsLastMonth', '較上月')}` : '',
          trendClass: cards.monthlyRevenue?.percentageChange > 0 ? 'text-green-600' : cards.monthlyRevenue?.percentageChange < 0 ? 'text-red-600' : 'text-gray-500',
          icon: TrendingUpIcon,
        },
      ];
    }

    //更新訂單統計
    if (data.ordersByCategory && Array.isArray(data.ordersByCategory)) {
      orderBlocks.value = data.ordersByCategory.map((item) => ({
        title: item.categoryName || item.category,
        stats: [
          { label: t('pending', '待出貨'), value: item.pending || 0 },
          { label: t('shipped', '已出貨'), value: item.shipped || 0 },
          { label: t('completed', '已完成'), value: item.completed || 0 },
        ],
        icon: getIconByCategory(item.category),
      }));
    }

    //更新近期活動
    if (data.recentActivity && Array.isArray(data.recentActivity)) {
      activities.value = data.recentActivity;
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入儀表板統計
const getIconByCategory = (category) => {
  const iconMap = {
    WATER: LucideDropletIcon,
    EGG: LucideEggIcon,
    DISPENSER: LucideWavesIcon,
  };
  return iconMap[category] || ShoppingCartIcon;
}; //依類別取得圖示

/** 銷售統計相關 **/
const salesFilters = reactive({
  dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  dateTo: format(new Date(), 'yyyy-MM-dd'),
  groupBy: 'day',
  productCategory: '',
});
const groupByOptions = [
  { label: t('byDay', '按日'), value: 'day' },
  { label: t('byWeek', '按週'), value: 'week' },
  { label: t('byMonth', '按月'), value: 'month' },
]; //分組選項
const productCategoryOptions = [
  { label: t('water', '飲水'), value: '飲水' },
  { label: t('egg', '雞蛋'), value: '雞蛋' },
  { label: t('dispenser', '飲水機'), value: '飲水機' },
]; //產品類別選項
const salesData = reactive({
  summary: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
  breakdown: [],
});
const loadSalesStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const params = { ...salesFilters };
    if (!params.productCategory) delete params.productCategory;
    const response = await StatisticsSalesGet(params);
    const data = response?.data?.data || response?.data || {};

    if (data.summary) {
      salesData.summary = data.summary;
    }
    if (data.breakdown && Array.isArray(data.breakdown)) {
      salesData.breakdown = data.breakdown;
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入銷售統計

/** 庫存統計相關 **/
const inventoryData = reactive({
  byCategory: [],
  recentTransactions: [],
});
const loadInventoryStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const response = await StatisticsInventoryGet();
    const data = response?.data?.data || response?.data || {};

    if (data.byCategory && Array.isArray(data.byCategory)) {
      inventoryData.byCategory = data.byCategory;
    }
    if (data.recentTransactions && Array.isArray(data.recentTransactions)) {
      inventoryData.recentTransactions = data.recentTransactions;
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入庫存統計

/** 客戶統計相關 **/
const customerData = reactive({
  topCustomers: [],
  byCategory: [],
  newCustomersThisMonth: 0,
});
const loadCustomerStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const response = await StatisticsCustomersGet();
    const data = response?.data?.data || response?.data || {};

    if (data.topCustomers && Array.isArray(data.topCustomers)) {
      customerData.topCustomers = data.topCustomers;
    }
    if (data.byCategory && Array.isArray(data.byCategory)) {
      customerData.byCategory = data.byCategory;
    }
    customerData.newCustomersThisMonth = data.newCustomersThisMonth || 0;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入客戶統計

onMounted(async () => {
  await handleTabChange(activeTab.value);

  /** Table高度相關 **/
  await nextTick();
  systemStore.updateTableHeight(640); //修改table高度
  const cleanup = systemStore.initializeWindowResize();
  onUnmounted(cleanup);
});
</script>
