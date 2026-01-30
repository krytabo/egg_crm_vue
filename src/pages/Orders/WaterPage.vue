<!-- src/pages/order-management/BottledWaterOrdersPage.vue 桶裝水 -->
<template>
  <DataList pageTitle="bottledWaterOrders" :categoryId="categoryId" categoryCode="WATER" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
const categoryId = 'e106af10-17d4-4f4d-9ccf-8dfd5fbfe0b6';
</script>
