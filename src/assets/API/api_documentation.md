# Eggdrop CRM API 文件

本文件整理了後端專案的主要 API 規格，包含 Customer (客戶)、Product (產品)、Order (訂單)、Auth (認證) 與 Vendor (供應商) 模組。

---

## 目錄
1. [Auth (認證)](#auth-認證)
2. [Customers (客戶)](#customers-客戶)
3. [Products (產品)](#products-產品)
4. [Orders (訂單)](#orders-訂單)
5. [Vendors (供應商)](#vendors-供應商)

---

## Auth (認證)

### 登入 (POST /auth/login)

**功能**: 使用者登入，取得 Access Token。

**請求參數 (Body Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 | 範例 |
| :--- | :--- | :--- | :--- | :--- |
| email | String | **是** | 電子郵件 | 'admin@example.com' |
| password | String | **是** | 密碼 | 'Password123!' |

**回傳內容**: LoginResponse
```json
{
  "user": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGcV...",
  "refreshToken": "d7e8f...",
  "expiresIn": 3600
}
```

### 刷新 Token (POST /auth/refresh)

**功能**: 使用 Refresh Token 換取新的 Access Token。

**請求參數 (Body Payload)**:
*   refreshToken: String (**必填**)

### 取得目前使用者 (GET /auth/me)

**功能**: 透過 JWT 取得目前登入者資料。

**需求**: `Authorization: Bearer <accessToken>`

**回傳內容**: User 資料（`id/email/firstName/lastName/role` 等）。

### 登出 (POST /auth/logout)

**功能**: 使目前 JWT 失效（伺服器端僅回傳成功訊息，實作時請於前端清除 Token）。

**需求**: `Authorization: Bearer <accessToken>`

---

## Customers (客戶)

### 客戶列表 (GET /customers)

**功能**: 取得客戶列表，支援分頁與篩選。

**請求參數 (Query Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 | 預設值 |
| :--- | :--- | :--- | :--- | :--- |
| page | Number | 否 | 頁碼 | 1 |
| limit | Number | 否 | 每頁筆數 (最大 100) | 10 |
| search | String | 否 | 搜尋關鍵字 (名稱/Email/電話) | |
| type | Enum | 否 | INDIVIDUAL, COMPANY | |
| status | Enum | 否 | ACTIVE, INACTIVE, DELETED | |
| segment | Enum | 否 | RETAIL, WHOLESALE, VIP, CORPORATE | |
| source | Enum | 否 | WEBSITE, REFERRAL, COLD_CALL, SOCIAL_MEDIA, TRADE_SHOW, OTHER | |
| salesRepId | String | 否 | 業務負責人 ID | |
| tags | Array | 否 | 標籤篩選 (所有標籤必須符合) | |
| sortBy | String | 否 | 排序欄位 | |
| sortOrder | Enum | 否 | 排序方向 (asc, desc) | asc |

### 新增單筆 (POST /customers)

**功能**: 建立新客戶。

> **注意**: `status` 欄位在建立時不需傳遞，系統預設為 `ACTIVE`。

**請求參數 (Body Payload)** (CreateCustomerDto):

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| name | String | **是** | 客戶名稱 |
| type | Enum | **是** | 客戶類型 (INDIVIDUAL, COMPANY) |
| segment | Enum | **是** | 客戶分類 (RETAIL, WHOLESALE, VIP, CORPORATE) |
| source | Enum | **是** | 客戶來源 (WEBSITE, REFERRAL, COLD_CALL, SOCIAL_MEDIA, TRADE_SHOW, OTHER) |
| contactInfo | Object | **是** | 聯絡資訊 `{ phone?: string, mobile?: string, email?: string, fax?: string }` |
| address | Object | 否 | 地址 `{ street: string, city: string, state: string, zipCode: string, country: string }` |
| taxId | String | 否 | 統一編號 |
| businessRegistration | String | 否 | 營業登記號 |
| creditLimit | Object | 否 | 信用額度 `{ amount: number, currency: string }` |
| paymentTerms | Number | 否 | 付款條件 (天數) |
| salesRepId | String | 否 | 業務負責人 ID |
| notes | String | 否 | 備註 |
| tags | Array<String> | 否 | 標籤 |
| customFields | Object | 否 | 自訂欄位 (Key-Value) |

### 編輯單筆 (PATCH /customers/:id)

**功能**: 更新客戶資料。

**請求參數 (Body Payload)**: 大部分欄位與新增相同，皆為選填。額外包含：
*   status: Enum (ACTIVE, INACTIVE, DELETED) - ※ 僅在編輯時可修改狀態

---

## Products (產品)

### 產品列表 (GET /products)

**功能**: 取得產品列表。

**請求參數 (Query Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| page | Number | 否 | 頁碼 |
| limit | Number | 否 | 每頁筆數 |
| search | String | 否 | 搜尋關鍵字 |
| categoryId | Number | 否 | 產品類別 ID |
| productTypeId | UUID | 否 | 產品類型 ID |
| productTypeCode | String | 否 | 產品類型代碼 |
| status | Enum | 否 | ACTIVE, INACTIVE, DELETED |
| minPrice | Number | 否 | 最低價格 |
| maxPrice | Number | 否 | 最高價格 |
| primaryVendorId | String | 否 | 主要供應商 ID |
| isPerishable | Boolean | 否 | 是否易腐 |
| tags | Array<String> | 否 | 標籤篩選 (可用逗號傳多個) |
| lowStock | Boolean | 否 | 是否低庫存 (庫存 < 補貨點) |
| inStock | Boolean | 否 | 是否有庫存 (> 0) |
| sortBy | String | 否 | 排序欄位 (name、code、createdAt、updatedAt、basePrice、currentStock) |
| sortOrder | Enum | 否 | 排序方向 (asc、desc) |

### 新增單筆 (POST /products)

**功能**: 建立新產品。

> **注意**: `status` 欄位在建立時不需傳遞，系統預設為 `ACTIVE`。

**請求參數 (Body Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 | 範例結構 |
| :--- | :--- | :--- | :--- | :--- |
| name | String | **是** | 產品名稱 | "新鮮雞蛋" |
| categoryId | Number | **是** | 產品類別 ID | 1 |
| unit | String | **是** | 計量單位 | "盒" |
| basePrice | Object | **是** | **零售價** (Retail Price) | `{ "amount": 100, "currency": "TWD" }` |
| minStock | Number | **是** | 最小安全庫存 | 10 |
| maxStock | Number | **是** | 最大安全庫存 | 500 |
| reorderPoint | Number | **是** | 補貨點 | 20 |
| isPerishable | Boolean | **是** | 是否為易腐品 | true |
| description | String | 否 | 描述 | |
| wholesalePrice | Object | 否 | **批發價** | `{ "amount": 80, "currency": "TWD" }` |
| costPrice | Object | 否 | **成本價** | `{ "amount": 50, "currency": "TWD" }` |
| cashPrice | Object | 否 | **現金價** | `{ "amount": 90, "currency": "TWD" }` |
| tags | Array<String> | 否 | 標籤 | `["熱銷", "推薦"]` |
| primaryVendorId | String | 否 | 主要供應商 ID | "vendor-uuid" |
| productTypeId | UUID | 否 | 產品類型 ID | |
| productTypeCode | String | 否 | 產品類型代碼 (可用來取代 productTypeId) | "FINISHED_GOOD" |
| weight | Number | 否 | 重量 (kg) | |
| dimensions | Object | 否 | 尺寸 | `{ "length": 10, "width": 10, "height": 10, "unit": "cm" }` |
| sku | String | 否 | SKU 編號 | |
| barcode | String | 否 | 條碼 | |
| shelfLife | Number | 否 | 保存期限 (天) | 30 |
| storageConditions | String | 否 | 儲存條件 | "冷藏" |

### 編輯單筆 (PATCH /products/:id)

**功能**: 更新產品資料。

**請求參數 (Body Payload)**: 包含新增所有的欄位 (皆為選填)，以及：
*   status: Enum (ACTIVE, INACTIVE, DELETED) - ※ 僅在編輯時可修改狀態

### 更新庫存 (POST /products/:id/inventory)

**功能**: 調整庫存。

**請求參數 (Body Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| quantity | Number | **是** | 數量 |
| operation | Enum | **是** | `add` (增加), `subtract` (減少), `set` (設定) |
| reason | String | 否 | 異動原因 |

---

## Orders (訂單)

### 訂單列表 (GET /orders)

**功能**: 查詢訂單。

**請求參數 (Query Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| orderNumber | String | 否 | 訂單編號 |
| customerId | String | 否 | 客戶 ID |
| status | Enum[] | 否 | OrderStatus 陣列 |
| orderDateFrom | Date | 否 | 日期起 |
| orderDateTo | Date | 否 | 日期迄 |
| expectedDeliveryDateFrom | Date | 否 | 預計送達日期起 |
| expectedDeliveryDateTo | Date | 否 | 預計送達日期迄 |
| driverId | String | 否 | 司機 ID |
| vehicleId | String | 否 | 車輛 ID |
| minAmount | Number | 否 | 最低訂單金額 (含稅) |
| maxAmount | Number | 否 | 最高訂單金額 (含稅) |

### 新增單筆 (POST /orders)

**功能**: 建立新訂單。

**請求參數 (Body Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| customerId | String | **是** | 客戶 ID |
| orderDate | Date | **是** | 訂單日期 |
| items | Array | **是** | 訂單項目清單 (見下方結構) |
| expectedDeliveryDate | Date | 否 | 期望送達日 |
| shippingAddress | Object | 否 | 送貨地址 |
| driverId | String | 否 | 指定司機 |
| vehicleId | String | 否 | 指定車輛 |
| notes | String | 否 | 備註 |
| internalNotes | String | 否 | 內部備註 |

**items 結構**:
*   productId: String (**必填**)
*   quantity: Number (**必填**)
*   unitPrice: Object (選填，`{amount, currency}`)
*   discount: Object (選填，`{amount, currency}`)
*   notes: String (選填)

### 編輯單筆 (PATCH /orders/:id)

**功能**: 修改訂單。

**請求參數 (Body Payload)**:
*   status: OrderStatus (DRAFT, PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
*   expectedDeliveryDate: Date
*   deliveredDate: Date
*   trackingNumber: String
*   items: Array (UpdateOrderItemRequest: `{ id?, productId?, quantity?, ... }`。包含 id 則更新，無 id 則新增，包含 `_delete: true` 則刪除)
*   driverId, vehicleId, notes, internalNotes...

---

## Vendors (供應商)

### 供應商列表 (GET /vendors)

**功能**: 查詢供應商。

**請求參數 (Query Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| page | Number | 否 | 頁碼 (預設 1) |
| limit | Number | 否 | 每頁筆數 (1~100，預設 10) |
| search | String | 否 | 關鍵字 (名稱 / 聯絡人 / 電話 / Email / 代碼) |
| productTypeId | UUID | 否 | 篩選主要產品類型 ID |
| productTypeCode | String | 否 | 產品類型代碼 (FINISHED_GOOD、RAW_MATERIAL...) |
| isActive | Boolean | 否 | 是否啟用 |
| status | Enum | 否 | `active` / `inactive`，與 isActive 對應 |
| sortBy | String | 否 | 排序欄位 (name、createdAt、updatedAt、contactPerson) |
| sortOrder | Enum | 否 | 排序方向 (asc / desc，預設 asc) |

### 新增單筆 (POST /vendors)

**功能**: 建立供應商。

**請求參數 (Body Payload)**:

| 欄位名稱 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| name | String | **是** | 供應商名稱 |
| contactPerson | String | **是** | 聯絡人 |
| email | String | **是** | Email |
| phone | String | **是** | 電話 |
| address | Object | **是** | 地址 `{ street, city, state, zipCode, country }` |
| paymentTerms | Number | 否 | 付款條件 (天) |
| taxId | String | 否 | 統一編號 |
| isActive | Boolean | 否 | 是否啟用 (預設 true) |
| productTypeId | String | 否 | 主要產品類型 ID |
| productTypeCode | String | 否 | 主要產品類型代碼 |

### 編輯單筆 (PATCH /vendors/:id)

**功能**: 更新供應商資料（欄位皆選填，同新增）。

### 供應商商品與採購相關 API

- `GET /vendors/:id/products`：查詢指定供應商的商品清單（支援分頁）。
- `POST /vendors/:id/products`：將商品加入供應商目錄。
- `PATCH /vendors/:id/products/:productId`：更新供應商商品價格。
- `DELETE /vendors/:id/products/:productId`：從供應商目錄移除商品。
- `POST /vendors/bulk`：批次建立供應商。
- `GET /vendors/:id/orders`：取得供應商的採購訂單。
- `POST /vendors/:id/orders`：建立採購訂單（items 陣列必填）。
- `PATCH /vendors/orders/:orderId/status`：更新採購訂單狀態。
- `POST /vendors/orders/:orderId/receive`：標記採購訂單已收貨。
- `GET /vendors/:id/statistics`：供應商 KPI 與統計資料。
- `GET /vendors/top-suppliers`：依交易量 / 金額取得 Top 供應商（可用 `criteria=volume|amount` 與 `limit`）。
