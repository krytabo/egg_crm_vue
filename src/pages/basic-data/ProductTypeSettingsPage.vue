<!-- src/pages/basic-data/ProductTypeSettingsPage.vue 產品類型設定 -->
<template>
  <Card ref="containerRef">
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>參數設定 - 產品類型</CardTitle>
        <p class="text-sm text-gray-500">共 {{ pagination.total }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilter">清除全部搜尋</Button>
        <Button type="primary" @click="openCreateDialog">新增產品類型</Button>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <TinyForm label-width="100px" label-position="left" class="grid gap-3 rounded-[10px] bg-[#f5f7fb] px-5 py-4 md:grid-cols-3">
        <TinyFormItem label="名稱 / 代碼">
          <TinyInput v-model="filters.keyword" placeholder="輸入名稱或代碼" clearable class="h-9 text-sm" @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
        </TinyFormItem>
        <TinyFormItem label="是否可刪除">
          <TinySelect v-model="filters.deletable" :options="deletableFilterOptions" placeholder="全部" class="h-9 text-sm" @update:model-value="handleFiltersChange" />
        </TinyFormItem>
      </TinyForm>
      <CustomTinyGrid :data="basicDataList" :height="520" :border="true" row-key="id" :row-id="'id'">
        <CustomTinyGridColumn field="name" title="名稱" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-base font-medium text-gray-900">{{ row.name }}</span>
              <span class="text-xs text-gray-500">代碼：{{ row.code }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="description" title="描述" min-width="260">
          <template #default="{ row }">{{ row.description || "—" }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="isDeletable" title="可刪除" :width="140" align="center">
          <template #default="{ row }">
            <TinyBadge :type="row.isDeletable ? 'success' : 'info'">{{ row.isDeletable ? "可刪除" : "系統預設" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" title="建立日期" :width="160">
          <template #default="{ row }">{{ row.createdAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="updatedAt" title="更新日期" :width="160">
          <template #default="{ row }">{{ row.updatedAt }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <Button variant="ghost" @click="openEditDialog(row)">編輯</Button>
              <Button variant="ghost" :disabled="!row.isDeletable" @click="deleteType(row)">刪除</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
    </CardContent>
  </Card>

  <TinyDialogBox v-model:visible="dialogVisible" :title="dialogTitle" width="520px" :close-on-click-modal="false">
    <TinyForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="100px" label-position="top">
      <div class="grid gap-4 md:grid-cols-2">
        <TinyFormItem label="代碼" prop="code">
          <TinyInput v-model="basicForm.code" placeholder="FINISHED_GOOD" :disabled="dialogMode === 'edit'" />
        </TinyFormItem>
        <TinyFormItem label="名稱" prop="name">
          <TinyInput v-model="basicForm.name" placeholder="輸入名稱" />
        </TinyFormItem>
      </div>
      <TinyFormItem label="描述">
        <TinyInput v-model="basicForm.description" type="textarea" rows="4" placeholder="補充說明" />
      </TinyFormItem>
      <TinyFormItem label="允許刪除">
        <TinyCheckbox :model-value="basicForm.isDeletable" @update:model-value="(val) => (basicForm.isDeletable = val)">此類型可刪除</TinyCheckbox>
      </TinyFormItem>
    </TinyForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">取消</Button>
        <Button type="primary" :loading="isSaving" :disabled="isSaving" @click="saveType">{{ isSaving ? "儲存中..." : "儲存" }}</Button>
      </div>
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ProductTypeListGet, ProductTypeCreatePost, ProductTypeUpdatePatch, ProductTypeDeleteById, ProductTypeGetByID } from "@/assets/API/ProductType";
import { TinyForm, TinyFormItem, TinyInput, TinySelect, TinyCheckbox, TinyDialogBox, TinyBadge } from "@opentiny/vue";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import { Button } from "@/components/ui/button";
import AppPagination from "@/components/ui/AppPagination.vue";
import Notify from "@opentiny/vue-notify";
import { useMainStore } from "@/stores/LoadingStore";
import { useContentWidth } from "@/composables/useContentWidth";
import { format } from "date-fns";

const mainStore = useMainStore();
const { containerRef } = useContentWidth();

/** 常數與選項 **/
const deletableFilterOptions = [
  { label: "全部", value: "all" },
  { label: "僅顯示可刪除", value: "true" },
  { label: "僅顯示系統預設", value: "false" }
]; //可刪除篩選選項
const pageSizeOptions = [10, 20, 50, 100]; //分頁可選筆數
const initializeForm = {
  code: "",
  name: "",
  description: "",
  isDeletable: true
}; //表單初始值

/** 分頁設定 **/
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
}); //分頁狀態
const totalPages = computed(() => pagination.totalPages || 1); //總頁數
const CurrentChange = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  if (safePage === pagination.page) return;
  pagination.page = safePage;
  getAPI();
}; //切換頁碼
const SizeChange = (val) => {
  pagination.limit = Number(val) || 10;
  pagination.page = 1;
  getAPI();
}; //切換每頁筆數

/** 共用工具 **/
const extractError = (error, fallback) => error?.response?.data?.message || error?.message || fallback; //取得錯誤訊息
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}; //格式化日期
const normalizeListResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const payload = responseData?.data ?? responseData ?? {};
  const rows = payload?.data ?? [];
  const meta = payload?.meta ?? {};
  return {
    items: Array.isArray(rows) ? rows : [],
    meta
  };
}; //整理列表回傳
const mapProductTypeToRow = (item = {}) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description || "",
  isDeletable: item.isDeletable !== false,
  createdAt: formatDate(item.createdAt),
  updatedAt: formatDate(item.updatedAt),
  raw: item
}); //轉換成表格資料

