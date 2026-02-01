<!-- src/components/dialogs/DailyShippingReportEnhanced.vue 新增彈窗 -->
<template>
  <a-modal v-model:visible="props.modelValue" :title="t('addDriverDeliveryReport', '新增司機出貨日報表')" :width="1020" :render-to-body="false" :closable="false">
    <div class="max-h-[600px] px-1">
      <a-form ref="basicDataRef" :model="basicForm" :rules="basicFormRules" layout="vertical">
        <!-- 司機與星期選擇 -->
        <div class="grid gap-4 md:grid-cols-2">
          <a-form-item field="driver" :label="t('deliveryDriver', '送貨司機')">
            <InfiniteSelect v-model="basicForm.driver" dataSource="drivers" :placeholder="t('pleaseSelectDriver', '請選擇司機')" type="outline" allowClear />
          </a-form-item>
          <a-form-item field="weekDays" :label="t('deliveryDaysMultiple', '出貨星期（可多選）')">
            <div class="flex flex-wrap gap-2">
              <a-button v-for="day in weekDayOptions" :key="day.label" size="small" :type="basicForm.weekDays.includes(day.label) ? 'primary' : 'secondary'" @click="toggleWeekDay(day.label)">
                {{ day.text }}
              </a-button>
            </div>
          </a-form-item>
        </div>

        <!-- 選擇模式切換 -->
        <!--<a-form-item>
          <a-radio-group v-model="selectionMode" type="button">
            <a-radio value="batch">{{ t('batchSelectMode', '批量選擇') }}</a-radio>
            <a-radio value="single">{{ t('singleAddMode', '逐筆新增') }}</a-radio>
          </a-radio-group>
        </a-form-item>-->

        <!-- 批量選擇模式 -->
        <div v-if="selectionMode === 'batch'" class="flex gap-2">
          <!-- 商品選擇區塊（使用無限捲軸組件） -->
          <div class="rounded border p-3 w-[320px] flex-shrink-0">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <TinySelect v-model="selectedCategory" :options="productCategoryFilters" :placeholder="t('selectCategory', '選擇分類')" />
              <div class="space-x-1">
                <TinyButton v-for="category in quickSelectCategories" :key="category" size="small" type="text" @click="handleQuickSelectCategory(category)">
                  {{ t('quick', '快速') }}：{{ category }}
                </TinyButton>
              </div>
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
              max-height="380px"
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

          <!-- 已選商品的客戶選擇（使用 Tabs 切換） -->
          <div class="rounded border flex-1 overflow-hidden">
            <div v-if="!basicForm.products.length" class="flex h-full items-center justify-center text-gray-400 p-8">
              {{ t('pleaseSelectProductFirst', '請先從左側選擇商品') }}
            </div>
            <a-tabs v-else v-model:active-key="activeProductTab" type="card-gutter" class="product-customer-tabs">
              <a-tab-pane v-for="item in basicForm.products" :key="item.productId">
                <template #title>
                  <div class="flex items-center gap-1">
                    <span>{{ item.productName }}</span>
                    <a-badge v-if="item.customerIds.length" :count="item.customerIds.length" :dot-style="{ background: '#10b981' }" />
                    <a-button type="text" size="mini" status="danger" class="ml-1 p-0!" @click.stop="handleRemoveProductFromBatch(item.productId)">
                      <i class="ri-close-line text-[14px]" />
                    </a-button>
                  </div>
                </template>
                <div class="p-3">
                  <div class="mb-3 flex items-center justify-between">
                    <span class="text-xs text-gray-500">{{ item.categoryName }}</span>
                    <span class="text-xs" :class="item.customerIds.length ? 'text-green-600' : 'text-gray-400'">
                      {{
                        item.customerIds.length
                          ? t('selectedCustomersCount', '已選擇 {count} 位客戶', { count: item.customerIds.length })
                          : t('noCustomerSelectedOptional', '尚未選擇客戶（將自動排除）')
                      }}
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
                    max-height="350px"
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
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>

        <!-- 逐筆新增模式 -->
        <div v-else class="flex gap-4">
          <!-- 新增/編輯商品表單 -->
          <div class="rounded border p-4 flex flex-col gap-4 min-w-1/2" :class="editingProductId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium">{{ editingProductId ? t('editProduct', '編輯商品') : t('addNewProduct', '新增商品') }}</p>
              <a-button v-if="editingProductId" type="text" status="danger" @click="cancelEdit">
                {{ t('cancelEdit', '取消編輯') }}
              </a-button>
              <a-button v-if="editingProductId" type="text" :disabled="!singleModeProduct || !singleModeCustomers.length" @click="confirmEditProduct">
                <i class="ri-check-line mr-1" />
                {{ t('saveChanges', '儲存變更') }}
              </a-button>
              <a-button v-else type="text" :disabled="!singleModeProduct || !singleModeCustomers.length" @click="confirmAddSingleProduct">
                <i class="ri-add-line mr-1" />
                {{ t('addToList', '加入列表') }}
              </a-button>
            </div>
            <!-- 選擇商品 -->
            <div class="flex flex-col gap-1">
              <p class="text-xs text-gray-500 mb-1">{{ t('selectProduct', '選擇商品') }} *</p>
              <InfiniteSelect
                v-model="singleModeProduct"
                dataSource="products"
                :placeholder="t('pleaseSelect', '請選擇')"
                type="outline"
                :disabled="!!editingProductId"
                allowClear
                @change="handleSingleModeProductChange"
              />
            </div>
            <!-- 選擇客戶 -->
            <div class="flex flex-col gap-1">
              <p class="text-xs text-gray-500 mb-1">{{ t('selectCustomers', '選擇客戶') }}</p>
              <InfiniteSelect
                :key="singleModeCustomerKey"
                v-model="singleModeCustomers"
                :fetcher="singleModeCustomerFetcher"
                :option-formatter="formatCustomerOption"
                :placeholder="canSelectCustomer ? t('pleaseSelect', '請選擇') : t('pleaseSelectWeekDayAndProduct', '請先選擇出貨星期與商品')"
                :disabled="!canSelectCustomer"
                type="outline"
                multiple
                allowClear
              />
            </div>
          </div>

          <!-- 已新增商品列表 -->
          <a-form-item field="products" class="flex-1" :hide-label="true">
            <div class="rounded border p-3 w-full">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium">{{ t('addedProducts', '已新增商品') }}</p>
                <span class="text-xs text-gray-500">{{ basicForm.products.length }} {{ t('items', '項') }}</span>
              </div>
              <div v-if="basicForm.products.length" class="max-h-[200px] overflow-y-auto flex flex-col gap-1">
                <div
                  v-for="item in basicForm.products"
                  :key="item.productId"
                  class="flex rounded-sm w-full items-center justify-between px-4 py-2 cursor-pointer bg-[#f2f3f5] hover:bg-gray-50"
                  :class="{ 'bg-blue-50': editingProductId === item.productId }"
                  @click="editProduct(item)"
                >
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ item.productName }}</p>
                    <p class="text-xs text-gray-500">
                      {{ item.customerIds.length }} {{ t('customers', '位客戶') }}
                      <span v-if="item.customerIds.length">: {{ getCustomerNamesForProduct(item) }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-1">
                    <a-button type="text" size="small" @click.stop="editProduct(item)">
                      <i class="ri-edit-line text-blue-500" />
                    </a-button>
                    <a-button type="text" size="small" @click.stop="removeProduct(item.productId)">
                      <i class="ri-delete-bin-line text-red-500" />
                    </a-button>
                  </div>
                </div>
              </div>
              <div v-else class="w-full flex justify-center py-4 text-gray-500">{{ t('notYetSelected', '尚未選擇') }}</div>
            </div>
          </a-form-item>
        </div>
      </a-form>
    </div>

    <template #footer>
      <div class="flex justify-center gap-2 items-center w-full">
        <a-button @click="closeDialog">{{ t('close', '關閉') }}</a-button>
        <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">{{ t('confirmSubmit', '確認送出') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Button as TinyButton, Select as TinySelect, Badge as TinyBadge } from '@opentiny/vue';
import Notify from '@opentiny/vue-notify';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import InfiniteScrollList from '@/components/Form/InfiniteScrollList.vue';
import { ProductListGet } from '@/assets/API/Product';
import { CustomersListGet } from '@/assets/API/Customers';
import { DriverListGet } from '@/assets/API/Drivers';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/LoadingStore';

const mainStore = useMainStore();
const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'report-created']);

