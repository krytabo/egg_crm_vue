<!-- src/pages/order-management/WaterDispenserOrdersPage.vue 飲水機 -->
<template>
  <DataList pageTitle="waterDispenserOrders" :categoryId="categoryId" categoryCode="DISPENSER" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
const categoryId = 'b2eb8750-10d5-4f90-803f-71ed3ae264da';
</script>
