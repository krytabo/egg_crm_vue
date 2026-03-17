<!-- src/components/Table/CustomTDesignTable.vue -->
<!--
  TDesign t-table 封裝。
  因 t-table 採用 columns array 設計，Column 的自訂表頭透過 title render function 實現。

  columns 擴充欄位（除標準 TDesign colKey/title/width/align/fixed 之外）：
    hidden       Boolean  — 是否隱藏此欄位
    sortable     Boolean  — 是否啟用自訂排序（顯示排序圖示，emit sort）
    sortField    String   — 排序 API 欄位名，預設等同 colKey
    currentOrder String   — '' | 'asc' | 'desc'（外部控制）
    floatingFilter Boolean — 是否啟用浮動篩選彈窗
    filterValue  Any      — 目前篩選值（有值時圖示顯示紅色）
    filterTitle  String   — 篩選彈窗標題（預設等同 title）
    filterWidth  Number   — 篩選彈窗寬度（預設 215）

  Slots：
    #colKey              — 自訂 cell 內容，slotProps = { row, col, rowIndex, colIndex }
    #colKey-filter       — 浮動篩選彈窗內容，slotProps = { confirm, reset }

  Events：
    @sort               — 自訂排序點擊，payload = { field, order }
    @sort-change        — TDesign 原生排序事件
    @filter-change      — TDesign 原生篩選事件
    @select-change      — 選取變更
    @row-click          — 點擊行
    @cell-click         — 點擊儲存格
    @update:filterValue — 重置篩選時觸發，payload = { colKey, value: '' }

  使用範例：
    <CustomTDesignTable
      :data="list"
      :columns="columns"
      :loading="loading"
      @sort="handleSort"
    >
      <template #status="{ row }">
        <t-tag>{{ row.status }}</t-tag>
      </template>
      <template #customerName-filter="{ confirm, reset }">
        <t-input v-model="filter.customerName" @enter="confirm" />
        <div class="flex gap-2 mt-2">
          <t-button size="small" @click="reset">重置</t-button>
          <t-button theme="primary" size="small" @click="confirm">確認</t-button>
        </div>
      </template>
    </CustomTDesignTable>

    const columns = [
      { colKey: 'customerName', title: '客戶名稱', minWidth: 120, floatingFilter: true, filterValue: filter.customerName },
      { colKey: 'amount',       title: '金額',      width: 100, align: 'right', sortable: true, currentOrder: sortState.amount },
      { colKey: 'status',       title: '狀態',      width: 90 },
    ]
-->
<template>
  <t-table
    ref="tableRef"
    :data="data"
    :columns="processedColumns"
    :row-key="rowKey"
    :loading="loading"
    :stripe="stripe"
    :bordered="bordered"
    :hover="hover"
    :size="size"
    :height="height"
    :max-height="maxHeight"
    v-bind="$attrs"
    @sort-change="$emit('sort-change', $event)"
    @filter-change="$emit('filter-change', $event)"
    @select-change="$emit('select-change', $event)"
    @row-click="$emit('row-click', $event)"
    @cell-click="$emit('cell-click', $event)"
  >
    <!-- 轉發父層所有 cell slot（排除 -filter slot，那是給浮動彈窗用的） -->
    <template v-for="(_, name) in cellSlots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </t-table>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--         浮動篩選彈窗（Teleport）      -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <teleport to="body" v-for="col in floatingFilterCols" :key="col.colKey">
    <div
      :ref="(el) => setDropdownRef(col.colKey, el)"
      v-show="activeFilter === col.colKey"
      class="fixed z-50 flex flex-col items-center justify-center space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
      :style="dropdownStyles[col.colKey] || {}"
    >
      <p class="text-base font-medium">{{ col.filterTitle || col.title }}</p>
      <slot :name="`${col.colKey}-filter`" :confirm="() => confirmFilter(col.colKey)" :reset="() => resetFilter(col.colKey)" />
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, reactive, nextTick, useSlots, onMounted, onBeforeUnmount, h, resolveComponent } from 'vue';

defineOptions({ name: 'CustomTDesignTable', inheritAttrs: false });

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  hover: { type: Boolean, default: true },
  size: { type: String, default: 'medium' },
  height: { type: [String, Number], default: null },
  maxHeight: { type: [String, Number], default: null },
});

const emit = defineEmits(['sort', 'sort-change', 'filter-change', 'select-change', 'row-click', 'cell-click', 'update:filterValue']);

// ── 在 setup 階段取得全域 svg-icon 組件（給 h() render function 用） ──
const SvgIcon = resolveComponent('svg-icon');

