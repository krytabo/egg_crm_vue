// src/stores/system.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSystemStore = defineStore("system", () => {
  /** 當前系統相關 **/
  const currentSystem = ref(localStorage.getItem("currentSystem") || "FacilityManagement");
  const setCurrentSystem = (system) => {
    currentSystem.value = system;
    localStorage.setItem("currentSystem", system);
  };
  const isCurrentSystem = computed(() => {
    return (system) => currentSystem.value === system;
  });

  /** 當前子系統相關 **/
  const currentSubSystem = ref(localStorage.getItem("currentSubSystem") || "");
  const setCurrentSubSystem = (sub) => {
    currentSubSystem.value = sub;
    localStorage.setItem("currentSubSystem", sub);
  };
  const isCurrentSubSystem = computed(() => {
    return (sub) => currentSubSystem.value === sub;
  });

  /** screenWidth相關 **/
  const screenWidth = ref(window.innerWidth);
  const setScreenWidth = (width) => {
    screenWidth.value = width;
  };

  /** 螢幕寬度響應式管理 **/
  /*@example
   const modalWidth = systemStore.modalWidth();    //使用預設值
   const customModalWidth = systemStore.modalWidth({
     breakpoint: 1000,   //斷點寬度
     largeWidth: 900,    //大螢幕時的寬度
     smallWidth: 80%     //小螢幕時的寬度百分比
   }); //使用自定義
   */
  const modalWidth = (options = {}) => {
    return computed(() => {
      const {
        breakpoint = 1020, //預設斷點
        largeWidth = 1000, //預設大螢幕寬度
        smallWidth = "90%" //預設小螢幕寬度
      } = options;

      return screenWidth.value > breakpoint ? largeWidth : smallWidth;
    });
  };

  /** 視窗大小變化監聽初始化 **/
  /*@example
  onMounted(() => {
    const cleanup = systemStore.initializeWindowResize();
    onUnmounted(cleanup);
  });*/
  const initializeWindowResize = () => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      actualTableHeight.value = window.innerHeight - setTableHeight.value;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };

  /** Tab模型使用 */
  const tabOffset = ref(0);
  const setTabOffset = (offset) => {
    tabOffset.value = offset;
  };

  /** 自動table計算高度 **/
  /*@example
  const height = systemStore.tableHeight; //獲取表格高度
  systemStore.updateTableHeight(400); //更新表格計算高度
  */
  const setTableHeight = ref(320);
  const actualTableHeight = ref(window.innerHeight - setTableHeight.value);
  const tableHeight = computed(() => {
    return actualTableHeight.value - tabOffset.value;
  });
  const updateTableHeight = (newHeight) => {
    setTableHeight.value = newHeight;
    actualTableHeight.value = window.innerHeight - setTableHeight.value;
  }; //手動修改計算扣除高度

  return {
    //當前系統相關
    currentSystem,
    setCurrentSystem,
    isCurrentSystem,

    //當前子系統相關
    currentSubSystem,
    setCurrentSubSystem,
    isCurrentSubSystem,

    //視窗寬度相關
    screenWidth,
    setScreenWidth,
    modalWidth,
    initializeWindowResize,

    //table高度相關
    tableHeight,
    tabOffset,
    updateTableHeight,
    setTabOffset
  };
});
