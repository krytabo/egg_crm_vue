// src/router/modules/mobile.js
// 手機版路由模組 - 在原有路由前加上 /m 即可切換手機版
// 例如：/ApplicationList/xxx → /m/ApplicationList/xxx

import MobileLayout from '@/layouts/MobileLayout.vue';

const MobileRoutes = {
  path: '/m/ApplicationList',
  component: MobileLayout,
  meta: {
    requiresAuth: true,
    language: 'Public',
  },
  children: [
    // 首頁
    {
      path: '',
      name: 'm-dashboard',
      component: () => import('@/pages/dashboard/DashboardPage.vue'),
      meta: {
        title: '首頁',
        showTabbar: true,
      },
    },
    // 送貨報表列表
    {
      path: 'delivery-report-new',
      name: 'm-delivery-report-new',
      component: () => import('@/pages/inventory-reports/DataList/index.vue'),
      meta: {
        title: '送貨報表',
      },
    },
    // 送貨報表編輯
    {
      path: 'delivery-report/edit2/:uuid?',
      name: 'm-delivery-report-edit2',
      component: () => import('@/pages/inventory-reports/FormPage/index.vue'),
      props: (route) => ({ uuid: route.params.uuid || '' }),
      meta: {
        title: '報表編輯',
      },
    },
    // 可依需求擴充更多手機版路由...
  ],
};

export default MobileRoutes;
