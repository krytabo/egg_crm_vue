# EggDrop CRM — 前端管理系統

專為飲水、雞蛋、飲水機配送業務設計的 CRM 管理後台，使用 Vue 3 + Vite 開發。

---

## 技術堆疊

| 類型 | 技術 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 建置工具 | Vite |
| 狀態管理 | Pinia |
| UI 元件 | OpenTiny Vue、Arco Design、Ionic Vue、TDesign Mobile |
| 樣式 | Tailwind CSS v4 |
| HTTP | Axios |
| 行動端 | Ionic Framework |
| 多語系 | 自建 i18n（zh_TW / zh_CN / en） |

---

## 啟動方式

```bash
# 安裝依賴
npm install
# 或
pnpm install

# 啟動開發伺服器
npm run dev

# 建置正式版
npm run build
```

---

## 專案結構

```
egg_crm_vue/
├── src/
│   ├── assets/
│   │   ├── API/              # API 說明文件（markdown）
│   │   └── Language/         # 多語系翻譯檔（zh_TW / zh_CN / en）
│   │       ├── Public/       # 全站共用語系
│   │       ├── Customer/     # 客戶模組語系
│   │       └── ...           # 各模組語系
│   ├── components/
│   │   ├── dialogs/          # 彈窗元件（送貨報表、訂單等）
│   │   ├── layout/           # 佈局元件（側邊欄、Header 等）
│   │   ├── ProductTable/     # 商品表格元件（含說明文件）
│   │   ├── Form/             # 表單元件
│   │   ├── Table/            # 表格元件
│   │   └── ui/               # 通用 UI 元件
│   ├── composables/
│   │   ├── useSelectOptions.js     # 下拉選項（客戶類別、訂單類型等）
│   │   ├── usePaginatedSearchApi.js # 分頁搜尋 API 封裝
│   │   ├── useDisplayMode.js       # 顯示模式（桌面/手機切換）
│   │   └── useFileExport.js        # 檔案匯出
│   ├── constants/
│   │   ├── categories.js     # 訂單/商品分類 ID 常數（CATEGORY_IDS）
│   │   └── index.js
│   ├── docs/                 # 技術文件（架構圖、流程圖、API 規格）
│   ├── layouts/              # 頁面佈局
│   ├── lib/                  # Mock 資料、工具函式
│   ├── pages/
│   │   ├── AuthPage/         # 登入頁面
│   │   ├── BasicInfo/        # 基本資料（客戶、員工、廠商、車輛、司機）
│   │   ├── dashboard/        # 儀表板
│   │   ├── Finance/          # 帳務管理
│   │   ├── Orders/           # 訂單管理（飲水 / 雞蛋 / 飲水機）
│   │   ├── Products/         # 商品管理（飲水 / 雞蛋 / 飲水機）
│   │   ├── Settings/         # 參數設定（角色 / 權限 / 產品類型）
│   │   └── Shipments/        # 配送物流（司機送貨報表）
│   ├── router/               # Vue Router 路由設定
│   ├── stores/               # Pinia 狀態管理
│   └── utils/                # 工具函式
├── public/                   # 靜態資源
├── project-log.md            # 每日開發紀錄（請每次開始前閱讀）
├── API_Documentation.md      # API 串接說明
├── backend-communication-log.md # 後端溝通紀錄
├── vite.config.mjs
└── package.json
```

---

## 商品分類常數

所有訂單、商品分類一律使用 `src/constants/categories.js` 中的 `CATEGORY_IDS`，**禁止寫死 UUID**：

```js
// src/constants/categories.js
export const CATEGORY_IDS = {
  EGG:      '959ff8c8-8bc7-4164-91b1-f2491142075b', // 雞蛋
  WATER:    'e106af10-17d4-4f4d-9ccf-8dfd5fbfe0b6', // 飲水（API 代碼：BOTTLED_WATER）
  DISPENSER:'b2eb8750-10d5-4f90-803f-71ed3ae264da', // 飲水機（目前隱藏）
}
```

> ⚠️ 後端 API 的分類代碼仍為 `BOTTLED_WATER`（飲水）、`EGG`（雞蛋）、`DISPENSER`（飲水機）。
> 前端顯示名稱使用「飲水」，但傳給 API 的代碼維持 `BOTTLED_WATER`。

---

## 多語系 i18n Key（分類相關）

