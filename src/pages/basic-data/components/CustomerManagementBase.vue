<!-- src/pages/basic-data/components/CustomerManagementBase.vue 客戶管理共用元件 -->
<template>
  <Card ref="containerRef">
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          表頭            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardHeader class="gap-20">
      <div class="flex flex-col">
        <CardTitle>{{ isProspect ? t('potentialListTitle', '潛在客戶列表') : t('listTitle', '客戶列表') }}</CardTitle>
        <p class="text-sm text-gray-500">
          {{ t('totalCount', { total: totalCustomers }, `共 ${totalCustomers} 筆`) }}
        </p>
      </div>
      <div class="flex flex-1 items-center justify-end gap-1">
        <TinyInput
          v-model="globalSearch"
          class="max-w-[620px]!"
          :placeholder="t('globalSearchPlaceholder', '輸入關鍵字搜尋(可搜尋主要聯絡人、公司名稱、公司電話、電子信箱、統一編號、備註)')"
          clearable
          @keyup.enter="handleGlobalSearch"
          @clear="handleGlobalSearch"
        />

        <!-- 匯入 (僅客戶頁面顯示) -->
        <template v-if="!isProspect">
          <input type="file" ref="fileInputRef" class="hidden" @change="handleFileChange" accept=".xlsx, .xls" />
          <a-dropdown @select="handleImportSelect">
            <a-button>{{ $t('匯入匯出') }}</a-button>
            <template #content>
              <a-doption value="Import">{{ $t('ExcelImport', '匯入Excel') }}</a-doption>
              <a-doption value="Download">{{ $t('模板下載', '模板下載') }}</a-doption>
            </template>
          </a-dropdown>
        </template>

        <a-button status="danger" @click="clearFilter">{{ t('clearAllSearch', '清除全部搜尋') }}</a-button>
        <a-button type="primary" @click="openCreateDialog">{{ t('newCustomer', '新增客戶') }}</a-button>
      </div>
    </CardHeader>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          內容            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CardContent class="flex flex-col gap-4">
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--          列表            -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <CustomTinyGrid :data="basicDataList" row-key="id" :height="systemStore.tableHeight" :border="true" :expand-config="{ trigger: 'row', showIcon: true }" :row-id="'id'">
        <CustomTinyGridColumn field="primaryContact" :title="t('primaryContact', '主要聯絡人')" min-width="180" fixed="left">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ getPrimaryContact(row)?.name || t('unset', '未設定') }}</span>
              <span class="text-xs text-gray-500">{{ getPrimaryContact(row)?.phone }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="companyName" :title="t('customerName', '客戶名稱')" min-width="260" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('customerName', '客戶名稱') }}</span>
              <div class="flex items-center gap-1">
                <TinyInput v-model="globalSearch" :placeholder="t('pleaseEnter', '請輸入')" class="h-8 flex-1 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="clearGlobalSearch" />
              </div>
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ row.companyName }}</span>
              <span class="text-xs text-gray-500">{{ row.companyEmail }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="type" :title="t('customerType', '客戶類型')" :width="150" sortable :sort-field="'type'" :current-order="getColumnOrder('type')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('customerType', '客戶類型') }}</span>
              <TinySelect v-model="filters.type" :options="typeFilterOptions" :placeholder="t('pleaseSelect', '請選擇')" clearable @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge type="info">{{ typeLabelMap[row.type] || row.type || '—' }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="segment"
          :title="t('customerSegment', '客戶分類')"
          :width="160"
          sortable
          :sort-field="'segment'"
          :current-order="getColumnOrder('segment')"
          @sort="handleColumnSort"
        >
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('customerSegment', '客戶分類') }}</span>
              <TinySelect v-model="filters.segment" :options="segmentFilterOptions" :placeholder="t('pleaseSelect', '請選擇')" clearable @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ segmentLabelMap[row.segment] || row.segment || '—' }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="source" :title="t('customerSource', '客戶來源')" :width="160" sortable :sort-field="'source'" :current-order="getColumnOrder('source')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('customerSource', '客戶來源') }}</span>
              <TinySelect v-model="filters.source" :options="sourceFilterOptions" :placeholder="t('pleaseSelect', '請選擇')" clearable @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ sourceLabelMap[row.source] || row.source || '—' }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          field="salesRep"
          :title="t('salesRep', '業務負責')"
          :width="180"
          sortable
          :sort-field="'salesRepId'"
          :current-order="getColumnOrder('salesRepId')"
          @sort="handleColumnSort"
        >
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('salesRep', '業務負責') }}</span>
              <InfiniteSelect
                v-model="filters.salesRepId"
                dataSource="users"
                labelKey="fullName"
                type="outline"
                class="w-[130px]!"
                :placeholder="t('pleaseSelect', '請選擇')"
                allowClear
                @change="handleGlobalSearch"
                emitValue
              />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.salesRepId?.fullName || '—' }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="tags" :title="t('tags', '標籤')" min-width="220">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-[#111827]">{{ t('tags', '標籤') }}</span>
              <TinyInput v-model="filters.tags" :placeholder="t('pleaseEnter', '請輸入')" class="w-full" @update:model-value="handleFiltersChange" />
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
          field="createdAt"
          :title="t('createdAt', '建立日期')"
          :width="160"
          sortable
          :sort-field="'createdAt'"
          :current-order="getColumnOrder('createdAt')"
          @sort="handleColumnSort"
        >
          <template #default="{ row }">{{ row.createdAtDisplay }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn
          v-if="!isProspect"
          field="status"
          :title="t('status', '狀態')"
          :width="150"
          align="center"
          fixed="right"
          sortable
          :sort-field="'status'"
          :current-order="getColumnOrder('status')"
          @sort="handleColumnSort"
        >
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-[#111827]">{{ t('status', '狀態') }}</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" :placeholder="t('pleaseSelect', '請選擇')" clearable @clear="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="statusColorMap[row.status] || 'arcoblue'" size="large">{{ statusLabelMap[row.status] || row.status || '—' }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="" :title="t('actions', '操作')" :width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="openDrawer(row)"><ScrollText class="size-4 text-green-500" /></button>
              <button class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
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

  <!--該客戶的訂單API查詢結果-->
  <TinyDrawer dragable :visible="drawerVisible" height="650px" :show-close="true" :title="t('drawerTitle', '客戶詳細')" placement="bottom" @update:visible="(val) => (drawerVisible = val)">
    <template #header>
      <div class="flex items-center gap-2 p-4">
        <p class="text-[22px]">{{ t('drawerTitle', '客戶詳細') }}</p>
        <button @click="openCustomerData" class="cursor-pointer items-center justify-center rounded-full bg-[#f2f3f5] p-2 hover:bg-gray-200 hover:text-[#165dff]">
          <UserRoundSearch strokeWidth="2" size="20" />
        </button>
      </div>
    </template>

    <div v-if="drawerCustomer" class="flex flex-col gap-2">
      <!--基本資料-->
      <div v-if="customerData" class="rounded-[10px] bg-[#f3f8ff] p-4 pb-0">
        <TinyForm label-width="120px" label-position="top" label-suffix="：">
          <div class="grid w-full grid-cols-2">
            <TinyFormItem :label="t('primaryContact', '主要聯絡人')">
              <p class="text-[16px]/5">{{ getPrimaryContact(drawerCustomer)?.name }} / {{ getPrimaryContact(drawerCustomer)?.phone }}</p>
              <p class="text-[15px]/5 text-gray-500">{{ getPrimaryContact(drawerCustomer)?.email }}</p>
            </TinyFormItem>
            <TinyFormItem :label="t('companyInfo', '公司資訊')">
              <p class="text-[16px]/5">{{ drawerCustomer.companyAddress }}</p>
              <p class="text-[15px]/5 text-gray-500">{{ drawerCustomer.companyEmail }}</p>
            </TinyFormItem>
            <TinyFormItem :label="t('expectedDelivery', '預計出貨')">
              <p class="text-[16px]/5">{{ formatWeekDays(drawerCustomer.deliveryDays) }}</p>
            </TinyFormItem>
            <TinyFormItem :label="t('deposit', '訂金')">
              <p class="text-[16px]/5">{{ currency(drawerCustomer.deposit) }}</p>
            </TinyFormItem>
          </div>
        </TinyForm>
      </div>

      <div class="mb-4 flex items-center gap-2 font-[16px]">
        <ShoppingCart strokeWidth="2" size="20" />
        <p class="text-gray-900">{{ t('orderRecordTitle', '客戶訂單記錄') }}</p>
        <TinyBadge type="info" class="ml-2">共 {{ orderPagination.total }} 筆訂單</TinyBadge>
      </div>

      <!--訂單列表-->
      <CustomTinyGrid :data="orderList" size="small" :height="tableHeight">
        <CustomTinyGridColumn field="orderNumber" :title="t('orderCode', '訂單編號')" :width="180" />
        <CustomTinyGridColumn field="targetName" :title="t('targetName', '客戶名稱')" min-width="150" />
        <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" :width="120" align="right">
          <template #default="{ row: orderRow }">{{ currency(orderRow.totalAmount) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="orderDate" :title="t('orderDate', '訂單日期')" :width="130" />
        <CustomTinyGridColumn field="statusLabel" :title="t('status', '狀態')" :width="120">
          <template #default="{ row: orderRow }">
            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs" :class="orderStatusColors[orderRow.status] || 'bg-gray-100 text-gray-600'">
              {{ orderRow.statusLabel }}
            </span>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination
        class="md:w-auto"
        :current="orderPagination.page"
        :page-size="orderPagination.limit"
        :total="orderPagination.total"
        :page-size-options="orderPageSizeOptions"
        @change="handleOrderPageChange"
        @page-size-change="handleOrderPageSizeChange"
      />
    </div>
  </TinyDrawer>

  <!--新增編輯客戶視窗-->
  <a-modal v-model:visible="dialogVisible" :title="isEdite ? t('editCustomer', '編輯客戶') : t('newCustomer', '新增客戶')" :top="30" draggable :maskClosable="false" :closable="false" width="800px">
    <a-tabs type="capsule" v-model:active-key="activeTab" class="mb-3">
      <a-tab-pane key="infoData" :title="t('資本資料', '資本資料')"></a-tab-pane>
      <a-tab-pane key="product" :title="t('productPriceAdjust', '商品價格調整')"></a-tab-pane>
      <a-tab-pane key="contact" :title="t('contactTab', '聯絡人資訊')"></a-tab-pane>
      <a-tab-pane v-if="basicForm.metaForm?.type === 'COMPANY'" key="company" :title="t('companyTab', '公司資訊')"></a-tab-pane>
      <template #extra><a-button type="text" @click="generateFakeCustomer" v-if="isCreate">產生假資料</a-button></template>
    </a-tabs>
    <perfect-scrollbar class="h-[calc(100vh-400px)] px-4">
      <AForm ref="basicFormRef" :model="basicForm" :rules="basicFormRules" auto-label-width layout="vertical">
        <!--資本資料-->
        <template v-if="activeTab === 'infoData'">
          <div class="grid gap-3 md:grid-cols-2">
            <AFormItem :label="t('customerType', '客戶類型')">
              <CustomField v-model="basicForm.metaForm.type" type="select" allowClear :options="customerTypeOptions" />
            </AFormItem>
            <AFormItem :label="t('segmentWithHint', '客戶分類')">
              <CustomField v-model="basicForm.metaForm.segment" type="select" allowClear :options="customerSegmentOptions" />
            </AFormItem>
            <AFormItem :label="t('customerSource', '客戶來源')">
              <CustomField v-model="basicForm.metaForm.source" type="select" allowClear :options="customerSourceOptions" />
            </AFormItem>
            <AFormItem v-if="isEdite && !isProspect" :label="t('status', '狀態')">
              <CustomField v-model="basicForm.metaForm.status" type="select" allowClear :options="customerStatusOptions" />
            </AFormItem>
            <AFormItem :label="t('salesRep', '業務負責')">
              <InfiniteSelect v-model="basicForm.metaForm.salesRepId" dataSource="users" labelKey="fullName" :placeholder="t('salesRepPlaceholder', '選擇業務人員')" allowClear />
            </AFormItem>
            <AFormItem :label="t('tagsWithHint', '標籤 (輸入後按 Enter)')">
              <TinyTextPopup v-model="basicForm.metaForm.tags" :placeholder="t('pleaseEnter', '請輸入')" class="w-full!" />
            </AFormItem>
            <AFormItem :label="t('categoriesMulti', '客戶類別（可多選）')" class="col-span-2">
              <div class="flex items-center gap-0.5">
                <TinyCheckboxGroup v-model="categoriesForm" :options="customerCategories" />
              </div>
            </AFormItem>
            <AFormItem :label="t('deliveryDaysMulti', '出貨星期（可多選）')" class="col-span-2">
              <TinyCheckboxGroup v-model="deliveryDaysForm" :options="weekDayOptions" />
            </AFormItem>
            <AFormItem :label="t('paymentMethod', '收付方式')">
              <CustomField v-model="basicForm.otherForm.paymentMethod" type="select" allowClear :options="paymentOptions" />
            </AFormItem>
            <AFormItem :label="t('deposit', '訂金')">
              <CustomField v-model="basicForm.otherForm.deposit" type="number" :min="0" thousands allowClear />
            </AFormItem>
            <AFormItem :label="t('invoiceTitle', '發票抬頭')">
              <CustomField v-model="basicForm.otherForm.invoiceTitle" type="input" allowClear />
            </AFormItem>
            <AFormItem :label="t('invoiceTaxId', '發票統編')">
              <CustomField v-model="basicForm.otherForm.invoiceTaxId" type="input" allowClear />
            </AFormItem>
            <AFormItem>
              <TinyCheckbox :model-value="sameAsCompanyInfo" @update:model-value="handleInvoiceSameAsCompany">
                {{ t('invoiceSameAsCompany', '同公司資訊') }}
              </TinyCheckbox>
            </AFormItem>
            <AFormItem :label="t('note', '備註')" class="col-span-2">
              <CustomField v-model="basicForm.otherForm.note" type="textarea" allowClear />
            </AFormItem>
          </div>
        </template>

        <template v-if="activeTab === 'product'">
          <AFormItem :label="t('productPriceAdjust', '商品價格調整')" class="col-span-2">
            <template #label>
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ t('productSalePriceSetting', '商品銷售價格設定') }}</p>
                <a-button type="text" @click="addCustomPrice">{{ t('addProductPrice', '新增商品價格') }}</a-button>
              </div>
            </template>
            <p v-if="customPriceForm.length === 0" class="text-xs text-gray-500">
              {{ t('noProductPriceYet', '尚未設定商品價格，點擊上方按鈕新增') }}
            </p>
            <div class="flex w-full flex-col gap-1">
              <template v-for="(item, index) in customPriceForm" :key="item.id">
                <div class="flex items-center gap-2 rounded-md border p-2">
                  <AFormItem :label="t('product', '商品')" class="flex-1">
                    <InfiniteSelect v-model="item.productId" dataSource="products" :placeholder="t('pleaseSelectProduct', '請選擇商品')" @change="(product) => changeProduct(product, index)" />
                  </AFormItem>
                  <AFormItem :label="t('suggestedRetailPriceTWD', '建議售價')" class="flex-1">
                    <p class="h-8 w-full text-right text-[16px]">{{ item.basePriceAmount }}</p>
                  </AFormItem>
                  <AFormItem :label="t('adjustmentAmount', '調整金額')" class="flex-1">
                    <CustomField v-model="item.adjustment" type="number" thousands allowClear />
                  </AFormItem>
                  <AFormItem :label="t('finalPrice', '最終價格')" class="flex-1">
                    <p class="h-8 w-full text-right text-[16px] text-emerald-500">{{ currency((Number(item.basePriceAmount) || 0) + (Number(item.adjustment) || 0)) }}</p>
                  </AFormItem>
                  <a-button type="text" @click="removeCustomPrice(item.id)">{{ t('remove') }}</a-button>
                </div>
              </template>
            </div>
          </AFormItem>
        </template>

        <!--聯絡人資訊-->
        <div v-if="activeTab === 'contact'" class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900">{{ t('contactList', '聯絡人列表') }}</p>
            <a-button type="text" @click="addContact">{{ t('addContact', '新增聯絡人') }}</a-button>
          </div>
          <template v-for="(contact, index) in basicForm.contactsForm" :key="contact.id || index">
            <div class="rounded-[20px] border border-gray-300 px-4 py-3">
              <div class="mb-4 flex items-center gap-2">
                <TinyCheckbox :model-value="contact.isPrimary" @update:model-value="() => setPrimaryContact(index)" :label="t('primaryContact', '主要聯絡人')" />
                <a-button v-if="basicForm.contactsForm.length > 1" type="text" @click="removeContact(index)">{{ t('remove', '移除') }}</a-button>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <AFormItem :label="t('name', '姓名')">
                  <CustomField v-model="basicForm.contactsForm[index].name" type="input" :placeholder="t('name', '姓名')" allowClear />
                </AFormItem>
                <AFormItem :label="t('phone', '電話')">
                  <CustomField v-model="basicForm.contactsForm[index].phone" type="input" :placeholder="t('phone', '電話')" allowClear />
                </AFormItem>
              </div>
              <AFormItem :label="t('address', '地址')">
                <CustomField v-model="basicForm.contactsForm[index].address" type="input" :placeholder="t('address', '地址')" allowClear />
              </AFormItem>
              <AFormItem :label="t('email', '電子信箱')">
                <CustomField v-model="basicForm.contactsForm[index].email" type="email" :placeholder="t('email', '電子信箱')" allowClear />
              </AFormItem>
            </div>
          </template>
        </div>

        <!--公司資訊-->
        <template v-if="activeTab === 'company'">
          <AFormItem :label="t('companyName', '公司名稱')">
            <CustomField v-model="basicForm.companyForm.companyName" type="input" :placeholder="t('companyName', '公司名稱')" allowClear />
          </AFormItem>
          <div class="grid gap-3 md:grid-cols-2">
            <AFormItem :label="t('companyPhone', '公司電話')">
              <CustomField v-model="basicForm.companyForm.companyPhone" type="input" :placeholder="t('companyPhone', '公司電話')" allowClear />
            </AFormItem>
            <AFormItem :label="t('companyEmail', '公司信箱')">
              <CustomField v-model="basicForm.companyForm.companyEmail" type="email" :placeholder="t('companyEmail', '公司信箱')" allowClear />
            </AFormItem>
          </div>
          <AFormItem :label="t('companyAddress', '公司地址')">
            <CustomField v-model="basicForm.companyForm.companyAddress" type="input" :placeholder="t('companyAddress', '公司地址')" allowClear />
          </AFormItem>
          <AFormItem :label="t('taxId', '統一編號')">
            <CustomField v-model="basicForm.companyForm.taxId" type="input" allowClear />
          </AFormItem>
          <AFormItem :label="t('registeredDate', '註冊日期')">
            <CustomField v-model="basicForm.companyForm.registeredDate" type="date-picker" width="220px" allowClear />
          </AFormItem>
        </template>
      </AForm>
    </perfect-scrollbar>

    <template #footer>
      <div class="flex flex-1 items-center justify-center gap-2">
        <a-button size="large" @click="closeDialog">{{ t('cancel', '取消') }}</a-button>
        <Button :disabled="isSaving" @click="saveData" :loading="isSaving">
          {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
        </Button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch, nextTick, onUnmounted, toRaw } from 'vue';
