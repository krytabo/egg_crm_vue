<!-- src/components/dialogs/DailyShippingReportDialog.vue 出貨日報表對話框 -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { DialogBox as TinyDialogBox, Button as TinyButton, Input as TinyInput, Select as TinySelect, Checkbox as TinyCheckbox, Badge as TinyBadge } from '@opentiny/vue'
import Notify from '@opentiny/vue-notify'

/** 元件定義 **/
const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'report-created'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/** 常數資料 **/
const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const productCategories = ['全部', '飲水', '雞蛋', '飲水機']
const mockProducts = [
  { id: 1, name: '清泉 20L', category: '飲水' },
  { id: 2, name: '純淨 20L', category: '飲水' },
  { id: 3, name: '紅殼蛋 10入/盒', category: '雞蛋' },
  { id: 4, name: '白殼蛋 10入/盒', category: '雞蛋' },
  { id: 5, name: 'WD-2000 冷熱', category: '飲水機' },
  { id: 6, name: '山泉 20L', category: '飲水' },
  { id: 7, name: '礦泉 20L', category: '飲水' },
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
const step = ref('setup') //目前步驟：setup 或 preview
const selectedEmployeeId = ref(null) //選取的司機 ID
const selectedWeekDays = ref([]) //選取的星期
const selectedCategory = ref('全部') //商品分類
const productSearch = ref('') //商品搜尋
const customerSearchTerms = reactive({}) //每個商品的客戶搜尋字詞
const selectedProducts = ref([]) //[{ productId, customerIds: [] }]
const previewData = ref(null) //預覽資料

/** 計算資料 **/
const selectedEmployee = computed(() => mockEmployees.find((emp) => emp.id === selectedEmployeeId.value) || null)
const availableCustomers = computed(() => {
  if (!selectedWeekDays.value.length) return []
  return mockCustomers.filter((customer) => customer.deliveryDays.some((day) => selectedWeekDays.value.includes(day)))
})
const filteredProducts = computed(() =>
  mockProducts.filter((product) => {
    if (selectedCategory.value !== '全部' && product.category !== selectedCategory.value) return false
    if (productSearch.value && !product.name.toLowerCase().includes(productSearch.value.toLowerCase())) return false
    return true
  })
)
const selectedProductDetails = computed(() =>
  selectedProducts.value.map((item) => ({
    ...item,
    product: mockProducts.find((product) => product.id === item.productId)
  }))
)
const canProceedToPreview = computed(() => {
  if (!selectedEmployeeId.value) return false
  if (!selectedWeekDays.value.length) return false
  if (!selectedProducts.value.length) return false
  return selectedProducts.value.every((item) => item.customerIds.length > 0)
})
const totalSelectedCustomers = computed(() => selectedProducts.value.reduce((sum, item) => sum + item.customerIds.length, 0))

/** 監聽設定 **/
const resetState = () => {
  step.value = 'setup'
  selectedEmployeeId.value = null
  selectedWeekDays.value = []
  selectedCategory.value = '全部'
  productSearch.value = ''
  selectedProducts.value = []
  previewData.value = null
  Object.keys(customerSearchTerms).forEach((key) => delete customerSearchTerms[key])
}
watch(dialogVisible, (visible) => {
  if (visible) resetState()
})

/** 工具函式 **/
const isProductSelected = (productId) => selectedProducts.value.some((item) => item.productId === productId)
const toggleProduct = (productId) => {
  if (isProductSelected(productId)) {
    selectedProducts.value = selectedProducts.value.filter((item) => item.productId !== productId)
  } else {
    selectedProducts.value = [...selectedProducts.value, { productId, customerIds: [] }]
  }
}
const toggleCustomer = (productId, customerId) => {
  selectedProducts.value = selectedProducts.value.map((item) => {
    if (item.productId !== productId) return item
    if (item.customerIds.includes(customerId)) {
      return { ...item, customerIds: item.customerIds.filter((id) => id !== customerId) }
    }
    return { ...item, customerIds: [...item.customerIds, customerId] }
  })
}
const toggleWeekDay = (day) => {
  if (selectedWeekDays.value.includes(day)) {
    selectedWeekDays.value = selectedWeekDays.value.filter((d) => d !== day)
  } else {
    selectedWeekDays.value = [...selectedWeekDays.value, day]
  }
}
const handleQuickSelectCategory = (category) => {
  const categoryProducts = mockProducts.filter((product) => product.category === category)
  const allSelected = categoryProducts.every((product) => isProductSelected(product.id))
  if (allSelected) {
    selectedProducts.value = selectedProducts.value.filter((item) => !categoryProducts.some((product) => product.id === item.productId))
  } else {
    const additions = categoryProducts.filter((product) => !isProductSelected(product.id)).map((product) => ({ productId: product.id, customerIds: [] }))
    selectedProducts.value = [...selectedProducts.value, ...additions]
  }
}
const filteredCustomersForProduct = (productId) => {
  const searchTerm = customerSearchTerms[productId] || ''
  if (!searchTerm) return availableCustomers.value
  return availableCustomers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.type.includes(searchTerm) ||
      customer.paymentMethod.includes(searchTerm)
  )
}
const buildPreview = () => {
  const products = selectedProducts.value.map((item) => {
    const product = mockProducts.find((p) => p.id === item.productId)
    const rows = item.customerIds.map((customerId) => {
      const customer = mockCustomers.find((c) => c.id === customerId)
      return {
        customerId,
        customer: customer.name,
        weekDays: customer.deliveryDays.filter((day) => selectedWeekDays.value.includes(day)),
        quantity: 0,
        unitPrice: 0,
        amount: 0,
        paymentMethod: customer.paymentMethod,
        note: ''
      }
    })
    return { productName: product.name, rows }
  })
  previewData.value = {
    date: new Date().toISOString().split('T')[0],
    weekDayLabel: selectedWeekDays.value.join('、'),
    products
  }
}
const goToPreview = () => {
  if (!canProceedToPreview.value) {
    Notify({ type: 'warning', title: '請確認欄位', message: '請完成司機、星期與商品/客戶選擇' })
    return
  }
  buildPreview()
  step.value = 'preview'
}
const handleBackToSetup = () => {
  step.value = 'setup'
}
const closeDialog = () => {
  dialogVisible.value = false
}
const handleSaveReport = () => {
  if (!previewData.value || !selectedEmployee.value) return
  const payload = { ...previewData.value, employeeId: selectedEmployee.value.id, employeeName: selectedEmployee.value.name }
  emit('report-created', payload)
  Notify({ type: 'success', title: '報表已建立' })
  closeDialog()
}
</script>

