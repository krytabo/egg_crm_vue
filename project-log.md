# 專案每日紀錄（請每次開專案先閱讀本檔案）
> 流程提醒：每次開始執行任務前，務必先檢查此檔案中是否仍有未完成項目；若尚未執行，可先提問確認是否要進行。完成任務時，請以刪除線（或額外的「已完成」註記）保留原紀錄並標明完成時間，確保整體歷程完整保留。
> 命名/排序提醒：所有 `<script setup>` 段落請依「常數與選項 → 分頁設定 → 共用工具 → 篩選與查詢 → 資料取得 → 新增編輯相關」排序，並在每個函式行尾保留中文備註；表單需維持 `initializeForm`、`basicForm`（ref）、`basicFormRules`、`basicFormRef` 組合，列表資料用 `basicDataList`，搜尋相關函式統一為 `clearFilter`、`handleGlobalSearch`、`handleFiltersChange`，分頁函式固定為 `CurrentChange`、`SizeChange`。

## 2025-12-16
### 今日執行內容
1. 重新檢查供應商編輯流程，確認即便依 Swagger 範例填滿 `name/contactPerson/email/phone/address/productTypeCode/paymentTerms/isActive`，後端 `/vendors/:id` PATCH 仍回 `Invalid vendor data`。
2. 分析 `UpdateVendorValidationPipe` 與全域 `ValidationPipe` 的限制，推斷後端在解析請求時將 body 視為空物件，並整理吐回 400 的可能原因（空欄位、代理層未帶 payload 等）。
3. 將上述結果與待後端確認事項分別記錄在 `project-log.md` 與 `backend-communication-log.md` 的 2025-12-16 區段，確保日誌日期與實際紀錄時間一致。
4. 新增「參數設定－產品類型」頁（`ProductTypeSettingsPage.vue`），串接 `/product-types` 列表與 CRUD、提供搜尋與可刪除篩選，統一使用 `mainStore.setLoading`。
5. `VendorManagementPage` 的產品類型選項改為透過 `/product-types` 即時載入，移除寫死的常數清單，並同步更新表單/篩選顯示邏輯。
6. 重新整理 `ProductTypeSettingsPage.vue` 的 `<script setup>` 結構，全面比照 `EmployeeManagementPage.vue` 的段落命名、函式註解、loading 控制與 `clearFilter` / 分頁方法，確保後續維護遵循同一套風格。
7. `CustomerManagementPage.vue`、`ProductManagementBase.vue`、`VendorManagementPage.vue` 的 `<script setup>` 依員工頁規範重排段落（常數/選項 → 分頁 → 共用工具 → 篩選 → 資料 → 新增編輯）、統一函式命名（`initializeForm`/`basicForm`/`basicFormRules`/`basicFormRef`、`clearFilter`、`handleGlobalSearch`、`CurrentChange`/`SizeChange`）並將表單資料改成 `ref` 以利共用處理。

### 新增/延續的既知問題
- 2025-12-16：`/vendors/:id` PATCH 仍持續 `Invalid vendor data`，已在 `backend-communication-log.md` 建立條目並等待後端確認。
- 先前列出的問題（`/products` basePrice 排序 500、產品無 unit/primaryVendor 等排序、客戶 salesRep/tags 選項、潛在客戶欄位尚未確認、員工角色來源、供應商 address 空值）仍待處理，詳見 2025-12-15 區段。

### 今日後續指派
- 按既有待辦（`/products` 排序、潛在客戶欄位、salesRep/tags 選項、每日更新 log 等）持續追蹤，待後端回覆後再進一步實作。
- `VendorManagementPage` 編輯流程需加上前端防呆（所有 address 欄位需有值或避免送出），但在後端回覆前暫停調整，避免反覆變更。

