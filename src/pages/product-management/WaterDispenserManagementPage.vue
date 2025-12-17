<!-- src/pages/product-management/WaterDispenserManagementPage.vue 飲水機商品管理 -->
<template>
  <ProductManagementBase :category-id="4" category-label="飲水機" default-unit="台" :default-perishable="false" fake-data-type="waterDispenser" />
</template>

<script setup>
import ProductManagementBase from "./components/ProductManagementBase.vue";
</script>
