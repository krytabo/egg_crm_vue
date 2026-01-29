<!-- src/components/Form/PermissionTreeSelect.vue 權限樹狀選擇器 -->
<template>
  <div v-if="hideTrigger" class="tree-select-panel" ref="dropdownRef">
    <div class="flex items-center justify-between border-b px-3 py-2">
      <span class="text-sm text-gray-500">共 {{ totalPermissions }} 項權限</span>
      <button v-if="selectedBadges.length" class="text-xs text-blue-600 hover:underline" @click="clearSelection">清除全部</button>
    </div>
    <div class="tree-container" ref="listRef">
      <template v-if="!loading">
        <template v-for="group in permissionGroups" :key="group.resource">
          <div class="group-header">
            <TinyCheckbox :modelValue="group.isAllSelected" :indeterminate="group.isPartial" @update:model-value="(val) => toggleGroup(group, val)">
              <span class="font-medium">{{ group.label }}</span>
            </TinyCheckbox>
          </div>
          <div class="group-actions">
            <button v-for="node in group.children" :key="node.value" class="action-row" :class="{ selected: isSelected(node.value) }" @click="toggleValue(node.value)">
              <TinyCheckbox :modelValue="isSelected(node.value)" @update:model-value.stop="() => toggleValue(node.value)" />
              <span class="ml-2 flex-1 text-left text-sm">{{ node.label }}</span>
            </button>
          </div>
        </template>
        <p v-if="!permissionGroups.length" class="py-8 text-center text-sm text-gray-400">尚無權限資料</p>
      </template>
      <div v-else class="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
        <i class="ri-loader-4-line animate-spin"></i>
        <span>載入中...</span>
      </div>
    </div>
  </div>
  <div v-else class="relative w-full" ref="triggerRef">
    <button type="button" class="tree-select-trigger" :class="{ 'is-open': isOpen, disabled }" :disabled="disabled" @click="toggleDropdown">
      <template v-if="selectedBadges.length">
        <div class="flex flex-1 flex-wrap items-center gap-1">
          <span v-for="badge in visibleBadges" :key="badge.value" class="tag-chip">{{ badge.label }}</span>
          <span v-if="exceedCount > 0" class="tag-chip">+{{ exceedCount }}</span>
        </div>
        <button v-if="allowClear" class="clear-btn" @click.stop="clearSelection"><i class="ri-close-circle-line" /></button>
      </template>
      <template v-else>
        <span class="placeholder">{{ placeholder }}</span>
      </template>
      <i class="ri-arrow-down-s-line ml-auto text-base"></i>
    </button>

    <teleport to="body">
      <div v-if="isOpen" class="tree-select-dropdown" :style="dropdownStyle" ref="dropdownRef">
        <div class="flex items-center justify-between border-b px-3 py-2">
          <span class="text-sm text-gray-500">共 {{ totalPermissions }} 項權限</span>
          <button v-if="selectedBadges.length" class="text-xs text-blue-600 hover:underline" @click="clearSelection">清除全部</button>
        </div>
        <div class="tree-container" ref="listRef">
          <template v-if="!loading">
            <template v-for="group in permissionGroups" :key="group.resource">
              <div class="group-header">
                <TinyCheckbox :modelValue="group.isAllSelected" :indeterminate="group.isPartial" @update:model-value="(val) => toggleGroup(group, val)">
                  <span class="font-medium">{{ group.label }}</span>
                </TinyCheckbox>
              </div>
              <div class="group-actions">
                <button v-for="node in group.children" :key="node.value" class="action-row" :class="{ selected: isSelected(node.value) }" @click="toggleValue(node.value)">
                  <TinyCheckbox :modelValue="isSelected(node.value)" @update:model-value.stop="() => toggleValue(node.value)" />
                  <span class="ml-2 flex-1 text-left text-sm">{{ node.label }}</span>
                </button>
              </div>
            </template>
            <p v-if="!permissionGroups.length" class="py-8 text-center text-sm text-gray-400">尚無權限資料</p>
          </template>
          <div v-else class="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
            <i class="ri-loader-4-line animate-spin"></i>
            <span>載入中...</span>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { TinyCheckbox } from "@opentiny/vue";
import { PermissionListGet } from "@/assets/API/Permission";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "選擇權限"
  },
  allowClear: {
    type: Boolean,
    default: true
  },
  hideTrigger: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["update:modelValue", "change"]);

/** 權限名稱對應相關 **/
const RESOURCE_LABELS = {
  USER: "使用者管理",
  ROLE: "角色管理",
  CUSTOMER: "客戶管理",
  ORDER: "訂單管理",
  PRODUCT: "產品管理",
  INVENTORY: "庫存管理",
  BILLING: "帳務管理",
  VENDOR: "供應商管理",
  VEHICLE: "車輛管理",
  DRIVER: "司機管理",
  REPORT: "報表管理",
  FILE: "檔案管理",
  NOTIFICATION: "通知管理",
  KPI: "KPI 儀表板"
};
const ACTION_LABELS = {
  CREATE: "新增",
  READ: "讀取/查詢",
  UPDATE: "更新",
  DELETE: "刪除",
  EXPORT: "匯出",
  IMPORT: "匯入"
};

const triggerRef = ref(null);
const dropdownRef = ref(null);
const listRef = ref(null);
const isOpen = ref(false);
const loading = ref(false);
const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });
const permissionGroups = ref([]);
const totalPermissions = ref(0);
const valueLabelMap = ref(new Map());

