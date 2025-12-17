<!-- src/pages/basic-data/CustomerManagementPage.vue 客戶資料 -->
<template>
  <Card ref="containerRef">
    <!--表頭-->
    <CardHeader>
      <div class="flex flex-1 flex-col">
        <CardTitle>客戶列表</CardTitle>
        <p class="text-sm text-gray-500">共 {{ totalCustomers }} 筆</p>
      </div>
      <div class="flex items-center gap-3">
        <TinyInput v-model="globalSearch" class="w-[620px]!" placeholder="輸入關鍵字搜尋(可搜尋主要聯絡人、公司名稱、公司電話、電子信箱、統一編號、備註)" @keyup.enter="handleGlobalSearch" clearable />
        <Button type="danger" plain @click="clearFilter">清除全部搜尋</Button>
        <Button type="primary" @click="openCreateDialog">新增客戶</Button>
      </div>
    </CardHeader>

    <!--列表內容-->
    <CardContent class="flex flex-col gap-4">
      <!--訂單API查詢用-->
      <div class="flex items-center gap-3 rounded-[10px] bg-[#f2f3f5] p-3">
        <p class="text-[16px] text-gray-500">訂單查詢範圍</p>
        <div class="flex items-center gap-2">
          <TinyDatePicker :model-value="orderDateRange.start" type="date" style="width: 140px" @update:model-value="(value) => updateOrderRange('start', value)" />
          <span class="text-sm text-gray-500">至</span>
          <TinyDatePicker :model-value="orderDateRange.end" type="date" style="width: 140px" @update:model-value="(value) => updateOrderRange('end', value)" />
          <Button type="text" size="small" @click="setOrderRange(6)">近6個月</Button>
          <Button type="text" size="small" @click="resetOrderRange">重置</Button>
        </div>
      </div>

      <!--客戶列表API＋該客戶的訂單API查詢結果-->
      <CustomTinyGrid :data="basicDataList" row-key="id" :height="640" :border="true" :expand-config="{ trigger: 'row', showIcon: true }" :row-id="'id'">
        <!--該客戶的訂單API查詢結果-->
        <!--<CustomTinyGridColumn type="expand" :width="60" align="center" fixed="left">
          <template #default="{ row }">
            {{ row.id }}
            <div class="flex flex-col gap-2 bg-gray-50 p-6">
              &lt;!&ndash;基本資料&ndash;&gt;
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <p class="text-xs text-gray-500">主要聯絡人</p>
                  <p class="text-sm text-gray-900">{{ getPrimaryContact(row)?.name }} / {{ getPrimaryContact(row)?.phone }}</p>
                  <p class="text-xs text-gray-500">{{ getPrimaryContact(row)?.email }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">公司資訊</p>
                  <p class="text-sm text-gray-900">{{ row.companyAddress }}</p>
                  <p class="text-xs text-gray-500">{{ row.companyEmail }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 text-xs">
                <TinyBadge type="info">預計出貨：{{ row.deliveryDays.join("、") }}</TinyBadge>
                <TinyBadge type="warning">訂金 {{ currency(row.deposit) }}</TinyBadge>
              </div>
              <div class="flex items-center gap-2">
                <i class="ri-archive-line text-lg text-gray-600"></i>
                <h4 class="font-medium text-gray-900">客戶訂單記錄</h4>
                <TinyBadge type="info" class="ml-2">共 {{ getAllOrdersCount(row.id) }} 筆訂單</TinyBadge>
                <TinyBadge type="warning" class="ml-2">{{ orderDateRange.start }} ~ {{ orderDateRange.end }}</TinyBadge>
              </div>

              &lt;!&ndash;訂單種類Tabs&ndash;&gt;
              <div class="flex gap-2 border-b pb-2">
                <button
                  v-for="tab in getOrderTabs(row.id)"
                  :key="tab.key"
                  @click="handleOrderTabChange(row.id, tab.key)"
                  class="rounded-md px-3 py-1 text-sm"
                  :class="getActiveOrderTab(row.id) === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'"
                >
                  {{ tab.label }}
                </button>
              </div>

              &lt;!&ndash;訂單列表&ndash;&gt;
              <CustomTinyGrid :data="getOrdersForDisplay(row.id)" stripe size="small" class="z-[8]!" :loading="isOrderListLoading(row.id)">
                <CustomTinyGridColumn field="orderCode" title="訂單編號" :width="140" fixed="left" />
                <CustomTinyGridColumn v-if="getActiveOrderTab(row.id) === 'all'" field="__orderType" title="訂單類型" fixed="left" :width="120">
                  <template #default="{ row: orderRow }">
                    <TinyBadge type="info">{{ orderTypeLabels[orderRow.__orderType] || "—" }}</TinyBadge>
                  </template>
                </CustomTinyGridColumn>
                <CustomTinyGridColumn field="productName" title="商品名稱" width="150" />
                <CustomTinyGridColumn field="quantity" title="數量" :width="90" align="right" />
                <CustomTinyGridColumn field="total" title="總金額" :width="120" align="right">
                  <template #default="{ row: orderRow }">{{ currency(orderRow.total) }}</template>
                </CustomTinyGridColumn>
                <CustomTinyGridColumn field="orderDate" title="訂單日期" :width="130" />
                <CustomTinyGridColumn field="status" title="狀態" :width="120" fixed="right">
                  <template #default="{ row: orderRow }">
                    <span class="inline-flex items-center rounded-full px-2 py-1 text-xs" :class="orderStatusColors[orderRow.status] || 'bg-gray-100 text-gray-600'">
                      {{ orderRow.status }}
                    </span>
                  </template>
                </CustomTinyGridColumn>
              </CustomTinyGrid>
              <AppPagination
                class="md:w-auto"
                :current="getActiveOrderPagination(row.id)?.page || 1"
                :page-size="getActiveOrderPagination(row.id)?.limit || 5"
                :total="getActiveOrderPagination(row.id)?.total || 0"
                :page-size-options="orderPageSizeOptions"
                @change="(page) => handleOrderPageChange(row.id, getActiveOrderTab(row.id), page)"
                @page-size-change="(size) => handleOrderPageSizeChange(row.id, getActiveOrderTab(row.id), size)"
              />
            </div>
          </template>
        </CustomTinyGridColumn>-->

        <!--客戶列表API結果-->
        <CustomTinyGridColumn field="primaryContact" title="主要聯絡人" min-width="180" fixed="left">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ getPrimaryContact(row)?.name || "未設定" }}</span>
              <span class="text-xs text-gray-500">{{ getPrimaryContact(row)?.phone }}</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="companyName" title="客戶名稱" min-width="260" sortable :sort-field="'name'" :current-order="getColumnOrder('name')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">客戶名稱 / 搜尋</span>
              <div class="flex items-center gap-1">
                <TinyInput v-model="globalSearch" placeholder="輸入名稱 / 聯絡方式 / 備註" class="h-8 flex-1 text-xs" clearable @keyup.enter="handleGlobalSearch" @clear="clearGlobalSearch" />
                <Button size="icon" variant="ghost" @click="handleGlobalSearch">
                  <i class="ri-search-line text-base" />
                </Button>
                <Button size="icon" variant="ghost" @click="clearGlobalSearch">
                  <i class="ri-refresh-line text-base" />
                </Button>
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
        <CustomTinyGridColumn field="type" title="客戶類型" :width="150" sortable :sort-field="'type'" :current-order="getColumnOrder('type')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">客戶類型</span>
              <TinySelect v-model="filters.type" :options="typeFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <TinyBadge type="info">{{ typeLabelMap[row.type] || row.type || "—" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="segment" title="客戶分類" :width="160" sortable :sort-field="'segment'" :current-order="getColumnOrder('segment')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">客戶分類</span>
              <TinySelect v-model="filters.segment" :options="segmentFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ segmentLabelMap[row.segment] || row.segment || "—" }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="source" title="來源" :width="160" sortable :sort-field="'source'" :current-order="getColumnOrder('source')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">來源</span>
              <TinySelect v-model="filters.source" :options="sourceFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ sourceLabelMap[row.source] || row.source || "—" }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="salesRepId" title="業務負責" :width="180" sortable :sort-field="'salesRepId'" :current-order="getColumnOrder('salesRepId')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">業務負責</span>
              <TinyInput v-model="filters.salesRepId" placeholder="輸入 ID" class="h-8 text-xs" @keyup.enter="handleGlobalSearch" />
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-sm text-gray-900">{{ row.salesRepId || "—" }}</span>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="tags" title="標籤" min-width="220">
          <template #header>
            <div class="flex flex-col gap-1">
              <span class="text-[16px] text-gray-600">標籤</span>
              <TinyTextPopup v-model="filters.tags" placeholder="輸入後按 Enter 新增" class="w-full" @update:model-value="handleFiltersChange" />
            </div>
          </template>
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1 text-xs text-gray-700">
              <span v-for="tag in row.tags" :key="`${row.id}-${tag}`" class="rounded-full bg-gray-100 px-2 py-0.5">{{ tag }}</span>
              <span v-if="!row.tags?.length">—</span>
            </div>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="createdAt" title="建立日期" :width="160" sortable :sort-field="'createdAt'" :current-order="getColumnOrder('createdAt')" @sort="handleColumnSort">
          <template #default="{ row }">{{ row.createdAtDisplay }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="status" title="狀態" :width="150" align="center" fixed="right" sortable :sort-field="'status'" :current-order="getColumnOrder('status')" @sort="handleColumnSort">
          <template #header>
            <div class="flex flex-col gap-1 text-center">
              <span class="text-[16px] text-gray-600">狀態</span>
              <TinySelect v-model="filters.status" :options="statusFilterOptions" placeholder="全部" class="h-8 text-xs" />
            </div>
          </template>
          <template #default="{ row }">
            <a-tag :color="statusColorMap[row.status] || 'arcoblue'" size="large">{{ statusLabelMap[row.status] || row.status || "—" }}</a-tag>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn title="操作" :width="200" align="center" fixed="right">
          <template #header>
            <span class="text-xs text-gray-600">操作</span>
          </template>
          <template #default="{ row }">
            <div class="flex gap-2">
              <Button type="text" @click="openEditDialog(row)">編輯</Button>
              <Button type="text" @click="deleteCustomer(row.id)">刪除</Button>
              <Button type="text" @click="openDrawer(row)">詳細</Button>
            </div>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>

      <!--分頁-->
      <AppPagination class="md:w-auto" :current="pagination.page" :page-size="pagination.limit" :total="pagination.total" :page-size-options="pageSizeOptions" @change="CurrentChange" @page-size-change="SizeChange" />
    </CardContent>
  </Card>

  <TinyDrawer dragable :visible="drawerVisible" height="650px" :show-close="true" title="客戶詳細" placement="bottom" @update:visible="(val) => (drawerVisible = val)">
    <template #header>
      <div class="flex items-center gap-2 p-4">
        <p class="text-[22px]">客戶詳細</p>
        <button @click="openCustomerData" class="cursor-pointer items-center justify-center rounded-full bg-[#f2f3f5] p-2 hover:bg-gray-200 hover:text-[#165dff]">
          <UserRoundSearch strokeWidth="2" size="20" />
        </button>
      </div>
    </template>

    <div v-if="drawerCustomer" class="flex flex-col gap-2">
      <!--基本資料-->
      <div v-if="customerData" class="rounded-[10px] bg-[#f2f3f5] p-4 pb-0">
        <TinyForm label-width="120px" label-position="top" label-suffix="：">
          <div class="grid w-full grid-cols-2">
            <TinyFormItem label="主要聯絡人">
              <p class="text-[16px]/5">{{ getPrimaryContact(drawerCustomer)?.name }} / {{ getPrimaryContact(drawerCustomer)?.phone }}</p>
              <p class="text-[15px]/5 text-gray-500">{{ getPrimaryContact(drawerCustomer)?.email }}</p>
            </TinyFormItem>
            <TinyFormItem label="公司資訊">
              <p class="text-[16px]/5">{{ drawerCustomer.companyAddress }}</p>
              <p class="text-[15px]/5 text-gray-500">{{ drawerCustomer.companyEmail }}</p>
            </TinyFormItem>
            <TinyFormItem label="預計出貨">
              <p class="text-[16px]/5">{{ drawerCustomer.deliveryDays.join("、") }}</p>
            </TinyFormItem>
            <TinyFormItem label="訂金">
              <p class="text-[16px]/5">{{ currency(drawerCustomer.deposit) }}</p>
            </TinyFormItem>
          </div>
        </TinyForm>
      </div>

      <div class="mb-4 flex items-center gap-2 font-[16px]">
        <ShoppingCart strokeWidth="2" size="20" />
        <p class="text-gray-900">客戶訂單記錄</p>
        <TinyBadge type="info" class="ml-2">共 {{ getAllOrdersCount(drawerCustomer.id) }} 筆訂單</TinyBadge>
        <div class="rounded-full bg-[#f2edee] px-3 py-1">{{ orderDateRange.start }} ~ {{ orderDateRange.end }}</div>
      </div>

      <!--訂單種類Tabs-->
      <div class="flex w-fit items-center rounded-full bg-[#ececf0] p-1">
        <button
          v-for="tab in getOrderTabs(drawerCustomer.id)"
          :key="tab.key"
          @click="handleOrderTabChange(drawerCustomer.id, tab.key)"
          class="cursor-pointer rounded-full px-3 py-1 text-sm"
          :class="getActiveOrderTab(drawerCustomer.id) === tab.key ? 'bg-white text-black' : 'text-gray-600 hover:bg-gray-200'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!--訂單列表-->
      <CustomTinyGrid :data="getOrdersForDisplay(drawerCustomer.id)" size="small" :height="420" :loading="isOrderListLoading(drawerCustomer.id)">
        <CustomTinyGridColumn field="orderCode" title="訂單編號" :width="140" />
        <CustomTinyGridColumn v-if="getActiveOrderTab(drawerCustomer.id) === 'all'" field="__orderType" title="訂單類型" :width="120">
          <template #default="{ row: orderRow }">
            <TinyBadge type="info">{{ orderTypeLabels[orderRow.__orderType] || "—" }}</TinyBadge>
          </template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="productName" title="商品名稱" min-width="150" />
        <CustomTinyGridColumn field="quantity" title="數量" :width="90" align="right" />
        <CustomTinyGridColumn field="total" title="總金額" :width="120" align="right">
          <template #default="{ row: orderRow }">{{ currency(orderRow.total) }}</template>
        </CustomTinyGridColumn>
        <CustomTinyGridColumn field="orderDate" title="訂單日期" :width="130" />
        <CustomTinyGridColumn field="status" title="狀態" :width="120">
          <template #default="{ row: orderRow }">
            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs" :class="orderStatusColors[orderRow.status] || 'bg-gray-100 text-gray-600'">
              {{ orderRow.status }}
            </span>
          </template>
        </CustomTinyGridColumn>
      </CustomTinyGrid>
      <AppPagination
        class="md:w-auto"
        :current="getActiveOrderPagination(drawerCustomer.id)?.page || 1"
        :page-size="getActiveOrderPagination(drawerCustomer.id)?.limit || 5"
        :total="getActiveOrderPagination(drawerCustomer.id)?.total || 0"
        :page-size-options="orderPageSizeOptions"
        @change="(page) => handleOrderPageChange(drawerCustomer.id, getActiveOrderTab(drawerCustomer.id), page)"
        @page-size-change="(size) => handleOrderPageSizeChange(drawerCustomer.id, getActiveOrderTab(drawerCustomer.id), size)"
      />
    </div>
  </TinyDrawer>

  <!--新增編輯客戶視窗-->
  <TinyDialogBox v-model:visible="dialogVisible" :title="dialogMode === 'edit' ? '編輯客戶' : '新增客戶'" width="720px" :show-close="false" :close-on-click-modal="false">
    <div class="flex flex-col gap-3">
      <div class="flex justify-end">
        <Button type="text" @click="generateFakeCustomer">產生假資料</Button>
      </div>
      <div v-if="detailLoading" class="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">客戶資料載入中...</div>
      <div class="flex gap-2 border-b">
        <button v-for="tab in tabs" :key="tab.id" class="px-3 py-2 text-sm" :class="activeTab === tab.id ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'" @click="changeActiveTab(tab.id)">
          {{ tab.label }}
        </button>
      </div>
      <TinyForm v-if="activeTab === 'contact'" ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="90px" label-position="top" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900">聯絡人列表</p>
          <Button type="text" @click="addContact">新增聯絡人</Button>
        </div>
        <Card v-for="(contact, index) in basicForm.contactsForm" :key="contact.id || index" class="space-y-3 p-4">
          <TinyFormItem label="主要聯絡人">
            <div class="flex items-center gap-2">
              <TinyCheckbox :model-value="contact.isPrimary" @update:model-value="() => setPrimaryContact(index)" />
              <span class="text-sm text-gray-700">主要聯絡人</span>
              <Button v-if="basicForm.contactsForm.length > 1" type="text" @click="removeContact(index)">移除</Button>
            </div>
          </TinyFormItem>
          <div class="grid gap-3 md:grid-cols-2">
            <TinyFormItem label="姓名">
              <TinyInput v-model="basicForm.contactsForm[index].name" placeholder="姓名" />
            </TinyFormItem>
            <TinyFormItem label="電話">
              <TinyInput v-model="basicForm.contactsForm[index].phone" placeholder="電話" />
            </TinyFormItem>
          </div>
          <TinyFormItem label="地址">
            <TinyInput v-model="basicForm.contactsForm[index].address" placeholder="地址" />
          </TinyFormItem>
          <TinyFormItem label="Email">
            <TinyInput v-model="basicForm.contactsForm[index].email" placeholder="Email" />
          </TinyFormItem>
        </Card>
      </TinyForm>
      <TinyForm v-else-if="activeTab === 'company'" ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="90px" label-position="top" class="space-y-4">
        <TinyFormItem label="公司名稱">
          <TinyInput v-model="basicForm.companyForm.companyName" placeholder="公司名稱" />
        </TinyFormItem>
        <div class="grid gap-3 md:grid-cols-2">
          <TinyFormItem label="公司電話">
            <TinyInput v-model="basicForm.companyForm.companyPhone" placeholder="公司電話" />
          </TinyFormItem>
          <TinyFormItem label="公司信箱">
            <TinyInput v-model="basicForm.companyForm.companyEmail" placeholder="公司信箱" />
          </TinyFormItem>
        </div>
        <TinyFormItem label="公司地址">
          <TinyInput v-model="basicForm.companyForm.companyAddress" placeholder="公司地址" />
        </TinyFormItem>
        <TinyFormItem label="統一編號">
          <TinyInput v-model="basicForm.companyForm.taxId" placeholder="統一編號" />
        </TinyFormItem>
        <TinyFormItem label="註冊日期">
          <TinyDatePicker v-model="basicForm.companyForm.registeredDate" type="date" style="width: 220px" @update:model-value="updateCompanyRegisteredDate" />
        </TinyFormItem>
      </TinyForm>
      <TinyForm v-else ref="basicFormRef" :model="basicForm" :rules="basicFormRules" label-width="110px" label-position="top" class="space-y-4">
        <div class="grid gap-3 md:grid-cols-2">
          <TinyFormItem label="客戶類型">
            <TinySelect v-model="basicForm.metaForm.type" :options="customerTypeOptions" placeholder="請選擇" />
          </TinyFormItem>
          <TinyFormItem label="客戶分類 (Segment)">
            <TinySelect v-model="basicForm.metaForm.segment" :options="customerSegmentOptions" placeholder="請選擇" />
          </TinyFormItem>
          <TinyFormItem label="客戶來源">
            <TinySelect v-model="basicForm.metaForm.source" :options="customerSourceOptions" placeholder="請選擇" />
          </TinyFormItem>
          <TinyFormItem v-if="dialogMode === 'edit'" label="狀態">
            <TinySelect v-model="basicForm.metaForm.status" :options="customerStatusOptions" placeholder="請選擇" />
          </TinyFormItem>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <TinyFormItem label="業務負責 ID">
            <TinyInput v-model="basicForm.metaForm.salesRepId" placeholder="輸入業務 ID" />
          </TinyFormItem>
          <TinyFormItem label="標籤 (輸入後按 Enter)">
            <TinyTextPopup v-model="basicForm.metaForm.tags" placeholder="VIP,重點客戶" class="w-full" />
          </TinyFormItem>
        </div>
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900">客戶類別（可多選）</p>
          <div class="flex flex-wrap gap-4">
            <label v-for="category in customerCategories" :key="category" class="flex items-center gap-2 text-sm">
              <TinyCheckbox :model-value="categoriesForm.includes(category)" @update:model-value="() => toggleCategorySelection(category)" />
              {{ category }}
            </label>
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900">出貨星期（可多選）</p>
          <div class="grid grid-cols-4 gap-3 text-sm">
            <label v-for="day in weekDays" :key="day" class="flex items-center gap-2">
              <TinyCheckbox :model-value="deliveryDaysForm.includes(day)" @update:model-value="() => toggleDeliveryDay(day)" />
              {{ day }}
            </label>
          </div>
        </div>
        <TinyFormItem label="收付方式">
          <TinySelect v-model="basicForm.otherForm.paymentMethod" :options="paymentOptions.map((value) => ({ label: value, value }))" />
        </TinyFormItem>
        <TinyFormItem label="訂金">
          <TinyInput v-model="basicForm.otherForm.deposit" placeholder="訂金" />
        </TinyFormItem>
        <TinyFormItem label="發票抬頭">
          <TinyInput v-model="basicForm.otherForm.invoiceTitle" placeholder="發票抬頭" />
        </TinyFormItem>
        <TinyFormItem label="發票統編">
          <TinyInput v-model="basicForm.otherForm.invoiceTaxId" placeholder="發票統編" />
        </TinyFormItem>
        <TinyFormItem label="備註">
          <TinyInput v-model="basicForm.otherForm.note" type="textarea" rows="4" placeholder="備註" />
        </TinyFormItem>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900">商品價格調整</p>
            <Button type="text" @click="addCustomPrice">新增商品</Button>
          </div>
          <p v-if="customPriceForm.length === 0" class="text-xs text-gray-500">尚未設定</p>
          <Card v-for="item in customPriceForm" :key="item.id" class="grid gap-3 p-3 md:grid-cols-3">
            <TinyFormItem label="商品">
              <TinySelect v-model="item.productId" :options="productOptions" placeholder="選擇商品" />
            </TinyFormItem>
            <TinyFormItem label="調整金額">
              <TinyInput type="number" v-model="item.adjustment" placeholder="調整金額" />
            </TinyFormItem>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">建議售價</span>
              <span class="text-sm text-gray-900">{{ getSuggestedRetailPrice(item.productId, item.adjustment) }}</span>
              <Button type="text" @click="removeCustomPrice(item.id)">移除</Button>
            </div>
          </Card>
        </div>
      </TinyForm>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button type="text" @click="closeDialog">取消</Button>
        <Button type="primary" :disabled="isSaving" @click="saveData">{{ isSaving ? "處理中..." : "儲存" }}</Button>
      </div>
    </template>
  </TinyDialogBox>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch } from "vue";
