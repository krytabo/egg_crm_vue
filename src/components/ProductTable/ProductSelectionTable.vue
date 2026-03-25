<!-- ProductSelectionTable.vue 商品選擇表格 - 用於訂單中快速批量選擇商品 -->
<template>
  <div class="mb-4 flex items-center gap-3">
    <a-input v-model="searchKeyword" :placeholder="t('pleaseEnterProductName', '請輸入商品名稱或編碼搜尋')" class="flex-1" allow-clear>
      <template #prefix>
        <icon-search />
      </template>
    </a-input>
    <a-spin v-if="loading" size="small" />
  </div>
  <a-table :data="filteredProducts" :pagination="false" :bordered="{ cell: true }" class="products-table" :scroll="{ x: '100%', y: tableScrollY }" :row-class="getRowClass">
    <template #columns>
      <!-- 商品名稱 -->
      <a-table-column v-if="isColumnVisible('name')" :title="t('productName', '商品名稱')" data-index="name" :min-width="150" fixed="left">
        <template #cell="{ record }">
          <div class="font-medium">{{ record.name }}</div>
          <div class="text-xs text-gray-500">{{ record.code }}</div>
        </template>
      </a-table-column>

      <!-- 規格 -->
      <a-table-column v-if="isColumnVisible('unit')" :title="t('unit', '規格')" data-index="unit" :width="80" align="center">
        <template #cell="{ record }">
          {{ record.unit }}
        </template>
      </a-table-column>

      <!-- 建議單價 -->
      <a-table-column v-if="isColumnVisible('basePriceAmount')" :title="t('basePriceAmount', '建議單價')" data-index="basePriceAmount" :width="120" align="right">
        <template #cell="{ record }">
          {{ formatCurrency(record.basePriceAmount) }}
        </template>
      </a-table-column>

      <!-- 標籤 -->
      <a-table-column v-if="isColumnVisible('tags')" :title="t('tags', '標籤')" data-index="tags" :min-width="120">
        <template #cell="{ record }">
          <a-tag v-for="tag in record.tags" :key="tag" size="small">{{ tag }}</a-tag>
        </template>
      </a-table-column>

      <!-- 狀態 -->
      <a-table-column v-if="isColumnVisible('status')" :title="t('status', '狀態')" data-index="status" :width="100" align="center">
        <template #cell="{ record }">
          <a-tag :color="record.status === 'ACTIVE' ? 'green' : 'red'">
            {{ record.status }}
          </a-tag>
        </template>
      </a-table-column>

      <!-- 描述 -->
      <a-table-column v-if="isColumnVisible('description')" :title="t('description', '描述')" data-index="description" :min-width="150">
        <template #cell="{ record }">
          <span class="line-clamp-2">{{ record.description || '-' }}</span>
        </template>
      </a-table-column>

      <!-- 廠商 -->
      <a-table-column v-if="isColumnVisible('primaryVendor')" :title="t('vendor', '廠商')" data-index="primaryVendor" :min-width="120">
        <template #cell="{ record }">
          {{ record.primaryVendor?.name || '-' }}
        </template>
      </a-table-column>

      <!-- 冷藏需求 -->
      <a-table-column v-if="isColumnVisible('isPerishable')" :title="t('needsColdChain', '冷藏')" data-index="isPerishable" :width="80" align="center">
        <template #cell="{ record }">
          <a-tag v-if="record.isPerishable" color="blue">{{ t('yes', '是') }}</a-tag>
          <span v-else class="text-gray-400">-</span>
        </template>
      </a-table-column>

      <!-- 數量（可編輯） -->
      <a-table-column :title="props.quantityTitle || t('quantity', '數量')" data-index="selectedQuantity" :width="150" align="center" fixed="right">
        <template #cell="{ record, rowIndex }">
          <CustomField
            type="number"
            :model-value="selectedItems[record.id] || 0"
            :min="0"
            :step="1"
            :precision="0"
            :readonly="props.readonly"
            @update:model-value="
              (val) => {
                selectedItems[record.id] = val;
                validateQuantity(record.id);
              }
            "
          />
        </template>
      </a-table-column>

      <!-- 實際單價（可編輯） -->
      <a-table-column v-if="showUnitPrice" :title="t('actualUnitPrice', '實際單價')" data-index="customPrice" :width="160" align="right" fixed="right">
        <template #cell="{ record }">
          <CustomField
            type="number"
            :model-value="customPrices[record.id] ?? getProductPrice(record)"
            :min="0"
            :step="0.01"
            :precision="1"
            :readonly="props.readonly"
            @update:model-value="(val) => (customPrices[record.id] = val)"
          />
        </template>
      </a-table-column>

      <!-- 小計（只讀） -->
      <a-table-column v-if="showUnitPrice" :title="t('subtotal', '小計')" data-index="subtotal" :width="130" align="right" fixed="right">
        <template #cell="{ record }">
          <div class="font-medium">
            {{ formatCurrency((customPrices[record.id] ?? getProductPrice(record)) * (selectedItems[record.id] || 0)) }}
          </div>
        </template>
      </a-table-column>

      <!-- 自訂額外欄位 -->
      <a-table-column v-for="col in props.extraColumns" :key="col.key" :title="col.title" :width="col.width || 120" :align="col.align || 'left'" :fixed="col.fixed || null">
        <template #cell="{ record }">
          <CustomField
            v-if="!props.readonly && col.editable !== false && (!col.showWhen || col.showWhen(record))"
            :type="col.type || 'input'"
            :model-value="record[col.key] || ''"
            :readonly="props.readonly"
            @update:model-value="(val) => updateExtraField(record.id, col.key, val)"
          />
          <template v-else>
            {{ record[col.key] || '-' }}
          </template>
        </template>
      </a-table-column>
    </template>
  </a-table>
  <div v-if="showUnitPrice" class="mt-4 flex items-center justify-end gap-6 rounded-md bg-gray-50 p-4">
    <div class="text-right">
      <div class="text-sm text-gray-600">{{ t('totalItems', '總項目數') }}</div>
      <div class="text-2xl font-bold text-gray-900">{{ totalItemCount }}</div>
    </div>
    <div class="text-right">
      <div class="text-sm text-gray-600">{{ t('totalAmount', '合計金額') }}</div>
      <div class="text-2xl font-bold text-green-600">{{ formatCurrency(totalAmount) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { ProductListGet } from '@/assets/API/Product';
import { IconSearch } from '@arco-design/web-vue/es/icon';
import CustomField from '@/components/Form/CustomField.vue';

const { t } = useI18n();
const { height: windowHeight } = useWindowSize();
const tableScrollY = computed(() => Math.max(windowHeight.value - (props.fullscreen ? 310 : 400), 300));
const props = defineProps({
  // 是否全螢幕模式（影響表格高度）
  fullscreen: {
    type: Boolean,
    default: false,
  },
  // 自訂數量欄位標題（如調整類型可改為「調整後數量」）
  quantityTitle: {
    type: String,
    default: null,
  },
  // v-model 綁定的訂單項目
  modelValue: {
    type: Array,
    default: () => [],
  },
  // 顯示的列，不指定則全部顯示
  visibleColumns: {
    type: Array,
    default: () => ['name', 'unit', 'basePriceAmount', 'tags', 'status', 'description', 'primaryVendor', 'isPerishable'],
  },
  // 是否顯示實際單價和小計
  showUnitPrice: {
    type: Boolean,
    default: true,
  },
  // 用於獲取自定義價格的目標對象
  targetObject: {
    type: Object,
    default: null,
  },
  // 是否為只讀模式
  readonly: {
    type: Boolean,
    default: false,
  },
  // 每頁顯示筆數
  pageSize: {
    type: Number,
    default: 20,
  },
  categoryId: { type: String, default: undefined }, //種類
  // 自訂額外欄位（由父組件提供）
  extraColumns: {
    type: Array,
    default: () => [],
    // 欄位格式:
    // {
    //   key: 'fieldName',            // 欄位唯一鍵
    //   title: '欄位名稱',            // 顯示的欄位標題
    //   align: 'right',              // 文字方向（可選）
    //   fixed: 'right',              // 固定列表（可選）
    //   width: 120,                  // 欄位寬度（可選）
    //   type: 'input'|'date-picker', // 欄位類型（可選，預設 input）
    //   editable: true,              // 是否可編輯（可選，預設 true）
    //   showWhen: (item) => true     // 條件函數（可選，何時顯示該欄位）
    // }
  },
});
const emit = defineEmits(['update:modelValue']);

const products = ref([]);
const searchKeyword = ref('');
const selectedItems = ref({});
const customPrices = ref({});
const extraFields = ref({}); //存储额外字段数据：{ productId: { fieldKey: value } }
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const hasMore = ref(true);

const normalizeResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const totalCount = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total: totalCount };
};
const loadProducts = async (targetPage = 1, append = false) => {
  if (loading.value) return;
  loading.value = true;
  try {
    const { data, total: totalCount } = normalizeResponse(
      await ProductListGet({
        page: targetPage,
        limit: props.pageSize,
        status: 'ACTIVE',
        categoryId: props.categoryId,
        ...(searchKeyword.value.trim() && { search: searchKeyword.value.trim() }),
      }),
    );

    total.value = totalCount;
    if (append) {
      const merged = [...products.value];
      data.forEach((item) => {
        if (!merged.some((p) => p.id === item.id)) merged.push(item);
      });
      products.value = merged;
    } else {
      products.value = data;
      page.value = 1;
    }

    hasMore.value = products.value.length < totalCount;
    page.value = targetPage + 1;
  } catch (error) {
    console.error('Failed to load products:', error);
    products.value = [];
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
}; //商品列表
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  await loadProducts(page.value, true);
};