import { OrderListGet } from '@/assets/API/Order';
import { CustomersListGet, CustomersCreatePost, CustomersUpdatePatch, CustomersDeleteById, CustomersGetByID, CustomersImportExcel } from '@/assets/API/Customers';
import { TinyInput, TinySelect, TinyCheckbox, TinyBadge, TinyDrawer, TinyTextPopup, TinyButton, TinyForm, TinyFormItem, TinyDatePicker, TinyCheckboxGroup } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { useContentWidth } from '@/composables/useContentWidth';
import { usePaginatedSearchApi } from '@/composables/usePaginatedSearchApi';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { useMainStore } from '@/stores/LoadingStore';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';

/** Props **/
const props = defineProps({
  pageType: { type: String, default: 'customer', validator: (v) => ['customer', 'prospect'].includes(v) },
});

/** 判斷頁面類型 **/
const isProspect = computed(() => props.pageType === 'prospect');
const defaultStatus = computed(() => (isProspect.value ? 'PROSPECT' : 'ACTIVE'));

const { containerRef } = useContentWidth();
const mainStore = useMainStore();
const systemStore = useSystemStore();
const { t } = useI18n();
const {
  customerCategories,
  paymentOptions,
  customerTypeOptions,
  customerSegmentOptions,
  customerSourceOptions,
  customerStatusOptions,
  weekDayOptions,
  statusColorMap,
  buildLabelMap,
  buildSelectOptionsWithAll,
  formatWeekDays,
} = useSelectOptions();

