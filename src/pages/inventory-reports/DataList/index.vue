<!-- src/pages/inventory-reports/DataList/index.vue -->
<template>
  <DesktopView v-if="displayMode === 'desktop'" />
  <MobileViewIonic v-else />
</template>

<script setup>
import { useDisplayMode } from '@/composables/useDisplayMode';
import DesktopView from './DesktopView.vue';
import MobileViewIonic from './MobileViewIonic.vue';

const { displayMode } = useDisplayMode();
</script>