const { t } = useI18n();
const { weekDayOptions, paymentOptions, customerCategories, formatWeekDays } = useSelectOptions();

const productCategoryFilters = computed(() => [{ label: t('all', '全部'), value: 'ALL' }, ...customerCategories.value.map((c) => ({ label: c.label, value: c.label }))]); //產品分類篩選選項
const quickSelectCategories = computed(() => customerCategories.value.map((c) => c.label)); //快速選擇分類
const basicDataRef = ref(null);
const isSubmitting = ref(false);
const basicForm = ref({
  driver: null,
  weekDays: [],
  products: [], //{ productId, productName, categoryName, customerIds: [] }
});
const basicFormRules = computed(() => ({
  driver: [{ required: true, message: t('pleaseSelectDriver', '請選擇司機') }],
  weekDays: [
    {
      required: true,
      validator: (value, callback) => {
        if (!value || value.length === 0) {
          callback(t('pleaseSelectWeekDay', '請選擇出貨星期'));
        } else {
          callback();
        }
      },
    },
  ],
  products: [
    {
      required: true,
      validator: (value, callback) => {
        if (!value || value.length === 0) {
          callback(t('pleaseSelectProduct', '請選擇商品'));
        } else {
          const hasCustomers = value.some((item) => item.customerIds && item.customerIds.length > 0);
          if (!hasCustomers) {
            callback(t('pleaseSelectAtLeastOneCustomer', '請至少為一個商品選擇客戶'));
          } else {
            callback();
          }
        }
      },
    },
  ],
}));

