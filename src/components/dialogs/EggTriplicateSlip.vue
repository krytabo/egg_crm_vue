<!-- 雞蛋出貨三聯單 — 紙張規格：9.5" x 5.5"（中一刀三聯單） -->
<!-- TODO: 欄位名稱待確認後調整 -->
<template>
  <div class="triplicate-wrapper" aria-hidden="true">
    <div ref="printContentRef">
      <div v-for="order in orders" :key="order.id" class="slip-page page-break">
        <!-- 右側聯名標籤 -->
        <div class="copy-label">第一聯：簽收聯</div>

        <div class="slip-inner">
          <!-- ── 表頭 ── -->
          <div class="header">
            <div class="header-left">
              <div class="checkbox-row"><span class="checkbox">□</span>&nbsp;去前電聯</div>
              <div class="checkbox-row"><span class="checkbox">□</span>&nbsp;可下門口</div>
            </div>
            <div class="header-center">
              <div class="company-name">{{ companyName }}</div>
              <div class="slip-title">出 貨 單</div>
            </div>
            <div class="header-right">
              <div v-for="line in contactLines" :key="line">{{ line }}</div>
            </div>
          </div>

          <!-- ── 客戶資訊 ── -->
          <div class="customer-section">
            <div class="customer-left">
              <div class="cust-row">
                <span class="cust-label">客戶名稱：</span><span class="cust-value">{{ order.targetName }}</span>
              </div>
              <div class="cust-row">
                <span class="cust-label">電　　話：</span><span class="cust-value">{{ order.phone || '' }}</span>
              </div>
              <div class="cust-row">
                <span class="cust-label">配送地址：</span><span class="cust-value">{{ order.address || '' }}</span>
              </div>
            </div>
            <div class="customer-right">
              <div class="cust-row"><span class="cust-label">統一編號：</span><span class="cust-value"></span></div>
              <div class="cust-row">
                <span class="cust-label">出貨日期：</span><span class="cust-value">{{ order.shipDate || order.orderDate }}</span>
              </div>
              <div class="cust-row">
                <span class="cust-label">出貨單號：</span><span class="cust-value">{{ order.orderNumber }}</span>
              </div>
            </div>
          </div>

          <!-- ── 商品表格 ── -->
          <table class="product-table">
            <thead>
              <tr>
                <th class="col-no">No.</th>
                <th class="col-name">產 品 名 稱</th>
                <th class="col-qty">數量</th>
                <th class="col-unit">單位</th>
                <th class="col-price">單價</th>
                <th class="col-sub">小計金額</th>
                <th class="col-note">備 註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, idx) in order.products" :key="idx">
                <td class="col-no ta-c">{{ idx + 1 }}</td>
                <td class="col-name">{{ product.productName }}</td>
                <td class="col-qty ta-c">{{ product.quantity }}</td>
                <td class="col-unit ta-c">{{ product.unit }}</td>
                <td class="col-price ta-r">{{ formatNum(product.actualPrice) }}</td>
                <td class="col-sub ta-r">{{ formatNum(product.subtotal) }}</td>
                <td class="col-note"></td>
              </tr>
              <tr v-for="n in Math.max(0, 7 - (order.products?.length ?? 0))" :key="`e-${n}`" class="empty-row">
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

          <!-- ── 底部區域 ── -->
          <div class="footer-section">
            <div class="footer-left">
              <div class="footer-row"><span class="f-label">發票號碼：</span><span class="write-line medium"></span></div>
              <div class="footer-row">
                <span class="f-label">付款方式：</span><span class="note-text">{{ formatPayment(order.paymentMethod) }}</span>
              </div>
              <div class="footer-row">
                <span class="f-label">備　　註：</span><span class="note-text">{{ order.note || '' }}</span>
              </div>
            </div>
            <div class="footer-right">
              <div class="amount-row">
                <span class="a-label">商品小計：</span><span class="a-value">{{ formatNum(order.orderAmount ?? order.totalAmount) }}</span>
              </div>
              <div class="amount-row">
                <span class="a-label">折　　扣：</span><span class="a-value">{{ order.discount ? formatNum(order.discount) : '' }}</span>
              </div>
              <div class="amount-row"><span class="a-label">前期未收：</span><span class="a-value"></span></div>
              <div class="amount-row total-row">
                <span class="a-label">總計金額：</span><span class="a-value">{{ formatNum(order.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- ── 簽收欄 ── -->
          <div class="sign-section"><span>實收金額</span><span class="sign-line"></span> <span class="sign-gap">客戶簽章</span><span class="sign-line"></span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCurrencyStore } from '@/stores/currency';

const props = defineProps({
  orders: { type: Array, default: () => [] },
  companyName: { type: String, default: 'EggDrop CRM' },
  companyContact: { type: String, default: '' },
});

const printContentRef = ref(null);
defineExpose({ printContentRef });

const { formatCurrencyNumber } = useCurrencyStore();
const formatNum = (v) => {
  if (v === null || v === undefined || v === '') return '';
  return Number(v).toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const paymentMap = { CASH: '現金', MONTHLY: '月結', PREPAID: '預付' };
const formatPayment = (v) => paymentMap[v] || v || '';

const contactLines = computed(() => {
  if (!props.companyContact) return [];
  return props.companyContact.split('\n').filter(Boolean);
});
</script>

<style scoped>
.triplicate-wrapper {
  position: fixed;
  left: -9999px;
  top: 0;
  //visibility: hidden;
  pointer-events: none;
  z-index: -1;
}
.slip-page {
  width: 241mm;
  height: 140mm;
  box-sizing: border-box;
  position: relative;
  font-family: '微軟正黑體', 'Microsoft JhengHei', Arial, sans-serif;
  font-size: 10px;
  color: #111;
  overflow: hidden;
}
.slip-inner {
  margin: 0 14mm 0 8mm;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 3mm 0 2mm;
}
.copy-label {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 12mm;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  border-left: 1px solid #aaa;
}
.header {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 3px;
}
.header-left {
  flex: 0 0 auto;
  font-size: 9px;
  line-height: 1.6;
  padding-top: 2px;
}
.checkbox-row {
  white-space: nowrap;
}
.checkbox {
  font-size: 11px;
}
.header-center {
  flex: 1;
  text-align: center;
}
.company-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}
.slip-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
}
.header-right {
  flex: 0 0 auto;
  font-size: 9px;
  text-align: right;
  line-height: 1.5;
}

.customer-section {
  display: flex;
  gap: 8px;
  margin-bottom: 3px;
  border-top: 1px solid #666;
  padding-top: 2px;
}
.customer-left {
  flex: 1;
}
.customer-right {
  flex: 0 0 auto;
  width: 130px;
}
.cust-row {
  display: flex;
  align-items: baseline;
  font-size: 10px;
  line-height: 1.6;
}
.cust-label {
  white-space: nowrap;
  color: #333;
  min-width: 56px;
}
.cust-value {
  border-bottom: 1px solid #999;
  flex: 1;
  min-height: 1em;
  font-size: 10px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  flex: 1;
}
.product-table th {
  background: #e8e8e8;
  border: 1px solid #666;
  padding: 1px 3px;
  font-size: 10px;
  text-align: center;
  font-weight: 600;
}
.product-table td {
  border: 1px solid #888;
  padding: 1px 3px;
  font-size: 10px;
  vertical-align: middle;
}
.empty-row td {
  height: 11px;
}
.col-no {
  width: 22px;
}
.col-name {
  min-width: 0;
}
.col-qty {
  width: 36px;
}
.col-unit {
  width: 28px;
}
.col-price {
  width: 52px;
}
.col-sub {
  width: 52px;
}
.col-note {
  width: 50px;
}
.ta-c {
  text-align: center;
}
.ta-r {
  text-align: right;
}

.footer-section {
  display: flex;
  gap: 8px;
  border-top: 1px solid #666;
  padding-top: 2px;
  margin-top: 1px;
}
.footer-left {
  flex: 1;
  font-size: 9.5px;
}
.footer-right {
  flex: 0 0 auto;
  width: 110px;
  font-size: 9.5px;
}
.footer-row {
  display: flex;
  align-items: baseline;
  line-height: 1.7;
}
.f-label {
  white-space: nowrap;
  min-width: 54px;
}
.write-line {
  display: inline-block;
  border-bottom: 1px solid #999;
  vertical-align: bottom;
}
.write-line.medium {
  width: 80px;
}
.note-text {
  font-size: 9px;
}
.amount-row {
  display: flex;
  justify-content: space-between;
  line-height: 1.6;
}
.a-label {
  color: #333;
}
.a-value {
  text-align: right;
  min-width: 50px;
  border-bottom: 1px solid #bbb;
}
.total-row {
  font-weight: 700;
  border-top: 1px solid #555;
  margin-top: 1px;
  padding-top: 1px;
}

.sign-section {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  font-size: 10px;
  padding-top: 2px;
  border-top: 1px solid #666;
  margin-top: 2px;
}
.sign-line {
  display: inline-block;
  flex: 1;
  border-bottom: 1px solid #555;
  height: 1em;
}
.sign-gap {
  margin-left: 12px;
}

@media print {
  @page {
    size: 241mm 140mm;
    margin: 0;
  }
  body {
    margin: 0;
  }
  .page-break {
    break-before: page;
  }
  .page-break:first-child {
    break-before: auto;
  }
}
</style>