/** Mock假資料相關 **/
import { UserRoundSearch, ShoppingCart, Trash2, SquarePen, ScrollText } from 'lucide-vue-next';
import { mockProducts } from '@/lib/mock-products';
import { orderStatusColors } from '@/lib/mock-orders';
const randomPhone = () => `09${Math.floor(Math.random() * 90000000 + 10000000)}`;
const generateFakeCustomer = () => {
  const seed = Date.now();
  basicForm.value.contactsForm = [
    { isPrimary: true, name: `聯絡人${seed % 100}`, phone: randomPhone(), address: '台北市中正區', email: `contact${seed}@example.com` },
    { isPrimary: false, name: `助理${seed % 50}`, phone: randomPhone(), address: '台北市信義區', email: `assistant${seed}@example.com` },
  ];
  basicForm.value.companyForm.companyName = `測試有限公司 ${seed % 1000}`;
  basicForm.value.companyForm.companyPhone = '02-1234-5678';
  basicForm.value.companyForm.companyEmail = `company${seed}@mail.com`;
  basicForm.value.companyForm.companyAddress = '台北市信義區忠孝東路 100 號';
  basicForm.value.companyForm.taxId = `${Math.floor(Math.random() * 90000000 + 10000000)}`;
  basicForm.value.companyForm.registeredDate = format(new Date(), 'yyyy-MM-dd');
  basicForm.value.otherForm.paymentMethod = '月結';
  basicForm.value.otherForm.deposit = 20000;
  basicForm.value.otherForm.invoiceTitle = `${basicForm.value.companyForm.companyName} 發票抬頭`;
  basicForm.value.otherForm.invoiceTaxId = basicForm.value.companyForm.taxId;
  basicForm.value.otherForm.note = '此為快速產生的測試資料';
  categoriesForm.value = customerCategories;
  deliveryDaysForm.value = [1, 3, 5];
  customPriceForm.value = [{ id: Date.now(), productId: mockProducts[0]?.id || 'water-1', adjustment: 200 }];
  basicForm.value.metaForm = {
    ...FORM_TEMPLATES.meta,
    type: 'COMPANY',
    segment: 'WHOLESALE',
    source: 'REFERRAL',
    salesRepId: `sales-${seed % 10}`,
    tags: 'VIP,重點客戶',
    status: defaultStatus.value,
  };
};

