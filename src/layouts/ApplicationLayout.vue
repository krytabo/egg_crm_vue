<!-- src/layouts/ApplicationLayout.vue -->
<template>
  <LoadingPage v-if="loading" />
  <tiny-config-provider>
    <a-config-provider :locale="zhTW">
      <a-layout class="layout-application">
        <!--側邊選單-->
        <a-layout-sider hide-trigger collapsible :collapsed="collapsed">
          <AppSidebar :collapsed="collapsed" />
        </a-layout-sider>

        <a-layout>
          <!--表頭-->
          <a-layout-header class="app-header">
            <TopBanner class="flex-1" @toggle-sidebar="onCollapse" :collapsed="collapsed" />
          </a-layout-header>
          <a-layout class="app-inner">
            <!--麵包屑-->
            <a-breadcrumb class="app-breadcrumb" separator="/">
              <a-breadcrumb-item v-for="(crumb, index) in breadcrumbItems" :key="`${crumb.label}-${index}`">
                <RouterLink v-if="crumb.to" :to="crumb.to" class="breadcrumb-link" :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined">
                  {{ crumb.label }}
                </RouterLink>
                <span v-else class="breadcrumb-link">{{ crumb.label }}</span>
              </a-breadcrumb-item>
            </a-breadcrumb>

            <!--內容-->
            <a-layout-content class="app-content">
              <RouterView />
            </a-layout-content>

            <!--表尾-->
            <a-layout-footer class="app-footer">© 2025 CRM 後台管理系統</a-layout-footer>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-config-provider>
  </tiny-config-provider>
</template>

<script setup>
import { computed, ref } from "vue";
import { TinyConfigProvider } from "@opentiny/vue";
import zhTW from "@arco-design/web-vue/es/locale/lang/zh-tw";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import LoadingPage from "@/components/LoadingPage.vue";
import { useMainStore } from "@/stores/LoadingStore";
import { storeToRefs } from "pinia";
import { RouterLink, RouterView, useRoute } from "vue-router";

const mainStore = useMainStore();
const { loading } = storeToRefs(mainStore); //Loading判斷
const route = useRoute();

const collapsed = ref(false);
const onCollapse = () => {
  collapsed.value = !collapsed.value;
};

const breadcrumbItems = computed(() => {
  const crumbs = route.matched
    .filter((record) => record.meta?.breadcrumb !== false && (record.meta?.breadcrumb || record.meta?.title))
    .map((record) => {
      const label = typeof record.meta?.breadcrumb === "string" ? record.meta.breadcrumb : record.meta?.title || record.name || record.path;
      const to = record.name ? { name: record.name, params: route.params, query: route.query } : record.path ? { path: record.path, query: route.query } : null;
      return { label, to };
    });

  if (!crumbs.length && (route.meta?.title || route.name)) {
    crumbs.push({
      label: route.meta?.title || route.name || "當前頁面",
      to: route.name ? { name: route.name, params: route.params, query: route.query } : null
    });
  }

  const hasDashboard = crumbs.some((crumb) => crumb.to?.name === "dashboard");
  if (!hasDashboard) {
    crumbs.unshift({ label: "首頁", to: { name: "dashboard" } });
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

.breadcrumb-link[aria-current="page"] {
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
</style>