import { CustomersListGet, CustomersCreatePost, CustomersUpdatePatch, CustomersDeleteById, CustomersGetByID } from "@/assets/API/Customers";
import { TinyDialogBox, TinyForm, TinyFormItem, TinyInput, TinyDatePicker, TinySelect, TinyCheckbox, TinyBadge, TinyDrawer, TinyTextPopup } from "@opentiny/vue";
import { CustomTinyGrid, CustomTinyGridColumn } from "@/components/Table/CustomTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppPagination from "@/components/ui/AppPagination.vue";
import Notify from "@opentiny/vue-notify";
import { useContentWidth } from "@/composables/useContentWidth";
import { format, subMonths } from "date-fns";
import { debounce } from "lodash";
import { useMainStore } from "@/stores/LoadingStore";

const { containerRef } = useContentWidth(); //標題按鈕捲軸相關
const mainStore = useMainStore(); //全局 loading 控制

/** 假資料相關 - 等API完整刪除 **/
import { UserRoundSearch, ShoppingCart } from "lucide-vue-next";
import { mockProducts } from "@/lib/mock-products";
import { fetchMockOrdersByType, orderStatusColors, orderTypeLabels } from "@/lib/mock-orders";
const randomPhone = () => `09${Math.floor(Math.random() * 90000000 + 10000000)}`;
const generateFakeCustomer = () => {
  const seed = Date.now();
  basicForm.value.contactsForm = [
    { isPrimary: true, name: `聯絡人${seed % 100}`, phone: randomPhone(), address: "台北市中正區", email: `contact${seed}@example.com` },
    { isPrimary: false, name: `助理${seed % 50}`, phone: randomPhone(), address: "台北市信義區", email: `assistant${seed}@example.com` }
  ];
  basicForm.value.companyForm.companyName = `測試有限公司 ${seed % 1000}`;
  basicForm.value.companyForm.companyPhone = "02-1234-5678";
  basicForm.value.companyForm.companyEmail = `company${seed}@mail.com`;
  basicForm.value.companyForm.companyAddress = "台北市信義區忠孝東路 100 號";
  basicForm.value.companyForm.taxId = `${Math.floor(Math.random() * 90000000 + 10000000)}`;
  basicForm.value.companyForm.registeredDate = format(new Date(), "yyyy-MM-dd");
  basicForm.value.otherForm.paymentMethod = "月結";
  basicForm.value.otherForm.deposit = "20000";
  basicForm.value.otherForm.invoiceTitle = `${basicForm.value.companyForm.companyName} 發票抬頭`;
  basicForm.value.otherForm.invoiceTaxId = basicForm.value.companyForm.taxId;
  basicForm.value.otherForm.note = "此為快速產生的測試資料";
  categoriesForm.value = customerCategories;
  deliveryDaysForm.value = ["星期一", "星期三", "星期五"];
  customPriceForm.value = [{ id: Date.now(), productId: mockProducts[0]?.id || "water-1", adjustment: 200 }];
  basicForm.value.metaForm = {
    ...metaFormTemplate,
    type: "COMPANY",
    segment: "WHOLESALE",
    source: "REFERRAL",
    salesRepId: `sales-${seed % 10}`,
    tags: "VIP,重點客戶",
    status: "ACTIVE"
  };
}; //自動產生假資料

