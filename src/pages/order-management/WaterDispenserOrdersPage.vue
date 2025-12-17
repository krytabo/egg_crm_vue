<!-- src/pages/order-management/WaterDispenserOrdersPage.vue 飲水機訂單管理 -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button as TinyButton } from '@/components/ui/button'
import { Input as TinyInput } from '@/components/ui/input'
import { Select as TinySelect } from '@/components/ui/select'
import { Checkbox as TinyCheckbox } from '@/components/ui/checkbox'
import { DialogBox as TinyDialogBox } from '@/components/ui/dialog-box'
import { Badge as TinyBadge } from '@/components/ui/badge'
import AppPagination from '@/components/ui/AppPagination.vue'
import { IconAdd, IconEdit, IconDelete, IconChevronDown, IconChevronRight, IconArrowUp, IconArrowDown } from '@opentiny/vue-icon'
import Notify from '@opentiny/vue-notify'

/** 常數資料 **/
const mockCustomers = [
  { id: 1, name: '王大明', company: '林氏企業' },
  { id: 2, name: '李美華', company: '黃記商行' },
  { id: 3, name: '張小玉', company: '建國工廠' },
  { id: 4, name: '陳小芬', company: '小芬商店' }
]
const mockVendors = [
  { id: 1, name: '優質飲水機' },
  { id: 2, name: '淨水科技' },
  { id: 3, name: '智能飲水' }
]
const mockDispenserProducts = [
  { id: 1, name: 'WD-2000 冷熱', retailPrice: 12000, unit: '台', currentStock: 15 },
  { id: 2, name: 'WD-3000 冷熱溫', retailPrice: 18000, unit: '台', currentStock: 10 },
  { id: 3, name: 'Premium-500 冷熱溫除菌', retailPrice: 26000, unit: '台', currentStock: 5 },
  { id: 4, name: 'Basic-100 冷熱', retailPrice: 8000, unit: '台', currentStock: 20 },
  { id: 5, name: 'Smart-Pro 智能冷熱溫', retailPrice: 32000, unit: '台', currentStock: 8 },
  { id: 6, name: '飲水機租賃（冷熱型）', retailPrice: 800, unit: '台/月', currentStock: 30 },
  { id: 7, name: '飲水機租賃（桌上型）', retailPrice: 500, unit: '台/月', currentStock: 40 }
]
const initialOrders = [
  {
    id: 1,
    orderNumber: 'DISP-2025-001',
    orderDate: '2025-01-05',
    shipDate: '2025-01-08',
    targetType: '客戶',
    targetId: 1,
    targetName: '王大明',
    targetCompany: '林氏企業',
    products: [
      { productId: 1, productName: 'WD-2000 冷熱', quantity: 2, retailPrice: 12000, actualPrice: 11500, subtotal: 23000, unit: '台' },
      { productId: 2, productName: 'WD-3000 冷熱溫', quantity: 1, retailPrice: 18000, actualPrice: 17000, subtotal: 17000, unit: '台' }
    ],
    totalAmount: 40000,
    shipAddress: '台北市信義區信義路100號',
    status: '已完成',
    note: '需要安裝服務',
    employeeId: 1,
    employeeName: '張小明'
  },
  {
    id: 2,
    orderNumber: 'DISP-2025-002',
    orderDate: '2025-01-12',
    shipDate: '2025-01-16',
    targetType: '客戶',
    targetId: 3,
    targetName: '張小玉',
    targetCompany: '建國工廠',
    products: [{ productId: 3, productName: 'Premium-500 冷熱溫除菌', quantity: 1, retailPrice: 26000, actualPrice: 25000, subtotal: 25000, unit: '台' }],
    totalAmount: 25000,
    shipAddress: '桃園市中壢區中央路80號',
    status: '待出貨',
    note: '',
    employeeId: 2,
    employeeName: '李美玲'
  },
  {
    id: 3,
    orderNumber: 'DISP-2025-003',
    orderDate: '2025-01-08',
    shipDate: '2025-01-11',
    targetType: '客戶',
    targetId: 2,
    targetName: '李美華',
    targetCompany: '黃記商行',
    products: [
      { productId: 5, productName: 'Smart-Pro 智能冷熱溫', quantity: 1, retailPrice: 32000, actualPrice: 30000, subtotal: 30000, unit: '台' },
      { productId: 4, productName: 'Basic-100 冷熱', quantity: 2, retailPrice: 8000, actualPrice: 7500, subtotal: 15000, unit: '台' }
    ],
    totalAmount: 45000,
    shipAddress: '新北市板橋區中山路50號',
    status: '已出貨',
    note: '客戶要求下午送達',
    employeeId: 3,
    employeeName: '王大華'
  },
  {
    id: 4,
    orderNumber: 'DISP-2025-004',
    orderDate: '2025-01-20',
    shipDate: '2025-01-23',
    targetType: '客戶',
    targetId: 3,
    targetName: '陳志明',
    targetCompany: '陳氏餐飲',
    products: [{ productId: 6, productName: '飲水機租賃（冷熱型）', quantity: 3, retailPrice: 800, actualPrice: 750, subtotal: 2250, unit: '台/月' }],
    totalAmount: 2250,
    shipAddress: '台中市西屯區文心路88號',
    status: '待出貨',
    note: '新分店開幕需求',
    employeeId: 2,
    employeeName: '李美玲'
  },
  {
    id: 5,
    orderNumber: 'DISP-2025-005',
    orderDate: '2025-01-25',
    shipDate: '2025-01-28',
    targetType: '客戶',
    targetId: 4,
    targetName: '張小華',
    targetCompany: '張氏工程',
    products: [{ productId: 7, productName: '飲水機租賃（桌上型）', quantity: 5, retailPrice: 500, actualPrice: 480, subtotal: 2400, unit: '台/月' }],
    totalAmount: 2400,
    shipAddress: '高雄市左營區博愛路55號',
    status: '處理中',
    note: '工地辦公室使用',
    employeeId: 1,
    employeeName: '張小明'
  }
]
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待出貨', value: '待出貨' },
  { label: '已出貨', value: '已出貨' },
  { label: '已完成', value: '已完成' },
  { label: '處理中', value: '處理中' },
  { label: '取消', value: '取消' }
]
const today = new Date().toISOString().split('T')[0]

