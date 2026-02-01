<!-- src/pages/dashboard/index.vue 儀表板入口 -->
<template>
  <template v-if="displayMode === 'mobile'">
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button />
          </ion-buttons>
          <ion-title>{{ t('dashboard', '儀表板') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <DataList />
      </ion-content>
    </ion-page>
  </template>
  <template v-else>
    <DataList />
  </template>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { useDisplayMode } from '@/composables/useDisplayMode';
import DataList from './DataList.vue';

const { t } = useI18n();
const { displayMode } = useDisplayMode();
</script>
