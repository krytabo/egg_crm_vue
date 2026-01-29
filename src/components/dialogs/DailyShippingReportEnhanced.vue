<!-- src/components/dialogs/DailyShippingReportEnhanced.vue 新增彈窗 -->
<template>
  <a-modal v-model:visible="props.modelValue" :title="t('addDriverDeliveryReport', '新增司機出貨日報表')" :width="1020" :render-to-body="false">
    <div class="max-h-[600px] px-1">
      <div v-if="step === 'setup'" class="space-y-4">
        <!-- 司機與星期選擇 -->
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-xs text-gray-500">{{ t('deliveryDriver', '送貨司機') }} *</p>
            <InfiniteSelect v-model="selectedDriver" dataSource="drivers" :placeholder="t('pleaseSelectDriver', '請選擇司機')" type="outline" allowClear />
          </div>
          <div>
            <p class="text-xs text-gray-500">{{ t('deliveryDaysMultiple', '出貨星期（可多選）') }} *</p>
            <div class="flex flex-wrap gap-2">
              <TinyButton v-for="day in weekDayOptions" :key="day.label" size="small" :type="selectedWeekDays.includes(day.label) ? 'primary' : 'text'" @click="toggleWeekDay(day.label)">{{
                day.text
              }}</TinyButton>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <!-- 商品選擇區塊（使用無限捲軸組件） -->
          <div class="rounded border p-3 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <TinySelect v-model="selectedCategory" :options="productCategoryFilters" :placeholder="t('selectCategory', '選擇分類')" />
              <div class="space-x-1">
                <TinyButton v-for="category in quickSelectCategories" :key="category" size="small" type="text" @click="handleQuickSelectCategory(category)"
                  >{{ t('quick', '快速') }}：{{ category }}</TinyButton
                >
              </div>
              <span class="ml-auto text-xs text-gray-500"> {{ t('selectedProducts', '已選擇 {count} 項商品', { count: selectedProducts.length }) }} </span>
            </div>
            <InfiniteScrollList
              ref="productListRef"
              :fetcher="ProductListGet"
              :item-formatter="formatProduct"
              :filter-fn="filterProduct"
              :filters="productFilters"
              :selected-values="selectedProductIds"
              value-key="id"
              label-key="name"
              description-key="categoryName"
              :limit="20"
              :search-placeholder="t('searchProduct', '搜尋商品...')"
              :empty-text="t('noProducts', '查無商品')"
              max-height="250px"
              @toggle="handleProductToggle"
              @loaded="handleProductListLoaded"
            >
              <template #item="{ item, selected }">
                <div class="flex flex-1 flex-col">
                  <span class="text-sm font-medium">{{ item.name }}</span>
                  <span class="text-xs text-gray-500">{{ item.categoryName }}</span>
                </div>
              </template>
            </InfiniteScrollList>
          </div>

          <!-- 已選商品的客戶選擇（使用無限捲軸組件） -->
          <perfect-scrollbar class="flex flex-col gap-1 flex-1 h-[470px]">
            <div v-for="item in selectedProducts" :key="item.productId" class="rounded border p-3" :class="{ 'border-red-300 bg-red-50': !item.customerIds.length }">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-medium">
                  {{ item.productName }}
                  <span class="text-xs text-gray-400">({{ item.categoryName }})</span>
                </h3>
                <span class="text-xs" :class="item.customerIds.length ? 'text-green-600' : 'text-red-500'">
                  {{ item.customerIds.length ? t('selectedCustomersCount', '已選擇 {count} 位客戶', { count: item.customerIds.length }) : t('noCustomerSelected', '⚠ 尚未選擇客戶') }}
                </span>
              </div>
              <InfiniteScrollList
                :ref="(el) => setCustomerListRef(item.productId, el)"
                :fetcher="CustomersListGet"
                :item-formatter="formatCustomer"
                :filter-fn="filterCustomer"
                :filters="getCustomerFilters(item.categoryName)"
                :selected-values="getProductSelection(item.productId)?.customerIds || []"
                value-key="id"
                label-key="name"
                :limit="20"
                :search-placeholder="t('searchCustomer', '搜尋客戶...')"
                :empty-text="t('noMatchingCustomers', '沒有符合條件的客戶（需同時符合出貨星期與商品類別）')"
                max-height="250px"
                @toggle="(customer) => handleCustomerListToggle(item.productId, customer)"
              >
                <template #item="{ item: customer, selected }">
                  <div class="flex flex-1 flex-col">
                    <p class="text-sm font-medium">{{ customer.name }}</p>
                    <p class="text-xs text-gray-500">{{ customer.typeLabel }} · {{ customer.paymentMethod }}</p>
                    <p class="text-xs text-gray-400">{{ t('schedule', '排程') }}：{{ customer.deliveryDaysLabels || '—' }}</p>
                  </div>
                </template>
              </InfiniteScrollList>
            </div>
          </perfect-scrollbar>
        </div>
      </div>

      <!-- 摘要預覽步驟 -->
      <div v-else class="space-y-4">
        <div class="rounded border p-3">
          <p class="text-sm text-gray-500">{{ t('driver', '司機') }}：{{ selectedDriver?.fullName || selectedDriver?.name || t('notSelected', '未選擇') }}</p>
          <p class="text-sm text-gray-500">{{ t('deliveryDays', '出貨星期') }}：{{ formatWeekDays(selectedWeekDays) }}</p>
          <p class="text-sm text-gray-500">{{ t('totalProducts', '總商品') }}：{{ selectedProducts.length }}，{{ t('totalCustomers', '總客戶') }}：{{ totalSelectedCustomers }}</p>
        </div>
        <div class="rounded border">
          <table class="min-w-full divide-y text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-3 py-2 text-left">{{ t('product', '商品') }}</th>
                <th class="px-3 py-2 text-left">{{ t('customerList', '客戶列表') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="item in selectedProducts" :key="item.productId">
                <td class="px-3 py-2">{{ item.productName }}</td>
                <td class="px-3 py-2 text-sm text-gray-700">
                  <span v-for="customerId in item.customerIds" :key="customerId" class="mr-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    {{ getCustomerName(customerId) }}
                    <TinyBadge type="info">{{ getCustomerPaymentMethod(customerId) }}</TinyBadge>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <TinyButton type="text" @click="closeDialog">{{ t('close', '關閉') }}</TinyButton>
        <div v-if="step === 'summary'" class="flex gap-2">
          <!--<TinyButton type="text" @click="handleDownloadCsv">{{ t('exportCsv', '匯出 CSV') }}</TinyButton>-->
          <!--<TinyButton type="text" @click="handlePrintPreview"> <IconPrintPreview class="tiny-svg-size mr-1" /> {{ t('printPreview', '預覽列印') }} </TinyButton>-->
          <TinyButton type="primary" @click="handleConfirmReport">{{ t('confirmSubmit', '確認送出') }}</TinyButton>
        </div>
        <TinyButton v-else type="primary" :disabled="!canGenerateReport" @click="handleGenerateReport">{{ t('generateReport', '產生報表') }}</TinyButton>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Button as TinyButton, Select as TinySelect, Badge as TinyBadge } from '@opentiny/vue';
import { IconPrintPreview } from '@opentiny/vue-icon';
import Notify from '@opentiny/vue-notify';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import InfiniteScrollList from '@/components/Form/InfiniteScrollList.vue';
import { ProductListGet } from '@/assets/API/Product';
import { CustomersListGet } from '@/assets/API/Customers';
import { DriverListGet } from '@/assets/API/Drivers';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useI18n } from 'vue-i18n';

