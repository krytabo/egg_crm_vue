<!-- src/pages/product-management/EggManagementPage.vue 雞蛋商品管理 -->
<template>
  <BaseList :category-id="CATEGORY_IDS.EGG" category-label="雞蛋" default-unit="盒" :default-perishable="true" fake-data-type="eggs" />
</template>

<script setup>
import BaseList from './BaseList.vue';
import { CATEGORY_IDS } from '@/constants/categories';
</script>
