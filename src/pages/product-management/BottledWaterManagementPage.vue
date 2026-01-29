<!-- src/pages/product-management/BottledWaterManagementPage.vue 桶裝水商品管理 -->
<template>
  <ProductManagementBase
    category-id="e106af10-17d4-4f4d-9ccf-8dfd5fbfe0b6"
    category-label="桶裝水"
    default-unit="桶"
    :default-perishable="true"
    fake-data-type="bottledWater"
  />
</template>

<script setup>
import ProductManagementBase from './components/ProductManagementBase.vue';
</script>
