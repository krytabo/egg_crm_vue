<!-- src/pages/Orders/MachinePage.vue 飲水機訂單 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <MobileView :pageTitle="t('waterDispenserOrders', '飲水機訂單')" :categoryId="CATEGORY_IDS.DISPENSER" :categoryCode="CATEGORY_CODES.DISPENSER" />
  </template>
  <template v-else>
    <DataList pageTitle="waterDispenserOrders" :categoryId="CATEGORY_IDS.DISPENSER" :categoryCode="CATEGORY_CODES.DISPENSER" />
  </template>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useDisplayMode } from '@/composables/useDisplayMode';
import DataList from '@/pages/Orders/DataList.vue';
import MobileView from '@/pages/Orders/MobileView.vue';
import { CATEGORY_IDS, CATEGORY_CODES } from '@/constants/categories';

const { t } = useI18n();
const { displayMode } = useDisplayMode();
</script>
