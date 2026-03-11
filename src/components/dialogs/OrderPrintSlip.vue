<!-- 訂單列印單元件 — 使用 vue-to-print，每筆訂單一頁 -->
<template>
  <div class="hidden" aria-hidden="true">
    <div ref="printContentRef">
      <div v-for="order in orders" :key="order.id" class="slip-page page-break">
        <!-- ── 商品明細表格 ── -->
        <table class="product-table">
          <thead>
            <!-- ── 表頭 ── -->
            <tr>
              <th class="col-no border-b-2! border-x-0! border-t-0! bg-white!" colspan="7">
                <div class="slip-header">
                  <div class="company-block">
                    <div class="company-name">{{ companyName }}</div>
                    <div class="company-sub">{{ companyInfo }}</div>
                  </div>
                  <div class="slip-title">訂單出貨單</div>
                </div>
              </th>
            </tr>

            <!-- ── 訂單基本資訊 ── -->
            <tr>
              <th class="col-no border-0! bg-white! pt-4!" colspan="7">
                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label">訂單編號</span>
                    <span class="info-value bold">{{ order.orderNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">訂單日期</span>
                    <span class="info-value">{{ order.orderDate }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">客戶</span>
                    <span class="info-value">{{ order.targetName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">出貨日期</span>
                    <span class="info-value">{{ order.shipDate }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">聯絡人</span>
                    <span class="info-value">{{ order.contact || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">電話</span>
                    <span class="info-value">{{ order.phone || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">付款方式</span>
                    <span class="info-value">{{ formatPaymentMethod(order.paymentMethod) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">出貨狀態</span>
                    <span class="info-value">{{ formatOrderStatus(order.status) }}</span>
                  </div>
                  <!--<div class="info-row">
                    <span class="info-label">出貨方式</span>
                    <span class="info-value">{{ formatShipMethod(order.shipMethod) }}</span>
                  </div>-->
                  <!--<div class="info-row">
                    <span class="info-label">送貨人員</span>
                    <span class="info-value">{{ order.employeeName }}</span>
                  </div>-->
                  <!--<div v-if="order.address" class="info-row full-width">
                    <span class="info-label">地址</span>
                    <span class="info-value">{{ order.address }}</span>
                  </div>-->
                  <div class="info-row full-width">
                    <span class="info-label">備註</span>
                    <span class="info-value">{{ order.note }}</span>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th class="col-no">序</th>
              <th class="col-name">商品名稱</th>
              <th class="col-spec">規格</th>
              <th class="col-qty">數量</th>
              <th class="col-unit">單位</th>
              <th class="col-price">實際售價</th>
              <th class="col-sub">小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, idx) in order.products" :key="idx">
              <td class="col-no text-center">{{ idx + 1 }}</td>
              <td class="col-name">{{ product.productName }}</td>
              <td class="col-spec text-gray-500">{{ product.spec || '—' }}</td>
              <td class="col-qty text-center">{{ product.quantity }}</td>
              <td class="col-unit text-center">{{ product.unit }}</td>
              <td class="col-price text-right">{{ formatCurrencyNumber(product.actualPrice) }}</td>
              <td class="col-sub text-right">{{ formatCurrencyNumber(product.subtotal) }}</td>
            </tr>
            <tr v-for="n in Math.max(0, 1 - (order.products?.length ?? 0))" :key="`empty-${n}`" class="empty-row">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <!-- ── 金額合計 ── -->
        <div class="amount-block">
          <div class="amount-row">
            <span>商品總金額</span>
            <span>{{ formatCurrencyNumber(order.orderAmount ?? order.totalAmount) }}</span>
          </div>
          <div v-if="order.discount" class="amount-row">
            <span>折扣</span>
            <span class="deduct">- {{ formatCurrencyNumber(order.discount) }}</span>
          </div>
          <div v-if="order.shippingFee" class="amount-row">
            <span>運費</span>
            <span>{{ formatCurrencyNumber(order.shippingFee) }}</span>
          </div>
          <div class="amount-row total-row">
            <span>總金額</span>
            <span class="total-value">{{ formatCurrencyNumber(order.totalAmount) }}</span>
          </div>
        </div>

        <!-- ── 簽名欄 ── -->
        <div class="sign-block">
          <div class="sign-col">
            <div class="sign-label">送貨人員</div>
            <div class="sign-line"></div>
          </div>
          <div class="sign-col">
            <div class="sign-label">會計人員</div>
            <div class="sign-line"></div>
          </div>
          <div class="sign-col">
            <div class="sign-label">客戶簽收</div>
            <div class="sign-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCurrencyStore } from '@/stores/currency';

defineProps({
  orders: { type: Array, default: () => [] },
  companyName: { type: String, default: 'EggDrop CRM' },
  companyInfo: { type: String, default: '' },
});

const printContentRef = ref(null); //提供給父層 useVueToPrint content 使用

const currencyStore = useCurrencyStore();
const { formatCurrencyNumber } = currencyStore;

const paymentMethodMap = { CASH: '現金', MONTHLY: '月結', PREPAID: '預付' };
const shipMethodMap = { PICKUP: '自取', DRIVER_DELIVERY: '司機送貨', COURIER: '宅配' };

// 後端傳中文狀態 → 前端顯示文字（處理中 必須 map 為 已出貨-未收款）
const orderStatusDisplayMap = {
  待出貨: '待出貨',
  處理中: '已出貨-未收款',
  已完成: '已完成',
  取消: '取消',
};

const formatPaymentMethod = (v) => paymentMethodMap[v] || v || '—';
const formatShipMethod = (v) => shipMethodMap[v] || v || '—';
const formatOrderStatus = (v) => orderStatusDisplayMap[v] || v || '—';

defineExpose({ printContentRef }); //暴露給父層取得 DOM ref
</script>

<!--<template>
  &lt;!&ndash; position:fixed + visibility:hidden：不影響頁面 layout 但保有真實尺寸，可供 JS 量測 &ndash;&gt;
  <div class="print-slip-wrapper" aria-hidden="true">
    <div ref="printContentRef">
      <div v-for="(order, orderIndex) in orders" :key="order.id" :ref="(el) => setPageRef(el, orderIndex)" class="slip-page page-break">
        &lt;!&ndash; ── 商品明細表格 ── &ndash;&gt;
        <table class="product-table">
          <thead>
            &lt;!&ndash; ── 表頭 ── &ndash;&gt;
            <tr>
              <th class="col-no border-b-2! border-x-0! border-t-0! bg-white!" colspan="7">
                <div class="slip-header">
                  <div class="company-block">
                    <div class="company-name">{{ companyName }}</div>
                    <div class="company-sub">{{ companyInfo }}</div>
                  </div>
                  <div class="slip-title">訂單出貨單</div>
                </div>
              </th>
            </tr>

            &lt;!&ndash; ── 訂單基本資訊 ── &ndash;&gt;
            <tr>
              <th class="col-no border-0! bg-white! pt-4!" colspan="7">
                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label">訂單編號</span>
                    <span class="info-value bold">{{ order.orderNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">訂單日期</span>
                    <span class="info-value">{{ order.orderDate }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">客戶</span>
                    <span class="info-value">{{ order.targetName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">出貨日期</span>
                    <span class="info-value">{{ order.shipDate }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">聯絡人</span>
                    <span class="info-value">{{ order.contact || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">電話</span>
                    <span class="info-value">{{ order.phone || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">付款方式</span>
                    <span class="info-value">{{ formatPaymentMethod(order.paymentMethod) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">出貨方式</span>
                    <span class="info-value">{{ formatShipMethod(order.shipMethod) }}</span>
                  </div>
                  <div v-if="order.employeeName" class="info-row">
                    <span class="info-label">員工</span>
                    <span class="info-value">{{ order.employeeName }}</span>
                  </div>
                  <div v-if="order.address" class="info-row full-width">
                    <span class="info-label">地址</span>
                    <span class="info-value">{{ order.address }}</span>
                  </div>
                  <div v-if="order.note" class="info-row full-width">
                    <span class="info-label">備註</span>
                    <span class="info-value">{{ order.note }}</span>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th class="col-no">序</th>
              <th class="col-name">商品名稱</th>
              <th class="col-spec">規格</th>
              <th class="col-qty">數量</th>
              <th class="col-unit">單位</th>
              <th class="col-price">實際售價</th>
              <th class="col-sub">小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, idx) in order.products" :key="idx">
              <td class="col-no text-center">{{ idx + 1 }}</td>
              <td class="col-name">{{ product.productName }}</td>
              <td class="col-spec text-gray-500">{{ product.spec || '—' }}</td>
              <td class="col-qty text-center">{{ product.quantity }}</td>
              <td class="col-unit text-center">{{ product.unit }}</td>
              <td class="col-price text-right">{{ formatCurrencyNumber(product.actualPrice) }}</td>
              <td class="col-sub text-right">{{ formatCurrencyNumber(product.subtotal) }}</td>
            </tr>
            <tr v-for="n in emptyRowCounts[orderIndex] ?? 3" :key="`empty-${n}`" class="empty-row">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        &lt;!&ndash; ── 金額合計 ── &ndash;&gt;
        <div class="amount-block">
          <div class="amount-row">
            <span>商品總金額</span>
            <span>{{ formatCurrencyNumber(order.orderAmount ?? order.totalAmount) }}</span>
          </div>
          <div v-if="order.discount" class="amount-row">
            <span>折扣</span>
            <span class="deduct">- {{ formatCurrencyNumber(order.discount) }}</span>
          </div>
          <div v-if="order.shippingFee" class="amount-row">
            <span>運費</span>
            <span>{{ formatCurrencyNumber(order.shippingFee) }}</span>
          </div>
          <div class="amount-row total-row">
            <span>總金額</span>
            <span class="total-value">{{ formatCurrencyNumber(order.totalAmount) }}</span>
          </div>
        </div>

        &lt;!&ndash; ── 簽名欄 ── &ndash;&gt;
        <div class="sign-block">
          <div class="sign-col">
            <div class="sign-label">送貨人員</div>
            <div class="sign-line"></div>
          </div>
          <div class="sign-col">
            <div class="sign-label">會計人員</div>
            <div class="sign-line"></div>
          </div>
          <div class="sign-col">
            <div class="sign-label">客戶簽收</div>
            <div class="sign-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useCurrencyStore } from '@/stores/currency';

const props = defineProps({
  orders: { type: Array, default: () => [] },
  companyName: { type: String, default: 'EggDrop CRM' },
  companyInfo: { type: String, default: '' },
});

const printContentRef = ref(null);
const slipPageRefs = ref([]); //各訂單頁面 DOM ref，用於量測剩餘空間
const emptyRowCounts = ref([]); //各訂單動態計算的空白行數

const ROW_HEIGHT = 22; //empty-row 的固定高度（px），需與 CSS 一致

const setPageRef = (el, i) => {
  if (el) slipPageRefs.value[i] = el;
};

const calculateEmptyRows = () => {
  const counts = [];
  for (let i = 0; i < props.orders.length; i++) {
    const page = slipPageRefs.value[i];
    if (!page) {
      counts.push(3);
      continue;
    }

    const amountBlock = page.querySelector('.amount-block');
    const signBlock = page.querySelector('.sign-block');
    if (!amountBlock || !signBlock) {
      counts.push(3);
      continue;
    }

    //量測金額區底部到簽名欄頂部的剩餘空間
    const gap = signBlock.getBoundingClientRect().top - amountBlock.getBoundingClientRect().bottom;
    counts.push(Math.max(0, Math.floor(gap / ROW_HEIGHT)));
  }
  emptyRowCounts.value = counts;
};

/**
 * 父層在呼叫 handlePrint() 之前先呼叫此方法
 * 流程：重設空白行 → 量測剩餘空間 → 填入正確空白行數 → 等待 DOM 更新完成
 */
const prepare = async () => {
  slipPageRefs.value = []; //清除舊 refs
  emptyRowCounts.value = new Array(props.orders.length).fill(0); //先歸零讓 DOM 還原
  await nextTick(); //等待 DOM 以 0 空白行渲染完成
  calculateEmptyRows(); //量測並設定正確行數
  await nextTick(); //等待 DOM 以正確空白行渲染完成
};

const currencyStore = useCurrencyStore();
const { formatCurrencyNumber } = currencyStore;

const paymentMethodMap = { CASH: '現金', MONTHLY: '月結', PREPAID: '預付' };
const shipMethodMap = { PICKUP: '自取', DRIVER_DELIVERY: '司機送貨', COURIER: '宅配' };

const formatPaymentMethod = (v) => paymentMethodMap[v] || v || '—';
const formatShipMethod = (v) => shipMethodMap[v] || v || '—';

defineExpose({ printContentRef, prepare }); //暴露給父層使用
</script>-->

<style scoped>
/* wrapper：固定在可視區外，保有真實 layout 供 JS 量測，不影響頁面排版 */
.print-slip-wrapper {
  position: fixed;
  left: -9999px;
  top: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
}

.slip-page {
  width: 210mm;
  height: 305mm;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: '微軟正黑體', 'Microsoft JhengHei', Arial, sans-serif;
  font-size: 12px;
  color: #111;
}

/* 表頭 */
.slip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4px;
}
.company-name {
  font-size: 22px;
  font-weight: 700;
}
.company-sub {
  font-size: 10px;
  color: #555;
  margin-top: 2px;
}
.slip-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* 基本資訊 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin-bottom: 8px;
}
.info-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
}
.info-row.full-width {
  grid-column: 1 / -1;
}
.info-label {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  min-width: 64px;
  text-align: left;
}
.info-value {
  font-size: 15px;
}
.info-value.bold {
  font-weight: 700;
}

/* 商品表格 */
.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}
.product-table th {
  background: #f0f0f0;
  border: 1px solid #bbb;
  padding: 4px 6px;
  font-size: 16px;
  text-align: center;
}
.product-table td {
  border: 1px solid #ccc;
  padding: 4px 6px;
  font-size: 16px;
  vertical-align: middle;
}
.product-table .empty-row td {
  height: 22px;
}
.col-no {
  width: 28px;
}
.col-name {
  min-width: 120px;
} /* 名稱 */
.col-spec {
  width: 160px;
} /* 規格 */
.col-qty {
  width: 90px;
} /* 數量 */
.col-unit {
  width: 80px;
} /* 單位 */
.col-price {
  width: 120px;
} /* 實際售價 */
.col-sub {
  width: 120px;
} /* 小計 */

/* 金額區 */
.amount-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  margin-bottom: 12px;
  padding-top: 6px;
}
.amount-row {
  display: flex;
  gap: 24px;
  font-size: 16px;
}
.amount-row span:first-child {
  color: #555;
  min-width: 80px;
  text-align: right;
}
.amount-row span:last-child {
  min-width: 80px;
  text-align: right;
}
.deduct {
  color: #c00;
}
.total-row {
  font-weight: 700;
  font-size: 18px;
  padding-top: 4px;
}
.total-value {
  color: #c00;
}

/* 簽名欄 */
.sign-block {
  display: flex;
  gap: 16px;
  margin-top: auto;
  padding-top: 60px;
}
.sign-col {
  flex: 1;
}
.sign-label {
  font-size: 18px;
  color: #555;
  margin-bottom: 20px;
}
.sign-line {
  border-bottom: 1px solid #999;
}

@media print {
  @page {
    size: A4;
    padding: 10mm;
  }

  .page-break {
    break-before: page; /* 在此元素前換頁 */
  }

  .no-break {
    break-inside: avoid; /* 避免此元素內部被斷開（例如表格或圖片） */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto; /* 允許表格內部換頁 */
  }

  tr {
    page-break-inside: avoid; /* 避免一列數據被切斷 */
    page-break-after: auto;
  }

  thead {
    display: table-header-group; /* 關鍵：確保每一頁都顯示表頭 */
  }

  tfoot {
    display: table-footer-group; /* 關鍵：確保每一頁都顯示表尾 */
  }
}
</style>
