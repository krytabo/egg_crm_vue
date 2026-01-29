<!-- src/components/layout/AppSidebar.vue 側邊選單 -->
<script setup>
import { computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BarChart3, Waves, Droplet, Egg, Factory, Package2, ShoppingCart, Truck, Users } from 'lucide-vue-next';

const props = defineProps({
  collapsed: { type: Boolean, default: false },
});
const emit = defineEmits(['menu-click']);
const makeLucideIcon = (IconComp) => markRaw(IconComp);
const LucideUsersIcon = makeLucideIcon(Users);
const LucideFactoryIcon = makeLucideIcon(Factory);
const LucideDropletIcon = makeLucideIcon(Droplet);
const LucideEggIcon = makeLucideIcon(Egg);
const LucideWavesIcon = makeLucideIcon(Waves);
const LucideShoppingCartIcon = makeLucideIcon(ShoppingCart);
const LucideTruckIcon = makeLucideIcon(Truck);
const LucidePackageIcon = makeLucideIcon(Package2);
const LucideReportIcon = makeLucideIcon(BarChart3);

const menuSections = [
  {
    key: 'section-dashboard',
    label: '儀表板',
    items: [{ id: 'dashboard', label: '儀表板', remixIcon: 'ri-dashboard-line' }],
  },
  {
    key: 'section-basic',
    label: '基本資料',
    remixIcon: 'ri-database-2-line',
    items: [
      { id: 'employees', label: '員工資料', remixIcon: 'ri-user-3-line' },
      { id: 'customers', label: '客戶資料', remixIcon: 'ri-team-line' },
      { id: 'potential-customers', label: '潛在客戶', remixIcon: 'ri-user-search-line' },
      { id: 'vendors', label: '廠商資料', remixIcon: 'ri-building-line' },
      { id: 'vehicles', label: '車輛資料', remixIcon: 'ri-truck-line' },
      { id: 'drivers', label: '司機資料', remixIcon: 'ri-steering-2-line' },
    ],
  },
  {
    key: 'section-product',
    label: '商品管理',
    remixIcon: 'ri-box-1-line',
    items: [
      { id: 'bottled-water', label: '桶裝水資料', heroIcon: LucideDropletIcon },
      { id: 'eggs', label: '雞蛋資料', heroIcon: LucideEggIcon },
      { id: 'water-dispensers', label: '飲水機資料', heroIcon: LucideWavesIcon },
    ],
  },
  {
    key: 'section-orders',
    label: '訂單管理',
    remixIcon: 'ri-shopping-bag-3-line',
    items: [
      { id: 'bottled-water-orders', label: '桶裝水訂單', remixIcon: 'ri-shopping-basket-line' },
      { id: 'egg-orders', label: '雞蛋訂單', remixIcon: 'ri-shopping-cart-line' },
      { id: 'water-dispenser-orders', label: '飲水機訂單', remixIcon: 'ri-file-list-3-line' },
    ],
  },
  {
    key: 'section-report',
    label: '庫存與報表',
    remixIcon: 'ri-file-chart-line',
    items: [
      { id: 'inventory', label: '商品庫存', heroIcon: LucidePackageIcon },
      { id: 'delivery-report-new', label: '送貨報表', remixIcon: 'ri-survey-line' },
    ],
  },
  {
    key: 'section-billing',
    label: '帳務管理',
    remixIcon: 'ri-money-dollar-circle-line',
    items: [{ id: 'billing', label: '帳務管理', remixIcon: 'ri-money-dollar-circle-line' }],
  },
  {
    key: 'section-parameters',
    label: '參數設定',
    remixIcon: 'ri-settings-3-line',
    items: [
      { id: 'product-types', label: '產品類型', remixIcon: 'ri-sound-module-line' },
      { id: 'roles', label: '角色設定', remixIcon: 'ri-shield-user-line' },
      { id: 'permissions', label: '權限設定', remixIcon: 'ri-key-2-line' },
    ],
  },
];

const router = useRouter();
const route = useRoute();
const activeSidebarId = computed(() => route.meta?.sidebarId || route.name || 'dashboard');
const defaultOpenKeys = menuSections.filter((section) => section.items.length > 1).map((section) => section.key);

const handleMenuItemClick = (key) => {
  if (!key || key === activeSidebarId.value) return;
  router.push({ name: key });
  emit('menu-click', key); // 通知父層選單已點擊（用於關閉手機版選單）
};
</script>

<template>
  <div class="sidebar-container">
    <div class="logo" v-if="!collapsed">CRM 管理系統</div>
    <div class="logo h-[32px] bg-gray-500" v-if="collapsed" />
    <a-menu :collapsed="collapsed" :selected-keys="[String(activeSidebarId)]" :default-open-keys="defaultOpenKeys" @menu-item-click="handleMenuItemClick">
      <template v-for="section in menuSections" :key="section.key">
        <a-menu-item v-if="section.items.length === 1" :key="section.items[0].id">
          <component v-if="section.items[0].heroIcon" :is="section.items[0].heroIcon" class="menu-icon h-[10px] w-[10px] text-[12px]!" />
          <i v-else-if="section.items[0].remixIcon" :class="[section.items[0].remixIcon, 'menu-icon remix']"></i>
          {{ section.items[0].label }}
        </a-menu-item>
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
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-2);
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-primary-text);
  border-bottom: 1px solid var(--color-border);
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
