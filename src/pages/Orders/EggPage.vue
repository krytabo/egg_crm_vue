<!-- src/pages/order-management/EggOrdersPage.vue 雞蛋 -->
<template>
  <DataList pageTitle="eggOrders" :categoryId="categoryId" categoryCode="EGG" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
const categoryId = '959ff8c8-8bc7-4164-91b1-f2491142075b';
</script>
