<!-- src/pages/product-management/components/ProductManagementBase.vue 產品共用列表 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>{{ categoryLabel }}資料列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ totalProducts }} 筆</p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <a-button @click="toggleSearch">{{ showMoreSearch ? t('collapseSearch', '收合篩選') : t('expandSearch', '展開篩選') }}</a-button>
        <a-button status="danger" plain @click="clearFilter">{{ t('clearAllSearch', '清除全部搜尋') }}</a-button>
        <a-button v-if="permissionStore.hasPermission('PRODUCT', 'CREATE')" type="primary" @click="openCreateDialog">新增{{ categoryLabel }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--         其他搜尋         -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <div class="mb-4 flex items-end gap-3 rounded-md bg-[#f5f7fb] p-4">
        <AForm auto-label-width>
          <AFormItem :label="t('stock', '庫存')">
            <TinyCheckbox :model-value="filters.inStock" @update:model-value="(val) => toggleBooleanFilter('inStock', val)">{{ t('showInStockOnly', '僅顯示有庫存') }}</TinyCheckbox>
            <TinyCheckbox :model-value="filters.lowStock" @update:model-value="(val) => toggleBooleanFilter('lowStock', val)">{{ t('lowReorderPoint', '低於補貨點') }}</TinyCheckbox>
            <TinyCheckbox :model-value="filters.isPerishable" @update:model-value="(val) => toggleBooleanFilter('isPerishable', val)">{{ t('refrigeration', '冷藏需求') }}</TinyCheckbox>
          </AFormItem>
          <Collapsible :isOpen="showMoreSearch">
            <div class="grid grid-cols-2 gap-2">
              <AFormItem :label="t('salePriceAmount', '售價金額')">
                <div class="flex items-center justify-start gap-2">
                  <TinyNumeric v-model="filters.minPrice" :placeholder="t('pleaseEnterMinAmount', '請輸入最低金額')" class="w-full!" @change="handleGlobalSearch" @keyup.enter="handleGlobalSearch" />
                  <TinyNumeric v-model="filters.maxPrice" :placeholder="t('pleaseEnterMaxAmount', '請輸入最高金額')" class="w-full!" @change="handleGlobalSearch" @keyup.enter="handleGlobalSearch" />
                </div>
              </AFormItem>
              <AFormItem :label="t('wholesalePrice', '批發價')">
                <div class="flex items-center justify-start gap-2">
                  <TinyNumeric
                    v-model="filters.minWholesalePrice"
                    :placeholder="t('pleaseEnterMinAmount', '請輸入最低金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                  <TinyNumeric
                    v-model="filters.maxWholesalePrice"
                    :placeholder="t('pleaseEnterMaxAmount', '請輸入最高金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                </div>
              </AFormItem>
              <AFormItem :label="t('cashPrice', '現金價')">
                <div class="flex items-center justify-start gap-2">
                  <TinyNumeric
                    v-model="filters.minCashPrice"
                    :placeholder="t('pleaseEnterMinAmount', '請輸入最低金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                  <TinyNumeric
                    v-model="filters.maxCashPrice"
                    :placeholder="t('pleaseEnterMaxAmount', '請輸入最高金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                </div>
              </AFormItem>
              <AFormItem :label="t('costPrice', '成本價')">
                <div class="flex items-center justify-start gap-2">
                  <TinyNumeric
                    v-model="filters.minCostPrice"
                    :placeholder="t('pleaseEnterMinAmount', '請輸入最低金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                  <TinyNumeric
                    v-model="filters.maxCostPrice"
                    :placeholder="t('pleaseEnterMaxAmount', '請輸入最高金額')"
                    class="w-full!"
                    @change="handleGlobalSearch"
                    @keyup.enter="handleGlobalSearch"
                  />
                </div>
              </AFormItem>
            </div>
          </Collapsible>
        </AForm>
      </div>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--          列表            -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--<JsonViewer :value="basicDataList" boxed copyable />-->
      <CustomTinyGrid :data="basicDataList" row-key="id" :height="systemStore.tableHeight" :border="true" :row-id="'id'">
        <CustomTinyGridColumn
          field="name"
          :title="t('productName', '商品名稱')"
          min-width="240"
          fixed="left"
          sortable
          :sort-field="'name'"
          :current-order="getColumnOrder('name')"
          @sort="handleColumnSort"
          @enter="handleGlobalSearch"
        >
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('productNameWithCategory', { category: categoryLabel }, `${categoryLabel}商品名稱`) }}</span>
              <TinyInput v-model="filters.name" :placeholder="t('pleaseEnterName', '請輸入名稱')" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" clearable />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ row.name }}</span>
              <span class="text-xs text-gray-500">{{ t('codeColon', '代碼：') }}{{ row.code || '—' }}</span>
              <span v-if="row.description" class="text-xs text-gray-500">{{ row.description }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <!--<CustomTinyGridColumn
          field="code"
          :title="t('productCode', '商品編號')"
          :width="160"
          sortable
          :sort-field="'code'"
          :current-order="getColumnOrder('code')"
          @sort="handleColumnSort"
          @enter="handleGlobalSearch"
        >
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('productCode', '商品編號') }}</span>
              <TinyInput v-model="filters.code" :placeholder="t('pleaseEnterCode', '請輸入編號')" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">{{ row.code || '—' }}</template>
        </CustomTinyGridColumn>-->
        <CustomTinyGridColumn field="unit" :title="t('unit', '單位')" :width="180" sortable :sort-field="'unit'" :current-order="getColumnOrder('unit')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('unit', '單位') }}</span>
              <TinyInput v-model="filters.unit" :placeholder="t('pleaseEnter', '請輸入')" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" clearable />
            </div>
          </template>

          <template #default="{ row }">{{ row.unit || defaultUnit || '—' }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="basePrice" :title="t('salePrice', '售價')" :width="200" sortable :sort-field="'basePrice'" :current-order="getColumnOrder('basePrice')" @sort="handleColumnSort">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span>{{ t('suggestedRetailPriceColon', '建議售價：') }}{{ row.basePriceAmount }}</span>
              <span class="text-xs text-gray-500"
                >{{ t('wholesaleColon', '批發：') }}{{ row.wholesalePriceAmount }} / {{ t('cashColon', '現金：') }}{{ row.cashPriceAmount }} / {{ t('成本：', '成本：')
                }}{{ row.costPriceAmount }}</span
              >
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="currentStock"
          :title="t('currentStock', '目前庫存')"
          :width="200"
          sortable
          :sort-field="'currentStock'"
          :current-order="getColumnOrder('currentStock')"
          @sort="handleColumnSort"
        >
          <template #default="{ row }">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-base font-medium text-gray-900">{{ row.currentStock }}</span>
                <TinyTag :color="['#D4183D', '#fff']" v-if="row.currentStock === 0">{{ t('outOfStock', '缺貨') }}</TinyTag>
                <TinyTag v-else-if="isLowStock(row)" type="danger">{{ t('belowReorderPoint', '低於補貨點') }}</TinyTag>
                <!--<TinyTag v-else-if="row.inStock" type="info">有庫存</TinyTag>-->
              </div>
              <span class="text-xs text-gray-500">{{ t('reorderPointColon', '補貨點：') }}{{ row.reorderPoint || '—' }} · {{ t('minStockColon', '最低庫存：') }}{{ row.minStock || '—' }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="vendor"
          :title="t('vendor', '供應商')"
          min-width="250"
          sortable
          :sort-field="'primaryVendorId'"
          :current-order="getColumnOrder('primaryVendorId')"
          @sort="handleColumnSort"
        >
          <template #header>
            <div class="flex w-[190px] flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('vendor', '供應商') }}</span>
              <InfiniteSelect
                v-model="filters.primaryVendorId"
                dataSource="vendors"
                type="outline"
                :placeholder="t('pleaseSelect', '請選擇')"
                allowClear
                @change="handleVendorFilterChange"
                class="w-[180px]"
              />
              <!--<TinySelect v-model="filters.primaryVendorId" :options="vendorFilterOptions" placeholder="全部" class="h-8 text-xs" filterable clearable @update:model-value="handleVendorFilterChange" />-->
            </div>
          </template>
          <template #default="{ row }">{{ row.primaryVendor?.name || '—' }} </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="isPerishable"
          :title="t('refrigeration', '冷藏需求')"
          :width="160"
          align="center"
          sortable
          :sort-field="'isPerishable'"
          :current-order="getColumnOrder('isPerishable')"
          @sort="handleColumnSort"
        >
          <template #default="{ row }">
            <TinyBadge :type="row.isPerishable ? 'info' : 'success'">{{ row.isPerishable ? t('needsRefrigeration', '需冷藏') : t('roomTemperature', '常溫') }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="tags" :title="t('tags', '標籤')" min-width="220">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">{{ t('tags', '標籤') }}</span>
              <TinyInput v-model="filters.tags" :placeholder="t('pleaseEnterKeyword', '請輸入關鍵字')" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" @change="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1 text-xs text-gray-700">
              <span v-for="tag in row.tags" :key="`${row.id}-${tag}`" class="rounded-full bg-gray-100 px-2 py-0.5">{{ tag }}</span>
              <span v-if="!row.tags?.length">—</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="updatedAt"
          :title="t('updatedAt', '更新時間')"
          :width="160"
          sortable
          :sort-field="'updatedAt'"
          :current-order="getColumnOrder('updatedAt')"
          @sort="handleColumnSort"
        >
          <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="status"
          :title="t('status', '狀態')"
          fixed="right"
          :width="150"
          align="center"
          sortable
          :sort-field="'status'"
          :current-order="getColumnOrder('status')"
          @sort="handleColumnSort"
        >
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">{{ t('status', '狀態') }}</span>
              <TinySelect :model-value="filters.status" :options="statusFilterOptions" :placeholder="t('all', '全部')" class="h-8 text-xs" @update:model-value="updateStatusFilter" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="statusColorMap[row.status] || 'arcoblue'" size="large">{{ statusLabelMap[row.status] || row.status }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn :title="t('actions', '操作')" :width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button v-if="permissionStore.hasPermission('PRODUCT', 'DELETE')" class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button v-if="permissionStore.hasPermission('PRODUCT', 'UPDATE')" class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination
        class="md:w-auto"
        :current="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-size-options="pageSizeOptions"
        @change="CurrentChange"
        @page-size-change="SizeChange"
      />
    </CardContent>
  </Card>

  <a-modal v-model:visible="dialogVisible" :title="dialogTitle" draggable :mask-closable="false" width="720px" title-align="start">
    <perfect-scrollbar class="max-h-[600px] px-1">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-align="left" auto-label-width>
        <div v-if="hasFakeData && !editingId" class="mb-3 flex justify-end">
          <Button variant="outline" size="sm" @click="generateFakeData">{{ t('generateFakeData', '生成範例資料') }}</Button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <AFormItem :label="t('productName', '產品名稱')" field="name">
            <CustomField v-model="basicForm.name" type="input" :placeholder="t('pleaseEnter', '請輸入')" allowClear />
          </AFormItem>
          <AFormItem :label="t('unit', '規格')" field="unit">
            <CustomField v-model="basicForm.unit" type="input" :placeholder="t('unitExample', '例：瓶 / 盒 / 包')" allowClear />
          </AFormItem>
          <AFormItem :label="t('suggestedRetailPriceTWD', '建議售價（NT$）')" field="basePrice">
            <CustomField v-model="basicForm.basePrice" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('wholesalePriceTWD', '批發價（NT$）')" field="wholesalePrice">
            <CustomField v-model="basicForm.wholesalePrice" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('cashPriceTWD', '現金價（NT$）')" field="cashPrice">
            <CustomField v-model="basicForm.cashPrice" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('costPriceTWD', '成本價（NT$）')" field="costPrice">
            <CustomField v-model="basicForm.costPrice" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('minStock', '最低庫存')" field="minStock">
            <CustomField v-model="basicForm.minStock" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('maxStock', '最高庫存')" field="maxStock">
            <CustomField v-model="basicForm.maxStock" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('reorderPoint', '補貨點')" field="reorderPoint">
            <CustomField v-model="basicForm.reorderPoint" type="number" placeholder="0" :min="0" allowClear />
          </AFormItem>
          <AFormItem :label="t('vendorId', '供應商 ID')">
            <InfiniteSelect v-model="basicForm.primaryVendorId" dataSource="vendors" :placeholder="t('pleaseSelectVendor', '請選擇供應商')" allowClear />
          </AFormItem>
          <AFormItem :label="t('tags', '標籤')">
            <CustomField v-model="basicForm.tags" type="input" :placeholder="t('tagsCommaSeparated', '標籤（以逗號分隔）')" allowClear />
          </AFormItem>
          <AFormItem :label="t('status', '狀態')">
            <CustomField v-model="basicForm.status" type="select" :options="statusOptions" :placeholder="t('pleaseSelect', '請選擇')" />
          </AFormItem>
        </div>
        <AFormItem :label="t('productDescription', '商品描述')">
          <CustomField v-model="basicForm.description" type="textarea" :rows="3" :placeholder="t('pleaseEnterDescription', '請輸入商品描述')" allowClear />
        </AFormItem>
        <AFormItem :label="t('isPerishable', '是否需冷藏')">
          <TinyCheckbox :model-value="basicForm.isPerishable" @update:model-value="(val) => (basicForm.isPerishable = val)">{{ t('thisProductNeedsRefrigeration', '此商品需冷藏') }}</TinyCheckbox>
        </AFormItem>
      </AForm>
    </perfect-scrollbar>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="dialogVisible = false">{{ t('cancel', '取消') }}</Button>
        <Button :disabled="isSaving" :loading="isSaving" @click="saveData">{{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}</Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ProductCreatePost, ProductDeleteById, ProductGetByID, ProductListGet, ProductUpdatePatch } from '@/assets/API/Product';
import { VendorListGet } from '@/assets/API/Vendor';
import { TinyBadge, TinyButton, TinyCheckbox, TinyInput, TinyNumeric, TinySelect, TinyTag } from '@opentiny/vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Collapsible } from '@kousum/semi-ui-vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import CustomField from '@/components/Form/CustomField.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import { useMainStore } from '@/stores/LoadingStore';
import { useTimezoneStore } from '@/stores/TimezoneStore';
import { useCurrencyStore } from '@/stores/currency';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { SquarePen, Trash2 } from 'lucide-vue-next';
import { debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useSystemStore } from '@/stores/system';
import { usePermissionStore } from '@/stores/PermissionStore';
import { JsonViewer } from 'vue3-json-viewer';

const permissionStore = usePermissionStore();

const props = defineProps({
  categoryId: { type: Number, required: true },
  categoryLabel: { type: String, required: true },
  defaultUnit: { type: String, default: '' },
  defaultPerishable: { type: Boolean, default: false },
  productTypeCode: { type: String, default: 'FINISHED_GOOD' },
  fakeDataType: { type: String, default: '' },
});
const { containerRef } = useContentWidth();
const mainStore = useMainStore();
const timezoneStore = useTimezoneStore();
const currencyStore = useCurrencyStore();
const systemStore = useSystemStore();
const { t } = useI18n();
const { formatCurrencyNumber } = currencyStore;

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create'); //是否為新增模式
const isEdite = computed(() => dialogMode.value === 'edit'); //是否為編輯模式
const sortFieldMap = {
  name: 'name',
  code: 'code',
  unit: 'unit',
  basePrice: 'basePrice',
  currentStock: 'currentStock',
  primaryVendorId: 'primaryVendorId',
  isPerishable: 'isPerishable',
  status: 'status',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
}; //排序欄位映射
const statusColorMap = {
  ACTIVE: 'arcoblue',
  INACTIVE: 'orange',
  DELETED: 'red',
}; //狀態顏色對應
const fakeDataPresets = {
  eggs: {
    name: '新鮮雞蛋 (30顆裝)',
    unit: '盒',
    description: '農場直送新鮮雞蛋，30顆家庭號包裝',
    basePrice: '180',
    wholesalePrice: '150',
    cashPrice: '170',
    costPrice: '120',
    minStock: '10',
    maxStock: '500',
    reorderPoint: '20',
    tags: '新鮮,農場直送,優質',
    isPerishable: true,
  },
  bottledWater: {
    name: '悅氏礦泉水 20L',
    unit: '桶',
    description: '悅氏品牌礦泉水，20公升桶裝，採用天然山泉水源',
    basePrice: '120',
    wholesalePrice: '100',
    cashPrice: '110',
    costPrice: '80',
    minStock: '50',
    maxStock: '1000',
    reorderPoint: '100',
    tags: '悅氏,礦泉水,20L,飲水',
    isPerishable: true,
  },
  waterDispenser: {
    name: 'Panasonic 智能溫控飲水機 TK-AS44',
    unit: '台',
    description: '具備冷熱水功能的智能飲水機，節能設計',
    basePrice: '12800',
    wholesalePrice: '11000',
    cashPrice: '12000',
    costPrice: '9500',
    minStock: '5',
    maxStock: '50',
    reorderPoint: '10',
    tags: 'Panasonic,飲水機,智能溫控',
    isPerishable: false,
  },
}; //假資料預設值

/** 選項相關 **/
const statusOptions = [
  { label: '啟用', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
  { label: '刪除', value: 'DELETED' },
]; //狀態選項
const statusLabelMap = statusOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {}); //狀態顯示文字
const statusFilterOptions = computed(() => [{ label: '全部', value: 'all' }, ...statusOptions]); //狀態篩選選單
const vendorOptions = ref([]); //供應商選項
const vendorFilterOptions = computed(() => [{ label: '全部', value: '' }, ...vendorOptions.value]); //供應商篩選選項
const hasFakeData = computed(() => Boolean(props.fakeDataType && fakeDataPresets[props.fakeDataType])); //是否有假資料
const totalProducts = computed(() => pagination.total); //總筆數

/** 共用工具 **/
const formatCurrency = (value) => formatCurrencyNumber(value); //金額格式化
const formatDate = (value) => {
  if (!value) return t('unset', '未設定');
  return timezoneStore.formatDate(value, 'YYYY-MM-DD') || t('unset', '未設定');
}; //日期格式化
const createPositiveRule = (label, { optional = false, allowZero = false } = {}) => ({
  validator: (value, callback) => {
    if ((value === '' || value === null || value === undefined) && optional) {
      callback();
      return;
    }
    const numeric = Number(value);
    const isNumber = Number.isFinite(numeric);
    const passes = allowZero ? numeric >= 0 : numeric > 0;
    if (!isNumber || !passes) {
      const validationKey = optional ? 'rulePositiveOrEmpty' : allowZero ? 'rulePositiveOrZero' : 'rulePositive';
      const allowZeroLabel = allowZero ? t('greaterThanOrEqualToZero', '需大於或等於 0') : t('positiveNumber', '請輸入正數');
      const validationFallback = optional ? `${label} 可不填或需為正數` : allowZero ? `${label} 需為 0 或正數` : `${label} 需為正數`;
      callback(new Error(t(validationKey, { label, allowZero: allowZeroLabel }, validationFallback)));
      return;
    }
    callback();
  },
  trigger: ['blur', 'change'],
}); //建立正數驗證規則
const buildPricePayload = (amount, { required = false } = {}) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return undefined;
  if (!required && numeric <= 0) return undefined;
  return { amount: numeric, currency: 'TWD' };
}; //組合金額欄位
const isLowStock = (row) => {
  if (!row) return false;
  if (!row.reorderPoint) return false;
  return Number(row.currentStock || 0) < Number(row.reorderPoint || 0);
}; //低庫存判斷
const registerVendorOption = (id, name, code) => {
  if (!id) return;
  if (vendorOptions.value.some((option) => option.value === id)) return;
  const labelName = name || t('unnamedVendor', '未命名供應商');
  const label = code ? `${labelName} (${code})` : labelName;
  vendorOptions.value.push({ label, value: id });
}; //註冊供應商選項
const extractPriceAmount = (product, key) => {
  if (!product) return '';
  if (typeof product[`${key}Amount`] !== 'undefined') return String(product[`${key}Amount`]);
  if (product[key]?.amount !== undefined) return String(product[key].amount);
  return '';
}; //提取價格金額
const loadVendorOptions = async () => {
  try {
    const response = await VendorListGet({ page: 1, limit: 100, isActive: true });
    const payload = response?.data ?? response ?? {};
    const data = payload?.data ?? payload ?? {};
    const items = data?.data ?? data?.items ?? [];
    vendorOptions.value = items.map((vendor) => ({
      label: vendor.name ? `${vendor.name}${vendor.code ? ` (${vendor.code})` : ''}` : vendor.id,
      value: vendor.id,
    }));
  } catch (error) {
    console.error('Failed to load vendor options', error);
  }
}; //載入供應商選項

/** 篩選與查詢相關 **/
const showMoreSearch = ref(false); //其他篩選展開收合
const toggleSearch = () => {
  showMoreSearch.value = !showMoreSearch.value;
  if (showMoreSearch.value) systemStore.updateTableHeight(580);
  if (!showMoreSearch.value) systemStore.updateTableHeight(360);
}; //展開收合
const sortField = ref('createdAt'); //排序欄位
const sortDirection = ref('desc'); //排序方向
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ''); //取得欄位排序狀態
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = 'createdAt';
    sortDirection.value = 'desc';
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getAPI();
}; //切換欄位排序
const toggleBooleanFilter = async (field, value) => {
  filters[field] = Boolean(value);
  await handleGlobalSearch();
}; //切換布林篩選
const updateIsPerishableFilter = async (value) => {
  filters.isPerishable = value;
  await handleGlobalSearch();
}; //更新易腐篩選
const updateStatusFilter = async (value) => {
  filters.status = value;
  await handleGlobalSearch();
}; //更新狀態篩選
const handleVendorFilterChange = async () => {
  await handleGlobalSearch();
}; //供應商篩選變更

