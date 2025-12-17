<!-- src/pages/basic-data/VendorManagementPage.vue 供應商管理 -->
<template>
  <Card ref="containerRef">
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>供應商列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ pagination.total }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">清除全部搜尋</Button>
        <Button type="primary" @click="openCreateDialog">新增供應商</Button>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <CustomTinyGrid :data="basicDataList" :height="640" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="name" title="供應商名稱" min-width="240" fixed="left" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">供應商名稱</span>
              <TinyInput v-model="searchFields.name" placeholder="輸入供應商名稱" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch('name')" @clear="handleGlobalSearch('name')" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="font-medium text-gray-900">{{ row.name }}</span>
              <span class="text-xs text-gray-500">代碼：{{ row.code || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="contactPerson" title="聯絡人姓名" :width="200" sortable :sort-field="'contactPerson'" :current-order="getColumnOrder('contactPerson')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">聯絡人姓名</span>
              <TinyInput v-model="searchFields.contactName" placeholder="輸入聯絡人姓名" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch('contactName')" @clear="handleGlobalSearch('contactName')" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.contactPerson }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="phone" title="聯絡人電話" :width="200">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">聯絡人電話</span>
              <TinyInput v-model="searchFields.contactPhone" placeholder="輸入聯絡電話" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch('contactPhone')" @clear="handleGlobalSearch('contactPhone')" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.phone }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="email" title="Email" min-width="220">
          <template #default="{ row }">{{ row.email }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="productType" title="產品類型" :width="180">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">產品類型</span>
              <TinySelect v-model="filters.productTypeCode" :options="productTypeFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge type="info">{{ row.productTypeName || "未分類" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="address" title="地址" min-width="260">
          <template #default="{ row }">{{ row.addressDisplay }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="paymentTerms" title="付款條件" :width="140" align="center">
          <template #default="{ row }">{{ row.paymentTerms ? `${row.paymentTerms} 天` : "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" title="建立日期" :width="160" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort">
          <template #default="{ row }">{{ row.createdAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="updatedAt" title="更新日期" :width="160" sortable :sort-field="'updatedAt'" :current-order="getColumnOrder('updatedAt')" @sort="handleColumnSort">
          <template #default="{ row }">{{ row.updatedAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" :width="130" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">狀態</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="row.isActive ? 'arcoblue' : 'red'" size="large">{{ row.isActive ? "啟用" : "停用" }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <Button variant="ghost" @click="openEditDialog(row)">編輯</Button>
              <Button variant="ghost" @click="deleteVendor(row.id)">刪除</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
    </CardContent>
  </Card>

  <TinyDialogBox v-model:visible="dialogVisible" :title="dialogTitle" width="640px" :close-on-click-modal="false" top="64px">
    <TinyForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="120px" label-position="top">
      <div class="grid gap-4 md:grid-cols-2">
        <TinyFormItem label="供應商名稱" prop="name">
          <TinyInput v-model="basicForm.name" placeholder="請輸入供應商名稱" />
        </TinyFormItem>
        <TinyFormItem label="聯絡人" prop="contactPerson">
          <TinyInput v-model="basicForm.contactPerson" placeholder="請輸入聯絡人" />
        </TinyFormItem>
        <TinyFormItem label="Email" prop="email">
          <TinyInput v-model="basicForm.email" placeholder="name@example.com" />
        </TinyFormItem>
        <TinyFormItem label="聯絡電話" prop="phone">
          <TinyInput v-model="basicForm.phone" placeholder="02-1234-5678 / 0912-345-678" />
        </TinyFormItem>
        <TinyFormItem label="產品類型">
          <TinySelect v-model="basicForm.productTypeCode" :options="productTypeFormOptions" placeholder="請選擇" />
        </TinyFormItem>
        <TinyFormItem label="統一編號">
          <TinyInput v-model="basicForm.taxId" placeholder="請輸入統編" />
        </TinyFormItem>
        <TinyFormItem label="付款條件 (天)">
          <TinyInput v-model="basicForm.paymentTerms" type="number" placeholder="30" />
        </TinyFormItem>
        <TinyFormItem label="狀態">
          <TinySelect v-model="basicForm.isActive" :options="statusSelectOptions" placeholder="請選擇" />
        </TinyFormItem>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <TinyFormItem label="地址-街道" prop="addressStreet">
          <TinyInput v-model="basicForm.addressStreet" placeholder="街道地址" />
        </TinyFormItem>
        <TinyFormItem label="地址-城市" prop="addressCity">
          <TinyInput v-model="basicForm.addressCity" placeholder="城市" />
        </TinyFormItem>
        <TinyFormItem label="地址-縣市" prop="addressState">
          <TinyInput v-model="basicForm.addressState" placeholder="縣市 / 州" />
        </TinyFormItem>
        <TinyFormItem label="郵遞區號" prop="addressZip">
          <TinyInput v-model="basicForm.addressZip" placeholder="郵遞區號" />
        </TinyFormItem>
        <TinyFormItem label="國家" prop="addressCountry">
          <TinyInput v-model="basicForm.addressCountry" placeholder="國家" />
        </TinyFormItem>
      </div>
    </TinyForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">取消</Button>
        <Button type="primary" :disabled="isSaving" :loading="isSaving" @click="saveVendor">{{ isSaving ? "儲存中..." : "儲存" }}</Button>
      </div>
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { TinyForm, TinyFormItem, TinyInput, TinySelect, TinyDialogBox, TinyBadge } from "@opentiny/vue";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import AppPagination from "@/components/ui/AppPagination.vue";
import Notify from "@opentiny/vue-notify";
import { VendorListGet, VendorCreatePost, VendorUpdatePatch, VendorDeleteById, VendorGetByID } from "@/assets/API/Vendor";
import { ProductTypeListGet } from "@/assets/API/ProductType";
import { useMainStore } from "@/stores/LoadingStore";
import { useContentWidth } from "@/composables/useContentWidth";
import { format } from "date-fns";

const mainStore = useMainStore();
const { containerRef } = useContentWidth();

/** 常數與選項 **/
const productTypeOptions = ref([]);
const findProductTypeByCode = (code) => productTypeOptions.value.find((option) => option.value === code);
const productTypeFilterOptions = computed(() => [{ label: "全部", value: "all" }, ...productTypeOptions.value.map((option) => ({ label: option.label, value: option.value }))]); //產品類型篩選選單
const productTypeFormOptions = computed(() => productTypeOptions.value.map((option) => ({ label: option.label, value: option.value }))); //表單產品類型選單
const statusFilterOptions = [
  { label: "全部", value: "all" },
  { label: "啟用", value: "active" },
  { label: "停用", value: "inactive" }
];
const statusSelectOptions = [
  { label: "啟用", value: true },
  { label: "停用", value: false }
];

/** 篩選與查詢 **/
const searchFields = reactive({
  name: "",
  contactName: "",
  contactPhone: ""
}); //表頭搜尋欄位
const activeSearchKey = ref("name"); //目前使用的搜尋欄位
const filters = reactive({
  productTypeCode: "all",
  status: "all"
}); //下拉篩選條件

/** 分頁設定 **/
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
}); //分頁資訊
const pageSizeOptions = [10, 20, 50, 100]; //可選分頁筆數
const sortField = ref(""); //目前排序欄位
const sortDirection = ref("desc"); //目前排序方向
const sortFieldMap = {
  name: "name",
  contactPerson: "contactPerson",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
}; //對應後端排序欄位

