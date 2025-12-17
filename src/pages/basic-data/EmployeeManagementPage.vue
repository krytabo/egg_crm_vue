<!-- src/pages/EmployeeManagementPage.vue 員工資料 -->
<template>
  <Card>
    <CardHeader>
      <div class="flex flex-1 flex-col">
        <div class="icon-egg"></div>
        <CardTitle>員工資料列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ pagination.total }} 筆資料</p>
      </div>
      <Button type="danger" plain @click="clearFilter">新增員工</Button>
      <Button @click="openCreateDialog">新增員工</Button>
    </CardHeader>
    <CardContent>
      <CustomTinyGrid :data="basicDataList" :height="620" :border="true" :row-id="'id'">
        <CustomTinyGridColumn field="name" title="姓名" fixed="left" :width="240" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">姓名</span>
              <div class="flex items-center gap-1">
                <TinyInput v-model="searchFields.name" placeholder="請輸入" class="h-8 flex-1 text-xs" clearable @keyup.enter="handleGlobalSearch('name')" @clear="handleGlobalSearch('name')" />
              </div>
            </div>
          </template>
          <template #default="data">
            <div class="text-[16px]">{{ data.row.name }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="idNumber" title="身分證號" :width="160">
          <template #default="data">
            <div class="text-[16px]">{{ data.row.idNumber }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="position" title="職務" :width="180">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">職務</span>
              <TinySelect v-model="filters.position" :options="positionFilterOptions" placeholder="全部" class="h-8 text-xs" @update:model-value="handleFiltersChange" />
            </div>
          </template>
          <template #default="data">
            <div class="text-[16px]">{{ data.row.position }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="phone" title="手機號碼" :width="160">
          <template #default="data">
            <div class="text-[16px]">{{ data.row.phone }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="email" title="電子信箱" min-width="220" sortable :sort-field="'email'" :current-order="getColumnOrder('email')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">電子信箱</span>
              <div class="flex items-center gap-1">
                <TinyInput v-model="searchFields.email" placeholder="請輸入" class="h-8 flex-1 text-xs" clearable @keyup.enter="handleGlobalSearch('email')" @clear="handleGlobalSearch('email')" />
              </div>
            </div>
          </template>
          <template #default="data">
            <div class="text-[16px]">{{ data.row.email }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="joinDate" title="入職日" :width="160" sortable :sort-field="'joinDate'" :current-order="getColumnOrder('joinDate')" @sort="handleColumnSort">
          <template #default="data">
            <div class="text-[16px]">{{ data.row.joinDate }}</div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" :width="150" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">狀態</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" placeholder="全部" class="h-8 text-xs" @update:model-value="handleFiltersChange" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="row.status === '啟用' ? 'arcoblue' : 'red'" size="large">{{ row.status }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <Button variant="ghost" @click="openEditDialog(row)">編輯</Button>
              <Button variant="ghost" @click="deleteData(row.id)">刪除</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
    </CardContent>
  </Card>

  <DialogTiny v-model:visible="dialogVisible" :title="editingId ? '編輯員工' : '新增員工'" resize width="520px">
    <TinyForm ref="basicFormRef" label-width="100px" label-position="top" :model="basicData" :rules="basicDataRules">
      <div class="grid grid-cols-2 gap-2">
        <TinyFormItem label="姓氏" prop="firstName">
          <TinyInput v-model="basicData.firstName" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="名字" prop="lastName">
          <TinyInput v-model="basicData.lastName" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="職務" prop="position">
          <TinySelect v-model="basicData.position" placeholder="請選擇" :options="roleOptions" />
        </TinyFormItem>
        <TinyFormItem label="手機號碼">
          <TinyInput v-model="basicData.phone" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="身分證字號">
          <TinyInput v-model="basicData.idNumber" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="生日">
          <TinyDatePicker v-model="basicData.birthDate" type="date" placeholder="請選擇" />
        </TinyFormItem>
        <TinyFormItem label="電子信箱" class="col-span-2" prop="email">
          <TinyInput v-model="basicData.email" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="地址" class="col-span-2">
          <TinyInput v-model="basicData.address" placeholder="請輸入" />
        </TinyFormItem>
        <TinyFormItem label="入職日期">
          <TinyDatePicker v-model="basicData.joinDate" type="date" placeholder="請選擇" />
        </TinyFormItem>
        <TinyFormItem label="登入密碼" prop="password">
          <TinyInput v-model="basicData.password" type="password" :placeholder="editingId ? '重設密碼 (留空則不變)' : '請輸入'" show-password />
        </TinyFormItem>
        <TinyFormItem v-if="editingId" label="狀態">
          <TinySelect v-model="basicData.status" placeholder="請選擇" :options="statusSelectOptions" />
        </TinyFormItem>
      </div>
    </TinyForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">取消</Button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? "儲存中..." : "儲存" }}</Button>
      </div>
    </template>
  </DialogTiny>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { UserListGet, UserCreatePost, UserUpdatePatch, UserDeleteById, UserGetByID } from "@/assets/API/User";
import { TinyForm, TinyFormItem, TinyInput, TinyDatePicker, TinySelect } from "@opentiny/vue";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DialogTiny from "@/components/ui/DialogTiny.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import { useMainStore } from "@/stores/LoadingStore";
import Notify from "@opentiny/vue-notify";

const mainStore = useMainStore();

/** 選單相關 **/
const initialRoleOptions = [
  { label: "管理員", value: "admin" },
  { label: "一般員工", value: "user" }
]; //預設角色選項
const roleOptions = ref([...initialRoleOptions]); //角色選項
const statusOptions = [
  { label: "啟用", value: "啟用" },
  { label: "停用", value: "停用" }
]; //狀態選項
const getRoleLabel = (roleCode) => roleOptions.value.find((option) => option.value === roleCode)?.label || roleCode || "—"; //取得角色顯示文字
const registerRoleOption = (roleCode, displayName) => {
  if (!roleCode) return;
  if (roleOptions.value.some((option) => option.value === roleCode)) return;
  roleOptions.value.push({ label: displayName || roleCode, value: roleCode });
}; //註冊 API 回傳的角色
const defaultRoleValue = roleOptions.value[1]?.value || roleOptions.value[0]?.value || "user"; //預設角色值
const positionFilterOptions = computed(() => [{ label: "全部", value: "all" }, ...roleOptions.value]); //職務篩選選項
const statusFilterOptions = [{ label: "全部", value: "all" }, ...statusOptions]; //狀態篩選選項
const statusSelectOptions = statusOptions; //狀態選擇選項

/** 分頁相關 **/
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});
const pageSizeOptions = [10, 20, 50, 100, 200]; //可選分頁筆數
const totalPages = computed(() => pagination.value.totalPages || 1); //取得總數
const CurrentChange = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  if (safePage === pagination.value.page) return;
  pagination.value.page = safePage;
  getAPI();
}; //切換分頁
const SizeChange = (val) => {
  pagination.value.limit = Number(val) || 10;
  pagination.value.page = 1;
  getAPI();
}; //切換分頁筆數

/** 共用工具 **/
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}; //日期格式化
const getDisplayName = (user) => {
  const { firstName, lastName, username, email, name } = user || {};
  const fullName = [firstName, lastName].filter(Boolean).join("").trim();
  return name || fullName || username || email || "—";
}; //取得顯示名稱
const normalizeRoleCode = (role) => (typeof role === "string" ? role.toLowerCase() : ""); //統一角色代碼
const mapUserToRow = (user = {}) => {
  const joinDate = user.joinDate || user.createdAt;
  const rawRoleName = user.roles?.[0]?.name || user.role || user.roleName || "";
  const roleName = normalizeRoleCode(rawRoleName) || defaultRoleValue;
  registerRoleOption(roleName, rawRoleName || roleName);
  const statusText = user.status === "INACTIVE" || user.isActive === false ? "停用" : "啟用";
  return {
    id: user.id || user.userId || user._id,
    name: getDisplayName(user),
    idNumber: user.idNumber ?? user.nationalId ?? "—",
    birthDate: user.birthDate ? formatDate(user.birthDate) : "—",
    position: getRoleLabel(roleName),
    roleName: roleName,
    phone: user.phone ?? "—",
    email: user.email ?? "—",
    address: user.address ?? "—",
    joinDate: joinDate ? formatDate(joinDate) : "—",
    status: statusText,
    isActive: statusText === "啟用",
    raw: user
  };
}; //轉換列表列資料
const normalizeListResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const apiData = responseData?.data ?? responseData ?? {};
  const items = apiData?.data ?? [];
  const meta = apiData?.meta ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta
  };
}; //統一處理 API 回傳

