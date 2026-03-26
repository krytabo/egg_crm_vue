<!-- src/pages/CTI/DataList/DesktopView.vue 通話記錄（桌面版） -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-col gap-1">
        <CardTitle>{{ t('callLog', '通話記錄') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }, `共 ${pagination.total} 筆資料`) }}</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button status="danger" plain @click="clearFilter">{{ t('clearFilter', '清除篩選') }}</a-button>
        <a-button type="primary" @click="openCreateDialog()">{{ t('addCallLog', '手動新增記錄') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          篩選            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="4">
      <CustomFormItem :label="t('callDate', '通話日期')">
        <TinyDatePicker v-model="filters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" clearable @change="handleFiltersChange" class="w-full" />
        <span class="shrink-0">-</span>
        <TinyDatePicker v-model="filters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" clearable @change="handleFiltersChange" class="w-full" />
      </CustomFormItem>
      <CustomFormItem :label="t('direction', '方向')">
        <TinySelect v-model="filters.direction" :options="directionOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
      </CustomFormItem>
      <CustomFormItem :label="t('status', '狀態')">
        <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
      </CustomFormItem>
      <CustomFormItem :label="t('customer', '客戶')">
        <InfiniteSelect v-model="filters.customerId" dataSource="customers" :placeholder="t('all', '全部')" type="outline" allowClear @change="handleFiltersChange" :filters="{ status: 'ACTIVE' }" />
      </CustomFormItem>
    </CustomForm>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
      <!-- 電話號碼 -->
      <CustomTinyGridColumn field="callerNumber" :title="t('phoneNumber', '電話號碼')" width="160" fixed="left">
        <template #default="{ row }">
          <span class="font-medium">{{ formatPhone(row.callerNumber) }}</span>
        </template>
      </CustomTinyGridColumn>

      <!-- 客戶名稱 -->
      <CustomTinyGridColumn field="customer" :title="t('customer', '客戶')" min-width="180">
        <template #default="{ row }">
          <a-link v-if="row.customer?.name" @click="goToCustomer(row.customer)">
            {{ row.customer.name }}
          </a-link>
          <span v-else class="text-gray-400">{{ t('unknown', '未知') }}</span>
        </template>
      </CustomTinyGridColumn>

      <!-- 通話方向 -->
      <CustomTinyGridColumn field="direction" :title="t('direction', '方向')" width="100">
        <template #default="{ row }">
          <TinyBadge :type="row.direction === 'INBOUND' ? 'info' : 'warning'">
            {{ directionDisplayMap[row.direction] || row.direction }}
          </TinyBadge>
        </template>
      </CustomTinyGridColumn>

      <!-- 通話狀態 -->
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="110">
        <template #default="{ row }">
          <TinyBadge :type="callStatusTypeMap[row.status] || 'info'">
            {{ callStatusDisplayMap[row.status] || row.status }}
          </TinyBadge>
        </template>
      </CustomTinyGridColumn>

      <!-- 來電時間 -->
      <CustomTinyGridColumn field="startTime" :title="t('callTime', '來電時間')" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.startTime) }}
        </template>
      </CustomTinyGridColumn>

      <!-- 通話時長 -->
      <CustomTinyGridColumn field="duration" :title="t('duration', '時長')" width="100">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </CustomTinyGridColumn>

      <!-- 通話結果 -->
      <CustomTinyGridColumn field="callOutcome" :title="t('callOutcome', '通話結果')" width="120">
        <template #default="{ row }">
          {{ outcomeDisplayMap[row.callOutcome] || '—' }}
        </template>
      </CustomTinyGridColumn>

      <!-- 備註 -->
      <CustomTinyGridColumn field="notes" :title="t('notes', '備註')" min-width="160">
        <template #default="{ row }">
          <span class="text-gray-600">{{ row.notes || '—' }}</span>
        </template>
      </CustomTinyGridColumn>

      <!-- 操作 -->
      <CustomTinyGridColumn :title="t('actions', '操作')" width="80" fixed="right">
        <template #default="{ row }">
          <a-link @click="openEditDialog(row)">{{ t('edit', '編輯') }}</a-link>
        </template>
      </CustomTinyGridColumn>
    </CustomTinyGrid>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          分頁            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <AppPagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" @change="getAPI" />
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--     新增 / 編輯 對話框       -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="dialogVisible" :title="editingId ? t('editCallLog', '編輯通話記錄') : t('addCallLog', '手動新增記錄')" width="520px">
    <a-form :model="basicForm" layout="vertical" auto-label-width>
      <a-form-item :label="t('phoneNumber', '電話號碼')" required>
        <a-input v-model="basicForm.callerNumber" :placeholder="t('enterPhone', '輸入電話號碼')" />
      </a-form-item>
      <a-form-item :label="t('direction', '通話方向')">
        <TinySelect v-model="basicForm.direction" :options="directionOptions" />
      </a-form-item>
      <a-form-item :label="t('customer', '客戶')">
        <InfiniteSelect v-model="basicForm.customerId" dataSource="customers" :placeholder="t('selectCustomer', '選擇關聯客戶（選填）')" type="outline" allowClear :filters="{ status: 'ACTIVE' }" />
      </a-form-item>
      <a-form-item :label="t('callOutcome', '通話結果')">
        <TinySelect v-model="basicForm.callOutcome" :options="outcomeOptions" :placeholder="t('selectOutcome', '選擇通話結果（選填）')" clearable />
      </a-form-item>
      <a-form-item :label="t('notes', '備註')">
        <a-textarea v-model="basicForm.notes" :placeholder="t('enterNotes', '輸入通話備註（選填）')" :max-length="500" allow-clear :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-item>
    </a-form>

    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="closeDialog">{{ t('cancel') }}</a-button>
        <a-button type="primary" @click="saveData">{{ t('save') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TinySelect, TinyBadge, TinyDatePicker } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useI18n } from 'vue-i18n';
