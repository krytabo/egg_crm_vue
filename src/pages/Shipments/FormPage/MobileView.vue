<!-- src/pages/inventory-reports/FormPage/MobileViewIonic.vue -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="handleBack">
            <ion-icon slot="start" :icon="chevronBackOutline" />
            {{ t('back', '返回') }}
          </ion-button>
        </ion-buttons>
        <ion-title>{{ isCreateMode ? t('createReport', '新增報表') : (isReadOnly ? t('viewReport', '檢視報表') : t('editReport', '編輯報表')) }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 報表資訊卡片 -->
      <ion-card class="info-card">
        <ion-card-header class="p-3 gap-1">
          <ion-card-title>
            <p class="flex-1 text-[20px]">{{ t('reportInfo', '報表資訊') }}</p>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list lines="none">
            <ion-item :button="isCreateMode" @click="isCreateMode && openDriverPicker()">
              <ion-label>
                <span :class="{ 'required-label': isCreateMode }">{{ t('driver', '司機') }}</span>
              </ion-label>
              <ion-note slot="end">{{ basicForm.drivers?.fullName || basicForm.drivers?.name || (isCreateMode ? t('pleaseSelect', '請選擇') : '—') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('reportDate', '報表日期') }}</ion-label>
              <ion-note slot="end">{{ basicForm.reportDate || '—' }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('deliveryDays', '出貨星期') }}</ion-label>
            </ion-item>
            <ion-item>
              <div class="weekday-chips">
                <ion-chip
                  v-for="option in weekDayOptions"
                  :key="option.label"
                  :color="basicForm.deliveryDays?.includes(option.label) ? 'primary' : 'medium'"
                  :outline="!basicForm.deliveryDays?.includes(option.label)"
                  :disabled="isReadOnly"
                  @click="!isReadOnly && toggleWeekDay(option.label)"
                  class="px-2"
                >
                  {{ option.text }}
                </ion-chip>
              </div>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
              <ion-textarea :placeholder="t('enterNote', '輸入備註...')" :value="basicForm.note" @ionInput="basicForm.note = $event.detail.value" auto-grow :disabled="isReadOnly" />
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- 商品列表 -->
      <ion-card class="info-card">
        <ion-card-header class="p-3 gap-1">
          <ion-card-title class="flex items-center gap-2">
            <p class="flex-1 text-[20px]">{{ t('productList', '商品列表') }}</p>
            <p class="text-[16px]">{{ t('totalCount', { total: editedProducts.length }) }}</p>
            <nut-button v-if="!isReadOnly" type="info" @click="openAddProductDialog"> <ion-icon slot="start" :icon="addOutline" />{{ t('new', '新增') }} </nut-button>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item-sliding v-for="(item, index) in editedProducts" :key="item.rowKey">
              <ion-item button @click="openEditPopup(index)">
                <div class="py-2 flex w-full items-center gap-4">
                  <ion-label class="flex-1 overflow-hidden">
                    <div class="flex items-center gap-1">
                      <span class="product-name truncate">{{ item.productName }}</span>
                      <ion-chip :color="getChipColor(item.productCategory)" size="small" class="px-2 truncate min-w-[48px]">
                        {{ item.productCategory || '—' }}
                      </ion-chip>
                    </div>
                    <p class="customer-name">{{ t('customer', '客戶') }}: {{ item.customerName || '—' }}</p>
                  </ion-label>
                  <div slot="end" class="amount-info">
                    <span class="quantity-price">{{ item.quantity }} × NT$ {{ formatNumber(item.unitPrice) }}</span>
                    <span class="total-amount">NT$ {{ formatNumber(item.amount) }}</span>
                  </div>
                </div>
              </ion-item>
              <ion-item-options v-if="!isReadOnly" side="end">
                <ion-item-option color="danger" @click="handleDeleteRow(index)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>

            <!-- 空狀態 -->
            <ion-item v-if="!editedProducts.length" class="empty-state">
              <ion-label class="ion-text-center">
                <ion-icon :icon="cubeOutline" size="large" color="medium" />
                <p>{{ t('noProducts', '尚無商品') }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- 底部結算區 -->
      <ion-card class="summary-card">
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>{{ t('subtotalAmount', '商品總金額') }}</ion-label>
              <ion-note slot="end" class="summary-value">NT$ {{ formatNumber(totalAmount) }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('actualPaymentTotal', '實際收付') }}</ion-label>
              <ion-note slot="end" class="summary-value text-primary">NT$ {{ formatNumber(totalActualAmount) }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('fuelExpense', '加油支出') }}</ion-label>
              <ion-input slot="end" placeholder="Enter text" :value="fuelExpense" @ionInput="fuelExpense = Number($event.detail.value) || 0" class="ion-text-right" :disabled="isReadOnly">
                <ion-note slot="end">元</ion-note>
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-label>{{ t('otherExpense', '其他支出') }}</ion-label>
              <ion-input slot="end" placeholder="Enter text" :value="otherExpense" @ionInput="otherExpense = Number($event.detail.value) || 0" class="ion-text-right" :disabled="isReadOnly">
                <ion-note slot="end">元</ion-note>
              </ion-input>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- 底部留白（給固定按鈕區留空間） -->
      <div class="bottom-spacer"></div>
    </ion-content>

    <!-- 底部操作按鈕 -->
    <ion-footer class="py-3 px-4 bg-white shadow-xl border-t-2">
      <ion-toolbar>
        <div class="bottom-summary" slot="start">
          <span class="summary-label">{{ t('totalAmount', '金額總計') }}</span>
          <span class="summary-total">NT$ {{ formatNumber(finalTotal) }}</span>
        </div>
        <nut-button v-if="!isReadOnly" slot="end" type="info" :disabled="saving" @click="handleSave">
          <ion-spinner v-if="saving" name="crescent" />
          <span v-else class="text-[18px]">{{ t('save', '儲存') }}</span>
        </nut-button>
      </ion-toolbar>
    </ion-footer>

    <!-- 編輯商品 Modal -->
    <ion-modal :is-open="editPopupVisible" @didDismiss="closeEditPopup" :initial-breakpoint="0.75" :breakpoints="[0, 0.5, 0.75, 1]">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeEditPopup">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('editProduct', '編輯商品') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content v-if="editingItem">
        <ion-list>
          <ion-item>
            <ion-label>{{ t('productName', '商品名稱') }}</ion-label>
            <ion-note slot="end">{{ editingItem.productName }}</ion-note>
          </ion-item>
          <ion-item button @click="openCustomerPicker('edit')">
            <ion-label>{{ t('customer', '客戶') }}</ion-label>
            <ion-note slot="end">{{ editingItem.customerName || t('selectCustomer', '選擇客戶') }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('quantity', '數量') }}</ion-label>
            <nut-input-number v-model="editingItem.quantity" :button-size="30" :input-width="50" />
          </ion-item>
          <ion-item>
            <ion-label>{{ t('unitPrice', '單價') }}</ion-label>
            <ion-input slot="end" placeholder="Enter text" :value="editingItem.unitPrice" @ionInput="onEditUnitPriceChange($event.detail.value)" class="ion-text-right">
              <ion-note slot="end">元</ion-note>
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('amount', '金額') }}</ion-label>
            <ion-note slot="end" class="amount-text">NT$ {{ formatNumber(editingItem.amount) }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('actualPayment', '實際收付') }}</ion-label>
            <ion-input slot="end" placeholder="Enter text" :value="editingItem.actualAmount" @ionInput="editingItem.actualAmount = Number($event.detail.value) || 0" class="ion-text-right">
              <ion-note slot="end">元</ion-note>
            </ion-input>
          </ion-item>
          <ion-item button @click="openPaymentPicker('edit')">
            <ion-label>{{ t('paymentMethod', '付款方式') }}</ion-label>
            <ion-note slot="end">{{ editingItem.paymentMethod || '現金' }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('note', '備註') }}</ion-label>
            <ion-input slot="end" :placeholder="t('enterNote', '請輸入備註')" :value="editingItem.note" @ionInput="editingItem.note = $event.detail.value" class="ion-text-right" />
          </ion-item>
        </ion-list>

        <div class="p-4">
          <ion-button expand="block" @click="confirmEditPopup">
            <p class="text-[18px]">{{ t('save', '儲存') }}</p>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- 新增商品 Modal -->
    <ion-modal :is-open="addProductDialogVisible" @didDismiss="closeAddProductDialog" :initial-breakpoint="0.75" :breakpoints="[0, 0.5, 0.75, 1]">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeAddProductDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('addProduct', '新增商品') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-item button @click="openProductPicker">
            <ion-label>
              <span class="required-label">{{ t('selectProduct', '選擇商品') }}</span>
            </ion-label>
            <ion-note slot="end">{{ selectedProduct?.name || t('pleaseSelect', '請選擇') }}</ion-note>
          </ion-item>
          <ion-item button @click="openCustomerPicker('add')">
            <ion-label>
              <span class="required-label">{{ t('selectCustomer', '選擇客戶') }}</span>
            </ion-label>
            <ion-note slot="end">{{ selectedCustomer?.name || t('pleaseSelect', '請選擇') }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('quantity', '數量') }}</ion-label>
            <nut-input-number v-model="newProductQuantity" :button-size="30" :input-width="50" />
          </ion-item>
          <ion-item>
            <ion-label>{{ t('unitPrice', '單價') }}</ion-label>
            <ion-input slot="end" placeholder="Enter text" :value="newProductUnitPrice" @ionInput="newProductUnitPrice = Number($event.detail.value) || 0" class="ion-text-right">
              <ion-note slot="end">元</ion-note>
            </ion-input>
          </ion-item>
          <ion-item button @click="openPaymentPicker('add')">
            <ion-label>{{ t('paymentMethod', '付款方式') }}</ion-label>
            <ion-note slot="end">{{ newProductPaymentMethod }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ t('note', '備註') }}</ion-label>
            <ion-input slot="end" :placeholder="t('enterNote', '請輸入備註')" :value="newProductNote" @ionInput="newProductNote = $event.detail.value" class="ion-text-right" />
          </ion-item>
        </ion-list>

        <!-- 商品資訊提示 -->
        <ion-card v-if="selectedProduct" class="product-info-tip" color="primary">
          <ion-card-content>
            <p>{{ productInfoText }}</p>
          </ion-card-content>
        </ion-card>

        <div class="p-4">
          <ion-button expand="block" @click="handleConfirmAddProduct">
            <p class="text-[18px]">{{ t('confirm', '確認') }}</p>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- 商品選擇 Modal -->
    <ion-modal :is-open="productPickerVisible" @didDismiss="closeProductPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeProductPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectProduct', '選擇商品') }}</ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar :placeholder="t('searchProduct', '搜尋商品')" :value="productSearch" @ionInput="productSearch = $event.detail.value" debounce="300" />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="item in productList" :key="item.id" button @click="selectProduct(item)">
            <!--<ion-icon :icon="cubeOutline" slot="start" />-->
            <ion-label class="my-2 overflow-hidden mr-4">
              <h2 class="truncate">{{ item.name }}</h2>
              <p class="truncate">{{ item.category?.name || item.categoryName || '' }}</p>
            </ion-label>
            <ion-note slot="end">NT$ {{ formatNumber(item.basePriceAmount) }}</ion-note>
          </ion-item>

          <!-- 載入中（首次載入） -->
          <ion-item v-if="productLoading && !productList.length">
            <ion-label class="ion-text-center">
              <ion-spinner name="crescent" />
              <p>{{ t('loading', '載入中...') }}</p>
            </ion-label>
          </ion-item>

          <!-- 空狀態 -->
          <ion-item v-else-if="!productList.length && !productLoading">
            <ion-label class="ion-text-center">
              <ion-icon :icon="alertCircleOutline" size="large" color="medium" />
              <p>{{ t('noData', '查無資料') }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限捲動 -->
        <ion-infinite-scroll @ionInfinite="loadMoreProducts" :disabled="!productHasMore || productLoading">
          <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="t('loading', '載入中...')" />
        </ion-infinite-scroll>

        <!-- 沒有更多資料提示 -->
        <div v-if="productNoMoreData && productList.length > 0" class="no-more-data">
          <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
        </div>
      </ion-content>
    </ion-modal>

    <!-- 客戶選擇 Modal -->
    <ion-modal :is-open="customerPickerVisible" @didDismiss="closeCustomerPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeCustomerPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectCustomer', '選擇客戶') }}</ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar :placeholder="t('searchCustomer', '搜尋客戶')" :value="customerSearch" @ionInput="customerSearch = $event.detail.value" debounce="300" />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="item in customerList" :key="item.id" button @click="selectCustomer(item)">
            <!--<ion-icon :icon="personOutline" slot="start" />-->
            <ion-label class="my-2 overflow-hidden mr-4">
              <h2 class="truncate">{{ item.name }}</h2>
              <p class="truncate">{{ item.phone || item.address || '' }}</p>
            </ion-label>
          </ion-item>

          <!-- 載入中（首次載入） -->
          <ion-item v-if="customerLoading && !customerList.length">
            <ion-label class="ion-text-center">
              <ion-spinner name="crescent" />
              <p>{{ t('loading', '載入中...') }}</p>
            </ion-label>
          </ion-item>

          <!-- 空狀態 -->
          <ion-item v-else-if="!customerList.length && !customerLoading">
            <ion-label class="ion-text-center">
              <ion-icon :icon="alertCircleOutline" size="large" color="medium" />
              <p>{{ t('noData', '查無資料') }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限捲動 -->
        <ion-infinite-scroll @ionInfinite="loadMoreCustomers" :disabled="!customerHasMore || customerLoading">
          <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="t('loading', '載入中...')" />
        </ion-infinite-scroll>

        <!-- 沒有更多資料提示 -->
        <div v-if="customerNoMoreData && customerList.length > 0" class="no-more-data">
          <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
        </div>
      </ion-content>
    </ion-modal>

    <!-- 付款方式選擇 Action Sheet -->
    <ion-action-sheet :is-open="paymentPickerVisible" :header="t('selectPaymentMethod', '選擇付款方式')" :buttons="paymentActionButtons" @didDismiss="paymentPickerVisible = false" />

    <!-- 司機選擇 Modal -->
    <ion-modal :is-open="driverPickerVisible" @didDismiss="closeDriverPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDriverPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectDriver', '選擇司機') }}</ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar :placeholder="t('searchDriver', '搜尋司機')" :value="driverSearch" @ionInput="driverSearch = $event.detail.value" debounce="300" />
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="driver in driverList" :key="driver.id" button @click="selectDriver(driver)">
            <ion-label>{{ driver.fullName }}</ion-label>
            <ion-icon v-if="basicForm.drivers?.id === driver.id" slot="end" :icon="checkmarkOutline" color="primary" />
          </ion-item>

          <!-- 載入中（首次載入） -->
          <ion-item v-if="driverLoading && !driverList.length">
            <ion-label class="ion-text-center">
              <ion-spinner name="crescent" />
              <p>{{ t('loading', '載入中...') }}</p>
            </ion-label>
          </ion-item>

          <!-- 空狀態 -->
          <ion-item v-else-if="!driverList.length && !driverLoading">
            <ion-label class="ion-text-center">
              <ion-icon :icon="alertCircleOutline" size="large" color="medium" />
              <p>{{ t('noData', '查無資料') }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- 無限捲動 -->
        <ion-infinite-scroll @ionInfinite="loadMoreDrivers" :disabled="!driverHasMore || driverLoading">
          <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="t('loading', '載入中...')" />
        </ion-infinite-scroll>

        <!-- 沒有更多資料提示 -->
        <div v-if="driverNoMoreData && driverList.length > 0" class="no-more-data">
          <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonNote,
  IonInput,
  IonTextarea,
  IonChip,
  IonIcon,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonActionSheet,
  toastController,
  alertController,
} from '@ionic/vue';
import { addOutline, trashOutline, cubeOutline, personOutline, alertCircleOutline, chevronBackOutline, checkmarkOutline } from 'ionicons/icons';
import { useFormPage } from './useFormPage';
import { CustomersListGet } from '@/assets/API/Customers.js';
import { ProductListGet } from '@/assets/API/Product.js';
import { DriverListGet } from '@/assets/API/Drivers.js';

const props = defineProps({
  uuid: { type: String, default: '' },
});

const router = useRouter();
const { t } = useI18n();

// 返回按鈕處理 - 檢查是否有歷史記錄
const handleBack = () => {
  // 檢查是否有導航歷史（window.history.length > 1 且有上一頁）
  if (window.history.length > 1 && document.referrer) {
    router.back();
  } else {
    // 沒有歷史記錄時，直接導航到列表頁
    router.push({ name: 'm-shipments-reports' });
  }
};

// Ionic Toast 訊息顯示
const showMessage = async (type, content) => {
  const colors = { success: 'success', error: 'danger', warning: 'warning', info: 'primary' };
  const toast = await toastController.create({
    message: content,
    duration: 2000,
    position: 'top',
    color: colors[type] || 'primary',
  });
  await toast.present();
};

// Ionic 確認對話框
const showConfirm = async ({ title, message, onConfirm }) => {
  const alert = await alertController.create({
    header: title,
    message: message,
    buttons: [
      {
        text: t('cancel', '取消'),
        role: 'cancel',
      },
      {
        text: t('confirm', '確認'),
        role: 'confirm',
        handler: () => {
          if (onConfirm) onConfirm();
        },
      },
    ],
  });
  await alert.present();
};

// 使用共用邏輯
const {
  saving,
  basicForm,
  editedProducts,
  fuelExpense,
  otherExpense,
  isCreateMode,
  isReadOnly,
  addProductDialogVisible,
  selectedProduct,
  selectedCustomer,
  newProductQuantity,
  newProductUnitPrice,
  newProductPaymentMethod,
  newProductNote,
  totalAmount,
  totalActualAmount,
  finalTotal,
  customerCustomPrice,
  paymentOptions,
  weekDayOptions,
  formatNumber,
  getData,
  handleSave,
  handleDeleteRow,
  openAddProductDialog,
  closeAddProductDialog,
  handleConfirmAddProduct,
} = useFormPage(props, t, showMessage, showConfirm);

// ===== Mobile 專用狀態 =====
const editPopupVisible = ref(false);
const editingIndex = ref(-1);
const editingItem = ref(null);

// ===== API 回應資料正規化 =====
const normalizeResponse = (response) => {
  if (!response) return { data: [], total: 0 };
  const dataBlock = response.data?.data ?? response.data ?? response;
  const items = dataBlock?.data ?? dataBlock?.items ?? dataBlock ?? [];
  const total = dataBlock?.meta?.total ?? dataBlock?.total ?? items.length;
  return { data: Array.isArray(items) ? items : [], total };
};

// ===== 分頁常數 =====
const PAGE_SIZE = 20;
const CUSTOMER_PAGE_SIZE = 50; // 客戶使用較大的頁面大小以便客戶端篩選

// ===== 商品選擇器狀態 =====
const productPickerVisible = ref(false);
const productList = ref([]);
const productPage = ref(1);
const productTotal = ref(0);
const productLoading = ref(false);
const productSearch = ref('');
const productLastFetchedCount = ref(0);
const productNoMoreData = ref(false);
const productHasMore = computed(() => {
  if (productNoMoreData.value) return false;
  if (productLastFetchedCount.value > 0 && productLastFetchedCount.value < PAGE_SIZE) return false;
  return productList.value.length < productTotal.value;
});

// ===== 客戶選擇器狀態 =====
const customerPickerVisible = ref(false);
const customerPickerMode = ref('add');
const customerList = ref([]);
const customerPage = ref(1);
const customerTotal = ref(0);
const customerLoading = ref(false);
const customerSearch = ref('');
const customerLastFetchedCount = ref(0);
const customerNoMoreData = ref(false);
const customerHasMore = computed(() => {
  if (customerNoMoreData.value) return false;
  if (customerLastFetchedCount.value > 0 && customerLastFetchedCount.value < CUSTOMER_PAGE_SIZE) return false;
  return customerList.value.length < customerTotal.value;
});

// ===== 付款方式選擇器 =====
const paymentPickerVisible = ref(false);
const paymentPickerMode = ref('add');
const paymentActionButtons = computed(() => [
  ...paymentOptions.value.map((option) => ({
    text: option.label,
    handler: () => {
      if (paymentPickerMode.value === 'edit' && editingItem.value) {
        editingItem.value.paymentMethod = option.value;
      } else {
        newProductPaymentMethod.value = option.value;
      }
    },
  })),
  { text: t('cancel', '取消'), role: 'cancel' },
]);

// ===== 司機選擇器狀態 =====
const driverPickerVisible = ref(false);
const driverList = ref([]);
const driverPage = ref(1);
const driverTotal = ref(0);
const driverLoading = ref(false);
const driverSearch = ref('');
const driverLastFetchedCount = ref(0);
const driverNoMoreData = ref(false);
const driverHasMore = computed(() => {
  if (driverNoMoreData.value) return false;
  if (driverLastFetchedCount.value > 0 && driverLastFetchedCount.value < PAGE_SIZE) return false;
  return driverList.value.length < driverTotal.value;
});

// ===== 載入司機資料（分頁）=====
const loadDrivers = async (page = 1, append = false) => {
  if (driverLoading.value) return;
  driverLoading.value = true;
  try {
    const params = { page, limit: PAGE_SIZE };
    if (driverSearch.value.trim()) {
      params.search = driverSearch.value.trim();
    }
    const response = await DriverListGet(params);
    const { data, total } = normalizeResponse(response);

    driverLastFetchedCount.value = data.length;

    if (append) {
      driverList.value = [...driverList.value, ...data];
    } else {
      driverList.value = data;
    }
    driverTotal.value = total;
    driverPage.value = page;

    // 檢查是否沒有更多資料
    if (data.length < PAGE_SIZE) {
      driverNoMoreData.value = true;
    }
  } catch (error) {
    console.error('Failed to load drivers:', error);
  } finally {
    driverLoading.value = false;
  }
};

// ===== 司機選擇器操作 =====
const openDriverPicker = async () => {
  driverSearch.value = '';
  driverList.value = [];
  driverPage.value = 1;
  driverLastFetchedCount.value = 0;
  driverNoMoreData.value = false;
  driverPickerVisible.value = true;
  await loadDrivers(1);
};

const closeDriverPicker = () => {
  driverPickerVisible.value = false;
};

const loadMoreDrivers = async (event) => {
  if (driverHasMore.value && !driverLoading.value) {
    await loadDrivers(driverPage.value + 1, true);
  }
  event.target.complete();
};

const selectDriver = (driver) => {
  basicForm.value.drivers = driver;
  closeDriverPicker();
};

// ===== 載入商品資料（分頁）=====
const loadProducts = async (page = 1, append = false) => {
  if (productLoading.value) return;
  productLoading.value = true;
  try {
    const params = { page, limit: PAGE_SIZE };
    if (productSearch.value.trim()) {
      params.search = productSearch.value.trim();
    }
    const response = await ProductListGet(params);
    const { data, total } = normalizeResponse(response);

    productLastFetchedCount.value = data.length;

    if (append) {
      productList.value = [...productList.value, ...data];
    } else {
      productList.value = data;
    }
    productTotal.value = total;
    productPage.value = page;

    // 檢查是否沒有更多資料
    if (data.length < PAGE_SIZE) {
      productNoMoreData.value = true;
    }
  } catch (error) {
    console.error('Failed to load products:', error);
  } finally {
    productLoading.value = false;
  }
};

// ===== 載入客戶資料（分頁）=====
const loadCustomers = async (page = 1, append = false) => {
  if (customerLoading.value) return;
  customerLoading.value = true;
  try {
    const deliveryDays = basicForm.value?.deliveryDays || [];
    const params = { page, limit: CUSTOMER_PAGE_SIZE };

    if (customerSearch.value.trim()) {
      params.search = customerSearch.value.trim();
    }

    const response = await CustomersListGet(params);
    let { data, total } = normalizeResponse(response);
    const rawFetchedCount = data.length; // API 回傳的原始數量

    // 客戶端篩選：出貨日期
    if (deliveryDays.length > 0) {
      data = data.filter((customer) => {
        const customerDays = customer.deliveryDays || [];
        // 客戶的 deliveryDays 需與表單選擇的 deliveryDays 有交集
        return deliveryDays.some((day) => customerDays.includes(day));
      });
    }

    // 客戶端篩選：商品種類
    const productCategory = selectedProduct.value?.category?.name || selectedProduct.value?.categoryName;
    if (productCategory) {
      data = data.filter((customer) => {
        const customerCategories = customer.customFields?.categories || [];
        // 客戶的 categories 需包含選擇的商品種類
        return customerCategories.includes(productCategory);
      });
    }

    customerLastFetchedCount.value = rawFetchedCount;

    if (append) {
      customerList.value = [...customerList.value, ...data];
    } else {
      customerList.value = data;
    }
    customerTotal.value = total;
    customerPage.value = page;

    // 檢查是否沒有更多資料（基於 API 原始回傳數量）
    if (rawFetchedCount < CUSTOMER_PAGE_SIZE) {
      customerNoMoreData.value = true;
    }
  } catch (error) {
    console.error('Failed to load customers:', error);
  } finally {
    customerLoading.value = false;
  }
};

// ===== 商品選擇器操作 =====
const openProductPicker = async () => {
  productSearch.value = '';
  productList.value = [];
  productPage.value = 1;
  productLastFetchedCount.value = 0;
  productNoMoreData.value = false;
  productPickerVisible.value = true;
  await loadProducts(1);
};

const closeProductPicker = () => {
  productPickerVisible.value = false;
};

const loadMoreProducts = async (event) => {
  if (productHasMore.value && !productLoading.value) {
    await loadProducts(productPage.value + 1, true);
  }
  event.target.complete();
};

const selectProduct = (product) => {
  selectedProduct.value = product;
  const basePrice = product.basePriceAmount || 0;
  if (selectedCustomer.value) {
    const customPrices = selectedCustomer.value.customFields?.customPrices || [];
    const customPrice = customPrices.find((cp) => cp.productId === product.id || cp.product?.id === product.id);
    newProductUnitPrice.value = customPrice?.price ?? basePrice;
  } else {
    newProductUnitPrice.value = basePrice;
  }
  closeProductPicker();
};

// ===== 客戶選擇器操作 =====
const openCustomerPicker = async (mode) => {
  customerPickerMode.value = mode;
  customerSearch.value = '';
  customerList.value = [];
  customerPage.value = 1;
  customerLastFetchedCount.value = 0;
  customerNoMoreData.value = false;
  customerPickerVisible.value = true;
  await loadCustomers(1);
};

const closeCustomerPicker = () => {
  customerPickerVisible.value = false;
};

const loadMoreCustomers = async (event) => {
  if (customerHasMore.value && !customerLoading.value) {
    await loadCustomers(customerPage.value + 1, true);
  }
  event.target.complete();
};

const selectCustomer = (customer) => {
  if (customerPickerMode.value === 'edit' && editingItem.value) {
    editingItem.value.customerId = customer;
    editingItem.value.customerName = customer.name;
    const customPrices = customer.customFields?.customPrices || [];
    const productId = editingItem.value.productId?.id;
    const customPrice = customPrices.find((cp) => cp.productId === productId || cp.product?.id === productId);
    if (customPrice?.price !== undefined) {
      editingItem.value.unitPrice = customPrice.price;
      recalculateEditingItem();
    }
    if (customer.customFields?.paymentMethod) {
      editingItem.value.paymentMethod = customer.customFields.paymentMethod;
    }
  } else {
    selectedCustomer.value = customer;
    if (customer.customFields?.paymentMethod) {
      newProductPaymentMethod.value = customer.customFields.paymentMethod;
    }
    if (selectedProduct.value) {
      const customPrices = customer.customFields?.customPrices || [];
      const customPrice = customPrices.find((cp) => cp.productId === selectedProduct.value.id || cp.product?.id === selectedProduct.value.id);
      if (customPrice?.price !== undefined) {
        newProductUnitPrice.value = customPrice.price;
      }
    }
  }
  closeCustomerPicker();
};

// ===== 付款方式選擇器 =====
const openPaymentPicker = (mode) => {
  paymentPickerMode.value = mode;
  paymentPickerVisible.value = true;
};

// ===== 搜尋防抖 =====
watch(productSearch, () => {
  loadProducts(1);
});

watch(customerSearch, () => {
  loadCustomers(1);
});

watch(driverSearch, () => {
  loadDrivers(1);
});

// 監聽出貨星期變更
watch(
  () => basicForm.value?.deliveryDays,
  (newDays, oldDays) => {
    if (JSON.stringify(newDays) !== JSON.stringify(oldDays)) {
      customerList.value = [];
      customerPage.value = 1;
      customerTotal.value = 0;
    }
  },
  { deep: true },
);

// 監聽選擇商品變更，重置客戶列表（因為要根據商品類別篩選客戶）
watch(selectedProduct, () => {
  customerList.value = [];
  customerPage.value = 1;
  customerTotal.value = 0;
});

// 監聽編輯中的數量變更，自動重新計算金額（nut-input-number 使用 v-model）
watch(
  () => editingItem.value?.quantity,
  (newQuantity) => {
    if (editingItem.value && newQuantity !== undefined) {
      recalculateEditingItem();
    }
  },
);

// Chip 顏色映射
const getChipColor = (category) => {
  const colorMap = {
    雞蛋: 'tertiary',
    桶裝水: 'primary',
    飲水機: 'secondary',
  };
  return colorMap[category] || 'medium';
};

// 星期切換
const toggleWeekDay = (day) => {
  if (!basicForm.value.deliveryDays) {
    basicForm.value.deliveryDays = [];
  }
  const index = basicForm.value.deliveryDays.indexOf(day);
  if (index > -1) {
    basicForm.value.deliveryDays.splice(index, 1);
  } else {
    basicForm.value.deliveryDays.push(day);
  }
};

// 商品資訊提示文字
const productInfoText = computed(() => {
  if (!selectedProduct.value) return '';
  let text = `${t('defaultPrice', '預設單價')}: NT$ ${formatNumber(selectedProduct.value.basePriceAmount)}`;
  if (customerCustomPrice.value !== null) {
    text += ` | ${t('customerPrice', '客戶價')}: NT$ ${formatNumber(customerCustomPrice.value)}`;
  }
  return text;
});

// ===== 編輯 Popup 操作 =====
const openEditPopup = (index) => {
  editingIndex.value = index;
  editingItem.value = { ...editedProducts.value[index] };
  editPopupVisible.value = true;
};

const closeEditPopup = () => {
  editPopupVisible.value = false;
  editingItem.value = null;
  editingIndex.value = -1;
};

const confirmEditPopup = () => {
  if (editingIndex.value >= 0 && editingItem.value) {
    editedProducts.value[editingIndex.value] = { ...editingItem.value };
  }
  closeEditPopup();
};

const recalculateEditingItem = () => {
  if (editingItem.value) {
    const quantity = Number(editingItem.value.quantity) || 0;
    const unitPrice = Number(editingItem.value.unitPrice) || 0;
    editingItem.value.amount = quantity * unitPrice;
    editingItem.value.actualAmount = editingItem.value.amount;
  }
};

const onEditQuantityChange = (value) => {
  if (editingItem.value) {
    editingItem.value.quantity = value;
    recalculateEditingItem();
  }
};

const onEditUnitPriceChange = (value) => {
  if (editingItem.value) {
    editingItem.value.unitPrice = Number(value) || 0;
    recalculateEditingItem();
  }
};

// 生命週期
onMounted(async () => {
  await getData();
});
</script>

<style scoped>
.mobile-form-page {
  //--ion-background-color: #f4f5f8;
}

.info-card {
  margin: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.product-list {
  margin: 0 12px 12px;
  border-radius: 8px;
  overflow: hidden;
}

.product-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.product-name {
  font-weight: 600;
  font-size: 15px;
}

.customer-name {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.amount-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.quantity-price {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.total-amount {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.empty-state {
  padding: 24px;
}

.empty-state ion-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.summary-card {
  margin: 12px;
}

.summary-value {
  font-weight: 600;
  font-size: 15px;
}

.text-primary {
  color: var(--ion-color-primary);
}

.bottom-spacer {
  height: 40px;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.bottom-actions {
  border-top: 1px solid var(--ion-color-light-shade);
}

.bottom-actions ion-toolbar {
  --background: var(--ion-color-light);
  padding: 8px 16px;
}

.bottom-summary {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.summary-total {
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-color-success);
}

.amount-text {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.required-label::after {
  content: ' *';
  color: var(--ion-color-danger);
}

.product-info-tip {
  margin: 12px;
}

.product-info-tip p {
  margin: 0;
  font-size: 13px;
}

.weekday-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
}

.weekday-chips ion-chip {
  margin: 0;
}

.stepper-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
}

/* Modal 樣式 */
ion-modal ion-content {
  --background: var(--ion-color-light);
}

ion-modal ion-list {
  background: transparent;
}

ion-modal ion-item {
  --background: white;
  margin-bottom: 1px;
}

ion-header ion-toolbar {
  --background: #ffffff;
  --border-color: #e5e5e5;
}

ion-header ion-title {
  font-weight: 600;
  font-size: 17px;
}

ion-toolbar {
  --background: inherit;
  //--opacity: 0;
  --border-style: none;
}
</style>