/** 狀態相關 **/
const selectedCategory = ref('ALL');
const selectionMode = ref('batch'); //'batch' 批量選擇 | 'single' 逐筆新增
const activeProductTab = ref(null); //批量模式中當前選中的商品 Tab
const singleModeProduct = ref(null); //當前選擇的商品（完整物件）
const singleModeCustomers = ref([]); //當前選擇的客戶列表（完整物件陣列）
const editingProductId = ref(null); //正在編輯的商品 ID（null 表示新增模式）
const singleModeCustomerKey = ref(0); //用於強制重新渲染客戶選擇器
const drivers = ref([]); //用於查找司機的 position-based ID
const productListRef = ref(null); //商品列表組件
const customerListRefs = ref({}); //儲存各產品的客戶列表組件
let productIndexCounter = 0;

/** Computed 屬性 **/
const totalSelectedCustomers = computed(() => basicForm.value.products.reduce((sum, item) => sum + item.customerIds.length, 0)); //總選中客戶數
const productFilters = computed(() => ({ category: selectedCategory.value })); //商品篩選條件
const selectedProductIds = computed(() => basicForm.value.products.map((item) => item.productId)); //已選商品 ID 列表
const canSelectCustomer = computed(() => basicForm.value.weekDays.length > 0 && !!singleModeProduct.value); //是否可選擇客戶
const productsWithCustomers = computed(() => basicForm.value.products.filter((item) => item.customerIds.length > 0)); //有選擇客戶的商品
const resetState = () => {
  basicForm.value = { driver: null, weekDays: [], products: [] };
  selectedCategory.value = 'ALL';
  selectionMode.value = 'single';
  activeProductTab.value = null;
  singleModeProduct.value = null;
  singleModeCustomers.value = [];
  editingProductId.value = null;
  singleModeCustomerKey.value = 0;
  customerListRefs.value = {};
  isSubmitting.value = false;
}; //重設所有狀態
const formatProduct = (item) => {
  productIndexCounter += 1;
  return {
    id: item.id,
    numericId: productIndexCounter,
    name: item.name,
    productCode: item.productCode,
    categoryId: item.categoryId,
    categoryName: item.category?.name || '未分類',
    unitPrice: item.basePriceAmount || item.basePrice?.amount || 0,
  };
}; //格式化商品資料
const formatCustomer = (item) => {
  const customFields = item.customFields || {};
  return {
    id: item.id,
    businessId: item.businessId,
    name: item.name || item.shortName,
    type: item.type,
    typeLabel: item.type === 'COMPANY' ? t('typeCompany', '公司') : item.type === 'INDIVIDUAL' ? t('typeIndividual', '個人') : item.type,
    deliveryDays: item.deliveryDays || [],
    deliveryDaysLabels: formatWeekDays(item.deliveryDays),
    categories: customFields.categories || [],
    paymentMethod: customFields.paymentMethod || t('notSet', '未設定'),
    customPrices: customFields.customPrices || [],
  };
}; //格式化客戶資料
const formatCustomerOption = (item) => {
  const customFields = item.customFields || {};
  return {
    value: item.id,
    label: item.name || item.shortName || item.id,
    raw: {
      id: item.id,
      name: item.name || item.shortName,
      paymentMethod: customFields.paymentMethod || t('notSet', '未設定'),
      deliveryDays: item.deliveryDays || [],
    },
  };
}; //格式化客戶選項
const normalizeApiResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const totalCount = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total: totalCount };
}; //正規化 API 回應

