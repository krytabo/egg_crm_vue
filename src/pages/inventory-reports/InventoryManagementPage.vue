<!-- src/pages/inventory-reports/InventoryManagementPage.vue 商品庫存管理 -->
<template>
  <Card>
    <!--表頭-->
    <CardHeader>
      <div class="flex flex-1 flex-col">
        <CardTitle>庫存異動記錄</CardTitle>
        <p class="text-sm text-gray-500">共 {{ filteredTransactions.length }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <Button type="danger" plain @click="clearFilters">清除篩選</Button>
        <Button @click="createDialogVisible = true">新增異動</Button>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <div class="grid grid-cols-4 gap-2 rounded-[20px] bg-[#f2f3f5] p-4">
        <div class="flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white p-3">
          <p>總庫存數量</p>
          <div class="flex items-end gap-1 text-3xl font-semibold text-gray-900">
            <P>{{ stats.totalStock }}</P>
            <p class="text-xs text-gray-500">件</p>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white p-3">
          <p>商品品項</p>
          <div class="flex items-end gap-1 text-3xl font-semibold text-gray-900">
            <P>{{ stats.productCount }}</P>
            <p class="text-xs text-gray-500">種</p>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white p-3">
          <p>低於安全庫存</p>
          <div class="flex items-end gap-1 text-3xl font-semibold text-orange-500">
            <P>{{ stats.lowStockCount }}</P>
            <TriangleAlert v-if="stats.lowStockCount > 0" />
            <p class="text-xs text-gray-500">項商品</p>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white p-3">
          <p>本月異動</p>
          <div class="flex items-end gap-1 text-3xl font-semibold text-gray-900">
            <P>{{ stats.monthTransactions }}</P>
            <p class="text-xs text-gray-500">筆（{{ stats.totalProductItems }} 項商品）</p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border">
        <table class="min-w-full divide-y">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-12 p-3 text-center">
                <TinyCheckbox :model-value="isPageFullySelected" :indeterminate="isPageIndeterminate" @update:model-value="(val) => toggleSelectAll(Boolean(val))" />
              </th>
              <th class="w-12 p-3" />
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>異動ID</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('id')">
                      <IconArrowUp v-if="!isSortActive('id') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('id') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else :class="['tiny-svg-size', 'text-primary-500']" />
                    </TinyButton>
                  </div>
                  <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.id" @update:model-value="(val) => handleFilterChange('id', val)" />
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>異動類型</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('transactionType')">
                      <IconArrowUp v-if="!isSortActive('transactionType') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('transactionType') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                  <TinySelect class="h-7 text-xs" :model-value="filters.transactionType" :options="transactionFilterOptions" @update:model-value="(val) => handleFilterChange('transactionType', val)" />
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>單據類型</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('relatedType')">
                      <IconArrowUp v-if="!isSortActive('relatedType') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('relatedType') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                  <TinySelect class="h-7 text-xs" :model-value="filters.relatedType" :options="relatedFilterOptions" @update:model-value="(val) => handleFilterChange('relatedType', val)" />
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>關聯對象</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('relatedName')">
                      <IconArrowUp v-if="!isSortActive('relatedName') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('relatedName') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                  <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.relatedName" @update:model-value="(val) => handleFilterChange('relatedName', val)" />
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">商品數</th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>訂單編號</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('orderId')">
                      <IconArrowUp v-if="!isSortActive('orderId') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('orderId') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                  <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.orderId" @update:model-value="(val) => handleFilterChange('orderId', val)" />
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex items-center gap-1">
                  <span>異動日期</span>
                  <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('transactionDate')">
                    <IconArrowUp v-if="!isSortActive('transactionDate') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('transactionDate') ? 'text-primary-500' : 'text-gray-400']" />
                    <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                  </TinyButton>
                </div>
              </th>
              <th class="p-3 text-left text-xs font-medium text-gray-500">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <span>操作人員</span>
                    <TinyButton type="text" class="!h-auto !p-0" @click="toggleSort('operatorName')">
                      <IconArrowUp v-if="!isSortActive('operatorName') || sortConfig.direction === 'asc'" :class="['tiny-svg-size', isSortActive('operatorName') ? 'text-primary-500' : 'text-gray-400']" />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                  <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.operatorName" @update:model-value="(val) => handleFilterChange('operatorName', val)" />
                </div>
              </th>
              <th class="p-3 text-right text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="!paginatedTransactions.length">
              <td colspan="11" class="p-6 text-center text-sm text-gray-500">沒有符合條件的異動記錄</td>
            </tr>
            <template v-for="transaction in paginatedTransactions" :key="transaction.id">
              <tr class="hover:bg-gray-50">
                <td class="p-3 text-center">
                  <TinyCheckbox :model-value="isSelected(transaction.id)" @update:model-value="() => toggleSelect(transaction.id)" />
                </td>
                <td class="p-3 text-center">
                  <TinyButton type="text" class="!p-0" @click="toggleExpand(transaction.id)">
                    <IconChevronDown v-if="isExpanded(transaction.id)" class="tiny-svg-size" />
                    <IconChevronRight v-else class="tiny-svg-size" />
                  </TinyButton>
                </td>
                <td class="p-3 text-sm text-gray-700">{{ transaction.id }}</td>
                <td class="p-3">
                  <TinyBadge :type="transactionTypeColors[transaction.transactionType]">{{ transaction.transactionType }}</TinyBadge>
                </td>
                <td class="p-3">
                  <TinyBadge :type="relatedTypeBadges[transaction.relatedType]">{{ transaction.relatedType }}</TinyBadge>
                </td>
                <td class="p-3 text-sm text-gray-700">{{ transaction.relatedName || "-" }}</td>
                <td class="p-3">
                  <TinyBadge type="info">{{ transaction.products.length }} 項</TinyBadge>
                </td>
                <td class="p-3 text-sm text-gray-700">{{ transaction.orderId || "-" }}</td>
                <td class="p-3 text-sm text-gray-600">{{ transaction.transactionDate }}</td>
                <td class="p-3 text-sm text-gray-700">{{ transaction.operatorName }}</td>
                <td class="p-3 text-right">
                  <TinyButton type="text" @click="requestDelete(transaction.id)">
                    <IconDelete class="tiny-svg-size text-red-500" />
                  </TinyButton>
                </td>
              </tr>
              <tr v-if="isExpanded(transaction.id)">
                <td colspan="11" class="bg-gray-50 p-6">
                  <div class="space-y-4">
                    <div>
                      <h4 class="mb-2 font-medium text-gray-800">商品明細</h4>
                      <div class="overflow-x-auto rounded-md border bg-white">
                        <table class="min-w-full divide-y text-sm">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="p-2 text-left text-xs font-medium text-gray-500">商品類型</th>
                              <th class="p-2 text-left text-xs font-medium text-gray-500">商品名稱</th>
                              <th class="p-2 text-left text-xs font-medium text-gray-500">變動數量</th>
                              <th class="p-2 text-left text-xs font-medium text-gray-500">異動前庫存</th>
                              <th class="p-2 text-left text-xs font-medium text-gray-500">異動後庫存</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y">
                            <tr v-for="product in transaction.products" :key="`${transaction.id}-${product.productId}`">
                              <td class="p-2">
                                <TinyBadge type="info">{{ product.productCategory }}</TinyBadge>
                              </td>
                              <td class="p-2 text-sm text-gray-800">{{ product.productName }}</td>
                              <td class="p-2">
                                <div :class="['flex items-center gap-1', product.changeAmount > 0 ? 'text-green-600' : 'text-red-600']">
                                  <IconArrowUp v-if="product.changeAmount > 0" class="tiny-svg-size" />
                                  <IconArrowDown v-else class="tiny-svg-size" />
                                  {{ formatChangeAmount(product.changeAmount) }}
                                </div>
                              </td>
                              <td class="p-2 text-sm text-gray-700">{{ product.stockBefore }}</td>
                              <td class="p-2 text-sm text-gray-700">{{ product.stockAfter }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 class="mb-1 font-medium text-gray-800">原因備註</h4>
                      <p class="text-sm text-gray-600">{{ transaction.reasonNote || "—" }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span class="text-sm text-gray-600">顯示第 {{ showingRange.start || 0 }} - {{ showingRange.end || 0 }} 筆，共 {{ showingRange.total }} 筆</span>
        <AppPagination :current="currentPage" :page-size="pageSize" :total="showingRange.total" :show-total="false" :show-page-size="false" @change="handlePageChange" />
      </div>
    </CardContent>
  </Card>

  <DialogTiny v-model:visible="createDialogVisible" title="新增庫存異動" resize width="520px">
    <template #footer>
      <div class="flex justify-end gap-2">
        <TinyButton type="text" @click="createDialogVisible = false">取消</TinyButton>
        <TinyButton type="primary" @click="handleCreateTransaction">儲存異動</TinyButton>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700">
            異動類型
            <span class="text-red-500">*</span>
          </p>
          <TinySelect :model-value="formData.transactionType" :options="transactionFormOptions" @update:model-value="handleTransactionTypeChange" />
          <p class="text-xs text-gray-500">
            <span v-if="formData.transactionType === '進貨'">從廠商採購進貨</span>
            <span v-else-if="formData.transactionType === '出貨'">手動出貨給員工或廠商</span>
            <span v-else-if="formData.transactionType === '調整'">人工調整庫存（破損、遺失）</span>
            <span v-else>盤點差異調整帳面</span>
          </p>
        </div>
        <div v-if="formData.transactionType === '出貨'" class="space-y-2">
          <p class="text-sm font-medium text-gray-700">
            出貨對象類型
            <span class="text-red-500">*</span>
          </p>
          <TinySelect :model-value="formData.shipmentTargetType" :options="shipmentTargetOptions" @update:model-value="handleShipmentTargetTypeChange" />
          <p class="text-xs text-gray-500">選擇此次出貨的對象</p>
        </div>
        <div v-if="formData.transactionType === '進貨' || formData.transactionType === '出貨'" class="space-y-2 md:col-span-2">
          <p class="text-sm font-medium text-gray-700">
            {{ formData.transactionType === "進貨" ? "廠商名稱" : formData.shipmentTargetType === "員工" ? "員工名稱" : "廠商名稱" }}
            <span class="text-red-500">*</span>
          </p>
          <TinySelect :model-value="formData.relatedId" placeholder="請選擇" :options="relatedOptions.map((option) => ({ label: option.name, value: option.id }))" @update:model-value="(val) => (formData.relatedId = val)" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <p class="text-sm font-medium text-gray-700">原因備註</p>
          <TinyInput type="textarea" rows="3" placeholder="可補充本次異動原因" :model-value="formData.reasonNote" @update:model-value="(val) => (formData.reasonNote = val)" />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <h4 class="text-base font-semibold text-gray-800">異動商品</h4>
        <TinyButton type="text" class="gap-1" @click="addProductRow">
          <IconAdd class="tiny-svg-size" />
          新增商品
        </TinyButton>
      </div>

      <p v-if="!formProducts.length" class="text-sm text-gray-500">尚未新增商品，請點擊「新增商品」。</p>

      <div v-else class="space-y-3">
        <div v-for="product in formProducts" :key="product.uid" class="space-y-3 rounded-lg border p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <TinySelect class="md:w-2/3" placeholder="選擇商品" :model-value="product.productId" :options="productOptions" @update:model-value="(val) => handleProductSelect(product.uid, val)" />
              <TinyInput class="md:w-1/3" type="number" placeholder="變動數量（可為負數）" :model-value="product.changeAmount" @update:model-value="(val) => handleProductAmountChange(product.uid, val)" />
            </div>
            <TinyButton type="text" @click="removeProductRow(product.uid)">
              <IconDelete class="tiny-svg-size text-red-500" />
            </TinyButton>
          </div>
          <p class="text-xs text-gray-500">目前庫存：{{ getProductCurrentStock(product.productId) }}</p>
        </div>
      </div>
    </div>
  </DialogTiny>
  <DialogTiny v-model:visible="deleteDialogVisible" title="刪除確認" width="420px">
    <template #footer>
      <div class="flex justify-end gap-2">
        <TinyButton type="text" @click="deleteDialogVisible = false">取消</TinyButton>
        <TinyButton type="danger" @click="confirmDelete">確認刪除</TinyButton>
      </div>
    </template>
    <p class="text-sm text-gray-600">
      {{ deleteTargetId ? "確定要刪除此筆庫存異動記錄嗎？此操作無法復原。" : `確定要刪除選中的 ${selectedCount} 筆異動記錄嗎？此操作無法復原。` }}
    </p>
  </DialogTiny>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DialogTiny from "@/components/ui/DialogTiny.vue";
import { TriangleAlert } from "lucide-vue-next";
import { Input as TinyInput } from "@/components/ui/input";
import { Select as TinySelect } from "@/components/ui/select";
import { Checkbox as TinyCheckbox } from "@/components/ui/checkbox";
import { DialogBox as TinyDialogBox } from "@/components/ui/dialog-box";
import { Badge as TinyBadge } from "@/components/ui/badge";
import AppPagination from "@/components/ui/AppPagination.vue";
import { IconAdd, IconDelete, IconChevronDown, IconChevronRight, IconWarningTriangle, IconArrowUp, IconArrowDown } from "@opentiny/vue-icon";
import Notify from "@opentiny/vue-notify";

/** 常數設定 **/
const mockEmployees = [
  { id: 1, name: "張小明" },
  { id: 2, name: "李美玲" },
  { id: 3, name: "王大華" },
  { id: 4, name: "陳小玉" }
];
const mockVendors = [
  { id: 1, name: "清泉水業有限公司", category: "桶裝水" },
  { id: 2, name: "優質電器行", category: "飲水機" },
  { id: 3, name: "幸福農場", category: "雞蛋" },
  { id: 4, name: "山泉水業", category: "桶裝水" }
];
const initialProducts = [
  { id: 1, name: "清泉 20L", category: "桶裝水", currentStock: 120, minStock: 50, maxStock: 200 },
  { id: 2, name: "純淨 20L", category: "桶裝水", currentStock: 80, minStock: 50, maxStock: 200 },
  { id: 3, name: "山泉 12L", category: "桶裝水", currentStock: 25, minStock: 30, maxStock: 150 },
  { id: 4, name: "紅殼蛋 10入", category: "雞蛋", currentStock: 95, minStock: 100, maxStock: 300 },
  { id: 5, name: "白殼蛋 10入", category: "雞蛋", currentStock: 150, minStock: 100, maxStock: 300 },
  { id: 6, name: "WD-2000 桌上型", category: "飲水機", currentStock: 6, minStock: 10, maxStock: 30 },
  { id: 7, name: "WD-3000 立式冰溫熱", category: "飲水機", currentStock: 12, minStock: 10, maxStock: 30 }
];
const initialTransactions = [
  {
    id: 1,
    transactionType: "出貨",
    relatedType: "客戶訂單",
    relatedId: 1,
    relatedName: "王大明",
    orderId: "ORD-2024-001",
    products: [
      { productCategory: "桶裝水", productId: 1, productName: "清泉 20L", changeAmount: -10, stockBefore: 130, stockAfter: 120 },
      { productCategory: "雞蛋", productId: 4, productName: "紅殼蛋 10入", changeAmount: -20, stockBefore: 115, stockAfter: 95 }
    ],
    reasonNote: "客戶訂單出貨",
    transactionDate: "2025-01-20 14:30",
    operatorId: 1,
    operatorName: "張小明"
  },
  {
    id: 2,
    transactionType: "進貨",
    relatedType: "廠商進貨單",
    relatedId: 1,
    relatedName: "清泉水業有限公司",
    orderId: null,
    products: [
      { productCategory: "桶裝水", productId: 2, productName: "純淨 20L", changeAmount: 50, stockBefore: 30, stockAfter: 80 },
      { productCategory: "桶裝水", productId: 3, productName: "山泉 12L", changeAmount: 30, stockBefore: 25, stockAfter: 55 }
    ],
    reasonNote: "月初補貨",
    transactionDate: "2025-01-15 10:00",
    operatorId: 3,
    operatorName: "王大華"
  },
  {
    id: 3,
    transactionType: "調整",
    relatedType: "人工調整",
    relatedId: null,
    relatedName: "王大華",
    orderId: null,
    products: [{ productCategory: "桶裝水", productId: 3, productName: "山泉 12L", changeAmount: -5, stockBefore: 30, stockAfter: 25 }],
    reasonNote: "發現破損品，調整庫存",
    transactionDate: "2025-01-10 16:20",
    operatorId: 3,
    operatorName: "王大華"
  },
  {
    id: 4,
    transactionType: "盤點",
    relatedType: "人工盤點",
    relatedId: null,
    relatedName: "李美玲",
    orderId: null,
    products: [
      { productCategory: "飲水機", productId: 6, productName: "WD-2000 桌上型", changeAmount: -2, stockBefore: 8, stockAfter: 6 },
      { productCategory: "飲水機", productId: 7, productName: "WD-3000 立式冰溫熱", changeAmount: -1, stockBefore: 13, stockAfter: 12 }
    ],
    reasonNote: "月底盤點，實際庫存少於帳面",
    transactionDate: "2024-10-30 17:00",
    operatorId: 2,
    operatorName: "李美玲"
  },
  {
    id: 5,
    transactionType: "出貨",
    relatedType: "客戶訂單",
    relatedId: 2,
    relatedName: "李美華",
    orderId: null,
    products: [{ productCategory: "雞蛋", productId: 5, productName: "白殼蛋 10入", changeAmount: -15, stockBefore: 165, stockAfter: 150 }],
    reasonNote: "手動出貨給員工",
    transactionDate: "2024-11-02 09:15",
    operatorId: 1,
    operatorName: "張小明"
  }
];
const transactionTypeColors = { 進貨: "success", 出貨: "warning", 調整: "info", 盤點: "danger" };
const relatedTypeBadges = { 廠商進貨單: "success", 客戶訂單: "info", 人工調整: "warning", 人工盤點: "primary" };

/** 狀態管理 **/
const productsState = ref(initialProducts.map((product) => ({ ...product })));
const transactions = ref(initialTransactions.map((transaction) => ({ ...transaction })));
const filters = reactive({ id: "", transactionType: "all", relatedType: "all", relatedName: "", operatorName: "", orderId: "" });
const sortConfig = ref({ key: "", direction: "asc" });
const currentPage = ref(1);
const pageSize = 10;
const selectedIds = ref(new Set());
const expandedIds = ref(new Set());
const createDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const deleteTargetId = ref(null);
const formData = reactive({ transactionType: "進貨", shipmentTargetType: "員工", relatedId: null, reasonNote: "" });
const formProducts = ref([]);

/** 選項資料 **/
const transactionFilterOptions = [
  { label: "全部", value: "all" },
  { label: "進貨", value: "進貨" },
  { label: "出貨", value: "出貨" },
  { label: "調整", value: "調整" },
  { label: "盤點", value: "盤點" }
];
const relatedFilterOptions = [
  { label: "全部", value: "all" },
  { label: "廠商進貨單", value: "廠商進貨單" },
  { label: "客戶訂單", value: "客戶訂單" },
  { label: "人工調整", value: "人工調整" },
  { label: "人工盤點", value: "人工盤點" }
];
const transactionFormOptions = [
  { label: "進貨（庫存增加）", value: "進貨" },
  { label: "出貨（庫存減少）", value: "出貨" },
  { label: "調整（人工修正）", value: "調整" },
  { label: "盤點（盤點差異）", value: "盤點" }
];
const shipmentTargetOptions = [
  { label: "員工", value: "員工" },
  { label: "廠商", value: "廠商" }
];

/** 計算資料 **/
const relatedOptions = computed(() => {
  if (formData.transactionType === "進貨") return mockVendors;
  if (formData.transactionType === "出貨") return formData.shipmentTargetType === "員工" ? mockEmployees : mockVendors;
  return [];
});
const productOptions = computed(() => productsState.value.map((product) => ({ label: `${product.category} · ${product.name}`, value: product.id })));
const stats = computed(() => {
  const totalStock = productsState.value.reduce((sum, product) => sum + product.currentStock, 0);
  const lowStockCount = productsState.value.filter((product) => product.currentStock < product.minStock).length;
  const monthTransactions = transactions.value.length;
  const totalProductItems = transactions.value.reduce((sum, transaction) => sum + transaction.products.length, 0);
  return { totalStock, lowStockCount, monthTransactions, totalProductItems, productCount: productsState.value.length };
});
const filteredTransactions = computed(() => {
  const idFilter = filters.id.trim();
  const relatedNameFilter = filters.relatedName.trim().toLowerCase();
  const operatorFilter = filters.operatorName.trim().toLowerCase();
  const orderFilter = filters.orderId.trim().toLowerCase();

  let data = [...transactions.value];
  data = data.filter((transaction) => {
    if (idFilter && !String(transaction.id).includes(idFilter)) return false;
    if (filters.transactionType !== "all" && transaction.transactionType !== filters.transactionType) return false;
    if (filters.relatedType !== "all" && transaction.relatedType !== filters.relatedType) return false;
    if (relatedNameFilter && !(transaction.relatedName || "").toLowerCase().includes(relatedNameFilter)) return false;
    if (operatorFilter && !(transaction.operatorName || "").toLowerCase().includes(operatorFilter)) return false;
    if (orderFilter && !(transaction.orderId || "").toLowerCase().includes(orderFilter)) return false;
    return true;
  });

  if (!sortConfig.value.key) return data;

  return data.sort((a, b) => {
    const { key, direction } = sortConfig.value;
    const dir = direction === "asc" ? 1 : -1;
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)));
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredTransactions.value.slice(start, start + pageSize);
});
const selectedCount = computed(() => selectedIds.value.size);
const isPageFullySelected = computed(() => paginatedTransactions.value.length > 0 && paginatedTransactions.value.every((transaction) => selectedIds.value.has(transaction.id)));
const isPageIndeterminate = computed(() => selectedCount.value > 0 && !isPageFullySelected.value && paginatedTransactions.value.some((transaction) => selectedIds.value.has(transaction.id)));
const showingRange = computed(() => {
  if (!filteredTransactions.value.length) return { start: 0, end: 0, total: 0 };
  const start = (currentPage.value - 1) * pageSize + 1;
  const end = Math.min(currentPage.value * pageSize, filteredTransactions.value.length);
  return { start, end, total: filteredTransactions.value.length };
});

/** 監聽設定 **/
watch(
  () => filteredTransactions.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    if (!filteredTransactions.value.length) currentPage.value = 1;
  }
);
watch(createDialogVisible, (visible) => {
  if (!visible) resetForm();
});

/** 工具函式 **/
const currency = (val) => `NT$${Number(val || 0).toLocaleString()}`;
const formatChangeAmount = (amount) => (amount > 0 ? `+${amount}` : amount);
const getProductCurrentStock = (productId) => {
  const matched = productsState.value.find((item) => item.id === productId);
  return matched ? `${matched.currentStock} 件` : "尚未選擇";
};
const isSortActive = (field) => sortConfig.value.key === field;
const isExpanded = (id) => expandedIds.value.has(id);
const isSelected = (id) => selectedIds.value.has(id);

/** 操作方法 **/
const handleFilterChange = (key, value) => {
  filters[key] = value;
  currentPage.value = 1;
};
const toggleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value = { key, direction: sortConfig.value.direction === "asc" ? "desc" : "asc" };
  } else {
    sortConfig.value = { key, direction: "asc" };
  }
};
const toggleSelectAll = (checked) => {
  const next = new Set(selectedIds.value);
  if (checked) paginatedTransactions.value.forEach((transaction) => next.add(transaction.id));
  else paginatedTransactions.value.forEach((transaction) => next.delete(transaction.id));
  selectedIds.value = next;
};
const toggleSelect = (id) => {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
};
const toggleExpand = (id) => {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
};
const clearFilters = () => {
  filters.id = "";
  filters.transactionType = "all";
  filters.relatedType = "all";
  filters.relatedName = "";
  filters.operatorName = "";
  filters.orderId = "";
  currentPage.value = 1;
};
const resetForm = () => {
  formData.transactionType = "進貨";
  formData.shipmentTargetType = "員工";
  formData.relatedId = null;
  formData.reasonNote = "";
  formProducts.value = [];
};
const handleTransactionTypeChange = (val) => {
  formData.transactionType = val;
  formData.relatedId = null;
  if (val !== "出貨") formData.shipmentTargetType = "員工";
};
const handleShipmentTargetTypeChange = (val) => {
  formData.shipmentTargetType = val;
  formData.relatedId = null;
};
const addProductRow = () => {
  formProducts.value = [...formProducts.value, { uid: `${Date.now()}-${Math.random()}`, productId: null, productCategory: "", changeAmount: 0 }];
};
const removeProductRow = (uid) => {
  formProducts.value = formProducts.value.filter((product) => product.uid !== uid);
};
const updateProductRow = (uid, field, value) => {
  formProducts.value = formProducts.value.map((product) => (product.uid === uid ? { ...product, [field]: value } : product));
};
const handleProductSelect = (uid, productId) => {
  const numericId = typeof productId === "number" ? productId : Number(productId);
  updateProductRow(uid, "productId", Number.isNaN(numericId) ? null : numericId);
  const matched = productsState.value.find((product) => product.id === numericId);
  updateProductRow(uid, "productCategory", matched?.category || "");
};
const handleProductAmountChange = (uid, value) => {
  updateProductRow(uid, "changeAmount", Number(value) || 0);
};
const handleCreateTransaction = () => {
  if (!formProducts.value.length) {
    Notify({ type: "warning", title: "請至少新增一個商品" });
    return;
  }
  for (const product of formProducts.value) {
    if (!product.productId) {
      Notify({ type: "warning", title: "請選擇所有商品" });
      return;
    }
    if (!product.changeAmount) {
      Notify({ type: "warning", title: "請輸入商品變動數量" });
      return;
    }
  }
  if (formData.transactionType === "進貨" && !formData.relatedId) {
    Notify({ type: "warning", title: "請選擇廠商" });
    return;
  }
  if (formData.transactionType === "出貨" && !formData.relatedId) {
    Notify({ type: "warning", title: formData.shipmentTargetType === "員工" ? "請選擇員工" : "請選擇廠商" });
    return;
  }

  let relatedType = "人工調整";
  let relatedName = "";
  if (formData.transactionType === "進貨") {
    relatedType = "廠商進貨單";
    relatedName = mockVendors.find((vendor) => vendor.id === formData.relatedId)?.name || "";
  } else if (formData.transactionType === "出貨") {
    relatedType = "客戶訂單";
    if (formData.shipmentTargetType === "員工") relatedName = mockEmployees.find((employee) => employee.id === formData.relatedId)?.name || "";
    else relatedName = mockVendors.find((vendor) => vendor.id === formData.relatedId)?.name || "";
  } else if (formData.transactionType === "盤點") {
    relatedType = "人工盤點";
    relatedName = "張小明";
  } else {
    relatedName = "張小明";
  }

  const productsPayload = formProducts.value.map((item) => {
    const product = productsState.value.find((prod) => prod.id === item.productId);
    const changeAmount = Number(item.changeAmount);
    const stockBefore = product.currentStock;
    const stockAfter = stockBefore + changeAmount;
    product.currentStock = stockAfter;
    return {
      productCategory: product.category,
      productId: product.id,
      productName: product.name,
      changeAmount,
      stockBefore,
      stockAfter
    };
  });

  const nextId = transactions.value.length ? Math.max(...transactions.value.map((transaction) => transaction.id)) + 1 : 1;
  const newTransaction = {
    id: nextId,
    transactionType: formData.transactionType,
    relatedType,
    relatedId: formData.relatedId || null,
    relatedName,
    orderId: null,
    products: productsPayload,
    reasonNote: formData.reasonNote,
    transactionDate: new Date().toISOString().replace("T", " ").slice(0, 16),
    operatorId: 1,
    operatorName: "張小明"
  };

  transactions.value = [newTransaction, ...transactions.value];
  createDialogVisible.value = false;
  resetForm();
  Notify({ type: "success", title: "庫存異動新增成功" });
};
const requestDelete = (id) => {
  deleteTargetId.value = id;
  deleteDialogVisible.value = true;
};
const confirmDelete = () => {
  if (deleteTargetId.value) {
    transactions.value = transactions.value.filter((transaction) => transaction.id !== deleteTargetId.value);
    const next = new Set(selectedIds.value);
    next.delete(deleteTargetId.value);
    selectedIds.value = next;
    deleteTargetId.value = null;
  } else if (selectedIds.value.size) {
    transactions.value = transactions.value.filter((transaction) => !selectedIds.value.has(transaction.id));
    selectedIds.value = new Set();
  }
  deleteDialogVisible.value = false;
  Notify({ type: "success", title: "異動記錄已刪除" });
};
const handleBulkDelete = () => {
  if (!selectedIds.value.size) return;
  deleteTargetId.value = null;
  deleteDialogVisible.value = true;
};
const handlePageChange = (page) => {
  const target = Math.min(Math.max(1, page), totalPages.value);
  currentPage.value = target;
};
</script>