/** 常數與選項 **/
const customerCategories = ["桶裝水", "雞蛋", "飲水機"]; //客戶分類
const paymentOptions = ["現金", "月結", "預付"]; //付款方式
const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]; //星期
const customerTypeOptions = [
  { label: "公司戶", value: "COMPANY" },
  { label: "個人戶", value: "INDIVIDUAL" }
]; //客戶類型
const customerSegmentOptions = [
  { label: "零售", value: "RETAIL" },
  { label: "批發", value: "WHOLESALE" },
  { label: "VIP", value: "VIP" },
  { label: "企業戶", value: "CORPORATE" }
]; //客戶分類選項
const customerSourceOptions = [
  { label: "官網", value: "WEBSITE" },
  { label: "轉介紹", value: "REFERRAL" },
  { label: "電話開發", value: "COLD_CALL" },
  { label: "社群", value: "SOCIAL_MEDIA" },
  { label: "展覽", value: "TRADE_SHOW" },
  { label: "其他", value: "OTHER" }
]; //客戶來源選項
const customerStatusOptions = [
  { label: "啟用", value: "ACTIVE" },
  { label: "停用", value: "INACTIVE" },
  { label: "刪除", value: "DELETED" }
]; //客戶狀態
const buildLabelMap = (options) =>
  options.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {}); //選項轉顯示文字
