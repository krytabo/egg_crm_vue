<!-- src/pages/product-management/EggManagementPage.vue 雞蛋商品管理 -->
<template>
  <ProductManagementBase :category-id="1" category-label="雞蛋" default-unit="盒" :default-perishable="true" fake-data-type="eggs" />
</template>

<script setup>
import ProductManagementBase from "./components/ProductManagementBase.vue";
</script>