// 處理列表滾動
const handleScroll = (event) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  if (scrollTop + clientHeight >= scrollHeight - 24) {
    loadMore();
  }
};

// 檢查列是否應該顯示
const isColumnVisible = (columnName) => {
  return props.visibleColumns.includes(columnName);
};

// 篩選商品（根據搜尋關鍵字）
const filteredProducts = computed(() => {
  const productList = Array.isArray(products.value) ? products.value : [];
  if (!searchKeyword.value) return productList;
  const keyword = searchKeyword.value.toLowerCase();
  return productList.filter((p) => p.name?.toLowerCase().includes(keyword) || p.code?.toLowerCase().includes(keyword) || p.description?.toLowerCase().includes(keyword));
});

// 監聽搜尋關鍵字，重新加載第一頁
watch(searchKeyword, () => {
  loadProducts(1, false);
});

// 監聽 targetObject 變化，清空自定義價格緩存
watch(
  () => props.targetObject,
  () => {
    // 清空自定義價格，讓它根據新的 targetObject 重新計算
    customPrices.value = {};
    // 觸發 v-model 更新，使用新的價格
    updateModelValue();
  },
  { deep: true },
);

// 驗證數量（確保不小於0）
const validateQuantity = (productId) => {
  if (selectedItems.value[productId] < 0) {
    selectedItems.value[productId] = 0;
  }
};

