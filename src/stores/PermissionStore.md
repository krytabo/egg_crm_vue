# PermissionStore 權限管理使用說明

## 概述

`PermissionStore` 是一個基於 Pinia 的權限管理 Store，用於管理使用者登入後的權限資料，並提供各種權限檢查方法供元件使用。

## 權限資料格式

登入 API 回傳的 `permissions` 陣列格式：

```json
{
  "permissions": [
    { "resource": "KPI", "action": "READ" },
    { "resource": "USER", "action": "CREATE" },
    { "resource": "USER", "action": "READ" },
    { "resource": "USER", "action": "UPDATE" },
    { "resource": "CUSTOMER", "action": "READ" }
  ]
}
```

## 資源類型 (Resource)

| Resource | 說明 |
|----------|------|
| `KPI` | 儀表板 |
| `USER` | 員工管理 |
| `CUSTOMER` | 客戶管理 |
| `VENDOR` | 廠商管理 |
| `VEHICLE` | 車輛管理 |
| `DRIVER` | 司機管理 |
| `PRODUCT` | 商品管理 |
| `ORDER` | 訂單管理 |
| `INVENTORY` | 庫存管理 |
| `REPORT` | 報表管理 |
| `BILLING` | 帳務管理 |
| `FILE` | 檔案管理 |
| `NOTIFICATION` | 通知管理 |
| `ROLE` | 角色/權限管理 |

## 操作類型 (Action)

| Action | 說明 |
|--------|------|
| `CREATE` | 新增資料 |
| `READ` | 讀取/查詢資料 |
| `UPDATE` | 更新/修改資料 |
| `DELETE` | 刪除資料 |
| `EXPORT` | 匯出資料 |
| `IMPORT` | 匯入資料 |

---

## 基本使用

### 在元件中導入

```vue
<script setup>
import { usePermissionStore } from '@/stores/PermissionStore';

const permissionStore = usePermissionStore();
</script>
```

### 提供的方法

| 方法 | 參數 | 回傳 | 說明 |
|------|------|------|------|
| `setPermissions(list)` | `Array` | - | 設置權限列表（登入時呼叫） |
| `clearPermissions()` | - | - | 清除權限（登出時呼叫） |
| `hasPermission(resource, action)` | `String, String` | `Boolean` | 檢查是否有特定權限 |
| `hasResourceAccess(resource)` | `String` | `Boolean` | 檢查是否有該資源的任何權限 |
| `hasAnyPermission(list)` | `Array` | `Boolean` | 檢查是否有多個權限中的任一個 |
| `hasAllPermissions(list)` | `Array` | `Boolean` | 檢查是否同時擁有所有權限 |
| `getResourceActions(resource)` | `String` | `Array` | 取得某資源擁有的所有操作 |

---

## 使用範例

### 1. 檢查特定權限（最常用）

用於控制按鈕、操作的顯示：

```vue
<template>
  <!-- 新增按鈕 -->
  <a-button v-if="permissionStore.hasPermission('USER', 'CREATE')">
    新增員工
  </a-button>

  <!-- 編輯按鈕 -->
  <a-button v-if="permissionStore.hasPermission('USER', 'UPDATE')">
    編輯
  </a-button>

  <!-- 刪除按鈕 -->
  <a-button v-if="permissionStore.hasPermission('USER', 'DELETE')">
    刪除
  </a-button>

  <!-- 匯出按鈕 -->
  <a-button v-if="permissionStore.hasPermission('USER', 'EXPORT')">
    匯出
  </a-button>
</template>
```

### 2. 檢查資源存取權限

用於控制整個區塊或頁面的顯示：

```vue
<template>
  <!-- 只要有 USER 的任何權限就顯示 -->
  <div v-if="permissionStore.hasResourceAccess('USER')">
    員工管理區塊
  </div>
</template>
```

### 3. 檢查多個權限（任一個）

```vue
<script setup>
// 有新增或更新權限就顯示表單
const canEditUser = computed(() =>
  permissionStore.hasAnyPermission([
    { resource: 'USER', action: 'CREATE' },
    { resource: 'USER', action: 'UPDATE' }
  ])
);
</script>

<template>
  <UserForm v-if="canEditUser" />
</template>
```

### 4. 檢查多個權限（全部）

```vue
<script setup>
// 必須同時有讀取和匯出權限
const canExportReport = computed(() =>
  permissionStore.hasAllPermissions([
    { resource: 'REPORT', action: 'READ' },
    { resource: 'REPORT', action: 'EXPORT' }
  ])
);
</script>
```

### 5. 取得資源的所有操作

```vue
<script setup>
// 取得 USER 資源擁有的所有操作
const userActions = permissionStore.getResourceActions('USER');
// 結果: ['CREATE', 'READ', 'UPDATE', 'DELETE']
</script>
```

