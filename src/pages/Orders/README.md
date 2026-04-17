# 訂單管理模組操作說明

本模組負責管理所有產品類型的訂單，包含飲水、雞蛋、飲水機三大類。

---

## 使用者操作說明

### 一、進入訂單管理

- **飲水訂單**：左側選單「訂單管理」→「飲水訂單」
- **雞蛋訂單**：左側選單「訂單管理」→「雞蛋訂單」
- **飲水機訂單**：左側選單「訂單管理」→「飲水機訂單」

### 二、訂單列表操作

#### 1. 切換客戶/廠商訂單
- 頁面頂部有「客戶」和「廠商」兩個頁籤
- **客戶訂單**：銷售給客戶的訂單（銷貨）
- **廠商訂單**：向廠商採購的訂單（進貨）

#### 2. 篩選訂單
| 篩選條件 | 說明 |
|---------|------|
| 關鍵字 | 搜尋訂單編號、客戶名稱 |
| 訂單日期 | 選擇日期範圍 |
| 客戶/廠商 | 選擇特定對象 |
| 狀態 | 待出貨/處理中/已完成/取消 |

#### 3. 列表欄位說明
- **訂單編號**：系統自動產生
- **訂單日期**：訂單建立日期
- **客戶/廠商**：訂購對象
- **金額**：訂單總金額
- **狀態**：目前訂單狀態

### 三、新增訂單

1. 點擊右上角「新增訂單」按鈕
2. 填寫訂單資料：
   - **客戶/廠商**（必填）：選擇訂購對象
   - **訂單日期**：預設今天
   - **配送日期**：預計配送日期
   - **配送地址**：選擇或輸入地址
3. 新增商品明細：
   - 點擊「新增商品」
   - 選擇商品、輸入數量
   - 可調整單價
4. 設定折扣/運費（選填）
5. 選擇出貨方式：自取/司機送貨/宅配
6. 點擊「儲存」

### 四、訂單狀態說明

| 狀態 | 說明 | 可執行操作 |
|------|------|-----------|
| **待出貨** | 訂單已建立，等待處理 | 編輯、開始處理、取消 |
| **已出貨-未收款** | 已出貨但尚未收款（後端代碼：`PROCESSING`） | 出貨確認、取消 |
| **已完成** | 訂單已送達完成 | 僅能查看 |
| **取消** | 訂單已取消 | 僅能查看 |

#### 狀態變更操作
- **開始處理**：訂單從「待出貨」變更為「已出貨-未收款」
- **出貨確認**：訂單從「已出貨-未收款」變更為「已完成」
- **取消訂單**：在「已完成」之前都可取消

### 五、編輯訂單

1. 在列表點擊「編輯」按鈕
2. **待出貨**狀態：可修改所有內容
3. **已出貨-未收款**狀態：僅能修改備註、配送資訊
4. **已完成/取消**：無法編輯，僅能查看

### 六、列印訂單出貨單

#### 單筆列印
1. 在操作欄點擊 🖨️（ScrollText 圖示）按鈕
2. 系統自動取得完整訂單資料（含商品明細）
3. 使用 `vue-to-print` 產生 A4 格式 iframe 列印對話框

#### 批次列印
1. 勾選列表中多筆訂單（左側勾選框）
2. 點擊右上角「批次列印」按鈕
3. 系統依序取得每筆完整資料後一次列印，每筆訂單佔一頁

> **列印技術**：採用 `vue-to-print`（`useVueToPrint`），透過 iframe 複製 scoped 樣式後列印，不影響主頁面顯示。  
> **列印元件**：`src/components/dialogs/OrderPrintSlip.vue`  
> 使用 `defineExpose({ printContentRef })` 暴露 DOM ref，父層以 `content: () => orderPrintSlipRef.value?.printContentRef` 取得。  
> 商品過多時自動換頁（CSS `page-break-after`），預設最少顯示 5 行商品列。

### 七、常見問題

**Q: 如何修改已完成的訂單？**
- 已完成訂單無法修改，如需調整請建立折讓單

**Q: 訂單可以刪除嗎？**
- 僅草稿狀態可刪除，其他狀態只能取消

---

## 技術文件

以下為開發人員參考的技術細節。

## 1. 模組架構