// 獲取商品價格（優先使用自定義價格，否則使用建議價格）
const getProductPrice = (product) => {
  if (props.targetObject?.customFields?.customPrices) {
    const customPrice = props.targetObject.customFields.customPrices.find((cp) => {
      const cpProductId = typeof cp.product === 'object' ? cp.product?.id : cp.productId;
      return cpProductId === product.id;
    });
    if (customPrice) return Number(customPrice.price) || Number(product.basePriceAmount || 0);
  }
  return Number(product.basePriceAmount || 0);
};

// 判斷該商品是否有客戶自訂價格
const hasCustomPrice = (product) => {
  if (!props.targetObject?.customFields?.customPrices) return false;
  return props.targetObject.customFields.customPrices.some((cp) => {
    const cpProductId = typeof cp.product === 'object' ? cp.product?.id : cp.productId;
    return cpProductId === product.id;
  });
};

const getRowClass = (record) => {
  return hasCustomPrice(record) ? 'custom-price-row' : '';
};

// 格式化貨幣
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// 檢查是否有選中項目
const hasSelectedItems = computed(() => {
  return Object.values(selectedItems.value).some((qty) => qty > 0);
});

// 計算總項目數
const totalItemCount = computed(() => {
  return Object.values(selectedItems.value).reduce((sum, qty) => sum + (qty || 0), 0);
});