/** 取得資料 **/
const defaultFilters = {
  name: '',
  code: '',
  unit: '',
  status: 'all',
  minPrice: '',
  maxPrice: '',
  minWholesalePrice: '',
  maxWholesalePrice: '',
  minCashPrice: '',
  maxCashPrice: '',
  minCostPrice: '',
  maxCostPrice: '',
  primaryVendorId: '',
  isPerishable: 'all',
  tags: '',
  lowStock: false,
  inStock: false,
}; //預設篩選條件
const wrappedProductListGet = (params) => {
  const payload = {
    page: pagination.page,
    limit: pagination.limit,
    categoryId: props.categoryId,
  };

  // 文字篩選
  if (filters.name) payload.name = filters.name;
  if (filters.code) payload.code = filters.code;
  if (filters.unit) payload.unit = filters.unit;
  if (filters.tags) payload.tags = filters.tags;
  if (filters.primaryVendorId?.id) payload.primaryVendorId = filters.primaryVendorId.id;

  // 狀態篩選
  if (filters.status && filters.status !== 'all') payload.status = filters.status;
  if (filters.isPerishable === true) payload.isPerishable = true;
  if (filters.lowStock === true) payload.lowStock = true;
  if (filters.inStock === true) payload.inStock = true;

  // 價格篩選
  if (filters.minPrice) payload.minPrice = Number(filters.minPrice);
  if (filters.maxPrice) payload.maxPrice = Number(filters.maxPrice);
  if (filters.minWholesalePrice) payload.minWholesalePrice = Number(filters.minWholesalePrice);
  if (filters.maxWholesalePrice) payload.maxWholesalePrice = Number(filters.maxWholesalePrice);
  if (filters.minCashPrice) payload.minCashPrice = Number(filters.minCashPrice);
  if (filters.maxCashPrice) payload.maxCashPrice = Number(filters.maxCashPrice);
  if (filters.minCostPrice) payload.minCostPrice = Number(filters.minCostPrice);
  if (filters.maxCostPrice) payload.maxCostPrice = Number(filters.maxCostPrice);

  // 排序
  if (sortField.value) {
    payload.sortBy = sortFieldMap[sortField.value] || sortField.value;
    payload.sortOrder = sortDirection.value;
  }

  return ProductListGet(payload);
};
const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleGlobalSearch,
  clearFilter: _clearFilter,
  CurrentChange,
  SizeChange,
} = usePaginatedSearchApi(wrappedProductListGet, defaultFilters);
const getAPI = () => getDefaultAPI();
const clearFilter = async () => {
  sortField.value = 'createdAt';
  sortDirection.value = 'desc';
  _clearFilter();
}; //清除全部搜尋條件

