<!-- src/pages/Orders/EggPage.vue 雞蛋訂單 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <MobileView :pageTitle="t('eggOrders', '雞蛋訂單')" :categoryId="CATEGORY_IDS.EGG" :categoryCode="CATEGORY_CODES.EGG" />
  </template>
  <template v-else>
    <DataList pageTitle="eggOrders" :categoryId="CATEGORY_IDS.EGG" :categoryCode="CATEGORY_CODES.EGG" />
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