為了維護一致性並減少重複代碼，所有訂單管理頁面皆基於一個共用組件構建：

*   **共用組件**: `src/pages/Orders/DataList.vue`
*   **各業務頁面**:
    *   `WaterPage.vue` (飲水訂單) — i18n key: `orderWater`，categoryId: `CATEGORY_IDS.WATER`
    *   `EggPage.vue` (雞蛋訂單) — i18n key: `orderEgg`，categoryId: `CATEGORY_IDS.EGG`
    *   `MachinePage.vue` (飲水機訂單) — i18n key: `orderDispenser`，categoryId: `CATEGORY_IDS.DISPENSER`

各頁面僅需傳遞 `pageTitle` (頁面標題 i18n key) 與 `categoryId` (業務分類 UUID，來自 `src/constants/categories.js`) 給共用組件即可。

> ⚠️ **注意**：`pageTitle` 必須使用 `src/constants/categories.js` 中的 `CATEGORY_IDS`，不可寫死 UUID。API 傳遞的類別代碼為 `BOTTLED_WATER`（飲水）、`EGG`（雞蛋）、`DISPENSER`（飲水機）。

## 2. 視圖與篩選 (View & Filtering)

### 2.1 客戶/廠商分頁 (Tabs)
頁面頂部設有頁籤，用於切換不同的出貨對象類型：
*   **客戶 (CUSTOMER)**：顯示 `targetType = CUSTOMER` 的訂單。
*   **廠商 (VENDOR)**：顯示 `targetType = VENDOR` 的訂單（例如蛋商調貨）。
*   切換頁籤時，列表會自動重新載入並帶入對應的 `targetType` 篩選。

### 2.2 列表篩選器
列表支援多維度篩選，確保資料查找效率：

| 篩選欄位 | UI 組件 | 邏輯說明 |
| :--- | :--- | :--- |
| **關鍵字** | `TinyInput` | 搜尋訂單編號、客戶名稱等。 |
| **訂單日期** | `TinyDatePicker` | 範圍搜尋。前端會自動將結束日期 (`orderDateTo`) 調整為該日 **23:59:59**，確保包含全天資料。 |
| **訂單編號** | `TinyInput` (表頭) | 針對訂單編號進行欄位過濾。 |
| **客戶/廠商** | `InfiniteSelect` (表頭) | 根據目前頁籤顯示對應的客戶或廠商選擇器。 |
| **狀態** | `TinySelect` (表頭) | 提供「待出貨、已出貨-未收款、已完成、取消」四種簡化狀態。 |

## 3. 訂單狀態管理 (Order Status)

系統採用簡化的四狀態模型，並與後端複雜的 Enum 進行雙向映射。

### 3.1 狀態映射規則

> ⚠️ 後端傳回的中文狀態為「處理中」，前端透過 `orderStatusDisplayMap` 轉換為「已出貨-未收款」顯示。`orderStatusLabelMap` 的「處理中」→ `PROCESSING` **不可更動**（後端資料）。

| 前端代碼 (Enum Key) | 前端顯示 (中文) | 後端原始狀態 (Enum) | 後端傳回中文 |
| :--- | :--- | :--- | :--- |
| `PENDING` | **待出貨** | `DRAFT`, `PENDING`, `CONFIRMED` | 待出貨 |
| `PROCESSING` | **已出貨-未收款** | `PROCESSING`, `SHIPPED` | 處理中 |
| `DELIVERED` | **已完成** | `DELIVERED` | 已完成 |
| `CANCELLED` | **取消** | `CANCELLED`, `RETURNED` | 取消 |

**映射來源**（`src/composables/useSelectOptions.js`）：
- `orderStatusLabelMap`：後端中文 → 英文 key（`處理中 → PROCESSING`）
- `orderStatusDisplayMap`：英文 key → 前端顯示文字（`PROCESSING → 已出貨-未收款`）
- `responseDataToList` 的 `statusLabel` 使用 `orderStatusDisplayMap` 轉換

### 3.2 自動晉升機制 (Auto-Promotion)
後端對狀態跳轉有嚴格限制（如 `DRAFT` 不可直接跳 `PROCESSING`）。前端透過 `updateOrderStatusWithAutoPromote` 函式補足中間步驟：
*   轉至 **已出貨-未收款** (`PROCESSING`) 時：若目前為 `DRAFT`，會自動先嘗試補發 `PENDING` 請求。
*   轉至 **已完成** (`DELIVERED`) 時：會自動嘗試補發 `SHIPPED` 請求。
*   中間步驟的錯誤會被忽略（代表已處於該狀態），確保最終能到達目標狀態。