/** 篩選相關  **/
const filterProduct = (product, filters) => {
  if (filters.category && filters.category !== 'ALL') {
    if (product.categoryName !== filters.category) return false;
  }
  return true;
}; //篩選商品
const filterCustomer = (customer, filters) => {
  if (filters.deliveryDays?.length > 0) {
    const hasMatchingDay = customer.deliveryDays?.some((day) => filters.deliveryDays.includes(day));
    if (!hasMatchingDay) return false;
  }
  if (filters.productCategory) {
    const hasMatchingCategory = customer.categories?.includes(filters.productCategory);
    if (!hasMatchingCategory) return false;
  }
  return true;
}; //篩選客戶
const getCustomerFilters = (productCategory) => ({
  deliveryDays: [...basicForm.value.weekDays],
  productCategory,
}); //取得客戶篩選條件

/** 查詢相關 **/
const isProductSelected = (productId) => basicForm.value.products.some((item) => item.productId === productId); //判斷商品是否已選擇
const getProductSelection = (productId) => basicForm.value.products.find((item) => item.productId === productId); //取得商品選擇資訊
const findCustomerFromRefs = (customerId) => {
  if (customerListRefs.value._singleModeCustomers?.[customerId]) {
    return customerListRefs.value._singleModeCustomers[customerId];
  }
  for (const [key, ref] of Object.entries(customerListRefs.value)) {
    if (key === '_singleModeCustomers') continue;
    if (ref?.getItemByValue) {
      const customer = ref.getItemByValue(customerId);
      if (customer) return customer;
    }
  }
  return null;
}; //從 Refs 中查找客戶資料
const findProductFromRef = (productId) => productListRef.value?.getItemByValue(productId); //從 Ref 中查找商品資料
const getCustomerName = (customerId) => findCustomerFromRefs(customerId)?.name || '未知客戶'; //取得客戶名稱
const getCustomerPaymentMethod = (customerId) => findCustomerFromRefs(customerId)?.paymentMethod || '未設定'; //取得客戶付款方式
const getCustomPrice = (customer, productId) => {
  const customPrices = customer?.customPrices || customer?.customFields?.customPrices || [];
  const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
  return customPrice?.price ?? null;
}; //取得客戶自定義價格
const getCustomerNamesForProduct = (item) => {
  return (
    item.customerIds
      .map((id) => findCustomerFromRefs(id)?.name || '未知')
      .slice(0, 3)
      .join('、') + (item.customerIds.length > 3 ? '...' : '')
  );
}; //取得商品的客戶名稱列表
const setCustomerListRef = (productId, el) => {
  if (el) customerListRefs.value[productId] = el;
}; //設定客戶列表組件 Ref
const fetchDrivers = async () => {
  try {
    const response = await DriverListGet({ limit: 100 });
    const data = response.data?.data?.data || response.data?.data || response.data || [];
    drivers.value = data.map((item, index) => ({
      id: item.id,
      numericId: index + 1,
      fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    }));
  } catch (error) {
    console.error('取得司機列表失敗:', error);
  }
}; //取得司機列表
const handleProductListLoaded = () => {}; //商品列表載入完成

