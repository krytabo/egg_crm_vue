<!-- src/components/Table/CustomElTableColumn.vue -->
<!--
  使用方式：
    <CustomElTableColumn title="狀態" prop="status" :hidden="hiddenCols" fixed="right" align="center"
      :sortable="true" sort-field="status" :current-order="sortOrder" @sort="handleSort"
    >
      <template #default="{ row }">
        <el-tag>{{ row.status }}</el-tag>
      </template>
    </CustomElTableColumn>

    浮動篩選：
    <CustomElTableColumn title="客戶" prop="customerName" :hidden="hiddenCols" fixed="left" align="left"
      :floating-filter="true" v-model:filter-value="filter.customerName"
    >
      <template #floatingFilter="{ confirm, reset }">
        <el-input v-model="filter.customerName" @keyup.enter="confirm" />
        <div class="flex gap-2 mt-2">
          <el-button size="small" @click="reset">重置</el-button>
          <el-button type="primary" size="small" @click="confirm">確認</el-button>
        </div>
      </template>
    </CustomElTableColumn>
-->
<template>
  <el-table-column
    v-if="!isHidden"
    :prop="prop"
    :label="title"
    :width="width"
    :min-width="minWidth"
    :fixed="fixed"
    :align="align"
    :header-align="headerAlign"
    :show-overflow-tooltip="showOverflowTooltip"
    :resizable="resizable"
    :type="type || undefined"
    :index="index"
  >
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--             標題相關             -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <template #header="headerProps">
      <div class="flex items-center gap-1">
        <template v-if="sortable">
          <div class="flex cursor-pointer select-none items-center gap-1" @click="handleSort">
            <span>{{ title }}</span>
            <svg-icon :name="sortIconName" class="h-[15px] w-[15px]" />
          </div>
        </template>
        <template v-else-if="floatingFilter">
          <div
            class="flex cursor-pointer select-none items-center gap-1"
            ref="buttonRef"
            @click.stop="toggleFilter"
          >
            <span>{{ title }}</span>
            <i
              class="ri-search-line flex h-[20px] w-[20px] items-center justify-center rounded-full text-[14px] hover:bg-gray-200"
              :class="{ 'text-red-500': hasFilterValue }"
            />
          </div>
        </template>
        <template v-else>
          <slot name="header" v-bind="headerProps">{{ title }}</slot>
        </template>
      </div>
    </template>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--             內容相關             -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <template #default="slotProps">
      <slot v-bind="slotProps">{{ prop ? slotProps.row[prop] : '' }}</slot>
    </template>
  </el-table-column>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         自定義搜尋浮動彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <teleport to="body">
    <div
      ref="dropdownRef"
      v-show="isFilterActive"
      class="fixed z-50 flex flex-col items-center justify-center space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
      :style="dropdownStyle"
    >
      <p class="text-base font-medium">{{ computedFilterTitle }}</p>
      <slot name="floatingFilter" :confirm="handleFilterConfirm" :reset="handleFilterReset" />
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue';

defineOptions({ name: 'CustomElTableColumn' });

const props = defineProps({
  title: { type: String, required: true },
  prop: { type: String, default: '' },
  // 隱藏欄位（傳入要隱藏的 prop 陣列，與 Arco 版本一致）
  hidden: { type: Array, default: () => [] },
  fixed: { type: [String, Boolean], default: false },
  align: { type: String, default: 'left' },
  headerAlign: { type: String, default: 'left' },
  width: { type: [String, Number], default: null },
  minWidth: { type: [String, Number], default: null },
  showOverflowTooltip: { type: Boolean, default: true },
  resizable: { type: Boolean, default: true },
  // 特殊欄位類型（selection / index / expand）
  type: { type: String, default: '' },
  index: { type: [Number, Function], default: undefined },
  // 浮動篩選
  floatingFilter: { type: Boolean, default: false },
  filterValue: { type: [String, Array, Date], default: '' },
  filterTitle: { type: String, default: null },
  filterWidth: { type: Number, default: 215 },
  // 排序
  sortable: { type: Boolean, default: false },
  sortField: { type: String, default: '' },
  currentOrder: { type: String, default: '' },
});

const emit = defineEmits(['sort', 'update:filterValue']);

// ── 隱藏 ──
const isHidden = computed(() => props.hidden.includes(props.prop));

// ── 篩選標題 ──
const computedFilterTitle = computed(() => props.filterTitle || props.title);

// ── 是否有篩選值（顯示紅色圖示） ──
const hasFilterValue = computed(() => {
  if (Array.isArray(props.filterValue)) return props.filterValue.length > 0;
  return props.filterValue !== null && props.filterValue !== undefined && props.filterValue !== '';
});

// ── 排序 ──
const sortIconName = computed(() => {
  if (!props.currentOrder) return 'sort';
  return props.currentOrder === 'asc' ? 'sort_asc' : 'sort_desc';
});

const handleSort = () => {
  if (!props.sortable) return;
  let nextOrder = !props.currentOrder ? 'desc' : props.currentOrder === 'desc' ? 'asc' : '';
  emit('sort', { field: props.sortField || props.prop, order: nextOrder });
};

// ── 浮動篩選 ──
const isFilterActive = ref(false);
const buttonRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({ top: '0px', left: '0px', width: `${props.filterWidth}px` });

const updateDropdownPosition = () => {
  if (!buttonRef.value || !dropdownRef.value) return;
  const rect = buttonRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + window.scrollY + 5}px`,
    left: `${rect.left + window.scrollX - 15}px`,
    width: `${props.filterWidth}px`,
  };
};

const toggleFilter = async () => {
  isFilterActive.value = !isFilterActive.value;
  if (isFilterActive.value) {
    await nextTick();
    updateDropdownPosition();
  }
};

const handleClickOutside = (e) => {
  if (
    isFilterActive.value &&
    buttonRef.value &&
    !buttonRef.value.contains(e.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target)
  ) {
    isFilterActive.value = false;
  }
};

const handleResize = () => {
  if (isFilterActive.value) updateDropdownPosition();
};

const handleFilterConfirm = () => {
  isFilterActive.value = false;
};

const handleFilterReset = () => {
  emit('update:filterValue', '');
  isFilterActive.value = false;
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize);
});
</script>