/** 篩選與查詢 **/
const basicDataList = ref([]); //表格資料
const filters = reactive({
  keyword: "",
  deletable: "all"
}); //篩選條件
const buildListParams = () => {
  const params = {
    page: pagination.page,
    limit: pagination.limit
  };
  const keyword = filters.keyword.trim();
  if (keyword) params.search = keyword;
  if (filters.deletable !== "all") params.isDeletable = filters.deletable === "true";
  return params;
}; //整理查詢參數
const handleGlobalSearch = async () => {
  pagination.page = 1;
  await getAPI();
}; //關鍵字搜尋
const handleFiltersChange = async () => {
  pagination.page = 1;
  await getAPI();
}; //篩選條件更新
const clearFilter = () => {
  filters.keyword = "";
  filters.deletable = "all";
  handleGlobalSearch();
}; //清除搜尋條件
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await ProductTypeListGet(buildListParams());
    const { items, meta } = normalizeListResponse(response);
    basicDataList.value = items.map(mapProductTypeToRow);
    pagination.total = meta.total ?? items.length;
    pagination.limit = Number(meta.limit ?? pagination.limit);
    pagination.page = meta.page ?? pagination.page;
    pagination.totalPages = meta.totalPages ?? pagination.totalPages;
  } catch (error) {
    basicDataList.value = [];
    Notify({ type: "error", title: "載入失敗", message: extractError(error, "無法取得產品類型") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得產品類型列表

/** 新增編輯相關 **/
const dialogVisible = ref(false); //對話框顯示
const dialogMode = ref("create"); //對話框模式
const dialogTitle = computed(() => (dialogMode.value === "create" ? "新增產品類型" : "編輯產品類型")); //對話框標題
const editingId = ref(null); //目前編輯ID
const basicFormRef = ref(null); //表單ref
const basicForm = ref({ ...initializeForm }); //表單資料
const isSaving = ref(false); //儲存狀態
const basicFormRules = {
  code: [
    { required: true, message: "請輸入代碼", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback();
        const isValid = /^[A-Za-z0-9_]+$/.test(value);
        if (!isValid) {
          callback(new Error("代碼僅能包含英文、數字或底線"));
          return;
        }
        callback();
      },
      trigger: "blur"
    }
  ],
  name: [{ required: true, message: "請輸入名稱", trigger: "blur" }]
}; //表單驗證
const resetForm = () => {
  basicForm.value = { ...initializeForm };
  basicFormRef.value?.clearValidate?.();
}; //重置表單
watch(dialogVisible, (visible) => {
  if (!visible) {
    resetForm();
    dialogMode.value = "create";
    editingId.value = null;
  }
}); //對話框關閉處理
const openCreateDialog = () => {
  dialogMode.value = "create";
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增視窗
const fillFormFromRecord = (record = {}) => {
  basicForm.value = {
    ...initializeForm,
    code: record.code || "",
    name: record.name || "",
    description: record.description || "",
    isDeletable: record.isDeletable !== false
  };
}; //填入表單資料
const loadProductTypeDetail = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await ProductTypeGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(detail);
  } catch (error) {
    Notify({ type: "error", title: "讀取失敗", message: extractError(error, "無法取得類型資料") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得單筆資料
const openEditDialog = (row) => {
  if (!row?.id) return;
  dialogMode.value = "edit";
  editingId.value = row.id;
  fillFormFromRecord(row.raw || row);
  dialogVisible.value = true;
  loadProductTypeDetail(row.id);
}; //開啟編輯視窗
const buildPayload = () => {
  const formValue = basicForm.value;
  const payload = {
    code: formValue.code?.trim()?.toUpperCase(),
    name: formValue.name?.trim(),
    description: formValue.description?.trim() || undefined,
    isDeletable: Boolean(formValue.isDeletable)
  };
  if (!payload.code || !payload.name) return null;
  if (dialogMode.value === "edit") {
    delete payload.code;
  }
  return payload;
}; //整理送出資料
const validateForm = async () => {
  if (!basicFormRef.value) return true;
  try {
    await basicFormRef.value.validate();
    return true;
  } catch {
    return false;
  }
}; //執行表單驗證
const saveType = async () => {
  if (!(await validateForm())) return;
  const payload = buildPayload();
  if (!payload) return;
  isSaving.value = true;
  try {
    if (dialogMode.value === "edit" && editingId.value) {
      await ProductTypeUpdatePatch(editingId.value, payload);
      Notify({ type: "success", title: "類型已更新" });
    } else {
      await ProductTypeCreatePost(payload);
      Notify({ type: "success", title: "已新增類型" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "儲存失敗", message: extractError(error, "無法儲存類型資料") });
  } finally {
    isSaving.value = false;
  }
}; //儲存資料
const deleteType = async (row) => {
  if (!row?.id || !row.isDeletable) {
    Notify({ type: "warning", title: "提示", message: "此類型不可刪除" });
    return;
  }
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await ProductTypeDeleteById(row.id);
        Notify({ type: "success", title: "已刪除" });
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        Notify({ type: "error", title: "刪除失敗", message: extractError(error, "無法刪除此類型") });
      } finally {
        mainStore.setLoading(false);
      }
    }
  });
}; //刪除類型

onMounted(getAPI);
</script>
