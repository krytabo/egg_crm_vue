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
  // 0912345678 → 0912-345-678
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

/** 建立通知內容 **/
const buildNotificationContent = (call) => {
  const typeInfo = CALL_TYPE_MAP[call.type] || CALL_TYPE_MAP.UNKNOWN;
  const name = call.entityData?.name || call.entityData?.code || '未識別';
  const phone = formatPhone(call.phoneNumber);
  const time = formatTime(call.callTime);

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
      // 來電者資訊
      call.type !== 'UNKNOWN'
        ? h('div', { style: 'font-size: 15px; font-weight: 500' }, name)
        : null,
      h('div', { style: 'color: var(--color-text-2)' }, `📞 ${phone}`),
      h('div', { style: 'color: var(--color-text-3); font-size: 12px' }, `來電時間: ${time}`),
      // 快速跳轉按鈕
      typeInfo.route
        ? h(
            'a',
            {
              style:
                'display: inline-block; margin-top: 8px; color: #165DFF; cursor: pointer; font-size: 13px;',
              onClick: () => {
                router.push({ name: typeInfo.route });
                Notification.clear();
              },
            },
            `前往${typeInfo.label}列表 →`,
          )
        : null,
    ]);
};

/** 監聽來電事件，顯示通知 **/
watch(
  () => incomingCall.value,
  (call) => {
    if (!call) return;

    const typeInfo = CALL_TYPE_MAP[call.type] || CALL_TYPE_MAP.UNKNOWN;

    Notification.warning({
      id: `cti-call-${call.callId}`,
      title: '📞 來電通知',
      content: buildNotificationContent(call),
      duration: 0, // 不自動關閉
      closable: true,
      style: { width: '340px' },
    });
  },
);
</script>