/** 批量選擇模式功能相關 **/
const toggleWeekDay = (day) => {
  basicForm.value.weekDays = basicForm.value.weekDays.includes(day) ? basicForm.value.weekDays.filter((d) => d !== day) : [...basicForm.value.weekDays, day];
}; //切換星期選擇
const handleProductToggle = (product) => {
  if (isProductSelected(product.id)) {
    basicForm.value.products = basicForm.value.products.filter((item) => item.productId !== product.id);
    if (activeProductTab.value === product.id) {
      activeProductTab.value = basicForm.value.products[0]?.productId || null;
    }
  } else {
    basicForm.value.products = [
      ...basicForm.value.products,
      {
        productId: product.id,
        productNumericId: product.numericId,
        productName: product.name,
        categoryName: product.categoryName,
        customerIds: [],
      },
    ];
    activeProductTab.value = product.id;
  }
}; //處理商品切換選擇
const handleRemoveProductFromBatch = (productId) => {
  basicForm.value.products = basicForm.value.products.filter((item) => item.productId !== productId);
  if (activeProductTab.value === productId) {
    activeProductTab.value = basicForm.value.products[0]?.productId || null;
  }
}; //從批量模式移除商品
const handleCustomerToggle = (productId, customerId) => {
  basicForm.value.products = basicForm.value.products.map((item) => {
    if (item.productId !== productId) return item;
    return item.customerIds.includes(customerId) ? { ...item, customerIds: item.customerIds.filter((id) => id !== customerId) } : { ...item, customerIds: [...item.customerIds, customerId] };
  });
}; //切換客戶選擇
const handleCustomerListToggle = (productId, customer) => {
  handleCustomerToggle(productId, customer.id);
}; //處理客戶列表切換
const handleQuickSelectCategory = (categoryName) => {
  const allProducts = productListRef.value?.getAllLoadedItems() || [];
  const categoryProducts = allProducts.filter((product) => product.categoryName === categoryName);
  const allSelected = categoryProducts.every((product) => isProductSelected(product.id));
  if (allSelected) {
    basicForm.value.products = basicForm.value.products.filter((item) => !categoryProducts.some((product) => product.id === item.productId));
  } else {
    const additions = categoryProducts
      .filter((product) => !isProductSelected(product.id))
      .map((product) => ({
        productId: product.id,
        productNumericId: product.numericId,
        productName: product.name,
        categoryName: product.categoryName,
        customerIds: [],
      }));
    basicForm.value.products = [...basicForm.value.products, ...additions];
  }
}; //快速選擇分類下所有商品

/** 逐筆新增模式功能相關 **/
const handleSingleModeProductChange = () => {
  singleModeCustomers.value = [];
}; //商品變更時清空客戶選擇
const singleModeCustomerFetcher = async ({ page, limit, search }) => {
  const params = { page, limit };
  if (search) params.search = search;
  const response = await CustomersListGet(params);
  const { data, total } = normalizeApiResponse(response);
  let filtered = data;
  if (basicForm.value.weekDays.length > 0) {
    filtered = filtered.filter((customer) => {
      const customerDays = customer.deliveryDays || [];
      return customerDays.some((day) => basicForm.value.weekDays.includes(day));
    });
  }
  const productCategory = singleModeProduct.value?.category?.name || singleModeProduct.value?.categoryName;
  if (productCategory) {
    filtered = filtered.filter((customer) => {
      const categories = customer.customFields?.categories || [];
      return categories.includes(productCategory);
    });
  }
  return { data: { data: filtered, total } };
}; //客戶選擇器的 fetcher（帶篩選）
const confirmAddSingleProduct = () => {
  if (!singleModeProduct.value || !singleModeCustomers.value.length) {
    Notify({ type: 'warning', title: t('pleaseSelectProductAndCustomer', '請選擇商品和客戶') });
    return;
  }
  const productId = singleModeProduct.value.id;
  const productName = singleModeProduct.value.name;
  const categoryName = singleModeProduct.value.category?.name || singleModeProduct.value.categoryName || '未分類';
  const customerIds = singleModeCustomers.value.map((c) => c.id);
  const existingIndex = basicForm.value.products.findIndex((item) => item.productId === productId);
  if (existingIndex >= 0) {
    const existingCustomerIds = basicForm.value.products[existingIndex].customerIds;
    const newCustomerIds = customerIds.filter((id) => !existingCustomerIds.includes(id));
    basicForm.value.products[existingIndex].customerIds = [...existingCustomerIds, ...newCustomerIds];
    Notify({ type: 'success', title: t('customersAddedToProduct', '已將客戶加入商品 {product}', { product: productName }) });
  } else {
    basicForm.value.products = [...basicForm.value.products, { productId, productName, categoryName, customerIds }];
    Notify({ type: 'success', title: t('productAdded', '已新增商品 {product}', { product: productName }) });
  }
  singleModeCustomers.value.forEach((customer) => {
    if (!customerListRefs.value._singleModeCustomers) customerListRefs.value._singleModeCustomers = {};
    customerListRefs.value._singleModeCustomers[customer.id] = customer;
  });
  singleModeProduct.value = null;
  singleModeCustomers.value = [];
}; //確認新增單筆商品
const editProduct = (item) => {
  editingProductId.value = item.productId;
  singleModeProduct.value = {
    id: item.productId,
    name: item.productName,
    categoryName: item.categoryName,
    category: { name: item.categoryName },
  };
  const customers = item.customerIds.map((id) => {
    const cachedCustomer = customerListRefs.value._singleModeCustomers?.[id];
    if (cachedCustomer) return cachedCustomer;
    const foundCustomer = findCustomerFromRefs(id);
    return foundCustomer || { id, name: '未知客戶' };
  });
  singleModeCustomers.value = customers;
  singleModeCustomerKey.value++;
}; //編輯已新增的商品
const cancelEdit = () => {
  editingProductId.value = null;
  singleModeProduct.value = null;
  singleModeCustomers.value = [];
}; //取消編輯
const confirmEditProduct = () => {
  if (!singleModeProduct.value || !singleModeCustomers.value.length || !editingProductId.value) {
    Notify({ type: 'warning', title: t('pleaseSelectProductAndCustomer', '請選擇商品和客戶') });
    return;
  }
  const productId = editingProductId.value;
  const customerIds = singleModeCustomers.value.map((c) => c.id);
  const existingIndex = basicForm.value.products.findIndex((item) => item.productId === productId);
  if (existingIndex >= 0) {
    basicForm.value.products[existingIndex].customerIds = customerIds;
    Notify({ type: 'success', title: t('productUpdated', '商品已更新') });
  }
  singleModeCustomers.value.forEach((customer) => {
    if (!customerListRefs.value._singleModeCustomers) customerListRefs.value._singleModeCustomers = {};
    customerListRefs.value._singleModeCustomers[customer.id] = customer;
  });
  editingProductId.value = null;
  singleModeProduct.value = null;
  singleModeCustomers.value = [];
}; //確認編輯商品
const removeProduct = (productId) => {
  if (editingProductId.value === productId) cancelEdit();
  basicForm.value.products = basicForm.value.products.filter((item) => item.productId !== productId);
}; //移除已選商品

