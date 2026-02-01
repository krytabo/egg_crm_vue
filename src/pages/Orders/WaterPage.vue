<!-- src/pages/order-management/BottledWaterOrdersPage.vue 桶裝水 -->
<template>
  <DataList pageTitle="bottledWaterOrders" :categoryId="CATEGORY_IDS.WATER" :categoryCode="CATEGORY_CODES.WATER" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
import { CATEGORY_IDS, CATEGORY_CODES } from '@/constants/categories';
</script>
