<!-- src/components/ui/AppPagination.vue 共用分頁元件 -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  current: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  showTotal: { type: Boolean, default: true },
  showPageSize: { type: Boolean, default: true },
  simple: { type: Boolean, default: false },
  size: { type: String, default: "medium" },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100, 200, "max"]
  },
  wrapperClass: {
    type: [String, Array, Object],
    default: () => []
  }
});

const emit = defineEmits(["change", "page-size-change", "update:current", "update:pageSize"]);

const normalizedOptions = computed(() =>
  props.pageSizeOptions.map((option) => (typeof option === "object" && option !== null ? option.value : option))
);

const handleChange = (page) => {
  emit("update:current", page);
  emit("change", page);
};

const handlePageSizeChange = (size) => {
  emit("update:pageSize", size);
  emit("page-size-change", size);
};
</script>

<template>
  <div class="app-pagination" :class="wrapperClass">
    <a-pagination
      class="w-full justify-end"
      :current="current"
      :page-size="pageSize"
      :total="total"
      :show-total="showTotal"
      :show-page-size="showPageSize"
      :page-size-options="normalizedOptions"
      :disabled="disabled"
      :simple="simple"
      :size="size"
      @change="handleChange"
      @page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<style scoped>
.app-pagination {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
