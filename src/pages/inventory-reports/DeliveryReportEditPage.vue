<!-- src/pages/inventory-reports/DeliveryReportEditPage.vue 送貨報表編輯 -->
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button as TinyButton } from '@/components/ui/button'
import { Input as TinyInput } from '@/components/ui/input'
import { Select as TinySelect } from '@/components/ui/select'
import { DialogBox as TinyDialogBox } from '@/components/ui/dialog-box'
import { Checkbox as TinyCheckbox } from '@/components/ui/checkbox'
import { Badge as TinyBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { IconArrowLeft, IconSave, IconPrintPreview, IconAdd, IconDelete, IconChevronDown, IconChevronRight, IconBoxSolid } from '@opentiny/vue-icon'
import Notify from '@opentiny/vue-notify'

const props = defineProps({
  uuid: { type: String, default: '' }
})

/** 常數設定 **/
const mockProducts = [
  { id: 1, name: '清泉 20L', category: '桶裝水', unitPrice: 140 },
  { id: 2, name: '純淨 20L', category: '桶裝水', unitPrice: 140 },
  { id: 3, name: '山泉 20L', category: '桶裝水', unitPrice: 138 },
  { id: 4, name: '礦泉 20L', category: '桶裝水', unitPrice: 145 },
  { id: 5, name: '紅殼蛋 10入/盒', category: '雞蛋', unitPrice: 85 },
  { id: 6, name: '白殼蛋 10入/盒', category: '雞蛋', unitPrice: 80 },
  { id: 7, name: '土雞蛋 10入/盒', category: '雞蛋', unitPrice: 95 },
  { id: 8, name: 'WD-2000 冷熱', category: '飲水機', unitPrice: 8500 },
  { id: 9, name: 'WD-3000 冰溫熱', category: '飲水機', unitPrice: 12000 },
  { id: 10, name: 'WD-1000 常溫', category: '飲水機', unitPrice: 6000 }
]
const mockCustomers = [
  { id: 1, name: '林氏企業', type: '客戶', paymentMethod: '月結', deliveryDays: ['星期一', '星期三'] },
  { id: 2, name: '黃記商行', type: '客戶', paymentMethod: '現金', deliveryDays: ['星期二', '星期四'] },
  { id: 3, name: '建國工廠', type: '客戶', paymentMethod: '現金', deliveryDays: ['星期三', '星期五'] },
  { id: 4, name: '小芬商店', type: '客戶', paymentMethod: '票據', deliveryDays: ['星期一', '星期二', '星期三', '星期四', '星期五'] },
  { id: 5, name: '清泉水業', type: '廠商', paymentMethod: '月結', deliveryDays: ['星期一', '星期三', '星期五'] },
  { id: 6, name: '純淨水廠', type: '廠商', paymentMethod: '現金', deliveryDays: ['星期二', '星期四'] },
  { id: 7, name: '大同商行', type: '客戶', paymentMethod: '月結', deliveryDays: ['星期一', '星期四'] },
  { id: 8, name: '永豐企業', type: '客戶', paymentMethod: '現金', deliveryDays: ['星期二', '星期五'] },
  { id: 9, name: '新鮮蛋行', type: '廠商', paymentMethod: '現金', deliveryDays: ['星期一', '星期三', '星期五'] },
  { id: 10, name: '福氣商店', type: '客戶', paymentMethod: '票據', deliveryDays: ['星期三', '星期六'] },
  { id: 11, name: '陳氏餐飲', type: '客戶', paymentMethod: '現金', deliveryDays: ['星期一', '星期三', '星期五'] },
  { id: 12, name: '張氏工程', type: '客戶', paymentMethod: '月結', deliveryDays: ['星期一', '星期三'] }
]
const paymentOptions = ['現金', '月結', '轉帳', '票據']
const weekDayOptions = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

/** 狀態管理 **/
const router = useRouter()
const loading = ref(true)
const reportData = ref(null)
const editedProducts = ref([])
const fuelExpense = ref(0)
const otherExpense = ref(0)
const expandedItems = ref([])
const showProductDialog = ref(false)
const selectedProductIds = ref([])
const selectedWeekDays = ref([])
const originalWeekDays = ref([])

/** 計算資料 **/
const availableCustomers = computed(() => {
  if (!selectedWeekDays.value.length) return mockCustomers
  return mockCustomers.filter((customer) => customer.deliveryDays.some((day) => selectedWeekDays.value.includes(day)))
})
const availableCustomerOptions = computed(() =>
  availableCustomers.value.map((customer) => ({ label: `${customer.name}（${customer.deliveryDays.join('、')}）`, value: String(customer.id) }))
)
const groupedProducts = computed(() =>
  editedProducts.value.reduce((acc, product, index) => {
    if (!acc[product.productName]) acc[product.productName] = []
    acc[product.productName].push({ ...product, originalIndex: index })
    return acc
  }, {})
)
const groupedEntries = computed(() => Object.entries(groupedProducts.value))
const productCategories = computed(() =>
  mockProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = []
    acc[product.category].push(product)
    return acc
  }, {})
)
const totalQuantity = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.quantity || 0), 0))
const totalActualAmount = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.actualAmount || 0), 0))
const totalAmount = computed(() => editedProducts.value.reduce((sum, product) => sum + Number(product.amount || 0), 0))
const allExpanded = computed(() => {
  const groupCount = Object.keys(groupedProducts.value).length
  return groupCount > 0 && expandedItems.value.length === groupCount
})

