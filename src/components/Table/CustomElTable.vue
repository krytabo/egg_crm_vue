<!-- src/components/Table/CustomElTable.vue -->
<template>
  <el-table
    ref="tableRef"
    :data="data"
    :height="height"
    :max-height="maxHeight"
    v-loading="loading"
    :stripe="stripe"
    :border="border"
    :size="size"
    :row-key="rowKey"
    :highlight-current-row="highlightCurrentRow"
    :show-summary="showSummary"
    :sum-text="sumText"
    :summary-method="summaryMethod"
    v-bind="$attrs"
    class="rounded-xl"
    @sort-change="$emit('sort-change', $event)"
    @filter-change="$emit('filter-change', $event)"
    @selection-change="$emit('selection-change', $event)"
    @row-click="$emit('row-click', $event)"
    @row-dblclick="$emit('row-dblclick', $event)"
    @current-change="$emit('current-change', $event)"
    @cell-click="$emit('cell-click', $event)"
  >
    <slot />
  </el-table>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({ name: 'CustomElTable', inheritAttrs: false });

defineProps({
  data: { type: Array, default: () => [] },
  height: { type: [String, Number], default: null },
  maxHeight: { type: [String, Number], default: null },
  loading: { type: Boolean, default: false },
  stripe: { type: Boolean, default: true },
  border: { type: Boolean, default: true },
  size: { type: String, default: 'default' },
  rowKey: { type: String, default: 'id' },
  highlightCurrentRow: { type: Boolean, default: false },
  showSummary: { type: Boolean, default: false },
  sumText: { type: String, default: '合計' },
  summaryMethod: { type: Function, default: null },
});

defineEmits(['sort-change', 'filter-change', 'selection-change', 'row-click', 'row-dblclick', 'current-change', 'cell-click']);

const tableRef = ref(null);
const clearSelection = () => tableRef.value?.clearSelection();
const toggleRowSelection = (row, selected) => tableRef.value?.toggleRowSelection(row, selected);
const clearSort = () => tableRef.value?.clearSort();
const clearFilter = (cols) => tableRef.value?.clearFilter(cols);
const doLayout = () => tableRef.value?.doLayout();

defineExpose({ tableRef, clearSelection, toggleRowSelection, clearSort, clearFilter, doLayout });
</script>

<style>
/* 統一表頭樣式 */
:deep(.el-table th.el-table__cell) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
}
:deep(.el-table td.el-table__cell) {
  font-size: 14px;
}
</style>
