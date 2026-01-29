import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSystemStore } from '@/stores/system';

export function useDisplayMode() {
  const route = useRoute();
  const systemStore = useSystemStore();
  
  // 判斷是否強制手機模式 (路由以 /m 開頭)
  const isForceMobile = computed(() => {
    return route.path.startsWith('/m');
  });

  // 判斷是否為手機尺寸 (依賴 systemStore 或自行監聽)
  // 這裡沿用 systemStore 的 screenWidth 邏輯，保持專案一致性
  // 但加入 route 的強制覆寫
  const isMobile = computed(() => {
    if (isForceMobile.value) return true;
    return systemStore.screenWidth < 768;
  });

  const displayMode = computed(() => isMobile.value ? 'mobile' : 'desktop');

  return {
    isMobile,
    displayMode
  };
}
