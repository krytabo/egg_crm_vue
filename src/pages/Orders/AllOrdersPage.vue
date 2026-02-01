<!-- src/pages/Orders/AllOrdersPage.vue 所有訂單 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <MobileView :pageTitle="t('allOrders', '所有訂單')" />
  </template>
  <template v-else>
    <DataList pageTitle="allOrders" />
  </template>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useDisplayMode } from '@/composables/useDisplayMode';
import DataList from '@/pages/Orders/DataList.vue';
import MobileView from '@/pages/Orders/MobileView.vue';

const { t } = useI18n();
const { displayMode } = useDisplayMode();
</script>
