<!-- src/components/Form/InfiniteScrollList.vue 通用無限捲動列表 -->
<template>
  <div class="infinite-scroll-list" :class="{ 'has-border': border }">
    <!-- 搜尋欄 -->
    <div v-if="allowSearch" class="search-bar">
      <input
        v-model="searchTerm"
        type="text"
        class="search-input"
        :placeholder="searchPlaceholder"
      />
    </div>

    <!-- 列表容器 -->
    <div class="list-container" :style="{ maxHeight }" ref="listRef" @scroll="handleScroll">
      <template v-if="filteredItems.length">
        <div
          v-for="item in filteredItems"
          :key="item[valueKey]"
          class="list-row"
          :class="{ selected: selectable && isSelected(item[valueKey]) }"
          @click="handleRowClick(item)"
        >
          <!-- 自訂內容插槽 -->
          <slot name="item" :item="item" :selected="isSelected(item[valueKey])">
            <!-- 預設顯示 -->
            <div class="item-content">
              <p class="item-label">{{ item[labelKey] }}</p>
              <p v-if="item[descriptionKey]" class="item-description">
                {{ item[descriptionKey] }}
              </p>
            </div>
          </slot>

          <!-- 選擇指示器 -->
          <div v-if="selectable" class="selection-indicator">
            <i
              v-if="isSelected(item[valueKey])"
              class="ri-checkbox-circle-fill text-blue-600"
            ></i>
            <i v-else class="ri-checkbox-blank-circle-line text-gray-300"></i>
          </div>
        </div>
      </template>

      <!-- 空狀態 -->
      <div v-else-if="!loading && initialized" class="empty-state">
        <slot name="empty">{{ emptyText }}</slot>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="loading-state">
        <i class="ri-loader-4-line animate-spin"></i>
        <span class="ml-2">載入中...</span>
      </div>

      <!-- 沒有更多資料 -->
      <div v-else-if="!hasMore && filteredItems.length" class="no-more-state">
        沒有更多資料
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  /** API 取得資料函式，接收 { page, limit, search } 參數 */
  fetcher: {
    type: Function,
    required: true,
  },
  /** 格式化 API 回傳的項目 */
  itemFormatter: {
    type: Function,
    default: (item) => item,
  },
  /** 前端篩選函式，接收 (item, filters) 參數 */
  filterFn: {
    type: Function,
    default: null,
  },
  /** 傳給 filterFn 的篩選條件 */
  filters: {
    type: Object,
    default: () => ({}),
  },
  /** 已選擇的項目值列表 */
  selectedValues: {
    type: Array,
    default: () => [],
  },
  /** 是否啟用選擇功能 */
  selectable: {
    type: Boolean,
    default: true,
  },
  /** 值欄位名稱 */
  valueKey: {
    type: String,
    default: 'id',
  },
  /** 顯示標籤欄位名稱 */
  labelKey: {
    type: String,
    default: 'name',
  },
  /** 描述欄位名稱 */
  descriptionKey: {
    type: String,
    default: 'description',
  },
  /** 每次載入筆數 */
  limit: {
    type: Number,
    default: 20,
  },
  /** 是否顯示搜尋欄 */
  allowSearch: {
    type: Boolean,
    default: true,
  },
  /** 搜尋欄提示文字 */
  searchPlaceholder: {
    type: String,
    default: '搜尋...',
  },
  /** 空狀態文字 */
  emptyText: {
    type: String,
    default: '查無資料',
  },
  /** 最大高度 */
  maxHeight: {
    type: String,
    default: '300px',
  },
  /** 是否顯示邊框 */
  border: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['toggle', 'click', 'loaded']);

/** 基本狀態 **/
const listRef = ref(null);
const allItems = ref([]); // 所有已載入的資料
const loading = ref(false);
const initialized = ref(false);
const page = ref(1);
const total = ref(0);
const hasMore = ref(true);
const searchTerm = ref('');
let searchTimer = null;

/** 將 API 回應正規化 **/
const normalizeResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const totalCount = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total: totalCount };
};

/** 取得資料 **/
const fetchData = async (targetPage = 1, append = false) => {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      page: targetPage,
      limit: props.limit,
    };
    if (searchTerm.value.trim()) {
      params.search = searchTerm.value.trim();
    }

    const { data, total: totalCount } = normalizeResponse(await props.fetcher(params));
    const formatted = data.map(props.itemFormatter);

    total.value = totalCount;

    if (append) {
      // 追加模式：合併新資料，避免重複
      const merged = [...allItems.value];
      formatted.forEach((item) => {
        if (!merged.some((existing) => existing[props.valueKey] === item[props.valueKey])) {
          merged.push(item);
        }
      });
      allItems.value = merged;
    } else {
      // 重置模式：清空後重新載入
      allItems.value = formatted;
      page.value = 1;
    }

    hasMore.value = allItems.value.length < total.value;
    page.value = targetPage + 1;
    initialized.value = true;

    emit('loaded', { items: allItems.value, total: total.value });
  } catch (error) {
    console.error('InfiniteScrollList fetch error:', error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

/** 載入更多 **/
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  await fetchData(page.value, true);
};

/** 處理捲動事件 **/
const handleScroll = (event) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  // 當捲動到接近底部時載入更多
  if (scrollTop + clientHeight >= scrollHeight - 24) {
    loadMore();
  }
};

/** 處理搜尋（防抖） **/
const handleSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchData(1, false);
  }, 300);
};

watch(searchTerm, handleSearchDebounced);

/** 篩選後的列表 **/
const filteredItems = computed(() => {
  if (!props.filterFn) return allItems.value;
  return allItems.value.filter((item) => props.filterFn(item, props.filters));
});

/** 判斷是否已選擇 **/
const isSelected = (value) => props.selectedValues.includes(value);

/** 處理列點擊 **/
const handleRowClick = (item) => {
  emit('click', item);
  if (props.selectable) {
    emit('toggle', item);
  }
};

/** 初始載入 **/
onMounted(() => {
  fetchData(1, false);
});

/** 當篩選條件變更時，如果篩選後資料太少則載入更多 **/
watch(
  () => props.filters,
  () => {
    if (filteredItems.value.length < 10 && hasMore.value && !loading.value) {
      loadMore();
    }
  },
  { deep: true },
);

/** 暴露方法供外部使用 **/
defineExpose({
  refresh: () => fetchData(1, false),
  getItemByValue: (value) => allItems.value.find((item) => item[props.valueKey] === value),
  getAllLoadedItems: () => allItems.value,
  loadMore,
});
</script>

<style scoped>
.infinite-scroll-list {
  overflow: hidden;
}

.infinite-scroll-list.has-border {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.search-bar {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.search-input:focus {
  border-color: #2563eb;
  outline: none;
}

.list-container {
  overflow-y: auto;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:hover {
  background-color: #f9fafb;
}

.list-row.selected {
  background-color: #eff6ff;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.item-description {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0;
}

.selection-indicator {
  font-size: 20px;
  margin-left: 12px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.loading-state {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.no-more-state {
  padding: 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}
</style>