const typeLabelMap = buildLabelMap(customerTypeOptions); //客戶類型顯示
const segmentLabelMap = buildLabelMap(customerSegmentOptions); //客戶分類顯示
const sourceLabelMap = buildLabelMap(customerSourceOptions); //來源顯示
const statusLabelMap = buildLabelMap(customerStatusOptions); //狀態顯示
const statusColorMap = {
  ACTIVE: "arcoblue",
  INACTIVE: "orange",
  DELETED: "red"
}; //狀態顏色
const orderTypeTabs = [
  { key: "water", tabLabel: "桶裝水", title: "桶裝水訂單" },
  { key: "egg", tabLabel: "雞蛋", title: "雞蛋訂單" },
  { key: "dispenser", tabLabel: "飲水機", title: "飲水機訂單" }
];
const orderPageSizeOptions = [5, 10, 20];
const tabs = [
  { id: "contact", label: "聯絡人資訊" },
  { id: "company", label: "公司資訊" },
  { id: "other", label: "其他資訊" }
]; //對話框頁籤
const contactsFormTemplate = { isPrimary: true, name: "", phone: "", address: "", email: "" }; //聯絡人表單模板
const companyFormTemplate = { companyName: "", companyPhone: "", companyEmail: "", companyAddress: "", taxId: "", registeredDate: "" }; //公司表單模板
const otherFormTemplate = { paymentMethod: "月結", deposit: "", invoiceTitle: "", invoiceTaxId: "", note: "" }; //其他資訊模板
const metaFormTemplate = { type: "COMPANY", segment: "RETAIL", source: "OTHER", salesRepId: "", tags: "", status: "ACTIVE" }; //其他欄位模板

