<!-- src/pages/auth/LoginPage.vue -->
<template>
  <div class="flex w-full max-w-[400px] flex-col gap-10 rounded-[20px] bg-white p-8 shadow-xl">
    <p class="text-center text-[28px] font-semibold text-gray-900">登入</p>

    <div class="flex flex-col gap-4">
      <a-input v-model="basicForm.username" size="large" placeholder="輸入帳號" allow-clear class="rounded-full!" />
      <a-input-password v-model="basicForm.password" size="large" placeholder="輸入密碼" allow-clear class="rounded-full!" />
    </div>

    <div class="flex flex-col gap-3">
      <TinyCheckbox v-model="rememberMe" name="remember-me">記住我</TinyCheckbox>
      <TinyButton type="primary" size="large" class="w-full" :loading="isSubmitting" @click="handleLogin" round>
        <p class="text-[18px]">登入</p>
      </TinyButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { AuthLoginPost, AuthProfileGet } from '@/assets/API/Auth';
import { useRoute, useRouter } from 'vue-router';
import { TinyButton, TinyCheckbox } from '@opentiny/vue';
import { useMainStore } from '@/stores/LoadingStore';
import Notify from '@opentiny/vue-notify';
import { setToken, setUserInfo, getErrorMessage, getRememberedCredentials, setRememberedCredentials, clearRememberedCredentials, getRememberStatus, setRememberStatus } from '@/utils/auth';

const mainStore = useMainStore();
const router = useRouter();
const route = useRoute();

const basicForm = ref({ username: '', password: '' });
const isSubmitting = ref(false);
const rememberMe = ref(getRememberStatus()); //記住我
const unwrapResponse = (payload) => payload?.data?.data ?? payload?.data ?? payload;
const handleLogin = async () => {
  if (!basicForm.value.username || !basicForm.value.password) {
    await mainStore.SWAL_Confirm({
      title: '登入失敗',
      text: '請輸入帳號與密碼',
      icon: 'error',
      showCancelButton: false,
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      email: basicForm.value.username.trim(),
      password: basicForm.value.password,
    };
    const loginResponse = await AuthLoginPost(payload);
    const authData = unwrapResponse(loginResponse);
    const sessionPayload = {
      accessToken: authData?.accessToken || authData?.token,
      refreshToken: authData?.refreshToken,
      expiresIn: authData?.expiresIn,
    };

    if (!sessionPayload.accessToken) {
      throw new Error(loginResponse?.data?.message || '登入失敗，請稍後再試');
    }

    setToken(sessionPayload);

    if (rememberMe.value) {
      setRememberedCredentials(basicForm.value.username, basicForm.value.password);
    } else {
      clearRememberedCredentials();
    }

    let profile = authData?.user; //取得個人資料
    if (!profile) {
      const profileResponse = await AuthProfileGet();
      profile = unwrapResponse(profileResponse);
    }
    if (profile) setUserInfo(profile);

    const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join('') || profile?.username || profile?.email || basicForm.value.username;
    Notify({
      type: 'success',
      title: '登入成功',
      message: `歡迎回來，${displayName}`,
    });

    // 處理登入後重定向
    const redirectParam = route.query.redirect;
    const redirectTarget = typeof redirectParam === 'string' && redirectParam.startsWith('/') ? decodeURIComponent(redirectParam) : null;

    if (redirectTarget) {
      await router.replace(redirectTarget); //回到登入前的路由
    } else {
      await router.push({ name: 'dashboard' }); //沒有路由直接進入到首頁
    }
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSubmitting.value = false;
  }
}; //登入
watch(rememberMe, (value) => {
  setRememberStatus(value);
  if (!value) {
    clearRememberedCredentials();
  }
});

onMounted(() => {
  if (rememberMe.value) {
    const saved = getRememberedCredentials();
    if (saved) {
      basicForm.value.username = saved.accounts || '';
      basicForm.value.password = saved.password || '';
    }
  }
});
</script>