## 4. 編輯與提交邏輯

### 4.1 欄位鎖定規則
*   **PENDING (待出貨)**：可修改所有欄位（包括商品明細與出貨對象）。
*   **PROCESSING (已出貨-未收款)**：核心欄位鎖定（商品、對象、日期），僅可修改備註、配送資訊與狀態。
*   **DELIVERED/CANCELLED (已完成/取消)**：進入**唯讀模式**，僅供檢視，隱藏儲存按鈕。

### 4.2 編輯提交流程
編輯時採用「內容與狀態分離」的策略：
1.  **一般更新**：呼叫 `PATCH /orders/{id}` 更新內容，Payload 中會排除 `status` 與 `orderDate`。
2.  **狀態變更**：若狀態有變動，則額外呼叫 `PATCH /orders/{id}/status` 專用 API，並觸發自動晉升邏輯。

## 6. 儲值扣除機制（Water Bottle Deposit Deduction）

### 6.1 觸發時機

當訂單建立時（`POST /orders`），若該訂單的客戶有針對訂單商品設定儲值，系統會**自動觸發扣除流程**，不需人工操作。

### 6.2 扣除規則

**兩階段 FIFO 扣除（先數量、後金額）：**

#### 第一階段：優先扣「剩餘數量」（remainingQuantity）
- 從最早建立的儲值記錄開始（`orderBy: createdAt ASC`）
- 依序扣除每筆儲值的 `remainingQuantity`
- 直到本次訂單數量全數扣完，或所有儲值的剩餘數量耗盡

#### 第二階段：數量不足時，才扣「剩餘金額」（remainingAmount）
- 若第一階段結束後仍有剩餘數量未被覆蓋
- 使用各儲值的單價折算（`單價 = 儲值金額 ÷ 儲值數量`）
- 以金額形式從 `remainingAmount` 扣除

**規則摘要：**

| 優先順序 | 來源 | 說明 |
|--------|------|------|
| 第 1 優先 | `remainingQuantity` | 優先消耗數量餘額 |
| 第 2 優先 | `remainingAmount` | 數量耗盡後才折算金額 |

**FIFO 原則：** 同一客戶同一商品有多筆儲值時，依建立時間由舊到新依序消耗。

### 6.3 範例

客戶 A 對商品「飲用水」有兩筆儲值：

| 儲值記錄 | 儲值數量 | 剩餘數量 | 儲值金額 | 剩餘金額 |
|---------|--------|--------|--------|--------|
| 2026-01（舊） | 10 桶 | 3 桶 | $1,000 | $300 |
| 2026-03（新） | 20 桶 | 20 桶 | $2,000 | $2,000 |

**訂單出貨 8 桶：**
1. 第一階段：舊記錄扣 3 桶（用完）→ 新記錄扣 5 桶 → 共扣 8 桶完成
2. 結果：舊記錄 `remainingQuantity = 0`，新記錄 `remainingQuantity = 15`

**訂單出貨 25 桶（超過所有剩餘數量）：**
1. 第一階段：舊記錄扣 3 桶 + 新記錄扣 20 桶 = 共 23 桶，仍缺 2 桶
2. 第二階段：舊記錄單價 $100/桶，但剩餘金額 $300 → 扣 2 × $100 = $200
3. 結果：舊記錄 `remainingAmount = $100`

### 6.4 回收數量與滯留桶數（待後端實作）

> ⚠️ 此功能尚待後端完成 Schema migration 後才會上線。

訂單商品明細未來將新增以下欄位：

| 欄位 | 說明 | 來源 |
|------|------|------|
| `recoveredQuantity`（回收數量） | 本次出貨同時回收的空桶數 | 前端使用者輸入，預設 0 |
| `strandedQuantity`（滯留數量） | 此訂單當下累計仍在客戶端的桶數 | 後端自動計算，唯讀 |

**滯留計算公式：**
```
本次滯留數量 = 上一筆訂單的滯留數量 + 本次出貨數量 - 本次回收數量
```

