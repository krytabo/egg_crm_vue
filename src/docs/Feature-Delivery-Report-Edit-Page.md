# 送貨報表編輯頁面功能說明

> **功能版本**: v2.1  
> **更新日期**: 2025-01-06  
> **新功能**: 智慧商品選擇、出貨星期動態編輯

---

## 📋 功能概述

送貨報表編輯頁面提供完整的商品明細編輯功能，支援智慧化的客戶選擇、商品管理，以及彈性的出貨星期設定。

### ✅ 核心功能特色

1. **智慧客戶選擇**：根據出貨星期自動過濾符合的客戶
2. **出貨星期動態編輯**：可新增星期但不能移除原始星期
3. **商品選擇智慧禁用**：已在報表的商品無法重複選擇
4. **商品分類展開/收合**：依商品名稱分組，支援批次展開/收合
5. **完整的 CRUD 操作**：新增、編輯、刪除商品明細

---

## 🎯 功能詳解

### 1. 出貨星期動態編輯

#### 1.1 功能說明

允許編輯報表的出貨星期設定，但有智慧限制：
- ✅ 可以**新增**其他星期
- ❌ **不能移除**原始建立時勾選的星期
- 📊 即時顯示符合條件的客戶數量

#### 1.2 UI 設計

**視覺標示**：
- 🔵 **藍色背景** + 「（原始）」標籤：無法移除的原始星期
- 🟢 **綠色背景**：新增的星期（可移除）
- ⚪ **白色背景**：未選擇的星期（可選擇）

**範例**：
```
┌─ 預計出貨星期設定 ────────────────────┐
│                                          │
│  [✓] 星期一 (原始)  [✓] 星期二 (原始)   │
│  [✓] 星期三         [ ] 星期四           │
│  [ ] 星期五         [ ] 星期六           │
│  [ ] 星期日                              │
│                                          │
│  提示：藍色標記的星期為原始設定，無法移除 │
└─────────────────────────────────────────┘
```

#### 1.3 業務邏輯

**為什麼不能移除原始星期？**
- 避免客戶已經基於原始星期被選擇，但星期被移除後導致邏輯不一致
- 保護報表的原始設定，防止誤操作

**資料結構**：
```typescript
interface ReportData {
  selectedWeekDays: string[];      // 當前選擇的星期
  originalWeekDays: string[];      // 原始星期（不可移除）
}
```

**狀態管理**：
```typescript
const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
const [originalWeekDays, setOriginalWeekDays] = useState<string[]>([]);

// 處理星期切換
const handleWeekDayToggle = (weekDay: string) => {
  // 如果是原始星期，不允許取消
  if (originalWeekDays.includes(weekDay)) {
    return;
  }
  
  if (selectedWeekDays.includes(weekDay)) {
    setSelectedWeekDays(selectedWeekDays.filter(day => day !== weekDay));
  } else {
    setSelectedWeekDays([...selectedWeekDays, weekDay]);
  }
};
```

#### 1.4 使用場景

**場景 1：擴大送貨範圍**
```
原始星期：星期一、星期三
需求：臨時需要在星期五也送貨
操作：勾選「星期五」
結果：星期一、星期三、星期五 (星期一、三不能取消)
```

**場景 2：誤點取消原始星期**
```
原始星期：星期一、星期三
操作：嘗試取消勾選「星期一」
結果：❌ 無法取消（checkbox disabled）
提示：原始星期無法移除
```

---

### 2. 智慧客戶選擇

#### 2.1 功能說明

根據當前選擇的出貨星期，**自動過濾**客戶列表，只顯示預計出貨星期與報表星期有交集的客戶。

#### 2.2 過濾邏輯

```typescript
const getAvailableCustomers = () => {
  if (!selectedWeekDays || selectedWeekDays.length === 0) {
    return mockCustomers;
  }
  
  // 只顯示 deliveryDays 與 selectedWeekDays 有交集的客戶
  return mockCustomers.filter(customer => 
    customer.deliveryDays.some(day => selectedWeekDays.includes(day))
  );
};
```

