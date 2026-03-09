# ProductSelectionTable 組件文檔

這個目錄包含了 ProductSelectionTable 組件的完整文檔。

## 📄 文檔結構

### 1. **QUICK_REFERENCE.md** - 快速參考 ⭐ 推薦先看
- 適合快速查找常用配置和代碼片段
- 包含最常見的使用場景
- 快速除錯提示
- **適合開發者在日常開發中快速查閱**

### 2. **README.md** - 完整使用說明
- 詳細的組件介紹和功能說明
- 完整的 Props 配置表
- 深入的數據結構說明
- 性能考慮和最佳實踐
- 常見問題解答 (FAQ)
- **適合第一次使用或深入學習**

### 3. **ProductSelectionTable.vue** - 組件源碼
- 組件的實現代碼
- 包含詳細的註釋

## 🚀 快速開始

### 1️⃣ 基本使用

```vue
<ProductSelectionTable v-model="items" />
```

然後檢查 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 的 "最常用的配置" 部分。

### 2️⃣ 集成到訂單系統

1. 查看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 中的 "搭配訂單表單" 例子
2. 參考 [README.md](./README.md) 的 "完整使用示例" 部分
3. 查看實際的整合代碼：`src/pages/Orders/DataList.vue`

### 3️⃣ 深入瞭解

閱讀 [README.md](./README.md) 的以下章節：
- Props 配置
- 與 v-model 的數據結構
- 自定義價格機制
- 編輯現有訂單的流程

## 📋 常見使用場景

### 場景 1: 新增訂單

1. 用戶選擇客戶
2. ProductSelectionTable 自動加載商品列表
3. 用戶選擇商品和數量
4. 點擊保存

**參考文檔**：[README.md](./README.md) 的 "實際整合示例 - 訂單系統" → "新增訂單流程"

### 場景 2: 編輯訂單

1. 點擊編輯按鈕
2. 加載訂單資料
3. 訂單商品顯示在表格中
4. 用戶可以修改數量和價格
5. 點擊保存

**參考文檔**：[README.md](./README.md) 的 "編輯現有訂單的流程" 和 "實際整合示例 - 訂單系統" → "編輯訂單流程"

### 場景 3: 根據客戶自動調整價格

1. 用戶選擇客戶
2. ProductSelectionTable 自動套用該客戶的自定義商品價格
3. 用戶可以手動修改價格
4. 小計自動計算

**參考文檔**：[README.md](./README.md) 的 "自定義價格機制" 和 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 的 "自定義價格"

## 🔍 除錯指南

### 問題：商品列表為空

**檢查清單**：
1. ✓ `loadProducts()` 是否已被呼叫？
2. ✓ API 是否返回了商品數據？
3. ✓ `categoryId` 是否正確？

**參考**：[QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 的 "除錯提示" 或 [README.md](./README.md) 的 "常見問題" Q1-Q2

### 問題：編輯訂單時無法顯示原商品

**檢查清單**：
1. ✓ `productId` 是否與 API 返回的商品 ID 一致？
2. ✓ 是否在 `loadProducts()` 完成後再設置 `items`？
3. ✓ 控制台是否有錯誤訊息？

**參考**：[README.md](./README.md) 的 "編輯現有訂單的流程" 和 "常見問題" Q6

### 問題：自定義價格沒有生效

**檢查清單**：
1. ✓ `targetObject` 結構是否正確？
2. ✓ 自定義價格中的商品 ID 是否匹配？
3. ✓ `customFields.customPrices` 是否有數據？

**參考**：[QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 的 "除錯提示" 或 [README.md](./README.md) 的 "常見問題" Q5

## 📊 數據流圖

```
┌─────────────────────────────────────────────────────────┐
│  父組件 (e.g., DataList.vue)                             │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ form = { targetId, items: [...] }                │    │
│  └─────────────────────────────────────────────────┘    │
│            │           ▲                                  │
│            │ :target-object, v-model                    │
│            │           │                                  │
│            ▼           ▼                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ProductSelectionTable                           │    │
│  │                                                  │    │
│  │ ┌────────────────────────────────────────────┐  │    │
│  │ │ API: ProductListGet()                      │  │    │
│  │ └────────────────────────────────────────────┘  │    │
│  │            ▼                                     │    │
│  │ ┌────────────────────────────────────────────┐  │    │
│  │ │ products: [商品列表]                        │  │    │
│  │ │ selectedItems: { productId: quantity }     │  │    │
│  │ │ customPrices: { productId: price }         │  │    │
│  │ └────────────────────────────────────────────┘  │    │
│  │            ▼                                     │    │
│  │ ┌────────────────────────────────────────────┐  │    │
│  │ │ render: 表格顯示商品 + 輸入框               │  │    │
│  │ │ 事件: 用戶輸入數量/價格                     │  │    │
│  │ └────────────────────────────────────────────┘  │    │
│  │            ▼                                     │    │
│  │ ┌────────────────────────────────────────────┐  │    │
│  │ │ emit: update:modelValue                    │  │    │
│  │ │ selectedProducts: [項目]                   │  │    │
│  │ └────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│            ▲                                             │
│            │ v-model 更新                               │
│            │                                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │ form.items 更新 → 計算合計 → 保存到 API          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 💡 開發建議

### 最佳實踐

1. **列顯示優化**：只顯示必要的欄位
   ```vue
   :visible-columns="['name', 'unit', 'quantity']"
   ```

2. **性能考慮**：使用合理的 pageSize
   ```vue
   :page-size="20"  <!-- 根據網路速度調整 -->
   ```

3. **數據驗證**：保存前驗證商品選擇
   ```javascript
   if (form.items.length === 0) {
     alert('請選擇至少一個商品');
     return;
   }
   ```

4. **調試輸出**：開發時監聽 v-model 變化
   ```javascript
   watch(() => form.items, (newItems) => {
     console.log('選中的商品:', newItems);
   }, { deep: true });
   ```

### 常見陷阱

- ❌ 在商品加載前設置 `items`
- ✅ 應該在 `loadProducts()` 完成後設置

- ❌ 忘記映射 `actualPrice` → `unitPrice.amount`
- ✅ 編輯訂單時需要正確轉換數據結構

- ❌ `productId` 類型不匹配（string vs object）
- ✅ 確保 `productId` 始終是字符串 UUID

## 📚 相關資源

- **來源組件**：[src/components/Form/InfiniteSelect.vue](../Form/InfiniteSelect.vue) - 下拉選擇組件
- **實際應用**：[src/pages/Orders/DataList.vue](../../pages/Orders/DataList.vue) - 訂單管理頁面
- **API 定義**：[src/assets/API/Product.ts](../../../assets/API/Product.ts)


## 📞 支援

- 📖 詳細文檔：[README.md](./README.md)
- ⚡ 快速查閱：[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- 💻 源碼參考：[ProductSelectionTable.vue](./ProductSelectionTable.vue)

---

**最後更新**：2026-02-07  
**版本**：1.0.0
