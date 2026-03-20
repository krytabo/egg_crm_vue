# CRM 管理系統 - 更新日誌

## [2026-03-19] - 儀表板全面重構

### ✨ 新功能

#### 📊 儀表板分頁強化

**總覽分頁**：
- 訂單分類區塊：雞蛋訂單排第一、飲水訂單排第二；飲水機訂單暫時隱藏
- 近期活動改用 `CustomTinyGrid` 表格顯示

**銷售統計分頁**：
- 新增 3 欄摘要卡片（總訂單數 / 總營收 / 平均訂單金額）
- 商品種類篩選修正：改用固定選項下拉，確保傳值與後端 API 一致

**儲值統計分頁**：
- 新增 4 欄摘要卡片（涵蓋客戶數 / 儲值總金額 / 已使用金額 / 儲值總數量）
- 客戶儲值明細改為樹狀表格，展開可查看各商品儲值明細
- 新增依商品聚合的儲值統計表格

**待出貨統計分頁**：
- 新增 2 欄摘要卡片（訂單數 / 總金額），趨勢欄位顯示各狀態分布

**客戶統計分頁**：
- 新增 3 欄摘要卡片（本月新客戶 / Top 客戶數 / 類別數）

### 🔧 優化

#### 全站表格高度動態化
- 移除 `systemStore.updateTableHeight` 固定高度設定（約 18 個檔案）
- 改用 `@vueuse/core` `useWindowSize` 動態計算可視高度
- 公式：`Math.max(windowHeight.value - N, 100)`

#### 移除 CardContent 元件限制
- `CardContent` 因包含 `overflow-hidden` 會限制表格滾動高度
- 全站改為 `<div>` 取代

#### 摘要卡片 UI 統一
- 所有分頁改用 `computed(() => [...])` 陣列 + `v-for` 渲染卡片
- 統一圖示（`lucide-vue-next`）、大數字、趨勢色彩規範

### 🌐 i18n

- 新增 ~34 個多語系 key（三個語系檔同步更新）
- 修正所有中文 i18n key 為 camelCase 英文 key
- 新增：`byDay` / `byWeek` / `byMonth`、儲值相關、統計相關、客戶統計相關等

### ✨ 新功能

#### 🎯 出貨星期動態編輯

**功能路徑**: 司機送貨報表 → 編輯報表 → 出貨星期設定

**新增功能**:

1. **智慧星期管理**
   - ✅ 可以新增其他星期以擴大送貨範圍
   - ❌ 不能移除原始建立時勾選的星期（防止誤操作）
   - 📊 即時顯示符合條件的客戶數量

2. **視覺化標示**
   - 🔵 藍色標記：原始星期（不可移除）+ 標註「（原始）」
   - 🟢 綠色標記：新增的星期（可移除）
   - ⚪ 白色標記：未選擇的星期（可選擇）
   - 💡 友善提示：說明使用方式

3. **業務價值**
   - 保護報表原始設定，避免誤操作
   - 允許彈性擴大送貨範圍
   - 確保客戶選擇的邏輯一致性

#### 🛡️ 商品選擇智慧禁用

**功能路徑**: 司機送貨報表 → 編輯報表 → 新增商品

**新增功能**:

1. **智慧商品過濾**
   - 已在報表中的商品自動禁用 (checkbox disabled)
   - 顯示「（已在報表中）」標籤
   - 灰色背景 + 降低透明度視覺區分

2. **使用者體驗優化**
   - 使用者可看到哪些商品已存在
   - 避免誤點重複新增
   - 保持商品列表完整性（全部顯示）

3. **檢查邏輯**
   ```typescript
   const isProductInReport = (productId: number) => {
     return editedProducts.some(p => p.productId === productId);
   };
   ```

### 🔧 技術改進

**API 更新**:
- 更新 `GET /delivery-reports/:id` Response:
  - 新增 `selectedWeekDays: string[]` - 當前選擇的星期陣列
- 更新 `PUT /delivery-reports/:id` Request:
  - 支援 `selectedWeekDays: string[]` 更新
  - 前端控制不允許移除原始星期
- 更新 `POST /delivery-reports` Request:
  - 新增 `selectedWeekDays: string[]` 欄位

**前端狀態管理**:
```typescript
// 新增狀態
const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
const [originalWeekDays, setOriginalWeekDays] = useState<string[]>([]);

// 新增處理函數
const handleWeekDayToggle = (weekDay: string) => { ... }
const isProductInReport = (productId: number) => { ... }
```

