<!-- src/pages/Shipments/components/DeliveryReportSlip.vue
     送貨日報表三聯單 — 以「客戶」為單位分張列印，格式同飲水送貨三聯單
     紙張規格：9.5" x 5.5"（中一刀三聯單，241mm × 140mm）
-->
<template>
  <div aria-hidden="true">
    <div ref="printContentRef">
      <!-- 每張報表 → 依客戶分組 → 每組客戶一或多張單 -->
      <template v-for="report in orders" :key="report.reportNumber">
        <template v-for="customerSlip in buildCustomerSlips(report)" :key="customerSlip.customerId">
          <div
            v-for="(pageRows, pIdx) in chunkProducts(customerSlip.products)"
            :key="`${customerSlip.customerId}-p${pIdx}`"
            class="slip-page page-break"
          >
            <div class="slip-inner">
              <!-- 頁首 -->
              <div class="grid grid-cols-3 pb-2">
                <!-- 送貨提醒 -->
                <div class="text-[18px] leading-tight gap-1 flex flex-col">
                  <div class="flex gap-1 items-center">
                    <div class="border border-black px-0.5 mr-1 size-5"></div>
                    <p>去前電聯</p>
                  </div>
                  <div class="flex gap-1 items-center">
                    <div class="border border-black px-0.5 mr-1 size-5"></div>
                    <p>可下門口</p>
                  </div>
                </div>

                <!-- 標題 -->
                <div class="flex-1 text-center">
                  <p class="text-xl font-bold tracking-widest">{{ companyInfo.name }}</p>
                  <p class="text-lg font-bold border-b border-black inline-block px-4">送 貨 單</p>
                </div>

                <!-- 公司聯絡資訊 -->
                <div class="flex justify-end gap-4">
                  <div class="flex flex-col items-center">
                    <img :src="QrCode" alt="QR" class="size-16" />
                  </div>
                  <div class="text-[16px] leading-none text-right flex flex-col items-start gap-1">
                    <div>TEL: {{ companyInfo.tel }}</div>
                    <div>FAX: {{ companyInfo.fax }}</div>
                    <div>訂水加LINE</div>
                  </div>
                </div>
              </div>

              <!-- 客戶資訊 -->
              <div class="grid grid-cols-12 gap-x-3 text-[14px] py-4">
                <div class="col-span-8 space-y-2">
                  <div class="flex">
                    客戶名稱：<span class="flex-1 border-b border-black">{{ customerSlip.name }}</span>
                  </div>
                  <div class="flex">
                    電　　話：<span class="flex-1 border-b border-black">{{ customerSlip.phone }}</span>
                  </div>
                  <div class="flex">
                    配送地址：<span class="flex-1 border-b border-black">{{ customerSlip.address }}</span>
                  </div>
                </div>
                <div class="col-span-4 space-y-2">
                  <div class="flex">
                    統一編號：<span class="flex-1 border-b border-black">{{ customerSlip.taxId }}</span>
                  </div>
                  <div class="flex">
                    出貨日期：<span class="flex-1 border-b border-black">{{ report.reportDate }}</span>
                  </div>
                  <div class="flex">
                    出貨單號：<span class="flex-1 border-b border-black">{{ report.reportNumber }}</span>
                  </div>
                </div>
              </div>

              <!-- 商品明細表 -->
              <table class="w-full mt-2 border-collapse border border-black text-[15px]">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="border border-black h-8">No.</th>
                    <th class="border border-black h-8">產 品 名 稱</th>
                    <th class="border border-black h-8">數量</th>
                    <th class="border border-black h-8">單位</th>
                    <th class="border border-black h-8">單價</th>
                    <th class="border border-black h-8">小計金額</th>
                    <th class="border border-black h-8">備 註</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(row, i) in pageRows" :key="i">
                    <tr v-if="!row.isContinuation">
                      <td class="border border-black h-8! w-9 overflow-hidden truncate text-center">{{ row.seq }}</td>
                      <td class="border border-black h-8! max-w-83.5 overflow-hidden truncate px-2!">{{ row.nameLine }}</td>
                      <td class="border border-black h-8! w-13 overflow-hidden truncate text-center px-2!">{{ row.product.quantity }}</td>
                      <td class="border border-black h-8! w-11 overflow-hidden truncate text-center px-2!">{{ row.product.unit }}</td>
                      <td class="border border-black h-8! w-17.5 overflow-hidden truncate text-right px-2!">{{ formatNum(row.product.unitPrice) }}</td>
                      <td class="border border-black h-8! w-22.5 overflow-hidden truncate text-right px-2!">{{ formatNum(row.product.amount) }}</td>
                      <td class="border border-black h-8! w-64 max-w-64 overflow-hidden truncate px-2!">{{ row.noteLine }}</td>
                    </tr>
                    <tr v-else>
                      <td class="border border-black h-8!"></td>
                      <td class="border border-black h-8! overflow-hidden truncate px-2!">{{ row.nameLine }}</td>
                      <td class="border border-black h-8!"></td>
                      <td class="border border-black h-8!"></td>
                      <td class="border border-black h-8!"></td>
                      <td class="border border-black h-8!"></td>
                      <td class="border border-black h-8! overflow-hidden truncate px-2!">{{ row.noteLine }}</td>
                    </tr>
                  </template>
                  <!-- 補齊空白行至 6 行 -->
                  <tr v-for="n in Math.max(0, 6 - pageRows.length)" :key="'empty-' + n" class="h-8">
                    <td class="border border-black" v-for="m in 7" :key="m"></td>
                  </tr>
                </tbody>
              </table>

              <!-- 頁尾 -->
              <div class="flex justify-between items-start mt-2 text-[14px]">
                <div class="flex-1 space-y-1">
                  <div class="flex gap-4">
                    <span>應收空桶：<span class="underline inline-block w-8 text-center"></span></span>
                    <span>實收空桶：<span class="underline inline-block w-8 text-center"></span> 桶</span>
                    <span>預收剩餘：<span class="underline inline-block w-8 text-center"></span></span>
                  </div>
                  <div class="flex">發票號碼：<span class="border-b border-black flex-1 mr-4"></span></div>
                  <div class="flex">
                    備　　註：<span class="border-b border-black flex-1 mr-4">{{ report.note }}</span>
                  </div>
                </div>

                <div class="w-45 space-y-0.5 border-l border-black pl-2">
                  <div class="flex justify-between">
                    <span>合計金額：</span><span>{{ formatNum(customerSlip.totalAmount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>稅　　額：</span><span></span>
                  </div>
                  <div class="flex justify-between">
                    <span>前期未收：</span><span></span>
                  </div>
                  <div class="flex justify-between font-bold border-t border-black">
                    <span>總計金額：</span><span>{{ formatNum(customerSlip.totalAmount) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center mt-4 text-[15px]">
                <div class="flex-1 flex items-center h-5.5">實收金額 <span class="flex-1 border-b border-black mx-2 h-5.5"></span></div>
                <div class="flex-1 flex items-center h-5.5">客戶簽章 <span class="flex-1 border-b border-black mx-2 h-5.5"></span></div>
              </div>

              <div class="absolute -right-6.25 top-1/2 -translate-y-1/2 flex flex-col items-center text-[10px] w-4 leading-none">
                <span class="tracking-widest">第一聯：簽收聯</span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QrCode from '@/assets/Line_QRCode.svg';

const props = defineProps({
  orders: { type: Array, default: () => [] },
  truncate: { type: Boolean, default: false },
});

const companyInfo = {
  name: 'EggDrop CRM',
  tel: '04-23361770',
  fax: '04-23367680',
};

const NOTE_CHARS_PER_LINE = 17;
const NAME_CHARS_PER_LINE = 22;

const splitLines = (text, charsPerLine) => {
  if (!text || text.length === 0) return [''];
  const lines = [];
  for (let i = 0; i < text.length; i += charsPerLine) {
    lines.push(text.slice(i, i + charsPerLine));
  }
  return lines;
};

/**
 * 將一筆 delivery report 的 items 依客戶分組，
 * 回傳 [{ customerId, name, phone, address, taxId, products[], totalAmount }]
 */
const buildCustomerSlips = (report) => {
  const items = report.items || [];
  const map = new Map();

  items.forEach((item) => {
    const c = item.customer || {};
    const id = c.id || 'unknown';
    if (!map.has(id)) {
      const phone =
        c.contactInfo?.phone || c.contactInfo?.mobile || c.phone || '';
      map.set(id, {
        customerId: id,
        name: c.name || '',
        phone,
        address: c.fullAddress || '',
        taxId: c.taxId || '',
        products: [],
        totalAmount: 0,
      });
    }
    const slip = map.get(id);
    slip.products.push(item);
    slip.totalAmount += item.amount || 0;
  });

  return Array.from(map.values());
};

/**
 * 將商品列表展開為顯示行，以 6 行切頁（同 WaterTriplicateSlip）
 */
const chunkProducts = (items) => {
  if (!items || items.length === 0) return [[]];

  const rows = [];
  items.forEach((item, idx) => {
    const productName = item.product?.name || '';
    const noteText = item.note || '';

    if (props.truncate) {
      rows.push({ product: item, seq: idx + 1, nameLine: productName, noteLine: noteText, isContinuation: false });
    } else {
      const nameLines = splitLines(productName, NAME_CHARS_PER_LINE);
      const noteLines = splitLines(noteText, NOTE_CHARS_PER_LINE);
      const maxLines = Math.max(nameLines.length, noteLines.length);
      rows.push({ product: item, seq: idx + 1, nameLine: nameLines[0] || '', noteLine: noteLines[0] || '', isContinuation: false });
      for (let l = 1; l < maxLines; l++) {
        rows.push({ product: null, seq: null, nameLine: nameLines[l] || '', noteLine: noteLines[l] || '', isContinuation: true });
      }
    }
  });

  const pages = [];
  for (let i = 0; i < rows.length; i += 6) {
    pages.push(rows.slice(i, i + 6));
  }
  return pages;
};

const formatNum = (v) => {
  if (!v && v !== 0) return '';
  return Number(v).toLocaleString('zh-TW');
};

const printContentRef = ref(null);
defineExpose({ printContentRef });
</script>

<style scoped>
.slip-page {
  width: 241mm;
  height: 140mm;
  padding: 0 0 0 8mm;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background-color: white;
}

.slip-inner {
  height: 100%;
  border: 1px transparent solid;
}

@media print {
  @page {
    size: 241mm 140mm;
    margin: 0;
  }
  .page-break {
    page-break-after: always;
  }
}
</style>