/** 常數相關 **/
const isCreate = computed(() => dialogMode.value === 'create');
const isEdite = computed(() => dialogMode.value === 'edit');
const orderPageSizeOptions = [5, 10, 20];
const EMPTY_PLACEHOLDER = '未設定';

/** 訂單資料轉換 **/
const orderResponseDataToList = (item = {}) => ({
  id: item.id,
  orderNumber: item.orderNumber,
  targetType: item.targetType || '客戶',
  targetName: item.targetName || item.customer?.name || EMPTY_PLACEHOLDER,
  phone: item.phone || EMPTY_PLACEHOLDER,
  contact: item.contact || EMPTY_PLACEHOLDER,
  paymentMethod: item.paymentMethod || EMPTY_PLACEHOLDER,
  shipMethod: item.shipMethod || EMPTY_PLACEHOLDER,
  employeeName: item.employeeName || EMPTY_PLACEHOLDER,
  totalAmount: item.totalAmount ?? item.totalAmount?.amount ?? 0,
  discount: item.discount ?? 0,
  shippingFee: item.shippingFee ?? 0,
  status: item.status,
  statusLabel: item.status,
  orderDate: item.orderDate,
  shipDate: item.shipDate,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  raw: item,
});
const FORM_TEMPLATES = {
  contact: { isPrimary: true, name: '', phone: '', address: '', email: '' },
  company: { companyName: '', companyPhone: '', companyEmail: '', companyAddress: '', taxId: '', registeredDate: '' },
  other: { paymentMethod: 'MONTHLY', deposit: '', invoiceTitle: '', invoiceTaxId: '', note: '' },
  meta: { type: 'COMPANY', segment: 'RETAIL', source: 'OTHER', salesRepId: '', tags: '', status: 'ACTIVE' },
};
const getDefaultMeta = () => ({ ...FORM_TEMPLATES.meta, status: props.pageType === 'prospect' ? 'PROSPECT' : 'ACTIVE' });
const SORT_FIELD_MAP = {
  name: 'name',
  type: 'type',
  segment: 'segment',
  source: 'source',
  salesRepId: 'salesRepId',
  createdAt: 'createdAt',
  status: 'status',
};

