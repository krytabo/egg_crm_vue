<template>
  <Card>
    <CardHeader class="flex-col gap-3 sm:flex-row">
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('productDetailEdit', '商品明細編輯') }}</CardTitle>
        <a-descriptions title="" :column="2">
          <a-descriptions-item :label="t('driver', '司機')">
            <InfiniteSelect v-model="vm.basicForm.drivers" dataSource="drivers" readonly />
          </a-descriptions-item>
          <a-descriptions-item :label="t('reportDate', '報表日期')">
            <CustomField v-model="vm.basicForm.reportDate" type="date-picker" readonly />
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <a-button size="small" @click="vm.handleBack"> {{ t('backToList', '返回列表') }}</a-button>
        <a-button size="small" @click="exportFile">{{ t('匯出Excel', '匯出Excel') }}</a-button>
        <a-button size="small" status="danger" @click="vm.handleClearAll">{{ t('clearAll', '清除全部') }}</a-button>
        <a-button size="small" type="primary" @click="vm.handleSave" :loading="vm.saving"> {{ t('save', '儲存') }} </a-button>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-2">
      <div class="flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm autoLabelWidth :labelAlign="'left'">
          <AFormItem :label="t('deliveryDays', '出貨星期')">
            <TinyCheckboxGroup v-model="vm.basicForm.deliveryDays" :options="vm.weekDayOptions" />
          </AFormItem>
          <AFormItem :label="t('notes', '備註')">
            <TinyInput type="textarea" v-model="vm.basicForm.note" />
          </AFormItem>
        </AForm>
      </div>

      <CustomTinyGrid
        :data="vm.editedProducts"
        :height="tableHeight"
        row-key="rowKey"
        :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
        :row-span="rowSpanConfig"
      >
        <CustomTinyGridColumn field="productName" :title="t('productName', '商品名稱')" min-width="250" fixed="left">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <a-tag :color="vm.getProductCategoryColor(row.productCategory)" size="small">{{ row.productCategory || '—' }}</a-tag>
              {{ row.productName }}
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="customerName" :title="t('customer', '客戶')" min-width="200">
          <template #default="{ row, rowIndex }">
            <InfiniteSelect
              v-model="row.customerId"
              dataSource="customers"
              :placeholder="row.customerName || t('selectCustomer', '選擇客戶')"
              type="outline"
              allowClear
              @change="(val) => vm.handleCustomerChange(rowIndex, val)"
              :filters="{ deliveryDays: vm.basicForm.deliveryDays }"
            />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="120" align="right">
          <template #default="{ row, rowIndex }">
            <TinyInput type="number" v-model="row.quantity" min="0" @change="() => vm.recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="unitPrice" :title="t('unitPrice', '單價')" width="120" align="right">
          <template #default="{ row, rowIndex }">
            <TinyInput type="number" v-model="row.unitPrice" min="0" @change="() => vm.recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="amount" :title="t('amount', '金額')" width="150" align="right">
          <template #default="{ row }">
            <span class="text-gray-600">NT$ {{ vm.formatNumber(row.amount) }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="actualAmount" :title="t('actualPayment', '實際收付')" width="150" align="right">
          <template #default="{ row }">
            <TinyInput type="number" v-model="row.actualAmount" min="0" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="paymentMethod" :title="t('paymentMethod', '付款方式')" width="150">
          <template #default="{ row }">
            <TinySelect v-model="row.paymentMethod" :options="vm.paymentOptions" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="note" :title="t('note', '備註')" min-width="150">
          <template #default="{ row }">
            <TinyInput v-model="row.note" :placeholder="t('enterNote', '輸入備註...')" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="" :title="t('actions', '操作')" width="150" fixed="right" align="center">
          <template #header>
            <div class="flex gap-1 items-center">
              <p>{{ t('actions', '操作') }}</p>
              <a-button type="text" @click="vm.openAddProductDialog">{{ t('new') }}</a-button>
            </div>
          </template>
          <template #default="{ rowIndex }">
            <a-button type="text" size="small" status="danger" @click="vm.handleDeleteRow(rowIndex)">
              <i class="ri-delete-bin-line" />
            </a-button>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <div class="flex justify-end">
        <div class="flex flex-col justify-end gap-1">
          <div class="flex items-center justify-between text-sm text-gray-600">
            <p class="text-sm text-gray-500">{{ t('subtotalAmount', '商品總金額') }}</p>
            <p class="text-lg font-medium text-gray-700">NT$ {{ vm.formatNumber(vm.totalAmount) }}</p>
          </div>
          <div class="flex items-center justify-between text-base">
            <p class="text-sm text-gray-500">{{ t('actualPaymentTotal', '實際收付') }}</p>
            <p class="text-lg font-semibold text-blue-600">NT$ {{ vm.formatNumber(vm.totalActualAmount) }}</p>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-gray-700">{{ t('fuelExpense', '加油支出') }}</span>
            <CustomField v-model="vm.fuelExpense" type="number" min="0" thousands allowClear />
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-gray-700">{{ t('otherExpense', '其他支出') }}</span>
            <CustomField v-model="vm.otherExpense" type="number" min="0" thousands allowClear />
          </div>
          <a-divider />
          <div class="flex items-center justify-between text-base font-semibold">
            <p class="text-[18px] text-gray-500">{{ t('金額總計', '金額總計') }}</p>
            <p class="text-xl font-bold text-green-600">NT$ {{ vm.formatNumber(vm.totalActualAmount - vm.fuelExpense - vm.otherExpense) }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <a-modal v-model:visible="vm.addProductDialogVisible" :title="t('addProduct', '新增商品')" width="720px" :closable="false">
    <AForm layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <AFormItem :label="t('selectProduct', '選擇商品')" required>
          <InfiniteSelect v-model="vm.selectedProduct" dataSource="products" :placeholder="t('pleaseSelectProduct', '請選擇商品')" type="outline" />
        </AFormItem>
        <AFormItem :label="t('selectCustomer', '選擇客戶')" required>
          <InfiniteSelect v-model="vm.selectedCustomer" dataSource="customers" :placeholder="t('pleaseSelectCustomer', '請選擇客戶')" type="outline" :filters="{ deliveryDays: vm.basicForm.deliveryDays }" />
        </AFormItem>
        <AFormItem :label="t('quantity', '數量')">
          <TinyInput type="number" v-model="vm.newProductQuantity" min="0" />
        </AFormItem>
        <AFormItem :label="t('unitPrice', '單價')">
          <TinyInput type="number" v-model="vm.newProductUnitPrice" min="0" />
        </AFormItem>
        <AFormItem :label="t('paymentMethod', '付款方式')">
          <TinySelect v-model="vm.newProductPaymentMethod" :options="vm.paymentOptions" />
        </AFormItem>
        <AFormItem :label="t('note', '備註')">
          <TinyInput v-model="vm.newProductNote" :placeholder="t('optional', '選填')" />
        </AFormItem>
      </div>
    </AForm>
    <div v-if="vm.selectedProduct" class="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
      <p>
        <strong>{{ t('selectedProduct', '已選商品：') }}</strong>
        {{ vm.selectedProduct.name }}
      </p>
      <p>
        <strong>{{ t('category', '類別：') }}</strong>
        {{ vm.selectedProduct.category?.name || '—' }}
      </p>
      <p>
        <strong>{{ t('defaultPrice', '預設單價：') }}</strong>
        NT$ {{ vm.formatNumber(vm.selectedProduct.basePriceAmount) }}
      </p>
      <p v-if="vm.customerCustomPrice !== null" class="text-green-700">
        <strong>{{ t('customerCustomPrice', '客戶自定義價格：') }}</strong>
        NT$ {{ vm.formatNumber(vm.customerCustomPrice) }}
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="vm.closeAddProductDialog">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" @click="vm.handleConfirmAddProduct" :disabled="!vm.selectedProduct || !vm.selectedCustomer">{{ t('confirm', '確認') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinyCheckboxGroup, TinyInput, TinySelect } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { useI18n } from 'vue-i18n';
import { useSystemStore } from '@/stores/system';
import { useFileExport } from '@/composables/useFileExport.js';
import { DeliveryReportExportGet } from '@/assets/API/DeliveryReports.js';

const props = defineProps({
  vm: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();
const systemStore = useSystemStore();

// View specific data
const tableHeight = computed(() => systemStore.tableHeight);
const rowSpanConfig = [{ field: 'productName' }];

// Export logic - keeping it close to the button for now as it's a UI trigger
const { downloadFile } = useFileExport();
const exportFile = async () => {
  await downloadFile(DeliveryReportExportGet, props.vm.basicForm.id, 'DownloadFile.xlsx');
};
</script>
