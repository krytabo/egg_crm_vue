<!-- src/pages/inventory-reports/components/CycleCountDialog.vue 盤點作業-->
<template>
  <a-modal v-model:visible="dialogVisible" :title="t('cycleCount', '盤點作業')" width="800px" :mask-closable="false" :closable="!isSaving">
    <perfect-scrollbar class="h-[calc(100vh-300px)] pr-4">
      <AForm ref="formRef" :model="basicForm" :rules="basicFormRules" layout="vertical" auto-label-width>
        <!-- 基本資訊 -->
        <div class="mb-4 grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('countLocation', '盤點位置')" field="location">
            <InfiniteSelect v-model="basicForm.location" dataSource="InventoryLocations" :placeholder="t('pleaseSelect', '請選擇')" @change="handleLocationChange" />
          </AFormItem>
          <AFormItem :label="t('countedBy', '盤點人員')" field="countedBy">
            <InfiniteSelect v-model="basicForm.countedBy" dataSource="users" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
        </div>

        <AFormItem :label="t('notes', '盤點備註')">
          <CustomField v-model="basicForm.notes" type="textarea" :placeholder="t('pleaseEnterNotes', '請輸入備註')" />
        </AFormItem>

        <!-- 盤點項目列表 -->
        <div class="mt-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-medium">{{ t('countItems', '盤點項目') }}</span>
            <a-button size="small" type="primary" @click="addCountItem">{{ t('addProduct', '新增商品') }}</a-button>
          </div>

          <CustomTinyGrid :data="basicForm.items" :height="350" :border="true" row-key="index">
            <CustomTinyGridColumn field="productId" :title="t('product', '商品')" min-width="200" fixed="left">
              <template #default="{ row, rowIndex }">
                <InfiniteSelect v-model="row.productId" dataSource="products" :filters="{ status: 'ACTIVE' }" :placeholder="t('pleaseSelect', '請選擇')" size="small" @change="(val) => handleProductChange(rowIndex, val)" />
              </template>
            </CustomTinyGridColumn>

            <CustomTinyGridColumn field="systemQuantity" :title="t('systemQuantity', '系統數量')" width="140" align="right">
              <template #default="{ row }">
                <span class="text-gray-600">{{ row.systemQuantity ?? '—' }}</span>
              </template>
            </CustomTinyGridColumn>

            <CustomTinyGridColumn field="countedQuantity" :title="t('countedQuantity', '盤點數量')" width="140">
              <template #default="{ row, rowIndex }">
                <a-input-number
                  :model-value="row.countedQuantity"
                  :min="0"
                  size="small"
                  class="w-full"
                  @change="
                    (val) => {
                      basicForm.items[rowIndex].countedQuantity = val;
                      calculateDifference(rowIndex);
                    }
                  "
                />
              </template>
            </CustomTinyGridColumn>

            <CustomTinyGridColumn field="difference" :title="t('difference', '差異')" width="120" align="right">
              <template #default="{ row }">
                <span :class="getDifferenceClass(row.difference)">
                  {{ row.difference !== null ? (row.difference > 0 ? '+' : '') + row.difference : '—' }}
                </span>
              </template>
            </CustomTinyGridColumn>

            <CustomTinyGridColumn :title="t('actions', '操作')" width="80" fixed="right" align="center">
              <template #default="{ rowIndex }">
                <a-button type="text" status="danger" size="small" @click="removeCountItem(rowIndex)">
                  <template #icon><Trash2 class="size-4" /></template>
                </a-button>
              </template>
            </CustomTinyGridColumn>
          </CustomTinyGrid>

          <!-- 無資料提示 -->
          <div v-if="basicForm.items.length === 0" class="rounded-md border border-dashed py-8 text-center text-gray-500">
            {{ t('noCountItems', '尚未新增盤點項目') }}
          </div>

          <!-- 盤點摘要 -->
          <div v-if="basicForm.items.length > 0" class="mt-4 rounded-md bg-gray-50 p-4">
            <div class="grid gap-4 md:grid-cols-4">
              <div>
                <p class="text-sm text-gray-500">{{ t('totalItems', '總項目數') }}</p>
                <p class="text-xl font-semibold">{{ basicForm.items.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ t('itemsWithDifference', '有差異項目') }}</p>
                <p class="text-xl font-semibold" :class="countSummary.diffCount > 0 ? 'text-orange-600' : 'text-green-600'">{{ countSummary.diffCount }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ t('totalIncrease', '總增加') }}</p>
                <p class="text-xl font-semibold text-green-600">+{{ countSummary.totalIncrease }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ t('totalDecrease', '總減少') }}</p>
                <p class="text-xl font-semibold text-red-600">{{ countSummary.totalDecrease }}</p>
              </div>
            </div>
          </div>
        </div>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button :disabled="isSaving" @click="handleClose">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" :disabled="isSaving || basicForm.items.length === 0" :loading="isSaving" @click="handleSubmit">
          {{ isSaving ? t('processing', '處理中') : t('executeCount', '執行盤點') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { InventoryCycleCountPost, InventoryListGet } from '@/assets/API/Inventory';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useI18n } from 'vue-i18n';
import { Trash2 } from 'lucide-vue-next';
import { debounce } from 'lodash';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:visible', 'success']);
const mainStore = useMainStore();
const { t } = useI18n();

/** 對話框狀態 **/
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

/** 表單相關 **/
const formRef = ref(null);
const isSaving = ref(false);
const initializeForm = () => ({
  location: '',
  countedBy: '',
  notes: '',
  items: [],
}); //初始化表單資料
const basicForm = reactive(initializeForm());
const basicFormRules = {
  location: [{ required: true, message: t('required', '此欄位必填') }],
  countedBy: [{ required: true, message: t('required', '此欄位必填') }],
};

/** 盤點項目 **/
const addCountItem = () => {
  basicForm.items.push({
    productId: '',
    productName: '',
    systemQuantity: null,
    countedQuantity: null,
    difference: null,
  });
}; //新增盤點項目
const removeCountItem = (index) => {
  basicForm.items.splice(index, 1);
}; //移除盤點項目
const handleProductChange = async (index, product) => {
  if (!product) {
    basicForm.items[index].systemQuantity = null;
    basicForm.items[index].difference = null;
    return;
  }
  //取得系統庫存數量
  try {
    const productId = product;
    const response = await InventoryListGet({ productId: product?.id, limit: 1 });
    let items = response?.data?.data?.data || [];
    if (!Array.isArray(items)) items = [];
    if (items.length > 0) {
      basicForm.items[index].systemQuantity = items[0].currentStock ?? 0;
      calculateDifference(index);
    }
  } catch (error) {
    console.error('Failed to get product inventory:', error);
  }
}; //產品變更時取得系統庫存
const calculateDifference = (index) => {
  const item = basicForm.items[index];
  if (item.systemQuantity !== null && item.countedQuantity !== null) {
    item.difference = item.countedQuantity - item.systemQuantity;
  } else {
    item.difference = null;
  }
}; //計算差異
const getDifferenceClass = (diff) => {
  if (diff === null) return '';
  if (diff > 0) return 'text-green-600 font-semibold';
  if (diff < 0) return 'text-red-600 font-semibold';
  return 'text-gray-500';
}; //差異樣式
const countSummary = computed(() => {
  let diffCount = 0;
  let totalIncrease = 0;
  let totalDecrease = 0;

  basicForm.items.forEach((item) => {
    if (item.difference !== null && item.difference !== 0) {
      diffCount++;
      if (item.difference > 0) {
        totalIncrease += item.difference;
      } else {
        totalDecrease += item.difference;
      }
    }
  });

  return { diffCount, totalIncrease, totalDecrease };
}); //計算盤點摘要
const handleLocationChange = async (location) => {
  if (!location) return;

  //可選：自動載入該位置的所有產品
  //const locationValue = typeof location === "object" ? location.value : location;
  //...
}; //位置變更處理

/** 提交盤點 **/
const preparePayload = () => {
  const validItems = basicForm.items.filter((item) => item.productId && item.countedQuantity !== null);

  return {
    location: typeof basicForm.location === 'object' ? basicForm.location.value : basicForm.location,
    countedBy: typeof basicForm.countedBy === 'object' ? basicForm.countedBy.id : basicForm.countedBy,
    notes: basicForm.notes || undefined,
    items: validItems.map((item) => ({
      productId: typeof item.productId === 'object' ? item.productId.id : item.productId,
      countedQuantity: Number(item.countedQuantity),
    })),
  };
}; //準備送出資料
const _submitForm = async () => {
  const validateResult = await formRef.value?.validate();
  if (validateResult) return;

  //檢查是否有有效的盤點項目
  const validItems = basicForm.items.filter((item) => item.productId && item.countedQuantity !== null);
  if (validItems.length === 0) {
    await mainStore.SWAL_Error({ message: t('noValidCountItems', '請至少新增一個有效的盤點項目') });
    return;
  }

  mainStore.setLoading(true);
  isSaving.value = true;
  try {
    const payload = preparePayload();
    const response = await InventoryCycleCountPost(payload);

    //顯示盤點結果
    const result = response?.data || {};
    const message = t('cycleCountSuccess', '盤點完成') + `\n${t('adjustedItems', '已調整項目')}: ${result.adjustedItems || 0}\n${t('noChangeItems', '無異常項目')}: ${result.noChangeItems || 0}`;
    await mainStore.SWAL_Success(message);

    dialogVisible.value = false;
    emit('success', result);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
    isSaving.value = false;
  }
}; //提交盤點
const handleSubmit = debounce(_submitForm, 300, { leading: true, trailing: false }); //提交-防抖
const handleClose = () => {
  dialogVisible.value = false;
}; //關閉對話框

/** 重置表單 **/
watch(
  () => props.visible,
  (val) => {
    if (val) {
      //開啟時重置表單
      Object.assign(basicForm, initializeForm());
    }
  },
);
</script>
