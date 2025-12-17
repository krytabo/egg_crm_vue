<!-- src/components/dialogs/DailyShippingReportEnhanced.vue 日報表E版 -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { DialogBox as TinyDialogBox, Button as TinyButton, Input as TinyInput, Select as TinySelect, Checkbox as TinyCheckbox, Badge as TinyBadge } from '@opentiny/vue'
import { IconSearch, IconChevronDown, IconPrintPreview } from '@opentiny/vue-icon'
import Notify from '@opentiny/vue-notify'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'report-created'])

/** 常數資料 **/
const weekDayOptions = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const productCategoryFilters = ['全部', '桶裝水', '雞蛋', '飲水機']
const quickSelectCategories = ['桶裝水', '雞蛋', '飲水機']
const mockProducts = [
  { id: 1, name: '清泉 20L', category: '桶裝水' },
  { id: 2, name: '純淨 20L', category: '桶裝水' },
  { id: 3, name: '紅殼蛋 10入/盒', category: '雞蛋' },
  { id: 4, name: '白殼蛋 10入/盒', category: '雞蛋' },
  { id: 5, name: 'WD-2000 冷熱', category: '飲水機' },
  { id: 6, name: '山泉 20L', category: '桶裝水' },
  { id: 7, name: '礦泉 20L', category: '桶裝水' },
  { id: 8, name: '土雞蛋 10入/盒', category: '雞蛋' },
  { id: 9, name: 'WD-3000 冰溫熱', category: '飲水機' },
  { id: 10, name: 'WD-1000 常溫', category: '飲水機' }
]
const mockEmployees = [
  { id: 1, name: '張小明', position: '業務經理' },
  { id: 2, name: '李美玲', position: '客服專員' },
  { id: 5, name: '劉司機', position: '送貨司機' },
  { id: 9, name: '趙小芬', position: '送貨司機' }
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
  { id: 10, name: '福氣商店', type: '客戶', paymentMethod: '票據', deliveryDays: ['星期三', '星期六'] }
]

/** 狀態管理 **/
const step = ref('setup')
const selectedEmployeeId = ref(null)
const selectedWeekDays = ref([])
const selectedCategory = ref('全部')
const productSearchTerm = ref('')
const customerSearchTerms = reactive({})
const selectedProducts = ref([]) // { productId, customerIds: [] }
const expandedProducts = ref(new Set())
const reportData = ref(null)

const resetState = () => {
  step.value = 'setup'
  selectedEmployeeId.value = null
  selectedWeekDays.value = []
  selectedCategory.value = '全部'
  productSearchTerm.value = ''
  selectedProducts.value = []
  expandedProducts.value = new Set()
  reportData.value = null
  Object.keys(customerSearchTerms).forEach((key) => delete customerSearchTerms[key])
}

watch(() => props.modelValue, (visible) => { if (visible) resetState() })

/** 計算資料 **/
const selectedEmployee = computed(() => mockEmployees.find((emp) => emp.id === selectedEmployeeId.value) || null)
const totalSelectedCustomers = computed(() => selectedProducts.value.reduce((sum, item) => sum + item.customerIds.length, 0))
const availableCustomers = computed(() => (selectedWeekDays.value.length ? mockCustomers.filter((customer) => customer.deliveryDays.some((day) => selectedWeekDays.value.includes(day))) : []))
const filteredProducts = computed(() =>
  mockProducts.filter((product) => {
    if (selectedCategory.value !== '全部' && product.category !== selectedCategory.value) return false
    if (productSearchTerm.value && !product.name.toLowerCase().includes(productSearchTerm.value.toLowerCase())) return false
    return true
  })
)

