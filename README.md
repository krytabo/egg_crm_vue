# EggDrop CRM 客戶關係管理系統

專為雞蛋與瓶裝水配送業務設計的完整 CRM 管理系統，採用 Monorepo 架構，包含 NestJS 後端 API 與 Vue 3 前端應用程式。

## 系統架構總覽

```
.
├── apps/
│   ├── api/                # NestJS 後端 API
│   │   ├── src/
│   │   │   ├── modules/    # 業務模組 (認證, 客戶, 訂單等)
│   │   │   ├── common/     # 共用工具, 過濾器, 攔截器
│   │   │   └── config/     # 設定檔
│   │   ├── prisma/         # 資料庫綱要與遷移
│   │   └── openapi/        # 產生的 OpenAPI 文檔
│   │
│   └── web/                # Vue 3 前端
│       ├── src/
│       │   ├── pages/      # 頁面路由
│       │   ├── components/ # 可重用元件
│       │   ├── stores/     # Pinia 狀態管理
│       │   └── api/        # API 客戶端
│       └── dist/           # 建置檔案
│
├── packages/
│   ├── types/              # 共享 TypeScript 型別
│   ├── sdk/                # 產生的 API 客戶端 SDK
│   └── ui/                 # 共享 UI 元件 (未來使用)
│
├── docker-compose.yml      # 開發環境服務
└── turbo.json             # Turborepo 管道設定
```

## 技術堆疊

### 後端 (NestJS)

- **框架**: NestJS with Node 20 LTS
- **資料庫**: PostgreSQL with Prisma ORM
- **快取/佇列**: Redis with BullMQ
- **認證**: JWT with RBAC (基於角色的存取控制)
- **檔案儲存**: MinIO/S3 相容
- **文檔**: Swagger/OpenAPI
- **測試**: Jest with TDD 開發流程

### 前端 (Vue 3)

- **框架**: Vue 3 with Vite
- **狀態管理**: Pinia
- **UI 元件**: Headless UI + Tailwind CSS
- **圖表**: Chart.js
- **HTTP 客戶端**: Axios with generated SDK
- **測試**: Vitest + Vue Testing Library

### 基礎設施

- **Monorepo**: Turborepo + pnpm workspaces
- **容器化**: Docker + Docker Compose
- **型別安全**: TypeScript 全面使用
- **程式碼品質**: ESLint + Prettier

## 核心業務模組

系統包含以下業務模組：

- **認證與使用者管理** ✅: 身分驗證、授權、使用者管理
- **客戶管理**: 客戶資料管理，自訂欄位與 CTI 整合
- **訂單管理**: 訂單處理與修改追蹤
- **產品管理**: 雞蛋、瓶裝水與耗材產品目錄
- **庫存管理**: 庫存追蹤、異動與調整
- **帳務管理**: 發票開立、付款與應收帳款
- **供應商管理**: 供應商資料與採購管理
- **車輛管理**: 車隊管理與保養追蹤
- **司機管理**: 司機資料與日報管理
- **報表系統**: 非同步報表產生 (CSV/PDF)
- **檔案管理**: 集中式檔案管理與 S3 整合
- **通知系統**: 多通道通知 (Email/SMS/LINE)
- **CTI 整合**: 電腦電話整合系統
- **KPI 儀表板**: 關鍵績效指標與分析

## 快速開始

### 系統需求

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (或使用 Docker)

### 開發環境設定

1. **複製專案並安裝相依性**

   ```bash
   git clone <repository>
   cd eggdrop-crm
   pnpm install
   ```

2. **啟動開發服務**

   ```bash
   # 啟動 PostgreSQL, Redis, MinIO
   docker-compose up -d
   ```

3. **設定環境變數**

   ```bash
   # 複製環境變數範本
   cp .env.example .env

   # 產生 Prisma 客戶端
   cd apps/api
   pnpm db:generate

   # 執行資料庫遷移
   pnpm db:migrate
   ```

4. **啟動開發伺服器**

   ```bash
   # 啟動全部應用程式
   pnpm dev

   # 或分別啟動 (推薦用於 API 開發)
   pnpm --filter @eggdrop/api dev     # 僅啟動 API
   pnpm --filter @eggdrop/web dev     # 僅啟動前端
   ```

### 僅執行 API 伺服器 (後端開發)

如果您只需要開發 API 而不需要前端界面：

```bash
# 方法 1: 使用 pnpm 過濾器 (推薦)
pnpm --filter @eggdrop/api dev

# 方法 2: 在 API 目錄內執行
cd apps/api
pnpm dev
```

### 重要網址

- **前端應用**: http://localhost:5173
- **API 伺服器**: http://localhost:3000
- **API 文檔 (Swagger)**: http://localhost:3000/api/docs
- **健康檢查**: http://localhost:3000/health
- **資料庫管理 (Prisma Studio)**: http://localhost:5555
- **Redis 管理**: http://localhost:8081
- **MinIO 控制台**: http://localhost:9001

