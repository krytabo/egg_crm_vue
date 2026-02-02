<!-- src/pages/BasicInfo/Driver/DataList/DesktopView.vue 司機管理（桌面版） -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>{{ t('driverList', '司機列表') }}</CardTitle>
        <p class="text-sm text-gray-500">{{ t('totalCount', { total: pagination.total }, `共 ${pagination.total} 筆資料`) }}</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button status="danger" plain @click="clearFilter">{{ t('clearFilter', '清除篩選') }}</a-button>
        <!--<a-button type="primary" @click="openCreateDialog">新增司機</a-button>-->
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <CustomTinyGrid :data="basicDataList" :height="systemStore.tableHeight" :border="true" row-key="id" :row-id="'id'">
        <!--<CustomTinyGridColumn field="employeeId" :title="t('employeeId', '員工編號')" :width="140" fixed="left">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('employeeId', '員工編號') }}</span>
              <TinyInput
                v-model="searchFields.employeeId"
                :placeholder="t('enterEmployeeId', '輸入員工編號')"
                class="h-8 text-xs"
                clearable
                @keyup.enter="handleGlobalSearch"
                @clear="handleGlobalSearch"
              />
            </div>
          </template>
          <template #default="{ row }">
            <span class="font-medium text-gray-900">{{ row.employeeId }}</span>
          </template>
        </CustomTinyGridColumn>-->
        <CustomTinyGridColumn field="fullName" :title="t('fullName', '姓名')" min-width="160">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('fullName', '姓名') }}</span>
              <TinyInput v-model="searchFields.fullName" :placeholder="t('enterName', '輸入姓名')" class="h-8 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="font-medium text-gray-900">{{ row.fullName }}</span>
              <span class="text-xs text-gray-500">{{ row.phone || '—' }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="licenseNumber" :title="t('licenseNumber', '駕照號碼')" :width="160">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('licenseNumber', '駕照號碼') }}</span>
              <TinyInput
                v-model="searchFields.licenseNumber"
                :placeholder="t('enterLicenseNumber', '輸入駕照號碼')"
                class="h-8 text-xs"
                clearable
                @keyup.enter="handleGlobalSearch"
                @clear="handleGlobalSearch"
              />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.licenseNumber || '—' }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="licenseExpiry" :title="t('licenseExpiry', '駕照到期日')" :width="160">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span :class="getLicenseExpiryClass(row.licenseExpiry)">{{ formatDate(row.licenseExpiry) }}</span>
              <a-tag v-if="isLicenseExpiringSoon(row.licenseExpiry)" color="orange" size="small">{{ t('expiringSoon', '即將到期') }}</a-tag>
              <a-tag v-if="isLicenseExpired(row.licenseExpiry)" color="red" size="small">{{ t('expired', '已過期') }}</a-tag>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="phone" :title="t('phone', '聯絡電話')" :width="140">
          <template #default="{ row }">{{ row.phone || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="email" :title="t('email', '電子郵件')" min-width="200">
          <template #default="{ row }">{{ row.email || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="address" :title="t('address', '地址')" min-width="200">
          <template #default="{ row }">{{ row.address || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="hireDate" :title="t('hireDate', '入職日期')" :width="140">
          <template #default="{ row }">{{ formatDate(row.hireDate) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" :title="t('status', '狀態')" :width="130" align="center">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">{{ t('status', '狀態') }}</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" :placeholder="t('all', '全部')" class="h-8 text-xs" @change="handleFiltersChange" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="getStatusColor(row.status)" size="large">{{ getStatusLabel(row.status) }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" :title="t('createdAt', '建立時間')" :width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </CustomTinyGridColumn>
        <!--<CustomTinyGridColumn title="操作" :width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
            </div>
          </template>
        </CustomTinyGridColumn>-->
      </CustomTinyGrid>
      <AppPagination
        class="md:w-auto"
        :current="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-size-options="pageSizeOptions"
        @change="CurrentChange"
        @page-size-change="SizeChange"
      />
    </CardContent>
  </Card>

  <a-modal v-model:visible="dialogVisible" :title="isEdite ? t('editDriver', '編輯司機') : t('addDriver', '新增司機')" :top="30" draggable :maskClosable="false" :closable="false" width="700px">
    <perfect-scrollbar class="h-[calc(100vh-370px)]">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width layout="vertical">
        <div class="mb-3 text-sm font-semibold text-gray-700">{{ t('basicInfo', '基本資料') }}</div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('employeeId', '員工編號')" field="employeeId">
            <CustomField v-model="basicForm.employeeId" type="input" :placeholder="t('enterEmployeeId', '輸入員工編號')" allowClear />
          </AFormItem>
          <AFormItem :label="t('fullName', '姓名')" field="fullName">
            <CustomField v-model="basicForm.fullName" type="input" :placeholder="t('enterName', '輸入姓名')" allowClear :disabled="isEdite" />
          </AFormItem>
        </div>

        <div class="mb-3 text-sm font-semibold text-gray-700">{{ t('licenseInfo', '駕照與任職資訊') }}</div>
        <div class="grid gap-4 md:grid-cols-3">
          <AFormItem :label="t('licenseNumber', '駕照號碼')" field="licenseNumber">
            <CustomField v-model="basicForm.licenseNumber" type="input" :placeholder="t('enterLicenseNumber', '輸入駕照號碼')" allowClear />
          </AFormItem>
          <AFormItem :label="t('licenseExpiry', '駕照到期日')" field="licenseExpiry">
            <CustomField v-model="basicForm.licenseExpiry" type="date-picker" :placeholder="t('selectLicenseExpiry', '選擇駕照到期日')" />
          </AFormItem>
          <AFormItem :label="t('hireDate', '入職日期')" field="hireDate">
            <CustomField v-model="basicForm.hireDate" type="date-picker" :placeholder="t('selectHireDate', '選擇入職日期')" :disabled="isEdite" />
          </AFormItem>
        </div>

        <div class="mb-3 text-sm font-semibold text-gray-700">{{ t('contactInfo', '聯絡資訊') }}</div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('phone', '電話')">
            <CustomField v-model="basicForm.phone" type="input" :placeholder="t('enterPhone', '輸入電話')" allowClear :disabled="isEdite" />
          </AFormItem>
          <AFormItem :label="t('email', '電子郵件')">
            <CustomField v-model="basicForm.email" type="email" :placeholder="t('enterEmail', '輸入電子郵件')" allowClear :disabled="isEdite" />
          </AFormItem>
        </div>
        <AFormItem :label="t('address', '地址')">
          <CustomField v-model="basicForm.address" type="input" :placeholder="t('enterAddress', '輸入地址')" allowClear :disabled="isEdite" />
        </AFormItem>

        <AFormItem :label="t('notes', '備註')">
          <CustomField v-model="basicForm.notes" type="textarea" :rows="3" :placeholder="t('enterNotes', '輸入備註')" allowClear />
        </AFormItem>

        <AFormItem :label="t('status', '狀態')">
          <CustomField v-model="basicForm.status" type="select" :options="statusSelectOptions" />
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel', '取消') }}</a-button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">{{ isSaving ? t('saving', '儲存中...') : t('save', '儲存') }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted } from 'vue';
import { TinyInput, TinySelect } from '@opentiny/vue';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import CustomField from '@/components/Form/CustomField.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { useSystemStore } from '@/stores/system';
import { useContentWidth } from '@/composables/useContentWidth';
import { useI18n } from 'vue-i18n';
import { Form as AForm, FormItem as AFormItem } from '@arco-design/web-vue';
import { useDataList } from './useDataList';

const systemStore = useSystemStore();
const { containerRef } = useContentWidth();
const { t } = useI18n();

// 使用共用邏輯
const {
  // 狀態選項
  getStatusLabel,
  getStatusColor,
  statusFilterOptions,
  statusSelectOptions,
  // 駕照到期
  isLicenseExpired,
  isLicenseExpiringSoon,
  getLicenseExpiryClass,
  // 工具函式
  formatDate,
  // 篩選與查詢
  searchFields,
  handleGlobalSearch,
  handleFiltersChange,
  clearFilter,
  // 列表資料
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getAPI,
  CurrentChange,
  SizeChange,
  // 新增編輯
  dialogVisible,
  basicFormRef,
  isSaving,
  isEdite,
  basicForm,
  basicFormRules,
  closeDialog,
  saveData,
} = useDataList(t);

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(320);
});
</script>