<template>
  <TinyDialogBox v-model:visible="dialogVisible" title="新增出貨日報表" width="960px" :show-close="true" @close="closeDialog">
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span :class="step === 'setup' ? 'font-semibold text-blue-600' : ''">1. 設定報表</span>
        <span>›</span>
        <span :class="step === 'preview' ? 'font-semibold text-blue-600' : ''">2. 預覽並建立</span>
      </div>

      <div v-if="step === 'setup'" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3 rounded-lg border p-4">
            <p class="text-sm font-medium text-gray-700">選擇司機</p>
            <TinySelect
              :model-value="selectedEmployeeId"
              placeholder="選擇司機"
              :options="mockEmployees.map((emp) => ({ label: `${emp.name}（${emp.position}）`, value: emp.id }))"
              @update:model-value="(val) => (selectedEmployeeId = val)"
            />
          </div>
          <div class="space-y-3 rounded-lg border p-4">
            <p class="text-sm font-medium text-gray-700">預計出貨星期</p>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="day in weekDays"
                :key="day"
                class="flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm"
                :class="selectedWeekDays.includes(day) ? 'bg-blue-50 border-blue-300' : 'border-gray-300'"
              >
                <TinyCheckbox :model-value="selectedWeekDays.includes(day)" @update:model-value="() => toggleWeekDay(day)" />
                {{ day }}
              </label>
            </div>
            <p v-if="!selectedWeekDays.length" class="text-xs text-gray-500">請至少選擇一個星期來篩選可配送客戶</p>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3 rounded-lg border p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-700">選擇商品</p>
              <TinySelect class="w-32" :model-value="selectedCategory" :options="productCategories.map((category) => ({ label: category, value: category }))" @update:model-value="(val) => (selectedCategory = val)" />
            </div>
            <TinyInput :model-value="productSearch" placeholder="搜尋商品..." @update:model-value="(val) => (productSearch = val)" />
            <div class="max-h-72 space-y-2 overflow-y-auto">
              <label
                v-for="product in filteredProducts"
                :key="product.id"
                class="flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm"
                :class="isProductSelected(product.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'"
              >
                <div class="flex items-center gap-2">
                  <TinyCheckbox :model-value="isProductSelected(product.id)" @update:model-value="() => toggleProduct(product.id)" />
                  <span>{{ product.name }}</span>
                </div>
                <TinyBadge type="info">{{ product.category }}</TinyBadge>
              </label>
              <p v-if="!filteredProducts.length" class="text-xs text-gray-500">沒有符合的商品</p>
            </div>
            <div class="flex flex-wrap gap-2 text-xs text-gray-600">
              <TinyButton v-for="category in ['飲水', '雞蛋', '飲水機']" :key="category" size="small" type="text" @click="() => handleQuickSelectCategory(category)">
                {{ category }}快速選取
              </TinyButton>
            </div>
          </div>

          <div class="space-y-3 rounded-lg border p-4">
            <p class="text-sm font-medium text-gray-700">指定客戶 / 廠商</p>
            <p v-if="!selectedWeekDays.length" class="rounded-md border border-orange-200 bg-orange-50 p-3 text-xs text-orange-600">需先選擇出貨星期才可顯示可配送的客戶</p>
            <p v-if="!selectedProducts.length" class="text-xs text-gray-500">請先選擇左側的商品</p>
            <div class="max-h-80 space-y-4 overflow-y-auto">
              <div v-for="item in selectedProductDetails" :key="item.productId" class="space-y-2 rounded-md border p-3">
                <div class="flex items-center justify-between text-sm font-medium">
                  <span>{{ item.product?.name }}</span>
                  <TinyBadge type="warning">{{ item.customerIds.length }} 位客戶</TinyBadge>
                </div>
                <TinyInput :model-value="customerSearchTerms[item.productId] || ''" placeholder="搜尋可配送客戶..." @update:model-value="(val) => (customerSearchTerms[item.productId] = val)" />
                <div class="max-h-48 space-y-2 overflow-y-auto">
                  <label
                    v-for="customer in filteredCustomersForProduct(item.productId)"
                    :key="customer.id"
                    class="flex cursor-pointer items-center justify-between rounded border px-2 py-1 text-xs"
                    :class="item.customerIds.includes(customer.id) ? 'border-green-400 bg-green-50' : 'border-gray-200'"
                  >
                    <div class="flex items-center gap-2">
                      <TinyCheckbox :model-value="item.customerIds.includes(customer.id)" :disabled="!selectedWeekDays.length" @update:model-value="() => toggleCustomer(item.productId, customer.id)" />
                      <span>{{ customer.name }}</span>
                    </div>
                    <TinyBadge type="info">{{ customer.deliveryDays.join('、') }}</TinyBadge>
                  </label>
                  <p v-if="!availableCustomers.length" class="text-xs text-gray-500">尚無符合出貨星期的客戶</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="space-y-1 rounded-lg border p-4 text-sm">
          <p><span class="mr-2 text-gray-500">司機</span><span class="font-medium text-gray-900">{{ selectedEmployee?.name || '-' }}</span></p>
          <p><span class="mr-2 text-gray-500">出貨星期</span><span class="font-medium text-gray-900">{{ selectedWeekDays.join('、') }}</span></p>
          <p><span class="mr-2 text-gray-500">商品數量</span><span class="font-medium text-gray-900">{{ selectedProducts.length }}</span></p>
        </div>
        <div class="rounded-lg border">
          <table class="min-w-full divide-y text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th class="px-3 py-2 text-left">商品</th>
                <th class="px-3 py-2 text-left">客戶 / 廠商</th>
                <th class="px-3 py-2 text-left">出貨星期</th>
                <th class="px-3 py-2 text-left">付款方式</th>
              </tr>
            </thead>
            <tbody class="divide-y bg-white">
              <template v-if="previewData?.products?.length">
                <template v-for="product in previewData.products" :key="product.productName">
                  <tr v-for="row in product.rows" :key="`${product.productName}-${row.customer}`">
                    <td class="px-3 py-2">{{ product.productName }}</td>
                    <td class="px-3 py-2">{{ row.customer }}</td>
                    <td class="px-3 py-2">{{ row.weekDays.join('、') }}</td>
                    <td class="px-3 py-2">{{ row.paymentMethod }}</td>
                  </tr>
                </template>
              </template>
              <tr v-else>
                <td colspan="4" class="px-3 py-4 text-center text-gray-500">尚未選擇資料</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <span v-if="step === 'setup'" class="text-xs text-gray-500">已選擇 {{ selectedProducts.length }} 個商品 · {{ totalSelectedCustomers }} 位客戶</span>
        <span v-else></span>
        <div class="flex gap-2">
          <TinyButton type="text" @click="closeDialog">取消</TinyButton>
          <TinyButton v-if="step === 'preview'" type="text" @click="handleBackToSetup">上一步</TinyButton>
          <TinyButton v-if="step === 'setup'" type="primary" :disabled="!canProceedToPreview" @click="goToPreview">下一步</TinyButton>
          <TinyButton v-else type="primary" @click="handleSaveReport">建立報表</TinyButton>
        </div>
      </div>
    </template>
  </TinyDialogBox>
</template>