/** 資料取得相關 **/
const isSaving = ref(false); //儲存中
const basicDataList = ref([]); //表格資料
const filters = reactive({
  position: "all", //職務
  status: "all" //啟用狀態
}); //篩選條件
const sortField = ref(""); //目前排序欄位
const sortDirection = ref("asc"); //排序方向
const sortFieldMap = {
  name: "firstName", //姓名
  email: "email", //電子信箱
  joinDate: "createdAt"
};
const searchFields = reactive({
  name: "",
  email: ""
}); //獨立搜尋欄位
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ""); //取得欄位排序顯示
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = "";
    sortDirection.value = "asc";
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getAPI();
}; //自訂排序處理
const extractError = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const resolveSearchTerm = () => {
  const email = searchFields.email.trim();
  const name = searchFields.name.trim();
  return email || name || "";
}; //決定搜尋字串
const searchPayload = () => {
  const params = {
    page: pagination.value.page,
    limit: pagination.value.limit
  };
  const searchCandidate = resolveSearchTerm();
  if (searchCandidate) params.search = searchCandidate;
  if (filters.status !== "all") params.isActive = filters.status === "啟用";
  if (filters.position !== "all") params.role = filters.position;
  if (sortField.value) {
    const apiSortField = sortFieldMap[sortField.value];
    if (apiSortField) {
      params.sortField = apiSortField;
      params.sortOrder = sortDirection.value;
    }
  }
  return params;
}; //整理查詢條件
const handleGlobalSearch = async () => {
  pagination.value.page = 1;
  await getAPI();
}; //關鍵字搜尋
const handleFiltersChange = async () => {
  pagination.value.page = 1;
  await getAPI();
}; //篩選變動處理
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await UserListGet(searchPayload());
    console.log(1, response);
    const { items, meta } = normalizeListResponse(response);
    console.log(2, items);
    console.log(3, meta);

    basicDataList.value = items.map(mapUserToRow);
    pagination.value.total = meta.total ?? 0;
    pagination.value.totalPages = meta.totalPages ?? 1;
  } catch (error) {
    basicDataList.value = [];
    await mainStore.SWAL_Error(error);
    // Notify({ type: "error", title: "載入失敗", message: extractError(error, "無法取得員工資料") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得員工列表
const resetForm = () => {
  basicData.value = { ...basicForm };
  basicFormRef.value?.clearValidate?.();
}; //初始化表單
const getDataInfo = (user) => {
  const roleName = normalizeRoleCode(user.roles?.[0]?.name || user.role || user.roleName || "");
  registerRoleOption(roleName || defaultRoleValue, user.roles?.[0]?.name || user.role || roleName);
  basicData.value = {
    ...basicForm,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    position: roleName || defaultRoleValue,
    phone: user.phone || "",
    email: user.email || "",
    idNumber: user.idNumber || "",
    birthDate: user.birthDate ? formatDate(user.birthDate) : "",
    address: user.address || "",
    joinDate: user.createdAt ? formatDate(user.createdAt) : "",
    status: user.isActive !== false && user.status !== "INACTIVE" ? "啟用" : "停用"
  };
}; //表單填值
const getData = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    const response = await UserGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) getDataInfo(detail);
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "讀取失敗", message: extractError(error, "無法取得員工資料") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得單筆資料
const clearFilter = () => {
  searchFields.name = "";
  searchFields.email = "";
  Object.assign(filters, { position: "all", status: "all" });
  handleGlobalSearch();
}; //清除搜尋與篩選

