<!-- src/pages/order-management/WaterDispenserOrdersPage.vue 飲水機 -->
<template>
  <DataList pageTitle="waterDispenserOrders" :categoryId="CATEGORY_IDS.DISPENSER" :categoryCode="CATEGORY_CODES.DISPENSER" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
import { CATEGORY_IDS, CATEGORY_CODES } from '@/constants/categories';
</script>