// 計算合計金額
const totalAmount = computed(() => {
  return products.value.reduce((sum, product) => {
    const quantity = selectedItems.value[product.id] || 0;
    if (quantity <= 0) return sum;
    const price = customPrices.value[product.id] ?? getProductPrice(product);
    return sum + price * quantity;
  }, 0);
});

// 當數量或價格改變時，實時更新 modelValue
const updateModelValue = () => {
  const selectedProducts = products.value
    .filter((p) => (selectedItems.value[p.id] || 0) > 0)
    .map((product) => {
      const item = {
        productId: product.id,
        product: product,
        unit: product.unit || '',
        quantity: selectedItems.value[product.id],
        basePriceAmount: Number(product.basePriceAmount || 0),
        unitPrice: {
          amount: customPrices.value[product.id] ?? getProductPrice(product),
          currency: product.basePriceCurrency || 'TWD',
        },
        total: (customPrices.value[product.id] ?? getProductPrice(product)) * selectedItems.value[product.id],
      };

      // 添加额外字段
      if (extraFields.value[product.id]) {
        Object.assign(item, extraFields.value[product.id]);
      }

      return item;
    });

  // 避免兩者皆為空時重複 emit（防止 modelValue 重置時的無限迴圈）
  const currentLen = (props.modelValue || []).length;
  if (selectedProducts.length === 0 && currentLen === 0) return;

  emit('update:modelValue', selectedProducts);
};

// 監聽 selectedItems 變化
watch(selectedItems, updateModelValue, { deep: true });

// 監聽 customPrices 變化
watch(customPrices, updateModelValue, { deep: true });

// 監聽 extraFields 變化
watch(extraFields, updateModelValue, { deep: true });

// 更新額外欄位
const updateExtraField = (productId, fieldKey, value) => {
  if (!extraFields.value[productId]) {
    extraFields.value[productId] = {};
  }
  extraFields.value[productId][fieldKey] = value;
};

// 監聽 modelValue，初始化時同步回來
watch(
  () => props.modelValue,
  (newVal) => {
    if (!Array.isArray(newVal)) return;

    if (newVal.length === 0) {
      // 表單重置 - 清除所有內部狀態
      if (Object.keys(selectedItems.value).length > 0 || Object.keys(customPrices.value).length > 0 || Object.keys(extraFields.value).length > 0) {
        selectedItems.value = {};
        customPrices.value = {};
        extraFields.value = {};
      }
      return;
    }

    newVal.forEach((item) => {
      if (item.productId) {
        selectedItems.value[item.productId] = item.quantity || 0;
        if (item.unitPrice?.amount) {
          customPrices.value[item.productId] = item.unitPrice.amount;
        }

        // 初始化額外欄位
        if (props.extraColumns && props.extraColumns.length > 0) {
          if (!extraFields.value[item.productId]) {
            extraFields.value[item.productId] = {};
          }
          props.extraColumns.forEach((col) => {
            if (item[col.key] !== undefined) {
              extraFields.value[item.productId][col.key] = item[col.key];
            }
          });
        }
      }
    });
  },
  { deep: true },
);

// 暴露方法給父組件
defineExpose({
  loadProducts,
});
</script>

<style scoped>
.products-table :deep(.arco-table-cell) {
  padding: 8px 12px;
}

.products-table :deep(.custom-price-row td) {
  background-color: #fffbe6 !important;
}

.products-table :deep(.custom-price-row:hover td) {
  background-color: #fff3cc !important;
}

.products-table .arco-table-hover:not(.arco-table-dragging) .arco-table-tr:not(.arco-table-tr-empty):not(.arco-table-tr-summary):hover .arco-table-td.arco-table-col-fixed-left::before,
.arco-table-hover .arco-table-tr-drag .arco-table-td.arco-table-col-fixed-left::before,
.arco-table-hover:not(.arco-table-dragging) .arco-table-tr:not(.arco-table-tr-empty):not(.arco-table-tr-summary):hover .arco-table-td.arco-table-col-fixed-right::before,
.arco-table-hover .arco-table-tr-drag .arco-table-td.arco-table-col-fixed-right::before :deep(.custom-price-row:hover td) {
  background-color: #fff3cc !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
