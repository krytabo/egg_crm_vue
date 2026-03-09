# ProductSelectionTable 組件使用說明

## 概述

`ProductSelectionTable` 是一個強大的商品選擇表格組件，用於訂單管理系統中快速批量選擇商品、輸入數量及自定義價格。該組件提供了完整的搜尋、分頁、價格管理和實時計算功能。

## 組件位置

```
src/components/ProductTable/ProductSelectionTable.vue
```

## 核心特性

### ✅ 已實現功能

- **v-model 雙向綁定**：自動同步選中商品和訂單項目
- **實時商品搜尋**：支持按名稱、編碼、描述搜尋
- **分頁載入**：預設每頁 20 筆商品，支持自訂
- **自動滾動加載**：滾動到底部自動載入下一頁
- **動態列顯示**：通過 `visibleColumns` 自訂顯示的欄位
- **數量輸入**：支持直接輸入商品數量（非負數檢驗）
- **自定義價格**：支持為每個商品輸入自訂單價
- **客戶自定義價格**：自動套用目標客戶的商品自定義價格
- **實時計算**：自動計算小計、總項目數、合計金額
- **只讀模式**：支持禁用編輯功能
- **列凍結**：數量、實際單價、小計欄固定在右側

## 基本使用

### 安裝導入

```javascript
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';
```

### 最簡單的使用

```vue
<template>
  <ProductSelectionTable
    v-model="items"
  />
</template>

<script setup>
import { ref } from 'vue';
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';

const items = ref([]);
</script>
```

## Props 配置

| 屬性名 | 類型 | 預設值 | 說明 |
|-------|------|-------|------|
| `modelValue` | `Array` | `[]` | v-model 綁定的訂單項目陣列 |
| `visibleColumns` | `Array` | `['name', 'unit', 'basePriceAmount', 'tags', 'status', 'description', 'primaryVendor', 'isPerishable']` | 要顯示的表格欄位 |
| `showUnitPrice` | `Boolean` | `true` | 是否顯示實際單價和小計欄位 |
| `targetObject` | `Object` | `null` | 目標對象（客戶），用於獲取自定義價格 |
| `readonly` | `Boolean` | `false` | 是否禁用編輯（數量和價格輸入禁用） |
| `pageSize` | `Number` | `20` | 每頁顯示筆數 |
| `categoryId` | `String` | `undefined` | 商品分類 ID，用於篩選特定分類的商品 |

### 可用的列字段 (visibleColumns)

```javascript
// 完整列表：
[
  'name',              // 商品名稱（顯示名稱和編碼）
  'unit',              // 規格
  'basePriceAmount',   // 建議單價
  'tags',              // 標籤
  'status',            // 狀態（ACTIVE/其他）
  'description',       // 商品描述
  'primaryVendor',     // 廠商名稱
  'isPerishable',      // 冷藏需求標記
  'quantity',          // 數量輸入（固定顯示）
  'unitPrice',         // 實際單價（showUnitPrice 時顯示）
  'total'              // 小計（showUnitPrice 時顯示）
]
```

## 完整使用示例

### 訂單新增/編輯頁面集成

