<!-- 飲水送貨三聯單 — 紙張規格：9.5" x 5.5"（中一刀三聯單） -->
<template>
  <div class="" aria-hidden="true">
    <div ref="printContentRef">
      <template v-for="order in orders" :key="order.orderNumber">
        <div v-for="(pageRows, pIdx) in chunkProducts(order.products)" :key="pIdx" class="slip-page page-break">
          <div class="slip-inner">
            <div class="grid grid-cols-3 pb-2">
              <!--送貨提醒-->
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

              <!--標題-->
              <div class="flex-1 text-center">
                <p class="text-xl font-bold tracking-widest">{{ companyInfo.name }}</p>
                <p class="text-lg font-bold border-b border-black inline-block px-4">送 貨 單</p>
              </div>

              <!--公司聯絡資訊-->
              <div class="flex justify-end gap-4">
                <!--QRCode-->
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

            <div class="grid grid-cols-12 gap-x-3 text-[14px] py-4">
              <div class="col-span-8 space-y-2">
                <div class="flex">
                  客戶名稱：<span class="flex-1 border-b border-black">{{ order.targetName }}</span>
                </div>
                <div class="flex">
                  電　　話：<span class="flex-1 border-b border-black">{{ order.phone }}</span>
                </div>
                <div class="flex">
                  配送地址：<span class="flex-1 border-b border-black">{{ order.address }}</span>
                </div>
              </div>
              <div class="col-span-4 space-y-2">
                <div class="flex">
                  統一編號：<span class="flex-1 border-b border-black">{{ order.taxId }}</span>
                </div>
                <div class="flex">
                  出貨日期：<span class="flex-1 border-b border-black">{{ order.shipDate }}</span>
                </div>
                <div class="flex">
                  出貨單號：<span class="flex-1 border-b border-black">{{ order.orderNumber }}</span>
                </div>
              </div>
            </div>

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
                  <!-- 一般行：顯示完整商品資料 -->
                  <tr v-if="!row.isContinuation">
                    <td class="border border-black h-8! w-9 overflow-hidden truncate text-center">{{ row.seq }}</td>
                    <td class="border border-black h-8! max-w-83.5 overflow-hidden truncate px-2!">{{ row.nameLine }}</td>
                    <td class="border border-black h-8! w-13 overflow-hidden truncate text-center px-2!">{{ row.product.quantity }}</td>
                    <td class="border border-black h-8! w-11 overflow-hidden truncate text-center px-2!">{{ row.product.unit }}</td>
                    <td class="border border-black h-8! w-17.5 overflow-hidden truncate text-right px-2!">{{ formatNum(row.product.actualPrice) }}</td>
                    <td class="border border-black h-8! w-22.5 overflow-hidden truncate text-right px-2!">{{ formatNum(row.product.subtotal) }}</td>
                    <td class="border border-black h-8! w-64 max-w-64 overflow-hidden truncate px-2!">{{ row.noteLine }}</td>
                  </tr>
                  <!-- 延續行：No./數量/單位/單價/小計 空白，只顯示名稱/備註後續段落 -->
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

            <div class="flex justify-between items-start mt-2 text-[14px]">
              <div class="flex-1 space-y-1">
                <div class="flex gap-4">
                  <span>應收空桶：<span class="underline inline-block w-8 text-center"></span></span>
                  <span>實收空桶：<span class="underline inline-block w-8 text-center"></span> 桶</span>
                  <span>預收剩餘：<span class="underline inline-block w-8 text-center"></span></span>
                </div>
                <div class="flex">發票號碼：<span class="border-b border-black flex-1 mr-4"></span></div>
                <div class="flex">
                  備　　註：<span class="border-b border-black flex-1 mr-4">{{ order.note }}</span>
                </div>
              </div>

              <div class="w-45 space-y-0.5 border-l border-black pl-2">
                <div class="flex justify-between">
                  <span>合計金額：</span><span>{{ formatNum(order.orderAmount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>稅　　額：</span><span>{{ formatNum(order.tax) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>前期未收：</span><span>{{ formatNum(order.previousUnpaid) }}</span>
                </div>
                <div class="flex justify-between font-bold border-t border-black">
                  <span>總計金額：</span><span>{{ formatNum(order.totalAmount) }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QrCode from '@/assets/Line_QRCode.svg';

const props = defineProps({
  orders: { type: Array, default: () => [] },
  truncate: { type: Boolean, default: true }, // true=超出顯示...，false=換行到延續行（預設）
});

// 公司資訊物件
const companyInfo = {
  name: 'EggDrop CRM',
  tel: '04-23361770',
  telAlts: ['04-25607746', '04-25601499'],
  fax: '04-23367680',
  lineId: '069pfwrn',
};

// 各欄每行最大字數（可依實際列印效果調整）
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
 * 將商品列表展開為「顯示行」陣列：
 * - 主行：完整商品資料（productName 第一段、spec 第一段）
 * - 延續行：前 6 欄空白，只顯示 productName / spec 的後續段落
 * - 若兩欄都有溢出，同一延續行可同時顯示兩者對應段落
 * 再以 6 行為單位切成各頁
 */
const chunkProducts = (products) => {
  if (!products || products.length === 0) return [[]];

  const rows = [];
  products.forEach((p, idx) => {
    if (props.truncate) {
      // truncate 模式：每筆只產生一行，CSS overflow 截斷
      rows.push({ product: p, seq: idx + 1, nameLine: p.productName || '', noteLine: p.spec || '', isContinuation: false });
    } else {
      // 延續行模式：長內容拆成多行
      const nameLines = splitLines(p.productName || '', NAME_CHARS_PER_LINE);
      const noteLines = splitLines(p.spec || '', NOTE_CHARS_PER_LINE);
      const maxLines = Math.max(nameLines.length, noteLines.length);
      rows.push({ product: p, seq: idx + 1, nameLine: nameLines[0] || '', noteLine: noteLines[0] || '', isContinuation: false });
      for (let l = 1; l < maxLines; l++) {
        rows.push({ product: null, seq: null, nameLine: nameLines[l] || '', noteLine: noteLines[l] || '', isContinuation: true });
      }
    }
  });

  // 以 6 行切頁
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
/* 每張三聯單：9.5" x 5.5" (含孔) */
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
  border: 1px transparent solid; /* 僅作定位參考 */
}

@media print {
  @page {
    size: a5;
    margin: 0;
    padding: 4mm 4mm 4mm 8mm;
  }
  .page-break {
    page-break-after: always;
  }
  .print-area {
    width: 241mm;
  }
}
</style>
