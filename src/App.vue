<script setup>
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { initCategoryIds } from '@/constants/categories';

onMounted(() => {
  initCategoryIds();
});
</script>

<template>
  <RouterView />
</template>
