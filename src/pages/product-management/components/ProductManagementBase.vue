<!-- src/pages/product-management/components/ProductManagementBase.vue 產品共用列表 -->
<template>
  <Card ref="containerRef">
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ categoryLabel }}資料列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ totalProducts }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">清除全部搜尋</Button>
        <Button type="primary" @click="openCreateDialog">新增{{ categoryLabel }}</Button>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <div class="flex w-full flex-col gap-3 rounded-[10px] bg-[#f5f7fb] px-5 py-4">
        <TinyForm label-suffix="：" label-width="100px" class="gap-y-0!">
          <TinyFormItem label="庫存">
            <div class="flex w-full gap-2">
              <div class="flex flex-1 items-center justify-start">
                <TinyCheckbox :model-value="filters.inStock" @update:model-value="(val) => toggleBooleanFilter('inStock', val)">僅顯示有庫存</TinyCheckbox>
                <TinyCheckbox :model-value="filters.lowStock" @update:model-value="(val) => toggleBooleanFilter('lowStock', val)">低於補貨點</TinyCheckbox>
              </div>
              <TinyButton type="danger" plain @click="clearPriceFilter">清除價格</TinyButton>
            </div>
          </TinyFormItem>

          <div class="grid grid-cols-2 gap-2">
            <TinyFormItem label="最低價格">
              <TinyNumeric v-model="filters.minPrice" type="number" placeholder="請輸入金額" @keyup.enter="handleGlobalSearch" class="w-[300px]!" />
            </TinyFormItem>

            <TinyFormItem label="最高價格">
              <TinyNumeric v-model="filters.maxPrice" type="number" placeholder="請輸入金額" @keyup.enter="handleGlobalSearch" class="w-[300px]!" />
            </TinyFormItem>
          </div>
        </TinyForm>
      </div>

      <CustomTinyGrid :data="productList" row-key="id" :height="640" :border="true" :row-id="'id'">
        <CustomTinyGridColumn field="name" title="商品名稱" min-width="240" fixed="left" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort" @enter="handleGlobalSearch">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ categoryLabel }}名稱</span>
              <TinyInput v-model="filters.name" placeholder="輸入名稱" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ row.name }}</span>
              <span class="text-xs text-gray-500">編號：{{ row.code || "—" }}</span>
              <span v-if="row.description" class="text-xs text-gray-500">{{ row.description }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="code" title="產品編號" :width="150" sortable :sort-field="'code'" :current-order="getColumnOrder('code')" @sort="handleColumnSort" @enter="handleGlobalSearch">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">產品編號</span>
              <TinyInput v-model="filters.code" placeholder="輸入編號" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">{{ row.code || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="unit" title="單位" :width="100">
          <template #default="{ row }">{{ row.unit || defaultUnit || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="basePrice" title="售價" :width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span>建議售價：{{ row.basePrice }}</span>
              <span class="text-xs text-gray-500">批發：{{ row.wholesalePrice }} / 現金：{{ row.cashPrice }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="currentStock" title="當前庫存" :width="200" sortable :sort-field="'currentStock'" :current-order="getColumnOrder('currentStock')" @sort="handleColumnSort">
          <template #default="{ row }">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-base font-medium text-gray-900">{{ row.currentStock }}</span>
                <TinyTag :color="['#D4183D', '#fff']" v-if="row.currentStock === 0">無庫存</TinyTag>
                <TinyTag v-else-if="isLowStock(row)" type="danger">低於補貨點</TinyTag>
                <!--<TinyTag v-else-if="row.inStock" type="info">有庫存</TinyTag>-->
              </div>
              <span class="text-xs text-gray-500">補貨點：{{ row.reorderPoint || "—" }} · 安全庫存：{{ row.minStock || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="vendor" title="供應商" min-width="200">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">供應商</span>
              <TinySelect v-model="filters.primaryVendorId" :options="vendorFilterOptions" placeholder="全部" class="h-8 text-xs" filterable clearable @update:model-value="handleVendorFilterChange" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span>{{ row.vendor || "—" }}</span>
              <span class="text-xs text-gray-500">ID：{{ row.primaryVendorId || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="isPerishable" title="冷藏" :width="140" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">冷藏</span>
              <TinySelect :model-value="filters.isPerishable" :options="perishableFilterOptions" placeholder="全部" class="h-8 text-xs" @update:model-value="updateIsPerishableFilter" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge :type="row.isPerishable ? 'info' : 'success'">{{ row.isPerishable ? "需冷藏" : "常溫" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="tags" title="標籤" min-width="220">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">標籤</span>
              <TinyInput v-model="filters.tags" placeholder="輸入關鍵字" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" @change="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1 text-xs text-gray-700">
              <span v-for="tag in row.tags" :key="`${row.id}-${tag}`" class="rounded-full bg-gray-100 px-2 py-0.5">{{ tag }}</span>
              <span v-if="!row.tags?.length">—</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="updatedAt" title="更新時間" :width="160" sortable :sort-field="'updatedAt'" :current-order="getColumnOrder('updatedAt')" @sort="handleColumnSort">
          <template #default="{ row }">{{ row.updatedAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" fixed="right" :width="120" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">狀態</span>
              <TinySelect :model-value="filters.status" :options="statusFilterOptions" placeholder="全部" class="h-8 text-xs" @update:model-value="updateStatusFilter" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="statusColorMap[row.status] || 'arcoblue'" size="large">{{ statusLabelMap[row.status] || row.status }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <Button variant="ghost" @click="openEditDialog(row)">編輯</Button>
              <Button variant="ghost" @click="deleteProduct(row.id)">刪除</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
    </CardContent>
  </Card>

  <TinyDialogBox v-model:visible="dialogVisible" :title="dialogTitle" width="720px" :close-on-click-modal="false" top="50px">
    <!--<JsonViewer :value="basicForm" boxed copyable />-->
    <TinyForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="120px" label-position="top">
      <div v-if="hasFakeData && !editingId" class="mb-3 flex justify-end">
        <Button variant="outline" size="sm" @click="generateFakeData">產生假資料</Button>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <TinyFormItem label="商品名稱" prop="name">
          <TinyInput v-model="basicForm.name" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="單位" prop="unit">
          <TinyInput v-model="basicForm.unit" placeholder="例如：盒 / 桶 / 台" />
        </TinyFormItem>
        <TinyFormItem label="建議售價 (TWD)" prop="basePrice">
          <TinyInput v-model="basicForm.basePrice" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="批發價格 (TWD)" prop="wholesalePrice">
          <TinyInput v-model="basicForm.wholesalePrice" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="現金價格 (TWD)" prop="cashPrice">
          <TinyInput v-model="basicForm.cashPrice" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="成本 (TWD)" prop="costPrice">
          <TinyInput v-model="basicForm.costPrice" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="安全庫存" prop="minStock">
          <TinyInput v-model="basicForm.minStock" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="最高庫存" prop="maxStock">
          <TinyInput v-model="basicForm.maxStock" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="補貨點" prop="reorderPoint">
          <TinyInput v-model="basicForm.reorderPoint" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="供應商 ID">
          <TinySelect v-model="basicForm.primaryVendorId" :options="vendorOptions" placeholder="請選擇供應商" filterable clearable />
        </TinyFormItem>
        <TinyFormItem label="標籤">
          <TinyTextPopup v-model="basicForm.tags" placeholder="輸入後按 Enter 新增" style="width: 100%" class="w-full bg-white" />
        </TinyFormItem>
        <TinyFormItem label="狀態">
          <TinySelect v-model="basicForm.status" :options="statusOptions" placeholder="請選擇" />
        </TinyFormItem>
      </div>
      <TinyFormItem label="商品描述">
        <TinyInput v-model="basicForm.description" type="textarea" rows="3" placeholder="輸入說明" />
      </TinyFormItem>
      <TinyFormItem label="易腐品">
        <TinyCheckbox :model-value="basicForm.isPerishable" @update:model-value="(val) => (basicForm.isPerishable = val)">此商品需冷藏</TinyCheckbox>
      </TinyFormItem>
    </TinyForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">取消</Button>
        <Button :disabled="isSaving" :loading="isSaving" @click="saveProduct">{{ isSaving ? "儲存中..." : "儲存" }}</Button>
      </div>
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch } from "vue";
import { format } from "date-fns";
import { TinyButton, TinyInput, TinySelect, TinyCheckbox, TinyForm, TinyFormItem, TinyDialogBox, TinyBadge, TinyTextPopup, TinyTag } from "@opentiny/vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import AppPagination from "@/components/ui/AppPagination.vue";
import Notify from "@opentiny/vue-notify";
import { ProductListGet, ProductCreatePost, ProductUpdatePatch, ProductDeleteById, ProductGetByID } from "@/assets/API/Product";
import { useContentWidth } from "@/composables/useContentWidth";
import { JsonViewer } from "vue3-json-viewer";
import { useMainStore } from "@/stores/LoadingStore";

const props = defineProps({
  categoryId: { type: Number, required: true },
  categoryLabel: { type: String, required: true },
  defaultUnit: { type: String, default: "" },
  defaultPerishable: { type: Boolean, default: false },
  productTypeCode: { type: String, default: "FINISHED_GOOD" },
  fakeDataType: { type: String, default: "" }
});

const { containerRef } = useContentWidth();
const mainStore = useMainStore();

/** 常數與選項 **/
const statusOptions = [
  { label: "啟用", value: "ACTIVE" },
  { label: "停用", value: "INACTIVE" },
  { label: "刪除", value: "DELETED" }
];
const statusLabelMap = statusOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {}); //狀態顯示文字
const statusColorMap = {
  ACTIVE: "arcoblue",
  INACTIVE: "orange",
  DELETED: "red"
}; //狀態顏色對應
const statusFilterOptions = computed(() => [{ label: "全部", value: "all" }, ...statusOptions]); //狀態篩選選單
const perishableFilterOptions = [
  { label: "全部", value: "all" },
  { label: "是", value: "true" },
  { label: "否", value: "false" }
]; //冷藏篩選
const sortFieldMap = {
  name: "name",
  code: "code",
  currentStock: "currentStock",
  updatedAt: "updatedAt"
}; //排序欄位映射

/** 狀態管理 **/
const productList = ref([]);
const basicFormRef = ref(null);
const isSaving = ref(false);
const dialogVisible = ref(false);
const editingId = ref(null);
watch(dialogVisible, (visible) => {
  if (!visible) {
    basicFormRef.value?.clearValidate?.();
  }
});

/** 分頁設定 **/
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});
const pageSizeOptions = [10, 20, 50, 100];
const totalProducts = computed(() => pagination.total); //總筆數

/** 篩選與查詢 **/
const createDefaultFilters = () => ({
  name: "",
  code: "",
  status: "all",
  minPrice: "",
  maxPrice: "",
  primaryVendorId: "",
  isPerishable: "all",
  tags: "",
  lowStock: false,
  inStock: false
});
const filters = reactive(createDefaultFilters());
const resetFilters = () => Object.assign(filters, createDefaultFilters());

const vendorOptions = ref([]);
const vendorFilterOptions = computed(() => [{ label: "全部", value: "" }, ...vendorOptions.value]);
const registerVendorOption = (id, name, code) => {
  if (!id) return;
  if (vendorOptions.value.some((option) => option.value === id)) return;
  const labelName = name || "未命名供應商";
  const label = code ? `${labelName} (${code})` : labelName;
  vendorOptions.value.push({ label, value: id });
};

const sortField = ref("createdAt");
const sortDirection = ref("desc");

/** 共用工具 **/
const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "NT$0";
  return `NT$${amount.toLocaleString("zh-TW", { minimumFractionDigits: 0 })}`;
}; //金額格式化
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "yyyy-MM-dd");
}; //日期格式化
const createPositiveRule = (label, { optional = false, allowZero = false } = {}) => ({
  validator: (rule, value, callback) => {
    if ((value === "" || value === null || value === undefined) && optional) {
      callback();
      return;
    }
    const numeric = Number(value);
    const isNumber = Number.isFinite(numeric);
    const passes = allowZero ? numeric >= 0 : numeric > 0;
    if (!isNumber || !passes) {
      callback(new Error(optional ? `${label}需為正數或留空` : `${label}需為${allowZero ? "大於等於 0" : "正數"}`));
      return;
    }
    callback();
  },
  trigger: ["blur", "change"]
});
const buildPricePayload = (amount, { required = false } = {}) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }
  if (!required && numeric <= 0) return undefined;
  return { amount: numeric, currency: "TWD" };
}; //組合金額欄位
const isLowStock = (row) => {
  if (!row) return false;
  if (!row.reorderPoint) return false;
  return Number(row.currentStock || 0) < Number(row.reorderPoint || 0);
}; //低庫存判斷