## 可用指令

```bash
# 開發
pnpm dev              # 啟動所有應用程式開發模式
pnpm build            # 建置所有套件與應用程式
pnpm test             # 執行所有套件測試

# 資料庫
pnpm db:generate      # 產生 Prisma 客戶端
pnpm db:migrate       # 執行資料庫遷移
pnpm db:seed          # 資料庫種子資料

# API 特定指令
pnpm --filter @eggdrop/api dev          # 僅啟動 API
pnpm --filter @eggdrop/api test         # API 測試
pnpm --filter @eggdrop/api test:watch   # TDD 監控模式測試
pnpm --filter @eggdrop/api test:cov     # 測試覆蓋率報告
pnpm --filter @eggdrop/api db:studio    # 開啟 Prisma Studio

# 程式碼品質
pnpm lint             # 檢查所有套件
pnpm format           # 使用 Prettier 格式化程式碼
pnpm typecheck        # 型別檢查所有套件

# Docker
pnpm docker:dev       # 啟動開發服務
pnpm docker:down      # 停止開發服務

# API 文檔
pnpm openapi:generate # 從 OpenAPI 規格產生 SDK
```

## 環境變數設定

複製 `.env.example` 至 `.env` 並設定：

```bash
# 資料庫
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eggdrop_crm"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# 儲存服務 (開發環境使用 MinIO)
MINIO_ENDPOINT="localhost"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# API 設定
API_PORT=3000
API_CORS_ORIGIN="http://localhost:5173"

# 前端設定
VITE_API_BASE_URL="http://localhost:3000"
```

## 專案結構詳解

### 後端結構 (`apps/api/`)

```
src/
├── modules/
│   ├── auth/           # 認證與 JWT ✅
│   ├── users/          # 使用者管理 ✅
│   ├── customers/      # 客戶管理
│   ├── orders/         # 訂單處理
│   ├── products/       # 產品目錄
│   ├── inventory/      # 庫存管理
│   ├── billing/        # 發票與付款
│   ├── vendors/        # 供應商管理
│   ├── vehicles/       # 車輛管理
│   ├── drivers/        # 司機管理
│   ├── reports/        # 報表產生
│   ├── files/          # 檔案管理
│   ├── notifications/  # 多通道通知
│   ├── cti/           # 電話整合
│   ├── kpi/           # 分析與 KPI
│   ├── health/        # 健康檢查
│   └── prisma/        # 資料庫服務
├── common/
│   ├── guards/        # 認證防護
│   ├── filters/       # 例外過濾器
│   ├── interceptors/  # 請求/回應攔截器
│   ├── decorators/    # 自訂裝飾器
│   └── dto/           # 資料傳輸物件
├── config/            # 設定模組
└── test-utils/        # 測試工具 ✅
```

### 前端結構 (`apps/web/`)

```
src/
├── pages/             # 路由元件
├── components/        # 可重用 UI 元件
├── stores/            # Pinia 狀態儲存
├── api/              # API 客戶端封裝
├── composables/      # Vue 組合函式
├── utils/            # 工具函式
└── styles/           # 全域樣式
```

## 核心功能

### 後端功能

- ✅ 模組化 NestJS 架構
- ✅ 完整 Prisma 綱要與所有業務實體
- ✅ JWT 認證與 RBAC 權限控制
- ✅ 全域例外處理
- ✅ 請求/回應記錄
- ✅ 健康檢查端點
- ✅ Swagger API 文檔
- ✅ Docker 容器化
- ✅ TDD 測試驅動開發流程
- ✅ 使用者與權限管理 API 完整實作
- 🔄 其他業務模組實作中
- 🔄 檔案上傳/儲存整合
- 🔄 佇列處理非同步任務
- 🔄 Email/SMS 通知

### 前端功能

- ✅ Vue 3 組合式 API
- ✅ 全面 TypeScript 支援
- ✅ Pinia 狀態管理
- ✅ Vue Router 與認證防護
- ✅ Tailwind CSS 樣式
- ✅ Toast 通知
- 🔄 可搜尋/篩選的資料表格
- 🔄 表單驗證
- 🔄 圖表與分析
- 🔄 檔案上傳元件
- 🔄 即時更新

### 共享套件

- ✅ 完整 TypeScript 型別定義
- ✅ 產生的 API 客戶端 SDK
- 🔄 共享 UI 元件庫
- 🔄 工具函式套件

## TDD 開發流程

本專案採用**測試驅動開發 (TDD)** 方式，必須遵循以下流程：

### Red-Green-Refactor 循環

1. **Red**: 先寫測試，確認測試失敗
2. **Green**: 寫最少程式碼讓測試通過
3. **Refactor**: 在測試通過的前提下重構程式碼

### 新功能開發步驟

