<!-- src/pages/Orders/WaterPage.vue 桶裝水訂單 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <MobileView :pageTitle="t('bottledWaterOrders', '桶裝水訂單')" :categoryId="CATEGORY_IDS.WATER" :categoryCode="CATEGORY_CODES.WATER" />
  </template>
  <template v-else>
    <DataList pageTitle="bottledWaterOrders" :categoryId="CATEGORY_IDS.WATER" :categoryCode="CATEGORY_CODES.WATER" />
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
