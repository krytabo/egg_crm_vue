<!-- src/components/layout/TopBanner.vue -->
<template>
  <div class="flex h-16 items-center bg-white">
    <a-button type="text" @click="emit('toggleSidebar')" class="text-gray-600!" :reset-time="0">
      <i class="ri-arrow-right-s-line" v-if="props.collapsed" />
      <i class="ri-arrow-left-s-line" v-if="!props.collapsed" />
    </a-button>

    <div class="flex flex-1 items-center justify-end gap-3">
      <div class="text-right">
        <p class="text-sm font-medium text-gray-800">{{ displayName }}</p>
        <p class="text-xs text-gray-500">{{ userRoleInfo || '—' }}</p>
      </div>
      <TinyDropdown trigger="click" :menu-options="dropdownOptions" @item-click="handleMenuAction">
        <!--<TinyButton type="text" class="!text-gray-600" :reset-time="0">
          <i class="ri-menu-line"></i>
        </TinyButton>-->
      </TinyDropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { AuthLogoutPost } from '@/assets/API/Auth';
import { getUserInfo, logout as clearSession } from '@/utils/auth';
import { TinyButton, TinyDropdown } from '@opentiny/vue';
import Notify from '@opentiny/vue-notify';
import { useRouter } from 'vue-router';

const props = defineProps({
  collapsed: { type: Boolean, default: false },
});
const emit = defineEmits(['toggleSidebar']);
const router = useRouter();
const userInfo = ref(getUserInfo());

const dropdownOptions = computed(() => ({
  options: [
    // { label: "個人資料", value: "profile" },
    // { label: "系統設定", value: "settings" },
    { label: '登出', value: 'logout' },
  ],
  textField: 'label',
  placement: 'bottom-end',
}));
const displayName = computed(() => {
  if (!userInfo.value) return '—';
  return userInfo.value.fullName || userInfo.value.email || '—';
});
const userRoleInfo = computed(() => {
  if (!userInfo.value) return '';
  const role = userInfo.value.role || userInfo.value.roles?.[0]?.name;
  const dept = userInfo.value.department || '';
  return [role, dept].filter(Boolean).join(' · ');
});
const performLogout = async () => {
  try {
    await AuthLogoutPost();
  } catch (error) {
    console.warn('[TopBanner] logout failed', error);
  } finally {
    clearSession();
    Notify({ type: 'success', title: '登出成功', message: '您已成功登出' });
    router.replace({ name: 'auth-login' });
  }
};
const handleMenuAction = ({ itemData }) => {
  switch (itemData.value) {
    case 'profile':
      Notify({ type: 'info', title: '個人資料', message: '個人資料功能開發中' });
      break;
    case 'settings':
      Notify({ type: 'info', title: '系統設定', message: '系統設定功能開發中' });
      break;
    case 'logout':
      performLogout();
      break;
    default:
      break;
  }
};
</script>
