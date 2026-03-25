<!-- src/components/Tabel/CustomTinyGrid.vue -->
<template>
  <tiny-grid
    v-bind="gridAttrs"
    ref="gridRef"
    :data="data"
    :height="height"
    :max-height="maxHeight"
    :loading="loading"
    :stripe="stripe"
    :border="border"
    :round="round"
    :size="size"
    :fit="fit"
    :auto-resize="autoResize"
    :sync-resize="syncResize"
    :row-config="rowConfig"
    :column-config="columnConfig"
    :select-config="selectConfig"
    :sort-config="sortConfig"
    :filter-config="filterConfig"
    :pager-config="pagerConfig"
    :toolbar-config="toolbarConfig"
    :edit-config="editConfig"
    :valid-config="validConfig"
    :scroll-y="scrollY"
    :scroll-x="scrollX"
    @select-change="handleSelectChange"
    @select-all="handleSelectAll"
    @sort-change="handleSortChange"
    @filter-change="handleFilterChange"
    @page-change="handlePageChange"
    @toolbar-button-click="handleToolbarButtonClick"
    @cell-click="handleCellClick"
    @cell-dblclick="handleCellDblclick"
    @edit-closed="handleEditClosed"
    @edit-activated="handleEditActivated"
  >
    <slot />
  </tiny-grid>
</template>

<script setup>
import { computed, ref, useAttrs } from "vue";
import { TinyGrid } from "@opentiny/vue";
import { cn } from "@/components/ui/utils";

const props = defineProps({
  // 基本配置
  data: {
    type: Array,
    default: () => []
  },
  height: {
    type: [String, Number],
    default: null
  },
  maxHeight: {
    type: [String, Number],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  round: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "medium"
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  fit: {
    type: Boolean,
    default: true
  },
  syncResize: {
    type: Boolean,
    default: true
  },

  // 行配置
  rowConfig: {
    type: Object,
    default: () => ({
      keyField: "uuid",
      isHover: true
    })
  },

  // 列配置
  columnConfig: {
    type: Object,
    default: () => ({
      resizable: true
    })
  },

  // 選擇配置
  selectConfig: {
    type: Object,
    default: () => ({
      reserve: true,
      checkMethod: null
    })
  },

  // 排序配置
  sortConfig: {
    type: Object,
    default: () => ({
      multiple: false,
      trigger: "cell"
    })
  },

  // 過濾配置
  filterConfig: {
    type: Object,
    default: () => ({
      remote: true
    })
  },

  // 分頁配置
  pagerConfig: {
    type: Object,
    default: () => ({
      component: "Pager",
      attrs: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 50, 100, 200],
        layout: "total, sizes, prev, pager, next, jumper"
      }
    })
  },

  // 工具列配置
  toolbarConfig: {
    type: Object,
    default: () => ({
      buttons: [],
      refresh: false,
      export: false,
      print: false,
      zoom: false,
      custom: false
    })
  },

  // 編輯配置
  editConfig: {
    type: Object,
    default: () => ({
      trigger: "click",
      mode: "row",
      showStatus: true
    })
  },

  // 驗證配置
  validConfig: {
    type: Object,
    default: () => ({
      autoPos: true
    })
  },

  // 滾動配置
  scrollY: {
    type: Object,
    default: () => ({
      enabled: true,
      mode: "default"
    })
  },
  scrollX: {
    type: Object,
    default: () => ({
      enabled: true,
      mode: "default"
    })
  }
});
const emit = defineEmits(["select-change", "select-all", "sort-change", "filter-change", "page-change", "toolbar-button-click", "cell-click", "cell-dblclick", "edit-closed", "edit-activated"]);

const handleSelectChange = (selection, row) => {
  emit("select-change", selection, row);
};
const handleSelectAll = (selection) => {
  emit("select-all", selection);
};
const handleSortChange = (sortData) => {
  emit("sort-change", sortData);
};
const handleFilterChange = (filterData) => {
  emit("filter-change", filterData);
};
const handlePageChange = (pageData) => {
  emit("page-change", pageData);
};
const handleToolbarButtonClick = (buttonData) => {
  emit("toolbar-button-click", buttonData);
};
const handleCellClick = (cellData) => {
  emit("cell-click", cellData);
};
const handleCellDblclick = (cellData) => {
  emit("cell-dblclick", cellData);
};
const handleEditClosed = (editData) => {
  emit("edit-closed", editData);
};
const handleEditActivated = (editData) => {
  emit("edit-activated", editData);
};

const attrs = useAttrs();
const gridAttrs = computed(() => ({
  ...attrs,
  class: cn("rounded-xl border border-gray-200", attrs.class)
}));

//給父組件使用
const gridRef = ref(null);
const getSelectRecords = () => {
  return gridRef.value?.getSelectRecords() || [];
};
const clearSelection = () => {
  gridRef.value?.clearSelection();
};
const reloadData = (data) => {
  gridRef.value?.reloadData(data);
};
const refreshData = () => {
  gridRef.value?.refreshData();
};

defineExpose({
  gridRef,
  getSelectRecords,
  clearSelection,
  reloadData,
  refreshData,
  // 展開收合相關
  setAllRowExpansion: (expanded) => gridRef.value?.setAllRowExpansion(expanded),
  setRowExpansion: (rows, expanded) => gridRef.value?.setRowExpansion(rows, expanded),
  toggleRowExpansion: (row) => gridRef.value?.toggleRowExpansion(row),
  clearRowExpand: () => gridRef.value?.clearRowExpand(),
  // 樹狀展開相關
  setAllTreeExpansion: (expanded) => gridRef.value?.setAllTreeExpansion(expanded),
  setTreeExpansion: (rows, expanded) => gridRef.value?.setTreeExpansion(rows, expanded),
  toggleTreeExpansion: (row) => gridRef.value?.toggleTreeExpansion(row),
});
</script>

<style>
:deep(.tiny-grid) {
  --ti-grid-border-color: #e5e7eb;
}

:deep(.tiny-grid-header) {
  background-color: #f9fafb;
  font-weight: 600;
}

:deep(.tiny-grid-body) {
  font-size: 14px;
}

:deep(.tiny-grid-row:hover) {
  background-color: #f3f4f6;
}

.tiny-grid-loading {
  display: none !important;
}

.tiny-grid .tiny-grid__resizable-bar {
  width: 0 !important;
}
</style>
