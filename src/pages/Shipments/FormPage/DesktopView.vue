<!-- src/pages/Shipments/FormPage/DesktopView.vue -->
<template>
  <Card>
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ isReadOnly ? t('productDetailView', '商品明細檢視') : t('productDetailEdit', '商品明細編輯') }}</CardTitle>
        <a-descriptions title="" :column="2">
          <a-descriptions-item :label="t('driver', '司機')">
            <InfiniteSelect v-model="basicForm.drivers" dataSource="drivers" readonly />
          </a-descriptions-item>
          <a-descriptions-item :label="t('reportDate', '報表日期')">
            <CustomField v-model="basicForm.reportDate" type="date-picker" readonly />
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="flex items-center gap-3">
        <a-button @click="handleBack">{{ t('backToList', '返回列表') }}</a-button>
        <a-button @click="exportFile">{{ t('exportExcel', '匯出Excel') }}</a-button>
        <template v-if="!isReadOnly">
          <a-button status="danger" @click="handleClearAll" :loading="saving">{{ t('clearAll', '清除全部') }}</a-button>
          <a-button status="success" @click="handleSave" :loading="saving">{{ t('saveDraft', '暫存') }}</a-button>
          <a-button type="primary" @click="handleSend" :loading="saving">{{ t('submitReport', '提交送出') }}</a-button>
        </template>
      </div>
    </CardHeader>

    <div class="flex flex-col gap-2">
      <!-- 報表資訊區塊 -->
      <div class="flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm autoLabelWidth :labelAlign="'left'">
          <AFormItem :label="t('deliveryDays', '出貨星期')">
            <TinyCheckboxGroup v-model="basicForm.deliveryDays" :options="weekDayOptions" :disabled="isReadOnly" />
          </AFormItem>
          <AFormItem :label="t('notes', '備註')">
            <TinyInput type="textarea" v-model="basicForm.note" :displayOnly="isReadOnly" />
          </AFormItem>
        </AForm>
      </div>

      <!-- 商品列表 -->
      <CustomTinyGrid :data="editedProducts" :height="systemStore.tableHeight" row-key="rowKey" :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }" :row-span="rowSpanConfig">
        <CustomTinyGridColumn field="customerName" :title="t('customer', '客戶')" min-width="200" fixed="left">
          <template #default="{ row, rowIndex }">
            <InfiniteSelect
              v-model="row.customerId"
              dataSource="customers"
              :placeholder="row.customerName || t('selectCustomer', '選擇客戶')"
              type="outline"
              allowClear
              :readonly="isReadOnly"
              @change="(val) => handleCustomerChange(rowIndex, val)"
              :filters="{ deliveryDays: basicForm.deliveryDays }"
            />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="productName" :title="t('productName', '商品名稱')" min-width="250">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <a-tag :color="getProductCategoryColor(row.productCategory)" size="small">{{ row.productCategory || '—' }}</a-tag>
              {{ row.productName }}
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" :width="150" align="right">
          <template #default="{ row, rowIndex }">
            <TinyCustomField type="number" v-model="row.quantity" :min="0" :displayOnly="isReadOnly" @change="() => recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="unitPrice" :title="t('unitPrice', '單價')" :width="180" align="right">
          <template #default="{ row, rowIndex }">
            <TinyCustomField type="number" v-model="row.unitPrice" :min="0" :precision="1" thousands :displayOnly="isReadOnly" @change="() => recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="amount" :title="t('amount', '金額')" :width="150" align="right">
          <template #default="{ row }">
            <span class="text-gray-600">NT$ {{ formatNumber(row.amount) }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="actualAmount" :title="t('actualPayment', '實際收付')" :width="180" align="right">
          <template #default="{ row }">
            <TinyCustomField type="number" v-model="row.actualAmount" :min="0" :precision="1" :displayOnly="isReadOnly" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="paymentMethod" :title="t('paymentMethod', '付款方式')" width="150">
          <template #default="{ row }">
            <TinySelect v-model="row.paymentMethod" :options="paymentOptions" :displayOnly="isReadOnly" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="note" :title="t('note', '備註')" min-width="150">
          <template #default="{ row }">
            <TinyInput v-model="row.note" :placeholder="t('enterNote', '輸入備註...')" :displayOnly="isReadOnly" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn v-if="!isReadOnly" field="" :title="t('actions', '操作')" width="150" fixed="right" align="center">
          <template #header>
            <div class="flex gap-1 items-center">
              <p>{{ t('actions', '操作') }}</p>
              <a-button type="text" @click="openAddProductDialog">{{ t('new') }}</a-button>
            </div>
          </template>
          <template #default="{ rowIndex }">
            <a-button type="text" size="small" status="danger" @click="handleDeleteRow(rowIndex)">
              <i class="ri-delete-bin-line" />
            </a-button>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <!-- 底部結算區 -->
      <div class="flex justify-end">
        <div class="flex flex-col justify-end gap-1">
          <div class="flex items-center justify-between text-sm text-gray-600">
            <p class="text-sm text-gray-500">{{ t('subtotalAmount', '商品總金額') }}</p>
            <p class="text-lg font-medium text-gray-700">NT$ {{ formatNumber(totalAmount) }}</p>
          </div>
          <div class="flex items-center justify-between text-base">
            <p class="text-sm text-gray-500">{{ t('actualPaymentTotal', '實際收付') }}</p>
            <p class="text-lg font-semibold text-blue-600">NT$ {{ formatNumber(totalActualAmount) }}</p>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-gray-700">{{ t('fuelExpense', '加油支出') }}</span>
            <CustomField v-model="fuelExpense" type="number" min="0" thousands allowClear :readonly="isReadOnly" />
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-gray-700">{{ t('otherExpense', '其他支出') }}</span>
            <CustomField v-model="otherExpense" type="number" min="0" thousands allowClear :readonly="isReadOnly" />
          </div>
          <a-divider />
          <div class="flex items-center justify-between text-base font-semibold">
            <p class="text-[18px] text-gray-500">{{ t('totalAmount', '金額總計') }}</p>
            <p class="text-xl font-bold text-green-600">NT$ {{ formatNumber(finalTotal) }}</p>
          </div>
        </div>
      </div>
    </div>
  </Card>

  <!-- 新增商品彈窗 -->
  <a-modal v-model:visible="addProductDialogVisible" :title="t('addProduct', '新增商品')" width="720px" :closable="false">
    <AForm layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <AFormItem :label="t('selectProduct', '選擇商品')" required>
          <InfiniteSelect v-model="selectedProduct" dataSource="products" :filters="{ status: 'ACTIVE' }" :placeholder="t('pleaseSelectProduct', '請選擇商品')" type="outline" />
        </AFormItem>
        <AFormItem :label="t('selectCustomer', '選擇客戶')" required>
          <InfiniteSelect v-model="selectedCustomer" dataSource="customers" :placeholder="t('pleaseSelectCustomer', '請選擇客戶')" type="outline" :filters="{ deliveryDays: basicForm.deliveryDays }" />
        </AFormItem>
        <AFormItem :label="t('quantity', '數量')">
          <TinyCustomField type="number" v-model="newProductQuantity" :min="0" />
        </AFormItem>
        <AFormItem :label="t('unitPrice', '單價')">
          <TinyCustomField type="number" v-model="newProductUnitPrice" :min="0" :precision="1" />
        </AFormItem>
        <AFormItem :label="t('paymentMethod', '付款方式')">
          <TinyCustomField type="select" v-model="newProductPaymentMethod" :options="paymentOptions" />
        </AFormItem>
        <AFormItem :label="t('note', '備註')">
          <TinyCustomField type="input" v-model="newProductNote" :placeholder="t('optional', '選填')" />
        </AFormItem>
      </div>
    </AForm>
    <div v-if="selectedProduct" class="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
      <p>
        <strong>{{ t('selectedProduct', '已選商品：') }}</strong
        >{{ selectedProduct.name }}
      </p>
      <p>
        <strong>{{ t('category', '類別：') }}</strong
        >{{ selectedProduct.category?.name || '—' }}
      </p>
      <p>
        <strong>{{ t('defaultPrice', '預設單價：') }}</strong
        >NT$ {{ formatNumber(selectedProduct.basePriceAmount) }}
      </p>
      <p v-if="customerCustomPrice !== null" class="text-green-700">
        <strong>{{ t('customerCustomPrice', '客戶自定義價格：') }}</strong
        >NT$ {{ formatNumber(customerCustomPrice) }}
      </p>
    </div>
    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="closeAddProductDialog">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" @click="handleConfirmAddProduct" :displayOnly="!selectedProduct || !selectedCustomer">{{ t('confirm', '確認') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { onMounted, nextTick, onUnmounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinyCheckboxGroup, TinyInput, TinySelect } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import TinyCustomField from '@/components/Form/TinyCustomField.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { useFormPage } from './useFormPage';

const props = defineProps({
  uuid: { type: String, default: '' },
});
const systemStore = useSystemStore();
const { t } = useI18n();

const showMessage = (type, content) => {
  if (type === 'success') Message.success(content);
  else if (type === 'warning') Message.warning(content);
  else if (type === 'error') Message.error(content);
  else Message.info(content);
};
const {
  saving,
  basicForm,
  editedProducts,
  fuelExpense,
  otherExpense,
  isReadOnly,
  addProductDialogVisible,
  selectedProduct,
  selectedCustomer,
  newProductQuantity,
  newProductUnitPrice,
  newProductPaymentMethod,
  newProductNote,
  totalAmount,
  totalActualAmount,
  finalTotal,
  customerCustomPrice,
  rowSpanConfig,
  paymentOptions,
  weekDayOptions,
  formatNumber,
  getProductCategoryColor,
  getData,
  handleSave,
  handleSend,
  exportFile,
  handleBack,
  recalculateRow,
  handleCustomerChange,
  handleDeleteRow,
  handleClearAll,
  openAddProductDialog,
  closeAddProductDialog,
  handleConfirmAddProduct,
} = useFormPage(props, t, showMessage);

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getData();
  await nextTick();
  systemStore.updateTableHeight(680);
});
</script>
