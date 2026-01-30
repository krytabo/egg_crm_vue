<!-- src/pages/BasicInfo/Driver/DataList/index.vue 司機管理 (入口) -->
<template>
  <DesktopView v-if="displayMode === 'desktop'" />
  <MobileView v-else />
</template>

<script setup>
import { useDisplayMode } from '@/composables/useDisplayMode';
import DesktopView from './DesktopView.vue';
import MobileView from './MobileView.vue';

const { displayMode } = useDisplayMode();
</script>
