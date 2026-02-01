<!-- src/pages/order-management/EggOrdersPage.vue 雞蛋 -->
<template>
  <DataList pageTitle="eggOrders" :categoryId="CATEGORY_IDS.EGG" :categoryCode="CATEGORY_CODES.EGG" />
</template>

<script setup>
import DataList from '@/pages/Orders/DataList.vue';
import { CATEGORY_IDS, CATEGORY_CODES } from '@/constants/categories';
</script>
