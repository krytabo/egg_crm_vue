<!-- src/pages/dashboard/DashboardPage.vue 儀表板 -->
<script setup>
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button as TinyButton } from '@/components/ui/button'
import { IconUser, IconShoppingCard, IconBoxSolid, IconStatistics, IconCalendar } from '@opentiny/vue-icon'
import DailyShippingReportDialog from '@/components/dialogs/DailyShippingReportDialog.vue'

/** 狀態與資料 **/
const isDialogOpen = ref(false) //出貨日報表彈窗
const summaryCards = [
  { title: '客戶總數', value: '1,284', trend: '+12% 較上月', icon: IconUser },
  { title: '本月訂單', value: '573', trend: '+8% 較上月', icon: IconShoppingCard },
  { title: '庫存警示', value: '8', trend: '低於安全庫存', icon: IconBoxSolid },
  { title: '本月營收', value: '$458,920', trend: '+15% 較上月', icon: IconStatistics }
] //儀表板摘要
const orderBlocks = [
  {
    title: '桶裝水訂單',
    stats: [
      { label: '待出貨', value: 45 },
      { label: '已出貨', value: 128 },
      { label: '已完成', value: 342 }
    ],
    icon: IconShoppingCard
  },
  {
    title: '雞蛋訂單',
    stats: [
      { label: '待出貨', value: 23 },
      { label: '已出貨', value: 67 },
      { label: '已完成', value: 198 }
    ],
    icon: IconBoxSolid
  },
  {
    title: '飲水機訂單',
    stats: [
      { label: '待出貨', value: 12 },
      { label: '已出貨', value: 35 },
      { label: '已完成', value: 89 }
    ],
    icon: IconCalendar
  }
] //訂單統計
const activities = [
  { time: '10分鐘前', action: '新增訂單 #2045', user: '張小明' },
  { time: '1小時前', action: '更新客戶資料', user: '李美玲' },
  { time: '2小時前', action: '庫存盤點完成', user: '王大華' },
  { time: '3小時前', action: '新增潛在客戶', user: '陳小玉' },
  { time: '4小時前', action: '送貨報表生成', user: '劉司機' }
] //近期活動

/** 事件處理 **/
const openShippingDialog = () => {
  isDialogOpen.value = true
} //開啟日報表
</script>

<template>
  <div class="space-y-8 p-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">儀表板</h1>
        <p class="text-gray-500">歡迎回到 CRM 管理系統</p>
      </div>
      <TinyButton type="primary" @click="openShippingDialog">產生出貨日報表</TinyButton>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in summaryCards" :key="card.title">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="text-sm text-gray-500">{{ card.title }}</CardTitle>
          <component :is="card.icon" class="tiny-svg-size text-blue-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-semibold text-gray-900">{{ card.value }}</div>
          <p class="mt-1 text-xs text-gray-500">{{ card.trend }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <Card v-for="block in orderBlocks" :key="block.title">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <component :is="block.icon" class="tiny-svg-size text-blue-500" />
            {{ block.title }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div v-for="item in block.stats" :key="item.label" class="flex justify-between text-sm">
            <span class="text-gray-600">{{ item.label }}</span>
            <span class="font-medium text-gray-900">{{ item.value }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>近期活動</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="activity in activities"
          :key="activity.action"
          class="flex items-center justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
          <div>
            <p class="text-gray-900">{{ activity.action }}</p>
            <p class="text-sm text-gray-500">{{ activity.user }}</p>
          </div>
          <span class="text-xs text-gray-500">{{ activity.time }}</span>
        </div>
      </CardContent>
    </Card>

    <DailyShippingReportDialog v-model="isDialogOpen" />
  </div>
</template>