/** 狀態管理 **/
const basicDataList = ref([]); //表格資料
const dialogVisible = ref(false); //彈窗狀態
const dialogMode = ref("create"); //彈窗模式
const editingId = ref(null); //編輯ID
const basicFormRef = ref(null); //表單實體
const isSaving = ref(false); //儲存中

/** 表單設定 **/
const initializeForm = () => ({
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  productTypeCode: productTypeOptions.value[0]?.value || "",
  taxId: "",
  paymentTerms: "30",
  isActive: true,
  addressStreet: "",
  addressCity: "",
  addressState: "",
  addressZip: "",
  addressCountry: "台灣"
}); //建立預設表單
const basicForm = ref(initializeForm()); //表單資料
const dialogTitle = computed(() => (editingId.value ? "編輯供應商" : "新增供應商")); //彈窗標題
const basicFormRules = {
  name: [{ required: true, message: "請輸入供應商名稱", trigger: "blur" }],
  contactPerson: [{ required: true, message: "請輸入聯絡人", trigger: "blur" }],
  email: [{ required: true, message: "請輸入 Email", trigger: "blur" }],
  phone: [{ required: true, message: "請輸入聯絡電話", trigger: "blur" }],
  addressStreet: [{ required: true, message: "請輸入街道地址", trigger: "blur" }],
  addressCity: [{ required: true, message: "請輸入城市", trigger: "blur" }],
  addressState: [{ required: true, message: "請輸入縣市/州", trigger: "blur" }],
  addressZip: [{ required: true, message: "請輸入郵遞區號", trigger: "blur" }],
  addressCountry: [{ required: true, message: "請輸入國家", trigger: "blur" }]
}; //表單驗證規則
const normalizeListResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const apiData = responseData?.data ?? responseData ?? {};
  const items = apiData?.data ?? apiData?.items ?? [];
  const meta = apiData?.meta ?? apiData?.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta
  };
}; //統一處理API列表回傳

