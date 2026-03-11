<!-- src/components/Tabel/CustomTinyGridColumn.vue -->
<template>
  <tiny-grid-column
    v-if="!isHidden"
    :field="field"
    :title="title"
    :width="width"
    :min-width="minWidth"
    :fixed="fixed"
    :align="align"
    :header-align="headerAlign"
    :sortable="useNativeSort"
    :resizable="resizable"
    :show-overflow="showOverflow"
    :show-header-overflow="showHeaderOverflow"
    :class-name="className"
    :header-class-name="headerClassName"
    :formatter="formatter"
    :type="type"
    :tree-node="treeNode"
    :visible="visible"
    :filter-multiple="filterMultiple"
    :filters="filters"
    :filter-method="filterMethod"
    :filter-render="filterRender"
    :edit-render="editRender"
    :content-render="contentRender"
    :header-render="headerRender"
    :footer-render="footerRender"
    :export-method="exportMethod"
    :footer-method="footerMethod"
    :index-method="indexMethod"
    :seq-method="seqMethod"
    :sort-method="sortMethod"
    :sort-by="sortBy"
    :multi-sort="multiSort"
  >
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>

    <!-- type 為內建特殊欄位時（selection/checkbox/radio/seq/expand），
         不覆蓋 #header，讓 TinyGrid 自己渲染全選 checkbox 等內建 header -->
    <template v-if="!isBuiltinType" #header="slotProps">
      <div class="custom-grid-header">
        <div class="header-content" @keyup.capture="handleHeaderKeyup">
          <slot name="header" v-bind="slotProps">
            <span class="default-header-text">{{ title }}</span>
          </slot>
        </div>
        <button v-if="sortable" type="button" class="sort-trigger prevent-sort cursor-pointer" @pointerdown.stop.prevent="handleSortClick" @click.stop.prevent="handleSortClick">
          <svg-icon :name="sortIconName" class="h-[15px] w-[15px]" />
        </button>
      </div>
    </template>

    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots.filter" #filter="slotProps">
      <slot name="filter" v-bind="slotProps" />
    </template>

    <template v-if="$slots.edit" #edit="slotProps">
      <slot name="edit" v-bind="slotProps" />
    </template>
  </tiny-grid-column>
</template>

<script setup>
import { computed } from "vue";
import { TinyGridColumn } from "@opentiny/vue";

const props = defineProps({
  // 基本屬性
  field: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  width: {
    type: [String, Number],
    default: null
  },
  minWidth: {
    type: [String, Number],
    default: 80
  },
  maxWidth: {
    type: [String, Number],
    default: null
  },
  fixed: {
    type: String,
    default: null,
    validator: (value) => [null, "left", "right"].includes(value)
  },
  align: {
    type: String,
    default: "left",
    validator: (value) => ["left", "center", "right"].includes(value)
  },
  headerAlign: {
    type: String,
    default: "left",
    validator: (value) => ["left", "center", "right"].includes(value)
  },

  // 隱藏欄位
  hidden: {
    type: Array,
    default: () => []
  },

  // 排序相關
  sortable: {
    type: Boolean,
    default: false
  },
  sortField: {
    type: String,
    default: ""
  },
  currentOrder: {
    type: String,
    default: ""
  },
  nativeSort: {
    type: Boolean,
    default: false
  },
  sortBy: {
    type: [String, Function],
    default: null
  },
  remoteSort: {
    type: Boolean,
    default: true
  },
  multiSort: {
    type: Boolean,
    default: false
  },
  sortMethod: {
    type: Function,
    default: null
  },

  // 過濾相關
  filterMultiple: {
    type: Boolean,
    default: true
  },
  filters: {
    type: Array,
    default: () => []
  },
  filterMethod: {
    type: Function,
    default: null
  },
  filterRender: {
    type: Object,
    default: null
  },

  // 顯示相關
  resizable: {
    type: Boolean,
    default: true
  },
  showOverflow: {
    type: [Boolean, String],
    default: "tooltip"
  },
  showHeaderOverflow: {
    type: [Boolean, String],
    default: "tooltip"
  },
  visible: {
    type: Boolean,
    default: true
  },

  // 樣式相關
  className: {
    type: [String, Function],
    default: null
  },
  headerClassName: {
    type: [String, Function],
    default: null
  },

  // 格式化
  formatter: {
    type: [String, Function],
    default: null
  },

  // 列類型
  type: {
    type: String,
    default: null,
    validator: (value) => [null, "selection", "seq", "radio", "checkbox", "expand", "html"].includes(value)
  },

  // 樹節點
  treeNode: {
    type: Boolean,
    default: false
  },

  // 渲染器
  editRender: {
    type: Object,
    default: null
  },
  contentRender: {
    type: Object,
    default: null
  },
  headerRender: {
    type: Object,
    default: null
  },
  footerRender: {
    type: Object,
    default: null
  },

  // 方法
  exportMethod: {
    type: Function,
    default: null
  },
  footerMethod: {
    type: Function,
    default: null
  },
  indexMethod: {
    type: Function,
    default: null
  },
  seqMethod: {
    type: Function,
    default: null
  }
});
const isHidden = computed(() => props.hidden.includes(props.field)); //計算是否隱藏
const isBuiltinType = computed(() => ['selection', 'checkbox', 'radio', 'seq', 'expand'].includes(props.type)); //內建特殊欄位不覆蓋 header
const effectiveSortField = computed(() => props.sortField || props.field); //實際排序欄位
const sortIconName = computed(() => {
  if (!props.sortable) return "sort";
  if (!props.currentOrder) return "sort";
  return props.currentOrder === "asc" ? "sort_asc" : "sort_desc";
}); //排序圖示
const useNativeSort = computed(() => props.sortable && props.nativeSort); //是否使用內建排序

const emit = defineEmits(["select-change", "select-all", "sort-change", "filter-change", "page-change", "toolbar-button-click", "cell-click", "cell-dblclick", "edit-closed", "edit-activated", "sort", "enter"]);
const handleSortClick = () => {
  if (!props.sortable) return;
  let nextOrder = "";
  if (!props.currentOrder) {
    nextOrder = "desc";
  } else if (props.currentOrder === "desc") {
    nextOrder = "asc";
  } else {
    nextOrder = "";
  }
  emit("sort", { field: effectiveSortField.value, order: nextOrder });
}; //自訂排序
const handleHeaderKeyup = (event) => {
  if (event.key !== "Enter") return;
  emit("enter", { field: props.field, value: event.target?.value ?? null });
}; //Enter 觸發搜尋
</script>

<style scoped>
.custom-grid-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.default-header-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.sort-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.sort-trigger:hover {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.08);
}

.sort-trigger svg {
  width: 16px;
  height: 16px;
}
</style>
