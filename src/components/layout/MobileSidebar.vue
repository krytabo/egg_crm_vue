<!-- src/components/layout/MobileSidebar.vue 手機版側邊選單 -->
<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title>CRM 管理系統</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <a-menu :selected-keys="[String(activeSidebarId)]" :default-open-keys="defaultOpenKeys" @menu-item-click="handleMenuClick" class="mobile-sidebar-menu">
        <template v-for="section in filteredMenuSections" :key="section.key">
          <!-- 單一項目（不需要子選單） -->
          <a-menu-item v-if="section.items.length === 1" :key="section.items[0].id">
            <component v-if="section.items[0].heroIcon" :is="section.items[0].heroIcon" class="menu-icon" />
            <i v-else-if="section.items[0].remixIcon" :class="[section.items[0].remixIcon, 'menu-icon remix']"></i>
            {{ section.items[0].label }}
          </a-menu-item>

          <!-- 多項目（需要子選單） -->
          <a-sub-menu v-else :key="section.key">
            <template #title>
              <component v-if="section.heroIcon" :is="section.heroIcon" class="menu-icon" />
              <i v-else-if="section.remixIcon" :class="[section.remixIcon, 'menu-icon remix']"></i>
              <span>{{ section.label }}</span>
            </template>
            <a-menu-item v-for="item in section.items" :key="item.id">
              <component v-if="item.heroIcon" :is="item.heroIcon" class="menu-icon size-4" />
              <i v-else-if="item.remixIcon" :class="[item.remixIcon, 'menu-icon remix']"></i>
              <span>{{ item.label }}</span>
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </ion-content>
  </ion-menu>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, menuController } from '@ionic/vue';
import { BarChart3, Waves, Droplet, Egg, Factory, Package2, ShoppingCart, Truck, Users } from 'lucide-vue-next';
import { usePermissionStore } from '@/stores/PermissionStore';

const makeLucideIcon = (IconComp) => markRaw(IconComp);
const LucideDropletIcon = makeLucideIcon(Droplet);
const LucideEggIcon = makeLucideIcon(Egg);
const LucideWavesIcon = makeLucideIcon(Waves);
const LucidePackageIcon = makeLucideIcon(Package2);

const menuSections = [
  {
    key: 'section-dashboard',
    label: '儀表板',
    items: [{ id: 'dashboard', label: '儀表板', remixIcon: 'ri-dashboard-line', role: 'KPI' }],
  },
  {
    key: 'section-basic',
    label: '基本資料',
    remixIcon: 'ri-database-2-line',
    hiddenOnMobile: true, //手機版隱藏
    items: [
      { id: 'basic-info-users', label: '員工資料', remixIcon: 'ri-user-3-line', role: 'USER' },
      { id: 'basic-info-customers', label: '客戶資料', remixIcon: 'ri-team-line', role: 'CUSTOMER' },
      { id: 'basic-info-leads', label: '潛在客戶', remixIcon: 'ri-user-search-line', role: 'CUSTOMER' },
      { id: 'basic-info-vendors', label: '廠商資料', remixIcon: 'ri-building-line', role: 'VENDOR' },
      { id: 'basic-info-vehicles', label: '車輛資料', remixIcon: 'ri-truck-line', role: 'VEHICLE' },
      { id: 'basic-info-drivers', label: '司機資料', remixIcon: 'ri-steering-2-line', role: 'DRIVER' },
    ],
  },
  {
    key: 'section-product',
    label: '商品管理',
    remixIcon: 'ri-box-1-line',
    hiddenOnMobile: true, //手機版隱藏
    items: [
      { id: 'products-water', label: '飲水資料', heroIcon: LucideDropletIcon, role: 'PRODUCT' },
      { id: 'products-eggs', label: '雞蛋資料', heroIcon: LucideEggIcon, role: 'PRODUCT' },
      { id: 'products-dispensers', label: '飲水機資料', heroIcon: LucideWavesIcon, role: 'PRODUCT' },
    ],
  },
  {
    key: 'section-orders',
    label: '訂單管理',
    remixIcon: 'ri-shopping-bag-3-line',
    hiddenOnMobile: true, //手機版隱藏
    items: [
      { id: 'orders-water', label: '飲水訂單', remixIcon: 'ri-shopping-basket-line', role: 'ORDER' },
      { id: 'orders-eggs', label: '雞蛋訂單', remixIcon: 'ri-shopping-cart-line', role: 'ORDER' },
      { id: 'orders-dispensers', label: '飲水機訂單', remixIcon: 'ri-file-list-3-line', role: 'ORDER' },
    ],
  },
  {
    key: 'section-shipments',
    label: '庫存與報表',
    remixIcon: 'ri-file-chart-line',
    items: [
      { id: 'shipments-inventory', label: '商品庫存', heroIcon: LucidePackageIcon, role: 'INVENTORY', hiddenOnMobile: true },
      { id: 'shipments-reports', label: '送貨報表', remixIcon: 'ri-survey-line', role: 'REPORT' },
    ],
  },
  {
    key: 'section-finance',
    label: '帳務管理',
    remixIcon: 'ri-money-dollar-circle-line',
    hiddenOnMobile: true, //手機版隱藏
    items: [{ id: 'finance-billing', label: '帳務管理', remixIcon: 'ri-money-dollar-circle-line', role: 'BILLING' }],
  },
];

const router = useRouter();
const route = useRoute();
const permissionStore = usePermissionStore();

const filteredMenuSections = computed(() => {
  return menuSections
    .filter((section) => !section.hiddenOnMobile) // 過濾掉手機版隱藏的區塊
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (!item.role) return true;
        return permissionStore.hasResourceAccess(item.role);
      });
      if (filteredItems.length === 0) return null;
      return { ...section, items: filteredItems };
    })
    .filter(Boolean);
});

const activeSidebarId = computed(() => route.meta?.sidebarId || route.name?.replace('m-', '') || 'dashboard');

// 只展開當前頁面所屬的父級選單
const defaultOpenKeys = computed(() => {
  const currentSection = filteredMenuSections.value.find((section) => section.items.some((item) => item.id === activeSidebarId.value));
  return currentSection && currentSection.items.length > 1 ? [currentSection.key] : [];
});

const handleMenuClick = async (key) => {
  if (!key || key === activeSidebarId.value) return;
  const mobileName = `m-${key}`;
  router.push({ name: mobileName });
  await menuController.close();
};
</script>

<style scoped>
.mobile-sidebar-menu {
  width: 100%;
  border-right: none;
}

.menu-icon {
  margin-right: 8px;
  color: var(--color-text-2);
}

.menu-icon.remix {
  font-size: 16px;
}

:deep(.arco-menu-item-selected .menu-icon),
:deep(.arco-menu-item-active .menu-icon),
:deep(.arco-menu-selected .menu-icon),
:deep(.arco-menu-inline-header.arco-menu-selected .menu-icon) {
  color: var(--color-primary) !important;
}

:deep(.arco-menu-item-inner) {
  align-items: center !important;
}

svg {
  display: inline !important;
}
</style>