**資料結構更新**:
```typescript
interface ReportData {
  // 新增欄位
  selectedWeekDays: string[];      // 當前選擇的星期
  // 前端管理
  originalWeekDays?: string[];     // 原始星期（不可移除）
}

interface ProductDetail {
  // 新增欄位
  actualAmount: number;            // 實際收付金額
}
```

### 📝 文件更新

1. **新增功能說明文件** (`/docs/Feature-Delivery-Report-Edit-Page.md`) - 🆕
   - 完整編輯頁面功能說明
   - 出貨星期動態編輯詳解
   - 商品選擇智慧禁用說明
   - 智慧客戶選擇機制
   - 商品分類管理
   - 完整編輯功能
   - 技術實作細節
   - 資料結構定義
   - UI/UX 設計重點

2. **API 規格文件** (`/docs/API-Specification.md`)
   - 更新 10.2 取得單一送貨報表：新增 `selectedWeekDays` 欄位
   - 更新 10.3 新增送貨報表：新增 `selectedWeekDays` 和 `actualAmount` 欄位
   - 更新 10.4 更新送貨報表：加入出貨星期編輯邏輯說明

3. **索引文件** (`/docs/INDEX.md`)
   - 新增功能說明文件索引
   - 更新文件統計（10 個文件，約 65,000 字）
   - 更新快速搜尋關鍵字

4. **總覽文件** (`/docs/README.md`)
   - 更新司機送貨報表功能描述

### 🎨 UI 元件

**更新的檔案**: `/components/delivery-report-edit-page.jsx`

**UI 優化**:
- 出貨星期設定區域（琥珀色背景）
- 星期選擇 checkbox 帶視覺標示
- 商品選擇對話框優化（禁用樣式）
- 友善提示訊息

**新增交互邏輯**:
- `handleWeekDayToggle()` - 處理星期切換（保護原始星期）
- `handleProductToggle()` - 處理商品選擇（禁止已存在商品）
- `isProductInReport()` - 檢查商品是否已在報表中
- `getAvailableCustomers()` - 根據星期過濾客戶

### 📊 功能影響範圍

**影響的功能模組**:
1. 送貨報表編輯
2. 客戶選擇（智慧過濾）
3. 商品管理（防止重複）

**使用場景改善**:
- ✅ 擴大送貨範圍：可新增星期
- ✅ 避免誤操作：原始星期不可移除
- ✅ 提高效率：自動過濾符合的客戶
- ✅ 防止錯誤：禁止重複新增商品

---

## [2025-01-03] - 送貨報表轉訂單功能升級

### ✨ 新功能

#### 🎯 送貨報表批次轉訂單（雙模式）

**功能路徑**: 司機送貨報表 → 選擇報表 → 轉入訂單

**新增功能**:

1. **批次選擇商品**
   - 可一次選擇多個商品明細進行轉訂單
   - 已轉入的商品自動禁用，避免重複轉入
   - 即時顯示已選擇的商品數量

2. **雙模式轉換**
   
   **模式 1: 建立新訂單**
   - 將選擇的商品建立為一筆新訂單
   - 訂單狀態自動設為「已完成」
   - 適用場景：客戶臨時追加訂購

   **模式 2: 加入現有訂單**
   - 將商品加入到已存在的訂單中
   - 自動重新計算訂單總金額
   - 適用場景：提前送貨、補送商品

3. **訂單搜尋功能**
   - 即時搜尋：支援訂單編號、客戶名稱、訂單類型
   - 清楚顯示訂單資訊：編號、客戶、類型、日期、狀態、商品明細
   - 快速選擇：點擊「選擇」按鈕即可
   - 可取消重選：支援更換目標訂單

4. **優化的 UI/UX**
   - 兩步驟流程：選擇商品 → 選擇模式
   - 視覺化模式選擇：圓形單選按鈕 + 藍色高亮邊框
   - 訂單預覽卡片：選擇訂單後顯示完整資訊
   - 智慧驗證：未完成必要選擇時禁用「確認轉入」按鈕

### 🔧 技術改進

