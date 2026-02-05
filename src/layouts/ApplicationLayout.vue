<!-- src/layouts/ApplicationLayout.vue -->
<template>
  <IncomingCallNotification />
  <LoadingPage v-if="loading" />
  <tiny-config-provider>
    <a-config-provider :locale="zhTW">
      <a-layout class="layout-application">
        <!--側邊選單 - 電腦版-->
        <a-layout-sider v-if="!isMobile" hide-trigger collapsible :collapsed="collapsed">
          <AppSidebar :collapsed="collapsed" />
        </a-layout-sider>

        <!--側邊選單 - 手機版（浮動覆蓋）-->
        <Teleport to="body">
          <Transition name="sidebar-fade">
            <div v-if="isMobile && mobileMenuOpen" class="mobile-sidebar-backdrop" @click="closeMobileMenu" />
          </Transition>
          <Transition name="sidebar-slide">
            <div v-if="isMobile && mobileMenuOpen" class="mobile-sidebar">
              <AppSidebar :collapsed="false" @menu-click="closeMobileMenu" />
            </div>
          </Transition>
        </Teleport>

        <a-layout>
          <!--表頭-->
          <a-layout-header class="app-header">
            <TopBanner class="flex-1" @toggle-sidebar="onCollapse" :collapsed="collapsed" />
          </a-layout-header>
          <a-layout class="app-inner">
            <perfect-scrollbar class="h-[calc(100vh-90px)] pt-5">
              <!--麵包屑-->
              <!--<a-breadcrumb v-if="!isMobile" class="app-breadcrumb" separator="/">
                <a-breadcrumb-item v-for="(crumb, index) in breadcrumbItems" :key="`${crumb.label}-${index}`">
                  <RouterLink v-if="crumb.to" :to="crumb.to" class="breadcrumb-link" :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined">
                    {{ crumb.label }}
                  </RouterLink>
                  <span v-else class="breadcrumb-link">{{ crumb.label }}</span>
                </a-breadcrumb-item>
              </a-breadcrumb>-->

              <!--內容-->
              <a-layout-content class="app-content">
                <RouterView />
              </a-layout-content>

              <!--表尾-->
              <a-layout-footer v-if="!isMobile" class="app-footer">© 2025 CRM 後台管理系統</a-layout-footer>
            </perfect-scrollbar>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-config-provider>
  </tiny-config-provider>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { TinyConfigProvider } from '@opentiny/vue';
import zhTW from '@arco-design/web-vue/es/locale/lang/zh-tw';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import LoadingPage from '@/components/LoadingPage.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useSystemStore } from '@/stores/system';
import { storeToRefs } from 'pinia';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import IncomingCallNotification from '@/components/cti/IncomingCallNotification.vue';
import { useCtiSocket } from '@/composables/useCtiSocket';

const mainStore = useMainStore();
const systemStore = useSystemStore();
const { loading } = storeToRefs(mainStore); //Loading判斷
const route = useRoute();

/** 響應式判斷 **/
const isMobile = computed(() => systemStore.screenWidth < 768);

/** 側邊選單狀態 **/
const collapsed = ref(false); // 電腦版收合狀態
const mobileMenuOpen = ref(false); // 手機版選單開啟狀態

const onCollapse = () => {
  if (isMobile.value) {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  } else {
    collapsed.value = !collapsed.value;
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// 當切換到電腦版時，自動關閉手機版選單
watch(isMobile, (mobile) => {
  if (!mobile) {
    mobileMenuOpen.value = false;
  }
});

/** CTI WebSocket 來電通知 **/
const { connect: connectCti, disconnect: disconnectCti } = useCtiSocket();

/** 初始化 window resize 監聽 **/
let cleanupResize = null;
onMounted(() => {
  cleanupResize = systemStore.initializeWindowResize();
  connectCti();
});
onUnmounted(() => {
  if (cleanupResize) cleanupResize();
  disconnectCti();
});

const breadcrumbItems = computed(() => {
  const crumbs = route.matched
    .filter((record) => record.meta?.breadcrumb !== false && (record.meta?.breadcrumb || record.meta?.title))
    .map((record) => {
      const label = typeof record.meta?.breadcrumb === 'string' ? record.meta.breadcrumb : record.meta?.title || record.name || record.path;
      const to = record.name ? { name: record.name, params: route.params, query: route.query } : record.path ? { path: record.path, query: route.query } : null;
      return { label, to };
    });

  if (!crumbs.length && (route.meta?.title || route.name)) {
    crumbs.push({
      label: route.meta?.title || route.name || '當前頁面',
      to: route.name ? { name: route.name, params: route.params, query: route.query } : null,
    });
  }

  const hasDashboard = crumbs.some((crumb) => crumb.to?.name === 'dashboard');
  if (!hasDashboard) {
    crumbs.unshift({ label: '首頁', to: { name: 'dashboard' } });
  }

  return crumbs;
});
</script>

<style scoped>
.layout-application {
  height: 100vh;
  background: var(--color-fill-2);
}

.layout-application :deep(.arco-layout-sider) {
  background: var(--color-bg-2);
}

.layout-application :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 64px;
  background: var(--color-bg-3);
}

.app-inner {
  padding: 0 24px 24px;
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .app-inner {
    padding: 0;
  }

  .app-breadcrumb {
    margin: 12px 0;
  }
}

.app-breadcrumb {
  margin: 16px 0;
}

.breadcrumb-link {
  color: var(--color-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
}

.breadcrumb-link[aria-current='page'] {
  color: var(--color-text-2);
  cursor: default;
  pointer-events: none;
}

.app-content {
  min-height: calc(100vh - 160px);
  background: var(--color-bg-3);
  border-radius: 8px;
  overflow: auto;
}

.app-footer {
  margin-top: 16px;
  text-align: center;
  color: var(--color-text-2);
  background: transparent;
}

/* 手機版側邊選單樣式 */
.mobile-sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  background: var(--color-bg-2);
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

/* 背景遮罩動畫 */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

/* 側邊欄滑入動畫 */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
