<!-- src/pages/basic-data/PotentialCustomerManagementPage.vue 潛在客戶 -->
<template>
  <Card ref="containerRef">
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>潛在客戶列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ pagination.total }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearAllFilters">清除全部搜尋</Button>
        <Button type="primary" @click="openCreateDialog">新增潛在客戶</Button>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <CustomTinyGrid :data="basicDataList" row-key="id" :height="640" :border="true" :row-id="'id'">
        <CustomTinyGridColumn field="companyName" title="公司名稱" min-width="260" fixed="left" sortable :sort-field="'companyName'" :current-order="getColumnOrder('companyName')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">公司名稱</span>
              <TinyInput v-model="filters.companyName" placeholder="輸入公司名稱" class="h-8 text-xs" clearable @keyup.enter="handleHeaderSearch" @clear="handleHeaderSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ row.companyName }}</span>
              <span class="text-xs text-gray-500">{{ row.companyEmail || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="contactName" title="主要聯絡人" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="text-sm text-gray-900">{{ row.contactName || "未設定" }}</span>
              <span class="text-xs text-gray-500">{{ row.contactPhone || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="source" title="來源" :width="160" sortable :sort-field="'source'" :current-order="getColumnOrder('source')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">來源</span>
              <TinySelect v-model="filters.source" :options="sourceFilterOptions" placeholder="全部" class="h-8 text-xs" @update:model-value="handleSelectFiltersChange" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge type="info">{{ sourceLabelMap[row.source] || row.source || "—" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="trackDate" title="追蹤日期" :width="160" sortable :sort-field="'trackDate'" :current-order="getColumnOrder('trackDate')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">追蹤日期</span>
              <div class="grid grid-cols-2 gap-1">
                <TinyDatePicker v-model="filters.trackDateFrom" type="date" placeholder="起" size="mini" clearable @update:model-value="handleSelectFiltersChange" />
                <TinyDatePicker v-model="filters.trackDateTo" type="date" placeholder="迄" size="mini" clearable @update:model-value="handleSelectFiltersChange" />
              </div>
            </div>
          </template>
          <template #default="{ row }">{{ row.trackDate || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="referral" title="推薦來源" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-gray-500">客戶：{{ row.referralCustomerName || "—" }}</span>
              <span class="text-xs text-gray-500">員工：{{ row.referralEmployeeName || "—" }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="notes" title="備註" min-width="260">
          <template #default="{ row }">{{ row.note || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" :width="120" align="center">
          <template #default="{ row }">
            <a-tag :color="row.status === 'ACTIVE' ? 'arcoblue' : 'red'" size="large">{{ row.status === "ACTIVE" ? "追蹤中" : "停用" }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <Button variant="ghost" @click="openEditDialog(row)">編輯</Button>
              <Button variant="ghost" @click="deleteLead(row.id)">刪除</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="handlePageChange" @page-size-change="handlePageSizeChange" />
    </CardContent>
  </Card>

  <TinyDialogBox v-model:visible="dialogVisible" :title="dialogTitle" width="720px" :close-on-click-modal="false" top="64px">
    <TinyForm ref="basicFormRef" :model="formState" :rules="basicFormRules" label-width="120px" label-position="top">
      <div class="mb-3 flex justify-between">
        <Button type="text" @click="setActiveTab('contact')" :class="tabButtonClass('contact')">聯絡資訊</Button>
        <Button type="text" @click="setActiveTab('company')" :class="tabButtonClass('company')">公司資訊</Button>
        <Button type="text" @click="setActiveTab('others')" :class="tabButtonClass('others')">其他資訊</Button>
      </div>
      <div v-if="hasFakeData && !editingId" class="mb-4 flex justify-end">
        <Button variant="outline" size="sm" @click="generateFakeData">產生假資料</Button>
      </div>
      <div v-show="activeTab === 'contact'" class="space-y-4">
        <TinyFormItem label="主要聯絡人姓名" prop="contact.name">
          <TinyInput v-model="formState.contact.name" placeholder="請輸入" />
        </TinyFormItem>
        <div class="grid gap-4 md:grid-cols-2">
          <TinyFormItem label="聯絡電話" prop="contact.phone">
            <TinyInput v-model="formState.contact.phone" placeholder="0912-345-678" />
          </TinyFormItem>
          <TinyFormItem label="電子信箱" prop="contact.email">
            <TinyInput v-model="formState.contact.email" placeholder="name@example.com" />
          </TinyFormItem>
        </div>
        <TinyFormItem label="地址" prop="contact.address">
          <TinyInput v-model="formState.contact.address" placeholder="請輸入地址" />
        </TinyFormItem>
      </div>

      <div v-show="activeTab === 'company'" class="space-y-4">
        <TinyFormItem label="公司名稱" prop="company.companyName">
          <TinyInput v-model="formState.company.companyName" placeholder="請輸入" />
        </TinyFormItem>
        <div class="grid gap-4 md:grid-cols-2">
          <TinyFormItem label="公司電話" prop="company.companyPhone">
            <TinyInput v-model="formState.company.companyPhone" placeholder="02-1234-5678" />
          </TinyFormItem>
          <TinyFormItem label="公司 Email">
            <TinyInput v-model="formState.company.companyEmail" placeholder="company@example.com" />
          </TinyFormItem>
        </div>
        <TinyFormItem label="公司地址" prop="company.companyAddress">
          <TinyInput v-model="formState.company.companyAddress" placeholder="請輸入地址" />
        </TinyFormItem>
        <TinyFormItem label="統一編號">
          <TinyInput v-model="formState.company.taxId" placeholder="請輸入統編" />
        </TinyFormItem>
        <TinyFormItem label="註冊日期">
          <TinyDatePicker v-model="formState.company.registeredDate" type="date" placeholder="選擇日期" />
        </TinyFormItem>
        <TinyFormItem label="客戶類別">
          <TinyCheckboxGroup v-model="formState.meta.categories">
            <TinyCheckbox v-for="category in customerCategories" :key="category" :label="category">{{ category }}</TinyCheckbox>
          </TinyCheckboxGroup>
        </TinyFormItem>
      </div>

      <div v-show="activeTab === 'others'" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <TinyFormItem label="來源" prop="meta.source">
            <TinySelect v-model="formState.meta.source" :options="sourceFormOptions" placeholder="請選擇" />
          </TinyFormItem>
          <TinyFormItem label="追蹤日期" prop="meta.trackDate">
            <TinyDatePicker v-model="formState.meta.trackDate" type="date" placeholder="選擇日期" />
          </TinyFormItem>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <TinyFormItem v-if="formState.meta.source === 'REFERRAL'" label="推薦客戶 ID" prop="meta.referralCustomerId">
            <TinyInput v-model="formState.meta.referralCustomerId" placeholder="輸入客戶 ID" />
          </TinyFormItem>
          <TinyFormItem v-if="formState.meta.source === 'COLD_CALL'" label="推薦員工 ID" prop="meta.referralEmployeeId">
            <TinyInput v-model="formState.meta.referralEmployeeId" placeholder="輸入員工 ID" />
          </TinyFormItem>
        </div>
        <TinyFormItem label="來源說明" v-if="['SOCIAL_MEDIA', 'TRADE_SHOW', 'OTHER'].includes(formState.meta.source)">
          <TinyInput v-model="formState.meta.sourceDetail" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="付款方式">
          <TinySelect v-model="formState.meta.paymentMethod" :options="paymentOptions" placeholder="請選擇" />
        </TinyFormItem>
        <TinyFormItem label="訂金">
          <TinyInput v-model="formState.meta.deposit" type="number" placeholder="0" />
        </TinyFormItem>
        <TinyFormItem label="發票抬頭">
          <TinyInput v-model="formState.meta.invoiceTitle" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="發票統編">
          <TinyInput v-model="formState.meta.invoiceTaxId" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="標籤 (輸入後按 Enter)">
          <TinyTextPopup v-model="formState.meta.tags" placeholder="VIP,大型企業" class="w-full" />
        </TinyFormItem>
        <TinyFormItem label="備註">
          <TinyInput v-model="formState.meta.note" type="textarea" rows="3" placeholder="請輸入備註" />
        </TinyFormItem>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900">自訂價格</span>
            <Button type="text" @click="addCustomPrice">新增商品</Button>
          </div>
          <div v-if="!formState.meta.customPrices.length" class="text-xs text-gray-500">尚未設定自訂價格</div>
          <Card v-for="item in formState.meta.customPrices" :key="item.id" class="grid gap-3 p-3 md:grid-cols-3">
            <TinyFormItem label="商品 ID">
              <TinyInput v-model="item.productId" placeholder="輸入商品 ID" />
            </TinyFormItem>
            <TinyFormItem label="調整金額">
              <TinyInput type="number" v-model="item.adjustment" placeholder="0" />
            </TinyFormItem>
            <div class="flex items-center justify-end">
              <Button type="text" @click="removeCustomPrice(item.id)">移除</Button>
            </div>
          </Card>
        </div>
      </div>
    </TinyForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">取消</Button>
        <Button type="primary" :disabled="isSaving" :loading="isSaving" @click="saveLead">{{ isSaving ? "儲存中..." : "儲存" }}</Button>
      </div>
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { TinyForm, TinyFormItem, TinyInput, TinySelect, TinyDatePicker, TinyDialogBox, TinyCheckbox, TinyCheckboxGroup, TinyTextPopup, TinyBadge } from "@opentiny/vue";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import AppPagination from "@/components/ui/AppPagination.vue";
import Notify from "@opentiny/vue-notify";
import { PotentialCustomersListGet, PotentialCustomersCreatePost, PotentialCustomersUpdatePut, PotentialCustomersDeleteById, PotentialCustomersGetByID } from "@/assets/API/PotentialCustomers";
import { useMainStore } from "@/stores/LoadingStore";
import { useContentWidth } from "@/composables/useContentWidth";
import { format } from "date-fns";

const { containerRef } = useContentWidth();
const mainStore = useMainStore();

const customerCategories = ["桶裝水", "雞蛋", "飲水機"];
const paymentOptions = [
  { label: "月結", value: "月結" },
  { label: "現金", value: "現金" },
  { label: "預付", value: "預付" }
];

const sourceLabelMap = {
  REFERRAL: "客戶轉介",
  COLD_CALL: "電話開發",
  SOCIAL_MEDIA: "網路廣告",
  TRADE_SHOW: "展覽活動",
  OTHER: "其他"
};
const sourceFilterOptions = [{ label: "全部", value: "all" }, { label: "客戶轉介", value: "REFERRAL" }, { label: "電話開發", value: "COLD_CALL" }, { label: "網路廣告", value: "SOCIAL_MEDIA" }, { label: "展覽活動", value: "TRADE_SHOW" }, { label: "其他", value: "OTHER" }];
const sourceFormOptions = Object.entries(sourceLabelMap).map(([value, label]) => ({ label, value }));

const filters = reactive({
  companyName: "",
  source: "all",
  trackDateFrom: "",
  trackDateTo: ""
});

const sortField = ref("createdAt");
const sortDirection = ref("desc");
const sortFieldMap = {
  companyName: "companyName",
  source: "source",
  trackDate: "trackDate",
  createdAt: "createdAt"
};

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});
const pageSizeOptions = [10, 20, 50, 100];

const basicDataList = ref([]);
const dialogVisible = ref(false);
const dialogTitle = computed(() => (editingId.value ? "編輯潛在客戶" : "新增潛在客戶"));
const editingId = ref(null);
const basicFormRef = ref(null);
const isSaving = ref(false);

const activeTab = ref("contact");
const formState = reactive({
  contact: { name: "", phone: "", email: "", address: "" },
  company: { companyName: "", companyPhone: "", companyEmail: "", companyAddress: "", taxId: "", registeredDate: "" },
  meta: {
    source: "OTHER",
    trackDate: "",
    referralCustomerId: "",
    referralEmployeeId: "",
    sourceDetail: "",
    paymentMethod: "",
    deposit: "",
    invoiceTitle: "",
    invoiceTaxId: "",
    tags: "",
    note: "",
    categories: [],
    customPrices: []
  }
});

const hasFakeData = true;
const generateFakeData = () => {
  const seed = Date.now() % 1000;
  formState.contact = { name: `聯絡人${seed}`, phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`, email: `lead${seed}@example.com`, address: "台北市中正區" };
  formState.company = {
    companyName: `潛在客戶 ${seed}`,
    companyPhone: "02-1234-5678",
    companyEmail: `company${seed}@mail.com`,
    companyAddress: "台北市信義區忠孝東路 100 號",
    taxId: `${Math.floor(Math.random() * 90000000 + 10000000)}`,
    registeredDate: format(new Date(), "yyyy-MM-dd")
  };
  formState.meta = {
    ...formState.meta,
    source: "REFERRAL",
    trackDate: format(new Date(), "yyyy-MM-dd"),
    referralCustomerId: `cust-${seed}`,
    paymentMethod: "月結",
    deposit: "20000",
    tags: "VIP,重點客戶",
    categories: [...customerCategories],
    customPrices: [{ id: Date.now(), productId: "water-1", adjustment: 150 }]
  };
};

const basicFormRules = computed(() => ({
  "contact.name": [{ required: true, message: "請輸入聯絡人姓名", trigger: "blur" }],
  "company.companyName": [{ required: true, message: "請輸入公司名稱", trigger: "blur" }],
  "meta.source": [{ required: true, message: "請選擇來源", trigger: "change" }],
  "meta.trackDate": [{ required: true, message: "請選擇追蹤日期", trigger: "change" }],
  "meta.referralCustomerId": [{ required: formState.meta.source === "REFERRAL", message: "客戶轉介需填推薦客戶 ID", trigger: "blur" }],
  "meta.referralEmployeeId": [{ required: formState.meta.source === "COLD_CALL", message: "電話開發需填推薦員工 ID", trigger: "blur" }]
}));

const tabButtonClass = (tab) => (activeTab.value === tab ? "text-primary font-semibold" : "text-gray-500");
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const addCustomPrice = () => {
  formState.meta.customPrices = [...formState.meta.customPrices, { id: Date.now(), productId: "", adjustment: 0 }];
};
const removeCustomPrice = (id) => {
  formState.meta.customPrices = formState.meta.customPrices.filter((item) => item.id !== id);
};

const normalizeListResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const apiData = responseData?.data ?? responseData ?? {};
  const items = apiData?.data ?? apiData?.items ?? [];
  const meta = apiData?.meta ?? apiData?.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta
  };
};

const mapLeadFromApi = (lead = {}) => {
  const contacts = lead.contacts ?? [];
  const primaryContact = contacts.find((contact) => contact.isPrimary) || contacts[0] || {};
  return {
    id: lead.id || lead.code || `lead-${Date.now()}`,
    companyName: lead.companyName || lead.name || "—",
    companyEmail: lead.companyEmail || lead.contactInfo?.email || primaryContact.email || "",
    contactName: primaryContact.name || "",
    contactPhone: primaryContact.phone || "",
    source: lead.source || "OTHER",
    trackDate: lead.trackDate ? lead.trackDate.split("T")[0] : "",
    referralCustomerName: lead.referralCustomerName || "",
    referralEmployeeName: lead.referralEmployeeName || "",
    note: lead.note || lead.notes || "",
    status: lead.status || "ACTIVE",
    raw: lead
  };
};

const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : "");
const buildListParams = () => {
  const params = {
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sortFieldMap[sortField.value] || sortField.value,
    sortOrder: sortDirection.value
  };
  if (filters.companyName?.trim()) params.companyName = filters.companyName.trim();
  if (filters.source !== "all") params.source = filters.source;
  if (filters.trackDateFrom) params.trackDateFrom = filters.trackDateFrom;
  if (filters.trackDateTo) params.trackDateTo = filters.trackDateTo;
  return params;
};

const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await PotentialCustomersListGet(buildListParams());
    const { items, meta } = normalizeListResponse(response);
    basicDataList.value = items.map(mapLeadFromApi);
    pagination.total = meta.total ?? meta.totalItems ?? items.length;
    pagination.limit = Number(meta.limit ?? pagination.limit);
    pagination.page = meta.page ?? pagination.page;
    pagination.totalPages = meta.totalPages ?? pagination.totalPages;
  } catch (error) {
    Notify({ type: "error", title: "載入失敗", message: error?.response?.data?.message || error.message || "無法取得潛在客戶資料" });
  } finally {
    mainStore.setLoading(false);
  }
};

const handleHeaderSearch = async () => {
  pagination.page = 1;
  await getAPI();
};
const handleSelectFiltersChange = async () => {
  pagination.page = 1;
  await getAPI();
};
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
};
const clearAllFilters = async () => {
  filters.companyName = "";
  filters.source = "all";
  filters.trackDateFrom = "";
  filters.trackDateTo = "";
  sortField.value = "createdAt";
  sortDirection.value = "desc";
  pagination.page = 1;
  await getAPI();
};
const handlePageChange = async (page) => {
  pagination.page = page;
  await getAPI();
};
const handlePageSizeChange = async (size) => {
  pagination.limit = Number(size) || 10;
  pagination.page = 1;
  await getAPI();
};

const resetForm = () => {
  formState.contact = { name: "", phone: "", email: "", address: "" };
  formState.company = { companyName: "", companyPhone: "", companyEmail: "", companyAddress: "", taxId: "", registeredDate: "" };
  formState.meta = {
    source: "OTHER",
    trackDate: "",
    referralCustomerId: "",
    referralEmployeeId: "",
    sourceDetail: "",
    paymentMethod: "",
    deposit: "",
    invoiceTitle: "",
    invoiceTaxId: "",
    tags: "",
    note: "",
    categories: [],
    customPrices: []
  };
  basicFormRef.value?.clearValidate?.();
};

const openCreateDialog = () => {
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};
const fillFormFromRecord = (record) => {
  const primaryContact = record.raw?.contacts?.find((contact) => contact.isPrimary) || record.raw?.contacts?.[0] || {};
  formState.contact = {
    name: primaryContact.name || "",
    phone: primaryContact.phone || "",
    email: primaryContact.email || "",
    address: primaryContact.address || ""
  };
  formState.company = {
    companyName: record.raw?.companyName || "",
    companyPhone: record.raw?.companyPhone || "",
    companyEmail: record.raw?.companyEmail || "",
    companyAddress: record.raw?.companyAddress || "",
    taxId: record.raw?.taxId || "",
    registeredDate: record.raw?.registeredDate?.split?.("T")[0] || ""
  };
  formState.meta = {
    source: record.raw?.source || "OTHER",
    trackDate: record.raw?.trackDate?.split?.("T")[0] || "",
    referralCustomerId: record.raw?.referralCustomerId || "",
    referralEmployeeId: record.raw?.referralEmployeeId || "",
    sourceDetail: record.raw?.sourceDetail || "",
    paymentMethod: record.raw?.paymentMethod || "",
    deposit: record.raw?.deposit ?? "",
    invoiceTitle: record.raw?.invoiceTitle || "",
    invoiceTaxId: record.raw?.invoiceTaxId || "",
    tags: Array.isArray(record.raw?.tags) ? record.raw.tags.join(",") : record.raw?.tags || "",
    note: record.raw?.note || "",
    categories: record.raw?.categories || [],
    customPrices: (record.raw?.customPrices || []).map((item, index) => ({ id: item.id ?? index + 1, productId: item.productId || "", adjustment: item.adjustment ?? 0 }))
  };
};
const loadLeadDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await PotentialCustomersGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord({ raw: detail });
  } catch (error) {
    Notify({ type: "error", title: "讀取失敗", message: error?.response?.data?.message || "無法取得潛在客戶資料" });
  } finally {
    mainStore.setLoading(false);
  }
};
const openEditDialog = (row) => {
  if (!row?.id) return;
  editingId.value = row.id;
  fillFormFromRecord(row);
  dialogVisible.value = true;
  loadLeadDetail(row.id);
};

const parseTagsInput = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const preparePayload = () => {
  const contact = formState.contact;
  const company = formState.company;
  const meta = formState.meta;
  const payload = {
    companyName: company.companyName,
    companyPhone: company.companyPhone || undefined,
    companyEmail: company.companyEmail || undefined,
    companyAddress: company.companyAddress || undefined,
    taxId: company.taxId || undefined,
    registeredDate: company.registeredDate || undefined,
    source: meta.source,
    trackDate: meta.trackDate,
    referralCustomerId: meta.referralCustomerId || undefined,
    referralEmployeeId: meta.referralEmployeeId || undefined,
    sourceDetail: meta.sourceDetail || undefined,
    paymentMethod: meta.paymentMethod || undefined,
    deposit: meta.deposit ? Number(meta.deposit) : undefined,
    invoiceTitle: meta.invoiceTitle || undefined,
    invoiceTaxId: meta.invoiceTaxId || undefined,
    note: meta.note || undefined,
    contactInfo: {
      name: contact.name,
      phone: contact.phone || undefined,
      email: contact.email || undefined,
      address: contact.address || undefined
    },
    categories: meta.categories || [],
    customPrices: meta.customPrices.map((item) => ({
      productId: item.productId,
      adjustment: Number(item.adjustment || 0)
    })),
    tags: parseTagsInput(meta.tags)
  };
  return payload;
};

const saveLead = async () => {
  const valid = await basicFormRef.value?.validate?.();
  if (!valid) return;
  const payload = preparePayload();
  if (!payload) return;
  isSaving.value = true;
  try {
    if (editingId.value) {
      await PotentialCustomersUpdatePut(editingId.value, payload);
      Notify({ type: "success", title: "潛在客戶已更新" });
    } else {
      await PotentialCustomersCreatePost(payload);
      Notify({ type: "success", title: "已新增潛在客戶" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "儲存失敗", message: error?.response?.data?.message || "無法儲存資料" });
  } finally {
    isSaving.value = false;
  }
};

const deleteLead = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await PotentialCustomersDeleteById(id);
        Notify({ type: "success", title: "已刪除" });
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        Notify({ type: "error", title: "刪除失敗", message: error?.response?.data?.message || "無法刪除資料" });
      }
    }
  });
};

watch(
  () => formState.meta.source,
  () => {
    if (formState.meta.source !== "REFERRAL") {
      formState.meta.referralCustomerId = "";
    }
    if (formState.meta.source !== "COLD_CALL") {
      formState.meta.referralEmployeeId = "";
    }
    if (!["SOCIAL_MEDIA", "TRADE_SHOW", "OTHER"].includes(formState.meta.source)) {
      formState.meta.sourceDetail = "";
    }
  }
);

onMounted(getAPI);
</script>