/** 共用工具 **/
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}; //日期格式化
const formatAddress = (address = {}) => {
  const { street, city, state, zipCode, country } = address;
  return [street, city, state, zipCode, country].filter(Boolean).join("、") || "—";
}; //地址格式化
const mapVendorFromApi = (vendor = {}) => {
  const productTypeCode = vendor.primaryProductType?.code || vendor.productType?.code || vendor.productTypeCode || "";
  const productTypeName = findProductTypeByCode(productTypeCode)?.label || vendor.primaryProductType?.name || vendor.productType?.name || productTypeCode || "";
  return {
    id: vendor.id || vendor.code || `vendor-${Date.now()}`,
    code: vendor.code || "",
    name: vendor.name || "—",
    contactPerson: vendor.contactPerson || vendor.contactName || "—",
    phone: vendor.phone || "—",
    email: vendor.email || "—",
    productTypeCode,
    productTypeName: productTypeName || "—",
    addressDisplay: formatAddress(vendor.address),
    paymentTerms: vendor.paymentTerms ?? "",
    isActive: vendor.isActive !== false && vendor.status !== "inactive",
    createdAt: formatDate(vendor.createdAt),
    updatedAt: formatDate(vendor.updatedAt),
    raw: vendor
  };
}; //API資料轉換
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ""); //取得欄位排序狀態
const resolveSearchTerm = () => {
  const key = activeSearchKey.value;
  const prioritized = searchFields[key]?.trim();
  if (prioritized) return prioritized;
  const fallback = [searchFields.name, searchFields.contactName, searchFields.contactPhone].map((value) => value?.trim()).find((value) => !!value);
  return fallback || "";
}; //組合搜尋條件

/** 資料取得 **/
const buildListParams = () => {
  const params = {
    page: pagination.page,
    limit: pagination.limit
  };
  const searchTerm = resolveSearchTerm();
  if (searchTerm) params.search = searchTerm;
  if (filters.productTypeCode !== "all") params.productTypeCode = filters.productTypeCode;
  if (filters.status !== "all") {
    params.status = filters.status;
  }
  if (sortField.value) {
    params.sortBy = sortFieldMap[sortField.value] || sortField.value;
    params.sortOrder = sortDirection.value;
  }
  return params;
}; //建立查詢參數
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await VendorListGet(buildListParams());
    const { items, meta } = normalizeListResponse(response);
    basicDataList.value = items.map(mapVendorFromApi);
    pagination.total = meta.total ?? meta.totalItems ?? items.length;
    pagination.limit = Number(meta.limit ?? pagination.limit);
    pagination.page = meta.page ?? pagination.page;
    pagination.totalPages = meta.totalPages ?? pagination.totalPages;
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "載入失敗", message: error?.response?.data?.message || error?.message || "無法取得供應商資料" });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得供應商列表
const handleGlobalSearch = async (key) => {
  if (key) activeSearchKey.value = key;
  pagination.page = 1;
  await getAPI();
}; //表頭搜尋觸發
const handleFiltersChange = async () => {
  pagination.page = 1;
  await getAPI();
}; //下拉篩選觸發
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  const normalizedOrder = order === "descending" ? "desc" : order === "ascending" ? "asc" : order;
  if (!normalizedOrder) {
    sortField.value = "";
    sortDirection.value = "desc";
  } else {
    sortField.value = field;
    sortDirection.value = normalizedOrder;
  }
  await getAPI();
}; //切換排序
const clearFilter = async () => {
  searchFields.name = "";
  searchFields.contactName = "";
  searchFields.contactPhone = "";
  filters.productTypeCode = "all";
  filters.status = "all";
  sortField.value = "";
  sortDirection.value = "desc";
  activeSearchKey.value = "name";
  pagination.page = 1;
  await getAPI();
}; //清除所有篩選
const CurrentChange = async (page) => {
  const safePage = Math.min(Math.max(page, 1), pagination.totalPages || 1);
  if (safePage === pagination.page) return;
  pagination.page = safePage;
  await getAPI();
}; //分頁變更
const SizeChange = async (size) => {
  pagination.limit = Number(size) || 10;
  pagination.page = 1;
  await getAPI();
}; //切換每頁筆數

