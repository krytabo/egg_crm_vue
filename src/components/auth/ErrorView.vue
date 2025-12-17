<!-- src/components/auth/ErrorView.vue -->
<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <Vue3Lottie :animationData="error" :height="500" :width="500" />
    <h1 class="text-[50px] font-bold">Opps!!!</h1>
    <h4 class="text-h4 my-8">{{ $t("pageNotFound") }}</h4>
    <a-button type="primary" class="h-[50px] px-5 text-[22px]" @click="toBack">{{ $t("backToHome") }}</a-button>
  </div>
</template>

<script setup>
import error from "../../assets/json/PageNotFound2.json";
import { Vue3Lottie } from "vue3-lottie";
import { useRouter } from "vue-router";

const router = useRouter();

const toBack = async () => {
  await router.push({ path: "/" });
};
</script>