const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'report-created']);

const { t } = useI18n();
const { weekDayOptions, paymentOptions, customerCategories, formatWeekDays } = useSelectOptions();

/** 常數資料 - 產品分類篩選選項 **/
const productCategoryFilters = computed(() => [{ label: t('all', '全部'), value: 'ALL' }, ...customerCategories.value.map((c) => ({ label: c.label, value: c.label }))]);
const quickSelectCategories = computed(() => customerCategories.value.map((c) => c.label));

/** 狀態管理 - 步驟與選擇 **/
const step = ref('setup');
const selectedDriver = ref(null);
const selectedWeekDays = ref([]);
const selectedCategory = ref('ALL');
const selectedProducts = ref([]); // { productId, productName, categoryName, customerIds: [] }
const reportData = ref(null);

/** 狀態管理 - API 資料 **/
const drivers = ref([]); // 用於查找司機的 position-based ID
const productListRef = ref(null); // 商品列表組件 ref
const customerListRefs = ref({}); // 儲存各產品的客戶列表組件 ref

/** 重設狀態 **/
const resetState = () => {
  step.value = 'setup';
  selectedDriver.value = null;
  selectedWeekDays.value = [];
  selectedCategory.value = 'ALL';
  selectedProducts.value = [];
  reportData.value = null;
  customerListRefs.value = {};
};