```vue
<template>
  <div class="order-form">
    <!-- 訂單基本信息 -->
    <a-form :model="form">
      <a-form-item label="客戶" field="customer">
        <InfiniteSelect
          v-model="form.targetId"
          dataSource="customers"
          @change="onCustomerChange"
        />
      </a-form-item>
    </a-form>

    <!-- 商品選擇表格 -->
    <div class="items-section">
      <h3>訂單項目</h3>
      <ProductSelectionTable
        ref="productSelectionTableRef"
        v-model="form.items"
        :visible-columns="['name', 'unit', 'basePriceAmount', 'tags', 'status', 'primaryVendor']"
        :show-unit-price="true"
        :target-object="form.targetId"
        :readonly="isReadOnly"
        :page-size="20"
      />
    </div>

    <!-- 顯示選中項目 -->
    <div class="items-list">
      <h4>已選商品明細：</h4>
      <ul>
        <li v-for="item in form.items" :key="item.productId">
          {{ item.product?.name }} - 數量：{{ item.quantity }} - 小計：{{ formatCurrency(item.total) }}
        </li>
      </ul>
    </div>

    <!-- 保存按鈕 -->
    <a-button @click="saveOrder">保存訂單</a-button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';

const form = reactive({
  targetId: null,        // 客戶信息：{ id, name }
  items: [],            // 訂單項目
});

const productSelectionTableRef = ref(null);
const isReadOnly = computed(() => false);

// 當客戶改變時，ProductSelectionTable 會自動重新計算自定義價格
const onCustomerChange = (customer) => {
  // 可選：清空之前選中的商品
  // form.items = [];
};

// 保存訂單
const saveOrder = async () => {
  // form.items 已經包含了完整的商品信息
  // 每個 item 的結構：
  // {
  //   productId: "uuid",
  //   product: { id, name, ... },
  //   unit: "規格",
  //   quantity: 1,
  //   basePriceAmount: 100,
  //   unitPrice: { amount: 90, currency: "TWD" },
  //   total: 90
  // }
  
  const payload = {
    customerId: form.targetId.id,
    items: form.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: { amount: item.unitPrice.amount, currency: 'TWD' }
    }))
  };
  
  // API 調用...
  console.log('保存訂單：', payload);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount || 0);
};
</script>

<style scoped>
.order-form {
  padding: 20px;
}

.items-section {
  margin-top: 30px;
  margin-bottom: 20px;
}

.items-list {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.items-list ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.items-list li {
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.items-list li:last-child {
  border-bottom: none;
}
</style>
```

## 編輯現有訂單的流程

當編輯訂單時，需要按以下流程處理：

### 1. 加載訂單資料

```javascript
const editOrder = async (orderId) => {
  const response = await OrderGetByID(orderId);
  const orderData = response.data?.data || response.data;
  
  // 設置客戶信息
  form.targetId = {
    id: orderData.targetId,
    name: orderData.targetName
  };
  
  // 暫存訂單商品
  editingOrderProducts.value = orderData.products || [];
  
  // 打開對話框
  showDialog.value = true;
};
```

### 2. 在 watch 中映射商品

```javascript
watch(
  () => showDialog.value,
  async (newVal) => {
    if (newVal && productSelectionTableRef.value) {
      // 先加載所有商品
      await productSelectionTableRef.value.loadProducts();
      
      // 然後映射訂單商品
      const items = editingOrderProducts.value.map((item) => ({
        productId: item.productId,
        product: item.product || {},
        unit: item.unit || '',
        quantity: item.quantity,
        basePriceAmount: Number(item.retailPrice || 0),
        unitPrice: {
          amount: Number(item.actualPrice || 0),
          currency: 'TWD'
        },
        total: Number(item.actualPrice || 0) * item.quantity
      }));
      
      form.items = items;
      editingOrderProducts.value = [];
    }
  }
);
```

## 與 v-model 的數據結構

### 輸入數據結構 (modelValue)

當通過 v-model 傳入預存的訂單項目時，每個項目應該有以下結構：

```typescript
interface OrderItem {
  productId: string;        // 商品 ID（必須）
  quantity: number;         // 數量（必須）
  unitPrice?: {
    amount: number;         // 實際單價
    currency?: string;      // 幣別（預設 TWD）
  };
  product?: object;         // 完整商品物件（可選）
  unit?: string;           // 規格（可選）
  basePriceAmount?: number; // 建議單價（可選）
  total?: number;          // 小計（可選，自動計算）
}
```

### 輸出數據結構 (emit)

組件會通過 `update:modelValue` 事件輸出以下結構：

```typescript
interface SelectedProduct {
  productId: string;              // 商品 ID
  product: Product;               // 完整商品物件（來自 API）
  unit: string;                   // 規格
  quantity: number;               // 用戶輸入的數量
  basePriceAmount: number;        // 建議單價
  unitPrice: {
    amount: number;               // 實際單價（自定義價格）
    currency: string;             // 幣別
  };
  total: number;                  // 小計（unitPrice.amount * quantity）
}
```

## 自定義價格機制

### 目標客戶的自定義價格

如果傳入 `targetObject` 物件，組件會自動查詢該客戶對應商品的自定義價格：

```javascript
// targetObject 結構（通常是客戶信息）
targetObject = {
  id: "customer-uuid",
  name: "客戶名稱",
  customFields: {
    customPrices: [
      {
        product: { id: "product-uuid" },  // 或 productId: "uuid"
        price: 85  // 自定義價格
      },
      {
        product: { id: "another-uuid" },
        price: 120
      }
    ]
  }
}
```

### 價格優先級

