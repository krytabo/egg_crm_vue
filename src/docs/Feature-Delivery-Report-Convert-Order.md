# 送貨報表轉訂單功能說明

> **功能版本**: v2.0  
> **更新日期**: 2025-01-03  
> **新功能**: 支援批次轉訂單，可選擇「建立新訂單」或「加入現有訂單」

---

## 📋 功能概述

司機送貨報表現在支援更靈活的轉訂單方式：

### ✅ 功能特色

1. **批次選擇商品**：可一次選擇多個商品明細
2. **雙模式轉換**：
   - 🆕 **建立新訂單**：將選擇的商品建立為一筆新訂單
   - 🔗 **加入現有訂單**：將商品加入到已存在的訂單中
3. **訂單搜尋**：快速搜尋並選擇目標訂單
4. **智慧過濾**：只顯示可加入的訂單（狀態篩選）

---

## 🎯 使用場景

### 場景 1: 建立新訂單

**情境**：司機送貨給客戶時，客戶臨時追加訂購，需要建立新的訂單記錄。

**操作流程**：
```
1. 選擇報表中的商品明細
2. 選擇「建立新訂單」模式
3. 確認轉入
```

**結果**：
- 建立一筆新訂單，狀態為「已完成」
- 商品明細標記為「已轉入訂單」
- 記錄關聯的訂單 ID

---

### 場景 2: 加入現有訂單

**情境**：客戶已有一筆待出貨訂單，司機提前送貨或補送部分商品，需要將送貨記錄併入原訂單。

**操作流程**：
```
1. 選擇報表中的商品明細
2. 選擇「加入現有訂單」模式
3. 點擊「搜尋訂單」按鈕
4. 搜尋並選擇目標訂單
5. 確認加入
```

**結果**：
- 商品加入到選擇的訂單中
- 訂單總金額重新計算
- 商品明細標記為「已轉入訂單」
- 記錄關聯的訂單 ID

---

## 🖥️ 操作步驟詳解

### 步驟 1: 選擇商品明細

在送貨報表列表中，點擊報表右側的「轉入訂單」按鈕（Package 圖示）。

**UI 元素**：
```tsx
<Button onClick={() => handleConvertToOrder(report)}>
  <Package className="h-4 w-4" />
</Button>
```

---

### 步驟 2: 勾選要轉入的商品

在彈出的對話框中，勾選要轉入訂單的商品明細。

**特點**：
- ✅ 可多選
- ✅ 已轉入的商品會顯示「已轉入」Badge 且無法再次勾選
- ✅ 即時顯示已選擇的商品數量

**視覺回饋**：
```
已選擇 3 個商品
```

---

### 步驟 3A: 建立新訂單（模式 1）

點擊「建立新訂單」選項卡。

**UI 特點**：
- 📌 藍色邊框高亮顯示選擇狀態
- 📌 圓形單選按鈕視覺指示
- 📌 清楚說明「將選擇的商品建立為一筆新的訂單」

**無需額外設定**：直接點擊「確認轉入」即可。

---

### 步驟 3B: 加入現有訂單（模式 2）

點擊「加入現有訂單」選項卡。

#### 3B-1: 搜尋訂單

點擊「搜尋訂單」按鈕，彈出訂單搜尋對話框。

**搜尋功能**：
- 🔍 即時搜尋（輸入時自動過濾）
- 🔍 可搜尋：訂單編號、客戶名稱、訂單類型

**搜尋框**：
```tsx
<Input
  placeholder="搜尋訂單編號、客戶名稱..."
  value={orderSearchTerm}
  onChange={(e) => setOrderSearchTerm(e.target.value)}
/>
```

#### 3B-2: 訂單列表顯示

**列表欄位**：
| 欄位 | 說明 |
|-----|------|
| 訂單編號 | #1001, #1002... |
| 客戶 | 客戶名稱 |
| 類型 | 桶裝水 / 雞蛋 / 飲水機 |
| 訂單日期 | YYYY-MM-DD |
| 狀態 | 待出貨 / 已出貨 / 已完成 |
| 商品明細 | 顯示訂單中的商品 |
| 操作 | 「選擇」按鈕 |