/** 共用工具 **/
const currency = (val) => `NT$${Number(val || 0).toLocaleString("zh-TW", { minimumFractionDigits: 0 })}`; //格式化金額
const getPrimaryContact = (customer) => customer.contacts.find((c) => c.isPrimary) || customer.contacts[0]; //取得主要聯絡人
const findProductById = (productId) => mockProducts.find((item) => item.id === productId) || null; //取得商品資料
const getSuggestedRetailPrice = (productId, adjustment) => {
  const product = findProductById(productId);
  if (!product) return "-";
  return currency(product.retailPrice + Number(adjustment || 0));
}; //顯示建議售價
const parseTagsInput = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean); //標籤字串轉陣列
const formatDateValue = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "yyyy-MM-dd");
}; //日期格式化顯示

/** 訂單相關 **/
const customerData = ref(false);
const openCustomerData = () => (customerData.value = !customerData.value);
const customerOrdersState = reactive({});
const activeOrderTabs = reactive({});
const drawerVisible = ref(false);
const drawerCustomer = ref(null);
const orderDateRange = reactive({
  start: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
  end: format(new Date(), "yyyy-MM-dd")
}); //訂單期間
const DEFAULT_ORDER_PAGINATION = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1
};
const ensureCustomerOrderState = (customerId) => {
  const key = String(customerId ?? "unknown");
  if (!customerOrdersState[key]) {
    customerOrdersState[key] = orderTypeTabs.reduce((acc, type) => {
      acc[type.key] = {
        data: [],
        loading: false,
        pagination: { ...DEFAULT_ORDER_PAGINATION }
      };
      return acc;
    }, {});
  }
  if (!activeOrderTabs[key]) {
    activeOrderTabs[key] = "all";
  }
  return customerOrdersState[key];
};
const getOrderState = (customerId, typeKey) => {
  if (typeKey === "all") return null;
  const state = ensureCustomerOrderState(customerId);
  return state[typeKey];
};
const getAllOrdersCount = (customerId) => orderTypeTabs.reduce((sum, { key }) => sum + (getOrderState(customerId, key)?.pagination.total || 0), 0);
const getOrdersForDisplay = (customerId) => {
  const activeKey = getActiveOrderTab(customerId);

  if (activeKey === "all") {
    return orderTypeTabs.flatMap(({ key }) => (getOrderState(customerId, key)?.data || []).map((item) => ({ ...item, __orderType: key }))).sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""));
  } //合併成全部

  //單一訂單種類
  const state = getOrderState(customerId, activeKey);
  return (state?.data || []).map((item) => ({ ...item, __orderType: activeKey }));
};
const getActiveOrderTab = (customerId) => {
  const key = String(customerId ?? "unknown");
  return activeOrderTabs[key] || "all";
};
const setActiveOrderTab = (customerId, tabKey) => {
  const key = String(customerId ?? "unknown");
  activeOrderTabs[key] = tabKey;
};
const getOrderTabs = (customerId) => [
  { key: "all", label: `全部 (${getAllOrdersCount(customerId)})` },
  ...orderTypeTabs.map(({ key, tabLabel }) => ({
    key,
    label: `${tabLabel} (${getOrderState(customerId, key)?.pagination.total || 0})`
  }))
];
const isOrderListLoading = (customerId) => {
  const activeKey = getActiveOrderTab(customerId);
  if (activeKey === "all") return orderTypeTabs.some(({ key }) => getOrderState(customerId, key)?.loading);
  return getOrderState(customerId, activeKey)?.loading;
};
const getActiveOrderPagination = (customerId) => {
  const activeKey = getActiveOrderTab(customerId);
  if (activeKey === "all") return null;
  return getOrderState(customerId, activeKey)?.pagination;
};
const setOrderRange = (months) => {
  orderDateRange.start = format(subMonths(new Date(), months), "yyyy-MM-dd");
  orderDateRange.end = format(new Date(), "yyyy-MM-dd");
  refreshAllLoadedOrders();
}; //快速設定範圍
const resetOrderRange = () => {
  orderDateRange.start = format(subMonths(new Date(), 2), "yyyy-MM-dd");
  orderDateRange.end = format(new Date(), "yyyy-MM-dd");
  refreshAllLoadedOrders();
}; //重設訂單範圍
const openDrawer = async (customer) => {
  if (!customer?.id) return;
  drawerCustomer.value = customer;
  await refreshAllOrderTypes(customer.id, { resetPage: false });
  drawerVisible.value = true;
}; //開啟訂單抽屜
const handleOrderTabChange = async (customerId, tabKey) => {
  if (!customerId || getActiveOrderTab(customerId) === tabKey) return;
  setActiveOrderTab(customerId, tabKey);
  if (tabKey === "all") {
    await refreshAllOrderTypes(customerId, { resetPage: false });
  } else {
    await loadCustomerOrders(customerId, tabKey);
  }
}; //切換訂單種類

