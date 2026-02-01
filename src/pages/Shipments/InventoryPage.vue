<!-- src/pages/Shipments/InventoryPage.vue 庫存管理 -->
<template>
  <!-- 手機版 -->
  <template v-if="displayMode === 'mobile'">
    <InventoryMobileView />
  </template>

  <!-- 桌面版 -->
  <Card v-else>
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         Tab 頁籤          -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <a-tabs class="flex-1" :active-key="activeKey" @tab-click="handleTabChange">
      <a-tab-pane :key="TAB_KEYS.OVERVIEW" :title="t('inventoryOverview', '庫存總覽')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.MOVEMENTS" :title="t('inventoryMovements', '異動記錄')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.ALERTS" :title="t('inventoryAlerts', '庫存警示')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.TRANSFER" :title="t('inventoryTransfer', '庫存調撥')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.REPORTS" :title="t('inventoryReports', '庫存報表')"></a-tab-pane>

      <template #extra>
        <div class="flex items-center gap-3">
          <!-- 庫存總覽 Tab 操作按鈕 -->
          <template v-if="isOverview">
            <a-button status="danger" plain @click="overviewTabRef?.clearFilter()">{{ t('clearAllSearch', '清除篩選') }}</a-button>
            <a-button v-if="permissionStore.hasPermission('INVENTORY', 'UPDATE')" type="primary" @click="openCycleCountDialog">{{ t('cycleCount', '盤點作業') }}</a-button>
          </template>

          <!-- 異動記錄 Tab 操作按鈕 -->
          <template v-if="isMovements">
            <a-button status="danger" plain @click="movementsTabRef?.clearFilter()">{{ t('clearAllSearch', '清除篩選') }}</a-button>
            <a-button v-if="permissionStore.hasPermission('INVENTORY', 'CREATE')" type="primary" @click="movementsTabRef?.openCreateDialog()">{{ t('addTransaction', '新增異動') }}</a-button>
          </template>

          <!-- 庫存警示 Tab 操作按鈕 -->
          <template v-if="isAlerts">
            <a-button v-if="permissionStore.hasPermission('INVENTORY', 'CREATE')" type="primary" @click="alertsTabRef?.openQuickStockIn()">{{ t('add', '新增') }}</a-button>
          </template>

          <!-- 庫存調撥 Tab 操作按鈕 -->
          <template v-if="isTransfer">
            <a-button status="danger" plain @click="transferTabRef?.clearFilter()">{{ t('clearAllSearch', '清除篩選') }}</a-button>
            <a-button v-if="permissionStore.hasPermission('INVENTORY', 'CREATE')" type="primary" @click="transferTabRef?.openTransferDialog()">{{ t('newTransfer', '新增調撥') }}</a-button>
          </template>

          <!-- 庫存報表 Tab 操作按鈕 -->
          <template v-if="isReports">
            <a-button status="danger" plain @click="reportsTabRef?.clearFilter()">{{ t('clearAllSearch', '清除篩選') }}</a-button>
          </template>
        </div>
      </template>
    </a-tabs>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         Tab 內容          -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-2">
      <InventoryOverviewTab v-if="isOverview" ref="overviewTabRef" />
      <InventoryMovementsTab v-else-if="isMovements" ref="movementsTabRef" />
      <InventoryAlertsTab v-else-if="isAlerts" ref="alertsTabRef" />
      <InventoryTransferTab v-else-if="isTransfer" ref="transferTabRef" />
      <InventoryReportsTab v-else-if="isReports" ref="reportsTabRef" />
    </CardContent>
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       盤點作業彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <CycleCountDialog v-model:visible="cycleCountDialogVisible" @success="handleCycleCountSuccess" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import InventoryOverviewTab from './components/InventoryOverviewTab.vue';
import InventoryMovementsTab from './components/InventoryMovementsTab.vue';
import InventoryAlertsTab from './components/InventoryAlertsTab.vue';
import InventoryTransferTab from './components/InventoryTransferTab.vue';
import InventoryReportsTab from './components/InventoryReportsTab.vue';
import CycleCountDialog from './components/CycleCountDialog.vue';
import InventoryMobileView from './InventoryMobileView.vue';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useDisplayMode } from '@/composables/useDisplayMode';

const { t } = useI18n();
const permissionStore = usePermissionStore();
const { displayMode } = useDisplayMode();

/** 常數相關 **/
const TAB_KEYS = {
  OVERVIEW: 'OVERVIEW', //庫存總覽
  MOVEMENTS: 'MOVEMENTS', //異動記錄
  ALERTS: 'ALERTS', //庫存警示
  TRANSFER: 'TRANSFER', //庫存調撥
  REPORTS: 'REPORTS', //庫存報表
};

/** Tab 頁籤相關 **/
const activeKey = ref(TAB_KEYS.OVERVIEW);
const isOverview = computed(() => activeKey.value === TAB_KEYS.OVERVIEW); //是否為庫存總覽
const isMovements = computed(() => activeKey.value === TAB_KEYS.MOVEMENTS); //是否為異動記錄
const isAlerts = computed(() => activeKey.value === TAB_KEYS.ALERTS); //是否為庫存警示
const isTransfer = computed(() => activeKey.value === TAB_KEYS.TRANSFER); //是否為庫存調撥
const isReports = computed(() => activeKey.value === TAB_KEYS.REPORTS); //是否為庫存報表
const handleTabChange = (key) => {
  activeKey.value = key;
}; //切換 Tab

/** Tab Refs **/
const overviewTabRef = ref(null);
const movementsTabRef = ref(null);
const alertsTabRef = ref(null);
const transferTabRef = ref(null);
const reportsTabRef = ref(null);

/** 盤點作業相關 **/
const cycleCountDialogVisible = ref(false);
const openCycleCountDialog = () => {
  cycleCountDialogVisible.value = true;
}; //開啟盤點作業對話框
const handleCycleCountSuccess = () => {
  overviewTabRef.value?.getAPI();
}; //盤點完成後重新載入庫存總覽
</script>
