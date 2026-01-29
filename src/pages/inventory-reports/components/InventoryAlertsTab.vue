<!-- src/pages/inventory-reports/components/InventoryAlertsTab.vue 庫存警示 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 子分類切換 -->
    <div class="flex items-center gap-4">
      <a-radio-group v-model="alertType" type="button" @change="handleAlertTypeChange">
        <a-radio value="lowStock">
          <div class="flex items-center gap-2">
            <p>{{ t("lowStock", "低庫存") }}</p>
            <p>({{ counts.lowStock }})</p>
          </div>
        </a-radio>
        <a-radio value="outOfStock">
          <div class="flex items-center gap-2">
            <p>{{ t("outOfStock", "缺貨") }}</p>
            <p>({{ counts.outOfStock }})</p>
          </div>
        </a-radio>
        <a-radio value="reorder">
          <div class="flex items-center gap-2">
            <p>{{ t("needReorder", "需補貨") }}</p>
            <p>({{ counts.reorder }})</p>
          </div>
        </a-radio>
      </a-radio-group>
    </div>

    <!-- 列表 -->
    <CustomTinyGrid :data="alertList" :height="systemStore.tableHeight" :border="true" row-key="productId">
      <CustomTinyGridColumn field="productName" :title="t('productName', '產品名稱')" min-width="200" fixed="left" />
      <CustomTinyGridColumn field="productCode" :title="t('productCode', '產品編號')" width="150" />
      <CustomTinyGridColumn field="unit" :title="t('unit', '單位')" width="80" align="center" />
      <CustomTinyGridColumn field="currentStock" :title="t('currentStock', '目前庫存')" width="100" align="right">
        <template #default="{ row }">
          <span :class="row.currentStock === 0 ? 'font-semibold text-red-600' : 'text-orange-600'">{{ row.currentStock }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="minStock" :title="t('minStock', '最低庫存')" width="100" align="right" />
      <CustomTinyGridColumn field="reorderPoint" :title="t('reorderPoint', '補貨點')" width="100" align="right" />
      <CustomTinyGridColumn field="shortfall" :title="t('shortfall', '缺口數量')" width="100" align="right">
        <template #default="{ row }">
          <span class="text-red-600">{{ row.shortfall }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="suggestedOrderQuantity" :title="t('suggestedOrderQuantity', '建議訂購量')" width="120" align="right">
        <template #default="{ row }">
          <span class="font-semibold text-blue-600">{{ row.suggestedOrderQuantity }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="vendorName" :title="t('vendor', '供應商')" width="150" />
      <CustomTinyGridColumn :title="t('actions', '操作')" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <a-button type="text" @click="handleQuickStockIn(row)">{{ t("quickStockIn", "快速入庫") }}</a-button>
        </template>
      </CustomTinyGridColumn>
    </CustomTinyGrid>

    <!-- 空狀態提示 -->
    <div v-if="alertList.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <IconCheckCircle class="mb-4 size-16 text-green-500" />
      <p class="text-lg">{{ getEmptyMessage() }}</p>
    </div>
  </div>

  <!-- 入庫彈窗 -->
  <a-modal v-model:visible="stockInDialogVisible" :title="t('stockIn', '入庫')" width="600px" :mask-closable="false">
    <perfect-scrollbar class="h-[calc(100vh-350px)] pr-4">
      <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <AFormItem :label="t('product', '商品')" field="productId">
          <InfiniteSelect v-model="basicForm.productId" dataSource="products" :placeholder="t('pleaseSelect', '請選擇')" />
        </AFormItem>
        <AFormItem :label="t('location', '存放位置')" field="location">
          <a-select v-model="basicForm.location" :placeholder="t('pleaseSelect', '請選擇')" allow-create>
            <a-option v-for="item in locationOption" :key="item" :label="item" :value="item" />
          </a-select>
          <!--<CustomField v-model="basicForm.location" type="input" />-->
          <!--<InfiniteSelect v-model="basicForm.location" emitValue allowCreate dataSource="InventoryLocations" :placeholder="t('pleaseSelect', '請選擇')" />-->
        </AFormItem>
        <AFormItem :label="t('quantity', '數量')" field="quantity">
          <CustomField v-model="basicForm.quantity" type="number" :min="1" />
        </AFormItem>
        <AFormItem :label="t('unitCostAmount', '單位成本')" field="unitCostAmount">
          <CustomField v-model="basicForm.unitCostAmount" type="number" :min="0" />
        </AFormItem>
        <AFormItem :label="t('batchNumber', '批號')" field="batchNumber">
          <CustomField v-model="basicForm.batchNumber" type="input" />
        </AFormItem>
        <AFormItem :label="t('expiryDate', '到期日')" field="expiryDate">
          <CustomField v-model="basicForm.expiryDate" type="date-picker" />
        </AFormItem>
        <AFormItem :label="t('reason', '原因')">
          <CustomField v-model="basicForm.reason" type="input" />
        </AFormItem>
        <AFormItem :label="t('notes', '備註')">
          <CustomField v-model="basicForm.notes" type="textarea" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="stockInDialogVisible = false">{{ t("cancel", "取消") }}</a-button>
        <a-button type="primary" :disabled="isSaving" :loading="isSaving" @click="handleSubmit">{{ isSaving ? t("saving", "儲存中") : t("save", "儲存") }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick, onUnmounted } from "vue";
import { InventoryLocationsGet, InventoryLowStockGet, InventoryOutOfStockGet, InventoryReorderAlertsGet, InventoryStockInPost } from "@/assets/API/Inventory";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import InfiniteSelect from "@/components/Form/InfiniteSelect.vue";
import CustomField from "@/components/Form/CustomField.vue";
import { useMainStore } from "@/stores/LoadingStore";
import { useSystemStore } from "@/stores/system";
import { useI18n } from "vue-i18n";
import { CheckCircle as IconCheckCircle } from "lucide-vue-next";
import { debounce } from "lodash";

const mainStore = useMainStore();
const systemStore = useSystemStore();
const { t } = useI18n();

const EMPTY_PLACEHOLDER = "—";
const alertType = ref("lowStock");
const alertList = ref([]);
const isLoading = ref(false);
const counts = reactive({
  lowStock: 0,
  outOfStock: 0,
  reorder: 0
});

/** 選項相關 **/
const locationOption = ref([]);
const getOption = async () => {
  try {
    const response = await InventoryLocationsGet();
    locationOption.value = response?.data?.data || response?.data?.items || response?.data || [];
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
};

/** 取得資料 **/
const transformAlertItem = (item = {}) => ({
  productId: item.productId,
  productCode: item.productCode || EMPTY_PLACEHOLDER,
  productName: item.productName || EMPTY_PLACEHOLDER,
  unit: item.unit || EMPTY_PLACEHOLDER,
  currentStock: item.currentStock ?? 0,
  minStock: item.minStock ?? 0,
  reorderPoint: item.reorderPoint ?? 0,
  shortfall: item.shortfall ?? 0,
  suggestedOrderQuantity: item.suggestedOrderQuantity ?? 0,
  vendorName: item.vendor?.name || EMPTY_PLACEHOLDER,
  vendorId: item.vendor?.id,
  raw: item
}); //轉換警示項目資料
const loadAlertData = async () => {
  isLoading.value = true;
  mainStore.setLoading(true);
  try {
    let response;
    if (alertType.value === "lowStock") {
      response = await InventoryLowStockGet();
    } else if (alertType.value === "outOfStock") {
      response = await InventoryOutOfStockGet();
    } else {
      response = await InventoryReorderAlertsGet();
    }
    let items = response?.data?.data || response?.data?.items || response?.data || [];
    if (!Array.isArray(items)) {
      items = [];
    }
    alertList.value = items.map(transformAlertItem);
  } catch (error) {
    await mainStore.SWAL_Error(error);
    alertList.value = [];
  } finally {
    isLoading.value = false;
    mainStore.setLoading(false);
  }
}; //載入警示資料
const loadAllCounts = async () => {
  try {
    const [lowStockRes, outOfStockRes, reorderRes] = await Promise.all([InventoryLowStockGet(), InventoryOutOfStockGet(), InventoryReorderAlertsGet()]);
    const getLengthFromResponse = (res) => {
      const data = res?.data?.data || res?.data?.items || res?.data;
      return Array.isArray(data) ? data.length : 0;
    };
    counts.lowStock = getLengthFromResponse(lowStockRes);
    counts.outOfStock = getLengthFromResponse(outOfStockRes);
    counts.reorder = getLengthFromResponse(reorderRes);
  } catch (error) {
    console.error("Failed to load counts:", error);
  }
}; //載入所有分類數量
const handleAlertTypeChange = () => loadAlertData(); //切換子分類
const getEmptyMessage = () => {
  const messages = {
    lowStock: t("noLowStockItems", "目前沒有低庫存項目"),
    outOfStock: t("noOutOfStockItems", "目前沒有缺貨項目"),
    reorder: t("noReorderItems", "目前沒有需補貨項目")
  };
  return messages[alertType.value];
}; //取得空狀態訊息

/** 入庫彈窗 **/
const stockInDialogVisible = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const initializeForm = () => ({
  productId: "",
  location: "Main",
  quantity: 1,
  unitCostAmount: "",
  batchNumber: "",
  expiryDate: "",
  reason: "",
  notes: ""
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  productId: [{ required: true, message: t("required", "此欄位必填") }],
  location: [{ required: true, message: t("required", "此欄位必填") }],
  quantity: [{ required: true, message: t("required", "此欄位必填") }]
};
const openStockInDialog = (product = null) => {
  basicForm.value = initializeForm();
  if (product) {
    basicForm.value.productId = product; //帶入產品物件
    basicForm.value.quantity = product.suggestedQuantity || 1; //使用建議訂購量
  }
  stockInDialogVisible.value = true;
}; //開啟入庫彈窗（可帶入產品物件）
const handleQuickStockIn = (row) => {
  openStockInDialog({
    id: row.productId,
    name: row.productName,
    code: row.productCode,
    unit: row.unit,
    suggestedQuantity: row.suggestedOrderQuantity
  });
}; //快速入庫（帶入產品）
const openQuickStockIn = () => {
  openStockInDialog(null);
}; //開啟入庫彈窗（空白表單）
const preparePayload = () => {
  const payload = {
    productId: typeof basicForm.value.productId === "object" ? basicForm.value.productId.id : basicForm.value.productId,
    location: typeof basicForm.value.location === "object" ? basicForm.value.location.value : basicForm.value.location,
    quantity: Number(basicForm.value.quantity)
  };
  if (basicForm.value.unitCostAmount) payload.unitCostAmount = Number(basicForm.value.unitCostAmount);
  if (basicForm.value.batchNumber) payload.batchNumber = basicForm.value.batchNumber;
  if (basicForm.value.expiryDate) payload.expiryDate = basicForm.value.expiryDate;
  if (basicForm.value.reason) payload.reason = basicForm.value.reason;
  if (basicForm.value.notes) payload.notes = basicForm.value.notes;
  return payload;
}; //準備送出資料
const _saveForm = async () => {
  const validateResult = await formRef.value?.validate();
  if (validateResult) return;

  mainStore.setLoading(true);
  isSaving.value = true;
  try {
    const payload = preparePayload();
    await InventoryStockInPost(payload);
    await mainStore.SWAL_Success(t("saveSuccess", "儲存成功"));
    stockInDialogVisible.value = false;
    await getAPI(); //重新載入列表
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
    isSaving.value = false;
  }
}; //儲存
const handleSubmit = debounce(_saveForm, 300, { leading: true, trailing: false }); //編輯儲存-防抖

/** 取得所有資料 **/
const getAPI = async () => {
  await Promise.all([loadAlertData(), loadAllCounts(), getOption()]);
}; //取得所有資料

defineExpose({
  openQuickStockIn,
  getAPI
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);

onMounted(async () => {
  await getAPI();

  /** Table高度相關 **/
  await nextTick();
  systemStore.updateTableHeight(340); //修改table高度
});
</script>