import { useWindowSize } from '@vueuse/core';
import { useContentWidth } from '@/composables/useContentWidth';
import { CtiCallsGet, CtiCallCreatePost, CtiCallUpdatePatch } from '@/assets/API/CTI';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
const { containerRef } = useContentWidth();
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 320, 100));

// ===== 資料狀態 =====
const basicDataList = ref([]);
const pagination = ref({ page: 1, pageSize: 20, total: 0 });
const filters = ref({ startDate: null, endDate: null, direction: null, status: null, customerId: null });

// ===== 對話框 =====
const dialogVisible = ref(false);
const editingId = ref(null);
const basicForm = ref({ callerNumber: '', direction: 'INBOUND', customerId: null, callOutcome: null, notes: '' });

// ===== 選項 =====
const directionOptions = computed(() => [
  { value: 'INBOUND', label: t('inbound', '來電') },
  { value: 'OUTBOUND', label: t('outbound', '外撥') },
]);

const statusOptions = computed(() => [
  { value: 'RINGING', label: t('callStatusRinging', '響鈴中') },
  { value: 'CONNECTED', label: t('callStatusConnected', '通話中') },
  { value: 'ENDED', label: t('callStatusEnded', '已結束') },
  { value: 'MISSED', label: t('callStatusMissed', '未接') },
]);

const outcomeOptions = computed(() => [
  { value: 'order', label: t('outcomeOrder', '訂單') },
  { value: 'inquiry', label: t('outcomeInquiry', '詢問') },
  { value: 'complaint', label: t('outcomeComplaint', '投訴') },
  { value: 'no_answer', label: t('outcomeNoAnswer', '未接通') },
]);

// ===== 顯示對應 Map =====
const directionDisplayMap = computed(() => Object.fromEntries(directionOptions.value.map((o) => [o.value, o.label])));
const callStatusDisplayMap = computed(() => Object.fromEntries(statusOptions.value.map((o) => [o.value, o.label])));
const outcomeDisplayMap = computed(() => Object.fromEntries(outcomeOptions.value.map((o) => [o.value, o.label])));
const callStatusTypeMap = {
  RINGING: 'info',
  CONNECTED: 'success',
  ENDED: 'default',
  MISSED: 'danger',
};

// ===== 格式化函式 =====
const formatPhone = (phone) => {
  if (!phone) return '—';
  if (/^09\d{8}$/.test(phone)) return `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;
  return phone;
};

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

// ===== API =====
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      ...(filters.value.startDate && { startDate: filters.value.startDate }),
      ...(filters.value.endDate && { endDate: filters.value.endDate }),
      ...(filters.value.direction && { direction: filters.value.direction }),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.customerId && { customerId: filters.value.customerId }),
    };
    const res = await CtiCallsGet(params);
    const payload = res.data?.data ?? res.data;
    basicDataList.value = payload?.data ?? payload ?? [];
    pagination.value.total = payload?.total ?? 0;
  } catch (e) {
    console.error('[CTI] 取得通話記錄失敗', e);
  } finally {
    mainStore.setLoading(false);
  }
};

const handleFiltersChange = () => {
  pagination.value.page = 1;
  getAPI();
};

const clearFilter = () => {
  filters.value = { startDate: null, endDate: null, direction: null, status: null, customerId: null };
  pagination.value.page = 1;
  getAPI();
};

// ===== 對話框操作 =====
const openCreateDialog = (prePhone = '') => {
  editingId.value = null;
  basicForm.value = { callerNumber: prePhone, direction: 'INBOUND', customerId: null, callOutcome: null, notes: '' };
  dialogVisible.value = true;
};

const openEditDialog = (row) => {
  editingId.value = row.id;
  basicForm.value = {
    callerNumber: row.callerNumber || '',
    direction: row.direction || 'INBOUND',
    customerId: row.customerId || null,
    callOutcome: row.callOutcome || null,
    notes: row.notes || '',
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  editingId.value = null;
};

const saveData = async () => {
  mainStore.setLoading(true);
  try {
    if (editingId.value) {
      await CtiCallUpdatePatch(editingId.value, {
        customerId: basicForm.value.customerId || undefined,
        callOutcome: basicForm.value.callOutcome || undefined,
        notes: basicForm.value.notes || undefined,
      });
    } else {
      await CtiCallCreatePost({
        callId: `manual-${Date.now()}`,
        direction: basicForm.value.direction,
        callerNumber: basicForm.value.callerNumber,
        calledNumber: '',
        status: 'ENDED',
        startTime: new Date().toISOString(),
        customerId: basicForm.value.customerId || undefined,
        callOutcome: basicForm.value.callOutcome || undefined,
        notes: basicForm.value.notes || undefined,
      });
    }
    closeDialog();
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
};

// ===== 快速跳至客戶頁 =====
const goToCustomer = (customer) => {
  if (customer?.name) {
    router.push({ name: 'basic-info-customers', query: { autoSearch: customer.name } });
  }
};

// ===== 掛載 =====
onMounted(() => {
  // 從通知跳轉時，若帶有 addCall=1 及 phone，自動開啟新增對話框
  if (route.query.addCall === '1') {
    openCreateDialog(route.query.phone || '');
  }
  getAPI();
});
</script>
