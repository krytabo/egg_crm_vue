<!-- src/pages/inventory-reports/FormPage/index.vue -->
<template>
  <DesktopView v-if="displayMode === 'desktop'" :uuid="uuid" />
  <MobileViewIonic v-else :uuid="uuid" />
</template>

<script setup>
import { useDisplayMode } from '@/composables/useDisplayMode';
import DesktopView from './DesktopView.vue';
import MobileViewIonic from './MobileViewIonic.vue';

defineProps({
  uuid: { type: String, default: '' },
});

const { displayMode } = useDisplayMode();
</script>
