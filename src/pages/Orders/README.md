# 訂單管理模組 (Order Management)

本文件說明 `src/pages/order-management` 下的訂單管理頁面邏輯，包含前端操作流程、狀態流轉規則以及與後端 API 的整合細節。

## 1. 模組架構

為了維護一致性並減少重複代碼，所有訂單管理頁面皆基於一個共用組件構建：

*   **共用組件**: `src/pages/order-management/components/OrderManagementBase.vue`
*   **各業務頁面**:
    *   `BottledWaterOrdersPage.vue` (桶裝水訂單)
    *   `EggOrdersPage.vue` (雞蛋訂單)
    *   `WaterDispenserOrdersPage.vue` (飲水機訂單)

各頁面僅需傳遞 `pageTitle` (頁面標題 i18n key) 與 `categoryId` (業務分類 UUID) 給共用組件即可。

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
| **狀態** | `TinySelect` (表頭) | 提供「待出貨、處理中、已完成、取消」四種簡化狀態。 |

## 3. 訂單狀態管理 (Order Status)

系統採用簡化的四狀態模型，並與後端複雜的 Enum 進行雙向映射。

### 3.1 狀態映射規則

| 前端代碼 (Enum Key) | 前端顯示 (中文) | 後端原始狀態 (Enum) |
| :--- | :--- | :--- |
| `PENDING` | **待出貨** | `DRAFT`, `PENDING`, `CONFIRMED` |
| `PROCESSING` | **處理中** | `PROCESSING`, `SHIPPED` |
| `DELIVERED` | **已完成** | `DELIVERED` |
| `CANCELLED` | **取消** | `CANCELLED`, `RETURNED` |

### 3.2 自動晉升機制 (Auto-Promotion)
後端對狀態跳轉有嚴格限制（如 `DRAFT` 不可直接跳 `PROCESSING`）。前端透過 `updateOrderStatusWithAutoPromote` 函式補足中間步驟：
*   轉至 **處理中** (`PROCESSING`) 時：若目前為 `DRAFT`，會自動先嘗試補發 `PENDING` 請求。
*   轉至 **已完成** (`DELIVERED`) 時：會自動嘗試補發 `SHIPPED` 請求。
*   中間步驟的錯誤會被忽略（代表已處於該狀態），確保最終能到達目標狀態。

## 4. 編輯與提交邏輯

### 4.1 欄位鎖定規則
*   **PENDING (待出貨)**：可修改所有欄位（包括商品明細與出貨對象）。
*   **PROCESSING (處理中)**：核心欄位鎖定（商品、對象、日期），僅可修改備註、配送資訊與狀態。
*   **DELIVERED/CANCELLED (已完成/取消)**：進入**唯讀模式**，僅供檢視，隱藏儲存按鈕。

### 4.2 編輯提交流程
編輯時採用「內容與狀態分離」的策略：
1.  **一般更新**：呼叫 `PATCH /orders/{id}` 更新內容，Payload 中會排除 `status` 與 `orderDate`。
2.  **狀態變更**：若狀態有變動，則額外呼叫 `PATCH /orders/{id}/status` 專用 API，並觸發自動晉升邏輯。

## 5. 開發注意事項

1.  **不可修改欄位**：`orderDate` (訂單日期) 與 `categoryId` (業務分類) 在編輯模式下不應被送出，後端會報錯。
2.  **多語系開發**：新增狀態或操作文字時，必須先在 `zh_TW.json` 等語系檔定義，嚴禁在 `.vue` 檔內撰寫中文。
3.  **UUID 提取**：提交 `customerId`, `vendorId`, `productId`, `driverId` 前，必須通過 `extractUUID()` 確保格式正確。
4.  **Loading 規範**：所有 API 呼叫必須配合 `mainStore.setLoading` 進行狀態管理。

---
*最後更新：2026-01-16*