/** 商品列表格式化函式（用於 InfiniteScrollList） **/
let productIndexCounter = 0; // 用於追蹤 position-based ID
const formatProduct = (item) => {
  productIndexCounter += 1;
  return {
    id: item.id,
    numericId: productIndexCounter, // 後端 API 需要的數字 ID（1-indexed）
    name: item.name,
    productCode: item.productCode,
    categoryId: item.categoryId,
    categoryName: item.category?.name || '未分類',
    unitPrice: item.basePriceAmount || item.basePrice?.amount || 0,
  };
};

/** 商品列表篩選函式（分類篩選，搜尋由組件內部 API 處理） **/
const filterProduct = (product, filters) => {
  // 分類篩選
  if (filters.category && filters.category !== 'ALL') {
    if (product.categoryName !== filters.category) return false;
  }
  return true;
};

/** 客戶列表格式化函式（用於 InfiniteScrollList） **/
const formatCustomer = (item) => {
  const customFields = item.customFields || {};
  return {
    id: item.id,
    businessId: item.businessId,
    name: item.name || item.shortName,
    type: item.type,
    typeLabel: item.type === 'COMPANY' ? t('typeCompany', '公司') : item.type === 'INDIVIDUAL' ? t('typeIndividual', '個人') : item.type,
    deliveryDays: item.deliveryDays || [], // 數字格式 [1, 3, 5]
    deliveryDaysLabels: formatWeekDays(item.deliveryDays), // 顯示用文字
    categories: customFields.categories || [],
    paymentMethod: customFields.paymentMethod || t('notSet', '未設定'),
    customPrices: customFields.customPrices || [], // 自定義價格
  };
};

/** 取得客戶自定義價格 **/
const getCustomPrice = (customer, productId) => {
  const customPrices = customer?.customPrices || customer?.customFields?.customPrices || [];
  // 支援兩種格式：cp.productId 或 cp.product.id
  const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
  return customPrice?.price ?? null;
};

/** 客戶列表篩選函式 **/
const filterCustomer = (customer, filters) => {
  // 條件1：檢查送貨星期（數字格式比對）
  if (filters.deliveryDays?.length > 0) {
    const hasMatchingDay = customer.deliveryDays?.some((day) => filters.deliveryDays.includes(day));
    if (!hasMatchingDay) return false;
  }
  // 條件2：檢查客戶類別是否包含該產品分類
  if (filters.productCategory) {
    const hasMatchingCategory = customer.categories?.includes(filters.productCategory);
    if (!hasMatchingCategory) return false;
  }
  return true;
};

/** 商品列表載入完成時重設 index counter **/
const handleProductListLoaded = () => {
  // 當重新載入時，組件會重新呼叫 formatter，counter 已在每次 format 時遞增
};

/** 取得司機列表（用於查找 position-based ID） **/
const fetchDrivers = async () => {
  try {
    const response = await DriverListGet({ limit: 100 });
    const data = response.data?.data?.data || response.data?.data || response.data || [];
    // 後端使用 position-based lookup（按 createdAt 排序），所以記錄 numericId
    drivers.value = data.map((item, index) => ({
      id: item.id,
      numericId: index + 1, // 後端 API 需要的數字 ID（1-indexed）
      fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    }));
  } catch (error) {
    console.error('取得司機列表失敗:', error);
  }
};