**範例（同一客戶、同一商品連續訂單）：**

| 訂單日期   | 出貨 | 回收 | 滯留（自動計算） |
|------------|------|------|--------------|
| 2026-03-28 | 5    | 0    | 5            |
| 2026-03-29 | 5    | 2    | 8            |
| 2026-03-30 | 2    | 5    | 5            |
| 2026-03-31 | 0    | 3    | 2            |

此欄位與儲值無關，**任何商品均可記錄回收與滯留**（不限有儲值的商品）。

詳細後端實作規格請參考：`後端溝通紀錄/2026-03-31.md`

---

## 7. 開發注意事項

1.  **不可修改欄位**：`orderDate` (訂單日期) 與 `categoryId` (業務分類) 在編輯模式下不應被送出，後端會報錯。
2.  **多語系開發**：新增狀態或操作文字時，必須先在 `zh_TW.json` 等語系檔定義，嚴禁在 `.vue` 檔內撰寫中文。
3.  **UUID 提取**：提交 `customerId`, `vendorId`, `productId`, `driverId` 前，必須通過 `extractUUID()` 確保格式正確。
4.  **Loading 規範**：所有 API 呼叫必須配合 `mainStore.setLoading` 進行狀態管理。

---

## 8. 訂單彈窗 - 選擇對象後的自動帶入邏輯

### 8.1 觸發點

`DataList.vue` 中使用 `InfiniteSelect` 元件讓使用者選擇客戶或廠商：

```html
<!-- 客戶 -->
<InfiniteSelect v-model="basicForm.targetId" dataSource="customers"
  @change="(v) => changeTarget(v, 'customer')" />

<!-- 廠商 -->
<InfiniteSelect v-model="basicForm.targetId" dataSource="vendors"
  @change="(v) => changeTarget(v, 'vendor')" />
```

`InfiniteSelect` 會依 `dataSource` 呼叫對應 API，選定後觸發 `changeTarget(item, type)`。

### 8.2 `changeTarget` 自動帶入欄位一覽

#### 客戶（type = `'customer'`）

| 表單欄位 | 來源欄位 | 說明 |
|---------|---------|------|
| `basicForm.contact` | `customFields.contacts[]` 中 `isPrimary = true` 的 `name` | 主要聯絡人姓名，找不到則為空字串 |
| `basicForm.notes` | `item.notes` | 客戶備註 |
| `basicForm.phone` | `contactInfo.phone` + `contactInfo.phone2` | 兩個電話以 `", "` 合併，空值略過 |
| `basicForm.shippingAddress` | `customFields.companyAddress` + `customFields.companyAddress2` | 兩個地址以 `", "` 合併，空值略過 |
| `originalQtyMap` | —（清空） | 儲值計算基準重置（選新客戶視同新訂單） |
| `depositMap` | API `CustomersStoredGetByID` | 非同步呼叫，取得最新儲值狀況 |

#### 廠商（type = `'vendor'`）

| 表單欄位 | 來源欄位 | 說明 |
|---------|---------|------|
| `basicForm.contact` | `item.contactPerson` | 廠商聯絡人 |
| `basicForm.phone` | `contactInfo.phone` + `contactInfo.phone2` | 與客戶相同邏輯（共用邏輯在 if 外） |

> **注意**：廠商沒有地址帶入、沒有備註帶入、不呼叫 `fetchDeposits`。

### 8.3 執行流程（客戶）

```
選擇客戶
  ↓
1. basicForm.contact  ← 主要聯絡人姓名（customFields.contacts 中 isPrimary = true）
2. basicForm.notes    ← 客戶備註
3. basicForm.phone    ← contactInfo.phone + contactInfo.phone2（以 ", " 合併）
4. basicForm.shippingAddress ← customFields.companyAddress + companyAddress2（以 ", " 合併）
5. originalQtyMap 清空   （儲值計算基準重置，詳見第 9 節）
6. fetchDeposits(item.id) ← 呼叫 CustomersStoredGetByID 取得儲值狀況
```

### 8.4 編輯既有訂單時的觸發

編輯訂單（`editData`）不會經過 `changeTarget`，而是在 `editData` 內直接：
- 帶入所有表單欄位（含 `shippingAddress`、`phone` 等）
- 若 `targetType === 'CUSTOMER'`，自動呼叫 `fetchDeposits(orderData.targetId)` 取得儲值狀況