#### 2.3 使用範例

**情境**：
- 報表出貨星期：星期一、星期三
- 客戶 A：預計出貨星期 = 星期一、星期二
- 客戶 B：預計出貨星期 = 星期二、星期四
- 客戶 C：預計出貨星期 = 星期三、星期五

**結果**：
- ✅ 客戶 A：顯示（有「星期一」交集）
- ❌ 客戶 B：隱藏（無交集）
- ✅ 客戶 C：顯示（有「星期三」交集）

#### 2.4 UI 顯示

**客戶下拉選單**：
```tsx
<Select value={customerId.toString()} onValueChange={handleCustomerChange}>
  <SelectTrigger>
    <SelectValue placeholder="選擇客戶" />
  </SelectTrigger>
  <SelectContent>
    {getAvailableCustomers().map((customer) => (
      <SelectItem key={customer.id} value={customer.id.toString()}>
        <div className="flex items-center gap-2">
          <span>{customer.name}</span>
          <Badge variant="outline">
            {customer.deliveryDays.join('、')}
          </Badge>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**視覺提示**：
```
┌─ 預計出貨星期設定 ────────────────────┐
│  [✓] 星期一  [✓] 星期三               │
│  （可選擇 8 位符合的客戶）            │
└─────────────────────────────────────────┘
```

---

### 3. 商品選擇智慧禁用

#### 3.1 功能說明

在「新增商品」對話框中，已經存在於報表中的商品會：
- 🔒 **自動禁用** (checkbox disabled)
- 👁️ **顯示標示**「（已在報表中）」
- 🎨 **視覺區分**：灰色背景 + 降低透明度

#### 3.2 檢查邏輯

```typescript
// 檢查商品是否已存在於報表中
const isProductInReport = (productId: number) => {
  return editedProducts.some(p => p.productId === productId);
};
```

#### 3.3 UI 實作

**對話框顯示**：
```tsx
{categoryProducts.map(product => {
  const isInReport = isProductInReport(product.id);
  
  return (
    <div
      key={product.id}
      className={`flex items-center space-x-2 p-2 border rounded ${
        isInReport 
          ? 'bg-gray-100 border-gray-300 opacity-60' 
          : 'hover:bg-gray-50 cursor-pointer'
      }`}
      onClick={() => !isInReport && handleProductToggle(product.id)}
    >
      <Checkbox
        checked={selectedProductIds.includes(product.id) || isInReport}
        disabled={isInReport}
        onCheckedChange={() => handleProductToggle(product.id)}
      />
      <label className={isInReport ? 'cursor-not-allowed' : 'cursor-pointer'}>
        <span>{product.name}</span>
        {isInReport && (
          <span className="ml-1 text-xs text-blue-600">
            （已在報表中）
          </span>
        )}
      </label>
    </div>
  );
})}
```

#### 3.4 視覺效果

```
┌─ 選擇要新增的商品 ──────────────────┐
│                                        │
│  桶裝水                                │
│  [✓] 清泉 20L (已在報表中)  灰色背景   │
│  [ ] 純淨 20L                          │
│  [✓] 山泉 20L (已在報表中)  灰色背景   │
│  [ ] 礦泉 20L                          │
│                                        │
│  雞蛋                                  │
│  [ ] 紅殼蛋 10入/盒                    │
│  [ ] 白殼蛋 10入/盒                    │
│                                        │
└────────────────────────────────────────┘
```

#### 3.5 使用場景

**場景：避免重複新增**
```
報表已有商品：清泉 20L、山泉 20L
需求：想新增更多桶裝水
操作：點擊「新增商品」
結果：
  - 清泉 20L → 顯示但禁用（已在報表中）
  - 純淨 20L → 可選擇 ✅
  - 山泉 20L → 顯示但禁用（已在報表中）
  - 礦泉 20L → 可選擇 ✅
