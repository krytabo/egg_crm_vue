<template>
  <!-- 無 DOM 渲染，純邏輯元件 -->
</template>

<script setup>
import { watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { Notification } from '@arco-design/web-vue';
// functional API 的 CSS 不會被 unplugin-vue-components 自動載入，需手動 import
import '@arco-design/web-vue/es/notification/style/css.js';
import { useCtiSocket } from '@/composables/useCtiSocket';

const router = useRouter();
const { incomingCall } = useCtiSocket();

/** 來電者類型對應設定 **/
const CALL_TYPE_MAP = {
  CUSTOMER: { label: '客戶', color: '#165DFF', route: 'basic-info-customers' },
  PROSPECT: { label: '潛在客戶', color: '#FF7D00', route: 'basic-info-leads' },
  VENDOR: { label: '廠商', color: '#722ED1', route: 'basic-info-vendors' },
  EMPLOYEE: { label: '員工', color: '#0FC6C2', route: 'basic-info-users' },
  UNKNOWN: { label: '未知', color: '#86909C', route: null },
};

/** 格式化電話號碼顯示 **/
const formatPhone = (phone) => {
  if (!phone) return '';
  if (/^09\d{8}$/.test(phone)) {
    return `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;
  }
  return phone;
};

/** 格式化來電時間 **/
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/** 跳轉至對應列表頁，客戶類型同時帶入 autoSearch 自動搜尋 **/
const navigateToList = (call, typeInfo) => {
  if (!typeInfo.route) return;
  const name = call.entityData?.name || call.entityData?.code || '';
  // 客戶頁支援 autoSearch query，自動填入搜尋框並執行搜尋
  if (call.type === 'CUSTOMER' && name) {
    router.push({ name: typeInfo.route, query: { autoSearch: name } });
  } else {
    router.push({ name: typeInfo.route });
  }
  Notification.clear();
};

/** 跳轉至通話記錄頁並帶入手動新增（預填電話） **/
const navigateToCallLog = (call) => {
  router.push({ name: 'cti-calls', query: { addCall: '1', phone: call.phoneNumber } });
  Notification.clear();
};

/** 建立通知內容 **/
const buildNotificationContent = (call) => {
  const typeInfo = CALL_TYPE_MAP[call.type] || CALL_TYPE_MAP.UNKNOWN;
  const name = call.entityData?.name || call.entityData?.code || '未識別';
  const phone = formatPhone(call.phoneNumber);
  const time = formatTime(call.callTime);

  const linkStyle = 'display: inline-block; color: #165DFF; cursor: pointer; font-size: 13px; margin-right: 12px;';

  return () =>
    h('div', { style: 'line-height: 1.8' }, [
      // 類型標籤
      h(
        'div',
        { style: 'margin-bottom: 4px' },
        h(
          'span',
          {
            style: `display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 12px; color: #fff; background: ${typeInfo.color}`,
          },
          typeInfo.label,
        ),
      ),
      // 來電者名稱
      call.type !== 'UNKNOWN'
        ? h('div', { style: 'font-size: 15px; font-weight: 500; margin-bottom: 2px' }, name)
        : null,
      // 電話號碼
      h('div', { style: 'color: var(--color-text-2)' }, `📞 ${phone}`),
      // 來電時間
      h('div', { style: 'color: var(--color-text-3); font-size: 12px; margin-bottom: 8px' }, `來電時間：${time}`),
      // 操作連結列
      h('div', { style: 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; border-top: 1px solid var(--color-border); padding-top: 8px' }, [
        // 前往對應列表（客戶/潛在客戶/廠商/員工）
        typeInfo.route
          ? h('a', { style: linkStyle, onClick: () => navigateToList(call, typeInfo) }, `前往${typeInfo.label}頁 →`)
          : null,
        // 手動補充通話記錄
        h('a', { style: 'display: inline-block; color: #86909C; cursor: pointer; font-size: 13px;', onClick: () => navigateToCallLog(call) }, '補充通話記錄'),
      ]),
    ]);
};

/** 監聽來電事件，顯示通知 **/
watch(
  () => incomingCall.value,
  (call) => {
    if (!call) return;

    Notification.warning({
      id: `cti-call-${call.callId}`,
      title: '📞 來電通知',
      content: buildNotificationContent(call),
      duration: 0,
      closable: true,
      style: { width: '340px' },
    });
  },
);
</script>
