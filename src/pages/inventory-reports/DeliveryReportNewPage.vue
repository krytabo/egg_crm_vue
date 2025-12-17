<!-- src/pages/inventory-reports/DeliveryReportNewPage.vue 司機送貨報表（加強版） -->
<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button as TinyButton } from '@/components/ui/button'
import { Input as TinyInput } from '@/components/ui/input'
import { Select as TinySelect } from '@/components/ui/select'
import { DialogBox as TinyDialogBox } from '@/components/ui/dialog-box'
import { Checkbox as TinyCheckbox } from '@/components/ui/checkbox'
import { Badge as TinyBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { IconAdd, IconChevronDown, IconChevronRight, IconPrintPreview, IconEdit, IconLink, IconBoxSolid, IconView, IconSearch } from '@opentiny/vue-icon'
import Notify from '@opentiny/vue-notify'
import DailyShippingReportEnhanced from '@/components/dialogs/DailyShippingReportEnhanced.vue'

/** 常數設定 **/
const weekDayOptions = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'] //出貨星期
const mockExistingOrders = [
  { id: 1001, type: '桶裝水', customer: '林氏企業', orderDate: '2025-01-15', status: '待出貨', products: [{ productId: 1, productName: '清泉 20L', quantity: 5, unitPrice: 140 }] },
  { id: 1002, type: '雞蛋', customer: '黃記商行', orderDate: '2025-01-16', status: '待出貨', products: [{ productId: 2, productName: '紅殼蛋 10入/盒', quantity: 20, unitPrice: 50 }] },
  { id: 1003, type: '桶裝水', customer: '建國工廠', orderDate: '2025-01-17', status: '待出貨', products: [{ productId: 1, productName: '清泉 20L', quantity: 10, unitPrice: 145 }] }
] //既有訂單
const mockReports = [
  {
    id: 1,
    employeeId: 5,
    employeeName: '劉司機',
    reportDate: '2025-01-20',
    weekDays: '星期一、星期三',
    products: [
      { productId: 1, productName: '清泉 20L', customerName: '林氏企業', customerId: 1, quantity: 10, unitPrice: 140, amount: 1400, actualAmount: 1400, paymentMethod: '月結', note: '', isConvertedToOrder: true, orderId: 101 },
      { productId: 3, productName: '紅殼蛋 10入/盒', customerName: '黃記商行', customerId: 2, quantity: 20, unitPrice: 60, amount: 1200, actualAmount: 1200, paymentMethod: '現金', note: '', isConvertedToOrder: false, orderId: null }
    ],
    totalAmount: 2600,
    fuelExpense: 500,
    otherExpense: 100
  },
  {
    id: 2,
    employeeId: 9,
    employeeName: '趙小芬',
    reportDate: '2025-01-20',
    weekDays: '星期二、星期四',
    products: [
      { productId: 2, productName: '純淨 20L', customerName: '建國工廠', customerId: 3, quantity: 15, unitPrice: 150, amount: 2250, actualAmount: 2250, paymentMethod: '現金', note: '急件', isConvertedToOrder: false, orderId: null }
    ],
    totalAmount: 2250,
    fuelExpense: 300,
    otherExpense: 50
  },
  {
    id: 3,
    employeeId: 5,
    employeeName: '劉司機',
    reportDate: '2025-01-22',
    weekDays: '星期一、星期三',
    products: [
      { productId: 1, productName: '清泉 20L', customerName: '林氏企業', customerId: 1, quantity: 25, unitPrice: 140, amount: 3500, actualAmount: 3500, paymentMethod: '月結', note: '', isConvertedToOrder: true, orderId: 101 },
      { productId: 3, productName: '紅殼蛋 10入', customerName: '陳氏餐飲', customerId: 3, quantity: 30, unitPrice: 85, amount: 2550, actualAmount: 2550, paymentMethod: '現金', note: '', isConvertedToOrder: false, orderId: null }
    ],
    totalAmount: 6050,
    fuelExpense: 400,
    otherExpense: 100
  }
] //預設報表
const todayDate = '2025-01-20' //當日日期

/** 狀態管理 **/
const router = useRouter()
const reports = ref([...mockReports])
const filters = reactive({ employeeName: '', dateFrom: '', dateTo: '', selectedWeekDays: [] })
const sortConfig = ref(null)
const expandedReports = ref(new Set())
const createDialogVisible = ref(false)
const printDialogVisible = ref(false)
const printingReport = ref(null)
const editingDialogVisible = ref(false)
const editingReport = ref(null)
const editingActiveGroup = ref('')
const convertDialogVisible = ref(false)
const convertingReport = ref(null)
const selectedProductsForConvert = ref([])
const convertMode = ref('new')
const selectedExistingOrder = ref(null)
const orderSearchTerm = ref('')
const orderSearchDialogVisible = ref(false)

/** 計算資料 **/
const stats = computed(() => {
  const todayReports = reports.value.filter((report) => report.reportDate === todayDate)
  return {
    todayReports: todayReports.length,
    todayAmount: todayReports.reduce((sum, report) => sum + report.totalAmount, 0),
    totalReports: reports.value.length,
    totalAmount: reports.value.reduce((sum, report) => sum + report.totalAmount, 0)
  }
}) //統計資訊

const filteredReports = computed(() => {
  let result = [...reports.value]
  if (filters.employeeName) {
    result = result.filter((report) => report.employeeName.includes(filters.employeeName))
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    result = result.filter((report) => new Date(report.reportDate) >= from)
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    result = result.filter((report) => new Date(report.reportDate) <= to)
  }
  if (filters.selectedWeekDays.length) {
    result = result.filter((report) => filters.selectedWeekDays.some((day) => report.weekDays.includes(day)))
  }
  if (!sortConfig.value) return result
  return result.sort((a, b) => {
    const { key, direction } = sortConfig.value
    const dir = direction === 'asc' ? 1 : -1
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return -1 * dir
    if (aVal > bVal) return 1 * dir
    return 0
  })
}) //篩選後報表

const groupedProducts = computed(() => {
  if (!editingReport.value) return {}
  return editingReport.value.products.reduce((acc, product, index) => {
    if (!acc[product.productName]) {
      acc[product.productName] = []
    }
    acc[product.productName].push({ ...product, originalIndex: index })
    return acc
  }, {})
}) //編輯中的商品分組

const existingOrderResults = computed(() => {
  if (!orderSearchTerm.value) return mockExistingOrders
  return mockExistingOrders.filter(
    (order) => order.customer.toLowerCase().includes(orderSearchTerm.value.toLowerCase()) || String(order.id).includes(orderSearchTerm.value)
  )
}) //既有訂單搜尋

/** 工具函式 **/
const currency = (val) => `NT$${Number(val || 0).toLocaleString()}` //金額格式
const isWeekDaySelected = (day) => filters.selectedWeekDays.includes(day) //星期是否選取
const toggleWeekDaySelection = (day) => {
  if (isWeekDaySelected(day)) {
    filters.selectedWeekDays = filters.selectedWeekDays.filter((item) => item !== day)
  } else {
    filters.selectedWeekDays = [...filters.selectedWeekDays, day]
  }
} //切換星期
const clearWeekDays = () => {
  filters.selectedWeekDays = []
} //清除星期
const toggleExpand = (id) => {
  const next = new Set(expandedReports.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedReports.value = next
} //展開列
const isReportExpanded = (id) => expandedReports.value.has(id) //判斷展開
const handleSort = (key) => {
  if (sortConfig.value && sortConfig.value.key === key) {
    sortConfig.value = { key, direction: sortConfig.value.direction === 'asc' ? 'desc' : 'asc' }
  } else {
    sortConfig.value = { key, direction: 'asc' }
  }
} //切換排序
const openCreateDialog = () => {
  createDialogVisible.value = true
} //新增報表
const handleReportCreated = (payload) => {
  const newId = Math.max(...reports.value.map((report) => report.id)) + 1
  const flatProducts = payload.products.flatMap((product) =>
    product.rows.map((row) => ({
      productId: Math.floor(Math.random() * 1000),
      productName: product.productName,
      customerName: row.customer,
      customerId: Math.floor(Math.random() * 1000),
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      actualAmount: 0,
      paymentMethod: row.paymentMethod,
      note: '',
      isConvertedToOrder: false,
      orderId: null
    }))
  )
  reports.value = [
    { id: newId, employeeId: payload.employeeId, employeeName: payload.employeeName, reportDate: payload.date, weekDays: payload.weekDayLabel, products: flatProducts, totalAmount: 0, fuelExpense: 0, otherExpense: 0 },
    ...reports.value
  ]
} //接收新增
const handleEdit = (report) => {
  editingReport.value = JSON.parse(JSON.stringify(report))
  editingActiveGroup.value = report.products[0]?.productName || ''
  editingDialogVisible.value = true
} //開啟編輯
const closeEditingDialog = () => {
  editingDialogVisible.value = false
  editingReport.value = null
} //關閉編輯
const handleSaveEdit = () => {
  if (!editingReport.value) return
  reports.value = reports.value.map((report) => (report.id === editingReport.value.id ? editingReport.value : report))
  closeEditingDialog()
  Notify({ type: 'success', title: '報表已更新' })
} //儲存編輯
const addProductCategory = () => {
  if (!editingReport.value) return
  const productName = window.prompt('請輸入新商品名稱')
  if (!productName) return
  editingReport.value.products.push({
    productId: Date.now(),
    productName,
    customerName: '',
    customerId: 0,
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    actualAmount: 0,
    paymentMethod: '現金',
    note: '',
    isConvertedToOrder: false,
    orderId: null
  })
  editingActiveGroup.value = productName
} //新增商品類別
const addCustomerToProduct = (productName) => {
  if (!editingReport.value) return
  const template = editingReport.value.products.find((product) => product.productName === productName)
  editingReport.value.products.push({
    productId: Date.now(),
    productName,
    customerName: '',
    customerId: 0,
    quantity: 0,
    unitPrice: template?.unitPrice || 0,
    amount: 0,
    actualAmount: 0,
    paymentMethod: template?.paymentMethod || '現金',
    note: '',
    isConvertedToOrder: false,
    orderId: null
  })
} //新增客戶
const deleteProductCategory = (productName) => {
  if (!editingReport.value) return
  if (!window.confirm(`確定要刪除「${productName}」相關的記錄嗎？`)) return
  editingReport.value.products = editingReport.value.products.filter((product) => product.productName !== productName)
  editingActiveGroup.value = editingReport.value.products[0]?.productName || ''
} //刪除商品類別
const deleteCustomerFromProduct = (index) => {
  if (!editingReport.value) return
  editingReport.value.products.splice(index, 1)
} //刪除客戶
const updateProductField = (index, field, value) => {
  if (!editingReport.value) return
  const product = editingReport.value.products[index]
  product[field] = value
  if (field === 'quantity' || field === 'unitPrice') {
    product.amount = Number(product.quantity || 0) * Number(product.unitPrice || 0)
  }
  if (field === 'quantity' || field === 'unitPrice' || field === 'actualAmount') {
    product.actualAmount = Number(product.actualAmount || product.amount || 0)
  }
  editingReport.value.products.splice(index, 1, { ...product })
  editingReport.value.totalAmount = editingReport.value.products.reduce((sum, item) => sum + Number(item.actualAmount || 0), 0)
} //更新欄位
const buildEditLink = (report) => {
  const uuid = `report-${report.id}-${Date.now()}`
  const resolved = router.resolve({ name: 'delivery-report-edit', params: { uuid } })
  return `${window.location.origin}${resolved.href}`
} //產生連結
const handleCopyLink = (report) => {
  const editUrl = buildEditLink(report)
  navigator.clipboard
    .writeText(editUrl)
    .then(() => Notify({ type: 'success', title: '鏈接已複製' }))
    .catch(() => Notify({ type: 'warning', title: '複製失敗，請手動複製' }))
} //複製連結
const handlePrint = (report) => {
  printingReport.value = report
  printDialogVisible.value = true
} //開啟列印
const closePrintDialog = () => {
  printDialogVisible.value = false
  printingReport.value = null
} //關閉列印
const handleDoPrint = () => {
  window.print()
  closePrintDialog()
  Notify({ type: 'success', title: '已送出列印' })
} //列印動作
const handleConvertToOrder = (report) => {
  convertingReport.value = report
  selectedProductsForConvert.value = []
  convertMode.value = 'new'
  selectedExistingOrder.value = null
  convertDialogVisible.value = true
} //開啟轉入訂單
const closeConvertDialog = () => {
  convertDialogVisible.value = false
  convertingReport.value = null
  selectedProductsForConvert.value = []
  selectedExistingOrder.value = null
} //關閉轉入
const toggleProductForConvert = (index) => {
  if (selectedProductsForConvert.value.includes(index)) {
    selectedProductsForConvert.value = selectedProductsForConvert.value.filter((idx) => idx !== index)
  } else {
    selectedProductsForConvert.value = [...selectedProductsForConvert.value, index]
  }
} //勾選商品
const isProductSelectedForConvert = (index) => selectedProductsForConvert.value.includes(index) //商品是否選中
const handleDoConvert = () => {
  if (!convertingReport.value || !selectedProductsForConvert.value.length) {
    Notify({ type: 'warning', title: '請選擇要轉入的商品' })
    return
  }
  if (convertMode.value === 'existing' && !selectedExistingOrder.value) {
    Notify({ type: 'warning', title: '請選擇要加入的訂單' })
    return
  }
  const updated = { ...convertingReport.value }
  selectedProductsForConvert.value.forEach((index) => {
    updated.products[index] = {
      ...updated.products[index],
      isConvertedToOrder: true,
      orderId: convertMode.value === 'new' ? Math.floor(Math.random() * 1000) + 200 : selectedExistingOrder.value.id
    }
  })
  reports.value = reports.value.map((report) => (report.id === updated.id ? updated : report))
  closeConvertDialog()
  Notify({ type: 'success', title: convertMode.value === 'new' ? '已建立新訂單' : '已加入既有訂單' })
} //執行轉入
const handleSearchExistingOrder = () => {
  orderSearchTerm.value = ''
  orderSearchDialogVisible.value = true
} //搜尋既有訂單
const handleSelectExistingOrder = (order) => {
  selectedExistingOrder.value = order
  orderSearchDialogVisible.value = false
  Notify({ type: 'success', title: `已選擇訂單 #${order.id}` })
} //選擇訂單
const closeOrderSearchDialog = () => {
  orderSearchDialogVisible.value = false
} //關閉搜尋
const handleViewOrder = (orderId) => {
  Notify({ type: 'info', title: `檢視訂單 #${orderId}`, message: '可在訂單管理頁面查看詳情' })
} //檢視訂單
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="space-y-2">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">司機送貨報表（加強版）</h1>
        <p class="text-sm text-gray-500">利用強化版建立流程，加速產生報表並轉入訂單</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 rounded-md border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900">
        <IconView class="tiny-svg-size" />
        <span>此頁面採用「加強版」建立流程：支援多商品/多客戶選取、快速星期篩選與預覽，再交由報表列表統一管理。</span>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-gray-500">今日報表</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold text-gray-900">{{ stats.todayReports }}</p>
          <p class="mt-1 text-xs text-gray-500">筆</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-gray-500">今日總額</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold text-gray-900">{{ currency(stats.todayAmount) }}</p>
          <p class="mt-1 text-xs text-gray-500">總金額</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-gray-500">總報表數</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold text-gray-900">{{ stats.totalReports }}</p>
          <p class="mt-1 text-xs text-gray-500">筆</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-gray-500">累計金額</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold text-gray-900">{{ currency(stats.totalAmount) }}</p>
          <p class="mt-1 text-xs text-gray-500">累計</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>出貨日報表列表</CardTitle>
          <TinyButton type="primary" class="gap-1" @click="openCreateDialog">
            <IconAdd class="tiny-svg-size" /> 新增出貨日報表
          </TinyButton>
        </div>
        <div class="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <IconSearch class="tiny-svg-size" />
          <span><strong>操作提示：</strong>使用編輯按鈕進入報表編輯頁面；複製鏈接可分享給其他裝置；使用「轉入訂單」將商品建立或加入訂單。</span>
        </div>
      </CardHeader>
      <CardContent>
        <div class="mb-4 grid gap-4 md:grid-cols-4">
          <div class="space-y-1">
            <p class="text-xs text-gray-500">員工姓名</p>
            <TinyInput v-model="filters.employeeName" placeholder="篩選員工..." />
          </div>
          <div class="space-y-1">
            <p class="text-xs text-gray-500">起始日期</p>
            <TinyInput type="date" v-model="filters.dateFrom" />
          </div>
          <div class="space-y-1">
            <p class="text-xs text-gray-500">結束日期</p>
            <TinyInput type="date" v-model="filters.dateTo" />
          </div>
          <div class="space-y-1">
            <p class="text-xs text-gray-500">出貨星期</p>
            <div class="rounded border p-2">
              <div class="flex flex-wrap gap-1">
                <TinyButton
                  v-for="day in weekDayOptions"
                  :key="day"
                  size="small"
                  :type="isWeekDaySelected(day) ? 'primary' : 'text'"
                  @click="toggleWeekDaySelection(day)">
                  {{ day }}
                </TinyButton>
              </div>
              <TinyButton v-if="filters.selectedWeekDays.length" size="small" type="text" class="mt-1" @click="clearWeekDays">清除</TinyButton>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border">
          <table class="min-w-full divide-y">
            <thead class="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th class="w-12" />
                <th class="px-3 py-2">
                  <TinyButton type="text" size="small" class="gap-1" @click="handleSort('id')">
                    報表ID <IconChevronDown class="tiny-svg-size" />
                  </TinyButton>
                </th>
                <th class="px-3 py-2">
                  <TinyButton type="text" size="small" class="gap-1" @click="handleSort('employeeName')">
                    員工姓名 <IconChevronDown class="tiny-svg-size" />
                  </TinyButton>
                </th>
                <th class="px-3 py-2">
                  <TinyButton type="text" size="small" class="gap-1" @click="handleSort('reportDate')">
                    日期 <IconChevronDown class="tiny-svg-size" />
                  </TinyButton>
                </th>
                <th class="px-3 py-2">出貨星期</th>
                <th class="px-3 py-2">
                  <TinyButton type="text" size="small" class="gap-1" @click="handleSort('totalAmount')">
                    總金額 <IconChevronDown class="tiny-svg-size" />
                  </TinyButton>
                </th>
                <th class="px-3 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y bg-white text-sm">
              <template v-if="filteredReports.length">
                <template v-for="report in filteredReports" :key="report.id">
                  <tr>
                    <td class="px-3 py-2">
                      <TinyButton type="text" size="small" @click="toggleExpand(report.id)">
                        <IconChevronDown v-if="isReportExpanded(report.id)" class="tiny-svg-size" />
                        <IconChevronRight v-else class="tiny-svg-size" />
                      </TinyButton>
                    </td>
                    <td class="px-3 py-2">#{{ report.id }}</td>
                    <td class="px-3 py-2">{{ report.employeeName }}</td>
                    <td class="px-3 py-2">{{ report.reportDate }}</td>
                    <td class="px-3 py-2">{{ report.weekDays }}</td>
                    <td class="px-3 py-2">{{ currency(report.totalAmount) }}</td>
                    <td class="px-3 py-2">
                      <div class="flex justify-end gap-2">
                        <TinyButton type="text" size="small" title="列印" @click="handlePrint(report)">
                          <IconPrintPreview class="tiny-svg-size" />
                        </TinyButton>
                        <TinyButton type="text" size="small" class="text-blue-500" title="編輯" @click="handleEdit(report)">
                          <IconEdit class="tiny-svg-size" />
                        </TinyButton>
                        <TinyButton type="text" size="small" class="text-purple-500" title="複製鏈接" @click="handleCopyLink(report)">
                          <IconLink class="tiny-svg-size" />
                        </TinyButton>
                        <TinyButton type="text" size="small" class="text-green-500" title="轉入訂單" @click="handleConvertToOrder(report)">
                          <IconBoxSolid class="tiny-svg-size" />
                        </TinyButton>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="isReportExpanded(report.id)">
                    <td colspan="7" class="bg-gray-50 px-6 py-4">
                      <h4 class="mb-3 text-sm font-medium text-gray-900">商品明細</h4>
                      <table class="min-w-full divide-y rounded-lg border bg-white text-xs">
                        <thead class="bg-gray-50 text-gray-500">
                          <tr>
                            <th class="px-3 py-2 text-left">商品名稱</th>
                            <th class="px-3 py-2 text-left">客戶</th>
                            <th class="px-3 py-2 text-left">數量</th>
                            <th class="px-3 py-2 text-left">單價</th>
                            <th class="px-3 py-2 text-left">金額</th>
                            <th class="px-3 py-2 text-left">付款方式</th>
                            <th class="px-3 py-2 text-left">狀態</th>
                            <th class="px-3 py-2 text-left">訂單ID</th>
                            <th class="px-3 py-2 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y">
                          <tr v-for="(product, idx) in report.products" :key="idx">
                            <td class="px-3 py-2">{{ product.productName }}</td>
                            <td class="px-3 py-2">{{ product.customerName }}</td>
                            <td class="px-3 py-2">{{ product.quantity }}</td>
                            <td class="px-3 py-2">{{ currency(product.unitPrice) }}</td>
                            <td class="px-3 py-2">{{ currency(product.amount) }}</td>
                            <td class="px-3 py-2">{{ product.paymentMethod }}</td>
                            <td class="px-3 py-2">
                              <TinyBadge v-if="product.isConvertedToOrder" type="success">已轉入</TinyBadge>
                              <TinyBadge v-else type="warning">未轉入</TinyBadge>
                            </td>
                            <td class="px-3 py-2">{{ product.orderId ? `#${product.orderId}` : '-' }}</td>
                            <td class="px-3 py-2 text-right">
                              <TinyButton
                                v-if="product.isConvertedToOrder && product.orderId"
                                type="text"
                                size="small"
                                @click="handleViewOrder(product.orderId)">
                                <IconView class="tiny-svg-size" /> 檢視
                              </TinyButton>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </template>
              </template>
              <tr v-else>
                <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">尚無符合條件的報表</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <DailyShippingReportEnhanced v-model="createDialogVisible" @report-created="handleReportCreated" />

    <TinyDialogBox v-model:visible="printDialogVisible" :title="printingReport ? `列印報表 #${printingReport.id}` : '列印報表'" width="720px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closePrintDialog">取消</TinyButton>
          <TinyButton type="primary" @click="handleDoPrint">
            <IconPrintPreview class="tiny-svg-size mr-1" /> 列印
          </TinyButton>
        </div>
      </template>

      <div v-if="printingReport" class="space-y-4">
        <div class="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p class="text-gray-500">司機</p>
            <p class="font-medium text-gray-900">{{ printingReport.employeeName }}</p>
          </div>
          <div>
            <p class="text-gray-500">日期</p>
            <p class="font-medium text-gray-900">{{ printingReport.reportDate }}</p>
          </div>
          <div>
            <p class="text-gray-500">出貨星期</p>
            <p class="font-medium text-gray-900">{{ printingReport.weekDays }}</p>
          </div>
          <div>
            <p class="text-gray-500">總金額</p>
            <p class="font-medium text-gray-900">{{ currency(printingReport.totalAmount) }}</p>
          </div>
        </div>
        <div class="rounded-lg border">
          <table class="min-w-full divide-y text-xs">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-3 py-2 text-left">商品</th>
                <th class="px-3 py-2 text-left">客戶</th>
                <th class="px-3 py-2 text-left">數量</th>
                <th class="px-3 py-2 text-left">金額</th>
                <th class="px-3 py-2 text-left">備註</th>
              </tr>
            </thead>
            <tbody class="divide-y bg-white">
              <tr v-for="(product, idx) in printingReport.products" :key="idx">
                <td class="px-3 py-2">{{ product.productName }}</td>
                <td class="px-3 py-2">{{ product.customerName }}</td>
                <td class="px-3 py-2">{{ product.quantity }}</td>
                <td class="px-3 py-2">{{ currency(product.amount) }}</td>
                <td class="px-3 py-2">{{ product.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">尚未選擇報表</p>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="editingDialogVisible" :title="editingReport ? `編輯報表 #${editingReport.id}` : '編輯報表'" width="960px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeEditingDialog">取消</TinyButton>
          <TinyButton type="primary" @click="handleSaveEdit">儲存</TinyButton>
        </div>
      </template>

      <div v-if="editingReport" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ editingReport.employeeName }} · {{ editingReport.reportDate }} ({{ editingReport.weekDays }})</p>
            <p class="text-sm font-medium text-gray-900">總金額：{{ currency(editingReport.totalAmount) }}</p>
          </div>
          <TinyButton type="text" @click="addProductCategory">
            <IconAdd class="tiny-svg-size mr-1" /> 新增商品類別
          </TinyButton>
        </div>
        <div class="flex flex-wrap gap-2 border-b pb-2">
          <TinyButton
            v-for="(products, productName) in groupedProducts"
            :key="productName"
            :type="editingActiveGroup === productName ? 'primary' : 'text'"
            @click="editingActiveGroup = productName">
            {{ productName }}
          </TinyButton>
        </div>
        <template v-if="Object.keys(groupedProducts).length">
          <div
            v-for="(products, productName) in groupedProducts"
            :key="`group-${productName}`"
            v-show="editingActiveGroup === productName"
            class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium">{{ productName }}</h3>
              <div class="flex gap-2">
                <TinyButton type="text" @click="addCustomerToProduct(productName)">
                  <IconAdd class="tiny-svg-size mr-1" /> 新增客戶
                </TinyButton>
                <TinyButton type="text" class="text-red-500" @click="deleteProductCategory(productName)">刪除此商品</TinyButton>
              </div>
            </div>
            <div class="overflow-x-auto rounded-md border">
              <table class="min-w-full divide-y text-xs">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="px-3 py-2">客戶</th>
                    <th class="px-3 py-2">數量</th>
                    <th class="px-3 py-2">單價</th>
                    <th class="px-3 py-2">金額</th>
                    <th class="px-3 py-2">實際收付</th>
                    <th class="px-3 py-2">收付方式</th>
                    <th class="px-3 py-2">備註</th>
                    <th class="px-3 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="product in products" :key="product.originalIndex">
                    <td class="px-3 py-2">
                      <TinyInput :model-value="product.customerName" placeholder="客戶名稱" @update:model-value="(val) => updateProductField(product.originalIndex, 'customerName', val)" />
                    </td>
                    <td class="px-3 py-2">
                      <TinyInput type="number" :model-value="product.quantity" min="0" @update:model-value="(val) => updateProductField(product.originalIndex, 'quantity', Number(val) || 0)" />
                    </td>
                    <td class="px-3 py-2">
                      <TinyInput type="number" :model-value="product.unitPrice" min="0" @update:model-value="(val) => updateProductField(product.originalIndex, 'unitPrice', Number(val) || 0)" />
                    </td>
                    <td class="px-3 py-2">{{ currency(product.amount) }}</td>
                    <td class="px-3 py-2">
                      <TinyInput type="number" :model-value="product.actualAmount" min="0" placeholder="實際收付" @update:model-value="(val) => updateProductField(product.originalIndex, 'actualAmount', Number(val) || 0)" />
                    </td>
                    <td class="px-3 py-2">
                      <TinySelect
                        :model-value="product.paymentMethod"
                        :options="[
                          { label: '現金', value: '現金' },
                          { label: '月結', value: '月結' },
                          { label: '轉帳', value: '轉帳' }
                        ]"
                        @update:model-value="(val) => updateProductField(product.originalIndex, 'paymentMethod', val)" />
                    </td>
                    <td class="px-3 py-2">
                      <TinyInput :model-value="product.note" placeholder="輸入備註..." @update:model-value="(val) => updateProductField(product.originalIndex, 'note', val)" />
                    </td>
                    <td class="px-3 py-2 text-right">
                      <TinyButton type="text" class="text-red-500" @click="deleteCustomerFromProduct(product.originalIndex)">刪除</TinyButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-gray-500">尚未有商品資料</p>
      </div>
      <p v-else class="text-sm text-gray-500">請先選擇要編輯的報表</p>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="convertDialogVisible" title="轉入訂單" width="900px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeConvertDialog">取消</TinyButton>
          <TinyButton type="primary" @click="handleDoConvert">確認轉入</TinyButton>
        </div>
      </template>

      <div v-if="convertingReport" class="space-y-5">
        <div>
          <h3 class="text-sm font-medium mb-2">步驟一：選擇商品</h3>
          <div class="rounded border">
            <table class="min-w-full divide-y text-xs">
              <thead class="bg-gray-50 text-gray-500">
                <tr>
                  <th class="w-10 px-3 py-2" />
                  <th class="px-3 py-2 text-left">商品</th>
                  <th class="px-3 py-2 text-left">客戶</th>
                  <th class="px-3 py-2 text-left">數量</th>
                  <th class="px-3 py-2 text-left">金額</th>
                  <th class="px-3 py-2 text-left">狀態</th>
                </tr>
              </thead>
              <tbody class="divide-y bg-white">
                <tr v-for="(product, index) in convertingReport.products" :key="index">
                  <td class="px-3 py-2 text-center">
                    <TinyCheckbox
                      :model-value="isProductSelectedForConvert(index)"
                      :disabled="product.isConvertedToOrder"
                      @update:model-value="() => toggleProductForConvert(index)" />
                  </td>
                  <td class="px-3 py-2">{{ product.productName }}</td>
                  <td class="px-3 py-2">{{ product.customerName }}</td>
                  <td class="px-3 py-2">{{ product.quantity }}</td>
                  <td class="px-3 py-2">{{ currency(product.amount) }}</td>
                  <td class="px-3 py-2">
                    <TinyBadge v-if="product.isConvertedToOrder" type="success">已轉入</TinyBadge>
                    <TinyBadge v-else type="info">未轉入</TinyBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-xs text-gray-500">已選擇 {{ selectedProductsForConvert.length }} 個商品</p>
        </div>

        <div class="space-y-3 border-t pt-4">
          <h3 class="text-sm font-medium">步驟二：選擇處理方式</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              class="cursor-pointer rounded-lg border-2 p-4"
              :class="convertMode === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              @click="convertMode = 'new'">
              <h4 class="mb-1 text-sm font-medium">建立新訂單</h4>
              <p class="text-xs text-gray-500">將所選商品建立為新的訂單</p>
            </div>
            <div
              class="cursor-pointer rounded-lg border-2 p-4"
              :class="convertMode === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              @click="convertMode = 'existing'">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="mb-1 text-sm font-medium">加入既有訂單</h4>
                  <p class="text-xs text-gray-500">選擇既有訂單繼續累計</p>
                </div>
                <TinyButton type="text" size="small" @click.stop="handleSearchExistingOrder">選擇訂單</TinyButton>
              </div>
              <div v-if="selectedExistingOrder" class="mt-2 rounded border bg-white p-2 text-xs">
                <p>訂單 #{{ selectedExistingOrder.id }}</p>
                <p>{{ selectedExistingOrder.customer }}</p>
              </div>
              <p v-else class="mt-2 text-xs text-gray-500">尚未選擇訂單</p>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">請選擇報表後再操作</p>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="orderSearchDialogVisible" title="搜尋既有訂單" width="520px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeOrderSearchDialog">關閉</TinyButton>
        </div>
      </template>

      <div class="space-y-3">
        <TinyInput placeholder="輸入訂單編號或客戶..." v-model="orderSearchTerm" />
        <div class="max-h-64 space-y-2 overflow-y-auto">
          <div v-for="order in existingOrderResults" :key="order.id" class="rounded border p-3">
            <div class="flex items-center justify-between text-sm">
              <div>
                <p class="font-medium">#{{ order.id }} · {{ order.customer }}</p>
                <p class="text-xs text-gray-500">{{ order.type }} · {{ order.orderDate }}</p>
              </div>
              <TinyButton type="text" @click="handleSelectExistingOrder(order)">選擇</TinyButton>
            </div>
          </div>
          <p v-if="!existingOrderResults.length" class="text-xs text-gray-500">沒有符合的訂單</p>
        </div>
      </div>
    </TinyDialogBox>
  </div>
</template>