const resetFormState = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重置表單
const ensureDefaultProductType = () => {
  if (!basicForm.value.productTypeCode && productTypeOptions.value.length) {
    basicForm.value.productTypeCode = productTypeOptions.value[0].value;
  }
}; //確保表單有預設產品類型
const fillFormFromRecord = (record = {}) => {
  const vendor = record.raw || record;
  basicForm.value.name = vendor.name || "";
  basicForm.value.contactPerson = vendor.contactPerson || vendor.contactName || "";
  basicForm.value.email = vendor.email || "";
  basicForm.value.phone = vendor.phone || "";
  const resolvedCode = vendor.primaryProductType?.code || vendor.productType?.code || vendor.productTypeCode || "";
  basicForm.value.productTypeCode = findProductTypeByCode(resolvedCode)?.value || productTypeOptions.value[0]?.value || "";
  basicForm.value.taxId = vendor.taxId || "";
  basicForm.value.paymentTerms = vendor.paymentTerms != null ? String(vendor.paymentTerms) : "";
  basicForm.value.isActive = vendor.isActive !== false && vendor.status !== "inactive";
  basicForm.value.addressStreet = vendor.address?.street || "";
  basicForm.value.addressCity = vendor.address?.city || "";
  basicForm.value.addressState = vendor.address?.state || "";
  basicForm.value.addressZip = vendor.address?.zipCode || "";
  basicForm.value.addressCountry = vendor.address?.country || "台灣";
}; //填入表單資料
/** 新增編輯相關 **/
const openCreateDialog = () => {
  dialogMode.value = "create";
  editingId.value = null;
  resetFormState();
  ensureDefaultProductType();
  dialogVisible.value = true;
}; //開啟新增彈窗
const loadVendorDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await VendorGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord({ raw: detail });
  } catch (error) {
    Notify({ type: "error", title: "讀取失敗", message: error?.response?.data?.message || "無法取得供應商資料" });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得單筆詳細資料
const openEditDialog = (row) => {
  if (!row?.id) return;
  dialogMode.value = "edit";
  editingId.value = row.id;
  fillFormFromRecord(row);
  dialogVisible.value = true;
  loadVendorDetail(row.id);
}; //開啟編輯彈窗
const preparePayload = () => {
  const selectedProductType = findProductTypeByCode(basicForm.value.productTypeCode);
  return {
    name: basicForm.value.name.trim(),
    contactPerson: basicForm.value.contactPerson.trim(),
    email: basicForm.value.email.trim(),
    phone: basicForm.value.phone.trim(),
    address: {
      street: basicForm.value.addressStreet.trim(),
      city: basicForm.value.addressCity.trim(),
      state: basicForm.value.addressState.trim(),
      zipCode: basicForm.value.addressZip.trim(),
      country: basicForm.value.addressCountry.trim()
    },
    productTypeCode: selectedProductType?.value || basicForm.value.productTypeCode || undefined,
    taxId: basicForm.value.taxId?.trim() || undefined,
    paymentTerms: basicForm.value.paymentTerms ? Number(basicForm.value.paymentTerms) : undefined,
    isActive: Boolean(basicForm.value.isActive)
  };
}; //整理表單送出資料
const saveVendor = async () => {
  const valid = await basicFormRef.value?.validate?.();
  if (!valid) return;
  const payload = preparePayload();
  isSaving.value = true;
  try {
    if (dialogMode.value === "edit" && editingId.value) {
      await VendorUpdatePatch(editingId.value, payload);
      Notify({ type: "success", title: "供應商已更新" });
    } else {
      await VendorCreatePost(payload);
      Notify({ type: "success", title: "已新增供應商" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "儲存失敗", message: error?.response?.data?.message || "無法儲存供應商資料" });
  } finally {
    isSaving.value = false;
  }
}; //儲存供應商資料
const deleteVendor = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await VendorDeleteById(id);
        Notify({ type: "success", title: "供應商已刪除" });
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        Notify({ type: "error", title: "刪除失敗", message: error?.response?.data?.message || "無法刪除供應商" });
      }
    }
  });
}; //刪除供應商

watch(dialogVisible, (visible) => {
  if (!visible) {
    basicFormRef.value?.clearValidate?.();
  }
}); //彈窗關閉時清除驗證
watch(
  () => [filters.productTypeCode, filters.status],
  () => {
    handleFiltersChange();
  }
); //偵測篩選條件變化

const loadProductTypes = async () => {
  try {
    const response = await ProductTypeListGet({ page: 1, limit: 200 });
    const payload = response?.data ?? response ?? {};
    const items = payload.data ?? payload.items ?? [];
    productTypeOptions.value = items.map((item) => ({
      label: item.name || item.code,
      value: item.code
    }));
    ensureDefaultProductType();
  } catch (error) {
    console.error("Failed to load product types", error);
  }
};

onMounted(async () => {
  await loadProductTypes();
  ensureDefaultProductType();
  await getAPI();
}); //初始化載入列表
</script>