/** Modal 開啟時載入資料 **/
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetState();
      productIndexCounter = 0; // 重設商品 index counter
      fetchDrivers();
    }
  },
);

/** 初始載入 **/
onMounted(() => {
  if (props.modelValue) {
    fetchDrivers();
  }
});

/** 計算屬性 - 總選中客戶數 **/
const totalSelectedCustomers = computed(() => selectedProducts.value.reduce((sum, item) => sum + item.customerIds.length, 0));

/** 計算屬性 - 商品篩選條件（分類由前端篩選，搜尋由組件內部處理） **/
const productFilters = computed(() => ({
  category: selectedCategory.value,
}));

/** 計算屬性 - 已選商品 ID 列表 **/
const selectedProductIds = computed(() => selectedProducts.value.map((item) => item.productId));

/** 工具函式 - 判斷產品是否已選擇 **/
const isProductSelected = (productId) => selectedProducts.value.some((item) => item.productId === productId);

/** 工具函式 - 取得產品選擇資訊 **/
const getProductSelection = (productId) => selectedProducts.value.find((item) => item.productId === productId);

/** 工具函式 - 從各客戶列表組件取得客戶資訊 **/
const findCustomerFromRefs = (customerId) => {
  // 從任一客戶列表組件中查找客戶資料
  for (const ref of Object.values(customerListRefs.value)) {
    if (ref?.getItemByValue) {
      const customer = ref.getItemByValue(customerId);
      if (customer) return customer;
    }
  }
  return null;
};

/** 工具函式 - 從商品列表組件取得商品資訊 **/
const findProductFromRef = (productId) => {
  return productListRef.value?.getItemByValue(productId);
};

/** 工具函式 - 取得客戶名稱 **/
const getCustomerName = (customerId) => findCustomerFromRefs(customerId)?.name || '未知客戶';

/** 工具函式 - 取得客戶付款方式 **/
const getCustomerPaymentMethod = (customerId) => findCustomerFromRefs(customerId)?.paymentMethod || '未設定';

/** 設定客戶列表組件 ref **/
const setCustomerListRef = (productId, el) => {
  if (el) {
    customerListRefs.value[productId] = el;
  }
};

/** 取得客戶篩選條件（確保 ref 被正確解包） **/
const getCustomerFilters = (productCategory) => ({
  deliveryDays: [...selectedWeekDays.value], // 展開 ref 的值成為新陣列
  productCategory,
});

/** 切換星期選擇 **/
const toggleWeekDay = (day) => {
  selectedWeekDays.value = selectedWeekDays.value.includes(day) ? selectedWeekDays.value.filter((d) => d !== day) : [...selectedWeekDays.value, day];
};

/** 處理商品列表組件的 toggle 事件 **/
const handleProductToggle = (product) => {
  if (isProductSelected(product.id)) {
    selectedProducts.value = selectedProducts.value.filter((item) => item.productId !== product.id);
  } else {
    selectedProducts.value = [
      ...selectedProducts.value,
      {
        productId: product.id,
        productNumericId: product.numericId, // 後端 API 需要的數字 ID
        productName: product.name,
        categoryName: product.categoryName, // 儲存中文分類名稱，用於篩選客戶
        customerIds: [],
      },
    ];
  }
};

/** 切換客戶選擇 **/
const handleCustomerToggle = (productId, customerId) => {
  selectedProducts.value = selectedProducts.value.map((item) => {
    if (item.productId !== productId) return item;
    return item.customerIds.includes(customerId) ? { ...item, customerIds: item.customerIds.filter((id) => id !== customerId) } : { ...item, customerIds: [...item.customerIds, customerId] };
  });
};

/** 處理客戶列表組件的 toggle 事件 **/
const handleCustomerListToggle = (productId, customer) => {
  handleCustomerToggle(productId, customer.id);
};

