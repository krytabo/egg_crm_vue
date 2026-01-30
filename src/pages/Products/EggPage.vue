<!-- src/pages/product-management/EggManagementPage.vue 雞蛋商品管理 -->
<template>
  <BaseList :category-id="category" category-label="雞蛋" default-unit="盒" :default-perishable="true" fake-data-type="eggs" />
</template>

<script setup>
import BaseList from './BaseList.vue';
const category = '959ff8c8-8bc7-4164-91b1-f2491142075b';
</script>
