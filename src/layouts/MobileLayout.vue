<!-- src/layouts/MobileLayout.vue -->
<template>
  <ion-app class="mobile-app">
    <RouterView />
  </ion-app>
</template>

<script setup>
import { IonApp } from '@ionic/vue';
</script>

<style>
.mobile-app {
  --ion-safe-area-top: env(safe-area-inset-top);
  --ion-safe-area-bottom: env(safe-area-inset-bottom);
  --ion-safe-area-left: env(safe-area-inset-left);
  --ion-safe-area-right: env(safe-area-inset-right);
}
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