/** 表單設定 **/
const initializeForm = () => ({
  name: "",
  unit: props.defaultUnit || "",
  description: "",
  costPrice: "",
  basePrice: "",
  wholesalePrice: "",
  cashPrice: "",
  minStock: "",
  maxStock: "",
  reorderPoint: "",
  primaryVendorId: "",
  tags: "",
  status: "ACTIVE",
  isPerishable: props.defaultPerishable
}); //建立預設表單
const basicForm = ref(initializeForm());
const dialogTitle = computed(() => (editingId.value ? `編輯${props.categoryLabel}` : `新增${props.categoryLabel}`)); //彈窗標題
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重設表單
const basicFormRules = {
  name: [{ required: true, message: "請輸入商品名稱", trigger: "blur" }],
  unit: [{ required: true, message: "請輸入單位", trigger: "blur" }],
  basePrice: [{ required: true, message: "請輸入建議售價", trigger: "blur" }, createPositiveRule("建議售價")],
  wholesalePrice: [createPositiveRule("批發價格", { optional: true })],
  cashPrice: [createPositiveRule("現金價格", { optional: true })],
  costPrice: [createPositiveRule("成本", { optional: true })],
  minStock: [{ required: true, message: "請輸入最小庫存", trigger: "blur" }, createPositiveRule("最小庫存", { allowZero: true })],
  maxStock: [{ required: true, message: "請輸入最大庫存", trigger: "blur" }, createPositiveRule("最大庫存", { allowZero: true })],
  reorderPoint: [{ required: true, message: "請輸入補貨點", trigger: "blur" }, createPositiveRule("補貨點", { allowZero: true })]
};
const fakeDataPresets = {
  eggs: {
    name: "新鮮雞蛋 (30顆裝)",
    unit: "盒",
    description: "農場直送新鮮雞蛋，30顆家庭號包裝",
    basePrice: "180",
    wholesalePrice: "150",
    cashPrice: "170",
    costPrice: "120",
    minStock: "10",
    maxStock: "500",
    reorderPoint: "20",
    tags: "新鮮,農場直送,優質",
    isPerishable: true
  },
  bottledWater: {
    name: "悅氏礦泉水 20L",
    unit: "桶",
    description: "悅氏品牌礦泉水，20公升桶裝，採用天然山泉水源",
    basePrice: "120",
    wholesalePrice: "100",
    cashPrice: "110",
    costPrice: "80",
    minStock: "50",
    maxStock: "1000",
    reorderPoint: "100",
    tags: "悅氏,礦泉水,20L,桶裝水",
    isPerishable: true
  },
  waterDispenser: {
    name: "Panasonic 智能溫控飲水機 TK-AS44",
    unit: "台",
    description: "具備冷熱水功能的智能飲水機，節能設計",
    basePrice: "12800",
    wholesalePrice: "11000",
    cashPrice: "12000",
    costPrice: "9500",
    minStock: "5",
    maxStock: "50",
    reorderPoint: "10",
    tags: "Panasonic,飲水機,智能溫控",
    isPerishable: false
  }
};
const hasFakeData = computed(() => Boolean(props.fakeDataType && fakeDataPresets[props.fakeDataType]));
const applyFakeFormValues = (preset = {}) => {
  Object.entries(preset).forEach(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(basicForm.value, key)) return;
    if (key === "isPerishable") {
      basicForm.value.isPerishable = Boolean(value);
    } else if (key === "tags") {
      basicForm.value.tags = String(value);
    } else {
      basicForm.value[key] = value;
    }
  });
};
const generateFakeData = () => {
  const preset = fakeDataPresets[props.fakeDataType];
  if (!preset) return;
  applyFakeFormValues(preset);
  basicFormRef.value?.clearValidate?.();
  Notify({ type: "success", title: `${props.categoryLabel}假資料已套用` });
};

