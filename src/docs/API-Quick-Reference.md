# API 快速參考表

> 快速查找所有 API Endpoint 與方法

---

## 📑 目錄

- [1. 認證與授權](#1-認證與授權)
- [2. 員工管理](#2-員工管理)
- [3. 客戶管理](#3-客戶管理)
- [4. 潛在客戶管理](#4-潛在客戶管理)
- [5. 廠商管理](#5-廠商管理)
- [6. 車輛管理](#6-車輛管理)
- [7. 商品管理](#7-商品管理)
- [8. 訂單管理](#8-訂單管理)
- [9. 庫存管理](#9-庫存管理)
- [10. 送貨報表](#10-送貨報表)
- [11. 統計報表](#11-統計報表)
- [12. 檔案上傳](#12-檔案上傳)

---

## 1. 認證與授權

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 1.1 | POST | `/auth/login` | 使用者登入 | ❌ |
| 1.2 | POST | `/auth/logout` | 使用者登出 | ✅ |
| 1.3 | POST | `/auth/refresh` | 刷新 Token | ❌ |

---

## 2. 員工管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 2.1 | GET | `/employees` | 取得員工列表（分頁、篩選、排序） | ✅ |
| 2.2 | GET | `/employees/:id` | 取得單一員工 | ✅ |
| 2.3 | POST | `/employees` | 新增員工 | ✅ |
| 2.4 | PUT | `/employees/:id` | 更新員工 | ✅ |
| 2.5 | DELETE | `/employees/:id` | 刪除員工 | ✅ |

---

## 3. 客戶管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 3.1 | GET | `/customers` | 取得客戶列表 | ✅ |
| 3.2 | GET | `/customers/:id` | 取得單一客戶（含聯絡人、自訂價格） | ✅ |
| 3.3 | POST | `/customers` | 新增客戶（含聯絡人、自訂價格） | ✅ |
| 3.4 | PUT | `/customers/:id` | 更新客戶 | ✅ |
| 3.5 | DELETE | `/customers/:id` | 刪除客戶 | ✅ |
| 3.6 | GET | `/customers/:id/orders` | 取得客戶訂單列表 | ✅ |

---

## 4. 潛在客戶管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 4.1 | GET | `/potential-customers` | 取得潛在客戶列表 | ✅ |
| 4.2 | GET | `/potential-customers/:id` | 取得單一潛在客戶 | ✅ |
| 4.3 | POST | `/potential-customers` | 新增潛在客戶 | ✅ |
| 4.4 | PUT | `/potential-customers/:id` | 更新潛在客戶 | ✅ |
| 4.5 | POST | `/potential-customers/:id/convert` | **轉為正式客戶** | ✅ |
| 4.6 | DELETE | `/potential-customers/:id` | 刪除潛在客戶 | ✅ |

---

## 5. 廠商管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 5.1 | GET | `/vendors` | 取得廠商列表 | ✅ |
| 5.2 | GET | `/vendors/:id` | 取得單一廠商 | ✅ |
| 5.3 | POST | `/vendors` | 新增廠商 | ✅ |
| 5.4 | PUT | `/vendors/:id` | 更新廠商 | ✅ |
| 5.5 | DELETE | `/vendors/:id` | 刪除廠商 | ✅ |

---

## 6. 車輛管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 6.1 | GET | `/vehicles` | 取得車輛列表 | ✅ |
| 6.2 | GET | `/vehicles/:id` | 取得單一車輛（含保養、維修記錄） | ✅ |
| 6.3 | POST | `/vehicles` | 新增車輛 | ✅ |
| 6.4 | PUT | `/vehicles/:id` | 更新車輛 | ✅ |
| 6.5 | DELETE | `/vehicles/:id` | 刪除車輛 | ✅ |
| 6.6 | POST | `/vehicles/:vehicleId/maintenance` | **新增保養記錄** | ✅ |
| 6.7 | PUT | `/vehicles/:vehicleId/maintenance/:maintenanceId` | 更新保養記錄 | ✅ |
| 6.8 | DELETE | `/vehicles/:vehicleId/maintenance/:maintenanceId` | 刪除保養記錄 | ✅ |
| 6.9 | POST | `/vehicles/:vehicleId/repairs` | **新增維修記錄** | ✅ |
| 6.10 | PUT | `/vehicles/:vehicleId/repairs/:repairId` | 更新維修記錄 | ✅ |
| 6.11 | DELETE | `/vehicles/:vehicleId/repairs/:repairId` | 刪除維修記錄 | ✅ |

---

## 7. 商品管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 7.1 | GET | `/products` | 取得商品列表（含當前庫存） | ✅ |
| 7.2 | GET | `/products/:id` | 取得單一商品 | ✅ |
| 7.3 | POST | `/products` | 新增商品（自動建立庫存記錄） | ✅ |
| 7.4 | PUT | `/products/:id` | 更新商品 | ✅ |
| 7.5 | DELETE | `/products/:id` | 刪除商品 | ✅ |

---

## 8. 訂單管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 8.1 | GET | `/orders` | 取得訂單列表 | ✅ |
| 8.2 | GET | `/orders/:id` | 取得單一訂單 | ✅ |
| 8.3 | POST | `/orders` | 新增訂單 | ✅ |
| 8.4 | PUT | `/orders/:id` | 更新訂單 | ✅ |
| 8.5 | PATCH | `/orders/:id/status` | **更新訂單狀態**（自動調整庫存） | ✅ |
| 8.6 | DELETE | `/orders/:id` | 刪除訂單 | ✅ |

---

## 9. 庫存管理

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 9.1 | GET | `/inventory` | 取得商品庫存列表 | ✅ |
| 9.2 | GET | `/inventory/transactions` | 取得庫存異動記錄列表 | ✅ |
| 9.3 | GET | `/inventory/transactions/:id` | 取得單一庫存異動記錄 | ✅ |
| 9.4 | POST | `/inventory/transactions/purchase` | **建立進貨記錄**（增加庫存） | ✅ |
| 9.5 | POST | `/inventory/transactions/adjustment` | **建立調整記錄** | ✅ |
| 9.6 | POST | `/inventory/transactions/count` | **建立盤點記錄**（自動調整） | ✅ |
| 9.7 | GET | `/inventory/alerts` | **取得庫存警示**（低於/高於安全庫存） | ✅ |

---

## 10. 送貨報表

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 10.1 | GET | `/delivery-reports` | 取得送貨報表列表 | ✅ |
| 10.2 | GET | `/delivery-reports/:id` | 取得單一送貨報表（含明細） | ✅ |
| 10.3 | POST | `/delivery-reports` | 新增送貨報表 | ✅ |
| 10.4 | PUT | `/delivery-reports/:id` | 更新送貨報表 | ✅ |
| 10.5 | PATCH | `/delivery-reports/:id/submit` | **提交報表**（待審核） | ✅ |
| 10.6 | PATCH | `/delivery-reports/:id/review` | **審核報表**（通過/退回） | ✅ |
| 10.7 | POST | `/delivery-reports/:reportId/convert-to-order` | **批次轉訂單**（新訂單/加入現有訂單） | ✅ |
| 10.8 | DELETE | `/delivery-reports/:id` | 刪除送貨報表 | ✅ |
| 10.9 | GET | `/delivery-reports/daily-report` | **取得日報表**（指定日期） | ✅ |

---

## 11. 統計報表

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 11.1 | GET | `/statistics/dashboard` | 儀表板統計（客戶、訂單、庫存、營收） | ✅ |
| 11.2 | GET | `/statistics/sales` | 銷售統計（可按日/週/月分組） | ✅ |
| 11.3 | GET | `/statistics/inventory` | 庫存統計 | ✅ |
| 11.4 | GET | `/statistics/customers` | 客戶統計（Top客戶、分類統計） | ✅ |

---

## 12. 檔案上傳

| # | Method | Endpoint | 說明 | 認證 |
|---|--------|----------|------|------|
| 12.1 | POST | `/upload` | 上傳單一檔案 | ✅ |
| 12.2 | POST | `/upload/multiple` | 上傳多個檔案 | ✅ |
| 12.3 | DELETE | `/upload/:fileId` | 刪除檔案 | ✅ |

---

## 📊 統計總覽

### 按 HTTP Method 分類

| Method | 數量 | 百分比 |
|--------|------|--------|
| GET | 27 | 38.6% |
| POST | 21 | 30.0% |
| PUT | 11 | 15.7% |
| DELETE | 9 | 12.9% |
| PATCH | 2 | 2.9% |
| **總計** | **70** | **100%** |

### 按模組分類

| 模組 | API 數量 |
|-----|---------|
| 送貨報表 | 9 |
| 車輛管理 | 11 |
| 庫存管理 | 7 |
| 客戶管理 | 6 |
| 潛在客戶管理 | 6 |
| 訂單管理 | 6 |
| 員工管理 | 5 |
| 商品管理 | 5 |
| 廠商管理 | 5 |
| 統計報表 | 4 |
| 認證與授權 | 3 |
| 檔案上傳 | 3 |
| **總計** | **70** |

---

## 🔑 重要 API 標記說明

### 核心業務 API（必須優先實作）

#### ⭐ 認證流程
- `POST /auth/login` - 登入

#### ⭐ CRUD 基礎
- `GET /employees` - 員工列表
- `GET /customers` - 客戶列表
- `GET /products` - 商品列表
- `GET /orders` - 訂單列表

#### ⭐ 關鍵業務邏輯
- `POST /potential-customers/:id/convert` - 潛在客戶轉正
- `PATCH /orders/:id/status` - 訂單狀態變更（連動庫存）
- `POST /inventory/transactions/purchase` - 進貨（增加庫存）
- `GET /inventory/alerts` - 庫存警示

#### ⭐ 送貨報表流程
- `POST /delivery-reports` - 建立報表
- `PATCH /delivery-reports/:id/submit` - 提交審核
- `PATCH /delivery-reports/:id/review` - 審核報表
- `POST /delivery-reports/:reportId/convert-to-order` - 批次轉訂單（新訂單/加入現有）

---

## 🎯 API 呼叫流程範例

### 範例 1: 完整訂單流程

```
1. GET /customers           → 選擇客戶
2. GET /products            → 選擇商品
3. GET /customers/:id       → 取得客戶自訂價格
4. POST /orders             → 建立訂單（狀態：待出貨）
5. PATCH /orders/:id/status → 更新為「已出貨」（自動扣庫存）
6. PATCH /orders/:id/status → 更新為「已完成」
```

---

### 範例 2: 庫存管理流程

```
1. GET /inventory           → 查看當前庫存
2. GET /inventory/alerts    → 檢查庫存警示
3. POST /inventory/transactions/purchase → 進貨補貨
4. GET /inventory/transactions → 查看異動記錄
```

---

### 範例 3: 送貨報表流程

```
1. POST /delivery-reports               → 司機建立報表
2. PUT /delivery-reports/:id            → 編輯明細
3. PATCH /delivery-reports/:id/submit   → 提交審核
4. PATCH /delivery-reports/:id/review   → 主管審核
5a. POST /delivery-reports/:id/convert-to-order (mode=new) → 轉為新訂單
5b. POST /delivery-reports/:id/convert-to-order (mode=existing) → 加入現有訂單
6. GET /delivery-reports/daily-report   → 查看日報表
```

---

### 範例 4: 潛在客戶轉正流程

```
1. POST /potential-customers            → 建立潛在客戶
2. PUT /potential-customers/:id         → 追蹤更新
3. POST /potential-customers/:id/convert → 轉為正式客戶
4. GET /customers/:id                   → 確認客戶資料
```

---

## 🔒 權限需求說明

### 角色建議

| 角色 | 可存取模組 |
|-----|-----------|
| **系統管理員** | 全部 |
| **業務經理** | 客戶、潛在客戶、訂單、商品、統計報表 |
| **業務專員** | 客戶、訂單、商品 |
| **倉管人員** | 商品、庫存、廠商 |
| **送貨司機** | 送貨報表（僅自己的） |
| **財務人員** | 統計報表、訂單（唯讀） |

---

## 📝 Payload 大小限制建議

| API 類型 | 建議上限 |
|---------|---------|
| 一般 CRUD | 1 MB |
| 批次操作 | 5 MB |
| 檔案上傳 | 10 MB / 檔案 |
| 統計報表查詢 | 無限制（分頁） |

---

## ⚡ 效能優化建議

### 需要分頁的 API
- ✅ `GET /employees`
- ✅ `GET /customers`
- ✅ `GET /orders`
- ✅ `GET /inventory/transactions`
- ✅ `GET /delivery-reports`

### 需要快取的 API
- 🔄 `GET /products` (快取 5 分鐘)
- 🔄 `GET /statistics/dashboard` (快取 1 分鐘)
- 🔄 `GET /inventory/alerts` (快取 30 秒)

### 需要索引的查詢欄位
- 📇 `customers.companyName`
- 📇 `customers.taxId`
- 📇 `orders.customerId`
- 📇 `orders.orderDate`
- 📇 `inventory.productId`

---

## 🔗 相關文件

- [完整 API 規格文件](./API-Specification.md)
- [ERD 資料庫設計](./ERD-Entity-Relationship-Diagram.md)
- [業務流程圖](./Business-Process-Flowchart.md)
- [資料流程圖](./Data-Flow-Diagram.md)

---

**版本**: v1.0  
**最後更新**: 2025-01-03  
**維護團隊**: 技術開發團隊