/** 選項相關 **/
const typeLabelMap = computed(() => buildLabelMap(customerTypeOptions.value));
const segmentLabelMap = computed(() => buildLabelMap(customerSegmentOptions.value));
const sourceLabelMap = computed(() => buildLabelMap(customerSourceOptions.value));
const statusLabelMap = computed(() => buildLabelMap(customerStatusOptions.value));
const typeFilterOptions = computed(() => buildSelectOptionsWithAll(customerTypeOptions.value));
const segmentFilterOptions = computed(() => buildSelectOptionsWithAll(customerSegmentOptions.value));
const sourceFilterOptions = computed(() => buildSelectOptionsWithAll(customerSourceOptions.value));
const statusFilterOptions = computed(() => customerStatusOptions.value);

/** 共用工具 **/
const currency = (val) => `NT$${Number(val || 0).toLocaleString('zh-TW', { minimumFractionDigits: 0 })}`;
const getPrimaryContact = (customer) => customer.contacts.find((c) => c.isPrimary) || customer.contacts[0];
const findProductById = (productId) => mockProducts.find((item) => item.id === productId) || null;
const parseTagsInput = (value) =>
  String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
const formatDateValue = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'yyyy-MM-dd');
};
const toggleArrayItem = (array, item) => (array.includes(item) ? array.filter((i) => i !== item) : [...array, item]);