### 8.5 「待出貨」訂單自動補齊欄位（`mergeTargetFieldsIntoForm`）

當訂單狀態為 `PENDING`（待出貨）時，`editData` 在帶入表單後，會呼叫 `CustomersGetByID` / `VendorGetByID` 取得**對象最新資料**，並透過 `mergeTargetFieldsIntoForm` 將新增的資料補進訂單欄位。

> **為什麼只在「待出貨」？** 待出貨代表訂單尚未出貨，客戶資料仍可能更新，適合自動補齊；處理中以後視為已確認出貨資訊，不自動修改。

> **注意：後端回傳 status 是中文**（如 `"待出貨"`），`editData` 會透過 `orderStatusLabelMap` 轉為英文 key（`'PENDING'`）再進行判斷。

#### 補齊規則（不覆蓋既有內容）

| 欄位 | 比對邏輯 | 補齊方式 |
|------|---------|---------|
| `phone` | 比對每個電話號碼（trim 後精確比對） | 客戶新增的號碼附加在現有電話後，以 `", "` 分隔 |
| `shippingAddress` | 比對每段地址（trim 後精確比對） | 客戶新增的地址附加在現有地址後，以 `", "` 分隔 |
| `notes` | 比對是否已包含客戶備註字串 | 若訂單備註尚未包含客戶備註，換行後附加 |

> **注意**：
> - 原本的訂單資料**永遠在前**，新補的在後
> - 廠商只補 `phone`，不補地址和備註
> - 僅在 `PROCESSING` 狀態才執行；`PENDING`、`DELIVERED`、`CANCELLED` 不補
> - 取得對象資料失敗時靜默忽略（不影響開啟訂單）

#### 範例

| | 訂單現有值 | 客戶最新值 | 補齊後結果 |
|--|-----------|----------|-----------|
| 電話 | `0911111111` | `0922222222, 0933333333` | `0911111111, 0922222222, 0933333333` |
| 地址 | `台中市西區台灣大道123號` | `台中市北區健行路222號, 台中市西區台灣大道123號` | `台中市西區台灣大道123號, 台中市北區健行路222號` |
| 備註 | `早上送達` | `送達前須先電聯` | `早上送達`<br>`送達前須先電聯` |

---

## 9. ProductSelectionTable - 自訂價格顏色 + 儲值狀況欄位

### 9.1 自訂商品價格（黃底標示）

`ProductSelectionTable` 元件透過 `:row-class-name` 判斷每一列是否有自訂價格：

- 資料來源：`basicForm.targetId.customFields.customPrices[]`
- 若該商品在 `customPrices` 中找到對應紀錄 → 該列加上 `.custom-price-row`（**黃底**）
- 使用者在輸入商品時即可一眼識別哪些商品有客戶特殊定價

### 9.2 儲值狀況欄位（水桶訂單專用）

#### 資料來源

呼叫 `GET /customers/{id}/stored?limit=100`（`CustomersStoredGetByID`），回傳格式：

```js
// depositMap 結構（依 productId 為 key）
{
  [productId]: {
    remainingQuantity: number,  // 剩餘桶數
    remainingAmount: number,    // 剩餘金額
  }
}
```

#### 顯示邏輯

| 狀態 | 顯示 | 顏色 |
|------|------|------|
| `remainingQuantity > 0` 或 `remainingAmount > 0` | `N 桶 / $M` | 🟢 綠色 |
| `remainingQuantity < 0` | `-N 桶 / $M` | 🔴 紅色 |
| 兩者皆為 0 | `0 桶 / $0` | 黑色（預設） |

#### 即時預覽計算（Optimistic Update）

前端在**使用者修改數量時**才進行假計算（以 API 最新數據為基準）：

```
delta = 目前輸入數量 - 原始數量（openCreateDialog 時為 0；editData 時為訂單原始數量）

newQty = API.remainingQuantity - delta

若 newQty < 0（數量不夠）：
  overflow = -newQty
  可補桶數 = floor(API.remainingAmount / 商品單價)
  實際補桶數 = min(overflow, 可補桶數)
  newAmt = API.remainingAmount - 實際補桶數 × 商品單價
  newQty = (overflow - 實際補桶數) > 0 ? -(overflow - 實際補桶數) : 0
```

