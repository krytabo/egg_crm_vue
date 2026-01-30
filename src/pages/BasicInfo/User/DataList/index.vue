<!-- src/pages/BasicInfo/User/DataList/index.vue -->
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
