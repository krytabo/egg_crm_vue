// src/composables/useContentWidth.js
import { ref, onMounted, onUnmounted, nextTick } from "vue";

export function useContentWidth(minWidth = 300, gap = 8) {
  const containerRef = ref(null);
  const titleRef = ref(null);
  const containerWidth = ref(0);
  const scrollbarWidth = ref(`${minWidth}px`);
  let resizeObserver = null;

  const resolveElement = (target) => {
    if (!target) return null;
    if (target instanceof Element) return target;
    if (target.$el) return target.$el;
    return target;
  };

  const calculateWidth = () => {
    const containerEl = resolveElement(containerRef.value);
    if (!containerEl) return;
    const width = containerEl.getBoundingClientRect().width;
    containerWidth.value = width;
    const titleEl = resolveElement(titleRef.value);
    if (titleEl) {
      const titleWidth = titleEl.getBoundingClientRect().width;
      const remainingWidth = width - titleWidth - gap - 20;
      scrollbarWidth.value = `${Math.max(remainingWidth, minWidth)}px`;
    } else {
      scrollbarWidth.value = `${Math.max(width - gap * 2, minWidth)}px`;
    }
  };

  onMounted(async () => {
    await nextTick();
    calculateWidth();
    resizeObserver = new ResizeObserver(calculateWidth);
    const containerEl = resolveElement(containerRef.value);
    if (containerEl) {
      resizeObserver.observe(containerEl);
    }
    window.addEventListener("resize", calculateWidth);
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener("resize", calculateWidth);
  });

  return { containerRef, titleRef, scrollbarWidth, containerWidth, calculateWidth };
}