**重要規則：**
- `remainingAmount` 永遠不會是負數
- 只有 `remainingQuantity` 才會是負數
- 未改過數量的商品 → 直接顯示 API 原始值（不做預覽計算）
- 商品單價優先使用客戶自訂價（`customPrices`），否則用商品預設售價

#### 關鍵 refs

| 變數 | 說明 |
|------|------|
| `depositMap` | API 回傳的儲值原始數據（以 productId 為 key） |
| `originalQtyMap` | 彈窗開啟時的數量快照（用於計算 delta） |

---

## 🤖 Agent 協作說明

> 本節提供給 AI Agents（如 GitHub Copilot CLI）或協作者快速了解此模組的核心流程，避免重複踩坑。

### 快速定位

| 目標 | 位置 |
|------|------|
| 訂單列表 + 新增/編輯彈窗 | `src/pages/Orders/DataList.vue` |
| 商品選擇表格元件 | `src/components/ProductTable/ProductSelectionTable.vue` |
| 列印三聯單元件 | `src/components/dialogs/OrderPrintSlip.vue` |
| 訂單 API 呼叫 | `src/assets/API/Order.js` |
| 客戶 API 呼叫 | `src/assets/API/Customers.js` |
| 狀態/選項對應表 | `src/composables/useSelectOptions.js` |
| 分類 ID 常數 | `src/constants/categories.js` |

### 常見任務與注意事項

#### ✅ 新增表單欄位
1. 在 `initializeForm()` 加上預設值
2. 在 template 中加上對應的 `<a-form-item>`
3. 在 `buildPayload()` 加入送出邏輯
4. 在 `editData()` 加入載入既有資料的邏輯

#### ✅ 修改客戶自動帶入欄位
- 在 `changeTarget(item, 'customer')` 內修改
- 客戶資料結構：
  ```js
  item.contactInfo?.phone      // 電話1
  item.contactInfo?.phone2     // 電話2
  item.customFields?.companyAddress   // 地址1
  item.customFields?.companyAddress2  // 地址2
  item.customFields?.contacts         // 聯絡人列表
  item.customFields?.customPrices     // 自訂商品價格
  ```

#### ✅ 修改儲值計算邏輯
- 核心函式：`getDepositDisplay(record)`（在 `DataList.vue`）
- 計算規則詳見第 9.2 節與 `後端溝通紀錄/2026-04-10.md`
- 後端對應函式：`deductWaterBottleDeposit`（`eggdrop-crm/apps/api/src/modules/orders/orders.service.ts`）

#### ✅ 修改訂單狀態流程
- 狀態映射：`orderStatusLabelMap` / `orderStatusDisplayMap`（`useSelectOptions.js`）
- 自動晉升邏輯：`updateOrderStatusWithAutoPromote()`（`DataList.vue`）
- 詳見第 3 節

#### ⚠️ 容易踩到的坑

| 問題 | 原因 | 解法 |
|------|------|------|
| 編輯訂單時儲值狀況不顯示 | `fetchDeposits` 只在 `changeTarget` 觸發 | `editData()` 裡也要呼叫 `fetchDeposits` |
| 儲值計算一開始就跑預覽 | 沒有區分「原始數量」vs「目前數量」 | 用 `originalQtyMap` 記錄快照，delta=0 時顯示 API 原始值 |
| payload 送出 UUID 格式錯誤 | `targetId` 是物件 `{ id, name }` | 一律透過 `extractUUID()` 取值 |
| 狀態更新 400 錯誤 | 後端不允許跳級（如 DRAFT → PROCESSING） | 使用 `updateOrderStatusWithAutoPromote()` |
| `shippingAddress` 送空物件報錯 | 後端改為純字串，不接受 `{}` 物件 | 用 `''` 當預設值，有值才送 |

### 後端溝通紀錄索引

| 日期 | 主題 |
|------|------|
| `後端溝通紀錄/2026-04-09.md` | `deductWaterBottleDeposit` Phase 2 Dead Code 問題 |
| `後端溝通紀錄/2026-04-10.md` | 儲值計算邏輯說明 + Phase 2 單價來源錯誤（應用客戶自訂價） |

---
*最後更新：2026-04-17*