/** 新增編輯相關 **/
const basicFormRef = ref(null);
const editingId = ref(null); //目前編輯的 ID
const dialogVisible = ref(false); //彈窗開關
watch(dialogVisible, (visible) => {
  if (!visible) {
    basicFormRef.value?.clearValidate?.();
    basicData.value.password = "";
  }
}); //彈窗關閉時重置驗證
const basicForm = {
  firstName: "", //姓氏
  lastName: "", //名字
  position: defaultRoleValue, //職位
  phone: "", //手機電話
  email: "", //電子信箱
  idNumber: "", //身分證號碼
  birthDate: "", //生日
  address: "", //地址
  joinDate: "", //入職日期
  password: "", //密碼
  isActive: true, //啟用狀態
  status: "啟用" //啟用狀態
}; //基本表單
const basicData = ref({ ...basicForm }); //表單資料
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Email 格式
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; //密碼規則
const basicDataRules = computed(() => {
  const requirePassword = !editingId.value;
  return {
    firstName: [{ required: true, message: "請輸入姓氏", trigger: "blur" }],
    lastName: [{ required: true, message: "請輸入名字", trigger: "blur" }],
    email: [
      { required: true, message: "請輸入電子信箱", trigger: ["blur", "change"] },
      {
        validator: (rule, value, callback) => {
          if (!value || emailPattern.test(value)) {
            callback();
          } else {
            callback(new Error("電子信箱格式不正確"));
          }
        },
        trigger: ["blur", "change"]
      }
    ],
    position: [{ required: true, message: "請選擇職務", trigger: "change" }],
    password: [
      {
        validator: (rule, value, callback) => {
          if (!requirePassword && !value) {
            callback();
            return;
          }
          if (!value) {
            callback(new Error("請設定登入密碼"));
            return;
          }
          if (!passwordPattern.test(value)) {
            callback(new Error("密碼需含大小寫字母與數字且至少8碼"));
            return;
          }
          callback();
        },
        trigger: "blur"
      }
    ]
  };
}); //驗證表單
const openCreateDialog = () => {
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增視窗
const openEditDialog = (employee) => {
  if (!employee?.id) return;
  editingId.value = employee.id;
  getDataInfo(employee.raw || employee);
  dialogVisible.value = true;
  getData(employee.id);
}; //開啟編輯視窗
const buildUsername = (email, firstName, lastName) => {
  if (email && email.includes("@")) return email.split("@")[0];
  const combined = `${firstName}${lastName}`.trim();
  return combined || `user_${Date.now()}`;
}; //產生帳號
const preparePayload = (includeStatus) => {
  const formState = basicData.value;
  const firstName = (formState.firstName || "").trim();
  const lastName = (formState.lastName || "").trim();
  const email = (formState.email || "").trim();
  const payload = {
    email: email || undefined,
    username: buildUsername(email, firstName, lastName),
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone: formState.phone?.trim() || undefined,
    roleNames: formState.position ? [formState.position] : undefined
  };
  if (formState.password) payload.password = formState.password;
  if (includeStatus) payload.isActive = formState.status !== "停用";
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
const saveData = async () => {
  if (!(await validateForm())) return;
  const isUpdate = Boolean(editingId.value);
  const payload = preparePayload(isUpdate);
  isSaving.value = true;
  try {
    if (isUpdate) {
      await UserUpdatePatch(editingId.value, payload);
      Notify({ type: "success", title: "員工資料已更新" });
    } else {
      await UserCreatePost(payload);
      Notify({ type: "success", title: "已新增員工" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "儲存失敗", message: extractError(error, "無法儲存員工資料") });
  } finally {
    isSaving.value = false;
  }
}; //編輯儲存
const deleteData = async (id) => {
  if (!id) return;
  try {
    await UserDeleteById(id);
    Notify({ type: "success", title: "員工已刪除" });
    if (basicDataList.value.length === 1 && pagination.value.page > 1) pagination.value.page -= 1;
    await getAPI();
  } catch (error) {
    Notify({ type: "error", title: "刪除失敗", message: extractError(error, "無法刪除該員工") });
  }
}; //刪除單筆

onMounted(getAPI);
</script>

<style scoped>
.tiny-form-item {
  margin-bottom: 4px !important;
}
</style>
