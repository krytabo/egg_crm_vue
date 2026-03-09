# ProductSelectionTable - 快速參考

## 最常用的配置

### 基本使用
```vue
<ProductSelectionTable v-model="items" />
```

### 搭配訂單表單
```vue
<ProductSelectionTable
  ref="productSelectionTableRef"
  v-model="form.items"
  :visible-columns="['name', 'unit', 'basePriceAmount', 'tags', 'status']"
  :show-unit-price="true"
  :target-object="form.targetId"
  :readonly="isReadOnly"
/>
```

## Props 速查表

| 屬性 | 類型 | 預設 | 說明 |
|-----|------|------|------|
| `v-model` | Array | [] | 選中的商品項目 |
| `visibleColumns` | Array | 所有欄位 | 要顯示的欄位列表 |
| `showUnitPrice` | Boolean | true | 顯示實際單價和小計 |
| `targetObject` | Object | null | 客戶對象，用於獲取自定義價格 |
| `readonly` | Boolean | false | 禁用編輯 |
| `pageSize` | Number | 20 | 每頁筆數 |
| `categoryId` | String | - | 商品分類篩選 |

## 可用的欄位列表

```javascript
[
  'name',              // 商品名稱
  'unit',              // 規格
  'basePriceAmount',   // 建議單價
  'tags',              // 標籤
  'status',            // 狀態
  'description',       // 描述
  'primaryVendor',     // 廠商
  'isPerishable'       // 冷藏需求
]
```

## v-model 數據結構

### 輸入格式
```javascript
[
  {
    productId: "uuid",
    quantity: 10,
    unitPrice: { amount: 100, currency: "TWD" }
  }
]
```

### 輸出格式（自動添加）
```javascript
[
  {
    productId: "uuid",
    product: { id, name, ... },      // 完整商品物件
    quantity: 10,
    basePriceAmount: 120,
    unit: "顆",
    unitPrice: { amount: 100, currency: "TWD" },
    total: 1000                       // 小計
  }
]
```

## 常用操作

### 主動載入商品
```javascript
await productSelectionTableRef.value.loadProducts(1, false);
```

### 清空選中
```javascript
form.items = [];
```

### 監聽變化
```javascript
watch(() => form.items, (newItems) => {
  console.log('已選商品:', newItems);
}, { deep: true });
```

## 編輯訂單必讀

### 加載訂單後的映射
```javascript
const items = orderData.products.map((item) => ({
  productId: item.productId,
  quantity: item.quantity,
  unitPrice: { amount: item.actualPrice, currency: 'TWD' }
}));
form.items = items;
```

### 編輯時的時序
1. 呼叫 API 獲取訂單
2. 暫存 `orderData.products`
3. 設置 `form.targetId`
4. 設置 `dialogVisible = true`
5. 在 watch(dialogVisible) 中：
   - 呼叫 `loadProducts()`
   - 等待加載完成後映射商品
   - 設置 `form.items = mappedItems`

## 自定義價格

### targetObject 結構
```javascript
{
  id: "customer-id",
  customFields: {
    customPrices: [
      { product: { id: "prod-id" }, price: 90 }
    ]
  }
}
```

### 改變客戶時自動重新計算價格
```javascript
// 當 :target-object 改變時，自動清空用戶輸入的價格，
// 重新計算新客戶的自定義價格
```

## 保存到 API

```javascript
const payload = {
  customerId: form.targetId.id,
  items: form.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: {
      amount: item.unitPrice.amount,
      currency: 'TWD'
    }
  }))
};
```

## 除錯提示

### 商品列表為空？
- ✓ 確認 `loadProducts()` 已呼叫
- ✓ 確認 API 返回正確的數據
- ✓ 檢查 `categoryId` 是否正確

### 編輯時無法顯示原商品？
- ✓ 確認 `productId` 與 API 返回的 ID 一致
- ✓ 確認在 `loadProducts()` 完成後再設置 `items`
- ✓ 查看控制台錯誤訊息

### 自定義價格沒生效？
- ✓ 檢查 `targetObject` 結構是否正確
- ✓ 確認 `customPrices` 中的商品 ID 與表格商品 ID 匹配
- ✓ 檢查 `customFields.customPrices` 陣列是否有數據

## 完整例子

### src/pages/Orders/DataList.vue 中的使用

```vue
<template>
  <ProductSelectionTable
    ref="productSelectionTableRef"
    v-model="basicForm.items"
    :visible-columns="['name', 'unit', 'basePriceAmount', 'tags', 'status', 'primaryVendor', 'isPerishable']"
    :show-unit-price="true"
    :target-object="basicForm.targetId"
    :readonly="!canModifyItems || isReadOnly"
  />
</template>

<script setup>
import ProductSelectionTable from '@/components/ProductTable/ProductSelectionTable.vue';

const basicForm = ref({
  targetId: null,
  items: []
});

const productSelectionTableRef = ref(null);

// 編輯訂單
const editData = async (row) => {
  const response = await OrderGetByID(row.id);
  const orderData = response.data?.data;
  
  editingOrderProducts.value = orderData.products;
  basicForm.value.targetId = { id: orderData.targetId, name: orderData.targetName };
  dialogVisible.value = true;
};

// 在對話框打開時加載商品並映射
watch(
  () => dialogVisible.value,
  async (newVal) => {
    if (newVal) {
      await productSelectionTableRef.value.loadProducts();
      
      if (dialogMode.value === 'edit') {
        const items = editingOrderProducts.value.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: { amount: Number(item.actualPrice || 0), currency: 'TWD' }
        }));
        basicForm.value.items = items;
      }
    }
  }
);

// 保存訂單
const saveData = async () => {
  const payload = {
    customerId: extractUUID(basicForm.value.targetId),
    items: basicForm.value.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: { amount: item.unitPrice.amount, currency: 'TWD' }
    }))
  };
  
  await OrderCreatePost(payload);
};
</script>
```

---

📖 詳細文檔請見 [README.md](./README.md)
