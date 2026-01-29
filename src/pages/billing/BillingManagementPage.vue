<!-- src/pages/billing/BillingManagementPage.vue 帳務管理 -->
<template>
  <Card>
    <!-- Tab 頁籤 -->
    <a-tabs class="flex-1" :active-key="activeKey" @tab-click="toggleActiveKey">
      <a-tab-pane :key="TAB_KEYS.INVOICES" :title="t('invoices', '發票管理')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.PAYMENTS" :title="t('payments', '付款記錄')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.CREDIT_MEMOS" :title="t('creditMemos', '折讓單')"></a-tab-pane>
      <a-tab-pane :key="TAB_KEYS.REPORTS" :title="t('billingReports', '帳務報表')"></a-tab-pane>

      <template #extra>
        <div class="flex items-center gap-3">
          <!-- 發票管理 Tab 操作按鈕 -->
          <template v-if="activeKey === TAB_KEYS.INVOICES">
            <a-button status="danger" plain @click="invoicesTabRef?.clearFilter()">{{ t("clearAllSearch", "清除篩選") }}</a-button>
            <a-button type="primary" @click="invoicesTabRef?.openCreateDialog()">{{ t("createInvoice", "新增發票") }}</a-button>
          </template>

          <!-- 付款記錄 Tab 操作按鈕 -->
          <template v-if="activeKey === TAB_KEYS.PAYMENTS">
            <a-button status="danger" plain @click="paymentsTabRef?.clearFilter()">{{ t("clearAllSearch", "清除篩選") }}</a-button>
            <a-button type="primary" @click="paymentsTabRef?.openPaymentDialog()">{{ t("processPayment", "新增付款") }}</a-button>
          </template>

          <!-- 折讓單 Tab 操作按鈕 -->
          <template v-if="activeKey === TAB_KEYS.CREDIT_MEMOS">
            <a-button status="danger" plain @click="creditMemosTabRef?.clearFilter()">{{ t("clearAllSearch", "清除篩選") }}</a-button>
            <a-button type="primary" @click="creditMemosTabRef?.openCreateDialog()">{{ t("createCreditMemo", "新增折讓單") }}</a-button>
          </template>

          <!-- 帳務報表 Tab 操作按鈕 -->
          <template v-if="activeKey === TAB_KEYS.REPORTS">
            <a-button status="danger" plain @click="reportsTabRef?.clearFilter()">{{ t("clearAllSearch", "清除篩選") }}</a-button>
          </template>
        </div>
      </template>
    </a-tabs>

    <CardContent class="flex flex-col gap-2">
      <InvoicesTab v-if="activeKey === TAB_KEYS.INVOICES" ref="invoicesTabRef" @open-payment="handleOpenPayment" />
      <PaymentsTab v-else-if="activeKey === TAB_KEYS.PAYMENTS" ref="paymentsTabRef" />
      <CreditMemosTab v-else-if="activeKey === TAB_KEYS.CREDIT_MEMOS" ref="creditMemosTabRef" />
      <BillingReportsTab v-else-if="activeKey === TAB_KEYS.REPORTS" ref="reportsTabRef" />
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import InvoicesTab from "./components/InvoicesTab.vue";
import PaymentsTab from "./components/PaymentsTab.vue";
import CreditMemosTab from "./components/CreditMemosTab.vue";
import BillingReportsTab from "./components/BillingReportsTab.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

/** Tab 頁籤相關 **/
const TAB_KEYS = {
  INVOICES: "INVOICES",
  PAYMENTS: "PAYMENTS",
  CREDIT_MEMOS: "CREDIT_MEMOS",
  REPORTS: "REPORTS"
};
const activeKey = ref(TAB_KEYS.INVOICES);
const toggleActiveKey = (key) => {
  activeKey.value = key;
};
const invoicesTabRef = ref(null);
const paymentsTabRef = ref(null);
const creditMemosTabRef = ref(null);
const reportsTabRef = ref(null);

/** 跨 Tab 操作 **/
const handleOpenPayment = (invoice) => {
  activeKey.value = TAB_KEYS.PAYMENTS;
  setTimeout(() => {
    paymentsTabRef.value?.openPaymentDialog(invoice);
  }, 100);
}; //從發票頁面開啟付款對話框
</script>
