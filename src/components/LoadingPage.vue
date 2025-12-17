<!-- src/components/LoadingPage.vue -->
<template>
  <div :class="{ loading_out: !loadedStatus }" class="loading_progress absolute z-[1020] flex h-full w-screen flex-col items-center justify-center text-[#fff]">
    <span class="loading__anim"></span>
    <p class="mt-5 text-[18px]">{{ loadingMessage }}</p>
    <div v-if="showProgress" class="absolute top-0 w-full">
      <div class="h-[10px] rounded-full bg-blue-500" :style="{ width: progressNumber + '%' }"></div>
      <div class="h-[10px] text-right text-[18px]" :style="{ width: progressNumber + '%' }">{{ progressNumber }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMainStore } from "@/stores/LoadingStore.js";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { loadingMessage, showProgress, progressNumber } = storeToRefs(store);

const loadedStatus = ref(true);
</script>

<style scoped lang="scss">
.loading_progress {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  z-index: 1003;
  transition: width 0.2s ease;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background: #000000bf;
}
.loading_out {
  transform: scale(0, 0);
  animation: fadenum 3s;
}
@keyframes fadenum {
  0% {
    transform: scale(1, 1);
    opacity: 1;
  }
  100% {
    transform: scale(0, 0);
    opacity: 0;
    filter: blur(1500px);
  }
}

.loading__anim {
  width: 30px;
  height: 30px;
  display: inline-block;
  border: 3px solid #fff0;

  border-right-color: #165dff;
  border-bottom-color: #165dff;

  border-radius: 50%;
  animation: rotate 1000ms infinite linear;
}

@keyframes rotate {
  to {
    transform: rotate(1turn);
  }
}
</style>