// ── Slot 轉發：排除 *-filter slot（留給浮動彈窗） ──
const slots = useSlots();
const cellSlots = computed(() => Object.fromEntries(Object.entries(slots).filter(([name]) => !name.endsWith('-filter'))));

// ── 浮動篩選欄位 ──
const floatingFilterCols = computed(() => props.columns.filter((c) => c.floatingFilter && !c.hidden));

// ── 浮動篩選狀態 ──
const buttonRefs = reactive({});
const dropdownRefs = reactive({});
const dropdownStyles = reactive({});
const activeFilter = ref(null);

const setDropdownRef = (colKey, el) => {
  if (el) dropdownRefs[colKey] = el;
};

const hasFilterValue = (colKey) => {
  const col = props.columns.find((c) => c.colKey === colKey);
  if (!col?.filterValue) return false;
  if (Array.isArray(col.filterValue)) return col.filterValue.length > 0;
  return col.filterValue !== null && col.filterValue !== '' && col.filterValue !== undefined;
};

const updateDropdownPosition = (colKey) => {
  const btn = buttonRefs[colKey];
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const width = props.columns.find((c) => c.colKey === colKey)?.filterWidth || 215;
  dropdownStyles[colKey] = {
    top: `${rect.bottom + window.scrollY + 5}px`,
    left: `${rect.left + window.scrollX - 15}px`,
    width: `${width}px`,
  };
};

const toggleFilter = async (colKey) => {
  if (activeFilter.value === colKey) {
    activeFilter.value = null;
  } else {
    activeFilter.value = colKey;
    await nextTick();
    updateDropdownPosition(colKey);
  }
};

const confirmFilter = (colKey) => {
  activeFilter.value = null;
};

const resetFilter = (colKey) => {
  emit('update:filterValue', { colKey, value: '' });
  activeFilter.value = null;
};

const handleClickOutside = (e) => {
  if (!activeFilter.value) return;
  const btn = buttonRefs[activeFilter.value];
  const drop = dropdownRefs[activeFilter.value];
  if (btn && !btn.contains(e.target) && drop && !drop.contains(e.target)) {
    activeFilter.value = null;
  }
};

const handleResize = () => {
  if (activeFilter.value) updateDropdownPosition(activeFilter.value);
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

// ── 排序 ──
const getSortIcon = (col) => {
  if (!col.currentOrder) return 'sort';
  return col.currentOrder === 'asc' ? 'sort_asc' : 'sort_desc';
};

const handleSort = (col) => {
  const nextOrder = !col.currentOrder ? 'desc' : col.currentOrder === 'desc' ? 'asc' : '';
  emit('sort', { field: col.sortField || col.colKey, order: nextOrder });
};

// ── 建立傳給 t-table 的 columns（注入自訂 title render function，剝離擴充欄位） ──
const processedColumns = computed(() =>
  props.columns
    .filter((col) => !col.hidden)
    .map((col) => {
      // 剝離擴充屬性，只保留 TDesign 認識的欄位
      const { sortable, sortField, currentOrder, floatingFilter, filterValue, filterTitle, filterWidth, hidden, ...rest } = col;

      // 自訂排序表頭
      if (sortable) {
        return {
          ...rest,
          title: () =>
            h('div', { class: 'flex cursor-pointer select-none items-center gap-1', onClick: () => handleSort(col) }, [
              h('span', {}, col.title),
              h(SvgIcon, { name: getSortIcon(col), class: 'h-[15px] w-[15px]' }),
            ]),
        };
      }

      // 浮動篩選表頭
      if (floatingFilter) {
        return {
          ...rest,
          title: () =>
            h(
              'div',
              {
                class: 'flex cursor-pointer select-none items-center gap-1',
                ref: (el) => {
                  if (el) buttonRefs[col.colKey] = el;
                },
                onClick: (e) => {
                  e.stopPropagation();
                  toggleFilter(col.colKey);
                },
              },
              [
                h('span', {}, col.title),
                h('i', {
                  class: ['ri-search-line flex h-[20px] w-[20px] items-center justify-center rounded-full text-[14px] hover:bg-gray-200', hasFilterValue(col.colKey) ? 'text-red-500' : ''].join(' '),
                }),
              ],
            ),
        };
      }

      return rest;
    }),
);

// ── Expose ──
const tableRef = ref(null);
const clearSelection = () => tableRef.value?.clearSelection?.();

defineExpose({ tableRef, clearSelection });
</script>

<style>
/* 統一表頭樣式 */
:deep(.t-table__header th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
}
:deep(.t-table td) {
  font-size: 14px;
}
</style>
