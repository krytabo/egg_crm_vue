<!-- src/components/layout/MobileSidebar.vue 手機版側邊選單 -->
<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title>CRM 管理系統</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <template v-for="section in filteredMenuSections" :key="section.key">
          <!-- 單一項目（不需要子選單） -->
          <ion-item v-if="section.items.length === 1" button :detail="false" @click="handleMenuClick(section.items[0].id)" :class="{ 'item-active': activeSidebarId === section.items[0].id }">
            <component v-if="section.items[0].heroIcon" :is="section.items[0].heroIcon" slot="start" class="menu-icon" />
            <i v-else-if="section.items[0].remixIcon" :class="[section.items[0].remixIcon, 'menu-icon']" slot="start"></i>
            <ion-label>{{ section.items[0].label }}</ion-label>
          </ion-item>

          <!-- 多項目（需要子選單） -->
          <ion-accordion-group v-else :value="expandedSections.includes(section.key) ? section.key : undefined">
            <ion-accordion :value="section.key">
              <ion-item slot="header">
                <component v-if="section.heroIcon" :is="section.heroIcon" slot="start" class="menu-icon" />
                <i v-else-if="section.remixIcon" :class="[section.remixIcon, 'menu-icon']" slot="start"></i>
                <ion-label>{{ section.label }}</ion-label>
              </ion-item>
              <ion-list slot="content">
                <ion-item v-for="item in section.items" :key="item.id" button :detail="false" @click="handleMenuClick(item.id)" :class="{ 'item-active': activeSidebarId === item.id }" class="submenu-item">
                  <component v-if="item.heroIcon" :is="item.heroIcon" slot="start" class="menu-icon submenu-icon" />
                  <i v-else-if="item.remixIcon" :class="[item.remixIcon, 'menu-icon submenu-icon']" slot="start"></i>
                  <ion-label>{{ item.label }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-accordion>
          </ion-accordion-group>
        </template>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup, menuController } from '@ionic/vue';
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
    hiddenOnMobile: true, // 手機版隱藏
    items: [
      { id: 'products-water', label: '桶裝水資料', heroIcon: LucideDropletIcon, role: 'PRODUCT' },
      { id: 'products-eggs', label: '雞蛋資料', heroIcon: LucideEggIcon, role: 'PRODUCT' },
      { id: 'products-dispensers', label: '飲水機資料', heroIcon: LucideWavesIcon, role: 'PRODUCT' },
    ],
  },
  {
    key: 'section-orders',
    label: '訂單管理',
    remixIcon: 'ri-shopping-bag-3-line',
    items: [
      { id: 'orders-water', label: '桶裝水訂單', remixIcon: 'ri-shopping-basket-line', role: 'ORDER' },
      { id: 'orders-eggs', label: '雞蛋訂單', remixIcon: 'ri-shopping-cart-line', role: 'ORDER' },
      { id: 'orders-dispensers', label: '飲水機訂單', remixIcon: 'ri-file-list-3-line', role: 'ORDER' },
    ],
  },
  {
    key: 'section-shipments',
    label: '庫存與報表',
    remixIcon: 'ri-file-chart-line',
    items: [
      { id: 'shipments-inventory', label: '商品庫存', heroIcon: LucidePackageIcon, role: 'INVENTORY' },
      { id: 'shipments-reports', label: '送貨報表', remixIcon: 'ri-survey-line', role: 'REPORT' },
    ],
  },
  {
    key: 'section-finance',
    label: '帳務管理',
    remixIcon: 'ri-money-dollar-circle-line',
    hiddenOnMobile: true, // 手機版隱藏
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

const expandedSections = computed(() => {
  const currentSection = filteredMenuSections.value.find((section) => section.items.some((item) => item.id === activeSidebarId.value));
  return currentSection ? [currentSection.key] : [];
});

const handleMenuClick = async (id) => {
  const mobileName = `m-${id}`;
  router.push({ name: mobileName });
  await menuController.close();
};
</script>

<style scoped>
.menu-icon {
  font-size: 20px;
  margin-right: 12px;
  color: var(--ion-color-medium);
}

.submenu-item {
  --padding-start: 32px;
}

.submenu-icon {
  font-size: 16px;
}

.item-active {
  --background: var(--ion-color-primary-tint);
  --color: var(--ion-color-primary);
}

.item-active .menu-icon {
  color: var(--ion-color-primary);
}

ion-accordion-group {
  margin: 0;
}

ion-accordion ion-item[slot='header'] {
  --padding-start: 16px;
}

ion-accordion ion-list[slot='content'] {
  padding: 0;
}
</style>