1. **用戶手動輸入的價格** (`customPrices[productId]`) - 最高優先級
2. **客戶自定義價格** (來自 `targetObject.customFields.customPrices`) - 次優先級
3. **商品建議單價** (`product.basePriceAmount`) - 預設

### 當目標客戶改變時

```javascript
// 當 :target-object 改變時，會自動：
// 1. 清空用戶輸入的自定義價格
// 2. 重新計算所有商品價格（套用新客戶的自定義價格）
// 3. 重新計算小計和合計金額
// 4. 觸發 update:modelValue 事件
```

## 暴露的方法

### loadProducts(targetPage, append)

主動觸發加載商品列表的方法。

**參數：**
- `targetPage` (Number): 要載入的頁碼，預設 1
- `append` (Boolean): 是否追加到現有列表，預設 false（替換）

**示例：**

```javascript
// 重新載入第一頁
await productSelectionTableRef.value.loadProducts(1, false);

// 追加下一頁
await productSelectionTableRef.value.loadProducts(2, true);
```

## 搜尋和篩選

### 自動搜尋

當用戶在搜尋框輸入關鍵字時，組件會自動：
1. 觸發 API 搜尋
2. 重新載入第一頁
3. 在客戶端再次篩選（支援名稱、編碼、描述）

```javascript
// 搜尋範圍：
// - 商品名稱 (name)
// - 商品編碼 (code)
// - 商品描述 (description)
```

### 分類篩選

通過 `categoryId` 屬性篩選特定分類的商品：

```vue
<ProductSelectionTable
  v-model="items"
  :category-id="selectedCategory.id"
/>
```

## 事件

### update:modelValue

當選中的商品、數量或價格改變時觸發，輸出當前選中的所有商品列表。

```javascript
// 父組件可以監聽
<ProductSelectionTable
  :modelValue="items"
  @update:modelValue="(newItems) => { items = newItems }"
/>

// 或使用 v-model
<ProductSelectionTable v-model="items" />
```

## 計算欄位

組件內部提供了以下計算欄位，可以在模板中引用：

### 在組件內部（不直接暴露）

- **`totalItemCount`**: 選中商品的總數量
- **`totalAmount`**: 選中商品的合計金額
- **`hasSelectedItems`**: 是否有選中的商品

### 從父組件訪問

```javascript
// 從 v-model 綁定的 items 陣列計算
const totalItems = computed(() => {
  return form.items.reduce((sum, item) => sum + item.quantity, 0);
});

const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + item.total, 0);
});
```

## 只讀模式

將 `readonly` 屬性設為 `true` 以禁用所有編輯功能：

```vue
<ProductSelectionTable
  v-model="items"
  :readonly="true"
/>
```

在只讀模式下：
- 數量輸入欄禁用
- 實際單價輸入欄禁用
- 用戶仍然可以搜尋和瀏覽商品

## API 調用

組件使用 `ProductListGet` API 來加載商品列表。

### API 參數

```typescript
interface ProductListRequest {
  page?: number;              // 頁碼，預設 1
  limit?: number;             // 每頁筆數，預設 20
  search?: string;            // 搜尋關鍵字
  status?: string;            // 狀態篩選（預設 'ACTIVE'）
  categoryId?: string;        // 分類篩選（可選）
}
```

### API 回應格式

組件透過 `normalizeResponse()` 方法支援多種 API 回應格式：

```typescript
// 支援的格式：
// 1. 標準分頁格式
{
  data: {
    data: [...],
    meta: { total: 100 }
  }
}

// 2. 簡化格式
{
  data: [...]
}

// 3. 直接陣列
[...]
```

## 實際整合示例 - 訂單系統

### 新增訂單流程

```javascript
// pages/Orders/DataList.vue
const openCreateDialog = () => {
  dialogMode.value = 'create';
  basicForm.value = {
    targetId: null,
    items: [],
    // ... 其他欄位
  };
  dialogVisible.value = true;
};

// watch 會自動觸發商品加載
watch(() => dialogVisible.value, async (newVal) => {
  if (newVal) {
    await productSelectionTableRef.value.loadProducts();
  }
});
```

### 編輯訂單流程