/** 分頁設定 **/
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});
const pageSizeOptions = [10, 20, 50, 100];
const totalPages = computed(() => pagination.totalPages || 1); //安全總頁數
const CurrentChange = async (page) => {
  const target = Math.min(Math.max(page, 1), totalPages.value);
  if (target === pagination.page) return;
  pagination.page = target;
  await getAPI();
}; //切換分頁-客戶列表
const SizeChange = async (value) => {
  pagination.limit = Number(value) || 10;
  pagination.page = 1;
  await getAPI();
}; //切換分頁筆數-客戶列表
const handleOrderPageChange = async (customerId, typeKey, page) => {
  const state = getOrderState(customerId, typeKey);
  if (!state || page === state.pagination.page) return;
  state.pagination.page = page;
  await loadCustomerOrders(customerId, typeKey);
}; //切換分頁-訂單列表
const handleOrderPageSizeChange = async (customerId, typeKey, size) => {
  const state = getOrderState(customerId, typeKey);
  if (!state) return;
  if (size === "max") {
    state.pagination.limit = state.pagination.total || state.pagination.limit;
  } else {
    state.pagination.limit = Number(size) || state.pagination.limit;
  }
  state.pagination.page = 1;
  await loadCustomerOrders(customerId, typeKey);
}; //切換分頁筆數-訂單列表
const loadCustomerOrders = async (customerId, typeKey) => {
  const state = getOrderState(customerId, typeKey);
  if (!state) return;
  state.loading = true;
  try {
    const { data, meta } = await fetchMockOrdersByType({
      customerId,
      type: typeKey,
      startDate: orderDateRange.start,
      endDate: orderDateRange.end,
      page: state.pagination.page,
      limit: state.pagination.limit
    });
    state.data = data ?? [];
    const metaInfo = meta ?? {};
    state.pagination.total = metaInfo.total ?? state.data.length;
    state.pagination.totalPages = metaInfo.totalPages ?? Math.max(1, Math.ceil((state.pagination.total || 1) / (state.pagination.limit || 1)));
    state.pagination.page = metaInfo.page ?? state.pagination.page;
    state.pagination.limit = metaInfo.limit ?? state.pagination.limit;
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "訂單載入失敗", message: extractError(error, "無法取得訂單資料") });
  } finally {
    state.loading = false;
  }
};

