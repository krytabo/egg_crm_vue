# CRM 管理系統 - API 規格文件

> **版本**: v1.0  
> **建立日期**: 2025-01-03  
> **Base URL**: `https://api.your-domain.com/v1`

---

## 📋 目錄

- [1. 認證與授權 API](#1-認證與授權-api)
- [2. 員工管理 API](#2-員工管理-api)
- [3. 客戶管理 API](#3-客戶管理-api)
- [4. 潛在客戶管理 API](#4-潛在客戶管理-api)
- [5. 廠商管理 API](#5-廠商管理-api)
- [6. 車輛管理 API](#6-車輛管理-api)
- [7. 商品管理 API](#7-商品管理-api)
- [8. 訂單管理 API](#8-訂單管理-api)
- [9. 庫存管理 API](#9-庫存管理-api)
- [10. 送貨報表 API](#10-送貨報表-api)
- [11. 統計報表 API](#11-統計報表-api)
- [12. 檔案上傳 API](#12-檔案上傳-api)

---

## 通用規範

### HTTP 狀態碼

| 狀態碼 | 說明 |
|-------|------|
| 200 | 成功 |
| 201 | 建立成功 |
| 400 | 請求參數錯誤 |
| 401 | 未授權 |
| 403 | 權限不足 |
| 404 | 資源不存在 |
| 409 | 資源衝突 |
| 500 | 伺服器錯誤 |

### 通用 Response 格式

```typescript
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": {
    "code": string,
    "message": string,
    "details": any
  }
}
```

### 分頁參數（Query String）

```typescript
{
  "page": number,      // 頁碼，從 1 開始
  "pageSize": number,  // 每頁筆數，預設 10
  "sortBy": string,    // 排序欄位
  "sortOrder": "asc" | "desc"  // 排序方向
}
```

### 分頁 Response

```typescript
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": number,
      "pageSize": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

---

## 1. 認證與授權 API

### 1.1 登入

**Endpoint**: `POST /auth/login`

**Request Body**:
```typescript
{
  "username": string,      // 必填
  "password": string,      // 必填
  "rememberMe": boolean    // 選填，預設 false
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "token": string,        // JWT Token
    "refreshToken": string,
    "expiresIn": number,    // 秒數
    "user": {
      "id": number,
      "name": string,
      "email": string,
      "position": string,
      "roles": string[],
      "permissions": string[]
    }
  }
}
```

---

### 1.2 登出

**Endpoint**: `POST /auth/logout`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```typescript
{
  "success": true,
  "message": "登出成功"
}
```

---

### 1.3 刷新 Token

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```typescript
{
  "refreshToken": string
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "token": string,
    "expiresIn": number
  }
}
```

---

## 2. 員工管理 API

### 2.1 取得員工列表

**Endpoint**: `GET /employees`

**Query Parameters**:
```typescript
{
  // 分頁參數
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": "asc" | "desc",
  
  // 篩選參數
  "name": string,           // 模糊搜尋
  "idNumber": string,       // 身分證字號
  "position": string,       // 職位
  "status": "啟用" | "停用",
  "joinDateFrom": string,   // YYYY-MM-DD
  "joinDateTo": string      // YYYY-MM-DD
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "name": string,
        "idNumber": string,
        "birthDate": string,         // YYYY-MM-DD
        "position": string,
        "phone": string,
        "email": string,
        "address": string,
        "joinDate": string,          // YYYY-MM-DD
        "status": "啟用" | "停用",
        "createdAt": string,         // ISO 8601
        "updatedAt": string          // ISO 8601
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2.2 取得單一員工

**Endpoint**: `GET /employees/:id`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": number,
    "name": string,
    "idNumber": string,
    "birthDate": string,
    "position": string,
    "phone": string,
    "email": string,
    "address": string,
    "joinDate": string,
    "status": "啟用" | "停用",
    "createdAt": string,
    "updatedAt": string
  }
}
```

---

### 2.3 新增員工

**Endpoint**: `POST /employees`

**Request Body**:
```typescript
{
  "name": string,              // 必填
  "idNumber": string,          // 必填，需驗證格式
  "birthDate": string,         // 必填，YYYY-MM-DD
  "position": string,          // 必填
  "phone": string,             // 必填
  "email": string,             // 必填，需驗證格式
  "address": string,           // 必填
  "joinDate": string,          // 必填，YYYY-MM-DD
  "status": "啟用" | "停用"    // 選填，預設 "啟用"
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "員工建立成功",
  "data": {
    "id": number,
    "name": string,
    // ... 其他欄位
  }
}
```

---

### 2.4 更新員工

**Endpoint**: `PUT /employees/:id`

**Request Body**:
```typescript
{
  "name": string,              // 選填
  "idNumber": string,          // 選填
  "birthDate": string,         // 選填
  "position": string,          // 選填
  "phone": string,             // 選填
  "email": string,             // 選填
  "address": string,           // 選填
  "joinDate": string,          // 選填
  "status": "啟用" | "停用"    // 選填
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "員工更新成功",
  "data": {
    "id": number,
    // ... 更新後的資料
  }
}
```

---

### 2.5 刪除員工

**Endpoint**: `DELETE /employees/:id`

**Response**:
```typescript
{
  "success": true,
  "message": "員工刪除成功"
}
```

---

## 3. 客戶管理 API

### 3.1 取得客戶列表

**Endpoint**: `GET /customers`

**Query Parameters**:
```typescript
{
  // 分頁參數
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": "asc" | "desc",
  
  // 篩選參數
  "companyName": string,        // 模糊搜尋
  "taxId": string,              // 統一編號
  "categories": string[],       // 客戶類別
  "paymentMethod": string,      // 收付方式
  "registeredDateFrom": string, // YYYY-MM-DD
  "registeredDateTo": string    // YYYY-MM-DD
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "companyName": string,
        "companyPhone": string,
        "companyAddress": string,
        "companyEmail": string,
        "taxId": string,
        "categories": string[],          // ["桶裝水", "雞蛋", "飲水機"]
        "paymentMethod": string,         // "現金" | "月結" | "轉帳"
        "deposit": number,
        "invoiceTitle": string,
        "invoiceTaxId": string,
        "note": string,
        "registeredDate": string,        // YYYY-MM-DD
        "deliveryDays": string[],        // ["星期一", "星期三"]
        "contactsCount": number,         // 聯絡人數量
        "customPricesCount": number,     // 自訂價格數量
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 3.2 取得單一客戶（含詳細資料）

**Endpoint**: `GET /customers/:id`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": number,
    "companyName": string,
    "companyPhone": string,
    "companyAddress": string,
    "companyEmail": string,
    "taxId": string,
    "categories": string[],
    "paymentMethod": string,
    "deposit": number,
    "invoiceTitle": string,
    "invoiceTaxId": string,
    "note": string,
    "registeredDate": string,
    "deliveryDays": string[],
    
    // 聯絡人清單
    "contacts": [
      {
        "id": number,
        "isPrimary": boolean,
        "name": string,
        "phone": string,
        "address": string,
        "email": string
      }
    ],
    
    // 自訂價格清單
    "customPrices": [
      {
        "id": number,
        "productId": string,
        "productName": string,
        "productCategory": string,
        "adjustment": number         // 價格調整（可正可負）
      }
    ],
    
    "createdAt": string,
    "updatedAt": string
  }
}
```

---

### 3.3 新增客戶

**Endpoint**: `POST /customers`

**Request Body**:
```typescript
{
  // 公司基本資料
  "companyName": string,           // 必填
  "companyPhone": string,          // 必填
  "companyAddress": string,        // 必填
  "companyEmail": string,          // 必填
  "taxId": string,                 // 必填
  "categories": string[],          // 必填
  "paymentMethod": string,         // 必填
  "deposit": number,               // 必填
  "invoiceTitle": string,          // 必填
  "invoiceTaxId": string,          // 必填
  "note": string,                  // 選填
  "registeredDate": string,        // 必填，YYYY-MM-DD
  "deliveryDays": string[],        // 必填
  
  // 聯絡人資料（至少一個主要聯絡人）
  "contacts": [
    {
      "isPrimary": boolean,        // 必填，至少一個 true
      "name": string,              // 必填
      "phone": string,             // 必填
      "address": string,           // 必填
      "email": string              // 必填
    }
  ],
  
  // 自訂價格（選填）
  "customPrices": [
    {
      "productId": string,         // 必填
      "adjustment": number         // 必填
    }
  ]
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "客戶建立成功",
  "data": {
    "id": number,
    // ... 完整客戶資料
  }
}
```

---

### 3.4 更新客戶

**Endpoint**: `PUT /customers/:id`

**Request Body**: （所有欄位選填，但如果更新 contacts，需提供完整 contacts 陣列）
```typescript
{
  "companyName": string,
  "companyPhone": string,
  "companyAddress": string,
  "companyEmail": string,
  "taxId": string,
  "categories": string[],
  "paymentMethod": string,
  "deposit": number,
  "invoiceTitle": string,
  "invoiceTaxId": string,
  "note": string,
  "registeredDate": string,
  "deliveryDays": string[],
  
  "contacts": [
    {
      "id": number,               // 有 id 表示更新，無 id 表示新增
      "isPrimary": boolean,
      "name": string,
      "phone": string,
      "address": string,
      "email": string
    }
  ],
  
  "customPrices": [
    {
      "id": number,               // 有 id 表示更新，無 id 表示新增
      "productId": string,
      "adjustment": number
    }
  ]
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "客戶更新成功",
  "data": {
    "id": number,
    // ... 更新後的完整資料
  }
}
```

---

### 3.5 刪除客戶

**Endpoint**: `DELETE /customers/:id`

**Response**:
```typescript
{
  "success": true,
  "message": "客戶刪除成功"
}
```

---

### 3.6 取得客戶訂單列表

**Endpoint**: `GET /customers/:id/orders`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "orderDateFrom": string,     // YYYY-MM-DD
  "orderDateTo": string,       // YYYY-MM-DD
  "shipDateFrom": string,      // YYYY-MM-DD
  "shipDateTo": string,        // YYYY-MM-DD
  "type": "water" | "egg" | "dispenser",
  "status": string
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "type": "water" | "egg" | "dispenser",
        "productId": string,
        "productName": string,
        "orderDate": string,
        "shipDate": string,
        "quantity": number,
        "unitPrice": number,
        "total": number,
        "status": string,
        "address": string,
        "note": string
      }
    ],
    "pagination": {...}
  }
}
```

---

## 4. 潛在客戶管理 API

### 4.1 取得潛在客戶列表

**Endpoint**: `GET /potential-customers`

**Query Parameters**:
```typescript
{
  // 分頁參數
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": "asc" | "desc",
  
  // 篩選參數
  "companyName": string,
  "source": "客戶轉介" | "電話開發" | "網路廣告" | "展覽活動" | "其他",
  "trackDateFrom": string,
  "trackDateTo": string
}
```

**Response**: （類似客戶列表，但多了來源相關欄位）
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "companyName": string,
        // ... 客戶基本欄位
        "source": string,
        "trackDate": string,
        "referralCustomerId": number | null,
        "referralCustomerName": string | null,
        "referralEmployeeId": number | null,
        "referralEmployeeName": string | null,
        "sourceDetail": string | null,
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 4.2 取得單一潛在客戶

**Endpoint**: `GET /potential-customers/:id`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": number,
    // ... 完整客戶資料
    "source": string,
    "trackDate": string,
    "referralCustomerId": number | null,
    "referralEmployeeId": number | null,
    "sourceDetail": string | null,
    "contacts": [...],
    "customPrices": [...]
  }
}
```

---

### 4.3 新增潛在客戶

**Endpoint**: `POST /potential-customers`

**Request Body**:
```typescript
{
  // 基本客戶資料（同客戶管理）
  "companyName": string,
  "companyPhone": string,
  // ... 其他客戶欄位
  
  // 潛在客戶特有欄位
  "source": "客戶轉介" | "電話開發" | "網路廣告" | "展覽活動" | "其他",  // 必填
  "trackDate": string,                                                    // 必填
  "referralCustomerId": number | null,      // 當 source = "客戶轉介" 時必填
  "referralEmployeeId": number | null,      // 當 source = "電話開發" 時必填
  "sourceDetail": string | null,            // 當 source 為其他選項時選填
  
  "contacts": [...],
  "customPrices": [...]
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "潛在客戶建立成功",
  "data": {
    "id": number,
    // ... 完整資料
  }
}
```

---

### 4.4 更新潛在客戶

**Endpoint**: `PUT /potential-customers/:id`

**Request Body**: （同新增，所有欄位選填）

---

### 4.5 轉為正式客戶

**Endpoint**: `POST /potential-customers/:id/convert`

**Request Body**:
```typescript
{
  // 可選：覆寫或補充資料
  "companyName": string,
  "deposit": number,
  // ... 其他要更新的欄位
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "已成功轉為正式客戶",
  "data": {
    "customerId": number,        // 新建立的正式客戶 ID
    "customer": {
      // ... 完整客戶資料
    }
  }
}
```

---

### 4.6 刪除潛在客戶

**Endpoint**: `DELETE /potential-customers/:id`

---

## 5. 廠商管理 API

### 5.1 取得廠商列���

**Endpoint**: `GET /vendors`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": "asc" | "desc",
  
  "category": "桶裝水" | "飲水機" | "車輛" | "雞蛋",
  "companyName": string,
  "status": "啟用" | "停用"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "category": "桶裝水" | "飲水機" | "車輛" | "雞蛋",
        "companyName": string,
        "companyPhone": string,
        "companyAddress": string,
        "email": string,
        "contactName": string,
        "contactPhone": string,
        "accountName": string,
        "accountNumber": string,
        "bank": string,
        "branch": string,
        "notes": string,
        "status": "啟用" | "停用",
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 5.2 取得單一廠商

**Endpoint**: `GET /vendors/:id`

---

### 5.3 新增廠商

**Endpoint**: `POST /vendors`

**Request Body**:
```typescript
{
  "category": "桶裝水" | "飲水機" | "車輛" | "雞蛋",  // 必填
  "companyName": string,       // 必填
  "companyPhone": string,      // 必填
  "companyAddress": string,    // 必填
  "email": string,             // 必填
  "contactName": string,       // 必填
  "contactPhone": string,      // 必填
  "accountName": string,       // 必填
  "accountNumber": string,     // 必填
  "bank": string,              // 必填
  "branch": string,            // 必填
  "notes": string,             // 選填
  "status": "啟用" | "停用"    // 選填，預設 "啟用"
}
```

---

### 5.4 更新廠商

**Endpoint**: `PUT /vendors/:id`

---

### 5.5 刪除廠商

**Endpoint**: `DELETE /vendors/:id`

---

## 6. 車輛管理 API

### 6.1 取得車輛列表

**Endpoint**: `GET /vehicles`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "plateNumber": string,
  "driverName": string,
  "status": "正常" | "維修中" | "報廢"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "plateNumber": string,
        "brand": string,
        "ownerName": string,
        "driverName": string,
        "manufactureYear": number,
        "purchaseDate": string,
        "licenseExpiry": string,
        "mileage": number,
        "mileageDate": string,
        "licenseImage": string,          // 圖片 URL
        "notes": string,
        "status": "正常" | "維修中" | "報廢",
        "maintenanceRecordsCount": number,
        "repairRecordsCount": number,
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 6.2 取得單一車輛（含維護記錄）

**Endpoint**: `GET /vehicles/:id`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": number,
    "plateNumber": string,
    // ... 基本資料
    
    // 保養記錄
    "maintenanceRecords": [
      {
        "id": number,
        "vendor": string,
        "date": string,
        "items": string,
        "cost": number,
        "warrantyExpiry": string,
        "mileage": number,
        "nextMaintenanceDate": string,
        "nextMaintenanceMileage": number,
        "status": "完成" | "待付款" | "保固內",
        "images": string[]           // 圖片 URL 陣列
      }
    ],
    
    // 維修記錄
    "repairRecords": [
      {
        "id": number,
        "vendor": string,
        "date": string,
        "items": string,
        "cost": number,
        "warrantyExpiry": string,
        "mileage": number,
        "nextRepairDate": string,
        "nextRepairMileage": number,
        "status": "完成" | "待付款" | "保固內",
        "images": string[]
      }
    ]
  }
}
```

---

### 6.3 新增車輛

**Endpoint**: `POST /vehicles`

**Request Body**:
```typescript
{
  "plateNumber": string,           // 必填
  "brand": string,                 // 必填
  "ownerName": string,             // 必填
  "driverName": string,            // 必填
  "manufactureYear": number,       // 必填
  "purchaseDate": string,          // 必填
  "licenseExpiry": string,         // 必填
  "mileage": number,               // 必填
  "mileageDate": string,           // 必填
  "licenseImage": string,          // 選填，圖片 URL
  "notes": string,                 // 選填
  "status": "正常" | "維修中" | "報廢"  // 選填
}
```

---

### 6.4 更新車輛

**Endpoint**: `PUT /vehicles/:id`

---

### 6.5 刪除車輛

**Endpoint**: `DELETE /vehicles/:id`

---

### 6.6 新增保養記錄

**Endpoint**: `POST /vehicles/:vehicleId/maintenance`

**Request Body**:
```typescript
{
  "vendor": string,                    // 必填
  "date": string,                      // 必填
  "items": string,                     // 必填
  "cost": number,                      // 必填
  "warrantyExpiry": string,            // 必填
  "mileage": number,                   // 必填
  "nextMaintenanceDate": string,       // 必填
  "nextMaintenanceMileage": number,    // 必填
  "status": "完成" | "待付款" | "保固內",  // 必填
  "images": string[]                   // 選填
}
```

---

### 6.7 更新保養記錄

**Endpoint**: `PUT /vehicles/:vehicleId/maintenance/:maintenanceId`

---

### 6.8 刪除保養記錄

**Endpoint**: `DELETE /vehicles/:vehicleId/maintenance/:maintenanceId`

---

### 6.9 新增維修記錄

**Endpoint**: `POST /vehicles/:vehicleId/repairs`

**Request Body**: （同保養記錄）

---

### 6.10 更新維修記錄

**Endpoint**: `PUT /vehicles/:vehicleId/repairs/:repairId`

---

### 6.11 刪除維修記錄

**Endpoint**: `DELETE /vehicles/:vehicleId/repairs/:repairId`

---

## 7. 商品管理 API

### 7.1 取得商品列表

**Endpoint**: `GET /products`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "category": "桶裝水" | "雞蛋" | "飲水機",
  "name": string
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": string,                // 例如: "water-1"
        "category": "桶裝水" | "雞蛋" | "飲水機",
        "name": string,
        "spec": string,
        "retailPrice": number,
        "minStock": number,          // 最低安全庫存量
        "maxStock": number,          // 最高安全庫存量
        "currentStock": number,      // 當前實際庫存（從 inventory 表關聯）
        "stockStatus": "正常" | "低於安全庫存" | "高於安全庫存",
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 7.2 取得單一商品

**Endpoint**: `GET /products/:id`

---

### 7.3 新增商品

**Endpoint**: `POST /products`

**Request Body**:
```typescript
{
  "id": string,                        // 必填，唯一識別碼
  "category": "桶裝水" | "雞蛋" | "飲水機",  // 必填
  "name": string,                      // 必填
  "spec": string,                      // 必填
  "retailPrice": number,               // 必填
  "minStock": number,                  // 必填
  "maxStock": number                   // 必填
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "商品建立成功，庫存初始化為 0",
  "data": {
    "id": string,
    // ... 商品資料
    "currentStock": 0
  }
}
```

---

### 7.4 更新商品

**Endpoint**: `PUT /products/:id`

**Request Body**:
```typescript
{
  "name": string,           // 選填
  "spec": string,           // 選填
  "retailPrice": number,    // 選填
  "minStock": number,       // 選填
  "maxStock": number        // 選填
}
```

---

### 7.5 刪除商品

**Endpoint**: `DELETE /products/:id`

**注意**: 有庫存或訂單關聯時應拒絕刪除

---

## 8. 訂單管理 API

### 8.1 取得訂單列表

**Endpoint**: `GET /orders`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": "asc" | "desc",
  
  // 篩選參數
  "type": "water" | "egg" | "dispenser",
  "customerId": number,
  "employeeId": number,
  "productId": string,
  "status": "待出貨" | "已出貨" | "已完成" | "已取消",
  "orderDateFrom": string,
  "orderDateTo": string,
  "shipDateFrom": string,
  "shipDateTo": string
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "type": "water" | "egg" | "dispenser",
        "customerId": number,
        "customerName": string,
        "employeeId": number,
        "employeeName": string,
        "productId": string,
        "productName": string,
        "orderDate": string,
        "shipDate": string,
        "quantity": number,
        "unitPrice": number,
        "total": number,
        "status": "待出貨" | "已出貨" | "已完成" | "已取消",
        "address": string,
        "note": string,
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 8.2 取得單一訂單

**Endpoint**: `GET /orders/:id`

---

### 8.3 新增訂單

**Endpoint**: `POST /orders`

**Request Body**:
```typescript
{
  "type": "water" | "egg" | "dispenser",  // 必填
  "customerId": number,                   // 必填
  "employeeId": number,                   // 必填
  "productId": string,                    // 必填
  "orderDate": string,                    // 必填
  "shipDate": string,                     // 必填
  "quantity": number,                     // 必填，> 0
  "unitPrice": number,                    // 必填，可自動從商品+客戶自訂價格計算
  "address": string,                      // 必填
  "note": string,                         // 選填
  "status": string                        // 選填，預設 "待出貨"
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "訂單建立成功",
  "data": {
    "id": number,
    "total": number,        // 自動計算 quantity * unitPrice
    // ... 其他欄位
  }
}
```

---

### 8.4 更新訂單

**Endpoint**: `PUT /orders/:id`

**Request Body**: （所有欄位選填）

---

### 8.5 更新訂單狀態

**Endpoint**: `PATCH /orders/:id/status`

**Request Body**:
```typescript
{
  "status": "待出貨" | "已出貨" | "已完成" | "已取消",  // 必填
  "reason": string                                     // 當狀態為 "已取消" 時必填
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "訂單狀態更新成功",
  "data": {
    "id": number,
    "status": string,
    "inventoryAdjusted": boolean    // 是否有調整庫存
  }
}
```

**業務邏輯**:
- 狀態變更為 "已出貨" 時，自動扣減庫存
- 狀態變更為 "已取消" 時，如已扣庫存則回復庫存

---

### 8.6 刪除訂單

**Endpoint**: `DELETE /orders/:id`

**注意**: 已出貨或已完成的訂單應拒絕刪除

---

## 9. 庫存管理 API

### 9.1 取得商品庫存列表

**Endpoint**: `GET /inventory`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "category": "桶裝水" | "雞蛋" | "飲水機",
  "productName": string,
  "stockStatus": "正常" | "低於安全庫存" | "高於安全庫存"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": string,
        "productName": string,
        "productCategory": string,
        "currentStock": number,
        "minStock": number,
        "maxStock": number,
        "stockStatus": "正常" | "低於安全庫存" | "高於安全庫存",
        "lastTransactionDate": string,
        "lastUpdated": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 9.2 取得庫存異動記錄列表

**Endpoint**: `GET /inventory/transactions`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "transactionType": "進貨" | "出貨" | "調整" | "盤點",
  "relatedType": "廠商進貨單" | "客戶訂單" | "人工調整" | "人工盤點",
  "productId": string,
  "dateFrom": string,
  "dateTo": string,
  "operatorId": number
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "transactionType": "進貨" | "出貨" | "調整" | "盤點",
        "relatedType": "廠商進貨單" | "客戶訂單" | "人工調整" | "人工盤點",
        "relatedId": number | null,
        "relatedName": string,
        "orderId": string | null,
        "reasonNote": string,
        "transactionDate": string,
        "operatorId": number,
        "operatorName": string,
        
        // 商品明細
        "products": [
          {
            "productCategory": string,
            "productId": string,
            "productName": string,
            "changeAmount": number,      // 正數為增加，負數為減少
            "stockBefore": number,
            "stockAfter": number
          }
        ],
        
        "createdAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 9.3 取得單一庫存異動記錄

**Endpoint**: `GET /inventory/transactions/:id`

---

### 9.4 建立庫存異動（進貨）

**Endpoint**: `POST /inventory/transactions/purchase`

**Request Body**:
```typescript
{
  "relatedId": number,              // 廠商 ID，必填
  "relatedName": string,            // 廠商名稱，必填
  "transactionDate": string,        // 必填
  "operatorId": number,             // 操作人員 ID，必填
  "reasonNote": string,             // 必填
  
  "products": [
    {
      "productId": string,          // 必填
      "changeAmount": number        // 必填，> 0
    }
  ]
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "進貨記錄建立成功，庫存已更新",
  "data": {
    "id": number,
    "transactionType": "進貨",
    "products": [
      {
        "productId": string,
        "productName": string,
        "changeAmount": number,
        "stockBefore": number,
        "stockAfter": number
      }
    ]
  }
}
```

---

### 9.5 建立庫存異動（調整）

**Endpoint**: `POST /inventory/transactions/adjustment`

**Request Body**:
```typescript
{
  "transactionDate": string,
  "operatorId": number,
  "reasonNote": string,          // 必填，說明調整原因
  
  "products": [
    {
      "productId": string,
      "changeAmount": number     // 可正可負
    }
  ]
}
```

---

### 9.6 建立庫存異動（盤點）

**Endpoint**: `POST /inventory/transactions/count`

**Request Body**:
```typescript
{
  "transactionDate": string,
  "operatorId": number,
  "reasonNote": string,
  
  "products": [
    {
      "productId": string,
      "actualStock": number      // 實際盤點數量
    }
  ]
}
```

**業務邏輯**: 自動計算與系統庫存的差異，建立調整記錄

---

### 9.7 取得庫存警示

**Endpoint**: `GET /inventory/alerts`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "lowStockAlerts": [
      {
        "productId": string,
        "productName": string,
        "currentStock": number,
        "minStock": number,
        "shortfall": number        // 缺少數量
      }
    ],
    "highStockAlerts": [
      {
        "productId": string,
        "productName": string,
        "currentStock": number,
        "maxStock": number,
        "excess": number           // 超出數量
      }
    ]
  }
}
```

---

## 10. 送貨報表 API

### 10.1 取得送貨報表列表

**Endpoint**: `GET /delivery-reports`

**Query Parameters**:
```typescript
{
  "page": number,
  "pageSize": number,
  "employeeId": number,          // 司機 ID
  "reportDateFrom": string,
  "reportDateTo": string,
  "status": "草稿" | "已提交" | "已審核" | "已退回"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": number,
        "employeeId": number,
        "employeeName": string,
        "reportDate": string,
        "weekDays": string,
        "totalAmount": number,
        "fuelExpense": number,
        "otherExpense": number,
        "productCount": number,      // 商品明細數量
        "status": "草稿" | "已提交" | "已審核" | "已退回",
        "createdAt": string,
        "updatedAt": string
      }
    ],
    "pagination": {...}
  }
}
```

---

### 10.2 取得單一送貨報表（含明細）

**Endpoint**: `GET /delivery-reports/:id`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": number,
    "employeeId": number,
    "employeeName": string,
    "reportDate": string,
    "weekDays": string,                     // 顯示用，例如："星期一、星期三"
    "selectedWeekDays": string[],           // 當前選擇的星期陣列
    "totalAmount": number,
    "fuelExpense": number,
    "otherExpense": number,
    "status": "草稿" | "已提交" | "已審核" | "已退回",
    
    // 商品明細
    "products": [
      {
        "id": number,
        "productId": number,
        "productName": string,
        "customerName": string,
        "customerId": number,
        "quantity": number,
        "unitPrice": number,
        "amount": number,
        "actualAmount": number,             // 實際收付金額
        "paymentMethod": string,
        "note": string,
        "isConvertedToOrder": boolean,
        "orderId": number | null
      }
    ],
    
    "createdAt": string,
    "updatedAt": string
  }
}
```

---

### 10.3 新增送貨報表

**Endpoint**: `POST /delivery-reports`

**Request Body**:
```typescript
{
  "employeeId": number,          // 必填
  "reportDate": string,          // 必填
  "weekDays": string,            // 必填，顯示用字串
  "selectedWeekDays": string[],  // 必填，星期陣列
  "fuelExpense": number,         // 選填
  "otherExpense": number,        // 選填
  
  "products": [
    {
      "productId": number,       // 必填
      "customerName": string,    // 必填
      "customerId": number,      // 必填
      "quantity": number,        // 必填
      "unitPrice": number,       // 必填
      "actualAmount": number,    // 必填，實際收付金額
      "paymentMethod": string,   // 必填
      "note": string            // 選填
    }
  ]
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "送貨報表建立成功",
  "data": {
    "id": number,
    "totalAmount": number,    // 自動計算
    // ... 其他欄位
  }
}
```

---

### 10.4 更新送貨報表

**Endpoint**: `PUT /delivery-reports/:id`

**Request Body**: （同新增，所有欄位選填）

**特殊邏輯**:
- `selectedWeekDays` 可以新增星期，但建議前端控制不允許移除原始星期
- `actualAmount` 實際收付金額可與計算金額不同（折扣、議價等情境）

**注意**: 已審核的報表應拒絕更新

---

### 10.5 提交送貨報表

**Endpoint**: `PATCH /delivery-reports/:id/submit`

**Response**:
```typescript
{
  "success": true,
  "message": "報表已提交審核",
  "data": {
    "id": number,
    "status": "已提交"
  }
}
```

---

### 10.6 審核送貨報表

**Endpoint**: `PATCH /delivery-reports/:id/review`

**Request Body**:
```typescript
{
  "approved": boolean,       // true = 通過, false = 退回
  "reviewNote": string       // 審核意見，退回時必填
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "報表審核完成",
  "data": {
    "id": number,
    "status": "已審核" | "已退回"
  }
}
```

---

### 10.7 送貨明細轉訂單（批次）

**Endpoint**: `POST /delivery-reports/:reportId/convert-to-order`

**Request Body**:
```typescript
{
  "mode": "new" | "existing",                  // 必填，轉訂單模式
  "productIndexes": number[],                  // 必填，要轉入的商品索引陣列
  
  // 當 mode = "new" 時的欄位
  "orderType": "water" | "egg" | "dispenser",  // 建立新訂單時必填
  "shipDate": string,                          // 建立新訂單時必填
  "employeeId": number,                        // 建立新訂單時必填
  "note": string,                              // 選填
  
  // 當 mode = "existing" 時的欄位
  "existingOrderId": number                    // 加入現有訂單時必填
}
```

**Response**:
```typescript
{
  "success": true,
  "message": "已成功轉為訂單" | "已成功加入訂單 #xxx",
  "data": {
    "mode": "new" | "existing",
    "orderId": number,
    "convertedCount": number,                  // 成功轉入的商品數量
    "order": {
      // ... 訂單完整資料（含新加入的商品）
    }
  }
}
```

**業務邏輯**:

#### 模式 1: 建立新訂單 (mode = "new")
1. 根據選擇的商品明細建立一筆新訂單
2. 訂單狀態設為 "已完成"
3. 更新每個送貨明細的 `isConvertedToOrder` 為 `true`
4. 記錄關聯的 `orderId`

#### 模式 2: 加入現有訂單 (mode = "existing")
1. 查詢指定的現有訂單 (`existingOrderId`)
2. 將選擇的商品明細加入到該訂單的商品清單中
3. 重新計算訂單總金額
4. 更新每個送貨明細的 `isConvertedToOrder` 為 `true`
5. 記錄關聯的 `orderId`

**驗證規則**:
- `productIndexes` 必須是有效的商品索引
- 被選擇的商品不能已經轉入過訂單
- 當 `mode = "existing"` 時，`existingOrderId` 必須存在且為有效訂單
- 建議只允許加入到「待出貨」或「已出貨」狀態的訂單

---

### 10.8 刪除送貨報表

**Endpoint**: `DELETE /delivery-reports/:id`

**注意**: 已審核的報表應拒絕刪除

---

### 10.9 取得日報表

**Endpoint**: `GET /delivery-reports/daily-report`

**Query Parameters**:
```typescript
{
  "reportDate": string,      // 必填，YYYY-MM-DD
  "employeeId": number       // 選填，不填則顯示所有司機
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "reportDate": string,
    "employees": [
      {
        "employeeId": number,
        "employeeName": string,
        "reports": [
          {
            "reportId": number,
            "totalAmount": number,
            "fuelExpense": number,
            "otherExpense": number,
            "products": [...]
          }
        ],
        "dailyTotal": number,
        "dailyExpenses": number
      }
    ],
    "grandTotal": number,
    "grandExpenses": number
  }
}
```

---

## 11. 統計報表 API

### 11.1 儀表板統計

**Endpoint**: `GET /statistics/dashboard`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "customers": {
      "total": number,
      "active": number,
      "inactive": number
    },
    "orders": {
      "today": number,
      "thisWeek": number,
      "thisMonth": number,
      "pending": number,
      "shipped": number
    },
    "inventory": {
      "lowStockCount": number,
      "outOfStockCount": number,
      "totalValue": number
    },
    "revenue": {
      "today": number,
      "thisWeek": number,
      "thisMonth": number
    }
  }
}
```

---

### 11.2 銷售統計

**Endpoint**: `GET /statistics/sales`

**Query Parameters**:
```typescript
{
  "dateFrom": string,
  "dateTo": string,
  "groupBy": "day" | "week" | "month",
  "productCategory": "桶裝水" | "雞蛋" | "飲水機"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": number,
      "totalRevenue": number,
      "averageOrderValue": number
    },
    "breakdown": [
      {
        "period": string,
        "orderCount": number,
        "revenue": number,
        "topProducts": [
          {
            "productId": string,
            "productName": string,
            "quantity": number,
            "revenue": number
          }
        ]
      }
    ]
  }
}
```

---

### 11.3 庫存統計

**Endpoint**: `GET /statistics/inventory`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "byCategory": [
      {
        "category": string,
        "totalItems": number,
        "totalValue": number,
        "lowStockItems": number
      }
    ],
    "recentTransactions": [
      {
        "date": string,
        "type": string,
        "count": number
      }
    ]
  }
}
```