```

**優點**：
1. ✅ 使用者知道哪些商品已經在報表中
2. ✅ 避免誤點重複新增
3. ✅ 保持商品列表完整性（全部顯示）

---

### 4. 商品分類管理

#### 4.1 按商品名稱分組

商品明細依 **productName** 分組顯示：
- 同一商品的不同客戶記錄會歸類在一起
- 使用 Accordion 元件實現展開/收合

**分組邏輯**：
```typescript
const groupedProducts = editedProducts.reduce((acc, product, index) => {
  if (!acc[product.productName]) {
    acc[product.productName] = [];
  }
  acc[product.productName].push({ ...product, originalIndex: index });
  return acc;
}, {} as Record<string, (ProductDetail & { originalIndex: number })[]>);
```

#### 4.2 統計摘要顯示

每個商品分類顯示：
- 📊 **筆數**：該商品有幾筆客戶記錄
- 💰 **金額**：該商品所有記錄的實際收付總額

```tsx
<Badge variant="secondary">{products.length} 筆</Badge>
<Badge variant="outline">
  ${products.reduce((sum, p) => sum + p.actualAmount, 0).toLocaleString()}
</Badge>
```

#### 4.3 商品類別操作

每個商品類別提供：
1. **新增客戶**：在該商品下新增一筆客戶記錄
2. **刪除商品**：刪除該商品的所有客戶記錄

**UI 設計**：
```
┌─ 清泉 20L ──── 3筆 ── $4,200 ───────┐
│                                       │
│  [+ 新增客戶]  [🗑️ 刪除商品]         │
│                                       │
│  客戶      數量  單價  金額  ...      │
│  林氏企業   10   140  1400           │
│  小芬商店    5   140   700           │
│  陳氏餐飲   15   140  2100           │
│  ─────────────────────────────────   │
│  小計       30        4200           │
└──────────────────────────────────────┘
```

---

### 5. 完整編輯功能

#### 5.1 可編輯欄位

| 欄位 | 說明 | 輸入方式 |
|-----|------|---------|
| 客戶 | 選擇客戶 | 下拉選單（智慧過濾） |
| 數量 | 商品數量 | 數字輸入框 |
| 單價 | 商品單價 | 數字輸入框 |
| 金額 | 自動計算 = 數量 × 單價 | 顯示欄位 |
| 實際收付金額 | 實際收付的金額 | 數字輸入框 |
| 收付方式 | 現金/月結/轉帳 | 下拉選單 |
| 備註 | 補充說明 | 文字輸入框 |

#### 5.2 自動計算邏輯

**金額計算**：
```typescript
const handleQuantityChange = (index: number, value: string) => {
  const newProducts = [...editedProducts];
  const quantity = parseInt(value) || 0;
  newProducts[index].quantity = quantity;
  const newAmount = quantity * newProducts[index].unitPrice;
  newProducts[index].amount = newAmount;
  // 數量變更時，實際收付金額預設等於金額
  newProducts[index].actualAmount = newAmount;
  setEditedProducts(newProducts);
};
```

**單價計算**：
```typescript
const handleUnitPriceChange = (index: number, value: string) => {
  const newProducts = [...editedProducts];
  const unitPrice = parseInt(value) || 0;
  newProducts[index].unitPrice = unitPrice;
  const newAmount = unitPrice * newProducts[index].quantity;
  newProducts[index].amount = newAmount;
  // 單價變更時，實際收付金額預設等於金額
  newProducts[index].actualAmount = newAmount;
  setEditedProducts(newProducts);
};
```

#### 5.3 客戶變更自動帶入

當選擇客戶時，自動帶入：
- 客戶名稱
- 預設收付方式

```typescript
const handleCustomerChange = (index: number, customerId: number) => {
  const customer = mockCustomers.find(c => c.id === customerId);
  if (!customer) return;

  const newProducts = [...editedProducts];
  newProducts[index].customerId = customerId;
  newProducts[index].customerName = customer.name;
  // 自動帶入客戶的預設收付方式
  newProducts[index].paymentMethod = customer.paymentMethod;
  setEditedProducts(newProducts);
};
```

---

### 6. 統計資訊顯示

#### 6.1 商品統計摘要

頁面上方顯示即時統計：
```
┌─────────────────────────────────────────┐
│  商品類別: 3   │  總筆數: 8           │
│  總數量: 85    │  實際收付總額: $8,200│
└─────────────────────────────────────────┘
```

#### 6.2 費用與總計

頁面下方顯示：
```
商品總金額（參考）：      $8,500
實際收付總額：            $8,200
加油支出金額：           -$500
其他支出金額：           -$200
──────────────────────────────────
金額總計：                $7,500
```

**計算公式**：
```
金額總計 = 實際收付總額 - 加油支出 - 其他支出
```

---

## 🔧 技術實作

### 前端狀態管理

```typescript
// 主要狀態
const [reportData, setReportData] = useState<ReportData | null>(null);
const [editedProducts, setEditedProducts] = useState<ProductDetail[]>([]);
const [fuelExpense, setFuelExpense] = useState<number>(0);
const [otherExpense, setOtherExpense] = useState<number>(0);

