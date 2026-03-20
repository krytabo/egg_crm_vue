<!-- src/pages/Finance/components/InvoicesTab.vue 請款單管理 -->
<template>
  <div class="flex flex-col gap-4">
    <!-- 篩選區塊 -->
    <CustomForm :col="2">
      <CustomFormItem :label="t('billingRequestDate', '請款單日期')">
        <div class="flex items-center gap-2">
          <TinyDatePicker v-model="filters.startDate" :placeholder="t('startDate', '開始日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
          <span>-</span>
          <TinyDatePicker v-model="filters.endDate" :placeholder="t('endDate', '結束日期')" value-format="yyyy-MM-dd" @change="handleFiltersChange" />
        </div>
      </CustomFormItem>
      <CustomFormItem :label="t('status', '狀態')">
        <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable class="w-32" @change="handleFiltersChange" />
      </CustomFormItem>
      <CustomFormItem :label="t('customer', '客戶')">
        <InfiniteSelect
          v-model="filters.customerId"
          dataSource="customers"
          type="outline"
          :placeholder="t('all', '全部')"
          allowClear
          class="w-48"
          @change="handleFiltersChange"
          :filters="{ status: 'active' }"
        />
      </CustomFormItem>
      <CustomFormItem :label="t('search', '關鍵字')">
        <TinyInput v-model="filters.search" :placeholder="t('searchBillingRequest', '請款單號碼/客戶')" @keyup.enter="handleFiltersChange" />
      </CustomFormItem>
    </CustomForm>

    <!-- 請款單列表 -->
    <!--<JsonViewer :value="basicDataList" boxed copyable />-->
    <CustomTinyGrid :data="basicDataList" :height="TableScrollY" :border="true" row-key="id">
      <CustomTinyGridColumn field="id" :title="t('billingRequestNumber', '請款單號碼')" width="200" fixed="left">
        <template #default="{ row }">
          <a-link @click="openDetailDrawer(row)">{{ row.invoiceNumber }}</a-link>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="customer" :title="t('customer', '客戶')" min-width="180">
        <template #default="{ row }">{{ row.customer?.name }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" width="100">
        <template #default="{ row }">
          <TinyBadge :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</TinyBadge>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" width="130" align="right">
        <template #default="{ row }">NT$ {{ formatNumber(row.totalAmount) }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="paidAmount" :title="t('paidAmount', '已付金額')" width="130" align="right">
        <template #default="{ row }">
          <span :class="row.paidAmount > 0 ? 'text-green-600' : ''">NT$ {{ formatNumber(row.paidAmount) }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="remainingAmount" :title="t('remainingAmount', '未付金額')" width="130" align="right">
        <template #default="{ row }">
          <span :class="row.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'">{{ formatCurrencyNumber(row.remainingAmount) }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="dueDate" :title="t('dueDate', '到期日')" width="200" />
      <CustomTinyGridColumn
        field="createdAt"
        :title="t('createdAt', '建立時間')"
        width="160"
        sortable
        :sort-field="'createdAt'"
        :current-order="getColumnOrder('createdAt')"
        @sort="handleColumnSort"
      />
      <CustomTinyGridColumn field="actions" :title="t('actions', '操作')" width="170" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-2">
            <!--<a-button :disabled="row.status !== 'DRAFT'" type="text" class="px-1!" @click="handleSendInvoice(row)">{{ t('send', '發送') }}</a-button>-->
            <a-button :disabled="!['DRAFT', 'PARTIAL', 'OVERDUE'].includes(row.status)" type="text" status="success" class="px-1!" @click="handleOpenPayment(row)">{{ t('pay', '付款') }}</a-button>
            <a-button :disabled="row.status !== 'DRAFT'" type="text" status="danger" class="px-1!" @click="handleDeleteInvoice(row)">{{ t('delete', '刪除') }}</a-button>
            <a-button v-if="row.status !== 'PAID'" :disabled="row.status !== 'DRAFT'" type="text" class="px-1!" @click="openEditDialog(row)">{{ t('edit', '編輯') }}</a-button>
            <a-button v-if="row.status === 'PAID'" type="text" status="success" class="px-1!" @click="openDetailDrawer(row)">{{ t('view', '檢視') }}</a-button>
          </div>
        </template>
      </CustomTinyGridColumn>
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
  </div>

  <!-- 新增/編輯請款單彈窗 -->
  <a-modal v-model:visible="dialogVisible" width="800px" :mask-closable="false" :closable="false" :fullscreen="fullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ isEditing ? t('editBillingRequest', '編輯請款單') : t('createBillingRequest', '新增請款單') }}</div>
        <button v-if="!fullscreen" class="-ml-8!" @click="fullscreen = true"><Expand /></button>
        <button v-if="fullscreen" class="-ml-8!" @click="fullscreen = false"><Shrink /></button>
      </div>
    </template>
    <perfect-scrollbar :class="['pr-4', fullscreen ? 'h-[calc(100vh-165px)]' : 'h-[calc(100vh-270px)]']">
      <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <!-- 新增模式選擇（僅新增時顯示） -->
        <div v-if="!isEditing" class="mb-4">
          <a-radio-group v-model="createMode" type="button">
            <a-radio value="manual">{{ t('manualCreate', '手動新增') }}</a-radio>
            <a-radio value="fromOrder">{{ t('importFromOrder', '從訂單匯入') }}</a-radio>
          </a-radio-group>
        </div>

        <!-- 從訂單匯入模式 -->
        <div v-if="!isEditing && createMode === 'fromOrder'" class="mb-4 rounded-lg border bg-gray-50 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ t('selectCompletedOrder', '選擇已完成的訂單') }}</span>
            <a-button type="primary" size="small" @click="handleOpenOrderSearch">
              <i class="ri-search-line mr-1" />
              {{ t('searchOrder', '搜尋訂單') }}
            </a-button>
          </div>
          <!-- 已選擇的訂單資訊 -->
          <div v-if="selectedOrder" class="mt-3 rounded border bg-white p-3">
            <div class="flex items-start justify-between">
              <div class="flex flex-col gap-1 text-sm">
                <p>
                  <span class="text-gray-500">{{ t('orderNumber', '訂單編號') }}：</span>{{ selectedOrder.orderNumber }}
                </p>
                <p>
                  <span class="text-gray-500">{{ t('customer', '客戶') }}：</span>{{ selectedOrder.targetName }}
                </p>
                <p>
                  <span class="text-gray-500">{{ t('orderDate', '訂單日期') }}：</span>{{ selectedOrder.orderDate }}
                </p>
                <p>
                  <span class="text-gray-500">{{ t('totalAmount', '總金額') }}：</span>NT$ {{ formatNumber(selectedOrder.totalAmount) }}
                </p>
              </div>
              <a-button type="text" size="small" status="danger" @click="handleClearSelectedOrder">
                <i class="ri-close-line text-lg" />
              </a-button>
            </div>
          </div>
          <p v-else class="mt-3 text-center text-sm text-gray-400">{{ t('noOrderSelected', '尚未選擇訂單') }}</p>
        </div>

        <AFormItem v-if="createMode === 'manual'" :label="t('customer', '客戶')" field="customerId" class="col-span-2">
          <InfiniteSelect
            v-model="basicForm.customerId"
            dataSource="customers"
            :placeholder="t('pleaseSelect', '請選擇')"
            :disabled="isEditing || (createMode === 'fromOrder' && selectedOrder)"
            :filters="{ status: 'active' }"
          />
        </AFormItem>
        <AFormItem :label="t('billingRequestItems', '請款單項目')" field="">
          <template #label>
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium">{{ t('billingRequestItems', '請款單項目') }}</span>
              <a-button v-if="createMode === 'manual'" type="text" @click="addInvoiceItem">
                <i class="ri-add-line mr-1"></i>
                {{ t('addItem', '新增項目') }}
              </a-button>
            </div>
          </template>
          <div v-for="(item, index) in basicForm.items" :key="index" class="mb-2 flex items-end gap-2 rounded border border-gray-200 p-3">
            <AFormItem :label="t('product', '商品')" :field="`items.${index}.productId`" class="mb-0 flex-1">
              <InfiniteSelect
                v-model="item.productId"
                dataSource="products"
                :filters="{ status: 'ACTIVE' }"
                :placeholder="t('pleaseSelect', '請選擇')"
                @change="(val) => handleProductChange(index, val)"
              />
            </AFormItem>
            <AFormItem :label="t('quantity', '數量')" :field="`items.${index}.quantity`" class="mb-0 w-24">
              <CustomField v-model="item.quantity" type="number" :min="1" />
            </AFormItem>
            <AFormItem :label="t('unitPrice', '單價')" :field="`items.${index}.unitPrice`" class="mb-0 w-32">
              <CustomField v-model="item.unitPrice" type="number" :min="0" />
            </AFormItem>
            <AFormItem :label="t('subtotal', '小計')" class="mb-0 w-32">
              <div class="flex h-8 items-center font-medium text-blue-600">NT$ {{ formatNumber(item.quantity * item.unitPrice) }}</div>
            </AFormItem>
            <a-button type="text" status="danger" class="mb-0" @click="removeInvoiceItem(index)">
              <i class="ri-delete-bin-line"></i>
            </a-button>
          </div>
        </AFormItem>
        <!--<div class="mt-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-medium">{{ t('billingRequestItems', '請款單項目') }}</span>
            <a-button v-if="createMode === 'manual'" type="text" @click="addInvoiceItem">
              <i class="ri-add-line mr-1"></i>
              {{ t('addItem', '新增項目') }}
            </a-button>
          </div>
          <div v-for="(item, index) in basicForm.items" :key="index" class="mb-2 flex items-end gap-2 rounded border border-gray-200 p-3">
            <AFormItem :label="t('product', '商品')" :field="`items.${index}.productId`" class="mb-0 flex-1">
              <InfiniteSelect v-model="item.productId" dataSource="products" :filters="{ status: 'ACTIVE' }" :placeholder="t('pleaseSelect', '請選擇')" @change="(val) => handleProductChange(index, val)" />
            </AFormItem>
            <AFormItem :label="t('quantity', '數量')" :field="`items.${index}.quantity`" class="mb-0 w-24">
              <CustomField v-model="item.quantity" type="number" :min="1" />
            </AFormItem>
            <AFormItem :label="t('unitPrice', '單價')" :field="`items.${index}.unitPrice`" class="mb-0 w-32">
              <CustomField v-model="item.unitPrice" type="number" :min="0" />
            </AFormItem>
            <AFormItem :label="t('subtotal', '小計')" class="mb-0 w-32">
              <div class="flex h-8 items-center font-medium text-blue-600">NT$ {{ formatNumber(item.quantity * item.unitPrice) }}</div>
            </AFormItem>
            <a-button type="text" status="danger" class="mb-0" @click="removeInvoiceItem(index)">
              <i class="ri-delete-bin-line"></i>
            </a-button>
          </div>
          <div v-if="basicForm.items.length === 0" class="py-4 text-center text-gray-400">{{ t('noItems', '尚無項目，請點擊新增') }}</div>
        </div>-->
        <div class="grid grid-cols-2 gap-4">
          <AFormItem :label="t('paymentDate', '付款日期')" field="dueDate" class="col-span-2">
            <TinyDatePicker v-model="basicForm.dueDate" :placeholder="t('pleaseSelect', '請選擇')" value-format="yyyy-MM-dd" class="w-full" />
          </AFormItem>
          <AFormItem :label="t('taxRate', '稅率 (%)')" field="taxRate">
            <CustomField v-model="basicForm.taxRate" type="number" :min="0" :max="100" :step="1" />
          </AFormItem>
          <AFormItem :label="t('discount', '折扣金額')" field="discount">
            <CustomField v-model="basicForm.discount" type="number" :min="0" />
          </AFormItem>
          <AFormItem :label="t('notes', '備註')" class="col-span-2">
            <CustomField v-model="basicForm.notes" type="textarea" :placeholder="t('invoiceNumberOrNotePlaceholder', '請輸入已開立的統一發票號碼或者其他備註')" />
          </AFormItem>
        </div>

        <!-- 金額摘要 -->
        <div class="mt-4 rounded bg-gray-50 p-4">
          <div class="flex justify-between text-sm">
            <span>{{ t('subtotal', '小計') }}</span>
            <span>NT$ {{ formatNumber(calculateSubtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>{{ t('tax', '稅額') }} ({{ basicForm.taxRate }}%)</span>
            <span>NT$ {{ formatNumber(calculateTax) }}</span>
          </div>
          <div v-if="basicForm.discount > 0" class="flex justify-between text-sm text-red-600">
            <span>{{ t('discount', '折扣') }}</span>
            <span>-NT$ {{ formatNumber(basicForm.discount) }}</span>
          </div>
          <div class="mt-2 flex justify-between border-t pt-2 text-lg font-semibold">
            <span>{{ t('total', '總計') }}</span>
            <span class="text-blue-600">NT$ {{ formatNumber(calculateTotal) }}</span>
          </div>
        </div>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="dialogVisible = false">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :loading="isSaving" @click="handleSubmit">{{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}</a-button>
      </div>
    </template>
  </a-modal>

  <!-- 請款單詳情 Drawer -->
  <a-drawer v-model:visible="detailDrawerVisible" :title="t('billingRequestDetail', '請款單詳情')" width="600px" :footer="false">
    <div v-if="selectedInvoice" class="space-y-4">
      <!-- 基本資訊 -->
      <div class="rounded bg-gray-50 p-4">
        <h3 class="mb-3 font-medium">{{ t('basicInfo', '基本資訊') }}</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-500">{{ t('status', '狀態') }}：</span>
            <TinyBadge :type="getStatusType(selectedInvoice.status)">{{ getStatusLabel(selectedInvoice.status) }}</TinyBadge>
          </div>
          <div>
            <span class="text-gray-500">{{ t('customer', '客戶') }}：</span>
            <span>{{ selectedInvoice.customer?.name }}</span>
          </div>
          <div>
            <span class="text-gray-500">{{ t('dueDate', '到期日') }}：</span>
            <span>{{ selectedInvoice.dueDate }}</span>
          </div>
          <div>
            <span class="text-gray-500">{{ t('createdAt', '建立時間') }}：</span>
            <span>{{ selectedInvoice.createdAt }}</span>
          </div>
          <div v-if="selectedInvoice.paidDate">
            <span class="text-gray-500">{{ t('paidDate', '付款日期') }}：</span>
            <span>{{ selectedInvoice.paidDate }}</span>
          </div>
        </div>
      </div>

      <!-- 請款單項目 -->
      <div>
        <h3 class="mb-3 font-medium">{{ t('billingRequestItems', '請款單項目') }}</h3>
        <div class="space-y-2">
          <div v-for="item in selectedInvoice.items" :key="item.id" class="flex justify-between rounded border p-3 text-sm">
            <div>
              <span class="font-medium">{{ item.productName }}</span>
              <span class="ml-2 text-gray-500">x {{ item.quantity }}</span>
            </div>
            <span>NT$ {{ formatNumber(item.totalPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- 金額摘要 -->
      <div class="rounded bg-blue-50 p-4">
        <div class="flex justify-between text-sm">
          <span>{{ t('subtotal', '小計') }}</span>
          <span>NT$ {{ formatNumber(selectedInvoice.amount) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>{{ t('tax', '稅額') }}</span>
          <span>NT$ {{ formatNumber(selectedInvoice.taxAmount) }}</span>
        </div>
        <div v-if="selectedInvoice.discount > 0" class="flex justify-between text-sm text-red-600">
          <span>{{ t('discount', '折扣') }}</span>
          <span>-NT$ {{ formatNumber(selectedInvoice.discount) }}</span>
        </div>
        <div class="mt-2 flex justify-between border-t border-blue-200 pt-2 font-semibold">
          <span>{{ t('totalAmount', '總金額') }}</span>
          <span class="text-blue-600">NT$ {{ formatNumber(selectedInvoice.totalAmount) }}</span>
        </div>
        <div class="flex justify-between text-sm text-green-600">
          <span>{{ t('paidAmount', '已付金額') }}</span>
          <span>NT$ {{ formatNumber(selectedInvoice.paidAmount) }}</span>
        </div>
        <div class="flex justify-between text-sm" :class="selectedInvoice.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'">
          <span>{{ t('remainingAmount', '未付金額') }}</span>
          <span>NT$ {{ formatNumber(selectedInvoice.remainingAmount) }}</span>
        </div>
      </div>

      <!-- 付款記錄 -->
      <div v-if="selectedInvoice.payments && selectedInvoice.payments.length > 0">
        <h3 class="mb-3 font-medium">{{ t('paymentRecords', '付款記錄') }}</h3>
        <div class="space-y-2">
          <div v-for="payment in selectedInvoice.payments" :key="payment.id" class="flex justify-between rounded border p-3 text-sm">
            <div>
              <span>{{ getPaymentMethodLabel(payment.method) }}</span>
              <span class="ml-2 text-gray-500">{{ payment.paidAt }}</span>
            </div>
            <span class="text-green-600">+NT$ {{ formatNumber(payment.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- 備註 -->
      <div v-if="selectedInvoice.notes">
        <h3 class="mb-2 font-medium">{{ t('notes', '備註') }}</h3>
        <p class="text-sm text-gray-600">{{ selectedInvoice.notes }}</p>
      </div>
    </div>
  </a-drawer>

  <!-- 搜尋既有訂單彈窗 -->
  <a-modal v-model:visible="orderSearchDialogVisible" :title="t('searchCompletedOrder', '搜尋已完成訂單')" width="900px" :footer="false">
    <div class="flex flex-col gap-3">
      <!-- 搜尋欄 -->
      <div class="flex gap-2">
        <TinyInput v-model="orderSearchTerm" class="flex-1" :placeholder="t('searchOrderPlaceholder', '輸入訂單編號或客戶名稱...')" clearable @keyup.enter="handleOrderSearch" />
        <a-button type="primary" :loading="orderSearchLoading" @click="handleOrderSearch">
          <i class="ri-search-line mr-1" />
          {{ t('search', '搜尋') }}
        </a-button>
      </div>

      <!-- 提示文字 -->
      <p class="text-xs text-gray-500">
        <i class="ri-information-line mr-1" />
        {{ t('onlyCompletedOrdersCanBeSelected', '僅顯示狀態為「已完成」的訂單') }}
      </p>

      <!-- 訂單列表 -->
      <a-table :data="existingOrders" :bordered="false" :pagination="false" :scroll="{ y: 400 }" :loading="orderSearchLoading" row-key="id">
        <template #columns>
          <!--<a-table-column :title="t('orderNumber', '訂單編號')" :width="180">
            <template #cell="{ record }">{{ record.orderNumber || `#${record.id}` }}</template>
          </a-table-column>-->
          <a-table-column :title="t('customer', '客戶')" min-width="150">
            <template #cell="{ record }">{{ record.targetName || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('orderDate', '訂單日期')" :width="120">
            <template #cell="{ record }">{{ record.orderDate || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('totalAmount', '總金額')" :width="130" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.totalAmount) }}</template>
          </a-table-column>
          <a-table-column :title="t('itemCount', '商品數')" :width="80" align="center">
            <template #cell="{ record }">{{ record.products?.length || 0 }}</template>
          </a-table-column>
          <a-table-column :title="t('actions', '操作')" :width="100" align="center">
            <template #cell="{ record }">
              <a-button type="primary" size="small" @click="handleSelectOrder(record)">{{ t('select', '選擇') }}</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <!-- 分頁 -->
      <a-pagination
        v-if="orderSearchPagination.total > orderSearchPagination.limit"
        :current="orderSearchPagination.page"
        :page-size="orderSearchPagination.limit"
        :total="orderSearchPagination.total"
        size="small"
        @change="handleOrderPageChange"
      />
    </div>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { InvoiceCreatePost, InvoiceDeleteById, InvoiceGetById, InvoiceListGet, InvoiceSendPost, InvoiceUpdatePatch } from '@/assets/API/Billing';
import { OrderListGet } from '@/assets/API/Order';
import { TinyBadge, TinyDatePicker, TinySelect, TinyInput } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue'
import CustomFormItem from '@/components/Form/CustomFormItem.vue'
import CustomField from '@/components/Form/CustomField.vue';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';
import { addDays, endOfDay, format } from 'date-fns';
import { debounce } from 'lodash';
import { useCurrencyStore } from '@/stores/currency';
import { Expand, Shrink } from 'lucide-vue-next';
import { useWindowSize } from '@vueuse/core';

const emit = defineEmits(['open-payment']);
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const systemStore = useSystemStore();
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 520, 100));
const { t } = useI18n();

const { formatNumber, formatCurrencyNumber } = currencyStore;
const formatDate = computed(() => timezoneStore.formatDate);
const EMPTY_PLACEHOLDER = '—';

/** 狀態相關 **/
const statusOptions = [
  { label: t('draft', '草稿'), value: 'DRAFT' },
  { label: t('sent', '已發送'), value: 'SENT' },
  { label: t('paid', '已付款'), value: 'PAID' },
  { label: t('partial', '部分付款'), value: 'PARTIAL' },
  { label: t('overdue', '逾期'), value: 'OVERDUE' },
  { label: t('cancelled', '已取消'), value: 'CANCELLED' },
];
const getStatusLabel = (status) => {
  const map = {
    DRAFT: t('draft', '草稿'),
    SENT: t('sent', '已發送'),
    PAID: t('paid', '已付款'),
    PARTIAL: t('partial', '部分付款'),
    OVERDUE: t('overdue', '逾期'),
    CANCELLED: t('cancelled', '已取消'),
  };
  return map[status] || status;
}; //取得狀態標籤
const getStatusType = (status) => {
  const map = {
    DRAFT: 'info',
    SENT: 'warning',
    PAID: 'success',
    PARTIAL: 'warning',
    OVERDUE: 'danger',
    CANCELLED: 'info',
  };
  return map[status] || 'info';
}; //取得狀態顏色
const getPaymentMethodLabel = (method) => {
  const map = {
    CASH: t('cash', '現金'),
    CARD: t('card', '信用卡'),
    TRANSFER: t('transfer', '轉帳'),
    CHECK: t('check', '支票'),
  };
  return map[method] || method;
}; //取得付款方式標籤

/** 排序相關 **/
const sortField = ref('createdAt');
const sortDirection = ref(null);
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = 'createdAt';
    sortDirection.value = null;
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getDefaultAPI();
}; //切換排序

/** 列表資料 **/
const responseDataToList = (item = {}) => ({
  ...item,
  id: item.id,
  customerId: item.customerId,
  status: item.status,
  amount: item.amount || 0,
  taxAmount: item.taxAmount || 0,
  totalAmount: item.totalAmount || 0,
  discount: item.discount || 0,
  paidAmount: item.paidAmount || 0,
  remainingAmount: item.remainingAmount || 0,
  dueDate: item.dueDate ? timezoneStore.formatDate(item.dueDate, 'YYYY-MM-DD') : EMPTY_PLACEHOLDER,
  paidDate: item.paidDate ? timezoneStore.formatDate(item.paidDate, 'YYYY-MM-DD') : null,
  createdAt: timezoneStore.formatDate(item.createdAt) || EMPTY_PLACEHOLDER,
  notes: item.notes || '',
  items: item.items || [],
  payments: item.payments || [],
  raw: item,
}); //結果轉換
const defaultFilters = {
  status: '',
  customerId: '',
  startDate: '',
  endDate: '',
  search: '',
};
const wrappedInvoiceListGet = (params) => {
  const processedParams = { ...params };
  if (processedParams.endDate) {
    processedParams.endDate = endOfDay(new Date(processedParams.endDate));
  }
  if (sortField.value && sortDirection.value) {
    processedParams.sortBy = sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }
  return InvoiceListGet(processedParams);
};
const { basicDataList, filters, pagination, pageSizeOptions, getDefaultAPI, handleFiltersChange, clearFilter, CurrentChange, SizeChange } = usePaginatedSearchApi(
  wrappedInvoiceListGet,
  defaultFilters,
  {
    responseDataToList,
  },
);
const getAPI = () => getDefaultAPI();

/** 新增/編輯請款單 **/
const fullscreen = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const formRef = ref(null);
const editingInvoiceId = ref(null);
const createMode = ref('manual'); // 'manual' 手動新增 | 'fromOrder' 從訂單匯入
const initializeForm = () => ({
  customerId: '',
  dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  taxRate: 5,
  discount: 0,
  notes: '',
  items: [],
}); //初始化表單資料
const basicForm = ref(initializeForm());
const basicFormRules = {
  customerId: [{ required: true, message: t('required', '此欄位必填') }],
};
const openCreateDialog = () => {
  isEditing.value = false;
  editingInvoiceId.value = null;
  createMode.value = 'manual';
  selectedOrder.value = null;
  basicForm.value = initializeForm();
  dialogVisible.value = true;
}; //開啟新增對話框
const openEditDialog = async (row) => {
  isEditing.value = true;
  editingInvoiceId.value = row.id;
  mainStore.setLoading(true);
  try {
    const response = await InvoiceGetById(row.id);
    const data = response?.data?.data || response?.data || {};
    basicForm.value = {
      customerId: data.customer || '',
      dueDate: data.dueDate ? format(new Date(data.dueDate), 'yyyy-MM-dd') : '',
      taxRate: (data.taxRate || 0) * 100,
      discount: data.discount || 0,
      notes: data.notes || '',
      items: (data.items || []).map((item) => ({
        productId: item.product,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    dialogVisible.value = true;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //開啟編輯對話框
const addInvoiceItem = () => {
  basicForm.value.items.push({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
  });
}; //新增請款單項目
const removeInvoiceItem = (index) => {
  basicForm.value.items.splice(index, 1);
}; //移除請款單項目
const handleProductChange = (index, product) => {
  if (product && typeof product === 'object') {
    basicForm.value.items[index].productName = product.name || '';
    basicForm.value.items[index].unitPrice = product.price || product.unitPrice || 0;
  }
}; //商品選擇變更
const calculateSubtotal = computed(() => {
  return basicForm.value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}); //計算小計
const calculateTax = computed(() => {
  return Math.round(calculateSubtotal.value * (basicForm.value.taxRate / 100));
}); //計算稅額
const calculateTotal = computed(() => {
  return calculateSubtotal.value + calculateTax.value - (basicForm.value.discount || 0);
}); //計算總計
const preparePayload = () => {
  return {
    customerId: basicForm.value.customerId?.id,
    dueDate: basicForm.value.dueDate ? new Date(basicForm.value.dueDate).toISOString() : undefined,
    taxRate: basicForm.value.taxRate / 100,
    discount: basicForm.value.discount || 0,
    notes: basicForm.value.notes || undefined,
    items: basicForm.value.items.map((item) => ({
      productId: typeof item.productId === 'object' ? item.productId.id : item.productId,
      productName: typeof item.productId === 'object' ? item.productId.name : item.productName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  };
}; //準備送出資料
const _saveForm = async () => {
  const validateResult = await formRef.value?.validate();
  if (validateResult) return false;

  if (basicForm.value.items.length === 0) {
    await mainStore.SWAL_Error(t('pleaseAddItems', '請新增至少一個請款單項目'));
    return;
  }
  mainStore.setLoading(true);
  isSaving.value = true;
  try {
    const payload = preparePayload();
    if (isEditing.value) {
      delete payload.customerId;
      await InvoiceUpdatePatch(editingInvoiceId.value, payload);
    } else {
      await InvoiceCreatePost(payload);
    }
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
    isSaving.value = false;
  }
}; //儲存
const handleSubmit = debounce(_saveForm, 300, { leading: true, trailing: false });
const handleSendInvoice = async (row) => {
  await mainStore.SWAL_Confirm({
    text: t('confirmSendBillingRequest', '確定要發送此請款單嗎？'),
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await InvoiceSendPost(row.id);
        await mainStore.SWAL_Success(t('sendSuccess', '發送成功'));
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
}; //發送請款單
const handleDeleteInvoice = async (row) => {
  const confirmed = await mainStore.SWAL_Confirm(t('confirmDeleteBillingRequest', '確定要刪除此請款單嗎？'));
  if (!confirmed) return;

  mainStore.setLoading(true);
  try {
    await InvoiceDeleteById(row.id);
    await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //刪除請款單
const handleOpenPayment = (row) => {
  console.log(1111, row);
  emit('open-payment', row);
}; //開啟付款對話框

/** 搜尋既有訂單相關 **/
const orderSearchDialogVisible = ref(false);
const orderSearchTerm = ref('');
const orderSearchLoading = ref(false);
const existingOrders = ref([]);
const selectedOrder = ref(null);
const orderSearchPagination = ref({ page: 1, limit: 10, total: 0 });
const searchExistingOrders = async (page = 1) => {
  orderSearchLoading.value = true;
  try {
    const params = {
      page,
      limit: orderSearchPagination.value.limit,
      status: 'DELIVERED', //只搜尋已完成的訂單
    };
    if (orderSearchTerm.value) params.keyword = orderSearchTerm.value;
    const response = await OrderListGet(params);
    const responseData = response?.data?.data || response?.data || {};
    const data = responseData?.data || responseData || [];
    const paginationData = responseData?.pagination || {};
    existingOrders.value = Array.isArray(data) ? data : [];
    orderSearchPagination.value.page = paginationData.page || page;
    orderSearchPagination.value.total = paginationData.total || 0;
  } catch (error) {
    console.error('搜尋訂單失敗:', error);
    existingOrders.value = [];
  } finally {
    orderSearchLoading.value = false;
  }
}; //搜尋既有訂單
const handleOpenOrderSearch = async () => {
  orderSearchTerm.value = '';
  orderSearchPagination.value.page = 1;
  orderSearchDialogVisible.value = true;
  await searchExistingOrders(1);
}; //開啟訂單搜尋彈窗
const handleOrderSearch = () => {
  orderSearchPagination.value.page = 1;
  searchExistingOrders(1);
}; //執行搜尋
const handleOrderPageChange = (page) => {
  searchExistingOrders(page);
}; //切換頁碼
const handleSelectOrder = (order) => {
  selectedOrder.value = order;
  orderSearchDialogVisible.value = false;
  basicForm.value.customerId = {
    id: order.targetId,
    name: order.targetName,
  };
  const products = order.products || [];
  basicForm.value.items = products.map((item) => ({
    productId: {
      id: item.productId,
      name: item.productName,
    },
    productName: item.productName,
    quantity: item.quantity || 1,
    unitPrice: item.actualPrice || item.retailPrice || 0,
  }));
}; //選擇訂單並填入表單
const handleClearSelectedOrder = () => {
  selectedOrder.value = null;
  basicForm.value = initializeForm();
}; //清除已選訂單

/** 請款單詳情 **/
const detailDrawerVisible = ref(false);
const selectedInvoice = ref(null);
const openDetailDrawer = async (row) => {
  mainStore.setLoading(true);
  try {
    const response = await InvoiceGetById(row.id);
    const data = response?.data?.data || response?.data || {};
    selectedInvoice.value = {
      ...responseDataToList(data),
      items: (data.items || []).map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      payments: (data.payments || []).map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        paidAt: timezoneStore.formatDate(payment.paidAt, 'YYYY-MM-DD'),
      })),
    };
    detailDrawerVisible.value = true;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //開啟詳情 Drawer

defineExpose({
  openCreateDialog,
  clearFilter,
  getAPI,
});

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
});
</script>
