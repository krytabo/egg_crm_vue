<!-- src/pages/inventory-reports/components/InventoryReportsTab.vue 庫存報表 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 子分類切換 -->
    <div class="flex items-center gap-4">
      <a-radio-group v-model="reportType" type="button" @change="handleReportTypeChange">
        <a-radio value="valuation">{{ t("valuationReport", "估值報表") }}</a-radio>
        <a-radio value="turnover">{{ t("turnoverReport", "週轉報表") }}</a-radio>
      </a-radio-group>
    </div>

    <!-- 估值報表 -->
    <template v-if="reportType === 'valuation'">
      <!-- 篩選區塊＋摘要 -->
      <div class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm autoLabelWidth>
          <AFormItem :label="t('location', '存放位置')">
            <InfiniteSelect v-model="valuationFilters.location" dataSource="InventoryLocations" type="outline" :placeholder="t('allLocations', '所有位置')" allowClear @change="loadValuationReport" class="w-60" />
          </AFormItem>
        </AForm>
        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("totalItems", "總項目數") }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ valuationSummary.totalItems }}</p>
          </div>
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("totalQuantity", "總數量") }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(valuationSummary.totalQuantity) }}</p>
          </div>
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("totalValue", "總價值") }}</p>
            <p class="text-2xl font-semibold text-blue-600">NT$ {{ formatNumber(valuationSummary.totalValue) }}</p>
          </div>
        </div>
      </div>

      <!-- 報表明細列表 -->
      <CustomTinyGrid :data="valuationList" :height="systemStore.tableHeight" :border="true" row-key="productId">
        <CustomTinyGridColumn field="productName" :title="t('productName', '產品名稱')" min-width="240" fixed="left" />
        <CustomTinyGridColumn field="productCode" :title="t('productCode', '產品編號')" width="200" />
        <CustomTinyGridColumn field="unit" :title="t('unit', '單位')" width="80" align="center" />
        <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="100" align="right" />
        <CustomTinyGridColumn field="unitCost" :title="t('unitCost', '單位成本')" width="120" align="right">
          <template #default="{ row }">NT$ {{ formatNumber(row.unitCost) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="totalValue" :title="t('totalValue', '總價值')" width="150" align="right">
          <template #default="{ row }">
            <span class="font-semibold">NT$ {{ formatNumber(row.totalValue) }}</span>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
    </template>

    <!-- 週轉報表 -->
    <template v-if="reportType === 'turnover'">
      <!-- 篩選區塊＋摘要 -->
      <div class="flex flex-col gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm autoLabelWidth>
          <AFormItem :label="t('dateRange', '日期範圍')">
            <div class="flex items-center gap-2">
              <TinyDatePicker v-model="turnoverFilters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" @change="loadTurnoverReport" />
              <span>-</span>
              <TinyDatePicker v-model="turnoverFilters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" @change="loadTurnoverReport" />
            </div>
          </AFormItem>
        </AForm>
        <div class="grid grid-cols-4 gap-3">
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("totalProductsSold", "銷售產品數") }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ turnoverSummary.totalProductsSold }}</p>
          </div>
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("totalQuantitySold", "銷售總數量") }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(turnoverSummary.totalQuantitySold) }}</p>
          </div>
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("overallTurnoverRatio", "整體週轉率") }}</p>
            <p class="text-2xl font-semibold text-green-600">{{ turnoverSummary.overallTurnoverRatio?.toFixed(2) || "—" }}</p>
          </div>
          <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
            <p class="text-[18px]">{{ t("averageDaysInInventory", "平均庫存天數") }}</p>
            <div class="flex items-end gap-2">
              <p class="text-2xl font-semibold text-orange-600">{{ turnoverSummary.averageDaysInInventory?.toFixed(1) || "—" }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ t("days", "天") }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 報表明細列表 -->
      <CustomTinyGrid :data="turnoverList" :height="systemStore.tableHeight" :border="true" row-key="productId">
        <CustomTinyGridColumn field="productName" :title="t('productName', '產品名稱')" min-width="240" fixed="left" />
        <CustomTinyGridColumn field="productCode" :title="t('productCode', '產品編號')" width="200" />
        <CustomTinyGridColumn field="soldQuantity" :title="t('soldQuantity', '銷售數量')" width="100" align="right" />
        <CustomTinyGridColumn field="averageInventory" :title="t('averageInventory', '平均庫存')" width="100" align="right">
          <template #default="{ row }">{{ row.averageInventory?.toFixed(1) || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="turnoverRatio" :title="t('turnoverRatio', '週轉率')" width="100" align="right">
          <template #default="{ row }">
            <span :class="getTurnoverClass(row.turnoverRatio)">{{ row.turnoverRatio?.toFixed(2) || "—" }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="daysInInventory" :title="t('daysInInventory', '庫存天數')" width="100" align="right">
          <template #default="{ row }">
            <span :class="getDaysClass(row.daysInInventory)">{{ row.daysInInventory?.toFixed(1) || "—" }}</span>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from "vue";
import { InventoryReportValuationGet, InventoryReportTurnoverGet } from "@/assets/API/Inventory";
import { TinyDatePicker } from "@opentiny/vue";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import InfiniteSelect from "@/components/Form/InfiniteSelect.vue";
import { useMainStore } from "@/stores/LoadingStore";
import { useSystemStore } from "@/stores/system";
import { useI18n } from "vue-i18n";
import { subDays, format } from "date-fns";

const mainStore = useMainStore();
const systemStore = useSystemStore();
const { t } = useI18n();

const EMPTY_PLACEHOLDER = "—";
const formatNumber = (value) => {
  if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
  return Number(value).toLocaleString();
}; //格式化數字
const getTurnoverClass = (ratio) => {
  if (!ratio) return "";
  if (ratio >= 4) return "text-green-600 font-semibold";
  if (ratio >= 2) return "text-blue-600";
  return "text-orange-600";
}; //週轉率樣式
const getDaysClass = (days) => {
  if (!days) return "";
  if (days <= 30) return "text-green-600 font-semibold";
  if (days <= 90) return "text-blue-600";
  return "text-orange-600";
}; //庫存天數樣式

/** 報表類型 **/
const reportType = ref("valuation");
const handleReportTypeChange = () => {
  if (reportType.value === "valuation") {
    loadValuationReport();
  } else {
    loadTurnoverReport();
  }
}; //切換報表類型

/** 估值報表 **/
const valuationFilters = reactive({
  location: ""
});
const valuationSummary = reactive({
  totalItems: 0,
  totalQuantity: 0,
  totalValue: 0
});
const valuationList = ref([]);
const loadValuationReport = async () => {
  mainStore.setLoading(true);
  try {
    const params = {};
    if (valuationFilters.location) {
      params.location = typeof valuationFilters.location === "object" ? valuationFilters.location.value : valuationFilters.location;
    }
    const response = await InventoryReportValuationGet(params);
    const data = response?.data?.data || response?.data || {}; //處理 { success, data } 格式

    //更新摘要
    valuationSummary.totalItems = data.summary?.totalItems || 0;
    valuationSummary.totalQuantity = data.summary?.totalQuantity || 0;
    valuationSummary.totalValue = data.summary?.totalValue?.amount || 0;

    //更新列表
    let items = data.items || [];
    if (!Array.isArray(items)) items = [];
    valuationList.value = items.map((item) => ({
      productId: item.productId,
      productCode: item.productCode || EMPTY_PLACEHOLDER,
      productName: item.productName || EMPTY_PLACEHOLDER,
      unit: item.unit || EMPTY_PLACEHOLDER,
      quantity: item.quantity ?? 0,
      unitCost: item.unitCost?.amount ?? 0,
      totalValue: item.totalValue?.amount ?? 0
    }));
  } catch (error) {
    await mainStore.SWAL_Error(error);
    valuationList.value = [];
  } finally {
    mainStore.setLoading(false);
  }
}; //載入估值報表

/** 週轉報表 **/
const turnoverFilters = reactive({
  startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd")
});
const turnoverSummary = reactive({
  totalProductsSold: 0,
  totalQuantitySold: 0,
  overallTurnoverRatio: null,
  averageDaysInInventory: null
});
const turnoverList = ref([]);
const loadTurnoverReport = async () => {
  mainStore.setLoading(true);
  try {
    const params = {
      startDate: turnoverFilters.startDate,
      endDate: turnoverFilters.endDate
    };
    const response = await InventoryReportTurnoverGet(params);
    const data = response?.data?.data || response?.data || {}; //處理 { success, data } 格式

    //更新摘要
    turnoverSummary.totalProductsSold = data.summary?.totalProductsSold || 0;
    turnoverSummary.totalQuantitySold = data.summary?.totalQuantitySold || 0;
    turnoverSummary.overallTurnoverRatio = data.summary?.overallTurnoverRatio || null;
    turnoverSummary.averageDaysInInventory = data.summary?.averageDaysInInventory || null;

    //更新列表
    let products = data.products || [];
    if (!Array.isArray(products)) products = [];
    turnoverList.value = products.map((item) => ({
      productId: item.productId,
      productCode: item.productCode || EMPTY_PLACEHOLDER,
      productName: item.productName || EMPTY_PLACEHOLDER,
      soldQuantity: item.soldQuantity ?? 0,
      averageInventory: item.averageInventory ?? null,
      turnoverRatio: item.turnoverRatio ?? null,
      daysInInventory: item.daysInInventory ?? null
    }));
  } catch (error) {
    await mainStore.SWAL_Error(error);
    turnoverList.value = [];
  } finally {
    mainStore.setLoading(false);
  }
}; //載入週轉報表
const clearFilter = () => {
  if (reportType.value === "valuation") {
    valuationFilters.location = "";
    loadValuationReport();
  } else {
    turnoverFilters.startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
    turnoverFilters.endDate = format(new Date(), "yyyy-MM-dd");
    loadTurnoverReport();
  }
}; //清除篩選條件

defineExpose({
  clearFilter
});
onMounted(async () => {
  await loadValuationReport();

  /** Table高度相關 **/
  await nextTick();
  systemStore.updateTableHeight(510); //修改table高度
  const cleanup = systemStore.initializeWindowResize();
  onUnmounted(cleanup);
});
</script>