---

## 側邊選單權限過濾

### 實作位置

`src/components/layout/AppSidebar.vue`

### 實作邏輯

側邊選單會根據使用者權限自動過濾顯示項目：

```javascript
import { usePermissionStore } from '@/stores/PermissionStore';

const permissionStore = usePermissionStore();

// 選單項目定義（每個項目有對應的 role 屬性）
const menuSections = [
  {
    key: 'section-dashboard',
    label: '儀表板',
    items: [{ id: 'dashboard', label: '儀表板', role: 'KPI' }],
  },
  {
    key: 'section-basic',
    label: '基本資料',
    items: [
      { id: 'basic-info-users', label: '員工資料', role: 'USER' },
      { id: 'basic-info-customers', label: '客戶資料', role: 'CUSTOMER' },
      // ...
    ],
  },
  // ...
];

// 根據權限過濾選單
const filteredMenuSections = computed(() => {
  return menuSections
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // 沒有設定 role 則預設顯示
        if (!item.role) return true;
        // 檢查是否有該資源的任何權限
        return permissionStore.hasResourceAccess(item.role);
      });

      // 過濾後沒有項目則不顯示該區塊
      if (filteredItems.length === 0) return null;

      return { ...section, items: filteredItems };
    })
    .filter(Boolean);
});
```

### 選單項目與權限對應表

| 選單項目 | 路由名稱 | 對應權限 (role) |
|----------|----------|-----------------|
| 儀表板 | `dashboard` | `KPI` |
| 員工資料 | `basic-info-users` | `USER` |
| 客戶資料 | `basic-info-customers` | `CUSTOMER` |
| 潛在客戶 | `basic-info-leads` | `CUSTOMER` |
| 廠商資料 | `basic-info-vendors` | `VENDOR` |
| 車輛資料 | `basic-info-vehicles` | `VEHICLE` |
| 司機資料 | `basic-info-drivers` | `DRIVER` |
| 桶裝水資料 | `products-water` | `PRODUCT` |
| 雞蛋資料 | `products-eggs` | `PRODUCT` |
| 飲水機資料 | `products-dispensers` | `PRODUCT` |
| 桶裝水訂單 | `orders-water` | `ORDER` |
| 雞蛋訂單 | `orders-eggs` | `ORDER` |
| 飲水機訂單 | `orders-dispensers` | `ORDER` |
| 商品庫存 | `shipments-inventory` | `INVENTORY` |
| 送貨報表 | `shipments-reports` | `REPORT` |
| 帳務管理 | `finance-billing` | `BILLING` |
| 產品類型 | `settings-product-types` | `ROLE` |
| 角色設定 | `settings-roles` | `ROLE` |
| 權限設定 | `settings-permissions` | `ROLE` |

---

## 登入後自動導向邏輯

### 實作位置

`src/pages/AuthPage/LoginPage.vue`

### 導向優先順序

登入後若無指定的重定向路徑，會依以下順序找到第一個有權限的頁面：

```
KPI → USER → CUSTOMER → VENDOR → VEHICLE → DRIVER → PRODUCT
→ ORDER → INVENTORY → REPORT → BILLING → ROLE
```

### 實作邏輯

```javascript
const menuRoutePriority = [
  { name: 'dashboard', resource: 'KPI' },
  { name: 'basic-info-users', resource: 'USER' },
  { name: 'basic-info-customers', resource: 'CUSTOMER' },
  // ...
];

const getFirstAccessibleRoute = () => {
  for (const route of menuRoutePriority) {
    if (permissionStore.hasResourceAccess(route.resource)) {
      return route.name;
    }
  }
  return null;
};

// 登入後
if (redirectTarget) {
  await router.replace(redirectTarget);
} else {
  const firstAccessibleRoute = getFirstAccessibleRoute();
  if (firstAccessibleRoute) {
    await router.push({ name: firstAccessibleRoute });
  } else {
    // 顯示無權限提示
  }
}
```

---

## 權限儲存機制

- **儲存位置**: `localStorage` (key: `Egg_user_permissions`)
- **設置時機**: 登入成功後呼叫 `permissionStore.setPermissions(profile.permissions)`
- **清除時機**: 登出時會自動清除（透過 `removeUserInfo()` 函數）
- **初始化**: Store 建立時會自動從 localStorage 載入權限

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `src/stores/PermissionStore.js` | 權限管理 Store |
| `src/components/layout/AppSidebar.vue` | 側邊選單（使用權限過濾） |
| `src/pages/AuthPage/LoginPage.vue` | 登入頁面（設置權限、自動導向） |
| `src/utils/auth.js` | 認證工具函數（登出時清除權限） |
| `src/composables/useSelectOptions.js` | 權限相關選項定義 |