/** 工具函式 **/
const isProductSelected = (productId) => selectedProducts.value.some((item) => item.productId === productId)
const getProductSelection = (productId) => selectedProducts.value.find((item) => item.productId === productId)
const toggleWeekDay = (day) => {
  selectedWeekDays.value = selectedWeekDays.value.includes(day)
    ? selectedWeekDays.value.filter((d) => d !== day)
    : [...selectedWeekDays.value, day]
}
const toggleExpand = (productId) => {
  const set = new Set(expandedProducts.value)
  set.has(productId) ? set.delete(productId) : set.add(productId)
  expandedProducts.value = set
}
const toggleProduct = (productId) => {
  if (isProductSelected(productId)) {
    selectedProducts.value = selectedProducts.value.filter((item) => item.productId !== productId)
    const set = new Set(expandedProducts.value)
    set.delete(productId)
    expandedProducts.value = set
  } else {
    selectedProducts.value = [...selectedProducts.value, { productId, customerIds: [] }]
    const set = new Set(expandedProducts.value)
    set.add(productId)
    expandedProducts.value = set
  }
}
const handleCustomerToggle = (productId, customerId) => {
  selectedProducts.value = selectedProducts.value.map((item) => {
    if (item.productId !== productId) return item
    return item.customerIds.includes(customerId)
      ? { ...item, customerIds: item.customerIds.filter((id) => id !== customerId) }
      : { ...item, customerIds: [...item.customerIds, customerId] }
  })
}
const filteredCustomersForProduct = (productId) => {
  const term = (customerSearchTerms[productId] || '').trim().toLowerCase()
  if (!term) return availableCustomers.value
  return availableCustomers.value.filter((customer) => customer.name.toLowerCase().includes(term) || customer.type.includes(term) || customer.paymentMethod.includes(term))
}
const setCustomerSearchTerm = (productId, term) => {
  if (!term) delete customerSearchTerms[productId]
  else customerSearchTerms[productId] = term
}
const handleQuickSelectCategory = (category) => {
  const categoryProducts = mockProducts.filter((product) => product.category === category)
  const allSelected = categoryProducts.every((product) => isProductSelected(product.id))
  if (allSelected) {
    selectedProducts.value = selectedProducts.value.filter((item) => !categoryProducts.some((product) => product.id === item.productId))
    const set = new Set(expandedProducts.value)
    categoryProducts.forEach((product) => set.delete(product.id))
    expandedProducts.value = set
  } else {
    const additions = categoryProducts.filter((product) => !isProductSelected(product.id)).map((product) => ({ productId: product.id, customerIds: [] }))
    selectedProducts.value = [...selectedProducts.value, ...additions]
    const set = new Set(expandedProducts.value)
    categoryProducts.forEach((product) => set.add(product.id))
    expandedProducts.value = set
  }
}
const canGenerateReport = computed(() => selectedEmployeeId.value && selectedWeekDays.value.length && selectedProducts.value.length && selectedProducts.value.every((item) => item.customerIds.length > 0))
const buildReportPayload = () => {
  const products = selectedProducts.value.map((item) => {
    const product = mockProducts.find((p) => p.id === item.productId)
    return {
      productId: product.id,
      productName: product.name,
      rows: item.customerIds.map((customerId) => {
        const customer = mockCustomers.find((c) => c.id === customerId)
        return { customer: customer.name, paymentMethod: customer.paymentMethod }
      })
    }
  })
  return {
    employeeId: selectedEmployee.value?.id,
    employeeName: selectedEmployee.value?.name,
    date: new Date().toISOString().slice(0, 10),
    weekDayLabel: selectedWeekDays.value.join('、'),
    products
  }
}
const handleGenerateReport = () => {
  if (!canGenerateReport.value) {
    Notify({ type: 'warning', title: '請完成設定後再產生報表' })
    return
  }
  const payload = buildReportPayload()
  reportData.value = payload
  step.value = 'summary'
}
const handleConfirmReport = () => {
  const payload = reportData.value
  emit('report-created', payload)
  emit('update:modelValue', false)
  Notify({ type: 'success', title: '已產生報表' })
}
const handleDownloadCsv = () => {
  Notify({ type: 'info', title: 'CSV 下載中...' })
}
const handlePrintPreview = () => {
  window.print()
  Notify({ type: 'success', title: '已送出預覽列印' })
}
const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <TinyDialogBox v-model:visible="props.modelValue" title="新增司機出貨日報表（加強版）" width="960px" class="max-h-[90vh]">
    <template #footer>
      <div class="flex justify-between">
        <TinyButton type="text" @click="closeDialog">關閉</TinyButton>
        <div v-if="step === 'summary'" class="flex gap-2">
          <TinyButton type="text" @click="handleDownloadCsv">匯出 CSV</TinyButton>
          <TinyButton type="text" @click="handlePrintPreview">
            <IconPrintPreview class="tiny-svg-size mr-1" /> 預覽列印
          </TinyButton>
          <TinyButton type="primary" @click="handleConfirmReport">確認送出</TinyButton>
        </div>
        <TinyButton v-else type="primary" :disabled="!canGenerateReport" @click="handleGenerateReport">產生報表</TinyButton>
      </div>
    </template>

    <div v-if="step === 'setup'" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs text-gray-500">送貨司機 *</p>
          <TinySelect v-model="selectedEmployeeId" :options="mockEmployees.map((employee) => ({ label: `${employee.name} - ${employee.position}`, value: employee.id }))" />
        </div>
        <div>
          <p class="text-xs text-gray-500">出貨星期（可多選） *</p>
          <div class="flex flex-wrap gap-2">
            <TinyButton v-for="day in weekDayOptions" :key="day" size="small" :type="selectedWeekDays.includes(day) ? 'primary' : 'text'" @click="toggleWeekDay(day)">{{ day }}</TinyButton>
          </div>
        </div>
      </div>

      <div class="rounded border p-3">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <TinySelect v-model="selectedCategory" :options="productCategoryFilters.map((category) => ({ label: category, value: category }))" />
          <TinyInput class="flex-1" placeholder="搜尋商品..." v-model="productSearchTerm" />
          <div class="space-x-1">
            <TinyButton v-for="category in quickSelectCategories" :key="category" size="small" type="text" @click="handleQuickSelectCategory(category)">快速：{{ category }}</TinyButton>
          </div>
        </div>
        <div class="rounded-lg border">
          <div class="grid divide-y">
            <div v-for="product in filteredProducts" :key="product.id" class="flex items-center justify-between p-3">
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ product.name }}</span>
                <span class="text-xs text-gray-500">{{ product.category }}</span>
              </div>
              <div class="flex items-center gap-2">
                <TinyButton size="small" type="text" @click="() => toggleExpand(product.id)">
                  <IconChevronDown v-if="expandedProducts.has(product.id)" class="tiny-svg-size" />
                  <IconChevronDown v-else class="tiny-svg-size rotate-180" />
                </TinyButton>
                <TinyCheckbox :model-value="isProductSelected(product.id)" @update:model-value="() => toggleProduct(product.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-for="product in selectedProducts" :key="product.productId" class="rounded border p-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">{{ mockProducts.find((p) => p.id === product.productId)?.name }}</h3>
          <TinyInput class="max-w-xs" v-model="customerSearchTerms[product.productId]" placeholder="搜尋客戶..." @update:model-value="(val) => setCustomerSearchTerm(product.productId, val)" />
        </div>
        <div class="mt-3 grid gap-2 md:grid-cols-2">
          <div v-for="customer in filteredCustomersForProduct(product.productId)" :key="customer.id" class="flex items-center justify-between rounded border p-2">
            <div>
              <p class="text-sm font-medium">{{ customer.name }}</p>
              <p class="text-xs text-gray-500">{{ customer.type }} · {{ customer.paymentMethod }}</p>
              <p class="text-xs text-gray-400">排程：{{ customer.deliveryDays.join('、') }}</p>
            </div>
            <TinyCheckbox :model-value="getProductSelection(product.productId)?.customerIds.includes(customer.id)" @update:model-value="() => handleCustomerToggle(product.productId, customer.id)" />
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500">已選擇 {{ getProductSelection(product.productId)?.customerIds.length || 0 }} 位客戶</p>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="rounded border p-3">
        <p class="text-sm text-gray-500">司機：{{ selectedEmployee?.name }}</p>
        <p class="text-sm text-gray-500">出貨星期：{{ selectedWeekDays.join('、') }}</p>
        <p class="text-sm text-gray-500">總商品：{{ selectedProducts.length }}，總客戶：{{ totalSelectedCustomers }}</p>
      </div>
      <div class="rounded border">
        <table class="min-w-full divide-y text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="px-3 py-2 text-left">商品</th>
              <th class="px-3 py-2 text-left">客戶列表</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="product in selectedProducts" :key="product.productId">
              <td class="px-3 py-2">{{ mockProducts.find((p) => p.id === product.productId)?.name }}</td>
              <td class="px-3 py-2 text-sm text-gray-700">
                <span v-for="customerId in product.customerIds" :key="customerId" class="mr-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {{ mockCustomers.find((customer) => customer.id === customerId)?.name }}
                  <TinyBadge type="info">{{ mockCustomers.find((customer) => customer.id === customerId)?.paymentMethod }}</TinyBadge>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </TinyDialogBox>
</template>