/** 工具函式 **/
const currency = (val) => `NT$${Number(val || 0).toLocaleString()}`
const sumProductsField = (items, field) => items.reduce((sum, item) => sum + Number(item[field] || 0), 0)
const isGroupExpanded = (name) => expandedItems.value.includes(name)
const toggleGroupExpand = (name) => {
  if (isGroupExpanded(name)) {
    expandedItems.value = expandedItems.value.filter((item) => item !== name)
  } else {
    expandedItems.value = [...expandedItems.value, name]
  }
}

/** 事件處理 **/
const loadReport = () => {
  if (!props.uuid) {
    reportData.value = null
    editedProducts.value = []
    loading.value = false
    return
  }
  loading.value = true
  setTimeout(() => {
    const mockData = {
      id: Number(props.uuid) || 1,
      employeeId: 5,
      employeeName: '劉司機',
      reportDate: '2024-03-15',
      weekDays: '星期一、星期三',
      selectedWeekDays: ['星期一', '星期三'],
      products: [
        { productId: 1, productName: '清泉 20L', customerId: 1, customerName: '林氏企業', quantity: 10, unitPrice: 140, amount: 1400, actualAmount: 1400, paymentMethod: '月結', note: '' },
        { productId: 1, productName: '清泉 20L', customerId: 4, customerName: '小芬商店', quantity: 5, unitPrice: 140, amount: 700, actualAmount: 700, paymentMethod: '票據', note: '' },
        { productId: 5, productName: '紅殼蛋 10入/盒', customerId: 11, customerName: '陳氏餐飲', quantity: 20, unitPrice: 85, amount: 1700, actualAmount: 1700, paymentMethod: '現金', note: '' }
      ],
      fuelExpense: 0,
      otherExpense: 0
    }
    reportData.value = mockData
    editedProducts.value = mockData.products.map((product) => ({ ...product }))
    fuelExpense.value = mockData.fuelExpense
    otherExpense.value = mockData.otherExpense
    selectedWeekDays.value = [...mockData.selectedWeekDays]
    originalWeekDays.value = [...mockData.selectedWeekDays]
    expandedItems.value = Array.from(new Set(mockData.products.map((product) => product.productName)))
    selectedProductIds.value = []
    loading.value = false
  }, 400)
}

onMounted(loadReport)