/** 狀態管理 **/
const orders = ref(initialOrders.map((order) => ({ ...order, products: order.products.map((item) => ({ ...item })) })))
const filters = reactive({
  id: '',
  orderNumber: '',
  orderDateFrom: '',
  orderDateTo: '',
  shipDateFrom: '',
  shipDateTo: '',
  targetType: 'all',
  targetName: '',
  status: 'all',
  employeeName: '',
  productName: ''
})
const sortConfig = ref({ key: 'id', direction: 'asc' })
const currentPage = ref(1)
const pageSize = 10
const selectedIds = ref(new Set())
const expandedIds = ref(new Set())
const orderDialogVisible = ref(false)
const editOrderId = ref(null)
const deleteDialogVisible = ref(false)
const deletingOrderId = ref(null)
const orderForm = reactive({ orderDate: today, shipDate: today, targetType: '客戶', targetId: null, shipAddress: '', note: '' })
const formProducts = ref([])

/** 計算資料 **/
const filteredOrders = computed(() =>
  orders.value.filter((order) => {
    if (filters.id && !String(order.id).includes(filters.id.trim())) return false
    if (filters.orderNumber && !order.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false
    if (filters.orderDateFrom && order.orderDate < filters.orderDateFrom) return false
    if (filters.orderDateTo && order.orderDate > filters.orderDateTo) return false
    if (filters.shipDateFrom && order.shipDate < filters.shipDateFrom) return false
    if (filters.shipDateTo && order.shipDate > filters.shipDateTo) return false
    if (filters.targetType !== 'all' && order.targetType !== filters.targetType) return false
    if (filters.targetName && !order.targetName.toLowerCase().includes(filters.targetName.toLowerCase())) return false
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.employeeName && !order.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())) return false
    if (filters.productName && !order.products.some((product) => product.productName.toLowerCase().includes(filters.productName.toLowerCase()))) return false
    return true
  })
)
const sortedOrders = computed(() => {
  const { key, direction } = sortConfig.value
  const dir = direction === 'asc' ? 1 : -1
  return [...filteredOrders.value].sort((a, b) => {
    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''
    if (aVal < bVal) return -1 * dir
    if (aVal > bVal) return 1 * dir
    return 0
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(sortedOrders.value.length / pageSize)))
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedOrders.value.slice(start, start + pageSize)
})
const stats = computed(() => ({
  orders: filteredOrders.value.length,
  pending: filteredOrders.value.filter((order) => order.status === '待出貨').length,
  completed: filteredOrders.value.filter((order) => order.status === '已完成').length,
  revenue: filteredOrders.value.reduce((sum, order) => sum + order.totalAmount, 0)
}))
const selectedCount = computed(() => selectedIds.value.size)
const isPageFullySelected = computed(
  () => paginatedOrders.value.length > 0 && paginatedOrders.value.every((order) => selectedIds.value.has(order.id))
)
const isPageIndeterminate = computed(() => {
  if (!selectedCount.value) return false
  const selectedOnPage = paginatedOrders.value.filter((order) => selectedIds.value.has(order.id)).length
  return selectedOnPage > 0 && selectedOnPage < paginatedOrders.value.length
})
const showingRange = computed(() => {
  if (!sortedOrders.value.length) return { start: 0, end: 0, total: 0 }
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, sortedOrders.value.length)
  return { start, end, total: sortedOrders.value.length }
})
const formProductsTotal = computed(() => formProducts.value.reduce((sum, item) => sum + item.quantity * item.actualPrice, 0))
const orderTargetOptions = computed(() => (orderForm.targetType === '客戶' ? mockCustomers : mockVendors))