| Key | 中文（zh_TW） | 用途 |
|-----|-------------|------|
| `water` | 飲水 | 分類名稱 |
| `egg` | 雞蛋 | 分類名稱 |
| `dispenser` | 飲水機 | 分類名稱（隱藏中） |
| `orderWater` | 飲水訂單 | 訂單頁標題 |
| `orderEgg` | 雞蛋訂單 | 訂單頁標題 |
| `orderDispenser` | 飲水機訂單 | 訂單頁標題（隱藏中） |
| `allOrders` | 全部訂單 | 客戶抽屜分類 Tab（隱藏中） |

---

## 說明文件導覽

### 開發紀錄

| 文件 | 說明 |
|------|------|
| [`project-log.md`](./project-log.md) | 每次修改的執行內容、檔案異動、待處理項目 |
| [`API_Documentation.md`](./API_Documentation.md) | 前端串接的 API 說明 |
| [`backend-communication-log.md`](./backend-communication-log.md) | 與後端溝通的問題與確認紀錄 |

### 各模組操作說明

| 文件 | 說明 |
|------|------|
| [`src/pages/OperationManual.md`](./src/pages/OperationManual.md) | 全系統操作手冊（總覽） |
| [`src/pages/BasicInfo/README.md`](./src/pages/BasicInfo/README.md) | 基本資料模組（客戶、員工、廠商、車輛、司機） |
| [`src/pages/Orders/README.md`](./src/pages/Orders/README.md) | 訂單管理模組 |
| [`src/pages/Products/README.md`](./src/pages/Products/README.md) | 商品管理模組 |
| [`src/pages/Finance/README.md`](./src/pages/Finance/README.md) | 帳務管理模組 |
| [`src/pages/Shipments/README.md`](./src/pages/Shipments/README.md) | 配送物流模組 |
| [`src/pages/Settings/README.md`](./src/pages/Settings/README.md) | 參數設定模組 |
| [`src/pages/dashboard/README.md`](./src/pages/dashboard/README.md) | 儀表板 |
| [`src/pages/RouterChange.md`](./src/pages/RouterChange.md) | 路由重構對照表（舊路由 → 新路由） |

### 技術架構文件

| 文件 | 說明 |
|------|------|
| [`src/docs/README.md`](./src/docs/README.md) | 技術文件總覽 |
| [`src/docs/INDEX.md`](./src/docs/INDEX.md) | 文件索引（依職位角色分類） |
| [`src/docs/System-Architecture-Diagram.md`](./src/docs/System-Architecture-Diagram.md) | 系統架構圖 |
| [`src/docs/ERD-Entity-Relationship-Diagram.md`](./src/docs/ERD-Entity-Relationship-Diagram.md) | 資料庫 ER 圖 |
| [`src/docs/Business-Process-Flowchart.md`](./src/docs/Business-Process-Flowchart.md) | 業務流程圖 |
| [`src/docs/Data-Flow-Diagram.md`](./src/docs/Data-Flow-Diagram.md) | 資料流程圖 |
| [`src/docs/API-Specification.md`](./src/docs/API-Specification.md) | API 規格文件（完整版） |
| [`src/docs/API-Quick-Reference.md`](./src/docs/API-Quick-Reference.md) | API 快速參考 |
| [`src/docs/crud-coding-standards.md`](./src/docs/crud-coding-standards.md) | CRUD 開發規範 |
| [`src/docs/usePaginatedSearchApi-guide.md`](./src/docs/usePaginatedSearchApi-guide.md) | 分頁搜尋 composable 使用說明 |

### 元件說明

| 文件 | 說明 |
|------|------|
| [`src/components/ProductTable/README.md`](./src/components/ProductTable/README.md) | 商品選擇表格元件說明 |
| [`src/stores/PermissionStore.md`](./src/stores/PermissionStore.md) | 權限管理說明 |

---

## 開發規範

- `<script setup>` 段落排序：**常數與選項 → 分頁設定 → 共用工具 → 篩選與查詢 → 資料取得 → 新增編輯相關**
- 表單命名：`initializeForm`、`basicForm`（ref）、`basicFormRules`、`basicFormRef`
- 列表資料：`basicDataList`
- 搜尋函式：`clearFilter`、`handleGlobalSearch`、`handleFiltersChange`
- 分頁函式：`CurrentChange`、`SizeChange`
- **修改程式碼時，如有相關說明文件（.md），需一併更新**

---

## 授權

私有專案 — 保留所有權利