```javascript
const editData = async (row) => {
  const response = await OrderGetByID(row.id);
  const orderData = response.data?.data;
  
  // 暫存訂單商品
  editingOrderProducts.value = orderData.products || [];
  
  // 設置基本信息
  basicForm.value = {
    targetId: { id: orderData.targetId, name: orderData.targetName },
    items: [],
    // ... 其他欄位
  };
  
  dialogVisible.value = true;
};

// 在 watch 中進行映射
watch(
  () => dialogVisible.value,
  async (newVal) => {
    if (newVal && editingOrderProducts.value.length > 0) {
      await productSelectionTableRef.value.loadProducts();
      
      const items = editingOrderProducts.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: { amount: item.actualPrice || 0 },
        unit: item.unit,
        basePriceAmount: item.retailPrice || 0,
        total: (item.actualPrice || 0) * item.quantity,
      }));
      
      basicForm.value.items = items;
      editingOrderProducts.value = [];
    }
  }
);
```

### 保存訂單

```javascript
const saveOrder = async () => {
  const payload = {
    customerId: extractUUID(basicForm.value.targetId),
    items: basicForm.value.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: {
        amount: item.unitPrice.amount,
        currency: 'TWD'
      }
    }))
  };
  
  await OrderCreatePost(payload);
};
```

## 性能考慮

### 分頁載入

組件預設每頁 20 筆商品，可以透過 `pageSize` 自訂：

```vue
<!-- 每頁 30 筆 -->
<ProductSelectionTable
  v-model="items"
  :page-size="30"
/>
```

### 自動滾動加載

當用戶滾動表格到底部時，會自動加載下一頁，提供類似無限滾動的體驗。

### 優化建議

1. **限制列顯示**：根據實際需求只顯示必要的欄位
   ```vue
   :visible-columns="['name', 'unit', 'quantity']"
   ```

2. **禁用不需要的功能**：例如不需要自定義價格時
   ```vue
   :show-unit-price="false"
   ```

3. **設置合理的分頁大小**：根據網路速度和業務需求調整

## 常見問題

### Q1: 如何在選中商品後禁止編輯？

A: 使用 `readonly` 屬性：

```vue
<ProductSelectionTable
  v-model="items"
  :readonly="isSubmitted"
/>
```

### Q2: 如何只顯示特定分類的商品？

A: 使用 `categoryId` 屬性：

```vue
<ProductSelectionTable
  v-model="items"
  :category-id="props.categoryId"
/>
```

### Q3: 如何清空選中的商品？

A: 直接修改 v-model 綁定的陣列：

```javascript
// 清空
items.value = [];

// 或者部分清空
items.value = items.value.filter(item => item.productId !== '要刪除的ID');
```

### Q4: 如何在保存前驗證選中的商品？

A: 檢查 v-model 綁定的陣列：

```javascript
if (form.items.length === 0) {
  alert('請至少選擇一個商品');
  return false;
}
```

### Q5: 自定義價格為什麼沒有生效？

A: 確認以下幾點：

1. `targetObject` 結構正確，包含 `customFields.customPrices` 陣列
2. `customPrices` 中的 `product.id` 或 `productId` 與商品 ID 匹配
3. 檢查控制台是否有錯誤訊息

### Q6: 編輯訂單時，原來的數量和價格為什麼沒有顯示？

A: 確認數據映射正確，特別是：

1. `productId` 必須與 API 返回的商品 ID 一致
2. 必須在 `loadProducts()` 完成後才設置 `items`
3. 檢查 `unitPrice.amount` 是否有正確的數值

## 開發建議

### 調試技巧

```javascript
// 在父組件中監聽 v-model 變化
watch(
  () => form.items,
  (newItems) => {
    console.log('選中的商品更新：', newItems);
  },
  { deep: true }
);
```

### 聯合使用 InfiniteSelect 的範例

```vue
<template>
  <!-- 客戶選擇 -->
  <InfiniteSelect
    v-model="form.targetId"
    dataSource="customers"
    @change="onCustomerChange"
  />

  <!-- 商品選擇 -->
  <ProductSelectionTable
    ref="productSelectionTableRef"
    v-model="form.items"
    :target-object="form.targetId"
  />
</template>
```

## 版本信息

- **組件版本**: 1.0.0
- **最後更新**: 2026-02-07
- **相容性**: Vue 3.x + Arco Design Vue 2.x+

## 相關組件

- **InfiniteSelect** (`src/components/Form/InfiniteSelect.vue`): 搭配使用的下拉選擇組件
- **OrderManagement** (`src/pages/Orders/DataList.vue`): 實際應用示例

## 許可證

MIT