/** 篩選與查詢相關 **/
const globalSearch = ref('');
const sortField = ref('createdAt');
const sortDirection = ref('desc');
const getDefaultFilters = () => ({
  type: 'all',
  segment: 'all',
  source: 'all',
  status: props.pageType === 'prospect' ? 'PROSPECT' : 'ACTIVE',
  salesRepId: '',
  tags: '',
});
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : '');
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
};
const clearGlobalSearch = async () => {
  if (!globalSearch.value) return;
  globalSearch.value = '';
  await handleGlobalSearch();
};
const clearFilter = async () => {
  globalSearch.value = '';
  clearFilterBase();
};

/** 列表資料取得相關 **/
const responseDataToList = (customer = {}) => {
  const customFields = customer.customFields || {};
  const contacts = (
    customFields.contacts?.length
      ? customFields.contacts
      : [
          {
            id: 1,
            isPrimary: true,
            name: customer.contactInfo?.name || customer.name || t('unnamedCustomer', '未命名客戶'),
            phone: customer.contactInfo?.phone || '',
            address: [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(' '),
            email: customer.contactInfo?.email || '',
          },
        ]
  ).map((contact, index) => ({
    id: contact.id ?? index + 1,
    isPrimary: contact.isPrimary ?? index === 0,
    name: contact.name || '',
    phone: contact.phone || '',
    address: contact.address || '',
    email: contact.email || '',
  }));

  return {
    id: customer.id || customer.code || `customer-${Date.now()}`,
    displayCode: customer.code || customer.id,
    type: customer.type || 'COMPANY',
    segment: customer.segment || 'RETAIL',
    source: customer.source || 'OTHER',
    salesRepId: customer.salesRep || '',
    contacts,
    companyName: customer.name || '—',
    companyPhone: customer.contactInfo?.phone || '',
    companyEmail: customer.contactInfo?.email || '',
    companyAddress:
      customFields.companyAddress || [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(' '),
    companyAddressFields: customer.address || {},
    taxId: customer.taxId || '',
    categories: customFields.categories || [],
    paymentMethod: customFields.paymentMethod || '',
    deposit: Number(customFields.deposit ?? 0),
    invoiceTitle: customFields.invoiceTitle || customer.name || '',
    invoiceTaxId: customFields.invoiceTaxId || customer.taxId || '',
    note: customer.notes || '',
    registeredDate: (customFields.registeredDate || customer.createdAt || '').split('T')[0] || '',
    deliveryDays: customer.deliveryDays || [],
    customPrices: customFields.customPrices || [],
    status: customer.status || defaultStatus.value,
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    createdAt: customer.createdAt || '',
    createdAtDisplay: formatDateValue(customer.createdAt),
    orderLookupId: customFields.orderLookupId || customer.id || customer.code,
    raw: customer,
  };
};
const wrappedCustomersListGet = (params) => {
  // 使用 toRaw 解除 reactive 代理，避免 Vue 內部屬性傳入 API
  const rawParams = toRaw(params);
  const processedParams = {};

  // 遍歷並解除每個值的 reactive 代理
  Object.keys(rawParams).forEach((key) => {
    const value = rawParams[key];
    processedParams[key] = typeof value === 'object' && value !== null ? toRaw(value) : value;
  });

  const searchTerm = globalSearch.value?.trim();
  if (searchTerm) processedParams.search = searchTerm;
  if (params.tags) {
    const tagFilters = parseTagsInput(params.tags);
    if (tagFilters.length) {
      processedParams.tags = tagFilters;
    } else {
      delete processedParams.tags;
    }
  }
  if (sortField.value) {
    processedParams.sortBy = SORT_FIELD_MAP[sortField.value] || sortField.value;
    processedParams.sortOrder = sortDirection.value;
  }
  // 潛在客戶固定查詢 PROSPECT，客戶則查詢非 PROSPECT
  if (isProspect.value) {
    processedParams.status = 'PROSPECT';
  }
  return CustomersListGet(processedParams);
};
const {
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  getDefaultAPI,
  handleGlobalSearch,
  handleFiltersChange,
  clearFilter: clearFilterBase,
  CurrentChange,
  SizeChange,
} = usePaginatedSearchApi(wrappedCustomersListGet, getDefaultFilters(), {
  responseDataToList,
});
const totalCustomers = computed(() => pagination.total);
const getAPI = () => getDefaultAPI();
watch(() => [filters.type, filters.segment, filters.source, filters.status], handleFiltersChange);

/** 匯入下載模板相關 **/
const fileInputRef = ref(null);
const handleImportSelect = (value) => {
  if (value === 'Import') fileInputRef.value.click();
};
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);

  try {
    mainStore.setLoading(true);
    await CustomersImportExcel(formData);
    await mainStore.SWAL_Success(`${t('swal.importSuccess')}`);
    await getAPI();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
  event.target.value = '';
};

/** 新增編輯相關 **/
const dialogMode = ref('create');
const dialogVisible = ref(false);
const activeTab = ref('infoData');
const editingCustomerId = ref(null);
const initializeForm = () => ({
  contactsForm: [{ ...FORM_TEMPLATES.contact }],
  companyForm: { ...FORM_TEMPLATES.company },
  otherForm: { ...FORM_TEMPLATES.other },
  metaForm: getDefaultMeta(),
});
const basicForm = ref(initializeForm());
const basicFormRef = ref(null);
const basicFormRules = {};
const categoriesForm = ref([]);
const deliveryDaysForm = ref([]);
const customPriceForm = ref([]);
const isSaving = ref(false);
const detailLoading = ref(false);
const sameAsCompanyInfo = ref(false);
const resetForm = () => {
  basicForm.value = initializeForm();
  categoriesForm.value = [];
  deliveryDaysForm.value = [];
  customPriceForm.value = [];
  activeTab.value = 'infoData';
  basicFormRef.value?.clearValidate?.();
  sameAsCompanyInfo.value = false;
};
const fillFormFromRecord = (record = {}) => {
  basicForm.value.contactsForm = (record.contacts?.length ? record.contacts : [{ isPrimary: true, name: '', phone: '', address: '', email: '' }]).map((contact, index) => ({
    id: contact.id ?? index + 1,
    isPrimary: contact.isPrimary ?? index === 0,
    name: contact.name || '',
    phone: contact.phone || '',
    address: contact.address || '',
    email: contact.email || '',
  }));
  basicForm.value.companyForm = {
    companyName: record.companyName || '',
    companyPhone: record.companyPhone || '',
    companyEmail: record.companyEmail || '',
    companyAddress: record.companyAddress || '',
    taxId: record.taxId || '',
    registeredDate: record.registeredDate || '',
  };
  basicForm.value.otherForm = {
    paymentMethod: record.paymentMethod || '月結',
    deposit: Number(record.deposit ?? 0),
    invoiceTitle: record.invoiceTitle || '',
    invoiceTaxId: record.invoiceTaxId || '',
    note: record.note || '',
  };
  basicForm.value.metaForm = {
    type: record.type || FORM_TEMPLATES.meta.type,
    segment: record.segment || FORM_TEMPLATES.meta.segment,
    source: record.source || FORM_TEMPLATES.meta.source,
    salesRepId: record.salesRepId || '',
    tags: Array.isArray(record.tags) ? record.tags.join(',') : record.tags || '',
    status: record.status || FORM_TEMPLATES.meta.status,
  };
  categoriesForm.value = record.categories || [];
  deliveryDaysForm.value = record.deliveryDays || [];
  customPriceForm.value = (record.customPrices || []).map((item, index) => {
    const product = item.product || null;
    const productId = product?.id || item.productId || '';
    const basePriceAmount = Number(product?.basePriceAmount ?? item.basePriceAmount ?? 0);
    const finalPrice = Number(item.price ?? 0);
    const adjustment = finalPrice ? finalPrice - basePriceAmount : Number(item.adjustment ?? 0);
    return {
      id: item.id ?? index + 1,
      productId: product || productId,
      basePriceAmount,
      adjustment,
    };
  });
};
const handleInvoiceSameAsCompany = (checked) => {
  sameAsCompanyInfo.value = checked;
  if (!checked) return;
  const companyForm = basicForm.value.companyForm || {};
  const otherForm = basicForm.value.otherForm || {};
  otherForm.invoiceTitle = companyForm.companyName || '';
  otherForm.invoiceTaxId = companyForm.taxId || '';
};
const getData = async (id) => {
  if (!id) return;
  detailLoading.value = true;
  try {
    const response = await CustomersGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(responseDataToList(detail));
  } catch (error) {
    console.error(error);
    await mainStore.SWAL_Error(error);
  } finally {
    detailLoading.value = false;
  }
};
const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingCustomerId.value = null;
  resetForm();
  dialogVisible.value = true;
};
const editData = (customer) => {
  dialogMode.value = 'edit';
  editingCustomerId.value = customer.id;
  fillFormFromRecord(customer);
  activeTab.value = 'infoData';
  dialogVisible.value = true;
  getData(customer.id);
};
const closeDialog = () => {
  isSaving.value = false;
  dialogVisible.value = false;
  basicFormRef.value?.clearValidate?.();
};
const deleteData = async (id) => {
  if (!id) return;
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      mainStore.setLoading(true);
      try {
        await CustomersDeleteById(id);
        await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
        if (basicDataList.value.length === 1 && pagination.page > 1) pagination.page -= 1;
        await getAPI();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      } finally {
        mainStore.setLoading(false);
      }
    },
  });
};
const addContact = () => {
  const nextItem = { ...FORM_TEMPLATES.contact, isPrimary: false, id: Date.now() };
  basicForm.value.contactsForm.push(nextItem);
};
const removeContact = (index) => {
  if (basicForm.value.contactsForm.length === 1) return;
  basicForm.value.contactsForm = basicForm.value.contactsForm.filter((_, i) => i !== index);
  if (!basicForm.value.contactsForm.some((contact) => contact.isPrimary) && basicForm.value.contactsForm.length) {
    basicForm.value.contactsForm[0].isPrimary = true;
  }
};
const setPrimaryContact = (index) => {
  basicForm.value.contactsForm = basicForm.value.contactsForm.map((contact, i) => ({ ...contact, isPrimary: i === index }));
};
const changeProduct = (product, index) => {
  if (!product) return;
  const item = customPriceForm.value[index];
  if (!item) return;
  item.basePriceAmount = Number(product.basePriceAmount) || 0;
};
const addCustomPrice = () => {
  customPriceForm.value.push({
    id: Date.now(),
    productId: '',
    basePriceAmount: 0,
    adjustment: 0,
    total: 0,
  });
};
const removeCustomPrice = (id) => {
  customPriceForm.value = customPriceForm.value.filter((item) => item.id !== id);
};
const preparePayload = () => {
  const formContacts = basicForm.value.contactsForm.length ? basicForm.value.contactsForm : [{ ...FORM_TEMPLATES.contact }];
  const primaryContact = formContacts.find((contact) => contact.isPrimary) || formContacts[0];
  const companyForm = basicForm.value.companyForm;
  const otherForm = basicForm.value.otherForm;
  const metaForm = basicForm.value.metaForm || FORM_TEMPLATES.meta;
  const processedCustomPrices = customPriceForm.value
    .filter((item) => item.productId)
    .map((item) => ({
      productId: typeof item.productId === 'object' ? item.productId?.id : item.productId,
      price: (Number(item.basePriceAmount) || 0) + (Number(item.adjustment) || 0),
    }))
    .filter((item) => item.productId);

  const payload = {
    name: companyForm.companyName || primaryContact?.name || t('unnamedCustomer', '未命名客戶'),
    type: metaForm.type || FORM_TEMPLATES.meta.type,
    segment: metaForm.segment || FORM_TEMPLATES.meta.segment,
    source: metaForm.source || FORM_TEMPLATES.meta.source,
    contactInfo: {
      phone: companyForm.companyPhone || primaryContact?.phone || undefined,
      email: companyForm.companyEmail || primaryContact?.email || undefined,
    },
    taxId: companyForm.taxId || undefined,
    notes: otherForm.note || undefined,
    salesRepId: typeof metaForm.salesRepId === 'object' ? metaForm.salesRepId?.id : metaForm.salesRepId || undefined,
    deliveryDays: deliveryDaysForm.value,
    customFields: {
      contacts: formContacts,
      categories: categoriesForm.value,
      paymentMethod: otherForm.paymentMethod,
      deposit: Number(otherForm.deposit || 0),
      invoiceTitle: otherForm.invoiceTitle,
      invoiceTaxId: otherForm.invoiceTaxId,
      customPrices: processedCustomPrices,
      registeredDate: companyForm.registeredDate,
      companyAddress: companyForm.companyAddress,
    },
  };
  const tagValues = parseTagsInput(metaForm.tags);
  if (tagValues.length) payload.tags = tagValues;
  // 潛在客戶新增時固定為 PROSPECT，編輯時保持原狀態
  if (isCreate.value && isProspect.value) {
    payload.status = 'PROSPECT';
  } else if (isEdite.value && metaForm.status) {
    payload.status = metaForm.status;
  }
  return payload;
};
const _submitForm = async () => {
  const validateResult = await basicFormRef.value.validate();
  if (validateResult) return false;
  try {
    const payload = preparePayload();
    isSaving.value = true;
    if (isCreate.value) await CustomersCreatePost(payload);
    if (isEdite.value) await CustomersUpdatePatch(editingCustomerId.value, payload);

    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    await getAPI();
    closeDialog();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  }
};
const saveData = debounce(_submitForm, 300, { leading: true, trailing: false });