**狀態標示**：
- 🟦 **待出貨**：藍色 Badge（建議加入）
- 🟩 **已出貨**：灰色 Badge（可加入）
- 🟥 **已完成/已取消**：不建議加入（未來可限制）

#### 3B-3: 選擇訂單

點擊訂單右側的「選擇」按鈕。

**選擇後顯示**：
```
┌─────────────────────────────────────────┐
│ 訂單 #1001                         [X]  │
│ 林氏企業 - 桶裝水 - 2025-01-15           │
│ 狀態: [待出貨]                           │
└─────────────────────────────────────────┘
```

**可取消選擇**：點擊右上角的 [X] 按鈕重新選擇。

---

### 步驟 4: 確認轉入

點擊「確認轉入」按鈕。

**驗證規則**：
- ❌ 未選擇商品 → 提示「請至少選擇一個商品」
- ❌ 選擇「加入現有訂單」但未選擇訂單 → 提示「請先選擇要加入的訂單」
- ✅ 驗證通過 → 執行轉入操作

**成功提示**：
- 建立新訂單：「已成功建立新訂單」
- 加入現有訂單：「已成功加入訂單 #1001」

---

## 🔧 技術實作

### 前端狀態管理

```typescript
// 轉訂單相關狀態
const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
const [convertingReport, setConvertingReport] = useState<Report | null>(null);
const [selectedProductsForConvert, setSelectedProductsForConvert] = useState<number[]>([]);
const [convertMode, setConvertMode] = useState<'new' | 'existing'>('new');
const [selectedExistingOrder, setSelectedExistingOrder] = useState<any>(null);
const [isSearchOrderDialogOpen, setIsSearchOrderDialogOpen] = useState(false);
const [orderSearchTerm, setOrderSearchTerm] = useState('');
```

---

### API 調用

**Endpoint**: `POST /delivery-reports/:reportId/convert-to-order`

#### 模式 1: 建立新訂單