/** 監聽設定 **/
watch(orderDialogVisible, (visible) => {
  if (!visible) {
    Object.assign(orderForm, { orderDate: today, shipDate: today, targetType: '客戶', targetId: null, shipAddress: '', note: '' })
    formProducts.value = []
    editOrderId.value = null
  }
})

/** 工具函式 **/
const formatCurrency = (val) => `NT$${Number(val || 0).toLocaleString('zh-TW')}`
const isSortActive = (field) => sortConfig.value.key === field
const statusBadgeType = (status) => {
  if (status === '待出貨') return 'warning'
  if (status === '已完成') return 'success'
  if (status === '已出貨') return 'info'
  if (status === '處理中') return 'primary'
  return 'default'
}
const getProductInfo = (productId) => mockDispenserProducts.find((item) => item.id === productId) || null
const isExpanded = (id) => expandedIds.value.has(id)
const isSelected = (id) => selectedIds.value.has(id)

/** 事件處理 **/
const handleSort = (field) => {
  if (sortConfig.value.key === field) {
    sortConfig.value = { key: field, direction: sortConfig.value.direction === 'asc' ? 'desc' : 'asc' }
  } else {
    sortConfig.value = { key: field, direction: 'asc' }
  }
}
const handleFilterChange = (key, value) => {
  filters[key] = value
  currentPage.value = 1
}
const clearFilters = () => {
  Object.assign(filters, {
    id: '',
    orderNumber: '',
    orderDateFrom: '',
    orderDateTo: '',
    shipDateFrom: '',
    shipDateTo: '',
    targetType: 'all',
    targetName: '',
    status: 'all',
    employeeName: '',
    productName: ''
  })
  currentPage.value = 1
}
const toggleSelectAll = (checked) => {
  const next = new Set(selectedIds.value)
  if (checked) paginatedOrders.value.forEach((order) => next.add(order.id))
  else paginatedOrders.value.forEach((order) => next.delete(order.id))
  selectedIds.value = next
}
const toggleSelect = (id) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}
const toggleExpand = (id) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}
const addProductRow = () => {
  formProducts.value = [...formProducts.value, { uid: `${Date.now()}-${Math.random()}`, productId: null, quantity: 0, actualPrice: 0 }]
}
const removeProductRow = (uid) => {
  formProducts.value = formProducts.value.filter((product) => product.uid !== uid)
}
const updateProductRow = (uid, field, value) => {
  formProducts.value = formProducts.value.map((product) => {
    if (product.uid !== uid) return product
    const next = { ...product }
    if (field === 'productId') {
      next.productId = Number(value) || null
      const matched = mockDispenserProducts.find((item) => item.id === next.productId)
      next.actualPrice = matched?.retailPrice || 0
    }
    if (field === 'quantity') next.quantity = Number(value) || 0
    if (field === 'actualPrice') next.actualPrice = Number(value) || 0
    return next
  })
}
const openCreateDialog = () => {
  editOrderId.value = null
  orderDialogVisible.value = true
}
const openEditDialog = (order) => {
  editOrderId.value = order.id
  Object.assign(orderForm, {
    orderDate: order.orderDate,
    shipDate: order.shipDate,
    targetType: order.targetType,
    targetId: order.targetId,
    shipAddress: order.shipAddress,
    note: order.note
  })
  formProducts.value = order.products.map((product) => ({
    uid: `${order.id}-${product.productId}-${Math.random()}`,
    productId: product.productId,
    quantity: product.quantity,
    actualPrice: product.actualPrice
  }))
  orderDialogVisible.value = true
}
const validateOrderForm = () => {
  if (!orderForm.orderDate || !orderForm.shipDate) {
    Notify({ type: 'warning', title: '請選擇訂購與出貨日期' })
    return false
  }
  if (!orderForm.targetId) {
    Notify({ type: 'warning', title: '請選擇出貨對象' })
    return false
  }
  if (!orderForm.shipAddress) {
    Notify({ type: 'warning', title: '請填寫送貨地址' })
    return false
  }
  if (!formProducts.value.length) {
    Notify({ type: 'warning', title: '請至少新增一個商品' })
    return false
  }
  for (const product of formProducts.value) {
    if (!product.productId || !product.quantity) {
      Notify({ type: 'warning', title: '請完整填寫商品資訊' })
      return false
    }
  }
  return true
}
const saveOrder = () => {
  if (!validateOrderForm()) return
  const productsPayload = formProducts.value.map((product) => {
    const matched = mockDispenserProducts.find((item) => item.id === product.productId)
    return {
      productId: product.productId,
      productName: matched?.name || '',
      quantity: product.quantity,
      retailPrice: matched?.retailPrice || 0,
      actualPrice: product.actualPrice,
      subtotal: product.quantity * product.actualPrice,
      unit: matched?.unit || ''
    }
  })
  const totalAmount = productsPayload.reduce((sum, item) => sum + item.subtotal, 0)
  const targetSource = orderForm.targetType === '客戶' ? mockCustomers : mockVendors
  const targetMatch = targetSource.find((item) => item.id === orderForm.targetId)
  const targetName = targetMatch?.name || ''
  const targetCompany = orderForm.targetType === '客戶' ? targetMatch?.company : null

  if (editOrderId.value) {
    orders.value = orders.value.map((order) =>
      order.id === editOrderId.value
        ? {
            ...order,
            orderDate: orderForm.orderDate,
            shipDate: orderForm.shipDate,
            targetType: orderForm.targetType,
            targetId: orderForm.targetId,
            targetName,
            targetCompany,
            products: productsPayload,
            totalAmount,
            shipAddress: orderForm.shipAddress,
            note: orderForm.note
          }
        : order
    )
    Notify({ type: 'success', title: '訂單更新成功' })
  } else {
    const nextId = orders.value.length ? Math.max(...orders.value.map((order) => order.id)) + 1 : 1
    const sequence = String(nextId).padStart(3, '0')
    orders.value = [
      {
        id: nextId,
        orderNumber: `DISP-${new Date().getFullYear()}-${sequence}`,
        orderDate: orderForm.orderDate,
        shipDate: orderForm.shipDate,
        targetType: orderForm.targetType,
        targetId: orderForm.targetId,
        targetName,
        targetCompany,
        products: productsPayload,
        totalAmount,
        shipAddress: orderForm.shipAddress,
        status: '待出貨',
        note: orderForm.note,
        employeeId: 1,
        employeeName: '張小明'
      },
      ...orders.value
    ]
    Notify({ type: 'success', title: '訂單新增成功' })
  }

  orderDialogVisible.value = false
}
const handleBulkDelete = () => {
  if (!selectedIds.value.size) {
    Notify({ type: 'warning', title: '請先勾選訂單' })
    return
  }
  orders.value = orders.value.filter((order) => !selectedIds.value.has(order.id))
  selectedIds.value = new Set()
  Notify({ type: 'success', title: '選中訂單已刪除' })
}
const requestDelete = (id) => {
  deletingOrderId.value = id
  deleteDialogVisible.value = true
}
const confirmDelete = () => {
  if (deletingOrderId.value !== null) {
    orders.value = orders.value.filter((order) => order.id !== deletingOrderId.value)
    const next = new Set(selectedIds.value)
    next.delete(deletingOrderId.value)
    selectedIds.value = next
  }
  deletingOrderId.value = null
  deleteDialogVisible.value = false
  Notify({ type: 'success', title: '訂單已刪除' })
}
const handlePageChange = (page) => {
  const target = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = target
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">飲水機訂單管理</h1>
      <p class="text-sm text-gray-500">管理飲水機銷售與租賃訂單</p>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-1"><CardTitle class="text-xs text-gray-500">總訂單數</CardTitle></CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold text-gray-900">{{ stats.orders }}</p>
          <p class="text-xs text-gray-500">筆</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-1"><CardTitle class="text-xs text-gray-500">待出貨</CardTitle></CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold text-amber-500">{{ stats.pending }}</p>
          <p class="text-xs text-gray-500">筆</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-1"><CardTitle class="text-xs text-gray-500">已完成</CardTitle></CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold text-green-600">{{ stats.completed }}</p>
          <p class="text-xs text-gray-500">筆</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-1"><CardTitle class="text-xs text-gray-500">總營收</CardTitle></CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold text-gray-900">{{ formatCurrency(stats.revenue) }}</p>
          <p class="text-xs text-gray-500">依目前篩選</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>訂單列表（共 {{ sortedOrders.length }} 筆）</CardTitle>
          <div class="flex flex-wrap items-center gap-2">
            <TinyButton type="default" :disabled="!selectedCount" @click="handleBulkDelete">
              <IconDelete class="tiny-svg-size" />
              <span class="ml-1">刪除選中（{{ selectedCount }}）</span>
            </TinyButton>
            <TinyButton type="default" @click="clearFilters">清除篩選</TinyButton>
            <TinyButton type="primary" class="gap-1" @click="openCreateDialog">
              <IconAdd class="tiny-svg-size" /> 新增訂單
            </TinyButton>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600">篩選商品名稱：</span>
          <TinyInput class="max-w-xs" placeholder="輸入商品名稱" :model-value="filters.productName" @update:model-value="(val) => handleFilterChange('productName', val)" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto rounded-lg border">
          <table class="min-w-full divide-y">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-12 p-3 text-center">
                  <TinyCheckbox :model-value="isPageFullySelected" :indeterminate="isPageIndeterminate" @update:model-value="(val) => toggleSelectAll(Boolean(val))" />
                </th>
                <th class="w-12"></th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>訂單ID</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="handleSort('id')">
                        <IconArrowUp
                          v-if="!isSortActive('id') || sortConfig.direction === 'asc'"
                          :class="['tiny-svg-size', isSortActive('id') ? 'text-primary-500' : 'text-gray-400']"
                        />
                        <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.id" @update:model-value="(val) => handleFilterChange('id', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>訂單編號</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="handleSort('orderNumber')">
                        <IconArrowUp
                          v-if="!isSortActive('orderNumber') || sortConfig.direction === 'asc'"
                          :class="['tiny-svg-size', isSortActive('orderNumber') ? 'text-primary-500' : 'text-gray-400']"
                        />
                        <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.orderNumber" @update:model-value="(val) => handleFilterChange('orderNumber', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>訂購日期</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="handleSort('orderDate')">
                        <IconArrowUp
                          v-if="!isSortActive('orderDate') || sortConfig.direction === 'asc'"
                          :class="['tiny-svg-size', isSortActive('orderDate') ? 'text-primary-500' : 'text-gray-400']"
                        />
                        <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                      </TinyButton>
                    </div>
                    <div class="flex gap-1">
                      <TinyInput type="date" class="h-7 text-xs" :model-value="filters.orderDateFrom" @update:model-value="(val) => handleFilterChange('orderDateFrom', val)" />
                      <TinyInput type="date" class="h-7 text-xs" :model-value="filters.orderDateTo" @update:model-value="(val) => handleFilterChange('orderDateTo', val)" />
                    </div>
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>出貨日期</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="handleSort('shipDate')">
                        <IconArrowUp
                          v-if="!isSortActive('shipDate') || sortConfig.direction === 'asc'"
                          :class="['tiny-svg-size', isSortActive('shipDate') ? 'text-primary-500' : 'text-gray-400']"
                        />
                        <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                      </TinyButton>
                    </div>
                    <div class="flex gap-1">
                      <TinyInput type="date" class="h-7 text-xs" :model-value="filters.shipDateFrom" @update:model-value="(val) => handleFilterChange('shipDateFrom', val)" />
                      <TinyInput type="date" class="h-7 text-xs" :model-value="filters.shipDateTo" @update:model-value="(val) => handleFilterChange('shipDateTo', val)" />
                    </div>
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <span>對象類型</span>
                    <TinySelect
                      class="h-7 text-xs"
                      :model-value="filters.targetType"
                      :options="[
                        { label: '全部', value: 'all' },
                        { label: '客戶', value: '客戶' },
                        { label: '廠商', value: '廠商' }
                      ]"
                      @update:model-value="(val) => handleFilterChange('targetType', val)"
                    />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <span>對象名稱</span>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.targetName" @update:model-value="(val) => handleFilterChange('targetName', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <span>狀態</span>
                    <TinySelect class="h-7 text-xs" :model-value="filters.status" :options="statusOptions" @update:model-value="(val) => handleFilterChange('status', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex items-center gap-1">
                    <span>總金額</span>
                    <TinyButton type="text" class="!p-0 !h-auto" @click="handleSort('totalAmount')">
                      <IconArrowUp
                        v-if="!isSortActive('totalAmount') || sortConfig.direction === 'asc'"
                        :class="['tiny-svg-size', isSortActive('totalAmount') ? 'text-primary-500' : 'text-gray-400']"
                      />
                      <IconArrowDown v-else class="tiny-svg-size text-primary-500" />
                    </TinyButton>
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <span>負責員工</span>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.employeeName" @update:model-value="(val) => handleFilterChange('employeeName', val)" />
                  </div>
                </th>
                <th class="p-3 text-right text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-if="!paginatedOrders.length">
                <td colspan="13" class="p-6 text-center text-sm text-gray-500">沒有符合條件的訂單</td>
              </tr>
              <template v-for="order in paginatedOrders" :key="order.id">
                <tr class="hover:bg-gray-50">
                  <td class="p-3 text-center">
                    <TinyCheckbox :model-value="isSelected(order.id)" @update:model-value="() => toggleSelect(order.id)" />
                  </td>
                  <td class="p-3 text-center">
                    <TinyButton type="text" class="!p-0" @click="toggleExpand(order.id)">
                      <IconChevronDown v-if="isExpanded(order.id)" class="tiny-svg-size" />
                      <IconChevronRight v-else class="tiny-svg-size" />
                    </TinyButton>
                  </td>
                  <td class="p-3 text-sm text-gray-700">{{ order.id }}</td>
                  <td class="p-3 text-sm text-gray-800">{{ order.orderNumber }}</td>
                  <td class="p-3 text-sm text-gray-800">{{ order.orderDate }}</td>
                  <td class="p-3 text-sm text-gray-800">{{ order.shipDate }}</td>
                  <td class="p-3 text-sm">
                    <TinyBadge :type="order.targetType === '客戶' ? 'info' : 'danger'">{{ order.targetType }}</TinyBadge>
                  </td>
                  <td class="p-3 text-sm text-gray-800">
                    {{ order.targetName }}
                    <div v-if="order.targetCompany" class="text-xs text-gray-500">{{ order.targetCompany }}</div>
                  </td>
                  <td class="p-3 text-sm">
                    <TinyBadge :type="statusBadgeType(order.status)">{{ order.status }}</TinyBadge>
                  </td>
                  <td class="p-3 text-sm text-gray-800">{{ formatCurrency(order.totalAmount) }}</td>
                  <td class="p-3 text-sm text-gray-800">{{ order.employeeName }}</td>
                  <td class="p-3 text-right">
                    <div class="flex justify-end gap-2">
                      <TinyButton type="text" @click="openEditDialog(order)">
                        <IconEdit class="tiny-svg-size" />
                      </TinyButton>
                      <TinyButton type="text" @click="requestDelete(order.id)">
                        <IconDelete class="tiny-svg-size text-red-500" />
                      </TinyButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="isExpanded(order.id)">
                  <td colspan="13" class="bg-gray-50 p-6">
                    <div class="space-y-4">
                      <div>
                        <h4 class="mb-2 font-semibold text-gray-800">商品明細</h4>
                        <div class="overflow-x-auto rounded-md border bg-white">
                          <table class="min-w-full divide-y text-sm">
                            <thead class="bg-gray-50">
                              <tr>
                                <th class="p-2 text-left">商品名稱</th>
                                <th class="p-2 text-left">數量</th>
                                <th class="p-2 text-left">建議售價</th>
                                <th class="p-2 text-left">實際售價</th>
                                <th class="p-2 text-left">小計</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y">
                              <tr v-for="product in order.products" :key="`${order.id}-${product.productId}`">
                                <td class="p-2">{{ product.productName }}</td>
                                <td class="p-2">{{ product.quantity }} {{ product.unit }}</td>
                                <td class="p-2">{{ formatCurrency(product.retailPrice) }}</td>
                                <td class="p-2">{{ formatCurrency(product.actualPrice) }}</td>
                                <td class="p-2">{{ formatCurrency(product.subtotal) }}</td>
                              </tr>
                              <tr>
                                <td colspan="4" class="p-2 text-right font-medium">訂單總額</td>
                                <td class="p-2 font-semibold">{{ formatCurrency(order.totalAmount) }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div class="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 class="mb-1 font-semibold text-gray-800">送貨地址</h4>
                          <p class="text-sm text-gray-700">{{ order.shipAddress }}</p>
                        </div>
                        <div v-if="order.note">
                          <h4 class="mb-1 font-semibold text-gray-800">備註</h4>
                          <p class="text-sm text-gray-700">{{ order.note }}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-sm text-gray-600">顯示第 {{ showingRange.start || 0 }} - {{ showingRange.end || 0 }} 筆，共 {{ showingRange.total }} 筆</span>
          <AppPagination
            :current="currentPage"
            :page-size="pageSize"
            :total="showingRange.total"
            :show-total="false"
            :show-page-size="false"
            @change="handlePageChange"
          />
        </div>
      </CardContent>
    </Card>

    <TinyDialogBox v-model:visible="orderDialogVisible" :title="editOrderId ? '編輯飲水機訂單' : '新增飲水機訂單'" width="900px" class="max-h-[90vh]" :show-close="true">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="orderDialogVisible = false">取消</TinyButton>
          <TinyButton type="primary" @click="saveOrder">{{ editOrderId ? '更新訂單' : '新增訂單' }}</TinyButton>
        </div>
      </template>

      <div class="space-y-4 py-2">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">訂購日期 *</p>
            <TinyInput type="date" :model-value="orderForm.orderDate" @update:model-value="(val) => (orderForm.orderDate = val)" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">出貨日期 *</p>
            <TinyInput type="date" :model-value="orderForm.shipDate" @update:model-value="(val) => (orderForm.shipDate = val)" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">出貨對象類型 *</p>
            <TinySelect
              :model-value="orderForm.targetType"
              :options="[
                { label: '客戶', value: '客戶' },
                { label: '廠商', value: '廠商' }
              ]"
              @update:model-value="(val) => {
                orderForm.targetType = val
                orderForm.targetId = null
              }"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">{{ orderForm.targetType === '客戶' ? '客戶名稱 *' : '廠商名稱 *' }}</p>
            <TinySelect
              :model-value="orderForm.targetId"
              placeholder="請選擇"
              :options="orderTargetOptions.map((item) => ({
                label: orderForm.targetType === '客戶' ? `${item.name}（${item.company}）` : item.name,
                value: item.id
              }))"
              @update:model-value="(val) => (orderForm.targetId = val)"
            />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">送貨地址 *</p>
          <TinyInput :model-value="orderForm.shipAddress" placeholder="請輸入送貨地址" @update:model-value="(val) => (orderForm.shipAddress = val)" />
        </div>
        <div class="rounded-lg border p-4">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-medium text-gray-900">商品列表 *</h4>
            <TinyButton type="text" class="gap-1" @click="addProductRow">
              <IconAdd class="tiny-svg-size" /> 新增商品
            </TinyButton>
          </div>
          <p v-if="!formProducts.length" class="rounded-md bg-gray-50 py-6 text-center text-sm text-gray-500">請新增商品</p>
          <div v-else class="space-y-3">
            <div v-for="product in formProducts" :key="product.uid" class="space-y-3 rounded-lg border bg-gray-50 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-2">
                  <TinySelect
                    class="md:flex-1"
                    placeholder="選擇商品"
                    :model-value="product.productId"
                    :options="mockDispenserProducts.map((item) => ({ label: `${item.name}（建議價 ${item.retailPrice}）`, value: item.id }))"
                    @update:model-value="(val) => updateProductRow(product.uid, 'productId', val)"
                  />
                  <TinyInput class="md:w-24" type="number" placeholder="數量" :model-value="product.quantity" @update:model-value="(val) => updateProductRow(product.uid, 'quantity', val)" />
                  <TinyInput class="md:w-28" type="number" placeholder="售價" :model-value="product.actualPrice" @update:model-value="(val) => updateProductRow(product.uid, 'actualPrice', val)" />
                </div>
                <TinyButton type="text" @click="removeProductRow(product.uid)">
                  <IconDelete class="tiny-svg-size text-red-500" />
                </TinyButton>
              </div>
              <p v-if="getProductInfo(product.productId)" class="text-xs text-gray-500">
                建議售價 {{ formatCurrency(getProductInfo(product.productId)?.retailPrice) }} · 現庫存 {{ getProductInfo(product.productId)?.currentStock }}
              </p>
              <div class="text-right text-sm font-medium text-gray-700">小計 {{ formatCurrency(product.quantity * product.actualPrice) }}</div>
            </div>
          </div>
          <div v-if="formProducts.length" class="mt-4 rounded-md bg-blue-50 px-4 py-3 text-right">
            <p class="text-sm text-gray-600">訂單總額</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(formProductsTotal) }}</p>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">備註</p>
          <TinyInput type="textarea" rows="3" placeholder="訂單備註" :model-value="orderForm.note" @update:model-value="(val) => (orderForm.note = val)" />
        </div>
      </div>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="deleteDialogVisible" title="刪除確認" width="420px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="deleteDialogVisible = false">取消</TinyButton>
          <TinyButton type="danger" @click="confirmDelete">刪除</TinyButton>
        </div>
      </template>
      <p class="text-sm text-gray-600">確定要刪除此訂單嗎？</p>
    </TinyDialogBox>
  </div>
</template>