**API 更新**:
- **新端點**: `POST /delivery-reports/:reportId/convert-to-order`
- **支援參數**:
  ```typescript
  {
    mode: 'new' | 'existing',
    productIndexes: number[],
    // mode=new 時
    orderType: string,
    shipDate: string,
    employeeId: number,
    // mode=existing 時
    existingOrderId: number
  }
  ```

**前端狀態管理**:
- 新增 `convertMode` 狀態管理轉換模式
- 新增 `selectedExistingOrder` 儲存選擇的訂單
- 新增 `isSearchOrderDialogOpen` 控制搜尋對話框
- 新增 `orderSearchTerm` 處理搜尋關鍵字

### 📝 文件更新

1. **API 規格文件** (`/docs/API-Specification.md`)
   - 更新 10.7 送貨明細轉訂單 API 規格
   - 新增雙模式業務邏輯說明
   - 新增驗證規則

2. **API 快速參考** (`/docs/API-Quick-Reference.md`)
   - 更新轉訂單 API Endpoint
   - 更新送貨報表流程範例

3. **功能說明文件** (`/docs/Feature-Delivery-Report-Convert-Order.md`) - 新增
   - 完整功能概述
   - 使用場景說明
   - 詳細操作步驟
   - 技術實作細節
   - UI/UX 設計重點
   - 未來優化方向

### 🎨 UI 元件

**更新的檔案**: `/components/delivery-report-new.jsx`

**新增元件**:
- 轉訂單對話框（雙模式版本）
- 訂單搜尋對話框
- 模式選擇卡片
- 訂單預覽卡片

**新增功能**:
- `handleSearchExistingOrder()` - 開啟搜尋訂單對話框
- `handleSelectExistingOrder()` - 選擇現有訂單
- `handleDoConvert()` - 執行轉訂單（支援雙模式）

### 📊 資料模擬

新增模擬現有訂單資料 (`mockExistingOrders`):
- 5 筆範例訂單
- 包含不同客戶、類型、狀態
- 用於訂單搜尋功能測試

---

## 使用範例

### 範例 1: 建立新訂單

```typescript
// 場景：客戶臨時追加 3 個商品
1. 點擊報表的「轉入訂單」按鈕
2. 勾選 3 個商品明細
3. 選擇「建立新訂單」模式
4. 點擊「確認轉入」
→ 成功建立新訂單 #1234
```

### 範例 2: 加入現有訂單

```typescript
// 場景：補送商品到客戶的待出貨訂單
1. 點擊報表的「轉入訂單」按鈕
2. 勾選 2 個補送商品
3. 選擇「加入現有訂單」模式
4. 點擊「搜尋訂單」
5. 搜尋客戶名稱「林氏企業」
6. 選擇訂單 #1001
7. 點擊「確認轉入」
→ 商品成功加入訂單 #1001
```

---

## 升級影響

### 對現有功能的影響

✅ **向下相容**：現有的轉訂單功能繼續可用  
✅ **資料結構不變**：ProductDetail 介面保持一致  
✅ **無需遷移**：不影響現有資料

### 建議操作

1. **使用者培訓**：
   - 向司機說明新的雙模式功能
   - 強調使用場景差異
   - 演示訂單搜尋功能

2. **業務規則確認**：
   - 確認是否限制可加入的訂單狀態
   - 確認是否需要客戶一致性驗證
   - 確認是否需要商品類別一致性驗證

3. **後端開發**：
   - 實作新的 API Endpoint
   - 實作加入現有訂單的業務邏輯
   - 實作必要的驗證規則

---

## 未來規劃

### 短期優化 (1-2 週)

- [ ] 新增訂單容量顯示（已有商品數量）
- [ ] 新增重複商品提醒
- [ ] 新增客戶一致性驗證

### 中期優化 (1-2 月)

- [ ] 智慧訂單推薦（相似客戶、相似商品）
- [ ] 進階搜尋篩選（多條件）
- [ ] 轉訂單歷史記錄查詢

### 長期優化 (3-6 月)

- [ ] 跨報表批次轉訂單
- [ ] 撤銷轉訂單功能
- [ ] 自動化轉訂單規則設定

---

## 相關連結

- [功能詳細說明文件](./docs/Feature-Delivery-Report-Convert-Order.md)
- [API 規格文件](./docs/API-Specification.md)
- [業務流程圖](./docs/Business-Process-Flowchart.md)

---

**版本**: v2.0  
**發布日期**: 2025-01-03  
**開發團隊**: CRM 系統開發組