```bash
# 1. 建立測試檔案
touch src/modules/[module]/[module].service.spec.ts

# 2. 寫測試案例
# 3. 執行測試確認失敗
pnpm --filter @eggdrop/api test:watch

# 4. 實作最少程式碼
# 5. 確認測試通過
# 6. 重構並持續確認測試通過
# 7. 提交工作程式碼
```

### 測試覆蓋率要求

- **最低覆蓋率**: 80% (所有模組)
- **關鍵模組**: 90% (認證、帳務、訂單)
- **新功能**: 100% 覆蓋率要求

## 開發協作指南

### 團隊開發流程

1. **環境準備**

   ```bash
   # 複製專案
   git clone <repository>
   cd eggdrop-crm

   # 安裝相依性
   pnpm install

   # 啟動開發服務
   docker-compose up -d

   # 設定資料庫
   pnpm --filter @eggdrop/api db:generate
   pnpm --filter @eggdrop/api db:migrate
   ```

2. **功能開發**
   - 在 `packages/types` 建立型別定義
   - 在 `apps/api/src/modules` 實作後端 API (遵循 TDD)
   - 需要時更新 Prisma 綱要
   - 使用 `pnpm openapi:generate` 產生 SDK
   - 在 `apps/web` 實作前端功能

3. **程式碼品質**

   ```bash
   # 測試 (必須通過所有測試)
   pnpm --filter @eggdrop/api test

   # 型別檢查
   pnpm typecheck

   # 程式碼檢查
   pnpm lint

   # 格式化程式碼
   pnpm format
   ```

4. **提交規範**
   - 遵循 Conventional Commits 格式
   - 每次提交必須包含相關測試
   - 確保所有測試通過才能提交
   - 提交訊息使用繁體中文

### API 開發重點

#### 已完成功能 ✅

- **認證 API** (`/auth`): 登入、登出、Token 刷新、使用者資訊
- **使用者管理 API** (`/users`): CRUD 操作、角色指派、分頁搜尋
- **完整 Swagger 文檔**: http://localhost:3000/api/docs
- **TDD 測試**: 31 個測試案例全數通過

#### 開發中功能 🔄

依照以下優先順序進行開發：

1. 客戶管理 API (`/customers`)
2. 產品管理 API (`/products`)
3. 訂單管理 API (`/orders`)
4. 庫存管理 API (`/inventory`)
5. 其他業務模組...

### 測試策略

#### 單元測試 (\*.spec.ts)

- **服務**: 業務邏輯、驗證、錯誤處理
- **控制器**: 請求/回應處理、參數驗證
- **DTO**: 使用 class-validator 的輸入驗證
- **工具函式**: 輔助函式與轉換

#### 整合測試 (\*.integration.spec.ts)

- **資料庫操作**: Prisma 查詢與交易
- **模組互動**: 跨模組相依性
- **外部服務**: AWS S3、Redis、Email 服務

#### E2E 測試 (\*.e2e-spec.ts)

- **API 端點**: 完整請求/回應週期
- **認證流程**: 登入、JWT 驗證
- **業務工作流程**: 訂單處理、帳務週期

### 分工建議

#### 後端開發者

- 負責 API 端點實作
- 資料庫綱要設計
- 業務邏輯開發
- 測試撰寫

#### 前端開發者

- Vue 元件開發
- 狀態管理
- UI/UX 實作
- 前端測試

#### 全端開發者

- 端到端功能實作
- API 與前端整合
- 系統架構優化

## 部署

### 正式環境建置

```bash
# 建置所有套件
pnpm build

# 建置 Docker 映像檔
docker build -f apps/api/Dockerfile -t eggdrop-api .
docker build -f apps/web/Dockerfile -t eggdrop-web .
```

### 環境設定

- 設定正式環境變數
- 建立 PostgreSQL 資料庫
- 設定 Redis 實例
- 設定 S3 相容儲存
- 設定 email/SMS 提供商

## 貢獻指南

1. 遵循現有模組的既定模式
2. 確保所有程式碼都有適當的型別定義
3. 為新功能新增測試
4. 需要時更新文檔
5. 遵循 Conventional Commits 格式
6. 所有註解與文檔使用繁體中文

## 常見問題

### Q: 只想開發 API，如何跳過前端？

```bash
# 方法 1: 使用過濾器
pnpm --filter @eggdrop/api dev

# 方法 2: 進入 API 目錄
cd apps/api && pnpm dev
```

### Q: 如何查看 API 文檔？

訪問 http://localhost:3000/api/docs 查看完整的 Swagger 文檔

### Q: 測試失敗怎麼辦？

```bash
# 查看詳細測試結果
pnpm --filter @eggdrop/api test --verbose

# 監控模式開發
pnpm --filter @eggdrop/api test:watch
```

### Q: 如何重置資料庫？

```bash
# 重置並重新遷移
pnpm --filter @eggdrop/api db:reset
```

## 授權

私有專案 - 保留所有權利

---

**狀態**: 初始架構完成，使用者與權限管理 API 已實作 ✅  
**下一步**: 實作其他核心業務模組
