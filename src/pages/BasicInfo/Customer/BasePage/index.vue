<!-- src/pages/BasicInfo/Customer/BasePage/index.vue -->
<template>
  <DesktopView v-if="displayMode === 'desktop'" :pageType="pageType" />
  <MobileView v-else :pageType="pageType" />
</template>

<script setup>
import { useDisplayMode } from '@/composables/useDisplayMode';
import DesktopView from './DesktopView.vue';
import MobileView from './MobileView.vue';

defineProps({
  pageType: { type: String, default: 'customer', validator: (v) => ['customer', 'prospect'].includes(v) },
});

const { displayMode } = useDisplayMode();
</script>