const handleQuantityChange = (index, value) => {
  const next = [...editedProducts.value]
  const quantity = Number(value) || 0
  next[index].quantity = quantity
  const amount = quantity * Number(next[index].unitPrice || 0)
  next[index].amount = amount
  next[index].actualAmount = amount
  editedProducts.value = next
}
const handleUnitPriceChange = (index, value) => {
  const next = [...editedProducts.value]
  const unitPrice = Number(value) || 0
  next[index].unitPrice = unitPrice
  const amount = unitPrice * Number(next[index].quantity || 0)
  next[index].amount = amount
  next[index].actualAmount = amount
  editedProducts.value = next
}
const handleActualAmountChange = (index, value) => {
  const next = [...editedProducts.value]
  next[index].actualAmount = Number(value) || 0
  editedProducts.value = next
}
const handleCustomerChange = (index, customerId) => {
  const customer = mockCustomers.find((item) => item.id === customerId)
  if (!customer) return
  const next = [...editedProducts.value]
  next[index].customerId = customer.id
  next[index].customerName = customer.name
  next[index].paymentMethod = customer.paymentMethod
  editedProducts.value = next
}
const handlePaymentMethodChange = (index, method) => {
  const next = [...editedProducts.value]
  next[index].paymentMethod = method
  editedProducts.value = next
}
const handleNoteChange = (index, value) => {
  const next = [...editedProducts.value]
  next[index].note = value
  editedProducts.value = next
}
const handleAddProductCategory = () => {
  selectedProductIds.value = []
  showProductDialog.value = true
}
const isProductInReport = (productId) => editedProducts.value.some((product) => product.productId === productId)
const handleProductToggle = (productId) => {
  if (isProductInReport(productId)) return
  if (selectedProductIds.value.includes(productId)) {
    selectedProductIds.value = selectedProductIds.value.filter((id) => id !== productId)
  } else {
    selectedProductIds.value = [...selectedProductIds.value, productId]
  }
}
const handleWeekDayToggle = (weekDay) => {
  if (originalWeekDays.value.includes(weekDay)) return
  if (selectedWeekDays.value.includes(weekDay)) {
    selectedWeekDays.value = selectedWeekDays.value.filter((day) => day !== weekDay)
  } else {
    selectedWeekDays.value = [...selectedWeekDays.value, weekDay]
  }
}
const handleConfirmAddProducts = () => {
  if (!selectedProductIds.value.length) {
    Notify({ type: 'warning', title: '請至少選擇一個商品' })
    return
  }
  const firstCustomer = availableCustomers.value[0]
  if (!firstCustomer) {
    Notify({ type: 'warning', title: '目前無符合條件的客戶' })
    return
  }
  const newProducts = selectedProductIds.value
    .map((productId) => {
      const product = mockProducts.find((item) => item.id === productId)
      if (!product) return null
      return {
        productId: product.id,
        productName: product.name,
        customerId: firstCustomer.id,
        customerName: firstCustomer.name,
        quantity: 0,
        unitPrice: product.unitPrice,
        amount: 0,
        actualAmount: 0,
        paymentMethod: firstCustomer.paymentMethod,
        note: ''
      }
    })
    .filter(Boolean)
  editedProducts.value = [...editedProducts.value, ...newProducts]
  expandedItems.value = Array.from(new Set([...expandedItems.value, ...newProducts.map((item) => item.productName)]))
  showProductDialog.value = false
  Notify({ type: 'success', title: `已新增 ${newProducts.length} 個商品` })
}
const handleDeleteProductCategory = (productName) => {
  if (!window.confirm(`確定要刪除所有「${productName}」的記錄嗎？`)) return
  editedProducts.value = editedProducts.value.filter((product) => product.productName !== productName)
  expandedItems.value = expandedItems.value.filter((name) => name !== productName)
  Notify({ type: 'success', title: `已刪除 ${productName}` })
}
const handleAddCustomer = (productName) => {
  const firstCustomer = availableCustomers.value[0]
  if (!firstCustomer) {
    Notify({ type: 'warning', title: '目前無符合條件的客戶' })
    return
  }
  const sampleProduct = editedProducts.value.find((product) => product.productName === productName)
  const productId = sampleProduct?.productId || 0
  const unitPrice = sampleProduct?.unitPrice || 0
  const newProduct = {
    productId,
    productName,
    customerId: firstCustomer.id,
    customerName: firstCustomer.name,
    quantity: 0,
    unitPrice,
    amount: 0,
    actualAmount: 0,
    paymentMethod: firstCustomer.paymentMethod,
    note: ''
  }
  editedProducts.value = [...editedProducts.value, newProduct]
  Notify({ type: 'success', title: '已新增客戶記錄' })
}
const handleDeleteCustomer = (index) => {
  if (!window.confirm('確定要刪除此客戶記錄嗎？')) return
  editedProducts.value = editedProducts.value.filter((_, i) => i !== index)
  Notify({ type: 'success', title: '已刪除客戶記錄' })
}
const handleSave = () => {
  Notify({ type: 'success', title: '報表已儲存' })
}
const handlePrint = () => {
  window.print()
}
const handleBack = () => {
  router.push({ name: 'delivery-report' })
}
const handleToggleAll = () => {
  const groupNames = Object.keys(groupedProducts.value)
  if (!groupNames.length) return
  expandedItems.value = allExpanded.value ? [] : groupNames
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 print:bg-white">
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center space-y-3">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 mx-auto" />
        <p class="text-gray-600">載入報表資料中...</p>
      </div>
    </div>

    <div v-else-if="!reportData" class="min-h-screen flex items-center justify-center bg-gray-50">
      <Card class="w-full max-w-md">
        <CardContent class="pt-8">
          <div class="text-center space-y-4">
            <p class="text-gray-600">找不到報表資料</p>
            <TinyButton type="primary" @click="handleBack">
              <IconArrowLeft class="tiny-svg-size mr-1" /> 返回
            </TinyButton>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else>
      <div class="bg-white border-b sticky top-0 z-10 print:hidden">
        <div class="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div class="flex items-center gap-4">
            <TinyButton type="text" @click="handleBack">
              <IconArrowLeft class="tiny-svg-size mr-1" /> 返回
            </TinyButton>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">編輯報表 #{{ reportData.id }}</h1>
              <p class="text-sm text-gray-500">{{ reportData.employeeName }} · {{ reportData.reportDate }}（{{ reportData.weekDays }}）</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <TinyButton type="text" @click="handlePrint">
              <IconPrintPreview class="tiny-svg-size mr-1" /> 列印
            </TinyButton>
            <TinyButton type="primary" @click="handleSave">
              <IconSave class="tiny-svg-size mr-1" /> 儲存
            </TinyButton>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-6 print:px-8">
        <div class="hidden print:block mb-6">
          <h1 class="text-center text-2xl mb-2">出貨日報表</h1>
          <div class="flex justify-between text-sm mb-4">
            <div>
              <p><strong>報表編號：</strong>#{{ reportData.id }}</p>
              <p><strong>員工姓名：</strong>{{ reportData.employeeName }} (ID: {{ reportData.employeeId }})</p>
            </div>
            <div class="text-right">
              <p><strong>日期：</strong>{{ reportData.reportDate }}</p>
              <p><strong>出貨星期：</strong>{{ reportData.weekDays }}</p>
            </div>
          </div>
          <hr class="border-gray-300" />
        </div>

        <Card>
          <CardHeader class="print:pb-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <CardTitle class="text-lg">商品明細編輯</CardTitle>
              <div class="flex gap-2 print:hidden">
                <TinyButton @click="handleAddProductCategory">
                  <IconAdd class="tiny-svg-size mr-1" /> 新增商品
                </TinyButton>
                <TinyButton type="text" @click="handleToggleAll">
                  {{ allExpanded ? '全部收合' : '全部展開' }}
                </TinyButton>
              </div>
            </div>

            <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3 print:hidden">
              <div class="flex items-center gap-2 text-amber-900">
                <IconBoxSolid class="tiny-svg-size" />
                <span class="font-medium">預計出貨星期設定</span>
                <span class="text-sm text-amber-600">（可選擇 {{ availableCustomers.length }} 位符合客戶）</span>
              </div>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="weekDay in weekDayOptions"
                  :key="weekDay"
                  :class="[
                    'flex items-center gap-2 rounded border px-3 py-2',
                    selectedWeekDays.includes(weekDay)
                      ? originalWeekDays.includes(weekDay)
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-green-100 border-green-300'
                      : 'bg-white border-gray-300',
                    originalWeekDays.includes(weekDay) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                  ]"
                  @click="!originalWeekDays.includes(weekDay) && handleWeekDayToggle(weekDay)">
                  <TinyCheckbox
                    :model-value="selectedWeekDays.includes(weekDay)"
                    :disabled="originalWeekDays.includes(weekDay)"
                    @update:model-value="() => handleWeekDayToggle(weekDay)"
                  />
                  <span :class="['text-sm', originalWeekDays.includes(weekDay) ? 'cursor-not-allowed' : 'cursor-pointer']">
                    {{ weekDay }}
                    <span v-if="originalWeekDays.includes(weekDay)" class="ml-1 text-xs text-blue-600">（原始）</span>
                  </span>
                </div>
              </div>
              <p class="text-xs text-amber-700">💡 藍色為原始設定（無法移除），綠色為新增可調整的出貨星期。</p>
            </div>
          </CardHeader>

          <CardContent>
            <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 print:hidden">
              <div class="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                <div>
                  <p class="text-xs text-gray-600 mb-1">商品類別</p>
                  <p class="text-lg font-semibold text-blue-600">{{ Object.keys(groupedProducts).length }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">總筆數</p>
                  <p class="text-lg font-semibold text-blue-600">{{ editedProducts.length }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">總數量</p>
                  <p class="text-lg font-semibold text-blue-600">{{ totalQuantity }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">實際收付總額</p>
                  <p class="text-lg font-semibold text-blue-600">{{ currency(totalActualAmount) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4 print:space-y-6">
              <template v-for="([productName, products], index) in groupedEntries" :key="productName">
                <div class="rounded-lg border bg-white px-4 py-3 print:border-0 print:px-0">
                  <button type="button" class="flex w-full items-center justify-between print:hidden" @click="toggleGroupExpand(productName)">
                    <div class="flex items-center gap-2 text-left">
                      <IconChevronDown v-if="isGroupExpanded(productName)" class="tiny-svg-size" />
                      <IconChevronRight v-else class="tiny-svg-size" />
                      <span class="font-medium text-gray-900">{{ productName }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <TinyBadge type="info">{{ products.length }} 筆</TinyBadge>
                      <TinyBadge type="warning">{{ currency(sumProductsField(products, 'actualAmount')) }}</TinyBadge>
                    </div>
                  </button>

                  <div :class="[isGroupExpanded(productName) ? 'mt-4' : 'hidden print:block']">
                    <div class="hidden print:block mb-3">
                      <h3 class="text-base font-medium">{{ productName }}</h3>
                      <hr class="my-2" />
                    </div>
                    <div class="flex justify-end gap-2 mb-3 print:hidden">
                      <TinyButton type="text" @click="handleAddCustomer(productName)">
                        <IconAdd class="tiny-svg-size mr-1" /> 新增客戶
                      </TinyButton>
                      <TinyButton type="text" class="text-red-500" @click="handleDeleteProductCategory(productName)">
                        <IconDelete class="tiny-svg-size mr-1" /> 刪除商品
                      </TinyButton>
                    </div>

                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y text-sm">
                        <thead class="bg-gray-50 text-left text-xs text-gray-500">
                          <tr>
                            <th class="px-3 py-2">客戶</th>
                            <th class="px-3 py-2 w-24">數量</th>
                            <th class="px-3 py-2 w-24">單價</th>
                            <th class="px-3 py-2 w-28">金額</th>
                            <th class="px-3 py-2 w-32">實際收付</th>
                            <th class="px-3 py-2 w-28">收付方式</th>
                            <th class="px-3 py-2 min-w-[150px]">備註</th>
                            <th class="px-3 py-2 w-16 print:hidden">操作</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y bg-white">
                          <tr v-for="product in products" :key="product.originalIndex">
                            <td class="px-3 py-2">
                              <div class="print:hidden">
                                <TinySelect
                                  :model-value="String(product.customerId)"
                                  :options="availableCustomerOptions"
                                  placeholder="選擇客戶"
                                  @update:model-value="(val) => handleCustomerChange(product.originalIndex, Number(val))"
                                />
                              </div>
                              <span class="hidden print:inline">{{ product.customerName }}</span>
                            </td>
                            <td class="px-3 py-2">
                              <TinyInput type="number" min="0" class="w-24" :model-value="product.quantity" @update:model-value="(val) => handleQuantityChange(product.originalIndex, val)" />
                            </td>
                            <td class="px-3 py-2">
                              <TinyInput type="number" min="0" class="w-24" :model-value="product.unitPrice" @update:model-value="(val) => handleUnitPriceChange(product.originalIndex, val)" />
                            </td>
                            <td class="px-3 py-2 font-medium">{{ currency(product.amount) }}</td>
                            <td class="px-3 py-2">
                              <TinyInput
                                type="number"
                                min="0"
                                class="w-28"
                                :model-value="product.actualAmount"
                                placeholder="實際收付"
                                @update:model-value="(val) => handleActualAmountChange(product.originalIndex, val)"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <TinySelect
                                :model-value="product.paymentMethod"
                                :options="paymentOptions.map((option) => ({ label: option, value: option }))"
                                @update:model-value="(val) => handlePaymentMethodChange(product.originalIndex, val)"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <TinyInput :model-value="product.note" placeholder="輸入備註..." @update:model-value="(val) => handleNoteChange(product.originalIndex, val)" />
                            </td>
                            <td class="px-3 py-2 text-center print:hidden">
                              <TinyButton type="text" class="text-red-500" @click="handleDeleteCustomer(product.originalIndex)">
                                <IconDelete class="tiny-svg-size" />
                              </TinyButton>
                            </td>
                          </tr>
                          <tr class="bg-gray-50 font-medium">
                            <td class="px-3 py-2">小計</td>
                            <td class="px-3 py-2">{{ sumProductsField(products, 'quantity') }}</td>
                            <td />
                            <td class="px-3 py-2">{{ currency(sumProductsField(products, 'amount')) }}</td>
                            <td class="px-3 py-2 text-blue-600">{{ currency(sumProductsField(products, 'actualAmount')) }}</td>
                            <td colspan="3" />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </template>

              <div v-if="!groupedEntries.length" class="rounded-lg border border-dashed py-12 text-center text-sm text-gray-500">
                尚未新增商品，請先點選「新增商品」。
              </div>
            </div>

            <div class="mt-6 border-t pt-6">
              <div class="flex justify-end">
                <div class="w-full max-w-md space-y-3">
                  <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>商品總金額（參考）</span>
                    <span>{{ currency(totalAmount) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-base">
                    <span class="text-gray-700">實際收付總額</span>
                    <span class="font-semibold text-blue-600">{{ currency(totalActualAmount) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-700">加油支出金額</span>
                    <TinyInput type="number" min="0" class="w-36 text-right" :model-value="fuelExpense" @update:model-value="(val) => (fuelExpense = Number(val) || 0)" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-700">其他支出金額</span>
                    <TinyInput type="number" min="0" class="w-36 text-right" :model-value="otherExpense" @update:model-value="(val) => (otherExpense = Number(val) || 0)" />
                  </div>
                  <hr />
                  <div class="flex items-center justify-between text-base font-semibold">
                    <span>預估結餘</span>
                    <span>{{ currency(totalActualAmount - fuelExpense - otherExpense) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <TinyDialogBox v-model:visible="showProductDialog" title="選擇要新增的商品" width="640px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="showProductDialog = false">取消</TinyButton>
          <TinyButton type="primary" @click="handleConfirmAddProducts">
            確認新增 {{ selectedProductIds.length ? `(${selectedProductIds.length})` : '' }}
          </TinyButton>
        </div>
      </template>

      <div class="space-y-4">
        <div v-for="(products, category) in productCategories" :key="category" class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700 border-b pb-1">{{ category }}</h3>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div
              v-for="product in products"
              :key="product.id"
              :class="[
                'flex items-center justify-between rounded border px-3 py-2',
                isProductInReport(product.id) ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
              ]"
              @click="!isProductInReport(product.id) && handleProductToggle(product.id)">
              <div class="flex items-center gap-2">
                <TinyCheckbox
                  :model-value="isProductInReport(product.id) || selectedProductIds.includes(product.id)"
                  :disabled="isProductInReport(product.id)"
                  @update:model-value="() => handleProductToggle(product.id)"
                />
                <span class="text-sm">
                  {{ product.name }}
                  <span v-if="isProductInReport(product.id)" class="ml-1 text-xs text-blue-600">（已在報表中）</span>
                </span>
              </div>
              <TinyBadge type="primary">{{ currency(product.unitPrice) }}</TinyBadge>
            </div>
          </div>
        </div>
      </div>
    </TinyDialogBox>
  </div>
</template>