/** 新增編輯相關 **/
const dialogMode = ref('create');
const dialogVisible = ref(false); //彈窗顯示狀態
const editingId = ref(null); //編輯中的 ID
const basicFormRef = ref(null); //表單參考
const isSaving = ref(false); //儲存中
const initializeForm = () => ({
  name: '', //名稱
  unit: props.defaultUnit || '', //規格
  description: '', //商品描述
  costPrice: '', //成本價
  basePrice: '', //建議售價
  wholesalePrice: '', //批發價
  cashPrice: '', //現金價
  minStock: '', //最低庫存
  maxStock: '', //最高庫存
  reorderPoint: '', //補貨點
  primaryVendorId: '', //供應商
  tags: '', //標籤
  status: 'ACTIVE', //狀態
  isPerishable: props.defaultPerishable, //是否需要冷藏
}); //建立預設表單
const basicForm = ref(initializeForm()); //表單資料
const dialogTitle = computed(() =>
  isEdite.value ? t('editProduct', { category: props.categoryLabel }, `編輯${props.categoryLabel}`) : t('addProduct', { category: props.categoryLabel }, `新增${props.categoryLabel}`),
); //彈窗標題
const basicFormRules = {
  name: [{ required: true, message: t('productNameRequired', '請輸入商品名稱'), trigger: 'blur' }],
  unit: [{ required: true, message: t('unitRequired', '請輸入單位'), trigger: 'blur' }],
  basePrice: [{ required: true, message: t('suggestedRetailPriceRequired', '請輸入建議售價'), trigger: 'blur' }, createPositiveRule(t('suggestedRetailPrice', '建議售價'))],
  wholesalePrice: [createPositiveRule(t('wholesalePrice', '批發價'), { optional: true })],
  cashPrice: [createPositiveRule(t('cashPrice', '現金價'), { optional: true })],
  costPrice: [createPositiveRule(t('cost', '成本'), { optional: true })],
  minStock: [{ required: true, message: t('minStockRequired', '請輸入最低庫存'), trigger: 'blur' }, createPositiveRule(t('minStock', '最低庫存'), { allowZero: true })],
  maxStock: [{ required: true, message: t('maxStockRequired', '請輸入最高庫存'), trigger: 'blur' }, createPositiveRule(t('maxStock', '最高庫存'), { allowZero: true })],
  reorderPoint: [{ required: true, message: t('reorderPointRequired', '請輸入補貨點'), trigger: 'blur' }, createPositiveRule(t('reorderPoint', '補貨點'), { allowZero: true })],
}; //表單驗證規則
const resetForm = () => {
  basicForm.value = initializeForm();
  basicFormRef.value?.clearValidate?.();
}; //重設表單
const applyFakeFormValues = (preset = {}) => {
  Object.entries(preset).forEach(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(basicForm.value, key)) return;
    if (key === 'isPerishable') {
      basicForm.value.isPerishable = Boolean(value);
    } else if (key === 'tags') {
      basicForm.value.tags = String(value);
    } else {
      basicForm.value[key] = value;
    }
  });
}; //套用假資料到表單
const generateFakeData = () => {
  const preset = fakeDataPresets[props.fakeDataType];
  if (!preset) return;
  applyFakeFormValues(preset);
  basicFormRef.value?.clearValidate?.();
  mainStore.SWAL_Success(t('fakeDataApplied', { category: props.categoryLabel }, '已套用範例資料'));
}; //產生假資料
const fillFormFromProduct = (product) => {
  if (!product) return;
  if (product.primaryVendor?.id || product.primaryVendorId) {
    registerVendorOption(product.primaryVendor?.id || product.primaryVendorId, product.primaryVendor?.name || '', product.primaryVendor?.code || product.primaryVendorCode);
  }
  basicForm.value.name = product.name || ''; //名稱
  basicForm.value.unit = product.unit || props.defaultUnit || ''; //規格
  basicForm.value.description = product.description || ''; //商品描述
  basicForm.value.costPrice = Number(product.costPriceAmount); //成本價
  basicForm.value.basePrice = Number(product.basePriceAmount); //建議售價
  basicForm.value.wholesalePrice = Number(product.wholesalePriceAmount); //批發價
  basicForm.value.cashPrice = Number(product.cashPriceAmount); //現金價
  basicForm.value.minStock = Number(product.minStock) ?? 0; //最高庫存
  basicForm.value.maxStock = Number(product.minStock) ?? 0; //最低庫存
  basicForm.value.reorderPoint = Number(product.reorderPoint) ?? 0; //補貨點
  basicForm.value.primaryVendorId = product.primaryVendor || {}; //供應商
  basicForm.value.tags = Array.isArray(product.tags) ? product.tags.join(',') : product.tags || ''; //標籤
  basicForm.value.status = product.status || 'ACTIVE'; //狀態
  basicForm.value.isPerishable = Boolean(product.isPerishable); //是否需要冷藏
}; //表單填入資料
const getData = async (id) => {
  if (!id) return;
  try {
    const response = await ProductGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    fillFormFromProduct(detail);
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
}; //取得單筆詳細資料
const openCreateDialog = () => {
  editingId.value = null;
  resetForm();
  dialogMode.value = 'create';
  dialogVisible.value = true;
}; //開啟新增視窗
const editData = (row) => {
  if (!row?.id) return;
  editingId.value = row.id;
  dialogMode.value = 'edit';
  fillFormFromProduct(row.raw || row);
  dialogVisible.value = true;
  getData(row.id);
}; //開啟編輯視窗
const closeDialog = () => {
  isSaving.value = true;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
}; //關閉彈窗
const preparePayload = () => {
  if (!basicForm.value.name) return null;
  const basePricePayload = buildPricePayload(basicForm.value.basePrice, { required: true });
  if (!basePricePayload) return null;
  const payload = {
    name: basicForm.value.name,
    categoryId: props.categoryId,
    productTypeCode: props.productTypeCode || 'FINISHED_GOOD',
    unit: basicForm.value.unit || props.defaultUnit || '',
    description: basicForm.value.description || undefined,
    basePrice: basePricePayload,
    minStock: Number(basicForm.value.minStock) || 0,
    maxStock: Number(basicForm.value.maxStock) || 0,
    reorderPoint: Number(basicForm.value.reorderPoint) || 0,
    primaryVendorId: basicForm.value.primaryVendorId?.id,
    isPerishable: Boolean(basicForm.value.isPerishable),
  };
  const optionalPrices = {
    wholesalePrice: buildPricePayload(basicForm.value.wholesalePrice),
    cashPrice: buildPricePayload(basicForm.value.cashPrice),
    costPrice: buildPricePayload(basicForm.value.costPrice),
  };
  Object.entries(optionalPrices).forEach(([key, value]) => {
    if (value) payload[key] = value;
  });
  const normalizedTags = String(basicForm.value.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (normalizedTags.length) {
    payload.tags = normalizedTags;
  }
  if (editingId.value) {
    payload.status = basicForm.value.status || 'ACTIVE';
  }
  return payload;
}; //整理表單資料
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return false;

  try {
    isSaving.value = true;
    const payload = preparePayload();
    if (editingId.value) {
      await ProductUpdatePatch(editingId.value, payload);
      await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    } else {
      await ProductCreatePost(payload);
      mainStore.SWAL_Success(t('productAddedSuccessfully', '商品已新增'));
    }
    closeDialog();
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    isSaving.value = false;
  }
}; //儲存商品資料
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖
const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      await ProductDeleteById(id);
      mainStore.SWAL_Success(t('productDeletedSuccessfully', '商品已刪除'));
      if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
      await getAPI();
    },
  });
}; //刪除商品

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await loadVendorOptions();
  await getAPI();

  await nextTick();
  systemStore.updateTableHeight(360);
});
</script>

<style scoped>
.tiny-form-item {
  margin-bottom: 4px !important;
}
</style>