```typescript
const response = await fetch(`/api/delivery-reports/${reportId}/convert-to-order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'new',
    productIndexes: [0, 2, 5],  // 選擇的商品索引
    orderType: 'water',
    shipDate: '2025-01-20',
    employeeId: 5,
    note: '客戶臨時追加'
  })
});
```

#### 模式 2: 加入現有訂單

```typescript
const response = await fetch(`/api/delivery-reports/${reportId}/convert-to-order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'existing',
    productIndexes: [1, 3],     // 選擇的商品索引
    existingOrderId: 1001       // 目標訂單 ID
  })
});
```

---

### 成功 Response

```json
{
  "success": true,
  "message": "已成功加入訂單 #1001",
  "data": {
    "mode": "existing",
    "orderId": 1001,
    "convertedCount": 2,
    "order": {
      "id": 1001,
      "type": "water",
      "customer": "林氏企業",
      "products": [
        // 原有商品
        { "productId": 1, "quantity": 5 },
        // 新加入的商品
        { "productId": 1, "quantity": 10 },
        { "productId": 5, "quantity": 8 }
      ],
      "totalAmount": 3200
    }
  }
}
```

---

## 📊 資料結構

### 送貨報表商品明細

```typescript
interface ProductDetail {
  productId: number;
  productName: string;
  customerName: string;
  customerId: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  paymentMethod: string;
  note: string;
  isConvertedToOrder: boolean;  // 是否已轉入訂單
  orderId?: number;              // 關聯的訂單 ID
}
```

### 現有訂單資料

```typescript
interface ExistingOrder {
  id: number;
  type: 'water' | 'egg' | 'dispenser';
  customer: string;
  customerId: number;
  orderDate: string;
  status: '待出貨' | '已出貨' | '已完成' | '已取消';
  products: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}
```

---

## ⚠️ 注意事項

### 業務規則

1. **已轉入的商品不可重複轉入**
   - UI 會自動禁用已轉入的商品
   - 顯示「已轉入」Badge 和訂單 ID

2. **訂單狀態限制**（建議）
   - 建議只允許加入「待出貨」或「已出貨」的訂單
   - 「已完成」或「已取消」的訂單不應允許加入

3. **客戶一致性驗證**（未來可加強）
   - 建議驗證商品明細的客戶與目標訂單的客戶是否一致
   - 避免將不同客戶的商品併入同一訂單

4. **商品類別一致性**（未來可加強）
   - 建議驗證商品類別與訂單類型是否一致
   - 例如：桶裝水商品不應加入雞蛋訂單

---

### 權限控制

建議的權限設定：
- **司機**：可執行轉訂單操作
- **業務人員**：可執行轉訂單操作
- **管理階層**：可執行轉訂單操作
- **倉管人員**：僅可查看，不可轉訂單

---

## 🎨 UI/UX 設計重點

### 1. 視覺層次

```
┌─ 步驟 1: 選擇商品 ─────────────┐
│  [✓] 商品 A                     │
│  [✓] 商品 B                     │
│  [ ] 商品 C (已轉入)            │
└──────────────────────────────┘
         ↓
┌─ 步驟 2: 選擇模式 ─────────────┐
│  ○ 建立新訂單                   │
│  ● 加入現有訂單                 │
│    └─ 選擇的訂單: #1001        │
└──────────────────────────────┘
         ↓
     [確認轉入]
```

### 2. 互動反饋

- **選擇商品時**：即時顯示選擇數量
- **切換模式時**：動畫過渡，視覺高亮
- **選擇訂單後**：顯示訂單卡片，可預覽詳情
- **執行轉入時**：Loading 狀態，成功後 Toast 提示

### 3. 錯誤處理

| 錯誤情況 | 提示訊息 | 處理方式 |
|---------|---------|---------|
| 未選擇商品 | 請至少選擇一個商品 | 禁用「確認轉入」按鈕 |
| 未選擇訂單 | 請先選擇要加入的訂單 | 禁用「確認轉入」按鈕 |
| 訂單不存在 | 訂單不存在或已刪除 | Toast 錯誤提示 |
| 網路錯誤 | 轉入失敗，請稍後再試 | Toast 錯誤提示 + 重試按鈕 |

---

## 🚀 未來優化方向

### 1. 批次操作增強
- [ ] 支援跨報表批次轉訂單
- [ ] 支援按商品類別快速選擇
- [ ] 支援一鍵全選/反選

### 2. 智慧推薦
- [ ] 自動推薦相似訂單（同客戶、同商品）
- [ ] 顯示訂單容量（已有商品數量）
- [ ] 標示最近更新的訂單

### 3. 進階搜尋
- [ ] 支援多條件篩選（日期範圍、訂單狀態、客戶類別）
- [ ] 支援訂單排序（日期、金額、客戶）
- [ ] 顯示訂單完整資訊（商品明細預覽）

### 4. 驗證增強
- [ ] 客戶一致性驗證
- [ ] 商品類別一致性驗證
- [ ] 訂單狀態限制（禁止加入已完成/已取消訂單）
- [ ] 重複商品提醒（目標訂單已有相同商品）

### 5. 報表優化
- [ ] 轉訂單記錄追蹤（誰、何時、轉入哪張訂單）
- [ ] 轉訂單歷史查詢
- [ ] 撤銷轉訂單功能

---

## 📖 相關文件

- [API 完整規格](./API-Specification.md#107-送貨明細轉訂單批次)
- [API 快速參考](./API-Quick-Reference.md#10-送貨報表)
- [業務流程圖](./Business-Process-Flowchart.md#3-司機送貨報表流程)

---

## 🆕 版本歷程

### v2.0 (2025-01-03)
- ✅ 新增「加入現有訂單」模式
- ✅ 新增訂單搜尋功能
- ✅ 支援批次選擇商品
- ✅ 優化 UI/UX 互動流程

### v1.0 (2025-01-01)
- ✅ 基礎轉訂單功能（僅支援建立新訂單）
- ✅ 單一商品轉訂單

---

**文件維護**: 產品開發團隊  
**最後更新**: 2025-01-03
