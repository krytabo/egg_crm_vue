<!-- src/pages/inventory-reports/DataList/DesktopView.vue 司機送貨報表-列表（電腦版） -->
<template>
  <Card>
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--        統計卡片區         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <div class="grid grid-cols-4 gap-3 rounded-md bg-[#f5f7fb] p-4">
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('todayReports', '今日報表') }}</p>
        <div class="flex items-end gap-2">
          <p class="text-2xl font-semibold text-gray-900">{{ summaryData.todayReports }}</p>
          <p class="text-gray-500">{{ t('count', '筆') }}</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <p class="text-[18px]">{{ t('todayAmount', '今日總額') }}</p>
        <p class="text-2xl font-semibold text-blue-600">NT$ {{ formatNumber(summaryData.todayAmount) }}</p>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <div class="flex gap-1 items-end">
          <p class="text-[18px]">{{ t('totalReports', '總報表數') }}</p>
          <p class="text-xs text-gray-400">{{ t('(搜尋加總)', '(搜尋加總)') }}</p>
        </div>
        <div class="flex items-end gap-2">
          <p class="text-2xl font-semibold text-gray-900">{{ summaryData.totalReports }}</p>
          <p class="text-gray-500">{{ t('count', '筆') }}</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-start gap-2 rounded-md bg-white p-2">
        <div class="flex gap-1 items-end">
          <p class="text-[18px]">{{ t('totalAmount', '累計金額') }}</p>
          <p class="text-xs text-gray-400">{{ t('(搜尋加總)', '(搜尋加總)') }}</p>
        </div>

        <p class="text-2xl font-semibold text-green-600">NT$ {{ formatNumber(summaryData.totalAmount) }}</p>
      </div>
    </div>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--         篩選區塊         -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <CustomForm :col="4">
      <CustomFormItem :label="t('driver', '司機')">
        <InfiniteSelect v-model="filters.driverId" dataSource="drivers" :placeholder="t('all', '全部')" type="outline" allowClear @change="handleFiltersChange" />
      </CustomFormItem>
      <CustomFormItem :label="t('startDate', '起始日期')">
        <TinyDatePicker v-model="filters.reportDateFrom" :placeholder="t('selectDate', '請選擇日期')" value-format="yyyy-MM-dd" clearable @change="handleFiltersChange" class="w-full" />
      </CustomFormItem>
      <CustomFormItem :label="t('endDate', '結束日期')">
        <TinyDatePicker v-model="filters.reportDateTo" :placeholder="t('selectDate', '請選擇日期')" value-format="yyyy-MM-dd" clearable @change="handleFiltersChange" class="w-full" />
      </CustomFormItem>
      <CustomFormItem :label="t('status', '狀態')">
        <TinySelect v-model="filters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable @change="handleFiltersChange" />
      </CustomFormItem>
    </CustomForm>
    <div class="flex items-center gap-2 mt-2">
      <a-button @click="toggleAllRowExpansion">{{ allExpanded ? t('collapseAll', '全部收合') : t('expandAll', '全部展開') }}</a-button>

      <TinyTooltip type="info" :content="t('deliveryReportHint', '點擊列表行展開明細，可將未轉入的商品使用「轉入訂單」建立或加入訂單。')" placement="right">
        <i class="ri-question-fill text-[20px] text-rose-500" />
      </TinyTooltip>

      <div class="flex items-center gap-2 flex-1 justify-end">
        <a-button @click="batchPrintSlip" class="flex items-center gap-1">
          <Printer :size="14" />
          {{ t('batchPrintSlip', '批次列印三聯單') }}
        </a-button>
        <a-button @click="openExportDialog">{{ t('exportExcel', '匯出Excel') }}</a-button>
        <a-button status="danger" @click="clearFilter">{{ t('clearFilter', '清除篩選') }}</a-button>
        <a-button type="primary" @click="openCreateDialog">
          <i class="ri-add-line mr-1" />
          {{ t('addDeliveryReport', '新增出貨日報表') }}
        </a-button>
      </div>
    </div>

    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!--          列表            -->
    <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
    <!-- trigger: 'row' 代表整列都可以點擊展開收合 -->
    <CustomTinyGrid ref="reportGridRef" :data="basicDataList" :height="TableScrollY" row-key="id" :expand-config="{ trigger: 'cell' }" @toggle-expand-change="handleExpandChange">
      <CustomTinyGridColumn field="" title="" type="selection" :width="50" />
      <CustomTinyGridColumn field="" title="" type="expand" :width="50">
        <template #default="{ row }">
          <div class="bg-gray-50 p-4 flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <p class="text-[17px]">{{ t('productDetails', '商品明細') }}</p>
              <a-button status="success" @click="handleConvertToOrder(row)">{{ t('convertToOrder', '轉入訂單') }}</a-button>
            </div>
            <a-table :data="row.products" :bordered="false" :pagination="false" size="small">
              <template #columns>
                <a-table-column :title="t('customer', '客戶')" data-index="customer" fixed="left" :min-width="200">
                  <template #cell="{ record }">{{ record.customer?.name }}</template>
                </a-table-column>
                <a-table-column :title="t('productName', '商品名稱')" data-index="product" :min-width="200">
                  <template #cell="{ record }">{{ record.product?.name }}</template>
                </a-table-column>

                <a-table-column :title="t('quantity', '數量')" data-index="quantity" :width="120" align="right" />
                <a-table-column :title="t('unitPrice', '單價')" :width="150" align="right">
                  <template #cell="{ record }">NT$ {{ formatNumber(record.unitPrice) }}</template>
                </a-table-column>
                <a-table-column :title="t('amount', '金額')" :width="150" align="right">
                  <template #cell="{ record }">NT$ {{ formatNumber(record.amount) }}</template>
                </a-table-column>
                <a-table-column :title="t('paymentMethod', '付款方式')" :width="150">
                  <template #cell="{ record }">{{ paymentDisplayMap[record.paymentMethod] || record.paymentMethod || '—' }}</template>
                </a-table-column>
                <a-table-column :title="t('status', '狀態')" :width="180" align="center">
                  <template #cell="{ record }">
                    <a-tag v-if="record.isConvertedToOrder" color="green">{{ t('converted', '已轉入') }}</a-tag>
                    <a-tag v-else color="orange">{{ t('notConverted', '未轉入') }}</a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="employeeName" :title="t('employeeName', '員工姓名')" :min-width="120" />
      <CustomTinyGridColumn field="reportDate" :title="t('reportDate', '報表日期')" :width="180" sortable />
      <CustomTinyGridColumn field="weekDays" :title="t('deliveryDays', '出貨星期')" min-width="150" />
      <CustomTinyGridColumn field="totalAmount" :title="t('totalAmount', '總金額')" :width="180" align="right" sortable>
        <template #default="{ row }">NT$ {{ formatNumber(row.totalAmount) }}</template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="status" :title="t('status', '狀態')" :width="120" align="center">
        <template #default="{ row }">
          <a-tag v-if="row.status === '草稿'" color="gray" size="large">{{ t('draft', '草稿') }}</a-tag>
          <a-tag v-else-if="row.status === '已提交'" color="blue" size="large">{{ t('submitted', '已提交') }}</a-tag>
          <a-tag v-else-if="row.status === '已審核'" color="green" size="large">{{ t('approved', '已審核') }}</a-tag>
          <a-tag v-else-if="row.status === '已退回'" color="red" size="large">{{ t('rejected', '已退回') }}</a-tag>
          <span v-else>{{ row.status }}</span>
        </template>
      </CustomTinyGridColumn>
      <CustomTinyGridColumn field="" :title="t('actions', '操作')" :width="210" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <a-button :disabled="!canReviewReport(row)" class="px-0.5!" type="text" status="success" @click.stop="handleCheck(row)">{{ t('review', '審核') }}</a-button>
            <a-button :disabled="!canDeleteReport(row)" class="px-0.5!" type="text" status="danger" @click.stop="handleDelete(row)">{{ t('delete', '刪除') }}</a-button>
            <a-button class="px-0.5! flex items-center gap-0.5" type="text" status="normal" @click.stop="printSlip(row)" :title="t('printSlip', '列印三聯單')">
              <!--<Printer :size="14" />-->
              {{ t('triplicateSlip', '三聯單') }}
            </a-button>
            <a-button class="px-0.5!" type="text" status="normal" @click.stop="handleEdit(row)">{{ isViewOnlyReport(row) ? t('view', '檢視') : t('edit', '編輯') }}</a-button>
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
  </Card>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       新增報表彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <DailyShippingReportEnhanced v-model="createDialogVisible" @reportCreated="handleReportCreated" />

  <!-- 送貨日報表三聯單列印元件（常駐 DOM，不使用 v-if） -->
  <div class="hidden">
    <DeliveryReportSlip ref="slipRef" :orders="slipReports" />
  </div>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       列印預覽彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="printDialogVisible" width="900px" :closable="false" :fullscreen="printFullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ t('printReport', '列印報表') }}</div>
        <button v-if="!printFullscreen" class="-ml-8!" @click="printFullscreen = true"><Expand /></button>
        <button v-if="printFullscreen" class="-ml-8!" @click="printFullscreen = false"><Shrink /></button>
      </div>
    </template>
    <div class="space-y-4">
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item :label="t('driver', '司機')">{{ printingReport?.employeeName }}</a-descriptions-item>
        <a-descriptions-item :label="t('date', '日期')">{{ printingReport?.reportDate }}</a-descriptions-item>
        <a-descriptions-item :label="t('deliveryDays', '出貨星期')">{{ printingReport?.weekDays }}</a-descriptions-item>
        <a-descriptions-item :label="t('totalAmount', '總金額')">NT$ {{ formatNumber(printingReport?.totalAmount) }}</a-descriptions-item>
      </a-descriptions>
      <a-table :data="printingReport?.products || []" :bordered="false" :pagination="false" size="small">
        <template #columns>
          <a-table-column :title="t('customer', '客戶')" data-index="customer" min-width="200" fixed="left">
            <template #cell="{ record }">{{ record.customer?.name }}</template>
          </a-table-column>
          <a-table-column :title="t('productName', '商品名稱')" data-index="product" min-width="200">
            <template #cell="{ record }">{{ record.product?.name }}</template>
          </a-table-column>
          <a-table-column :title="t('quantity', '數量')" data-index="quantity" :width="120" align="right" />
          <a-table-column :title="t('unitPrice', '單價')" :width="150" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.unitPrice) }}</template>
          </a-table-column>
          <a-table-column :title="t('amount', '金額')" :width="150" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.amount) }}</template>
          </a-table-column>
          <a-table-column :title="t('paymentMethod', '付款方式')" :width="150">
            <template #cell="{ record }">{{ paymentDisplayMap[record.paymentMethod] || record.paymentMethod || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('status', '狀態')" :width="180" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.isConvertedToOrder" color="green">{{ t('converted', '已轉入') }}</a-tag>
              <a-tag v-else color="orange">{{ t('notConverted', '未轉入') }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('note', '備註')" data-index="note" min-width="200">
            <template #cell="{ record }">{{ record.note || '—' }}</template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <template #footer>
      <a-button @click="closePrintDialog">{{ t('cancel', '取消') }}</a-button>
      <a-button type="primary" @click="handleDoPrint">
        <i class="ri-printer-line mr-1" />
        {{ t('print', '列印') }}
      </a-button>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--       轉入訂單彈窗         -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="convertDialogVisible" width="1000px" @cancel="closeConvertDialog" :closable="false" :fullscreen="convertFullscreen">
    <template #title>
      <div class="flex w-full gap-2">
        <div class="flex w-full items-center justify-center text-lg font-semibold">{{ t('convertToOrder', '轉入訂單') }}</div>
        <button v-if="!convertFullscreen" class="-ml-8!" @click="convertFullscreen = true"><Expand /></button>
        <button v-if="convertFullscreen" class="-ml-8!" @click="convertFullscreen = false"><Shrink /></button>
      </div>
    </template>
    <a-tabs v-model:active-key="activeTab" @tab-click="handleTabChange">
      <a-tab-pane :key="TAB_KEYS.PROJECT" :title="t('step1SelectProducts', '步驟一：選擇商品')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.ORDER" :title="t('step2SelectMethod', '步驟二：選擇處理方式')"></a-tab-pane>
    </a-tabs>
    <!-- 步驟一：選擇商品 -->
    <div v-if="isProject" class="flex flex-col gap-2">
      <div class="mt-2 flex items-center justify-between">
        <p class="text-xs text-gray-500">{{ t('selectedCount', '已選擇') }} {{ selectedProductIndexes.length }} {{ t('products', '個商品') }}</p>
        <div v-if="selectedConvertCustomerName" class="flex flex-col items-end gap-0.5">
          <p class="text-xs text-blue-600 font-medium"><i class="ri-lock-line mr-1"></i>{{ t('lockedToCustomer', '已鎖定客戶') }}：{{ selectedConvertCustomerName }}</p>
          <p v-if="selectedConvertProductCategory" class="text-xs text-orange-500 font-medium">
            <i class="ri-lock-line mr-1"></i>{{ t('lockedToCategory', '已鎖定類別') }}：{{ selectedConvertProductCategory }}
          </p>
        </div>
        <p v-else class="text-xs text-gray-400">{{ t('selectCustomerHint', '請選擇任一商品，將自動鎖定該客戶與類別') }}</p>
      </div>
      <a-table :data="convertProductList" :bordered="false" :pagination="false" :scroll="{ y: 500 }">
        <template #columns>
          <a-table-column :width="60" align="center">
            <template #title>
              <a-checkbox :model-value="isAllProductsSelected" :indeterminate="isProductsIndeterminate" @change="handleSelectAllProducts" />
            </template>
            <template #cell="{ record }">
              <a-checkbox
                :model-value="selectedProductIndexes.includes(record._index)"
                :disabled="!isProductSelectableForConvert(record)"
                @change="(checked) => handleToggleProduct(record._index, checked)"
              />
            </template>
          </a-table-column>
          <a-table-column :title="t('customer', '對象')" min-width="120">
            <template #cell="{ record }">
              <span :class="!isProductSelectableForConvert(record) && !record.isConvertedToOrder ? 'text-gray-300' : ''">
                {{ record.customer?.name || record.customerName || '—' }}
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="t('product', '商品')" min-width="120">
            <template #cell="{ record }">{{ record.product?.name || record.productName || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('quantity', '數量')" :width="80" align="right">
            <template #cell="{ record }">{{ record.quantity }}</template>
          </a-table-column>
          <a-table-column :title="t('unitPrice', '單價')" :width="100" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.unitPrice) }}</template>
          </a-table-column>
          <a-table-column :title="t('amount', '金額')" :width="100" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.amount) }}</template>
          </a-table-column>
          <a-table-column :title="t('paymentMethod', '付款方式')" :width="100">
            <template #cell="{ record }">{{ paymentDisplayMap[record.paymentMethod] || record.paymentMethod || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('convertStatus', '轉入狀態')" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag v-if="record.isConvertedToOrder" color="green">{{ t('converted', '已轉入') }}</a-tag>
              <a-tag v-else color="blue">{{ t('notConverted', '未轉入') }}</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 步驟二：選擇處理方式 -->
    <div v-if="isOrder" class="flex flex-col gap-2">
      <a-radio-group v-model="convertMode">
        <a-radio value="new">{{ t('createNewOrder', '建立新訂單') }}</a-radio>
        <a-radio value="existing">{{ t('addToExistingOrder', '加入既有訂單') }}</a-radio>
      </a-radio-group>

      <!-- 建立新訂單：選擇產品種類 -->
      <div v-if="convertMode === 'new'" class="flex flex-col gap-2 rounded-[10px] border bg-[#f2f3f5] p-3">
        <AFormItem :label="t('productCategory', '產品種類')" required>
          {{ convertCategoryId }}
          <InfiniteSelect v-model="convertCategoryId" emitValue dataSource="productTypes" valueKey="code" :placeholder="t('pleaseSelectCategory', '請選擇產品種類')" type="outline" class="w-full" />
        </AFormItem>
      </div>

      <div v-if="convertMode === 'existing'" class="flex flex-col gap-2">
        <a-button type="text" class="w-fit" @click.stop="handleSearchExistingOrder">{{ t('selectOrder', '選擇訂單') }}</a-button>

        <div v-if="selectedExistingOrder" class="flex flex-col gap-4 rounded-[10px] border bg-[#f2f3f5] p-3">
          <div class="flex items-start justify-center">
            <div class="flex flex-col gap-1 flex-1">
              <p class="text-gray-500">{{ t('orderNumber', '訂單編號') }}: {{ selectedExistingOrder.orderNumber || '—' }}</p>
              <p class="text-gray-500">{{ t('customer', '客戶') }}: {{ selectedExistingOrder.targetName || '—' }}</p>
              <p class="text-gray-500">{{ t('orderDate', '訂單日期') }}: {{ selectedExistingOrder.orderDate || '—' }}</p>
              <p class="text-gray-500">{{ t('totalAmount', '總金額') }}: NT$ {{ selectedExistingOrder.totalAmount || '0' }}</p>
              <p class="text-gray-500">{{ t('status', '狀態') }}: {{ selectedExistingOrder.status || '-' }}</p>
            </div>
            <a-button type="text" status="danger" @click.stop="selectedExistingOrder = null">
              <i class="ri-close-line text-[20px]" />
            </a-button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <AFormItem :label="t('shipDate', '出貨日期')">
              <TinyDatePicker v-model="convertShipDate" />
            </AFormItem>
            <AFormItem :label="t('note', '備註')">
              <TinyInput v-model="convertNote" :placeholder="t('convertNoteHint', '從送貨報表轉入')" />
            </AFormItem>
          </div>
        </div>
        <p v-else class="text-[17px] text-gray-500 text-center">{{ t('noOrderSelected', '尚未選擇訂單') }}</p>
      </div>

      <!--<a-radio-group v-model="convertMode" direction="vertical" class="w-full">
        &lt;!&ndash; 建立新訂單 &ndash;&gt;
        <a-radio value="new">
          <template #radio="{ checked }">
            <div class="cursor-pointer rounded-lg border-2 p-4 w-full" :class="checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
              <h4 class="mb-1 text-sm font-medium">{{ t('createNewOrder', '建立新訂單') }}</h4>
              <p class="text-xs text-gray-500">{{ t('createNewOrderDesc', '將所選商品建立為新的訂單') }}</p>
            </div>
          </template>
        </a-radio>

        &lt;!&ndash; 加入既有訂單 &ndash;&gt;
        <a-radio value="existing">
          <template #radio="{ checked }">
            <div class="cursor-pointer rounded-lg border-2 p-4 w-full" :class="checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="mb-1 text-sm font-medium">{{ t('addToExistingOrder', '加入既有訂單') }}</h4>
                  <p class="text-xs text-gray-500">{{ t('addToExistingOrderDesc', '選擇既有訂單繼續累計') }}</p>
                </div>
                <a-button type="text" size="small" @click.stop="handleSearchExistingOrder">{{ t('selectOrder', '選擇訂單') }}</a-button>
              </div>

              &lt;!&ndash; 已選擇的訂單資訊 &ndash;&gt;
              <div v-if="selectedExistingOrder" class="mt-3 rounded border bg-white p-3">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-1">
                    <p class="text-gray-500">{{ t('orderNumber', '訂單編號') }}: {{ selectedExistingOrder.orderNumber || '—' }}</p>
                    <p class="text-gray-500">{{ t('customer', '客戶') }}: {{ selectedExistingOrder.targetName || '—' }}</p>
                    <p class="text-gray-500">{{ t('orderDate', '訂單日期') }}: {{ selectedExistingOrder.shipDate || '—' }}</p>
                    <p class="text-gray-500">{{ t('totalAmount', '總金額') }}: NT$ {{ selectedExistingOrder.totalAmount || '0' }}</p>
                    <p class="text-gray-500">{{ t('status', '狀態') }}: {{ selectedExistingOrder.status || '-' }}</p>
                  </div>
                  <a-button type="text" size="small" status="danger" @click.stop="selectedExistingOrder = null">
                    <i class="ri-close-line" />
                  </a-button>
                </div>
              </div>
              <p v-else class="mt-2 text-xs text-gray-500">{{ t('noOrderSelected', '尚未選擇訂單') }}</p>

              &lt;!&ndash; 額外欄位：出貨日期、備註 &ndash;&gt;
              <div v-if="checked" class="mt-4 grid grid-cols-2 gap-4">
                <AFormItem :label="t('shipDate', '出貨日期')">
                  <TinyInput type="date" v-model="convertShipDate" />
                </AFormItem>
                <AFormItem :label="t('note', '備註')">
                  <TinyInput v-model="convertNote" :placeholder="t('convertNoteHint', '從送貨報表轉入')" />
                </AFormItem>
              </div>
            </div>
          </template>
        </a-radio>
      </a-radio-group>-->
    </div>

    <template #footer>
      <!-- 步驟一：選擇商品 -->
      <template v-if="isProject">
        <a-button @click="closeConvertDialog" :disabled="convertLoading">{{ t('cancel', '取消') }}</a-button>
        <a-button type="primary" @click="activeTab = TAB_KEYS.ORDER" :disabled="selectedProductIndexes.length === 0">
          {{ t('nextStep', '下一步') }}
          <i class="ri-arrow-right-line ml-1" />
        </a-button>
      </template>
      <!-- 步驟二：選擇處理方式 -->
      <template v-else>
        <a-button @click="activeTab = TAB_KEYS.PROJECT" :disabled="convertLoading">
          <i class="ri-arrow-left-line mr-1" />
          {{ t('previousStep', '上一步') }}
        </a-button>
        <a-button type="primary" @click="handleDoConvert" :loading="convertLoading" :disabled="convertMode === 'existing' && !selectedExistingOrder">{{ t('confirmConvert', '確認轉入') }}</a-button>
      </template>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--     搜尋既有訂單彈窗       -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="orderSearchDialogVisible" :title="t('searchExistingOrder', '搜尋既有訂單')" width="800px" :footer="false">
    <div class="space-y-3">
      <!-- 搜尋欄 -->
      <div class="flex gap-2">
        <TinyInput class="flex-1" :placeholder="t('searchOrderPlaceholder', '輸入訂單編號或客戶名稱...')" v-model="orderSearchTerm" clearable @keyup.enter="handleOrderSearch" />
        <a-button type="primary" @click="handleOrderSearch">
          <i class="ri-search-line mr-1" />
          {{ t('search', '搜尋') }}
        </a-button>
      </div>

      <!-- 訂單列表 -->
      <a-table :data="existingOrders" :bordered="false" :pagination="false" :scroll="{ y: 500 }" row-key="id">
        <template #columns>
          <a-table-column :title="t('orderNumber', '訂單編號')" :width="180">
            <template #cell="{ record }">{{ record.orderNumber || `#${record.id}` }}</template>
          </a-table-column>
          <a-table-column :title="t('customer', '客戶')" min-width="120">
            <template #cell="{ record }">{{ record.targetName || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('orderDate', '訂單日期')" :width="120">
            <template #cell="{ record }">{{ record.orderDate || '—' }}</template>
          </a-table-column>
          <a-table-column :title="t('totalAmount', '總金額')" :width="120" align="right">
            <template #cell="{ record }">NT$ {{ formatNumber(record.totalAmount) }}</template>
          </a-table-column>
          <a-table-column :title="t('status', '狀態')" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === '待出貨' ? 'orange' : 'green'">{{ record.status || '—' }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('actions', '操作')" :width="80" align="center">
            <template #cell="{ record }">
              <a-button type="primary" size="small" :disabled="record.status === '已完成'" @click="handleSelectExistingOrder(record)">
                {{ t('select', '選擇') }}
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <a-pagination :current="orderSearchPagination.page" :page-size="orderSearchPagination.limit" :total="orderSearchPagination.total" size="small" @change="handleOrderPageChange" />
    </div>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--        匯出彈窗           -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="exportDialogVisible" :title="t('exportReport', '匯出報表')" width="600px" @cancel="closeExportDialog">
    <AForm layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <AFormItem :label="t('driver', '司機')">
          <InfiniteSelect v-model="exportFilters.driverId" dataSource="drivers" :placeholder="t('all', '全部')" type="outline" allowClear />
        </AFormItem>
        <AFormItem :label="t('status', '狀態')">
          <TinySelect v-model="exportFilters.status" :options="statusOptions" :placeholder="t('all', '全部')" clearable />
        </AFormItem>
        <AFormItem :label="t('startDate', '起始日期')" required>
          <TinyDatePicker
            v-model="exportFilters.reportDateFrom"
            :placeholder="t('selectDate', '請選擇日期')"
            value-format="yyyy-MM-dd"
            :picker-options="startDatePickerOptions"
            @change="onExportStartDateChange"
          />
        </AFormItem>
        <AFormItem :label="t('endDate', '結束日期')" required>
          <TinyDatePicker
            v-model="exportFilters.reportDateTo"
            :placeholder="t('selectDate', '請選擇日期')"
            value-format="yyyy-MM-dd"
            :picker-options="endDatePickerOptions"
            :disabled="!exportFilters.reportDateFrom"
          />
        </AFormItem>
        <AFormItem :label="t('deliveryDays', '出貨星期')" class="col-span-2">
          <a-checkbox-group v-model="exportFilters.deliveryDays">
            <a-checkbox v-for="option in weekDayOptions" :key="option.label" :value="option.label">
              {{ option.text }}
            </a-checkbox>
          </a-checkbox-group>
        </AFormItem>
      </div>

      <!-- 日期範圍提示 -->
      <div v-if="exportDateError" class="mt-2 text-sm text-red-500">
        <i class="ri-error-warning-line mr-1" />
        {{ exportDateError }}
      </div>
      <div v-else class="mt-2 text-sm text-gray-500">
        <i class="ri-information-line mr-1" />
        {{ t('exportDateHint', '日期範圍最多 31 天') }}
      </div>
    </AForm>

    <template #footer>
      <a-button @click="closeExportDialog" :disabled="exportLoading">{{ t('cancel', '取消') }}</a-button>
      <a-button type="primary" @click="handleExport" :loading="exportLoading" :disabled="!canExport">
        <i class="ri-download-line mr-1" />
        {{ t('export', '匯出') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, computed, ref } from 'vue';
import { Card } from '@/components/ui/card';
import { TinyInput, TinySelect, TinyDatePicker, TinyTooltip } from '@opentiny/vue';
import { CustomTinyGrid, CustomTinyGridColumn } from '@/components/Table/CustomTable';
import AppPagination from '@/components/ui/AppPagination.vue';
import InfiniteSelect from '@/components/Form/InfiniteSelect.vue';
import CustomForm from '@/components/Form/CustomForm.vue';
import CustomFormItem from '@/components/Form/CustomFormItem.vue';
import DailyShippingReportEnhanced from '@/components/dialogs/DailyShippingReportEnhanced.vue';
import DeliveryReportSlip from '../components/DeliveryReportSlip.vue';
import { useI18n } from 'vue-i18n';
import { useSelectOptions } from '@/composables/useSelectOptions';
import { useDataList } from './useDataList';
import { useVueToPrint } from 'vue-to-print';
import { Expand, Shrink, Printer } from 'lucide-vue-next';

const { t } = useI18n();
const { orderPaymentTermOptions, buildLabelMap } = useSelectOptions();
const paymentDisplayMap = computed(() => buildLabelMap(orderPaymentTermOptions.value));

/** Table高度相關 **/
import { useWindowSize } from '@vueuse/core';
const { height: windowHeight } = useWindowSize();
const TableScrollY = computed(() => Math.max(windowHeight.value - 440, 100));

const printFullscreen = ref(true);
const convertFullscreen = ref(true);
const {
  //常數
  statusOptions,
  weekDayOptions,
  TAB_KEYS,

  //工具函式
  formatNumber,
  canReviewReport,
  canDeleteReport,
  isViewOnlyReport,

  //統計數據
  summaryData,

  //列表資料
  basicDataList,
  filters,
  pagination,
  pageSizeOptions,
  handleFiltersChange,
  clearFilter,
  CurrentChange,
  SizeChange,

  //匯出彈窗
  exportDialogVisible,
  exportLoading,
  exportFilters,
  exportDateError,
  canExport,
  openExportDialog,
  closeExportDialog,
  handleExport,

  //新增編輯刪除
  createDialogVisible,
  openCreateDialog,
  handleReportCreated,
  handleEdit,
  handleDelete,
  handleCheck,
  handleCopyLink,

  //列印
  printDialogVisible,
  printingReport,
  handlePrint,
  closePrintDialog,
  handleDoPrint,

  //轉入訂單
  convertDialogVisible,
  selectedProductIndexes,
  convertMode,
  convertLoading,
  convertShipDate,
  convertNote,
  convertCategoryId,
  activeTab,
  isProject,
  isOrder,
  handleTabChange,
  convertProductList,
  isAllProductsSelected,
  isProductsIndeterminate,
  handleSelectAllProducts,
  handleToggleProduct,
  handleConvertToOrder,
  closeConvertDialog,
  handleDoConvert,
  selectedConvertCustomerId,
  selectedConvertCustomerName,
  selectedConvertProductCategory,
  isProductSelectableForConvert,

  //搜尋既有訂單
  orderSearchDialogVisible,
  orderSearchTerm,
  existingOrders,
  selectedExistingOrder,
  orderSearchPagination,
  handleSearchExistingOrder,
  handleOrderSearch,
  handleOrderPageChange,
  handleSelectExistingOrder,

  cleanupResize, //窗口調整
  initializeData, //初始化
  systemStore, //Store 引用
} = useDataList(t);

/** 三聯單列印 **/
const reportGridRef = ref(null);
const slipRef = ref(null);
const slipReports = ref([]);
const triplicatePageStyle = `@page { size: 241mm 140mm; margin: 0; } body { margin: 0; }`;
const { handlePrint: handleTriplicatePrint } = useVueToPrint({
  content: () => slipRef.value?.printContentRef,
  documentTitle: '送貨日報表三聯單',
  pageStyle: triplicatePageStyle,
  removeAfterPrint: true,
  suppressErrors: true,
});
const printSlip = async (row) => {
  slipReports.value = [row.raw];
  await nextTick();
  handleTriplicatePrint();
};
const batchPrintSlip = async () => {
  const selected = reportGridRef.value?.getSelectRecords?.() ?? [];
  if (!selected.length) {
    return;
  }
  slipReports.value = selected.map((r) => r.raw);
  await nextTick();
  handleTriplicatePrint();
};

/** 展開收合相關 **/
const allExpanded = ref(false);
const toggleAllRowExpansion = () => {
  allExpanded.value = !allExpanded.value;
  reportGridRef.value.setAllRowExpansion(allExpanded.value);
};
const handleExpandChange = ({ $table }) => {
  if (!$table) return;
  const expandedCount = $table.expandeds?.length ?? 0;
  const totalCount = $table.tableFullData?.length ?? 0;
  if (expandedCount === 0) {
    allExpanded.value = false;
  } else if (totalCount > 0 && expandedCount >= totalCount) {
    allExpanded.value = true;
  }
};

/** 日期相關 **/
const startDatePickerOptions = {
  disabledDate(time) {
    return time.getTime() > Date.now();
  },
}; //起始日期：不能選擇未來日期
const endDatePickerOptions = computed(() => ({
  disabledDate(time) {
    //如果有起始日期，限制範圍
    if (exportFilters.reportDateFrom) {
      const startDate = new Date(exportFilters.reportDateFrom);
      startDate.setHours(0, 0, 0, 0); //重置時間部分
      const startTime = startDate.getTime();
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + 30); //起始日期 + 30 天 = 共 31 天
      maxEndDate.setHours(23, 59, 59, 999);

      //不能早於起始日期，也不能超過起始日期後 31 天
      return time.getTime() < startTime || time.getTime() > maxEndDate.getTime();
    }
    return false;
  },
})); //結束日期：根據起始日期限制，最多 31 天
const onExportStartDateChange = () => {
  if (!exportFilters.reportDateFrom) {
    exportFilters.reportDateTo = '';
    return;
  }

  //如果結束日期早於起始日期，或超過 31 天範圍，則重置結束日期
  if (exportFilters.reportDateTo) {
    const startDate = new Date(exportFilters.reportDateFrom);
    const endDate = new Date(exportFilters.reportDateTo);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 30);

    if (endDate < startDate || endDate > maxEndDate) {
      exportFilters.reportDateTo = '';
    }
  }
};

onUnmounted(cleanupResize);
onMounted(async () => {
  await initializeData();

  await nextTick();
});
</script>