/** 篩選與查詢 **/
const productOptions = mockProducts.map((product) => ({ label: `${product.category} - ${product.name} (${product.spec})`, value: product.id })); //商品選項
const totalCustomers = computed(() => pagination.total); //總筆數
const globalSearch = ref(""); //關鍵字搜尋
const basicDataList = ref([]); //客戶列表
const detailLoading = ref(false); //Dialog 讀取狀態
const isSaving = ref(false); //儲存狀態
const filters = reactive({
  type: "all",
  segment: "all",
  source: "all",
  status: "all",
  salesRepId: "",
  tags: ""
}); //API欄位對應的篩選
const sortField = ref("createdAt"); //排序欄位
const sortDirection = ref("desc"); //排序方向
const sortFieldMap = {
  name: "name",
  type: "type",
  segment: "segment",
  source: "source",
  salesRepId: "salesRepId",
  createdAt: "createdAt",
  status: "status"
}; //欄位對應API排序參數
const refreshAllOrderTypes = async (customerId, { resetPage = false } = {}) => {
  if (!customerId) return;
  const customerState = ensureCustomerOrderState(customerId);
  if (resetPage) {
    orderTypeTabs.forEach(({ key }) => {
      customerState[key].pagination.page = 1;
    });
  }
  await Promise.all(orderTypeTabs.map(({ key }) => loadCustomerOrders(customerId, key)));
};
const refreshOrdersForCustomers = async (customers) => {
  if (!Array.isArray(customers) || !customers.length) return;
  customers.forEach((customer) => {
    ensureCustomerOrderState(customer.id);
    setActiveOrderTab(customer.id, getActiveOrderTab(customer.id));
  });
  await Promise.all(customers.map((customer) => refreshAllOrderTypes(customer.id, { resetPage: true })));
};
const refreshAllLoadedOrders = async () => {
  const customerIds = Object.keys(customerOrdersState);
  if (!customerIds.length) return;
  await Promise.all(customerIds.map((id) => refreshAllOrderTypes(id, { resetPage: true })));
};
const extractError = (error, fallback) => error?.response?.data?.message || error?.message || fallback; //錯誤訊息整理
const normalizeListResponse = (response) => {
  const data = response?.data ?? response ?? {};
  const items = data.data?.data ?? data.items ?? data.data?.items ?? data.data ?? data;
  const meta = data.data?.meta ?? data.data?.pagination ?? data.meta ?? data.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta
  };
}; //解析列表回傳格式
const mapCustomerFromApi = (customer = {}) => {
  const customFields = customer.customFields || {};
  const contacts = (
    customFields.contacts?.length
      ? customFields.contacts
      : [
          {
            id: 1,
            isPrimary: true,
            name: customer.contactInfo?.name || customer.name || "未設定",
            phone: customer.contactInfo?.phone || "",
            address: [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(" "),
            email: customer.contactInfo?.email || ""
          }
        ]
  ).map((contact, index) => ({
    id: contact.id ?? index + 1,
    isPrimary: contact.isPrimary ?? index === 0,
    name: contact.name || "",
    phone: contact.phone || "",
    address: contact.address || "",
    email: contact.email || ""
  }));

  return {
    id: customer.id || customer.code || `customer-${Date.now()}`,
    displayCode: customer.code || customer.id,
    type: customer.type || "COMPANY",
    segment: customer.segment || "RETAIL",
    source: customer.source || "OTHER",
    salesRepId: customer.salesRepId || "",
    contacts,
    companyName: customer.name || "—",
    companyPhone: customer.contactInfo?.phone || "",
    companyEmail: customer.contactInfo?.email || "",
    companyAddress: customFields.companyAddress || [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.zipCode, customer.address?.country].filter(Boolean).join(" "),
    companyAddressFields: customer.address || {},
    taxId: customer.taxId || "",
    categories: customFields.categories || [],
    paymentMethod: customFields.paymentMethod || "",
    deposit: Number(customFields.deposit ?? 0),
    invoiceTitle: customFields.invoiceTitle || customer.name || "",
    invoiceTaxId: customFields.invoiceTaxId || customer.taxId || "",
    note: customer.notes || "",
    registeredDate: (customFields.registeredDate || customer.createdAt || "").split("T")[0] || "",
    deliveryDays: customFields.deliveryDays || [],
    customPrices: customFields.customPrices || [],
    status: customer.status || "ACTIVE",
    tags: Array.isArray(customer.tags) ? customer.tags : [],
    createdAt: customer.createdAt || "",
    createdAtDisplay: formatDateValue(customer.createdAt),
    orderLookupId: customFields.orderLookupId || customer.id || customer.code,
    raw: customer
  };
}; //API資料轉換

/** 資料取得 **/
const buildListParams = () => {
  const params = { page: pagination.page, limit: pagination.limit };
  const searchTerm = globalSearch.value?.trim();
  if (searchTerm) params.search = searchTerm;
  if (filters.type !== "all") params.type = filters.type;
  if (filters.segment !== "all") params.segment = filters.segment;
  if (filters.source !== "all") params.source = filters.source;
  if (filters.status !== "all") params.status = filters.status;
  if (filters.salesRepId?.trim()) params.salesRepId = filters.salesRepId.trim();
  const tagFilters = parseTagsInput(filters.tags);
  if (tagFilters.length) params.tags = tagFilters;
  if (sortField.value) {
    params.sortBy = sortFieldMap[sortField.value] || sortField.value;
    params.sortOrder = sortDirection.value;
  }
  return params;
}; //組合查詢條件
const getAPI = async () => {
  mainStore.setLoading(true);
  try {
    const response = await CustomersListGet(buildListParams());
    const { items, meta } = normalizeListResponse(response);

    basicDataList.value = items.map(mapCustomerFromApi);
    await refreshOrdersForCustomers(basicDataList.value);

    pagination.limit = Number(meta.limit ?? meta.pageSize ?? meta.perPage) || pagination.limit;
    pagination.total = meta.total ?? meta.totalItems ?? meta.count ?? items.length;
    pagination.page = meta.page ?? meta.currentPage ?? pagination.page;
    pagination.totalPages = (meta.totalPages ?? meta.pages ?? Math.ceil(pagination.total / pagination.limit)) || 1;
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "載入失敗", message: extractError(error, "無法取得客戶資料") });
  } finally {
    mainStore.setLoading(false);
  }
}; //取得客戶列表
const updateOrderRange = (field, value) => {
  orderDateRange[field] = value || "";
  refreshAllLoadedOrders();
}; //丁單日期欄位
const getColumnOrder = (field) => (sortField.value === field ? sortDirection.value : ""); //排序
const handleColumnSort = async ({ field, order }) => {
  if (!field) return;
  if (!order) {
    sortField.value = "createdAt";
    sortDirection.value = "desc";
  } else {
    sortField.value = field;
    sortDirection.value = order;
  }
  await getAPI();
}; //切換排序
const handleGlobalSearch = async () => {
  pagination.page = 1;
  await getAPI();
}; //Enter觸發搜尋
const clearGlobalSearch = async () => {
  if (!globalSearch.value) return;
  globalSearch.value = "";
  await handleGlobalSearch();
}; //清除關鍵字
const handleFiltersChange = async () => {
  await handleGlobalSearch();
}; //篩選條件變動觸發搜尋
const clearFilter = async () => {
  globalSearch.value = "";
  Object.assign(filters, {
    type: "all",
    segment: "all",
    source: "all",
    status: "all",
    salesRepId: "",
    tags: ""
  });
  await handleGlobalSearch();
}; //標題清除全部搜尋
watch(() => [filters.type, filters.segment, filters.source, filters.status], handleFiltersChange);
const buildSelectOptions = (options) => [{ label: "全部", value: "all" }, ...options]; //建立帶全部的下拉
const typeFilterOptions = buildSelectOptions(customerTypeOptions); //客戶類型篩選
const segmentFilterOptions = buildSelectOptions(customerSegmentOptions); //客戶分類篩選
const sourceFilterOptions = buildSelectOptions(customerSourceOptions); //來源篩選
const statusFilterOptions = buildSelectOptions(customerStatusOptions); //狀態篩選

/** 新增編輯相關 **/
const toggleArrayItem = (array, item) => (array.includes(item) ? array.filter((i) => i !== item) : [...array, item]); //切換多選陣列
const activeTab = ref("contact"); //表單分頁
const editingCustomerId = ref(null); //編輯中的客戶ID
const categoriesForm = ref([]); //客戶類別選項
const deliveryDaysForm = ref([]); //出貨星期
const customPriceForm = ref([]); //自訂價格
const initializeForm = () => ({
  contactsForm: [{ ...contactsFormTemplate }],
  companyForm: { ...companyFormTemplate },
  otherForm: { ...otherFormTemplate },
  metaForm: { ...metaFormTemplate }
});
const basicForm = ref(initializeForm()); //表單資料
const basicFormRef = ref(null); //表單ref
const basicFormRules = {}; //表單驗證
const resetForm = () => {
  basicForm.value = initializeForm();
  categoriesForm.value = [];
  deliveryDaysForm.value = [];
  customPriceForm.value = [];
  activeTab.value = "contact";
  basicFormRef.value?.clearValidate?.();
}; //表單初始化
const fillFormFromRecord = (record = {}) => {
  basicForm.value.contactsForm = (record.contacts?.length ? record.contacts : [{ isPrimary: true, name: "", phone: "", address: "", email: "" }]).map((contact, index) => ({
    id: contact.id ?? index + 1,
    isPrimary: contact.isPrimary ?? index === 0,
    name: contact.name || "",
    phone: contact.phone || "",
    address: contact.address || "",
    email: contact.email || ""
  }));
  basicForm.value.companyForm = {
    companyName: record.companyName || "",
    companyPhone: record.companyPhone || "",
    companyEmail: record.companyEmail || "",
    companyAddress: record.companyAddress || "",
    taxId: record.taxId || "",
    registeredDate: record.registeredDate || ""
  };
  basicForm.value.otherForm = {
    paymentMethod: record.paymentMethod || "月結",
    deposit: String(record.deposit ?? ""),
    invoiceTitle: record.invoiceTitle || "",
    invoiceTaxId: record.invoiceTaxId || "",
    note: record.note || ""
  };
  basicForm.value.metaForm = {
    type: record.type || metaFormTemplate.type,
    segment: record.segment || metaFormTemplate.segment,
    source: record.source || metaFormTemplate.source,
    salesRepId: record.salesRepId || "",
    tags: Array.isArray(record.tags) ? record.tags.join(",") : record.tags || "",
    status: record.status || metaFormTemplate.status
  };
  categoriesForm.value = record.categories || [];
  deliveryDaysForm.value = record.deliveryDays || [];
  customPriceForm.value = (record.customPrices || []).map((item, index) => ({
    id: item.id ?? index + 1,
    productId: item.productId || "",
    adjustment: item.adjustment ?? 0
  }));
}; //表單填值
const loadCustomerDetail = async (id) => {
  if (!id) return;
  detailLoading.value = true;
  try {
    const response = await CustomersGetByID(id);
    const detail = response?.data?.data ?? response?.data ?? response;
    if (detail) fillFormFromRecord(mapCustomerFromApi(detail));
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "讀取失敗", message: extractError(error, "無法取得客戶資料") });
  } finally {
    detailLoading.value = false;
  }
}; //取得單筆資料
const changeActiveTab = (tabId) => (activeTab.value = tabId); //切換表單頁籤
const toggleCategorySelection = (category) => (categoriesForm.value = toggleArrayItem(categoriesForm.value, category)); //切換客戶類別
const toggleDeliveryDay = (day) => (deliveryDaysForm.value = toggleArrayItem(deliveryDaysForm.value, day)); //切換出貨星期
const updateCompanyRegisteredDate = (value) => {
  basicForm.value.companyForm.registeredDate = value || "";
}; //更新公司註冊日
const addFormItem = (target, template) => {
  const nextItem = { ...template, id: Date.now() };
  if (Array.isArray(target)) {
    target.push(nextItem);
  } else if (target && Array.isArray(target.value)) {
    target.value = [...target.value, nextItem];
  }
}; //新增通用項目
const addContact = () => addFormItem(basicForm.value.contactsForm, { ...contactsFormTemplate, isPrimary: false }); //新增聯絡人
const removeContact = (index) => {
  if (basicForm.value.contactsForm.length === 1) return;
  basicForm.value.contactsForm = basicForm.value.contactsForm.filter((_, i) => i !== index);
  if (!basicForm.value.contactsForm.some((contact) => contact.isPrimary) && basicForm.value.contactsForm.length) {
    basicForm.value.contactsForm[0].isPrimary = true;
  }
}; //移除聯絡人
const setPrimaryContact = (index) => {
  basicForm.value.contactsForm = basicForm.value.contactsForm.map((contact, i) => ({ ...contact, isPrimary: i === index }));
}; //設定主要聯絡人
const addCustomPrice = () => addFormItem(customPriceForm, { productId: "", adjustment: 0 }); //新增自訂價格
const removeCustomPrice = (id) => {
  customPriceForm.value = customPriceForm.value.filter((item) => item.id !== id);
}; //移除自訂價格

