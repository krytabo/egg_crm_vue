<!-- src/pages/inventory-reports/FormPage.vue 送貨報表編輯（新版） -->
<template>
  <Card>
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--        統計卡片區          -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--<div class="grid grid-cols-4 gap-3 rounded-md bg-[#f5f7fb] p-4">
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('productCategories', '商品類別') }}</p>
        <div class="flex items-end gap-2">
          <p class="text-2xl font-semibold text-blue-600">{{ uniqueProductCount }}</p>
          <p class="text-gray-500">{{ t('types', '種') }}</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('totalRecords', '總筆數') }}</p>
        <div class="flex items-end gap-2">
          <p class="text-2xl font-semibold text-gray-900">{{ editedProducts.length }}</p>
          <p class="text-gray-500">{{ t('count', '筆') }}</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('totalQuantity', '總數量') }}</p>
        <p class="text-2xl font-semibold text-gray-900">{{ totalQuantity }}</p>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('actualTotal', '實際收付') }}</p>
        <p class="text-2xl font-semibold text-green-600">NT$ {{ formatNumber(totalActualAmount) }}</p>
      </div>
    </div>-->

    <CardHeader class="flex gap-3">
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('productDetailEdit', '商品明細編輯') }}</CardTitle>
        <a-descriptions title="" :column="isMobile ? 1 : 2">
          <a-descriptions-item :label="t('driver', '司機')">
            <InfiniteSelect v-model="basicForm.drivers" dataSource="drivers" readonly />
          </a-descriptions-item>
          <a-descriptions-item :label="t('reportDate', '報表日期')">
            <CustomField v-model="basicForm.reportDate" type="date-picker" readonly />
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="flex items-center gap-2">
        <a-button @click="handleBack"> {{ t('backToList', '返回列表') }}</a-button>
        <a-button @click="exportFile">{{ t('匯出Excel', '匯出Excel') }}</a-button>
        <a-button status="danger" @click="handleClearAll">{{ t('clearAll', '清除全部') }}</a-button>
        <a-button type="primary" @click="handleSave" :loading="saving"> {{ t('save', '儲存') }} </a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容區           -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-2">
      <!-- 報表資訊區塊 -->
      <div class="flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm autoLabelWidth :labelAlign="'left'">
          <!--<div class="grid grid-cols-5 gap-4">
            <AFormItem :label="t('driver', '司機')">
              <InfiniteSelect v-model="basicForm.drivers" dataSource="drivers" readonly />
            </AFormItem>
            <AFormItem :label="t('reportDate', '報表日期')">
              <CustomField v-model="basicForm.reportDate" type="date-picker" readonly />
            </AFormItem>
          </div>-->
          <AFormItem :label="t('deliveryDays', '出貨星期')">
            <TinyCheckboxGroup v-model="basicForm.deliveryDays" :options="weekDayOptions" />
          </AFormItem>
          <AFormItem :label="t('notes', '備註')">
            <TinyInput type="textarea" v-model="basicForm.note" />
          </AFormItem>
        </AForm>
      </div>

      <!-- 操作按鈕區 -->
      <!--<div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <a-button @click="handleBack"> {{ t('backToList', '返回列表') }}</a-button>
          <a-button @click="handlePrint">{{ t('print', '列印') }}</a-button>
        </div>
        <div class="flex items-center gap-2">
          <a-button status="danger" @click="handleClearAll">{{ t('clearAll', '清除全部') }}</a-button>
          <a-button @click="openAddProductDialog">{{ t('addProduct', '新增商品') }}</a-button>
          <a-button type="primary" @click="handleSave" :loading="saving"> {{ t('save', '儲存') }} </a-button>
        </div>
      </div>-->

      <!--電腦版列表-->
      <CustomTinyGrid
        v-if="!isMobile"
        :data="editedProducts"
        :height="systemStore.tableHeight"
        row-key="rowKey"
        :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
        :row-span="rowSpanConfig"
      >
        <CustomTinyGridColumn field="productName" :title="t('productName', '商品名稱')" min-width="250" fixed="left">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <a-tag :color="getProductCategoryColor(row.productCategory)" size="small">{{ row.productCategory || '—' }}</a-tag>
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
              @change="(val) => handleCustomerChange(rowIndex, val)"
              :filters="{ deliveryDays: basicForm.deliveryDays }"
            />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="quantity" :title="t('quantity', '數量')" width="120" align="right">
          <template #default="{ row, rowIndex }">
            <TinyInput type="number" v-model="row.quantity" min="0" @change="() => recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="unitPrice" :title="t('unitPrice', '單價')" width="120" align="right">
          <template #default="{ row, rowIndex }">
            <TinyInput type="number" v-model="row.unitPrice" min="0" @change="() => recalculateRow(rowIndex)" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="amount" :title="t('amount', '金額')" width="150" align="right">
          <template #default="{ row }">
            <span class="text-gray-600">NT$ {{ formatNumber(row.amount) }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="actualAmount" :title="t('actualPayment', '實際收付')" width="150" align="right">
          <template #default="{ row }">
            <TinyInput type="number" v-model="row.actualAmount" min="0" />
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="paymentMethod" :title="t('paymentMethod', '付款方式')" width="150">
          <template #default="{ row }">
            <TinySelect v-model="row.paymentMethod" :options="paymentOptions" />
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

      <!--手機版列表-->
      <div v-else class="space-y-3">
        <!-- 新增按鈕 -->
        <div class="flex justify-end">
          <a-button type="primary" size="small" @click="openAddProductDialog"> <i class="ri-add-line mr-1" />{{ t('addProduct', '新增商品') }} </a-button>
        </div>

        <!-- 商品卡片列表 -->
        <div v-for="(row, index) in editedProducts" :key="row.rowKey" class="rounded-md border bg-gray-50 p-3">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <a-tag :color="getProductCategoryColor(row.productCategory)" size="small">{{ row.productCategory || '—' }}</a-tag>
              <span class="font-medium">{{ row.productName }}</span>
            </div>
            <a-button type="text" size="small" status="danger" @click="handleDeleteRow(index)">
              <i class="ri-delete-bin-line" />
            </a-button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <AFormItem :label="t('customer', '客戶')" class="col-span-2">
              <InfiniteSelect
                v-model="row.customerId"
                dataSource="customers"
                :placeholder="row.customerName || t('selectCustomer', '選擇客戶')"
                type="outline"
                allowClear
                @change="(val) => handleCustomerChange(index, val)"
                :filters="{ deliveryDays: basicForm.deliveryDays }"
              />
            </AFormItem>
            <AFormItem :label="t('quantity', '數量')">
              <TinyInput type="number" v-model="row.quantity" min="0" @change="() => recalculateRow(index)" />
            </AFormItem>
            <AFormItem :label="t('unitPrice', '單價')">
              <TinyInput type="number" v-model="row.unitPrice" min="0" @change="() => recalculateRow(index)" />
            </AFormItem>
            <AFormItem :label="t('amount', '金額')">
              <p class="h-8 leading-8 text-right text-gray-600">NT$ {{ formatNumber(row.amount) }}</p>
            </AFormItem>
            <AFormItem :label="t('actualPayment', '實際收付')">
              <TinyInput type="number" v-model="row.actualAmount" min="0" />
            </AFormItem>
            <AFormItem :label="t('paymentMethod', '付款方式')">
              <TinySelect v-model="row.paymentMethod" :options="paymentOptions" />
            </AFormItem>
            <AFormItem :label="t('note', '備註')">
              <TinyInput v-model="row.note" :placeholder="t('enterNote', '輸入備註...')" />
            </AFormItem>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-if="editedProducts.length === 0" class="rounded-md border border-dashed bg-gray-50 p-8 text-center text-gray-400">
          {{ t('noProducts', '尚無商品資料') }}
        </div>
      </div>

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
            <CustomField v-model="fuelExpense" type="number" min="0" thousands allowClear />
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-gray-700">{{ t('otherExpense', '其他支出') }}</span>
            <CustomField v-model="otherExpense" type="number" min="0" thousands allowClear />
          </div>
          <a-divider />
          <div class="flex items-center justify-between text-base font-semibold">
            <p class="text-[18px] text-gray-500">{{ t('金額總計', '金額總計') }}</p>
            <p class="text-xl font-bold text-green-600">NT$ {{ formatNumber(totalActualAmount - fuelExpense - otherExpense) }}</p>
          </div>
        </div>
      </div>
      <!--<div class="mt-4 flex justify-end p-4">
        <div class="grid grid-cols-4 gap-6 text-right">
          <div>
            <p class="text-sm text-gray-500">{{ t('subtotalAmount', '商品總金額') }}</p>
            <p class="text-lg font-medium text-gray-700">NT$ {{ formatNumber(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('actualPaymentTotal', '實際收付') }}</p>
            <p class="text-lg font-semibold text-blue-600">NT$ {{ formatNumber(totalActualAmount) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('totalExpense', '總支出') }}</p>
            <p class="text-lg font-medium text-red-500">NT$ {{ formatNumber(fuelExpense + otherExpense) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ t('estimatedBalance', '預估結餘') }}</p>
            <p class="text-xl font-bold text-green-600">NT$ {{ formatNumber(totalActualAmount - fuelExpense - otherExpense) }}</p>
          </div>
        </div>
      </div>-->
    </CardContent>
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       新增商品彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="addProductDialogVisible" :title="t('addProduct', '新增商品')" width="720px" :closable="false">
    <AForm layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <AFormItem :label="t('selectProduct', '選擇商品')" required>
          <InfiniteSelect v-model="selectedProduct" dataSource="products" :placeholder="t('pleaseSelectProduct', '請選擇商品')" type="outline" />
        </AFormItem>
        <AFormItem :label="t('selectCustomer', '選擇客戶')" required>
          <InfiniteSelect v-model="selectedCustomer" dataSource="customers" :placeholder="t('pleaseSelectCustomer', '請選擇客戶')" type="outline" :filters="{ deliveryDays: basicForm.deliveryDays }" />
        </AFormItem>
        <AFormItem :label="t('quantity', '數量')">
          <TinyInput type="number" v-model="newProductQuantity" min="0" />
        </AFormItem>
        <AFormItem :label="t('unitPrice', '單價')">
          <TinyInput type="number" v-model="newProductUnitPrice" min="0" />
        </AFormItem>
        <AFormItem :label="t('paymentMethod', '付款方式')">
          <TinySelect v-model="newProductPaymentMethod" :options="paymentOptions" />
        </AFormItem>
        <AFormItem :label="t('note', '備註')">
          <TinyInput v-model="newProductNote" :placeholder="t('optional', '選填')" />
        </AFormItem>
      </div>
    </AForm>
    <div v-if="selectedProduct" class="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
      <p>
        <strong>{{ t('selectedProduct', '已選商品：') }}</strong>
        {{ selectedProduct.name }}
      </p>
      <p>
        <strong>{{ t('category', '類別：') }}</strong>
        {{ selectedProduct.category?.name || '—' }}
      </p>
      <p>
        <strong>{{ t('defaultPrice', '預設單價：') }}</strong>
        NT$ {{ formatNumber(selectedProduct.basePriceAmount) }}
      </p>
      <p v-if="customerCustomPrice !== null" class="text-green-700">
        <strong>{{ t('customerCustomPrice', '客戶自定義價格：') }}</strong>
        NT$ {{ formatNumber(customerCustomPrice) }}
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-center gap-2">
        <a-button @click="closeAddProductDialog">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" @click="handleConfirmAddProduct" :disabled="!selectedProduct || !selectedCustomer">{{ t('confirm', '確認') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinyCheckboxGroup, TinyInput, TinySelect } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { DeliveryReportExportGet, DeliveryReportGetById, DeliveryReportUpdatePut } from '@/assets/API/DeliveryReports.js';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import CustomField from '@/components/Form/CustomField.vue';

const props = defineProps({
  uuid: { type: String, default: '' },
});

const router = useRouter();
const systemStore = useSystemStore();
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const { t } = useI18n();
const { paymentOptions, categoryColors, weekDayOptions } = useSelectOptions(); //共用選項

/** 常數相關 **/
const EMPTY_PLACEHOLDER = '—';
const selectedCustomer = ref(null);

/** 共用工具 **/
const formatNumber = (value) => {
  if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
  return Number(value).toLocaleString();
}; //格式化數字
const getProductCategoryColor = (category) => categoryColors[category] || 'gray'; //取得類別顏色
const getCustomPrice = (customer, productId) => {
  const customPrices = customer?.customFields?.customPrices || [];
  // 支援兩種格式：cp.productId 或 cp.product.id
  const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
  return customPrice?.price ?? null;
}; //取得客戶自定義價格

/** 匯出相關 **/
import { useFileExport } from '@/composables/useFileExport.js';
const { downloadFile } = useFileExport();
const exportFile = async () => {
  await downloadFile(DeliveryReportExportGet, basicForm.value.id, 'DownloadFile.xlsx');
};

/** 狀態管理 **/
const saving = ref(false);
const initializeForm = () => ({
  id: '', //報表編號
  uuid: '', //報表UUID
  drivers: null, //司機 { id, name }
  vehicleId: null, //車輛ID
  reportDate: '', //報表日期（格式化後）
  reportDateRaw: '', //報表日期（原始格式，供儲存使用）
  note: '', //備註
  deliveryDays: [], //出貨星期（數字格式，如 [1, 3]）
  products: [], //出貨明細 items
  fuelExpense: 0, //加油支出
  otherExpense: 0, //其他支出
  totalAmount: 0, //總金額
  status: '', //狀態
}); //建立預設表單
const basicForm = ref(initializeForm()); //表單資料
const editedProducts = ref([]);
const fuelExpense = ref(0);
const otherExpense = ref(0);

/** 新增商品彈窗狀態 **/
const addProductDialogVisible = ref(false);
const selectedProduct = ref(null);
const newProductQuantity = ref(1);
const newProductUnitPrice = ref(0);
const newProductPaymentMethod = ref('現金');
const newProductNote = ref('');

/** 計算屬性 **/
const isMobile = computed(() => systemStore.screenWidth < 768); //判斷手機版
const totalAmount = computed(() => editedProducts.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)); //商品總金額
const totalActualAmount = computed(() => editedProducts.value.reduce((sum, p) => sum + Number(p.actualAmount || 0), 0)); //實際收付總額

/** 商品名稱欄位合併設定 **/
const rowSpanConfig = [{ field: 'productName' }];
const customerCustomPrice = computed(() => {
  if (!selectedProduct.value || !selectedCustomer.value) return null;
  return getCustomPrice(selectedCustomer.value, selectedProduct.value.id);
}); //客戶自定義價格（用於顯示）

/** 重新排序商品列表（依商品 ID 排序以便合併顯示） **/
const sortEditedProducts = () => {
  editedProducts.value = [...editedProducts.value].sort((a, b) => {
    const aProductId = a.productId?.id || '';
    const bProductId = b.productId?.id || '';
    return aProductId.localeCompare(bProductId);
  });
};

const getData = async () => {
  if (!props.uuid) {
    await mainStore.SWAL_Error(t('reportNotFound', '找不到報表資料'));
    return;
  }

  mainStore.setLoading(true);
  try {
    const response = await DeliveryReportGetById(props.uuid);
    const data = response?.data?.data;
    basicForm.value = {
      id: data.id,
      reportNumber: data.reportNumber,
      uuid: data.id,
      drivers: { id: data.driverId, name: data.driverName },
      vehicleId: data.vehicleId || null, //車輛ID
      reportDate: timezoneStore.formatDate(data.reportDate) || data.reportDate,
      reportDateRaw: data.reportDate, // 保留原始日期格式供儲存使用
      note: data.note || '',
      deliveryDays: data.deliveryDays || [], //出貨星期
      products: data.items || [],
      fuelExpense: data.fuelExpense || 0,
      otherExpense: data.otherExpense || 0,
      totalAmount: data.totalAmount || 0,
      status: data.status,
    };

    editedProducts.value = (data.items || []).map((item, index) => {
      const product = item.product || null;
      const customer = item.customer || null;
      const unitPrice = item.unitPrice || product?.basePriceAmount || 0;
      const quantity = item.quantity || 0;
      const amount = item.amount || quantity * unitPrice;

      return {
        rowKey: `${item.id || index}-${Date.now()}`,
        id: item.id,
        productId: product, // 完整商品物件（給 InfiniteSelect 使用）
        customerId: customer, // 完整客戶物件（給 InfiniteSelect 使用）
        productName: product?.name || item.productName || '',
        productCategory: product?.categoryName || item.productCategory || '',
        customerName: customer?.name || item.customerName || '',
        quantity,
        unitPrice,
        amount,
        actualAmount: item.actualPaymentAmount || amount || 0,
        paymentMethod: item.paymentMethod || customer?.customFields?.paymentMethod || '現金',
        note: item.note || '',
        isConvertedToOrder: item.isConvertedToOrder || false,
        orderId: item.orderId,
      };
    });

    // 排序讓相同商品排在一起以便合併顯示
    sortEditedProducts();

    fuelExpense.value = data.fuelExpense || 0;
    otherExpense.value = data.otherExpense || 0;
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
}; //載入報表
const handleSave = async () => {
  if (!basicForm.value) return;
  saving.value = true;
  mainStore.setLoading(true);
  try {
    const updateData = {
      reportDate: basicForm.value.reportDateRaw || basicForm.value.reportDate, //報表日期
      driverId: basicForm.value.drivers?.id, //司機ID
      vehicleId: basicForm.value.vehicleId, //車輛ID
      deliveryDays: basicForm.value.deliveryDays, //出貨星期（數字陣列）
      note: basicForm.value.note, //備註
      fuelExpense: Number(fuelExpense.value) || 0, //加油支出
      otherExpense: Number(otherExpense.value) || 0, //其他支出
      items: editedProducts.value.map((item) => ({
        productId: item.productId?.id, //商品ID
        productName: item.productId?.name || item.productName, //商品名稱
        productCategory: item.productId?.categoryName || item.productCategory, //商品類別
        customerId: item.customerId?.id, //客戶ID
        customerName: item.customerId?.name || item.customerName, //客戶名稱
        quantity: Number(item.quantity) || 0, //數量
        unitPrice: Number(item.unitPrice) || 0, //單價
        amount: Number(item.amount) || 0, //金額
        actualPaymentAmount: Number(item.actualAmount) || 0, //實際收付
        paymentMethod: item.paymentMethod || item.customerId?.customFields?.paymentMethod || item.customer?.customFields?.paymentMethod || '現金', //付款方式
        note: item.note || '', //備註
      })), //出貨明細
    };
    await DeliveryReportUpdatePut(basicForm.value.uuid, updateData);
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    saving.value = false;
    mainStore.setLoading(false);
  }
}; //儲存報表

/** 操作區相關 **/
const handleBack = () => router.push({ name: 'delivery-report-new' }); //返回列表

/** 資料列操作相關 **/
const recalculateRow = (index) => {
  const row = editedProducts.value[index];
  const quantity = Number(row.quantity) || 0;
  const unitPrice = Number(row.unitPrice) || 0;
  const amount = quantity * unitPrice;
  row.amount = amount;
  row.actualAmount = amount;
}; //重新計算資料列金額
const handleCustomerChange = (index, customerValue) => {
  if (!customerValue) {
    editedProducts.value[index].customerId = null;
    editedProducts.value[index].customerName = '';
    return;
  }

  const row = editedProducts.value[index];
  row.customerId = customerValue;
  row.customerName = customerValue.name || '';

  //更新付款方式（從客戶自定義欄位取得）
  const paymentMethod = customerValue.customFields?.paymentMethod;
  if (paymentMethod) row.paymentMethod = paymentMethod;

  //檢查是否有該商品的自定義價格
  const productId = row.productId?.id || row.productId;
  if (productId) {
    const customPrice = getCustomPrice(customerValue, productId);
    if (customPrice !== null) {
      row.unitPrice = customPrice;
      const quantity = Number(row.quantity) || 0; //重新計算金額
      row.amount = quantity * customPrice;
      row.actualAmount = row.amount;
    }
  }
}; //變更客戶
const handleDeleteRow = async (index) => {
  await mainStore.SWAL_Confirm({
    title: t('confirmDeleteRow', '確定要刪除此筆記錄嗎？'),
    text: t('cannotUndo', '此操作無法復原'),
    onConfirm: () => {
      editedProducts.value.splice(index, 1);
    },
  });
}; //刪除資料列
const handleClearAll = async () => {
  if (!editedProducts.value.length) return;
  await mainStore.SWAL_Confirm({
    title: t('confirmClearAll', '確定要清除所有商品嗎？'),
    text: t('cannotUndo', '此操作無法復原'),
    onConfirm: () => {
      editedProducts.value = [];
    },
  });
}; //清除全部
const openAddProductDialog = () => {
  selectedProduct.value = null;
  selectedCustomer.value = null;
  newProductQuantity.value = 1;
  newProductUnitPrice.value = 0;
  newProductPaymentMethod.value = '現金';
  newProductNote.value = '';
  addProductDialogVisible.value = true;
}; //開啟新增商品彈窗
const closeAddProductDialog = () => (addProductDialogVisible.value = false); //關閉新增商品彈窗

const handleConfirmAddProduct = () => {
  if (!selectedProduct.value || !selectedCustomer.value) {
    Message.warning(t('selectProductAndCustomer', '請選擇商品和客戶'));
    return;
  }

  const product = selectedProduct.value;
  const customer = selectedCustomer.value;
  const quantity = Number(newProductQuantity.value) || 0;

  //檢查客戶是否有該商品的自定義價格
  const customPrice = getCustomPrice(customer, product.id);
  const basePrice = product.basePriceAmount || 0;
  const unitPrice = Number(newProductUnitPrice.value) || customPrice || basePrice;
  const amount = quantity * unitPrice;

  editedProducts.value.push({
    rowKey: `new-${Date.now()}`,
    id: null,
    productId: product, //商品
    customerId: customer, //客戶
    productName: product.name || '',
    productCategory: product.category?.name || '',
    customerName: customer?.name || '',
    quantity,
    unitPrice,
    amount,
    actualAmount: amount,
    paymentMethod: newProductPaymentMethod.value || customer?.customFields?.paymentMethod || '現金',
    note: newProductNote.value,
  });

  // 重新排序，讓相同商品排在一起
  sortEditedProducts();

  closeAddProductDialog();
  Message.success(t('productAdded', '已新增商品「{name}」', { name: product.name }));
}; //確認新增商品
watch(selectedProduct, (product) => {
  if (!product) {
    newProductUnitPrice.value = 0;
    return;
  }
  const basePrice = product.basePriceAmount || 0;

  //檢查客戶是否有自定義價格
  if (selectedCustomer.value) {
    const customPrice = getCustomPrice(selectedCustomer.value, product.id);
    newProductUnitPrice.value = customPrice !== null ? customPrice : basePrice;
  } else {
    newProductUnitPrice.value = basePrice;
  }
}); //監聽選擇商品變更，自動填入單價
watch(selectedCustomer, (customer) => {
  if (!customer) return;

  // 更新付款方式
  const paymentMethod = customer.customFields?.paymentMethod;
  if (paymentMethod) newProductPaymentMethod.value = paymentMethod;

  // 檢查是否有該商品的自定義價格
  if (selectedProduct.value) {
    const product = selectedProduct.value; // 完整物件
    const customPrice = getCustomPrice(customer, product.id);
    if (customPrice !== null) {
      newProductUnitPrice.value = customPrice;
    }
  }
}); //監聽選擇客戶變更，更新付款方式和自定義價格

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getData();
  await nextTick();
  systemStore.updateTableHeight(680);
});
</script>
