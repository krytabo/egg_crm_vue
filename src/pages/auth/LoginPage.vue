<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { Button as TinyButton } from "@/components/ui/button";
import { Input as TinyInput } from "@/components/ui/input";
import { Checkbox as TinyCheckbox } from "@/components/ui/checkbox";
import Notify from "@opentiny/vue-notify";
import { AuthLoginPost, AuthProfileGet } from "@/assets/API/Auth";
import { setToken, setUserInfo, getErrorMessage, getRememberedCredentials, setRememberedCredentials, clearRememberedCredentials, getRememberStatus, setRememberStatus } from "@/utils/auth";

const router = useRouter();
const route = useRoute();
const form = reactive({ username: "", password: "" });
const isSubmitting = ref(false);
const rememberMe = ref(getRememberStatus());

onMounted(() => {
  if (rememberMe.value) {
    const saved = getRememberedCredentials();
    if (saved) {
      form.username = saved.accounts || "";
      form.password = saved.password || "";
    }
  }
});

watch(rememberMe, (value) => {
  setRememberStatus(value);
  if (!value) {
    clearRememberedCredentials();
  }
});

const unwrapResponse = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const handleLogin = async () => {
  if (!form.username || !form.password) {
    Notify({ type: "warning", title: "請輸入帳號與密碼" });
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      email: form.username.trim(),
      password: form.password
    };
    const loginResponse = await AuthLoginPost(payload);
    const authData = unwrapResponse(loginResponse);
    const sessionPayload = {
      accessToken: authData?.accessToken || authData?.token,
      refreshToken: authData?.refreshToken,
      expiresIn: authData?.expiresIn
    };

    if (!sessionPayload.accessToken) {
      throw new Error(loginResponse?.data?.message || "登入失敗，請稍後再試");
    }

    setToken(sessionPayload);

    if (rememberMe.value) {
      setRememberedCredentials(form.username, form.password);
    } else {
      clearRememberedCredentials();
    }

    let profile = authData?.user;
    if (!profile) {
      const profileResponse = await AuthProfileGet();
      profile = unwrapResponse(profileResponse);
    }
    if (profile) {
      setUserInfo(profile);
    }

    const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join("") || profile?.username || profile?.email || form.username;
    Notify({
      type: "success",
      title: "登入成功",
      message: `歡迎回來，${displayName}`
    });

    const redirectTarget = typeof route.query.redirect === "string" ? route.query.redirect : null;
    if (redirectTarget) {
      await router.replace(redirectTarget);
    } else {
      await router.push({ name: "dashboard" });
    }
  } catch (error) {
    console.error("Login failed:", error);
    const message = error?.response ? getErrorMessage(error) : error?.message || "登入失敗，請稍後再試";
    Notify({ type: "error", title: "登入失敗", message });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
    <div class="space-y-1 text-center">
      <h1 class="text-2xl font-semibold text-gray-900">登入 CRM 系統</h1>
      <p class="text-sm text-gray-500">此頁面將串接未來的身分驗證</p>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="text-sm text-gray-600">帳號</label>
        <TinyInput v-model="form.username" placeholder="輸入帳號" />
      </div>
      <div class="space-y-1">
        <label class="text-sm text-gray-600">密碼</label>
        <TinyInput v-model="form.password" type="password" placeholder="輸入密碼" />
      </div>
      <TinyCheckbox v-model="rememberMe" name="remember-me">記住我</TinyCheckbox>
      <TinyButton type="primary" class="w-full" :loading="isSubmitting" :disabled="isSubmitting" @click="handleLogin">登入</TinyButton>
    </div>
  </div>
</template>