---

### 11.4 客戶統計

**Endpoint**: `GET /statistics/customers`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "topCustomers": [
      {
        "customerId": number,
        "customerName": string,
        "totalOrders": number,
        "totalRevenue": number
      }
    ],
    "byCategory": [
      {
        "category": string,
        "count": number,
        "revenue": number
      }
    ],
    "newCustomersThisMonth": number
  }
}
```

---

## 12. 檔案上傳 API

### 12.1 上傳單一檔案

**Endpoint**: `POST /upload`

**Request**: `multipart/form-data`
```typescript
{
  "file": File,                    // 必填
  "category": "vehicle" | "delivery" | "other",  // 必填
  "relatedId": number              // 選填，關聯的資料 ID
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "fileId": string,
    "fileName": string,
    "fileSize": number,
    "mimeType": string,
    "url": string,               // 檔案存取 URL
    "thumbnailUrl": string,      // 縮圖 URL（如為圖片）
    "uploadedAt": string
  }
}
```

---

### 12.2 上傳多個檔案

**Endpoint**: `POST /upload/multiple`

**Request**: `multipart/form-data`
```typescript
{
  "files": File[],                 // 必填
  "category": string,
  "relatedId": number
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": string,
        "url": string,
        // ... 其他欄位
      }
    ],
    "uploadedCount": number
  }
}
```

---

### 12.3 刪除檔案

**Endpoint**: `DELETE /upload/:fileId`

---

## 附錄

### A. 錯誤碼對照表

| 錯誤碼 | 說明 |
|-------|------|
| AUTH_001 | 帳號或密碼錯誤 |
| AUTH_002 | Token 已過期 |
| AUTH_003 | 權限不足 |
| VALID_001 | 必填欄位缺失 |
| VALID_002 | 欄位格式錯誤 |
| VALID_003 | 欄位值超出範圍 |
| BIZ_001 | 資源不存在 |
| BIZ_002 | 資源已存在（重複） |
| BIZ_003 | 業務規則驗證失敗 |
| BIZ_004 | 庫存不足 |
| BIZ_005 | 訂單狀態不允許此操作 |
| SYS_001 | 資料庫錯誤 |
| SYS_002 | 檔案上傳失敗 |

---

### B. API 總覽統計

| 模組 | API 數量 |
|-----|---------|
| 認證與授權 | 3 |
| 員工管理 | 5 |
| 客戶管理 | 6 |
| 潛在客戶管理 | 6 |
| 廠商管理 | 5 |
| 車輛管理 | 11 |
| 商品管理 | 5 |
| 訂單管理 | 6 |
| 庫存管理 | 7 |
| 送貨報表 | 9 |
| 統計報表 | 4 |
| 檔案上傳 | 3 |
| **總計** | **70 支 API** |

---

### C. 開發優先級建議

#### Phase 1: 核心功能（必須）
```
✅ 認證與授權 (3)
✅ 員工管理 (5)
✅ 客戶管理 (6)
✅ 商品管理 (5)
✅ 訂單管理 (6)
✅ 庫存管理 (7)
```

#### Phase 2: 進階功能
```
○ 潛在客戶管理 (6)
○ 送貨報表 (9)
○ 廠商管理 (5)
```

#### Phase 3: 擴展功能
```
○ 車輛管理 (11)
○ 統計報表 (4)
○ 檔案上傳 (3)
```

---

### D. 資料驗證規則

#### 電子郵件格式
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

#### 台灣身分證字號
```regex
^[A-Z][12]\d{8}$
```

#### 統一編號
```regex
^\d{8}$
```

#### 台灣手機號碼
```regex
^09\d{8}$
```

#### 日期格式
```
YYYY-MM-DD
例如: 2025-01-03
```

#### 日期時間格式（ISO 8601）
```
YYYY-MM-DDTHH:mm:ss.sssZ
例如: 2025-01-03T14:30:00.000Z
```

---

## 版本歷程

### v1.0 (2025-01-03)
- 初版 API 規格
- 定義 70 支 API
- 涵蓋所有核心業務模組

---

**文件維護**: 技術團隊  
**最後更新**: 2025-01-03  
**聯絡方式**: [待補充]
