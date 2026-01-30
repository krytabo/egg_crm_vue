<!-- src/pages/BasicInfo/Customer/BasePage/DesktopView.vue 客戶/潛在客戶管理（桌面版） -->
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
        <a-button v-if="permissionStore.hasPermission('CUSTOMER', 'CREATE')" type="primary" @click="openCreateDialog">{{ t('newCustomer', '新增客戶') }}</a-button>
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
              <button v-if="permissionStore.hasPermission('CUSTOMER', 'DELETE')" class="table-button" @click="deleteData(row.id)"><Trash2 class="size-4 text-rose-500" /></button>
              <button class="table-button" @click="openDrawer(row)"><ScrollText class="size-4 text-green-500" /></button>
              <button v-if="permissionStore.hasPermission('CUSTOMER', 'UPDATE')" class="table-button" @click="editData(row)"><SquarePen class="size-4" /></button>
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
import { computed, nextTick, onMounted, onUnmounted } from 'vue';
import { TinyInput, TinySelect, TinyCheckbox, TinyBadge, TinyDrawer, TinyTextPopup, TinyForm, TinyFormItem, TinyCheckboxGroup } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomField from '@/components/Form/CustomField.vue';
import { UserRoundSearch, ShoppingCart, Trash2, SquarePen, ScrollText } from 'lucide-vue-next';
import { useContentWidth } from '@/composables/useContentWidth';
import { useSystemStore } from '@/stores/system';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useI18n } from 'vue-i18n';
import { useBasePage } from './useBasePage';

/** Props **/
const props = defineProps({
  pageType: { type: String, default: 'customer', validator: (v) => ['customer', 'prospect'].includes(v) },
});

const { containerRef } = useContentWidth();
const systemStore = useSystemStore();
const permissionStore = usePermissionStore();
const { t } = useI18n();

// 使用共用邏輯
const {
  // 頁面類型
  isProspect,

  // 常數
  orderPageSizeOptions,
  orderStatusColors,

  // 選項
  customerCategories,
  paymentOptions,
  customerTypeOptions,
  customerSegmentOptions,
  customerSourceOptions,
  customerStatusOptions,
  weekDayOptions,
  statusColorMap,
  typeLabelMap,
  segmentLabelMap,
  sourceLabelMap,
  statusLabelMap,
  typeFilterOptions,
  segmentFilterOptions,
  sourceFilterOptions,
  statusFilterOptions,

  // 工具函式
  currency,
  getPrimaryContact,
  formatWeekDays,

  // 篩選相關
  globalSearch,
  filters,
  getColumnOrder,
  handleColumnSort,
  clearGlobalSearch,
  clearFilter,
  handleGlobalSearch,
  handleFiltersChange,

  // 列表相關
  basicDataList,
  pagination,
  pageSizeOptions,
  totalCustomers,
  getAPI,
  CurrentChange,
  SizeChange,

  // 匯入相關
  fileInputRef,
  handleImportSelect,
  handleFileChange,

  // 新增編輯相關
  dialogVisible,
  activeTab,
  isSaving,
  sameAsCompanyInfo,
  basicFormRef,
  basicFormRules,
  isCreate,
  isEdite,
  basicForm,
  categoriesForm,
  deliveryDaysForm,
  customPriceForm,
  openCreateDialog,
  editData,
  closeDialog,
  deleteData,
  saveData,
  handleInvoiceSameAsCompany,

  // 聯絡人操作
  addContact,
  removeContact,
  setPrimaryContact,

  // 客製價格操作
  changeProduct,
  addCustomPrice,
  removeCustomPrice,

  // 訂單相關
  customerData,
  drawerVisible,
  drawerCustomer,
  orderList,
  orderPagination,
  openCustomerData,
  openDrawer,
  handleOrderPageChange,
  handleOrderPageSizeChange,

  // Mock 資料
  generateFakeCustomer,
} = useBasePage(props, t);

// Drawer 內訂單表格高度
const tableHeight = computed(() => {
  const height = window.innerHeight || document.documentElement.clientHeight;
  return height - 500;
});

// 生命週期
const cleanupResize = systemStore.initializeWindowResize();
onUnmounted(cleanupResize);
onMounted(async () => {
  await getAPI();
  await nextTick();
  systemStore.updateTableHeight(320);
});
</script>
