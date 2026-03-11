// src/router/modules/mobile.js
// 手機版路由模組 - 在原有路由前加上 /m 即可切換手機版
// 例如：/ApplicationList/xxx → /m/ApplicationList/xxx

import MobileLayout from '@/layouts/MobileLayout.vue';

// 手機版路由子項目
// 預設使用桌面版元件，之後可逐步替換為專屬手機版元件
const mobileChildren = [
  // ===== Dashboard =====
  {
    path: '',
    redirect: { name: 'm-dashboard' },
  },
  {
    path: 'dashboard',
    name: 'm-dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'dashboard', title: '首頁', showTabbar: true },
  },

  // ===== BasicInfo 基本資料 =====
  {
    path: 'basic-info/users',
    name: 'm-basic-info-users',
    component: () => import('@/pages/BasicInfo/User/DataList/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-users', title: '員工資料' },
  },
  {
    path: 'basic-info/customers',
    name: 'm-basic-info-customers',
    component: () => import('@/pages/BasicInfo/Customer/DataList.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-customers', title: '客戶資料', language: 'Customer' },
  },
  {
    path: 'basic-info/leads',
    name: 'm-basic-info-leads',
    component: () => import('@/pages/BasicInfo/Customer/LeadList.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-leads', title: '潛在客戶', language: 'Customer' },
  },
  {
    path: 'basic-info/vendors',
    name: 'm-basic-info-vendors',
    component: () => import('@/pages/BasicInfo/Vendor/DataList/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-vendors', title: '廠商資料' },
  },
  {
    path: 'basic-info/vehicles',
    name: 'm-basic-info-vehicles',
    component: () => import('@/pages/BasicInfo/Car/DataList/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-vehicles', title: '車輛資料' },
  },
  {
    path: 'basic-info/drivers',
    name: 'm-basic-info-drivers',
    component: () => import('@/pages/BasicInfo/Driver/DataList/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'basic-info-drivers', title: '司機資料' },
  },

  // ===== Settings 參數設定 =====
  {
    path: 'settings/product-types',
    name: 'm-settings-product-types',
    component: () => import('@/pages/Settings/ProductType.vue'),
    meta: { requiresAuth: true, sidebarId: 'settings-product-types', title: '產品類型' },
  },
  {
    path: 'settings/roles',
    name: 'm-settings-roles',
    component: () => import('@/pages/Settings/Roles.vue'),
    meta: { requiresAuth: true, sidebarId: 'settings-roles', title: '角色設定' },
  },
  {
    path: 'settings/permissions',
    name: 'm-settings-permissions',
    component: () => import('@/pages/Settings/Permission.vue'),
    meta: { requiresAuth: true, sidebarId: 'settings-permissions', title: '權限設定' },
  },

  // ===== Products 商品管理 =====
  {
    path: 'products/water',
    name: 'm-products-water',
    component: () => import('@/pages/Products/WaterPage.vue'),
    meta: { requiresAuth: true, sidebarId: 'products-water', title: '飲水資料' },
  },
  {
    path: 'products/eggs',
    name: 'm-products-eggs',
    component: () => import('@/pages/Products/EggPage.vue'),
    meta: { requiresAuth: true, sidebarId: 'products-eggs', title: '雞蛋資料' },
  },
  {
    path: 'products/dispensers',
    name: 'm-products-dispensers',
    component: () => import('@/pages/Products/MachinePage.vue'),
    meta: { requiresAuth: true, sidebarId: 'products-dispensers', title: '飲水機資料' },
  },

  // ===== Orders 訂單管理 =====
  {
    path: 'orders/water',
    name: 'm-orders-water',
    component: () => import('@/pages/Orders/WaterPage.vue'),
    meta: { requiresAuth: true, sidebarId: 'orders-water', title: '飲水訂單', language: 'Customer' },
  },
  {
    path: 'orders/eggs',
    name: 'm-orders-eggs',
    component: () => import('@/pages/Orders/EggPage.vue'),
    meta: { requiresAuth: true, sidebarId: 'orders-eggs', title: '雞蛋訂單' },
  },
  {
    path: 'orders/dispensers',
    name: 'm-orders-dispensers',
    component: () => import('@/pages/Orders/MachinePage.vue'),
    meta: { requiresAuth: true, sidebarId: 'orders-dispensers', title: '飲水機訂單' },
  },

  // ===== Shipments 配送物流 =====
  {
    path: 'shipments/inventory',
    name: 'm-shipments-inventory',
    component: () => import('@/pages/Shipments/InventoryPage.vue'),
    meta: { requiresAuth: true, sidebarId: 'shipments-inventory', title: '商品庫存' },
  },
  {
    path: 'shipments/reports',
    name: 'm-shipments-reports',
    component: () => import('@/pages/Shipments/DataList/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'shipments-reports', title: '送貨報表' },
  },
  {
    path: 'shipments/reports/edit/:uuid?',
    name: 'm-shipments-report-edit',
    component: () => import('@/pages/Shipments/FormPage/index.vue'),
    props: (route) => ({ uuid: route.params.uuid || '' }),
    meta: { requiresAuth: true, sidebarId: 'shipments-reports', title: '報表編輯' },
  },

  // ===== Finance 帳務管理 =====
  {
    path: 'finance/billing',
    name: 'm-finance-billing',
    component: () => import('@/pages/Finance/index.vue'),
    meta: { requiresAuth: true, sidebarId: 'finance-billing', title: '帳務管理' },
  },
];

const MobileRoutes = {
  path: '/m/ApplicationList',
  component: MobileLayout,
  meta: {
    requiresAuth: true,
    language: 'Public',
  },
  children: mobileChildren,
};

export default MobileRoutes;
