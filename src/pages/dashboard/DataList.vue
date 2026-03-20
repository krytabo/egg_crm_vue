<!-- src/pages/dashboard/DashboardPage.vue 儀表板 -->
<template>
  <a-tabs v-model:active-key="activeTab" @tab-click="handleTabChange" class="dashboard_tab" size="large">
    <a-tab-pane :key="TAB_KEYS.OVERVIEW" :title="t('overview', '總覽')"></a-tab-pane>
    <a-tab-pane :key="TAB_KEYS.SALES" :title="t('salesStatistics', '銷售統計')"></a-tab-pane>
    <a-tab-pane :key="TAB_KEYS.PENDING_SHIPMENTS" :title="t('pendingShipmentStatistics', '待出貨統計')"></a-tab-pane>
    <a-tab-pane :key="TAB_KEYS.WATER_DEPOSITS" :title="t('waterDepositStatistics', '儲值統計')"></a-tab-pane>
    <a-tab-pane :key="TAB_KEYS.CUSTOMERS" :title="t('customerStatistics', '客戶統計')"></a-tab-pane>
    <a-tab-pane :key="TAB_KEYS.INVENTORY" :title="t('inventoryStatistics', '庫存統計')"></a-tab-pane>
  </a-tabs>
  <PerfectScrollbar class="h-[calc(100vh-184px)]! flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
    <!-- 總覽 Tab -->
    <template v-if="isOverview">
      <!-- 摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4" v-for="card in summaryCards" :key="card.title">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
            <p class="mt-1" :class="card.trendClass">{{ card.trend }}</p>
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
      <div class="flex flex-col gap-4 rounded-md bg-white p-6">
        <p class="flex-1 text-[22px]">{{ t('recentActivity', '近期活動') }}</p>
        <CustomTinyGrid :data="activities" :height="OVERVIEW_ScrollY" row-key="id">
          <CustomTinyGridColumn field="description" :title="t('description', '描述')" min-width="200" />
          <CustomTinyGridColumn field="userName" :title="t('operator', '操作者')" width="150" />
          <CustomTinyGridColumn field="relativeTime" :title="t('time', '時間')" width="160" align="right" />
        </CustomTinyGrid>
      </div>
    </template>

    <!-- 銷售統計 Tab -->
    <template v-if="isSales">
      <!-- 篩選區塊 -->
      <div class="flex items-center gap-4 rounded-md bg-white p-4">
        <!--<AForm layout="vertical">
          <div class="grid grid-cols-3 gap-4">
            <AFormItem :label="t('dateRange', '日期範圍')">
              <div class="flex items-center gap-2">
                <TinyDatePicker v-model="salesFilters.dateFrom" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" />
                <span>-</span>
                <TinyDatePicker v-model="salesFilters.dateTo" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" />
              </div>
            </AFormItem>
            <AFormItem :label="t('groupBy', '加總方式')">
              <TinySelect v-model="salesFilters.groupBy" :options="groupByOptions" :placeholder="t('pleaseSelect', '請選擇')" class="w-32" />
            </AFormItem>
            <AFormItem :label="t('productCategory', '產品類別')">
              <TinySelect v-model="salesFilters.productCategory" :options="productCategoryOptions" :placeholder="t('pleaseSelect', '請選擇')" clearable class="w-40" />
            </AFormItem>
            <div class="col-span-3 flex justify-end">
              <a-button type="primary" @click="loadSalesStatistics">{{ t('query', '查詢') }}</a-button>
            </div>
          </div>
        </AForm>-->

        <TinyRadioGroup v-model="salesFilters.groupBy" class="flex-1">
          <TinyRadio v-for="item in groupByOptions" :label="item.value">{{ item.label }}</TinyRadio>
        </TinyRadioGroup>
        <a-button type="primary" @click="loadSalesStatistics">{{ t('query', '查詢') }}</a-button>
      </div>

      <!-- 銷售摘要 -->
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="card in salesSummaryCards" :key="card.title" class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex w-full items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
          </div>
          <!--<p class="w-full text-xs" :class="card.trendClass">{{ card.trend }}</p>-->
        </div>
      </div>

      <!-- 銷售明細列表 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('salesBreakdown', '銷售明細') }}</p>
        <CustomTinyGrid :data="salesData.breakdown" :height="SALES_ScrollY" row-key="period">
          <CustomTinyGridColumn field="period" :title="t('period', '期間')" :width="200" />
          <CustomTinyGridColumn field="orderCount" :title="t('orderCount', '訂單數量')" :width="150" align="center" header-align="center" />
          <CustomTinyGridColumn field="revenue" :title="t('revenueAmount', '營收金額')" :width="150" align="right" header-align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.revenue) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="topProducts" :title="t('productName', '商品名稱')" min-width="300">
            <template #default="{ row }">
              <div v-if="row.topProducts && row.topProducts.length > 0" class="flex flex-wrap gap-1">
                <TinyBadge v-for="product in row.topProducts.slice(0, 3)" :key="product.productId" type="info">{{ product.productName }}</TinyBadge>
              </div>
              <span v-else class="text-gray-400">—</span>
            </template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </template>

    <!-- 待出貨統計 Tab -->
    <template v-if="isPendingShipments">
      <!-- 摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="card in pendingSummaryCards" :key="card.title" class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex w-full items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
          </div>
          <!--<p class="w-full" :class="card.trendClass">{{ card.trend }}</p>-->
        </div>
      </div>

      <!-- 類別分解 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('productBreakdown', '商品類別分解') }}</p>
        <CustomTinyGrid :data="pendingShipmentData.summary.productBreakdown" :height="PENDING_SHIPMENTS_ScrollY" row-key="categoryName">
          <CustomTinyGridColumn field="categoryName" :title="t('category', '類別')" min-width="180" />
          <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="120" align="right">
            <template #default="{ row }">{{ formatNumber(row.quantity) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="amount" :title="t('amount', '金額')" width="160" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.amount) }}</template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>

      <!-- 待出貨訂單列表 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('pendingOrderList', '待出貨訂單') }}</p>
        <CustomTinyGrid :data="pendingShipmentData.orders" :height="PENDING_SHIPMENTS_ScrollY" row-key="id">
          <CustomTinyGridColumn field="orderNumber" :title="t('orderNumber', '訂單編號')" :min-width="200" />
          <CustomTinyGridColumn field="customer.name" :title="t('customer', '客戶')" min-width="160">
            <template #default="{ row }">{{ row.customer?.name }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="120" align="center">
            <template #default="{ row }">
              <a-tag :color="statusColorMap[row.status] || 'gray'">{{ statusLabelMap[row.status] || row.status }}</a-tag>
            </template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="orderDate" :title="t('orderDate', '訂單日期')" width="160">
            <template #default="{ row }">{{ row.orderDate ? row.orderDate.slice(0, 10) : EMPTY_PLACEHOLDER }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="itemCount" :title="t('itemCount', '品項數')" width="100" align="right" />
          <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" width="160" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.totalAmount) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="driver" :title="t('driver', '司機')" :width="150">
            <template #default="{ row }">{{ row.driver?.name || EMPTY_PLACEHOLDER }}</template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </template>

    <!-- 儲值統計 Tab -->
    <template v-if="isWaterDeposits">
      <!-- 摘要卡片 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in depositSummaryCards" :key="card.title" class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex w-full items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
          </div>
          <p class="w-full" :class="card.trendClass">{{ card.trend }}</p>
        </div>
      </div>

      <!-- 客戶儲值明細 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('customerDepositDetail', '客戶儲值明細') }}</p>
        <CustomTinyGrid :data="depositData.customers" :height="CUSTOMERS_DEPOSITS_ScrollY" row-key="id" :tree-config="{ children: 'products' }">
          <CustomTinyGridColumn field="name" :title="t('nameTitle', '客戶／商品名稱')" min-width="200" tree-node />
          <CustomTinyGridColumn field="code" :title="t('code', '編號')" width="150" />
          <CustomTinyGridColumn field="depositCount" :title="t('depositCount', '儲值筆數')" width="100" align="right" />
          <CustomTinyGridColumn field="totalAmount" :title="t('totalDepositAmount', '儲值金額')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.totalAmount) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="remainingAmount" :title="t('remainingDepositAmount', '剩餘金額')" width="150" align="right">
            <template #default="{ row }">
              <span :class="row.remainingAmount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">{{ formatCurrencyNumber(row.remainingAmount) }}</span>
            </template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="totalQuantity" :title="t('totalDepositQuantity', '儲值數量')" width="120" align="right">
            <template #default="{ row }">{{ formatNumber(row.totalQuantity) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="remainingQuantity" :title="t('remainingDepositQuantity', '剩餘數量')" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.remainingQuantity > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">{{ formatNumber(row.remainingQuantity) }}</span>
            </template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>

      <!-- 依商品統計 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('depositByProduct', '依商品統計') }}</p>
        <CustomTinyGrid :data="depositProductBreakdown" :height="CUSTOMERS_DEPOSITS_ScrollY" row-key="id" :border="true">
          <CustomTinyGridColumn field="name" :title="t('productName', '商品名稱')" min-width="200" />
          <CustomTinyGridColumn field="depositCount" :title="t('depositCount', '儲值筆數')" width="100" align="right" />
          <CustomTinyGridColumn field="totalAmount" :title="t('totalDepositAmount', '儲值金額')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.totalAmount) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="remainingAmount" :title="t('remainingDepositAmount', '剩餘金額')" width="150" align="right">
            <template #default="{ row }">
              <span :class="row.remainingAmount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">{{ formatCurrencyNumber(row.remainingAmount) }}</span>
            </template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="totalQuantity" :title="t('totalDepositQuantity', '儲值數量')" width="120" align="right">
            <template #default="{ row }">{{ formatNumber(row.totalQuantity) }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="remainingQuantity" :title="t('remainingDepositQuantity', '剩餘數量')" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.remainingQuantity > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">{{ formatNumber(row.remainingQuantity) }}</span>
            </template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </template>

    <!-- 客戶統計 Tab -->
    <template v-if="isCustomers">
      <!-- 客戶摘要 -->
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="card in customerSummaryCards" :key="card.title" class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-4">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ card.title }}</p>
            <component :is="card.icon" class="tiny-svg-size text-blue-500" />
          </div>
          <div class="flex w-full items-center gap-2">
            <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
          </div>
          <!--<p class="w-full text-xs" :class="card.trendClass">{{ card.trend }}</p>-->
        </div>
      </div>

      <!-- Top 客戶 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('topCustomers', 'Top 客戶排名') }}</p>
        <CustomTinyGrid :data="customerData.topCustomers" :height="CUSTOMERS_ScrollY" row-key="customerId">
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
        <CustomTinyGrid :data="customerData.byCategory" :height="CUSTOMERS_ScrollY" row-key="category">
          <CustomTinyGridColumn field="category" :title="t('category', '類別')" min-width="200">
            <template #default="{ row }">{{ segmentDisplayMap[row.category] || row.category || '—' }}</template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="count" :title="t('customerCount', '客戶數')" width="120" align="right" />
          <CustomTinyGridColumn field="revenue" :title="t('revenue', '營收')" width="150" align="right">
            <template #default="{ row }">{{ formatCurrencyNumber(row.revenue) }}</template>
          </CustomTinyGridColumn>
        </CustomTinyGrid>
      </div>
    </template>

    <!-- 庫存統計 Tab -->
    <template v-if="isInventory">
      <!-- 類別庫存 -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="category in inventoryData.byCategory" :key="category.category" class="flex flex-col items-center justify-start gap-3 rounded-md bg-white p-4">
          <div class="flex w-full items-center">
            <p class="flex-1 text-[18px]">{{ category.category }}</p>
            <TinyBadge v-if="category.lowStockItems > 0" type="warning">{{ category.lowStockItems }} {{ t('lowStock', '低庫存') }}</TinyBadge>
          </div>
          <div class="flex w-full flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">{{ t('totalItems', '總品項數') }}</span>
              <span class="font-semibold text-gray-900">{{ category.totalItems }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">{{ t('totalValue', '總價值') }}</span>
              <span class="font-semibold text-blue-600">{{ formatCurrencyNumber(category.totalValue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期異動 -->
      <div class="flex flex-col gap-4 rounded-md bg-white p-4">
        <p class="text-[20px]">{{ t('recentTransactions', '近期庫存異動') }}</p>
        <CustomTinyGrid :data="inventoryData.recentTransactions" :height="INVENTORY_ScrollY" row-key="date">
          <CustomTinyGridColumn field="date" :title="t('date', '日期')" :min-width="150" />
          <CustomTinyGridColumn field="type" :title="t('type', '類型')" :min-width="120">
            <template #default="{ row }">
              <TinyBadge :type="row.type === 'IN' ? 'success' : 'warning'">{{ row.type === 'IN' ? t('stockIn', '入庫') : t('stockOut', '出庫') }}</TinyBadge>
            </template>
          </CustomTinyGridColumn>
          <CustomTinyGridColumn field="count" :title="t('quantity', '數量')" width="120" align="right" header-align="right" />
        </CustomTinyGrid>
      </div>
    </template>
  </PerfectScrollbar>
</template>

<script setup>
import { ref, reactive, onMounted, computed, markRaw, nextTick, onUnmounted } from 'vue';
import { StatisticsDashboardGet, StatisticsSalesGet, StatisticsInventoryGet, StatisticsCustomersGet, StatisticsWaterDepositsGet, StatisticsPendingShipmentsGet } from '@/assets/API/Statistics';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { TinyBadge, TinyRadioGroup, TinyRadio } from '@opentiny/vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useSystemStore } from '@/stores/system';
import { useCurrencyStore } from '@/stores/currency';
import { Waves, Droplet, Egg, ShoppingCart, Users, Box, TrendingUp, Wallet, Package, TrendingDown, UserPlus, Tag } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useSelectOptions } from '@/composables/useSelectOptions';

const mainStore = useMainStore();
const systemStore = useSystemStore();
const currencyStore = useCurrencyStore();
const { t } = useI18n();
const { customerSegmentOptions, buildLabelMap } = useSelectOptions();
const segmentDisplayMap = computed(() => buildLabelMap(customerSegmentOptions.value));
const { formatNumber, formatCurrencyNumber } = currencyStore;

/** icon相關 **/
const makeLucideIcon = (IconComp) => markRaw(IconComp);
const LucideDropletIcon = makeLucideIcon(Droplet);
const LucideEggIcon = makeLucideIcon(Egg);
const LucideWavesIcon = makeLucideIcon(Waves);
const userIcon = makeLucideIcon(Users);
const ShoppingCartIcon = makeLucideIcon(ShoppingCart);
const BoxIcon = makeLucideIcon(Box);
const TrendingUpIcon = makeLucideIcon(TrendingUp);
const WalletIcon = makeLucideIcon(Wallet);
const PackageIcon = makeLucideIcon(Package);
const TrendingDownIcon = makeLucideIcon(TrendingDown);
const UserPlusIcon = makeLucideIcon(UserPlus);
const TagIcon = makeLucideIcon(Tag);

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
const { height: windowHeight } = useWindowSize();
const OVERVIEW_ScrollY = computed(() => Math.max(windowHeight.value - 710, 100)); //總覽-近期活動
const SALES_ScrollY = computed(() => Math.max(windowHeight.value - 480, 100)); //銷售統計 - 銷售明細
const PENDING_SHIPMENTS_ScrollY = computed(() => Math.max(windowHeight.value - 750, 100)); //待出貨統計
const CUSTOMERS_DEPOSITS_ScrollY = computed(() => Math.max(windowHeight.value - 760, 100)); //儲值統計
const CUSTOMERS_ScrollY = computed(() => Math.max(windowHeight.value - 750, 100)); //客戶統計
const INVENTORY_ScrollY = computed(() => Math.max(windowHeight.value - 420, 100)); //庫存統計 - 近期庫存異動

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
  WATER_DEPOSITS: 5, //儲值統計
  PENDING_SHIPMENTS: 6, //待出貨統計
};
const activeTab = ref(TAB_KEYS.OVERVIEW);
const isOverview = computed(() => activeTab.value === TAB_KEYS.OVERVIEW); //總覽
const isSales = computed(() => activeTab.value === TAB_KEYS.SALES); //銷售統計
const isPendingShipments = computed(() => activeTab.value === TAB_KEYS.PENDING_SHIPMENTS); //待出貨統計
const isWaterDeposits = computed(() => activeTab.value === TAB_KEYS.WATER_DEPOSITS); //儲值統計
const isCustomers = computed(() => activeTab.value === TAB_KEYS.CUSTOMERS); //客戶統計
const isInventory = computed(() => activeTab.value === TAB_KEYS.INVENTORY); //庫存統計
const handleTabChange = async (key = TAB_KEYS.OVERVIEW) => {
  if (isOverview.value) await loadDashboardStatistics();
  if (isSales.value) await loadSalesStatistics();
  if (isInventory.value) await loadInventoryStatistics();
  if (isCustomers.value) await loadCustomerStatistics();
  if (isWaterDeposits.value) await loadWaterDepositStatistics();
  if (isPendingShipments.value) await loadPendingShipmentStatistics();
}; //切換 Tab

/** 總覽相關 **/
const summaryCards = ref([
  { title: t('totalCustomers', '客戶總數'), value: '—', trend: '', trendClass: 'text-gray-500', icon: userIcon },
  { title: t('monthlyOrders', '本月訂單'), value: '—', trend: '', trendClass: 'text-gray-500', icon: ShoppingCartIcon },
  { title: t('inventoryAlerts', '庫存警示'), value: '—', trend: '', trendClass: 'text-gray-500', icon: BoxIcon },
  { title: t('monthlyRevenue', '本月營收'), value: '—', trend: '', trendClass: 'text-gray-500', icon: TrendingUpIcon },
]); //摘要卡片
const orderBlocks = ref([]); //訂單統計
const activities = ref([]); //近期活動
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
      const categoryTitleMap = {
        EGG: t('eggOrders', '雞蛋訂單'),
        WATER: t('waterOrders', '飲水訂單'),
      };
      const categoryOrder = { EGG: 0, WATER: 1 };
      orderBlocks.value = data.ordersByCategory
        .filter((item) => item.category !== 'DISPENSER') // 飲水機訂單暫時隱藏
        .sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99))
        .map((item) => ({
          title: categoryTitleMap[item.category] || item.categoryName || item.category,
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
  dateFrom: '',
  dateTo: '',
  groupBy: 'day',
  productCategory: '',
});
const groupByOptions = [
  { label: t('byDay', '按日'), value: 'day' },
  { label: t('byWeek', '按週'), value: 'week' },
  { label: t('byMonth', '按月'), value: 'month' },
]; //分組選項
const productCategoryOptions = [
  // { label: '桶裝水', value: '桶裝水' },
  { label: '雞蛋類別', value: '雞蛋' },
  { label: '飲水類別', value: '飲水機' },
]; //商品種類選項
const salesData = reactive({
  summary: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
  breakdown: [],
});
const salesSummaryCards = computed(() => [
  {
    title: t('totalOrders', '總訂單數'),
    value: formatNumber(salesData.summary.totalOrders),
    trend: '',
    trendClass: 'text-gray-500',
    icon: ShoppingCartIcon,
  },
  {
    title: t('totalRevenue', '總營收'),
    value: formatCurrencyNumber(salesData.summary.totalRevenue),
    trend: '',
    trendClass: 'text-gray-500',
    icon: TrendingUpIcon,
  },
  {
    title: t('averageOrderValue', '平均訂單金額'),
    value: formatCurrencyNumber(salesData.summary.averageOrderValue),
    trend: '',
    trendClass: 'text-gray-500',
    icon: WalletIcon,
  },
]);
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
const customerSummaryCards = computed(() => [
  {
    title: t('newCustomersThisMonth', '本月新客戶'),
    value: formatNumber(customerData.newCustomersThisMonth),
    trend: '',
    trendClass: 'text-green-600',
    icon: UserPlusIcon,
  },
  {
    title: t('topCustomerCount', 'Top 客戶數'),
    value: formatNumber(customerData.topCustomers.length),
    trend: '',
    trendClass: 'text-gray-500',
    icon: userIcon,
  },
  {
    title: t('categoryCount', '客戶類別數'),
    value: formatNumber(customerData.byCategory.length),
    trend: '',
    trendClass: 'text-gray-500',
    icon: TagIcon,
  },
]);
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

/** 儲值統計相關 **/
const depositData = reactive({
  summary: {
    totalDeposits: 0,
    customerCount: 0,
    totalQuantity: 0,
    totalAmount: 0,
    totalRemainingQuantity: 0,
    totalRemainingAmount: 0,
    totalUsedQuantity: 0,
    totalUsedAmount: 0,
  },
  customers: [],
});

//從 customers 資料聚合出商品維度的統計
const depositProductBreakdown = computed(() => {
  const map = new Map();
  for (const customer of depositData.customers) {
    for (const product of customer.products || []) {
      if (map.has(product.id)) {
        const existing = map.get(product.id);
        existing.totalAmount += product.totalAmount;
        existing.remainingAmount += product.remainingAmount;
        existing.totalQuantity += product.totalQuantity;
        existing.remainingQuantity += product.remainingQuantity;
        existing.depositCount += product.depositCount;
      } else {
        map.set(product.id, { ...product });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount);
});
const depositSummaryCards = computed(() => {
  const s = depositData.summary;
  const usedAmountPct = s.totalAmount > 0 ? Math.round((s.totalUsedAmount / s.totalAmount) * 100) : 0;
  const usedQtyPct = s.totalQuantity > 0 ? Math.round((s.totalUsedQuantity / s.totalQuantity) * 100) : 0;
  return [
    /*{
      title: t('customerCount', '涵蓋客戶數'),
      value: `${formatNumber(s.customerCount)} ${t('customerUnit', '位')}`,
      trend: `${t('totalDeposits', '儲值紀錄')} ${formatNumber(s.totalDeposits)} ${t('countUnit', '筆')}`,
      trendClass: 'text-gray-500',
      icon: userIcon,
    },*/
    {
      title: t('totalDepositAmount', '儲值總金額'),
      value: formatCurrencyNumber(s.totalAmount),
      trend: `${t('remainingDepositAmount', '剩餘')} ${formatCurrencyNumber(s.totalRemainingAmount)}`,
      trendClass: s.totalRemainingAmount > 0 ? 'text-green-600' : 'text-gray-400',
      icon: WalletIcon,
    },
    /*{
      title: t('usedDepositAmount', '已使用金額'),
      value: formatCurrencyNumber(s.totalUsedAmount),
      trend: `${t('usedRate', '使用率')} ${usedAmountPct}%`,
      trendClass: usedAmountPct > 80 ? 'text-orange-500' : 'text-gray-500',
      icon: TrendingDownIcon,
    },*/
    {
      title: t('totalDepositQuantity', '儲值總數量'),
      value: formatNumber(s.totalQuantity),
      trend: `${t('remainingDepositQuantity', '剩餘')} ${formatNumber(s.totalRemainingQuantity)}  /  ${t('usedRate', '使用率')} ${usedQtyPct}%`,
      trendClass: s.totalRemainingQuantity > 0 ? 'text-green-600' : 'text-gray-400',
      icon: PackageIcon,
    },
  ];
});
const loadWaterDepositStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const response = await StatisticsWaterDepositsGet();
    const data = response?.data?.data || {};
    if (data.summary) {
      Object.assign(depositData.summary, data.summary);
    }
    depositData.customers = data.customers || [];
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入儲值統計

/** 待出貨統計相關 **/
const statusColorMap = {
  PENDING: 'orangered',
  CONFIRMED: 'blue',
  PROCESSING: 'orange',
};
const statusLabelMap = {
  PENDING: t('pending', '待處理'),
  CONFIRMED: t('confirmed', '已確認'),
  PROCESSING: t('processing', '處理中'),
};
const pendingShipmentData = reactive({
  summary: {
    totalPending: 0,
    totalAmount: 0,
    byStatus: {},
    productBreakdown: [],
  },
  orders: [],
});
const pendingSummaryCards = computed(() => {
  const s = pendingShipmentData.summary;
  const statusParts = Object.entries(s.byStatus || {})
    .map(([status, count]) => `${statusLabelMap[status] || status}: ${count}`)
    .join('　');
  return [
    {
      title: t('pendingOrderCount', '待出貨訂單數'),
      value: formatNumber(s.totalPending),
      trend: statusParts,
      trendClass: 'text-gray-500',
      icon: BoxIcon,
    },
    {
      title: t('pendingOrderAmount', '待出貨總金額'),
      value: formatCurrencyNumber(s.totalAmount),
      trend: '',
      trendClass: 'text-gray-500',
      icon: WalletIcon,
    },
  ];
});
const loadPendingShipmentStatistics = async () => {
  mainStore.setLoading(true);
  try {
    const response = await StatisticsPendingShipmentsGet();
    const data = response?.data?.data || response?.data || {};
    if (data.summary) {
      Object.assign(pendingShipmentData.summary, data.summary);
    }
    if (Array.isArray(data.orders)) {
      pendingShipmentData.orders = data.orders;
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入待出貨統計

onMounted(async () => {
  await handleTabChange(activeTab.value);

  /** Table高度相關 **/
  await nextTick();
  const cleanup = systemStore.initializeWindowResize();
  onUnmounted(cleanup);
});
</script>

<style lang="scss">
.dashboard_tab {
  .arco-tabs-content {
    padding-top: 0 !important;
  }
}
</style>
