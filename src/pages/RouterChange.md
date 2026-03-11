| 原始路由 (Original Path) | 變更後路由 (New Path) | 中文名稱 / 功能 |
| :--- | :--- | :--- |
| **Auth 認證模組** | | |
| src/pages/auth/AuthLayout.vue | src/pages/AuthPage/AuthLayout.vue | 登入頁面_Layout |
| src/pages/auth/LoginPage.vue | src/pages/AuthPage/LoginPage.vue | 登入頁面 |
| **BasicInfo 基本資料** | | |
| src/pages/basic-data/VehicleManagementPage.vue | src/pages/BasicInfo/Car/DataList.vue | 車輛管理 |
| src/pages/basic-data/components/CustomerManagementBase.vue | src/pages/BasicInfo/Customer/BasePage.vue | 客戶/潛在客戶_基本頁面 |
| src/pages/basic-data/CustomerManagementPage.vue | src/pages/BasicInfo/Customer/DataList.vue | 客戶管理 |
| src/pages/basic-data/PotentialCustomerManagementPage.vue | src/pages/BasicInfo/Customer/LeadList.vue | 潛在客戶管理 |
| src/pages/basic-data/DriverManagementPage.vue | src/pages/BasicInfo/Driver/DataList.vue | 司機管理 |
| src/pages/basic-data/EmployeeManagementPage.vue | src/pages/BasicInfo/User/DataList.vue | 使用者管理 |
| src/pages/basic-data/VendorManagementPage.vue | src/pages/BasicInfo/Vendor/DataList.vue | 廠商管理 |
| **Dashboard** | | |
| src/pages/dashboard/DashboardPage.vue | src/pages/dashboard/DataList.vue | Dashboard |
| **Finance 帳務管理** | | |
| src/pages/billing/BillingManagementPage.vue | src/pages/Finance/DataList.vue | 帳務管理 |
| src/pages/billing/components/CreditMemosTab.vue | src/pages/Finance/components/CreditsTab.vue | 折讓單 |
| src/pages/billing/components/InvoicesTab.vue | src/pages/Finance/components/InvoicesTab.vue | 請款單 (原發票) |
| src/pages/billing/components/PaymentsTab.vue | src/pages/Finance/components/PaymentsTab.vue | 付款紀錄 |
| src/pages/billing/components/BillingReportsTab.vue | src/pages/Finance/components/ReportsTab.vue | 帳務報表 |
| **Orders 訂單管理** | | |
| src/pages/order-management/components/OrderManagementBase.vue | src/pages/Orders/DataList.vue | 訂單_基本頁面 |
| src/pages/order-management/EggOrdersPage.vue | src/pages/Orders/EggPage.vue | 雞蛋訂單 |
| src/pages/order-management/BottledWaterOrdersPage.vue | src/pages/Orders/WaterPage.vue | 飲水訂單 |
| src/pages/order-management/WaterDispenserOrdersPage.vue | src/pages/Orders/MachinePage.vue | 飲水機訂單 |
| **Products 商品管理** | | |
| src/pages/product-management/components/ProductManagementBase.vue | src/pages/Products/DataList.vue | 資料_基本頁面 |
| src/pages/product-management/EggManagementPage.vue | src/pages/Products/EggPage.vue | 雞蛋資料 |
| src/pages/product-management/BottledWaterOrdersPage.vue | src/pages/Products/WaterPage.vue | 飲水資料 |
| src/pages/product-management/WaterDispenserOrdersPage.vue | src/pages/Products/MachinePage.vue | 飲水機資料 |
| **Settings 參數設定** | | |
| src/pages/parameter-settings/PermissionSettingsPage.vue | src/pages/Settings/Permission.vue | 權限設定 |
| src/pages/parameter-settings/ProductTypeSettingsPage.vue | src/pages/Settings/ProductType.vue | 產品類型設定 |
| src/pages/parameter-settings/RoleSettingsPage.vue | src/pages/Settings/Roles.vue | 角色設定 |
| **Shipments 配送物流** | | |
| src/pages/inventory-reports | src/pages/Shipments | 司機送貨報表 |
