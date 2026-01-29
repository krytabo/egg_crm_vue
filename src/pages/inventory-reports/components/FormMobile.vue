<template>
  <div class="pb-20">
    <!-- Top Navigation -->
    <van-nav-bar
      :title="t('productDetailEdit', '商品明細編輯')"
      left-arrow
      @click-left="vm.handleBack"
    >
      <template #right>
        <van-button size="small" type="primary" :loading="vm.saving" @click="vm.handleSave">
          {{ t('save', '儲存') }}
        </van-button>
      </template>
    </van-nav-bar>

    <!-- Basic Info Form -->
    <van-form class="mt-2">
      <van-cell-group inset>
        <!-- Driver Select (Readonly for now as per logic, but logic has v-model) -->
        <!-- In desktop it was InfiniteSelect readonly. -->
        <van-field
          :model-value="vm.basicForm.drivers?.name"
          :label="t('driver', '司機')"
          readonly
        />
        
        <!-- Report Date -->
        <van-field
          :model-value="vm.basicForm.reportDate"
          :label="t('reportDate', '報表日期')"
          readonly
        />

        <!-- Delivery Days -->
        <van-field :label="t('deliveryDays', '出貨星期')">
          <template #input>
            <van-checkbox-group v-model="vm.basicForm.deliveryDays" direction="horizontal">
              <van-checkbox v-for="opt in vm.weekDayOptions" :key="opt.value" :name="opt.value" shape="square">
                {{ opt.label }}
              </van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>

        <!-- Note -->
        <van-field
          v-model="vm.basicForm.note"
          rows="1"
          autosize
          :label="t('notes', '備註')"
          type="textarea"
          :placeholder="t('enterNote', '輸入備註...')"
        />
      </van-cell-group>
    </van-form>

    <!-- Product List -->
    <div class="mt-4 px-3">
      <div class="mb-2 flex justify-between items-center">
        <h3 class="text-sm font-medium text-gray-500">{{ t('productList', '商品列表') }} ({{ vm.editedProducts.length }})</h3>
        <van-button icon="plus" type="primary" size="mini" plain @click="vm.openAddProductDialog">
          {{ t('addProduct', '新增商品') }}
        </van-button>
      </div>

      <div v-if="vm.editedProducts.length === 0" class="text-center py-8 text-gray-400 text-sm bg-white rounded-lg">
        {{ t('noProducts', '尚無商品資料') }}
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="(row, index) in vm.editedProducts" 
          :key="row.rowKey" 
          class="bg-white rounded-lg p-3 shadow-sm relative overflow-hidden"
        >
          <!-- Delete Button (Top Right) -->
          <div class="absolute top-0 right-0 p-2 z-10" @click="vm.handleDeleteRow(index)">
             <van-icon name="delete-o" color="red" size="18" />
          </div>

          <!-- Header: Product Name -->
          <div class="flex items-center gap-2 mb-3 pr-8">
            <van-tag :type="getVantTagType(row.productCategory)">{{ row.productCategory || '—' }}</van-tag>
            <span class="font-bold text-base truncate">{{ row.productName }}</span>
          </div>

          <!-- Fields Grid -->
          <div class="grid grid-cols-1 gap-2">
            <!-- Customer -->
            <!-- Note: Replicating InfiniteSelect behavior on mobile is complex. 
                 For this prototype, we'll display the name and a button to change it if needed, 
                 but implementing the full search picker here is out of scope for a quick refactor. 
                 We will use a readonly field that opens a popup. -->
             <van-field 
               :model-value="row.customerName"
               :label="t('customer', '客戶')"
               is-link
               readonly
               input-align="right"
               :placeholder="t('selectCustomer', '選擇客戶')"
               @click="openCustomerPicker(index)"
             />

             <div class="grid grid-cols-2 gap-2">
               <van-field 
                 v-model="row.quantity" 
                 type="number" 
                 :label="t('quantity', '數量')" 
                 input-align="right"
                 @update:model-value="() => vm.recalculateRow(index)"
               />
               <van-field 
                 v-model="row.unitPrice" 
                 type="number" 
                 :label="t('unitPrice', '單價')" 
                 input-align="right"
                 @update:model-value="() => vm.recalculateRow(index)"
               />
             </div>

             <div class="grid grid-cols-2 gap-2">
               <van-field 
                 :model-value="row.amount" 
                 :label="t('amount', '金額')" 
                 readonly 
                 input-align="right"
               >
                  <template #input>
                    <span class="text-gray-900">NT$ {{ vm.formatNumber(row.amount) }}</span>
                  </template>
               </van-field>
               <van-field 
                 v-model="row.actualAmount" 
                 type="number" 
                 :label="t('actualPayment', '實收')" 
                 input-align="right"
               />
             </div>
             
             <van-field
                v-model="row.paymentMethod"
                :label="t('paymentMethod', '付款')"
                is-link
                readonly
                input-align="right"
                @click="openPaymentPicker(index)"
             />

             <van-field 
               v-model="row.note" 
               :label="t('note', '備註')" 
               placeholder="選填"
               input-align="right"
             />
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Section (Bottom) -->
    <div class="mt-4 bg-white p-4 pb-8 space-y-2 border-t">
      <div class="flex justify-between text-sm text-gray-500">
        <span>{{ t('subtotalAmount', '商品總金額') }}</span>
        <span>NT$ {{ vm.formatNumber(vm.totalAmount) }}</span>
      </div>
      <div class="flex justify-between text-base font-medium">
        <span>{{ t('actualPaymentTotal', '實際收付') }}</span>
        <span class="text-blue-600">NT$ {{ vm.formatNumber(vm.totalActualAmount) }}</span>
      </div>
      
      <van-field 
        v-model="vm.fuelExpense" 
        type="number" 
        :label="t('fuelExpense', '加油支出')" 
        input-align="right" 
      />
      <van-field 
        v-model="vm.otherExpense" 
        type="number" 
        :label="t('otherExpense', '其他支出')" 
        input-align="right" 
      />
      
      <van-divider />
      
      <div class="flex justify-between items-center text-lg font-bold">
        <span class="text-gray-700">{{ t('金額總計', '金額總計') }}</span>
        <span class="text-green-600">NT$ {{ vm.formatNumber(vm.totalActualAmount - vm.fuelExpense - vm.otherExpense) }}</span>
      </div>
      
      <!-- Clear All / Export buttons -->
      <div class="grid grid-cols-2 gap-3 mt-4">
        <van-button block plain type="danger" @click="vm.handleClearAll">
          {{ t('clearAll', '清除全部') }}
        </van-button>
        <!-- Export handled by parent/desktop for now or we can add it here -->
        <van-button block plain type="primary" disabled>
          {{ t('匯出Excel', '匯出Excel') }}
        </van-button>
      </div>
    </div>

    <!-- Add Product Popup -->
    <van-popup
      v-model:show="vm.addProductDialogVisible"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="p-4">
        <div class="text-center font-bold text-lg mb-4">{{ t('addProduct', '新增商品') }}</div>
        
        <van-form @submit="vm.handleConfirmAddProduct">
          <van-cell-group inset>
            <van-field
              :model-value="vm.selectedProduct?.name"
              :label="t('selectProduct', '商品')"
              placeholder="點擊選擇商品"
              is-link
              readonly
              required
              @click="openProductSelectPicker"
            />
            <van-field
              :model-value="vm.selectedCustomer?.name"
              :label="t('selectCustomer', '客戶')"
              placeholder="點擊選擇客戶"
              is-link
              readonly
              required
              @click="openCustomerSelectPicker"
            />
            <van-field
              v-model="vm.newProductQuantity"
              type="number"
              :label="t('quantity', '數量')"
              required
            />
            <van-field
              v-model="vm.newProductUnitPrice"
              type="number"
              :label="t('unitPrice', '單價')"
            />
             <van-field
               v-model="vm.newProductPaymentMethod"
               :label="t('paymentMethod', '付款')"
               is-link
               readonly
               @click="showNewPaymentPicker = true"
             />
             <van-field
               v-model="vm.newProductNote"
               :label="t('note', '備註')"
             />
          </van-cell-group>
          
          <div v-if="vm.selectedProduct" class="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700 space-y-1">
             <p>預設單價：NT$ {{ vm.formatNumber(vm.selectedProduct.basePriceAmount) }}</p>
             <p v-if="vm.customerCustomPrice">客戶自定義價格：NT$ {{ vm.formatNumber(vm.customerCustomPrice) }}</p>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
             <van-button block @click="vm.closeAddProductDialog">{{ t('cancel', '取消') }}</van-button>
             <van-button block type="primary" native-type="submit" :disabled="!vm.selectedProduct || !vm.selectedCustomer">
               {{ t('confirm', '確認') }}
             </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- Payment Picker Popup (Generic) -->
    <van-popup v-model:show="showPaymentPicker" position="bottom" round>
      <van-picker
        :columns="paymentOptionsFormatted"
        @confirm="onPaymentConfirm"
        @cancel="showPaymentPicker = false"
      />
    </van-popup>
    
    <!-- New Product Payment Picker -->
    <van-popup v-model:show="showNewPaymentPicker" position="bottom" round>
       <van-picker
         :columns="paymentOptionsFormatted"
         @confirm="onNewPaymentConfirm"
         @cancel="showNewPaymentPicker = false"
       />
    </van-popup>

    <!-- Placeholder for Product/Customer Selectors -->
    <!-- Ideally these would be separate full-screen search components. -->
    <!-- For now, we simulate with a simple action sheet or we'd need to fetch data. -->
    <!-- Since I cannot implement the full infinite select logic here easily without the data source logic, -->
    <!-- I will assume we can use a simplified approach or leave TODOs. -->
    <!-- Actually, I can implement a basic reusable Picker with search if I had the data. -->
    <!-- But the data comes from 'dataSource' string in InfiniteSelect. -->
    <!-- I will add a 'Not Implemented' toast for the Selectors in this refactor step, -->
    <!-- OR better, implement a basic Customer/Product picker using the same API if possible. -->
    <!-- I'll add a placeholder component logic below. -->
    <MobileResourcePicker 
      v-model:show="showResourcePicker"
      :data-source="currentResourceType"
      @select="handleResourceSelect"
    />

  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