const selectedValues = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));
const selectedBadges = computed(() => selectedValues.value.map((value) => ({ value, label: valueLabelMap.value.get(value) || value })));
const visibleBadges = computed(() => selectedBadges.value.slice(0, 3));
const exceedCount = computed(() => Math.max(0, selectedBadges.value.length - 3));

/** 取得資料相關 **/
const normalizeListResponse = (response) => {
  const responseData = response?.data ?? response ?? {};
  const payload = responseData?.data ?? responseData ?? {};
  const items = payload?.data ?? payload?.items ?? [];
  const meta = payload?.meta ?? payload?.pagination ?? {};
  return { items: Array.isArray(items) ? items : [], meta };
};
const buildGroups = (items = []) => {
  const groupMap = new Map();
  items.forEach((item) => {
    if (!item?.id) return;
    const resource = item.resource || "UNKNOWN";
    if (!groupMap.has(resource)) {
      groupMap.set(resource, {
        resource,
        label: RESOURCE_LABELS[resource] || resource,
        children: []
      });
    }
    const group = groupMap.get(resource);
    const label = `${ACTION_LABELS[item.action] || item.action}（${item.action}）`;
    group.children.push({ value: item.id, label, action: item.action });
    valueLabelMap.value.set(item.id, `${group.label}／${label}`);
  });
  permissionGroups.value = [...groupMap.values()].map((group) => ({
    ...group,
    children: group.children.sort((a, b) => a.label.localeCompare(b.label))
  }));
  totalPermissions.value = items.length;
  syncGroupSelection();
};
const syncGroupSelection = () => {
  permissionGroups.value = permissionGroups.value.map((group) => {
    const selectedCount = group.children.filter((child) => isSelected(child.value)).length;
    return {
      ...group,
      isAllSelected: selectedCount === group.children.length && selectedCount > 0,
      isPartial: selectedCount > 0 && selectedCount < group.children.length
    };
  });
};
const gatAPI = async () => {
  loading.value = true;
  try {
    const limit = 50;
    let page = 1;
    let hasNext = true;
    const allItems = [];
    while (hasNext) {
      const response = await PermissionListGet({ page, limit });
      const { items, meta } = normalizeListResponse(response);
      allItems.push(...items);
      if (meta?.hasNext || (meta?.totalPages && page < meta.totalPages)) {
        page += 1;
      } else {
        hasNext = false;
      }
    }
    buildGroups(allItems);
  } catch (error) {
    console.error("PermissionTreeSelect load error", error);
  } finally {
    loading.value = false;
  }
}; //取得資料

/** 選單相關 **/
const toggleDropdown = async () => {
  if (props.disabled || props.hideTrigger) return;
  if (isOpen.value) {
    closeDropdown();
    return;
  }
  isOpen.value = true;
  await nextTick();
  updateDropdownPosition();
  if (!permissionGroups.value.length) await gatAPI();
  document.addEventListener("mousedown", handleOutsideClick);
}; //選單開關
const closeDropdown = () => {
  isOpen.value = false;
  document.removeEventListener("mousedown", handleOutsideClick);
}; //關閉選單
const updateDropdownPosition = () => {
  const rect = triggerRef.value?.getBoundingClientRect();
  if (!rect) return;
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  };
};
const handleOutsideClick = (event) => {
  if (dropdownRef.value?.contains(event.target) || triggerRef.value?.contains(event.target)) return;
  closeDropdown();
};
const isSelected = (value) => selectedValues.value.includes(value);
const toggleValue = (value) => {
  if (!value) return;
  let newValue = [];
  if (isSelected(value)) {
    newValue = selectedValues.value.filter((item) => item !== value);
  } else {
    newValue = [...selectedValues.value, value];
  }
  emit("update:modelValue", newValue);
  emit("change", newValue);
  syncGroupSelection();
};
const toggleGroup = (group, checked) => {
  if (!group?.children?.length) return;
  const childIds = group.children.map((child) => child.value);
  let newValue = [...selectedValues.value];
  if (checked) {
    childIds.forEach((id) => {
      if (!newValue.includes(id)) newValue.push(id);
    });
  } else {
    newValue = newValue.filter((value) => !childIds.includes(value));
  }
  emit("update:modelValue", newValue);
  emit("change", newValue);
  syncGroupSelection();
};
const clearSelection = () => {
  emit("update:modelValue", []);
  emit("change", []);
  syncGroupSelection();
};
watch(
  () => props.modelValue,
  () => syncGroupSelection(),
  { deep: true }
);
watch(
  () => props.hideTrigger,
  (isHidden) => {
    if (isHidden) {
      closeDropdown();
      if (!permissionGroups.value.length) gatAPI();
    }
  }
);

onMounted(() => {
  if (props.hideTrigger || selectedValues.value.length) gatAPI();
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutsideClick);
});
</script>

<style scoped>
.tree-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
}
.tree-select-trigger:hover {
  border-color: #9ca3af;
}
.tree-select-trigger.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.tree-select-trigger.is-open {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.12);
}
.tree-select-panel {
  width: 100%;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
.placeholder {
  color: #9ca3af;
}
.tag-chip {
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}
.clear-btn {
  margin-left: 4px;
  color: #9ca3af;
}
.tree-select-dropdown {
  position: absolute;
  z-index: 999999;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-height: 420px;
  width: 320px;
}
.tree-container {
  max-height: 360px;
  overflow-y: auto;
}
.group-header {
  padding: 8px 12px 4px;
  background: #f8fafc;
}
.group-actions {
  padding-bottom: 4px;
}
.action-row {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 4px 12px 4px 20px;
  font-size: 13px;
  color: #374151;
}
.action-row.selected {
  background: #eff6ff;
}
</style>