/** 訂單相關 (僅客戶頁面使用) **/
const customerData = ref(false);
const drawerVisible = ref(false);
const drawerCustomer = ref(null);
const orderList = ref([]);
const orderPagination = reactive({ page: 1, limit: 20, total: 0 });
const openCustomerData = () => (customerData.value = !customerData.value);

const tableHeight = computed(() => {
  const height = window.innerHeight || document.documentElement.clientHeight;
  return height - 500;
});
const openDrawer = async (customer) => {
  drawerCustomer.value = customer;
  orderPagination.page = 1;
  await loadCustomerOrders(customer.id);
  drawerVisible.value = true;
};
const loadCustomerOrders = async (customerId) => {
  mainStore.setLoading(true);
  const response = await OrderListGet({ customerId, page: orderPagination.page, limit: orderPagination.limit });
  const rawData = response?.data?.data?.data ?? [];
  const metaInfo = response?.data?.data?.pagination ?? {};
  orderList.value = Array.isArray(rawData) ? rawData.map(orderResponseDataToList) : [];
  orderPagination.total = metaInfo.total ?? orderList.value.length;
  orderPagination.page = metaInfo.page ?? orderPagination.page;
  mainStore.setLoading(false);
};
const handleOrderPageChange = async (page) => {
  orderPagination.page = page;
  await loadCustomerOrders(drawerCustomer.value.id);
};
const handleOrderPageSizeChange = async (size) => {
  orderPagination.limit = Number(size);
  orderPagination.page = 1;
  await loadCustomerOrders(drawerCustomer.value.id);
};

const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(320);
});
</script>
