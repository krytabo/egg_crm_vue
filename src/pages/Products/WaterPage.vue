<!-- src/pages/product-management/BottledWaterManagementPage.vue 飲水商品管理 -->
<template>
  <BaseList :category-id="CATEGORY_IDS.WATER" category-label="飲水" default-unit="桶" :default-perishable="true" fake-data-type="bottledWater" />
</template>

<script setup>
import BaseList from './BaseList.vue';
import { CATEGORY_IDS } from '@/constants/categories';
</script>