/** 快速選擇分類（選擇該分類下所有產品） **/
const handleQuickSelectCategory = (categoryName) => {
  const allProducts = productListRef.value?.getAllLoadedItems() || [];
  const categoryProducts = allProducts.filter((product) => product.categoryName === categoryName);
  const allSelected = categoryProducts.every((product) => isProductSelected(product.id));
  if (allSelected) {
    // 取消選擇該分類所有產品
    selectedProducts.value = selectedProducts.value.filter((item) => !categoryProducts.some((product) => product.id === item.productId));
  } else {
    // 選擇該分類所有未選的產品
    const additions = categoryProducts
      .filter((product) => !isProductSelected(product.id))
      .map((product) => ({
        productId: product.id,
        productNumericId: product.numericId, // 後端 API 需要的數字 ID
        productName: product.name,
        categoryName: product.categoryName,
        customerIds: [],
      }));
    selectedProducts.value = [...selectedProducts.value, ...additions];
  }
};

/** 判斷是否可產生報表 **/
const canGenerateReport = computed(
  () => selectedDriver.value && selectedWeekDays.value.length > 0 && selectedProducts.value.length > 0 && selectedProducts.value.every((item) => item.customerIds.length > 0),
);

/** 建立報表資料 Payload **/
const buildReportPayload = () => {
  const driverUuid = selectedDriver.value?.id;
  // const driverInfo = drivers.value.find((d) => d.id === driverUuid);
  // const driverNumericId = driverInfo?.numericId || 1;

  const productsPayload = selectedProducts.value.map((item) => {
    // 從商品列表中取得商品資料
    const product = findProductFromRef(item.productId);

    return {
      productId: item.productId,
      productNumericId: item.productNumericId,
      productName: item.productName,
      productCategory: item.categoryName,
      rows: item.customerIds.map((customerId) => {
        // 從客戶列表組件中查找客戶資料
        const customer = findCustomerFromRefs(customerId);
        // 檢查是否有自定義價格
        const customPrice = getCustomPrice(customer, item.productId);
        const unitPrice = customPrice !== null ? customPrice : product?.unitPrice || 0;

        return {
          customerId: customer?.id || customerId,
          customerBusinessId: customer?.businessId, // 後端 API 需要的數字 ID
          customerName: customer?.name || '',
          paymentMethod: customer?.paymentMethod || t('cash', '現金'),
          unitPrice, // 使用自定義價格或商品預設價格
          hasCustomPrice: customPrice !== null, // 標記是否有自定義價格
        };
      }),
    };
  });
  return {
    driverId: selectedDriver.value?.id,
    // driverNumericId,
    driverName: selectedDriver.value?.fullName || selectedDriver.value?.name || '',
    reportDate: new Date().toISOString().slice(0, 10),
    deliveryDays: [...selectedWeekDays.value], // 數字格式
    weekDayLabel: formatWeekDays(selectedWeekDays.value), // 顯示用文字
    products: productsPayload,
  };
};

/** 產生報表 **/
const handleGenerateReport = () => {
  if (!canGenerateReport.value) {
    Notify({ type: 'warning', title: t('pleaseCompleteSetup', '請完成設定後再產生報表') });
    return;
  }
  const payload = buildReportPayload();
  console.log(1111, payload);
  reportData.value = payload;
  step.value = 'summary';
};

/** 確認送出報表 **/
const handleConfirmReport = () => {
  const payload = reportData.value;
  emit('report-created', payload);
  emit('update:modelValue', false);
  Notify({ type: 'success', title: t('reportGenerated', '已產生報表') });
};

/** 匯出 CSV **/
const handleDownloadCsv = () => {
  Notify({ type: 'info', title: t('csvDownloading', 'CSV 下載中...') });
};

/** 預覽列印 **/
const handlePrintPreview = () => {
  window.print();
  Notify({ type: 'success', title: t('printPreviewSent', '已送出預覽列印') });
};

/** 關閉對話框 **/
const closeDialog = () => {
  emit('update:modelValue', false);
};
</script>