// 出貨星期管理
const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
const [originalWeekDays, setOriginalWeekDays] = useState<string[]>([]);

// UI 狀態
const [expandedItems, setExpandedItems] = useState<string[]>([]);
const [showProductDialog, setShowProductDialog] = useState(false);
const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
```

### API 調用

**取得報表資料**：
```typescript
GET /delivery-reports/:id

Response:
{
  "id": 1,
  "selectedWeekDays": ["星期一", "星期三"],  // 當前選擇的星期
  "products": [...],
  // ...
}
```

**更新報表**：
```typescript
PUT /delivery-reports/:id

Request Body:
{
  "selectedWeekDays": ["星期一", "星期三", "星期五"],  // 更新後的星期
  "products": [...],
  "fuelExpense": 500,
  "otherExpense": 200
}
```

---

## 📊 資料結構

### 送貨報表資料

```typescript
interface ReportData {
  id: number;
  employeeId: number;
  employeeName: string;
  reportDate: string;
  weekDays: string;                    // 顯示用，例如："星期一、星期三"
  selectedWeekDays: string[];          // 當前選擇的星期陣列
  originalWeekDays?: string[];         // 原始星期（前端管理，可選）
  products: ProductDetail[];
  totalAmount: number;
  cashReceived: number;
  fuelExpense: number;
  otherExpense: number;
  // ...
}
```

### 商品明細資料

```typescript
interface ProductDetail {
  productId: number;
  productName: string;
  customerId: number;
  customerName: string;
  quantity: number;
  unitPrice: number;
  amount: number;                      // 金額 = 數量 × 單價
  actualAmount: number;                // 實際收付金額
  paymentMethod: string;               // 現金/月結/轉帳
  note: string;
  convertedToOrder: boolean;
  orderId?: number;
}
```

### 客戶資料

```typescript
interface Customer {
  id: number;
  name: string;
  type: '客戶' | '廠商';
  paymentMethod: string;
  deliveryDays: string[];              // 預計出貨星期
}
```

---

## ⚠️ 注意事項

### 1. 業務規則

**出貨星期限制**：
- 原始星期不可移除（防止誤操作）
- 可以新增其他星期以擴大範圍
- 星期變更會即時影響可選客戶列表

**商品選擇限制**：
- 已在報表的商品無法重複新增
- 但會顯示出來讓使用者知道已存在

**客戶選擇限制**：
- 只顯示預計出貨星期符合的客戶
- 確保業務邏輯一致性

### 2. 資料驗證

**前端驗證**：
- 數量必須 ≥ 0
- 單價必須 ≥ 0
- 實際收付金額必須 ≥ 0
- 必須選擇客戶

**後端驗證**（建議）：
- 報表是否存在
- 商品是否存在
- 客戶是否存在
- 出貨星期格式驗證
- 已審核的報表禁止編輯

### 3. 權限控制

建議的權限設定：
- **司機**：可編輯自己的未提交報表
- **業務人員**：可編輯所有未審核報表
- **管理階層**：可編輯所有報表
- **倉管人員**：僅可查看

---

## 🎨 UI/UX 設計重點

### 1. 響應式設計

- 📱 **手機版**：使用 Accordion 展開/收合，節省空間
- 💻 **桌面版**：表格完整顯示，提供完整資訊

### 2. 即時反饋

- ✅ 修改數量/單價 → 即時計算金額
- ✅ 變更出貨星期 → 即時更新可選客戶數量
- ✅ 選擇客戶 → 自動帶入收付方式
- ✅ 所有操作 → Toast 提示訊息

### 3. 視覺層次

**顏色語言**：
- 🔵 藍色：原始設定（不可移除）
- 🟢 綠色：新增項目（可移除）
- ⚪ 白色：未選擇項目（可選擇）
- ⚫ 灰色：已存在項目（禁用）
- 🟡 黃色/琥珀色：提示資訊

### 4. 錯誤處理

| 情況 | 處理方式 |
|-----|---------|
| 嘗試移除原始星期 | 禁用 checkbox，不執行操作 |
| 嘗試選擇已存在商品 | 禁用 checkbox，顯示提示 |
| 未選擇客戶就儲存 | 前端驗證，Toast 錯誤提示 |
| 數量/單價輸入非數字 | 自動轉為 0 |
| 網路錯誤 | Toast 錯誤提示 + 重試建議 |

---

## 🚀 未來優化方向

### 1. 批次操作增強
- [ ] 支援批次修改單價
- [ ] 支援批次修改收付方式
- [ ] 支援批次刪除明細

### 2. 智慧推薦
- [ ] 根據歷史記錄推薦常用客戶
- [ ] 根據客戶習慣推薦商品單價
- [ ] 自動計算建議數量

### 3. 驗證增強
- [ ] 客戶與出貨星期一致性警告
- [ ] 異常單價警告（偏離平均值）
- [ ] 重複記錄檢查（同商品同客戶）

### 4. 資料同步
- [ ] 自動儲存草稿
- [ ] 離線編輯支援
- [ ] 變更歷史記錄

### 5. 匯出功能
- [ ] 匯出為 Excel
- [ ] 匯出為 PDF
- [ ] 自訂匯出欄位

---

## 📖 相關文件

- [送貨報表轉訂單功能](./Feature-Delivery-Report-Convert-Order.md)
- [API 完整規格](./API-Specification.md#10-送貨報表-api)
- [API 快速參考](./API-Quick-Reference.md#10-送貨報表)
- [業務流程圖](./Business-Process-Flowchart.md#3-司機送貨報表流程)
- [ERD 實體關聯圖](./ERD-Entity-Relationship-Diagram.md)

---

## 🆕 版本歷程

### v2.1 (2025-01-06)
- ✅ 新增出貨星期動態編輯功能
- ✅ 新增商品選擇智慧禁用功能
- ✅ 智慧客戶過濾優化
- ✅ UI/UX 改善（視覺標示、提示訊息）

### v2.0 (2025-01-03)
- ✅ 完整的商品明細編輯功能
- ✅ 商品分類展開/收合
- ✅ 統計摘要顯示

### v1.0 (2025-01-01)
- ✅ 基礎編輯功能
- ✅ 商品明細 CRUD

---

**文件維護**: 產品開發團隊  
**最後更新**: 2025-01-06
