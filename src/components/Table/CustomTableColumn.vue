<!-- src/components/Table/CustomTableColumn.vue -->
<template>
  <a-table-column v-if="!isHidden" :title="title" :data-index="dataIndex" :width="width" :min-width="minWidth" :ellipsis="props.ellipsis" :tooltip="props.tooltip" :filterable="getFilterableConfig()" :fixed="props.fixed" :align="props.align">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--             標題相關            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <template #title>
      <div class="relative flex items-center gap-2">
        <template v-if="sortable">
          <div @click="handleSort" class="flex cursor-pointer items-center gap-2">
            <p>{{ title }}</p>
            <svg-icon :name="getSortIcon" class="h-[15px] w-[15px]"></svg-icon>
          </div>
        </template>
        <template v-else-if="floatingFilter">
          <div class="flex cursor-pointer items-center gap-2" ref="buttonRef" @click.stop="toggleFilter">
            <p>{{ title }}</p>
            <i class="ri-search-line flex h-[20px] w-[20px] items-center justify-center rounded-full text-[14px] hover:bg-[#c9cdd4]" :class="{ 'text-red-500': hasFilterValue }"></i>
          </div>
        </template>

        <template v-else>
          {{ title }}
        </template>
      </div>
    </template>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--             搜尋相關            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <template #filter-icon>
      <i class="ri-search-line" :class="{ 'text-red-500': hasFilterValue }"></i>
    </template>
    <template #filter-content="{ handleFilterConfirm, handleFilterReset }">
      <div class="flex flex-col items-center justify-center space-y-2 rounded-md bg-white p-4 shadow-sm" :style="{ width: `${props.filterWidth}px` }">
        <p class="text-[16px]">{{ computedFilterTitle }}</p>
        <slot name="filter" :confirm="handleFilterConfirm" :reset="handleFilterReset"></slot>
      </div>
    </template>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--             內容相關            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <template #cell="slotProps">
      <slot name="cell" v-bind="slotProps">
        {{ slotProps.record[dataIndex] }}
      </slot>
    </template>
  </a-table-column>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--           自定義搜尋相關         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <teleport to="body">
    <div ref="dropdownRef" v-show="isFilterActive" class="fixed z-50 flex flex-col items-center justify-center space-y-2 rounded-lg rounded-md border border-gray-200 bg-white p-4 shadow-lg shadow-sm" :style="dropdownStyle">
      <p class="text-[16px]">{{ computedFilterTitle }}</p>
      <slot name="floatingFilter" :confirm="handleFilterConfirm" :reset="handleFilterReset"></slot>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  dataIndex: { type: String, required: true },
  hidden: { type: Array, default: () => [] }, //隱藏欄位
  fixed: { type: String, required: true },
  align: { type: String, required: true },
  width: { type: Number, default: null },
  ellipsis: { type: Boolean, default: true },
  tooltip: { type: Boolean, default: true },
  minWidth: { type: Number, default: null },
  floatingFilter: { type: Boolean, default: false }, //自定義搜尋彈窗
  filter: {
    type: Boolean,
    default: false
  }, //搜尋
  filterValue: { type: [String, Array, Date], default: "" },
  filterTitle: { type: String, default: null },
  filterWidth: { type: Number, default: 215 },
  sortable: { type: Boolean, default: false },
  sortField: { type: String, default: "" },
  currentOrder: { type: String, default: "" }
});
const emit = defineEmits(["sort", "update:filterValue"]);

const computedFilterTitle = computed(() => props.filterTitle || props.title); //如果沒有設定filterTitle，就等同於title
const hasFilterValue = computed(() => {
  if (Array.isArray(props.filterValue)) return props.filterValue.length > 0;
  return props.filterValue !== null && props.filterValue !== undefined && props.filterValue !== "";
}); //判斷是否有輸入搜尋內容
const getFilterableConfig = () => {
  if (props.filter) {
    return {
      filter:
        props.customFilter ||
        ((value, record) => {
          if (!value) return true;
          const searchKey = props.filterKey || props.dataIndex; //如果沒有設定 filterKey 就使用 dataIndex
          const recordValue = record[searchKey];
          return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
        }),
      slotName: "filter-content"
    };
  } else {
    return false;
  }
}; //取得過濾配置
const isHidden = computed(() => props.hidden.includes(props.dataIndex)); //隱藏欄位

/** floating-ui相關 **/
const isFilterActive = ref(false);
const dropdownRef = ref(null);
const buttonRef = ref(null);
const dropdownStyle = ref({
  top: "0px",
  left: "0px",
  width: `${props.filterWidth}px`
});
const updateDropdownPosition = () => {
  if (!buttonRef.value || !dropdownRef.value) return;

  const buttonRect = buttonRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${buttonRect.bottom + window.scrollY + 5}px`,
    left: `${buttonRect.left + window.scrollX - 15}px`,
    width: `${props.filterWidth}px`
  };
}; //計算彈窗位置
const toggleFilter = async () => {
  isFilterActive.value = !isFilterActive.value;
  if (isFilterActive.value) {
    await nextTick();
    updateDropdownPosition();
  }
}; //關閉彈窗
const handleClickOutside = (event) => {
  if (isFilterActive.value && buttonRef.value && !buttonRef.value.contains(event.target) && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isFilterActive.value = false;
  }
}; //點擊範圍外關閉彈窗
const handleResize = () => {
  if (isFilterActive.value) {
    updateDropdownPosition();
  }
}; //彈窗大小
const handleFilterConfirm = () => {
  isFilterActive.value = false;
}; //切換彈窗狀態
const handleFilterReset = () => {
  emit("update:filterValue", "");
  isFilterActive.value = false;
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleResize);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleResize);
});

const handleSort = () => {
  if (props.sortable) {
    // let nextOrder = props.currentOrder === "asc" ? "desc" : props.currentOrder === "desc" ? "" : "asc";
    let nextOrder;
    if (!props.currentOrder) {
      nextOrder = "desc"; //空值>desc
    } else if (props.currentOrder === "desc") {
      nextOrder = "asc"; //desc>asc
    } else {
      nextOrder = ""; //asc>空值
    }
    emit("sort", { field: props.sortField, order: nextOrder });
  }
}; //排序
const getSortIcon = computed(() => (!props.currentOrder ? "sort" : props.currentOrder === "asc" ? "sort_asc" : "sort_desc"));
</script>

<style lang="scss">
.selectBGs {
  @apply shadow-6 flex flex-col items-center justify-center space-y-2 rounded-md bg-white p-4;
}

:deep(.arco-table-filters-align-left) {
  i {
    z-index: 1;
  }
}
</style>