## 2025-12-15
### 今日執行內容
1. 將 `CustomerManagementPage` 改為符合 `/customers` 既有 API：列表篩選改成 type/segment/source/status/salesRep/tags，表單也新增同樣欄位並處理 tags 陣列化與狀態僅於編輯送出。
2. 產品共用頁 `ProductManagementBase` 維持後端目前支援的排序欄位（name、code、currentStock、updatedAt），並移除售價/單位/供應商/冷藏/狀態等尚無後端排序的觸發，以免送出無效 sortBy；保留價格與標籤、供應商等篩選。
3. `api_documentation.md` 恢復與現有後端一致的說明，避免記載尚未提供的排序欄位或行為。
4. 建立 `backend-communication-log.md`，紀錄需要後端協助的項目（如 `sortBy=basePrice` 500 錯誤、unit/primaryVendor/isPerishable/status 排序需求）。
5. 依 `/users` API 規格重構 `EmployeeManagementPage`：新增全域搜尋 / 職務 / 狀態篩選，整理 sortBy 映射，補齊 TinyForm 驗證（姓、名、Email、職務、密碼），修正 payload（roleNames、isActive）並動態建立角色選項。
6. `CustomerManagementPage`、`ProductManagementBase` 改回「各欄表頭即搜尋/篩選控制」的布局，並統一使用 `mainStore.setLoading` 控制列表/刪除等主要 loading，僅保留 `isSaving`/`detailLoading` 等局部狀態。
7. 依 `/potential-customers` API 文件重寫潛在客戶頁：新增欄位表頭篩選、排序、清除搜尋按鈕，統一使用 `mainStore.setLoading`，串接 `PotentialCustomers` API (列表/新增/編輯/刪除/載入單筆)，補齊表單必填驗證並支援假資料/自訂價格/標籤陣列化。
8. 更新 `backend-communication-log.md`，新增潛在客戶 API 與文件可能不一致的追蹤項。
9. 供應商頁 (`VendorManagementPage`) 重構為串接 `/vendors` API：表頭搜尋拆成姓名/電話、搜尋欄記錄最後觸發欄位、產品類型/狀態篩選、排序（含降冪修正）、清除全部搜尋、全域 loading、TinyForm 驗證與 CRUD；產品類型動態載入 `/product-types`，編輯與新增皆能送出正確的 `productTypeCode`。
10. 針對供應商編輯時出現 `Invalid vendor data` 進行回溯：確認後端 `UpdateVendorValidationPipe` 會在收到空物件時直接丟出此訊息，而全域 `ValidationPipe` 會在欄位不符合 DTO（例如送出空的 address 欄位）時把 body 視為無效，因此目前前端一律送出的 address 物件只要帶有空字串就會導致整筆 payload 被清掉。

### 既知問題 / 待辦
1. `/products` 使用 `sortBy=basePrice` 仍會 500（Internal Server Error）。
2. 產品尚缺 unit/primaryVendor/isPerishable/status 等後端排序支援，前端暫停這些排序。
3. 客戶頁 `salesRepId`、`tags` 仍為自由輸入，需要後端提供選項 API 才能優化。
4. 潛在客戶 API 的實際欄位/回傳資料尚未確認，需待後端提供正式欄位後再調整。
5. 員工頁角色/職務清單目前依列表動態擴充，若後端提供角色 API 需同步整合。
6. 供應商編輯送出時若 address 任何欄位為空字串，後端 ValidationPipe 會清空整個 body 進而回傳 `Invalid vendor data`，前端需在產生 payload 時排除空欄位或要求使用者填滿。

### 下一步建議
1. 等後端回覆 `products` 與 `potential-customers` API 欄位後再開啟額外排序/欄位；收到更新時同步維護 `api_documentation.md` 與前端實作。
2. 安排可連線時段實測客戶、潛在客戶、產品 CRUD 流程並紀錄成功/失敗結果。
3. 規劃 salesRep/tags 選項載入方式（若後端提供對應 API），並更新畫面下拉 UI。
4. 之後啟動任務前先閱讀此檔與 `backend-communication-log.md`，工作完成後記錄進展與下一步。
5. 調整 `VendorManagementPage` 編輯流程：僅在所有 address 欄位都有值時才送出整個 address，或於送出前強制使用者補齊，以避免後端視為空物件。

### 後續執行狀態（請依序處理並記錄結果）
- [ ] **步驟 1**：等待後端針對 `/products` 排序與潛在客戶欄位需求回覆，取得回覆後同步調整前端與文件。
- [ ] **步驟 2**：於可連線狀態下實測 `CustomerManagementPage`/`PotentialCustomerManagementPage`/`ProductManagement` 新增、編輯、刪除流程並記錄結果。
- [ ] **步驟 3**：評估是否引入 `salesRep`、`tags` 選項 API；若尚未提供，於 `backend-communication-log.md` 紀錄並暫 keep 自由輸入。
- [ ] **通用要求**：每天結束前更新本 log（今日完成事項、遇到的問題、隔天待辦）。
