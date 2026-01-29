<!-- src/layouts/MobileLayout.vue -->
<!-- 手機版 Layout（Ionic Vue）- 處理 Safe Area -->
<template>
  <ion-app class="mobile-app">
    <RouterView />
  </ion-app>
</template>

<script setup>
import { IonApp } from '@ionic/vue';
</script>

<style>
/* Ionic 全域樣式 - Safe Area 處理 */
.mobile-app {
  /* 確保 safe area 正確處理 */
  --ion-safe-area-top: env(safe-area-inset-top);
  --ion-safe-area-bottom: env(safe-area-inset-bottom);
  --ion-safe-area-left: env(safe-area-inset-left);
  --ion-safe-area-right: env(safe-area-inset-right);
}

/* iOS 狀態列背景色 - 淺色 */
.mobile-app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: env(safe-area-inset-top);
  background: #ffffff;
  z-index: 9999;
}

/* iOS 底部安全區背景色 - 淺色 */
.mobile-app::after {
  content: '';
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: env(safe-area-inset-bottom);
  background: #ffffff;
  z-index: 9999;
}
</style>
