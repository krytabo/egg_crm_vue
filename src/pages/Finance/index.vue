<!-- src/pages/Finance/index.vue 帳務管理入口 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <MobileView key="mobile" />
  </template>
  <template v-else>
    <DesktopView key="desktop" />
  </template>
</template>

<script setup>
import { useDisplayMode } from '@/composables/useDisplayMode';
import DesktopView from './DesktopView.vue';
import MobileView from './MobileView.vue';

const { displayMode } = useDisplayMode();
</script>