/** 表單送出相關 **/
const buildReportPayload = () => {
  const productsPayload = productsWithCustomers.value.map((item) => {
    const product = findProductFromRef(item.productId);
    return {
      productId: item.productId,
      productNumericId: item.productNumericId,
      productName: item.productName,
      productCategory: item.categoryName,
      rows: item.customerIds.map((customerId) => {
        const customer = findCustomerFromRefs(customerId);
        const customPrice = getCustomPrice(customer, item.productId);
        const unitPrice = customPrice !== null ? customPrice : product?.unitPrice || 0;
        return {
          customerId: customer?.id || customerId,
          customerBusinessId: customer?.businessId,
          customerName: customer?.name || '',
          paymentMethod: customer?.paymentMethod || t('cash', '現金'),
          unitPrice,
          hasCustomPrice: customPrice !== null,
        };
      }),
    };
  });
  return {
    driverId: basicForm.value.driver?.id,
    driverName: basicForm.value.driver?.fullName || basicForm.value.driver?.name || '',
    reportDate: new Date().toISOString().slice(0, 10),
    deliveryDays: [...basicForm.value.weekDays],
    weekDayLabel: formatWeekDays(basicForm.value.weekDays),
    products: productsPayload,
  };
}; //建立報表資料 Payload
const handleSubmit = async () => {
  const valid = await basicDataRef.value?.validate();
  if (valid) return false;
  try {
    isSubmitting.value = true;
    const payload = buildReportPayload();
    emit('report-created', payload);
    emit('update:modelValue', false);
    await mainStore.SWAL_Success(t('reportGenerated', '已產生報表'));
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSubmitting.value = false;
  }
}; //送出表單
const closeDialog = () => {
  emit('update:modelValue', false);
}; //關閉對話框

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetState();
      productIndexCounter = 0;
      fetchDrivers();
    }
  },
);
onMounted(() => {
  if (props.modelValue) fetchDrivers();
});
</script>

<style scoped>
/* 商品客戶選擇 Tabs 樣式 */
.product-customer-tabs {
  height: 100%;
}

.product-customer-tabs :deep(.arco-tabs-nav) {
  padding: 0 8px;
  background: #f8fafc;
}

.product-customer-tabs :deep(.arco-tabs-tab) {
  padding: 8px 12px;
  font-size: 13px;
}

.product-customer-tabs :deep(.arco-tabs-content) {
  padding: 0;
  height: calc(100% - 46px);
  overflow: hidden;
}

.product-customer-tabs :deep(.arco-tabs-pane) {
  height: 100%;
  overflow-y: auto;
}
</style>