/** 新增編輯執行相關 **/
const dialogMode = ref("create"); //彈窗模式
const dialogVisible = ref(false); //彈窗狀態
watch(dialogVisible, (visible) => {
  if (!visible) {
    basicFormRef.value?.clearValidate?.();
  }
}); //彈窗關閉時重置驗證
const openCreateDialog = () => {
  dialogMode.value = "create";
  editingCustomerId.value = null;
  resetForm();
  dialogVisible.value = true;
}; //開啟新增
const openEditDialog = (customer) => {
  dialogMode.value = "edit";
  editingCustomerId.value = customer.id;
  fillFormFromRecord(customer);
  activeTab.value = "contact";
  dialogVisible.value = true;
  loadCustomerDetail(customer.id);
}; //開啟編輯
const closeDialog = () => (dialogVisible.value = false); //關閉彈窗
const deleteCustomer = async (id) => {
  if (!id) return;
  mainStore.setLoading(true);
  try {
    await CustomersDeleteById(id);
    Notify({ type: "success", title: "客戶已刪除" });
    await getAPI();
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "刪除失敗", message: extractError(error, "無法刪除該客戶") });
  } finally {
    mainStore.setLoading(false);
  }
}; //刪除客戶
const preparePayload = () => {
  const formContacts = basicForm.value.contactsForm.length ? basicForm.value.contactsForm : [{ ...contactsFormTemplate }];
  const primaryContact = formContacts.find((contact) => contact.isPrimary) || formContacts[0];
  const companyForm = basicForm.value.companyForm;
  const otherForm = basicForm.value.otherForm;
  const metaForm = basicForm.value.metaForm || metaFormTemplate;
  const payload = {
    name: companyForm.companyName || primaryContact?.name || "未命名客戶", //公司名稱
    type: metaForm.type || metaFormTemplate.type, //客戶類型
    segment: metaForm.segment || metaFormTemplate.segment, //客戶分類
    source: metaForm.source || metaFormTemplate.source, //客戶來源
    contactInfo: {
      phone: companyForm.companyPhone || primaryContact?.phone || undefined,
      email: companyForm.companyEmail || primaryContact?.email || undefined
    }, //聯絡人列表
    address: {
      street: companyForm.companyAddress || "",
      city: "",
      state: "",
      zipCode: "",
      country: "TW"
    },
    taxId: companyForm.taxId || undefined,
    notes: otherForm.note || undefined,
    salesRepId: metaForm.salesRepId || undefined,
    customFields: {
      contacts: formContacts,
      categories: categoriesForm.value,
      paymentMethod: otherForm.paymentMethod,
      deposit: Number(otherForm.deposit || 0),
      invoiceTitle: otherForm.invoiceTitle,
      invoiceTaxId: otherForm.invoiceTaxId,
      deliveryDays: deliveryDaysForm.value,
      customPrices: customPriceForm.value,
      registeredDate: companyForm.registeredDate,
      companyAddress: companyForm.companyAddress
    }
  };
  const tagValues = parseTagsInput(metaForm.tags);
  if (tagValues.length) {
    payload.tags = tagValues;
  }
  if (dialogMode.value === "edit" && metaForm.status) {
    payload.status = metaForm.status;
  }
  return payload;
}; //處理儲存欄位格式
const submitFormInternal = async () => {
  try {
    await basicFormRef.value?.validate?.();
  } catch {
    return;
  }
  if (!basicForm.value.contactsForm[0]?.name || !basicForm.value.companyForm.companyName) {
    Notify({ type: "warning", title: "請填寫必要欄位" });
    return;
  }
  const payload = preparePayload();
  isSaving.value = true;
  try {
    if (dialogMode.value === "edit" && editingCustomerId.value) {
      await CustomersUpdatePatch(editingCustomerId.value, payload);
      Notify({ type: "success", title: "客戶資料已更新" });
    } else {
      await CustomersCreatePost(payload);
      Notify({ type: "success", title: "已新增客戶" });
    }
    dialogVisible.value = false;
    await getAPI();
  } catch (error) {
    console.error(error);
    Notify({ type: "error", title: "儲存失敗", message: extractError(error, "無法儲存客戶資料") });
  } finally {
    isSaving.value = false;
  }
}; //新增編輯儲存
const saveData = debounce(submitFormInternal, 300, { leading: true, trailing: false }); //新增編輯儲存-防抖

onMounted(getAPI);
</script>
