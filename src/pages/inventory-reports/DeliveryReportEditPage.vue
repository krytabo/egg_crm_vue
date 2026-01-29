<!-- src/pages/inventory-reports/DeliveryReportEditPage.vue 送貨報表編輯 -->
<template>
  <Card class="min-h-screen bg-gray-50 print:bg-white">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader>
      <div class="flex flex-1 flex-col gap-1">
        <CardTitle>{{ t('商品明細編輯') }}</CardTitle>
        <p v-if="reportData" class="text-sm text-gray-500">{{ reportData.employeeName }} · {{ reportData.reportDate }}（{{ reportData.weekDays }}）</p>
      </div>
      <div class="flex items-center gap-3">
        <a-button @click="handleBack">返回</a-button>
        <a-button @click="handlePrint">列印</a-button>
        <a-button type="primary" @click="handleSave" :loading="saving">儲存</a-button>
        <a-button type="primary" @click="handleAddProductCategory"> <i class="ri-add-line mr-1" /> 新增商品 </a-button>
        <a-button @click="handleToggleAll">{{ allExpanded ? '全部收合' : '全部展開' }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--        找不到報表         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <div v-if="!reportData" class="flex min-h-screen items-center justify-center bg-gray-50">
      <Card class="w-full max-w-md">
        <CardContent class="pt-8">
          <a-empty description="找不到報表資料">
            <a-button type="primary" @click="handleBack"> <i class="ri-arrow-left-line mr-1" /> 返回 </a-button>
          </a-empty>
        </CardContent>
      </Card>
    </div>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         主要內容          -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <div v-else class="mx-auto max-w-7xl px-4 py-6 print:px-8">
      <div class="mb-6 hidden print:block">
        <h1 class="mb-2 text-center text-2xl">出貨日報表</h1>
        <div class="mb-4 flex justify-between text-sm">
          <div>
            <p><strong>報表編號：</strong>#{{ reportData.id }}</p>
            <p><strong>員工姓名：</strong>{{ reportData.employeeName }} (ID: {{ reportData.employeeId }})</p>
          </div>
          <div class="text-right">
            <p><strong>日期：</strong>{{ reportData.reportDate }}</p>
            <p><strong>出貨星期：</strong>{{ reportData.weekDays }}</p>
          </div>
        </div>
        <hr class="border-gray-300" />
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        商品明細表頭        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <div class="print:pb-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <CardTitle class="text-lg">商品明細編輯</CardTitle>
          <div class="flex gap-2 print:hidden">
            <a-button type="primary" @click="handleAddProductCategory"> <i class="ri-add-line mr-1" /> 新增商品 </a-button>
            <a-button @click="handleToggleAll">
              {{ allExpanded ? '全部收合' : '全部展開' }}
            </a-button>
          </div>
        </div>

        <!-- 預計出貨星期設定 -->
        <div class="mt-4 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 print:hidden">
          <div class="flex items-center gap-2 text-amber-900">
            <i class="ri-calendar-check-line" />
            <span class="font-medium">預計出貨星期設定</span>
          </div>
          <div class="flex flex-wrap gap-3">
            <a-checkbox
              v-for="weekDay in weekDayDisplayOptions"
              :key="weekDay"
              :model-value="selectedWeekDays.includes(weekDay)"
              :disabled="originalWeekDays.includes(weekDay)"
              @change="(checked) => handleWeekDayToggle(weekDay, checked)"
            >
              {{ weekDay }}
              <a-tag v-if="originalWeekDays.includes(weekDay)" color="blue" size="small">原始</a-tag>
            </a-checkbox>
          </div>
          <p class="text-xs text-amber-700">藍色標籤為原始設定（無法移除），其他為可調整的出貨星期。</p>
        </div>
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        商品明細內容        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <CardContent>
        <!-- 統計資訊區 -->
        <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 print:hidden">
          <div class="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <p class="mb-1 text-xs text-gray-600">商品類別</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ Object.keys(groupedProducts).length }}
              </p>
            </div>
            <div>
              <p class="mb-1 text-xs text-gray-600">總筆數</p>
              <p class="text-lg font-semibold text-blue-600">{{ editedProducts.length }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs text-gray-600">總數量</p>
              <p class="text-lg font-semibold text-blue-600">{{ totalQuantity }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs text-gray-600">實際收付總額</p>
              <p class="text-lg font-semibold text-blue-600">NT$ {{ formatNumber(totalActualAmount) }}</p>
            </div>
          </div>
        </div>

        <!-- 商品明細列表 -->
        <div class="space-y-4 print:space-y-6">
          <a-collapse v-model:active-key="expandedItems" :bordered="false">
            <a-collapse-item v-for="([productName, products], index) in groupedEntries" :key="index" :name="productName" :header="productName">
              <template #extra>
                <div class="flex items-center gap-2" @click.stop>
                  <a-tag color="blue">{{ products.length }} 筆</a-tag>
                  <a-tag color="orange">NT$ {{ formatNumber(sumProductsField(products, 'actualAmount')) }}</a-tag>
                </div>
              </template>

              <div class="space-y-3">
                <div class="flex justify-end gap-2 print:hidden">
                  <a-button size="small" @click="handleAddCustomer(productName)"> <i class="ri-add-line mr-1" /> 新增客戶 </a-button>
                  <a-button size="small" status="danger" @click="handleDeleteProductCategory(productName)"> <i class="ri-delete-bin-line mr-1" /> 刪除商品 </a-button>
                </div>

                <a-table :data="products" :bordered="false" :pagination="false" size="small">
                  <template #columns>
                    <a-table-column title="客戶" :width="180">
                      <template #cell="{ record }">
                        <InfiniteSelect
                          v-model="record.customerId"
                          dataSource="customers"
                          :placeholder="record.customerName || '選擇客戶'"
                          type="outline"
                          allowClear
                          @change="(val) => handleCustomerChange(record.originalIndex, val)"
                        />
                      </template>
                    </a-table-column>
                    <a-table-column title="數量" :width="100" align="right">
                      <template #cell="{ record }">
                        <TinyInput type="number" :model-value="record.quantity" min="0" @update:model-value="(val) => handleQuantityChange(record.originalIndex, val)" />
                      </template>
                    </a-table-column>
                    <a-table-column title="單價" :width="100" align="right">
                      <template #cell="{ record }">
                        <TinyInput type="number" :model-value="record.unitPrice" min="0" @update:model-value="(val) => handleUnitPriceChange(record.originalIndex, val)" />
                      </template>
                    </a-table-column>
                    <a-table-column title="金額" :width="120" align="right">
                      <template #cell="{ record }">NT$ {{ formatNumber(record.amount) }}</template>
                    </a-table-column>
                    <a-table-column title="實際收付" :width="120" align="right">
                      <template #cell="{ record }">
                        <TinyInput type="number" :model-value="record.actualAmount" min="0" @update:model-value="(val) => handleActualAmountChange(record.originalIndex, val)" />
                      </template>
                    </a-table-column>
                    <a-table-column title="收付方式" :width="100">
                      <template #cell="{ record }">
                        <TinySelect
                          :model-value="record.paymentMethod || record.customerId?.customFields?.paymentMethod || '現金'"
                          :options="paymentOptions"
                          @update:model-value="(val) => handlePaymentMethodChange(record.originalIndex, val)"
                        />
                      </template>
                    </a-table-column>
                    <a-table-column title="備註" min-width="150">
                      <template #cell="{ record }">
                        <TinyInput :model-value="record.note" placeholder="輸入備註..." @update:model-value="(val) => handleNoteChange(record.originalIndex, val)" />
                      </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="60" align="center" class="print:hidden">
                      <template #cell="{ record }">
                        <a-button type="text" size="small" status="danger" @click="handleDeleteCustomer(record.originalIndex)">
                          <i class="ri-delete-bin-line" />
                        </a-button>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>

                <!-- 小計 -->
                <div class="flex justify-end bg-gray-50 px-4 py-2 text-sm">
                  <div class="flex gap-6">
                    <span
                      >小計數量: <strong>{{ sumProductsField(products, 'quantity') }}</strong></span
                    >
                    <span
                      >小計金額: <strong>NT$ {{ formatNumber(sumProductsField(products, 'amount')) }}</strong></span
                    >
                    <span class="text-blue-600"
                      >實際收付: <strong>NT$ {{ formatNumber(sumProductsField(products, 'actualAmount')) }}</strong></span
                    >
                  </div>
                </div>
              </div>
            </a-collapse-item>
          </a-collapse>

          <a-empty v-if="!groupedEntries.length" description="尚未新增商品，請先點選「新增商品」。" />
        </div>

        <!-- 總計區域 -->
        <div class="mt-6 border-t pt-6">
          <div class="flex justify-end">
            <div class="w-full max-w-md space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>商品總金額（參考）</span>
                <span>NT$ {{ formatNumber(totalAmount) }}</span>
              </div>
              <div class="flex items-center justify-between text-base">
                <span class="text-gray-700">實際收付總額</span>
                <span class="font-semibold text-blue-600">NT$ {{ formatNumber(totalActualAmount) }}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-gray-700">加油支出金額</span>
                <TinyInput type="number" class="w-36 text-right" min="0" v-model="fuelExpense" />
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-gray-700">其他支出金額</span>
                <TinyInput type="number" class="w-36 text-right" min="0" v-model="otherExpense" />
              </div>
              <a-divider />
              <div class="flex items-center justify-between text-base font-semibold">
                <span>預估結餘</span>
                <span>NT$ {{ formatNumber(totalActualAmount - fuelExpense - otherExpense) }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--       新增商品彈窗         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <a-modal v-model:visible="showProductDialog" title="新增商品" width="520px">
      <template #footer>
        <a-button @click="closeAddProductDialog">取消</a-button>
        <a-button type="primary" @click="handleConfirmAddProducts" :disabled="!newProduct || !newCustomer"> 確認新增 </a-button>
      </template>

      <AForm layout="vertical">
        <div class="space-y-4">
          <AFormItem label="選擇商品" required>
            <InfiniteSelect v-model="newProduct" dataSource="products" placeholder="請選擇商品" type="outline" />
          </AFormItem>
          <AFormItem label="選擇客戶" required>
            <InfiniteSelect v-model="newCustomer" dataSource="customers" placeholder="請選擇客戶" type="outline" />
          </AFormItem>
          <div class="grid grid-cols-2 gap-4">
            <AFormItem label="數量">
              <TinyInput type="number" v-model="newQuantity" min="0" />
            </AFormItem>
            <AFormItem label="單價">
              <TinyInput type="number" v-model="newUnitPrice" min="0" />
            </AFormItem>
          </div>
          <AFormItem label="付款方式">
            <TinySelect v-model="newPaymentMethod" :options="paymentOptions" />
          </AFormItem>
          <AFormItem label="備註">
            <TinyInput v-model="newNote" placeholder="選填" />
          </AFormItem>
        </div>
      </AForm>

      <!-- 顯示選擇的商品資訊 -->
      <div v-if="newProduct" class="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        <p><strong>已選商品：</strong>{{ newProduct.name }}</p>
        <p><strong>類別：</strong>{{ newProduct.categoryName || '—' }}</p>
        <p><strong>基礎單價：</strong>NT$ {{ formatNumber(newProduct.basePriceAmount) }}</p>
      </div>
    </a-modal>
  </Card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TinyInput, TinySelect } from '@opentiny/vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { useSystemStore } from '@/stores/system';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { DeliveryReportGetById, DeliveryReportUpdatePut } from '@/assets/API/DeliveryReports.js';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  uuid: { type: String, default: '' },
});

const router = useRouter();
const systemStore = useSystemStore();
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const { t } = useI18n();
const { paymentOptions, weekDayOptions } = useSelectOptions();

/** 常數相關 **/
const EMPTY_PLACEHOLDER = '—';
const weekDayDisplayOptions = computed(() => weekDayOptions.value.map((o) => o.text)); //出貨星期選項（顯示用）
// 注意：商品和客戶資料現在由 API 回傳，不再使用 mock 資料
// InfiniteSelect 元件會直接從 dataSource 載入資料

/** 共用工具 **/
const formatNumber = (value) => {
  if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
  return Number(value).toLocaleString();
}; //格式化數字
const sumProductsField = (items, field) => items.reduce((sum, item) => sum + Number(item[field] || 0), 0); //計算欄位總和
const getCustomPrice = (customer, productId) => {
  // 從客戶的自定義價格中取得該商品的價格
  const customPrices = customer?.customFields?.customPrices || [];
  // 支援兩種格式：cp.productId 或 cp.product.id
  const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
  return customPrice?.price ?? null;
}; //取得客戶自定義價格
const getProductName = (item) => item.product?.name || item.productName || ''; //取得商品名稱
const getCustomerName = (item) => item.customer?.name || item.customerName || ''; //取得客戶名稱

/** 狀態管理 **/
const saving = ref(false);
const reportData = ref(null);
const editedProducts = ref([]);
const fuelExpense = ref(0);
const otherExpense = ref(0);
const expandedItems = ref([]);
const showProductDialog = ref(false);
const selectedWeekDays = ref([]);
const originalWeekDays = ref([]);

/** 新增商品彈窗狀態 **/
const newProduct = ref(null);
const newCustomer = ref(null);
const newQuantity = ref(1);
const newUnitPrice = ref(0);
const newPaymentMethod = ref('現金');
const newNote = ref('');

/** 客戶相關 **/
watch(newCustomer, (customer) => {
  if (!customer) return;
  // 更新付款方式
  const paymentMethod = customer.customFields?.paymentMethod;
  if (paymentMethod) {
    newPaymentMethod.value = paymentMethod;
  }
  // 檢查是否有該商品的自定義價格
  if (newProduct.value) {
    const customPrice = getCustomPrice(customer, newProduct.value.id);
    if (customPrice !== null) {
      newUnitPrice.value = customPrice;
    }
  }
}); //監聯客戶變更
const handleAddCustomer = (productName) => {
  // 從現有記錄中取得該商品的資訊
  const sampleProduct = editedProducts.value.find((product) => {
    const name = product.productId?.name || product.productName;
    return name === productName;
  });

  if (!sampleProduct) {
    Message.warning('找不到該商品的資訊');
    return;
  }

  // 取得商品物件和單價
  const productObj = sampleProduct.productId || null;
  const unitPrice = sampleProduct.unitPrice || productObj?.basePriceAmount || 0;

  const newProductRecord = {
    productId: productObj, // 保持完整商品物件
    customerId: null, // 客戶待選擇
    productName: productName,
    productCategory: productObj?.categoryName || sampleProduct.productCategory || '',
    customerName: '',
    quantity: 0,
    unitPrice,
    amount: 0,
    actualAmount: 0,
    paymentMethod: '現金',
    note: '',
  };

  editedProducts.value = [...editedProducts.value, newProductRecord];
  Message.success('已新增客戶記錄，請選擇客戶');
}; //新增客戶到商品
const handleDeleteCustomer = async (index) => {
  try {
    await mainStore.SWAL_Confirm('確定要刪除此客戶記錄嗎？', '此操作無法復原');
    editedProducts.value = editedProducts.value.filter((_, i) => i !== index);
    Message.success('已刪除客戶記錄');
  } catch (error) {
    if (error !== 'cancel') console.error(error);
  }
}; //刪除客戶

/** 計算屬性 **/
const groupedProducts = computed(() =>
  editedProducts.value.reduce((acc, product, index) => {
    // 支援新格式（productId 為物件）和舊格式（productName 為字串）
    const productName = product.productId?.name || product.productName || '未知商品';
    if (!acc[productName]) acc[productName] = [];
    acc[productName].push({ ...product, originalIndex: index });
    return acc;
  }, {}),
); //依商品名稱分組
const groupedEntries = computed(() => Object.entries(groupedProducts.value)); //分組項目
const totalQuantity = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.quantity || 0), 0)); //總數量
const totalActualAmount = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.actualAmount || 0), 0)); //實際收付總額
const totalAmount = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.amount || 0), 0)); //商品總金額
const allExpanded = computed(() => {
  const groupCount = Object.keys(groupedProducts.value).length;
  return groupCount > 0 && expandedItems.value.length === groupCount;
}); //是否全部展開
const loadReport = async () => {
  if (!props.uuid) {
    reportData.value = null;
    editedProducts.value = [];
    mainStore.setLoading(false);
    return;
  }
  mainStore.setLoading(true);
  try {
    const response = await DeliveryReportGetById(props.uuid);
    const data = response?.data?.data;
    if (!data) {
      reportData.value = null;
      editedProducts.value = [];
      return;
    }

    // 解析出貨星期：優先使用 deliveryDaysLabels，其次從 note 欄位解析
    let weekDaysArray = [];
    if (Array.isArray(data.deliveryDaysLabels) && data.deliveryDaysLabels.length > 0) {
      weekDaysArray = data.deliveryDaysLabels;
    } else if (data.note) {
      weekDaysArray = data.note.split('、').filter(Boolean);
    }

    reportData.value = {
      id: data.reportNumber || data.id,
      uuid: data.id,
      employeeId: data.driverId,
      employeeName: data.driverName,
      reportDate: timezoneStore.formatDate(data.reportDate) || data.reportDate,
      weekDays: weekDaysArray.join('、') || data.note || '',
      selectedWeekDays: weekDaysArray,
      products: data.items || [],
      fuelExpense: data.fuelExpense || 0,
      otherExpense: data.otherExpense || 0,
      totalAmount: data.totalAmount || 0,
      status: data.status,
    };

    editedProducts.value = (data.items || []).map((item) => {
      // 取得商品和客戶物件（新格式為物件，舊格式可能為 ID）
      const product = item.product || null;
      const customer = item.customer || null;

      // 載入時使用已儲存的單價，若無則使用商品基礎價格
      // 注意：不要用客戶自定義價格覆蓋已儲存的價格，自定義價格只在新增或變更客戶時套用
      const unitPrice = item.unitPrice || product?.basePriceAmount || 0;
      const quantity = item.quantity || 0;
      const amount = item.amount || quantity * unitPrice;

      return {
        id: item.id,
        productId: product, // 完整商品物件（給 InfiniteSelect 使用）
        customerId: customer, // 完整客戶物件（給 InfiniteSelect 使用）
        productName: product?.name || item.productName || '', // 保留字串供顯示用
        productCategory: product?.categoryName || item.productCategory || '',
        customerName: customer?.name || item.customerName || '', // 保留字串供顯示用
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

    fuelExpense.value = data.fuelExpense || 0;
    otherExpense.value = data.otherExpense || 0;
    selectedWeekDays.value = [...weekDaysArray];
    originalWeekDays.value = [...weekDaysArray];

    // 展開所有商品分類（使用新格式取得商品名稱）
    expandedItems.value = Array.from(new Set((data.items || []).map((item) => item.product?.name || item.productName || '未知商品')));
  } catch (error) {
    console.error('載入報表失敗:', error);
    Message.error('載入報表失敗');
    reportData.value = null;
    editedProducts.value = [];
  } finally {
    mainStore.setLoading(false);
  }
}; //載入報表
const handleSave = async () => {
  if (!reportData.value) return;
  saving.value = true;
  try {
    // 注意：後端期望的是 businessId (number)，不是 UUID
    // 不送 driverId（除非需要更換司機）
    // 不送 totalAmount（由後端計算）
    const updateData = {
      note: selectedWeekDays.value.join('、'),
      fuelExpense: Number(fuelExpense.value) || 0, //加油支出
      otherExpense: Number(otherExpense.value) || 0, //其他支出
      items: editedProducts.value.map((item) => ({
        productId: item.productId?.id, //商品ID
        productName: item.productId?.name, //商品名稱
        productCategory: item.productId?.categoryName, //商品類別
        customerId: item.customerId?.id, //靠戶ID
        customerName: item.customerId?.name, //客戶名稱
        quantity: Number(item.quantity) || 0, //數量
        unitPrice: Number(item.unitPrice) || 0, //單價
        amount: Number(item.amount) || 0, //金額
        actualPaymentAmount: Number(item.actualAmount) || 0, //實際收付
        paymentMethod: item.paymentMethod || item.customerId?.customFields?.paymentMethod || item.customer?.customFields?.paymentMethod || '現金', //付款方式
        note: item.note || '', //備註
      })),
    };
    await DeliveryReportUpdatePut(reportData.value.uuid, updateData);
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    saving.value = false;
  }
}; //儲存報表
const handleToggleAll = () => {
  const groupNames = Object.keys(groupedProducts.value);
  if (!groupNames.length) return;
  expandedItems.value = allExpanded.value ? [] : groupNames;
}; //全部展開/收合

/** 導航相關 **/
const handleBack = () => {
  router.push({ name: 'delivery-report-new' });
}; //返回列表
const handlePrint = () => {
  window.print();
}; //列印

/** 選項相關 **/
const handleWeekDayToggle = (weekDay, checked) => {
  if (originalWeekDays.value.includes(weekDay)) return;
  if (checked) {
    selectedWeekDays.value = [...selectedWeekDays.value, weekDay];
  } else {
    selectedWeekDays.value = selectedWeekDays.value.filter((day) => day !== weekDay);
  }
}; //切換星期

/** 商品明細相關 **/
watch(newProduct, (product) => {
  if (!product) {
    newUnitPrice.value = 0;
    return;
  }
  // 設定基礎單價
  const basePrice = product.basePriceAmount || 0;
  // 檢查客戶是否有自定義價格
  if (newCustomer.value) {
    const customPrice = getCustomPrice(newCustomer.value, product.id);
    newUnitPrice.value = customPrice !== null ? customPrice : basePrice;
  } else {
    newUnitPrice.value = basePrice;
  }
}); //監聽商品變更
const handleQuantityChange = (index, value) => {
  const quantity = Number(value) || 0;
  editedProducts.value[index].quantity = quantity;
  const amount = quantity * Number(editedProducts.value[index].unitPrice || 0);
  editedProducts.value[index].amount = amount;
  editedProducts.value[index].actualAmount = amount;
}; //變更數量
const handleUnitPriceChange = (index, value) => {
  const unitPrice = Number(value) || 0;
  editedProducts.value[index].unitPrice = unitPrice;
  const amount = unitPrice * Number(editedProducts.value[index].quantity || 0);
  editedProducts.value[index].amount = amount;
  editedProducts.value[index].actualAmount = amount;
}; //變更單價
const handleActualAmountChange = (index, value) => {
  editedProducts.value[index].actualAmount = Number(value) || 0;
}; //變更實際收付
const handleCustomerChange = (index, customerValue) => {
  if (!customerValue) {
    editedProducts.value[index].customerId = null;
    editedProducts.value[index].customerName = '';
    return;
  }

  const row = editedProducts.value[index];
  row.customerId = customerValue;
  row.customerName = customerValue.name || '';

  // 更新付款方式（從客戶自定義欄位取得）
  const paymentMethod = customerValue.customFields?.paymentMethod;
  if (paymentMethod) {
    row.paymentMethod = paymentMethod;
  }

  // 檢查是否有該商品的自定義價格
  const productId = row.productId?.id || row.productId;
  if (productId) {
    const customPrice = getCustomPrice(customerValue, productId);
    if (customPrice !== null) {
      row.unitPrice = customPrice;
      // 重新計算金額
      const quantity = Number(row.quantity) || 0;
      row.amount = quantity * customPrice;
      row.actualAmount = row.amount;
    }
  }
}; //變更客戶
const handlePaymentMethodChange = (index, method) => {
  editedProducts.value[index].paymentMethod = method;
}; //變更付款方式
const handleNoteChange = (index, value) => {
  editedProducts.value[index].note = value;
}; //變更備註
const resetAddProductDialog = () => {
  newProduct.value = null;
  newCustomer.value = null;
  newQuantity.value = 1;
  newUnitPrice.value = 0;
  newPaymentMethod.value = '現金';
  newNote.value = '';
}; //重置新增商品彈窗
const handleAddProductCategory = () => {
  resetAddProductDialog();
  showProductDialog.value = true;
}; //開啟新增商品彈窗
const closeAddProductDialog = () => {
  showProductDialog.value = false;
  resetAddProductDialog();
}; //關閉新增商品彈窗
const handleConfirmAddProducts = () => {
  if (!newProduct.value) {
    Message.warning('請選擇商品');
    return;
  }
  if (!newCustomer.value) {
    Message.warning('請選擇客戶');
    return;
  }

  const product = newProduct.value;
  const customer = newCustomer.value;
  const quantity = Number(newQuantity.value) || 0;
  const unitPrice = Number(newUnitPrice.value) || 0;
  const amount = quantity * unitPrice;

  const newProductRecord = {
    productId: product, // 完整商品物件
    customerId: customer, // 完整客戶物件
    productName: product.name || '',
    productCategory: product.categoryName || '',
    customerName: customer.name || '',
    quantity,
    unitPrice,
    amount,
    actualAmount: amount,
    paymentMethod: newPaymentMethod.value || customer.customFields?.paymentMethod || '現金',
    note: newNote.value || '',
  };

  editedProducts.value = [...editedProducts.value, newProductRecord];

  // 展開新增的商品分類
  const productName = product.name || '未知商品';
  if (!expandedItems.value.includes(productName)) {
    expandedItems.value = [...expandedItems.value, productName];
  }

  closeAddProductDialog();
  Message.success(`已新增商品「${productName}」`);
}; //確認新增商品
const handleDeleteProductCategory = async (productName) => {
  try {
    await mainStore.SWAL_Confirm(`確定要刪除所有「${productName}」的記錄嗎？`, '此操作無法復原');
    editedProducts.value = editedProducts.value.filter((product) => {
      const name = product.productId?.name || product.productName;
      return name !== productName;
    });
    expandedItems.value = expandedItems.value.filter((name) => name !== productName);
    Message.success(`已刪除 ${productName}`);
  } catch (error) {
    if (error !== 'cancel') console.error(error);
  }
}; //刪除商品類別

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await loadReport();
  await nextTick();
});
</script>