// Import Vant components locally if not auto-imported (Assuming auto-import based on package.json, but explicit import is safer for generated code)
// package.json has @vant/auto-import-resolver, so we should be good.

// MobileResourcePicker is a helper I'll create inside this file or separately.
// Since I can't create too many files, I'll define it dynamically or just handle logic.
// For this turn, I will create a separate component file for the Picker to be clean.
const MobileResourcePicker = defineAsyncComponent(() => import('./MobileResourcePicker.vue'));

const props = defineProps({
  vm: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();

// Helpers
const getVantTagType = (category) => {
  // Map category to Vant types: primary, success, warning, danger
  // Simple hash or mapping
  return 'primary';
};

const paymentOptionsFormatted = computed(() => {
  return props.vm.paymentOptions.map(opt => ({ text: opt.label, value: opt.value }));
});

// Payment Picker State
const showPaymentPicker = ref(false);
const activeRowIndex = ref(null);
const openPaymentPicker = (index) => {
  activeRowIndex.value = index;
  showPaymentPicker.value = true;
};
const onPaymentConfirm = ({ selectedOptions }) => {
  if (activeRowIndex.value !== null) {
    props.vm.editedProducts[activeRowIndex.value].paymentMethod = selectedOptions[0].value;
  }
  showPaymentPicker.value = false;
};

// New Product Payment Picker
const showNewPaymentPicker = ref(false);
const onNewPaymentConfirm = ({ selectedOptions }) => {
  props.vm.newProductPaymentMethod = selectedOptions[0].value;
  showNewPaymentPicker.value = false;
};

// Resource Picker State
const showResourcePicker = ref(false);
const currentResourceType = ref(''); // 'products' or 'customers'
const isSelectingForRow = ref(false); // true if selecting for a row, false if for add dialog

const openProductSelectPicker = () => {
  currentResourceType.value = 'products';
  isSelectingForRow.value = false;
  showResourcePicker.value = true;
};

const openCustomerSelectPicker = () => {
  currentResourceType.value = 'customers';
  isSelectingForRow.value = false;
  showResourcePicker.value = true;
};

const openCustomerPicker = (index) => {
  activeRowIndex.value = index;
  currentResourceType.value = 'customers';
  isSelectingForRow.value = true;
  showResourcePicker.value = true;
};

const handleResourceSelect = (item) => {
  if (currentResourceType.value === 'products') {
     if (!isSelectingForRow.value) {
       props.vm.selectedProduct = item; // item should have full object
     }
  } else if (currentResourceType.value === 'customers') {
     if (isSelectingForRow.value && activeRowIndex.value !== null) {
       props.vm.handleCustomerChange(activeRowIndex.value, item);
     } else {
       props.vm.selectedCustomer = item;
     }
  }
  showResourcePicker.value = false;
};

</script>