/** 資料取得 **/
const normalizeListResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload ?? {};
  const items = data?.data ?? data?.items ?? [];
  const meta = data?.meta ?? data?.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta
  };
}; //解析列表回傳
const mapProductRow = (product = {}) => {
  const priceAmount = (target) => formatCurrency(target?.amount ?? 0);
  if (product.primaryVendor?.id || product.primaryVendorId) {
    registerVendorOption(product.primaryVendor?.id || product.primaryVendorId, product.primaryVendor?.name || "", product.primaryVendor?.code || product.primaryVendorCode);
  }
  return {
    id: product.id || product.code,
    code: product.code || "—",
    name: product.name || "—",
    description: product.description || "",
    unit: product.unit || props.defaultUnit || "",
    basePrice: priceAmount(product.basePrice),
    wholesalePrice: priceAmount(product.wholesalePrice),
    cashPrice: priceAmount(product.cashPrice),
    costPrice: priceAmount(product.costPrice),
    currentStock: Number(product.currentStock ?? 0),
    minStock: Number(product.minStock ?? 0),
    maxStock: Number(product.maxStock ?? 0),
    reorderPoint: Number(product.reorderPoint ?? 0),
    vendor: product.primaryVendor?.name || "",
    primaryVendorId: product.primaryVendor?.id || product.primaryVendorId || "",
    status: product.status || "ACTIVE",
    isPerishable: Boolean(product.isPerishable),
    tags: Array.isArray(product.tags) ? product.tags : [],
    updatedAt: formatDate(product.updatedAt || product.createdAt),
    inStock: Number(product.currentStock ?? 0) > 0,
    raw: product
  };
}; //轉換 API 商品資料
const buildListParams = () => {
  const params = {
    page: pagination.page,
    limit: pagination.limit,
    categoryId: props.categoryId
  };
  const searchCandidate = [filters.name, filters.code].find((value) => value && value.trim());
  if (searchCandidate) params.search = searchCandidate.trim();
  if (filters.status !== "all") params.status = filters.status;
  if (filters.minPrice) params.minPrice = Number(filters.minPrice) || 0;
  if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice) || 0;
  if (filters.primaryVendorId) params.primaryVendorId = filters.primaryVendorId.trim();
  if (filters.isPerishable !== "all") params.isPerishable = filters.isPerishable === "true";
  if (filters.tags) {
    const tagValues = filters.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tagValues.length) params.tags = tagValues;
  }
  if (filters.lowStock) params.lowStock = true;
  if (filters.inStock) params.inStock = true;
  if (sortField.value) {
    params.sortBy = sortFieldMap[sortField.value] || sortField.value;
    params.sortOrder = sortDirection.value;
  }
  return params;
}; //整理查詢條件
const extractError = (error, fallback) => error?.response?.data?.message || error?.message || fallback; //錯誤訊息整理
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await ProductListGet(buildListParams());
    const { items, meta } = normalizeListResponse(response);
    productList.value = items.map(mapProductRow);
    pagination.limit = Number(meta.limit ?? meta.pageSize ?? pagination.limit) || pagination.limit;
    pagination.page = meta.page ?? meta.currentPage ?? pagination.page;
    pagination.total = meta.total ?? items.length;
    pagination.totalPages = meta.totalPages ?? meta.pages ?? Math.ceil(Math.max(pagination.total, 1) / pagination.limit);
  } catch (error) {
    productList.value = [];
    Notify({ type: "error", title: "載入失敗", message: extractError(error, "無法取得商品資料") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得商品列表
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ""); //取得欄位排序狀態
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = "createdAt";
    sortDirection.value = "desc";
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getAPI();
}; //切換欄位排序
const CurrentChange = async (page) => {
  const safePage = Math.min(Math.max(page, 1), pagination.totalPages || 1);
  if (safePage === pagination.page) return;
  pagination.page = safePage;
  await getAPI();
}; //切換分頁
const SizeChange = async (size) => {
  pagination.limit = Number(size) || 10;
  pagination.page = 1;
  await getAPI();
}; //切換每頁筆數
const handleGlobalSearch = async () => {
  pagination.page = 1;
  await getAPI();
}; //表頭輸入搜尋
const handleVendorFilterChange = async () => {
  await handleGlobalSearch();
}; //供應商篩選變更
const toggleBooleanFilter = async (field, value) => {
  filters[field] = Boolean(value);
  await handleGlobalSearch();
}; //切換布林篩選
const updateIsPerishableFilter = async (value) => {
  filters.isPerishable = value;
  await handleGlobalSearch();
}; //易腐篩選
const updateStatusFilter = async (value) => {
  filters.status = value;
  await handleGlobalSearch();
}; //更新狀態篩選
const clearPriceFilter = async () => {
  filters.minPrice = "";
  filters.maxPrice = "";
  await handleGlobalSearch();
}; //清除價格設定
const clearFilter = async () => {
  resetFilters();
  sortField.value = "createdAt";
  sortDirection.value = "desc";
  pagination.page = 1;
  await getAPI();
}; //清除全部搜尋條件

/** 新增編輯相關 **/
const preparePayload = () => {
  if (!basicForm.value.name) return null;
  const basePricePayload = buildPricePayload(basicForm.value.basePrice, { required: true });
  if (!basePricePayload) return null;
  const payload = {
    name: basicForm.value.name,
    categoryId: props.categoryId,
    productTypeCode: props.productTypeCode || "FINISHED_GOOD",
    unit: basicForm.value.unit || props.defaultUnit || "",
    description: basicForm.value.description || undefined,
    basePrice: basePricePayload,
    minStock: Number(basicForm.value.minStock) || 0,
    maxStock: Number(basicForm.value.maxStock) || 0,
    reorderPoint: Number(basicForm.value.reorderPoint) || 0,
    primaryVendorId: basicForm.value.primaryVendorId?.trim() || undefined,
    isPerishable: Boolean(basicForm.value.isPerishable)
  };
  const optionalPrices = {
    wholesalePrice: buildPricePayload(basicForm.value.wholesalePrice),
    cashPrice: buildPricePayload(basicForm.value.cashPrice),
    costPrice: buildPricePayload(basicForm.value.costPrice)
  };
  Object.entries(optionalPrices).forEach(([key, value]) => {
    if (value) payload[key] = value;
  });
  const normalizedTags = String(basicForm.value.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (normalizedTags.length) {
    payload.tags = normalizedTags;
  }
  if (editingId.value) {
    payload.status = basicForm.value.status || "ACTIVE";
  }
  return payload;
}; //整理表單資料
const validateForm = async () => {
  if (!basicFormRef.value) return true;
  try {
    await basicFormRef.value.validate();
    return true;
  } catch {
    return false;
  }
}; //表單驗證
const extractPriceAmount = (product, key) => {
  if (!product) return "";
  if (typeof product[`${key}Amount`] !== "undefined") return String(product[`${key}Amount`]);
  if (product[key]?.amount !== undefined) return String(product[key].amount);
  return "";
};
const fillFormFromProduct = (product) => {
  if (!product) return;
  if (product.primaryVendor?.id || product.primaryVendorId) {
    registerVendorOption(product.primaryVendor?.id || product.primaryVendorId, product.primaryVendor?.name || "", product.primaryVendor?.code || product.primaryVendorCode);
  }
  basicForm.value.name = product.name || "";
  basicForm.value.unit = product.unit || props.defaultUnit || "";
  basicForm.value.description = product.description || "";
  basicForm.value.costPrice = extractPriceAmount(product, "costPrice");
  basicForm.value.basePrice = extractPriceAmount(product, "basePrice");
  basicForm.value.wholesalePrice = extractPriceAmount(product, "wholesalePrice");
  basicForm.value.cashPrice = extractPriceAmount(product, "cashPrice");
  basicForm.value.minStock = product.minStock ?? "";
  basicForm.value.maxStock = product.maxStock ?? "";
  basicForm.value.reorderPoint = product.reorderPoint ?? "";
  basicForm.value.primaryVendorId = product.primaryVendor?.id || product.primaryVendorId || "";
  basicForm.value.tags = Array.isArray(product.tags) ? product.tags.join(",") : product.tags || "";
  basicForm.value.status = product.status || "ACTIVE";
  basicForm.value.isPerishable = Boolean(product.isPerishable);
}; //表單填入資料
const loadProductDetail = async (id) => {
  if (!id) return;
  try {
    const response = await ProductGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    fillFormFromProduct(detail);
  } catch (error) {
    Notify({ type: "error", title: "讀取失敗", message: extractError(error, "無法取得商品資料") });
  }
}; //取得單筆詳細資料
const openCreateDialog = () => {
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增視窗
const openEditDialog = (row) => {
  if (!row?.id) return;
  editingId.value = row.id;
  fillFormFromProduct(row.raw || row);
  dialogVisible.value = true;
  loadProductDetail(row.id);
}; //開啟編輯視窗
const saveProduct = async () => {
  if (!(await validateForm())) return;
  const payload = preparePayload();
  if (!payload) return;
  isSaving.value = true;
  try {
    if (editingId.value) {
      await ProductUpdatePatch(editingId.value, payload);
      Notify({ type: "success", title: "商品資料已更新" });
    } else {
      await ProductCreatePost(payload);
      Notify({ type: "success", title: "已新增商品" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "儲存失敗", message: extractError(error, "無法儲存商品資料") });
  } finally {
    isSaving.value = false;
  }
}; //儲存商品資料
const deleteProduct = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    await ProductDeleteById(id);
    Notify({ type: "success", title: "商品已刪除" });
    if (productList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "刪除失敗", message: extractError(error, "無法刪除該商品") });
  } finally {
    mainStore.setLoading(false);
  }
}; //刪除商品

const loadVendorOptions = async () => {
  try {
    const { items } = normalizeListResponse(await VendorListGet({ page: 1, limit: 200, isActive: true }));
    vendorOptions.value = items.map((vendor) => ({
      label: vendor.name ? `${vendor.name}${vendor.code ? ` (${vendor.code})` : ""}` : vendor.id,
      value: vendor.id
    }));
  } catch (error) {
    console.error("Failed to load vendor options", error);
  }
};

onMounted(async () => {
  await loadVendorOptions();
  await getAPI();
});
</script>

<style scoped>
.tiny-form-item {
  margin-bottom: 4px !important;
}
</style>
