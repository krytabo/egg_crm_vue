<!-- src/pages/basic-data/VehicleManagementPage.vue 車輛資料 -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button as TinyButton } from '@/components/ui/button'
import { Input as TinyInput } from '@/components/ui/input'
import { Select as TinySelect } from '@/components/ui/select'
import { Checkbox as TinyCheckbox } from '@/components/ui/checkbox'
import { DialogBox as TinyDialogBox } from '@/components/ui/dialog-box'
import { Badge as TinyBadge } from '@/components/ui/badge'
import AppPagination from '@/components/ui/AppPagination.vue'
import {
  IconAdd,
  IconEdit,
  IconDelete,
  IconChevronDown,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconWarningTriangle,
  IconFiletext
} from '@opentiny/vue-icon'
import Notify from '@opentiny/vue-notify'

/** 常數設定 **/
const mockEmployees = [
  { id: 1, name: '張三', position: '送貨司機' },
  { id: 2, name: '李四', position: '送貨司機' },
  { id: 3, name: '王五', position: '送貨司機' },
  { id: 4, name: '劉司機', position: '送貨司機' },
  { id: 5, name: '陳司機', position: '送貨司機' },
  { id: 6, name: '黃司機', position: '送貨司機' }
] //預設員工
const vehicleStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '正常', value: '正常' },
  { label: '維修中', value: '維修中' },
  { label: '報廢', value: '報廢' }
] //車輛狀態
const recordStatusOptions = [
  { label: '完成', value: '完成' },
  { label: '保固內', value: '保固內' },
  { label: '待付款', value: '待付款' }
] //維修保養狀態
const driverOptions = mockEmployees.map((emp) => ({ label: `${emp.name} - ${emp.position}`, value: emp.name })) //司機選項
const driverFilterOptions = [{ label: '全部', value: '' }, ...driverOptions] //司機篩選

/** 初始資料 **/
const initialVehicles = [
  {
    id: 1,
    plateNumber: 'ABC-1234',
    brand: '豐田/TOYOTA HIACE',
    ownerName: '王大明',
    driverName: '張三',
    manufactureYear: 2020,
    purchaseDate: '2020-03-15',
    licenseExpiry: '2025-03-15',
    mileage: 45000,
    mileageDate: '2024-10-28',
    licenseImage: '',
    notes: '每月定期保養',
    status: '正常',
    maintenanceRecords: [
      {
        id: 1,
        vendor: '豐田保養廠',
        date: '2024-10-15',
        items: '更換機油、機油濾芯、空氣濾芯',
        cost: 3500,
        warrantyExpiry: '2025-04-15',
        mileage: 44500,
        nextMaintenanceDate: '2025-01-15',
        nextMaintenanceMileage: 49500,
        status: '完成',
        images: []
      }
    ],
    repairRecords: [
      {
        id: 1,
        vendor: '豐田維修廠',
        date: '2024-09-10',
        items: '更換煞車皮',
        cost: 5000,
        warrantyExpiry: '2025-09-10',
        mileage: 43000,
        nextRepairDate: '2025-09-10',
        nextRepairMileage: 53000,
        status: '保固內',
        images: []
      }
    ]
  },
  {
    id: 2,
    plateNumber: 'XYZ-5678',
    brand: '日產/NISSAN URVAN',
    ownerName: '李小華',
    driverName: '李四',
    manufactureYear: 2021,
    purchaseDate: '2021-06-20',
    licenseExpiry: '2025-06-20',
    mileage: 32000,
    mileageDate: '2024-10-25',
    licenseImage: '',
    notes: '',
    status: '正常',
    maintenanceRecords: [],
    repairRecords: []
  },
  {
    id: 3,
    plateNumber: 'DEF-9012',
    brand: '三菱/MITSUBISHI CANTER',
    ownerName: '陳美玲',
    driverName: '王五',
    manufactureYear: 2019,
    purchaseDate: '2019-08-10',
    licenseExpiry: '2025-08-10',
    mileage: 68000,
    mileageDate: '2024-10-20',
    licenseImage: '',
    notes: '需定期檢查引擎',
    status: '維修中',
    maintenanceRecords: [],
    repairRecords: []
  }
] //預設車輛

/** 狀態管理 **/
const vehicles = ref(initialVehicles.map((vehicle) => ({ ...vehicle }))) //車輛列表
const filters = reactive({ id: '', plateNumber: '', brand: '', ownerName: '', driverName: '', manufactureYear: '', purchaseDate: '', licenseExpiry: '', mileage: '', status: 'all' }) //篩選條件
const sortConfig = ref({ key: '', direction: 'asc' }) //排序
const currentPage = ref(1) //目前頁碼
const pageSize = 10 //每頁筆數
const selectedIds = ref(new Set()) //選取車輛
const expandedIds = ref(new Set()) //展開列
const vehicleDialogVisible = ref(false) //車輛彈窗
const editingVehicleId = ref(null) //編輯車輛ID
const vehicleForm = reactive({ plateNumber: '', brand: '', ownerName: '', driverName: '', manufactureYear: '', purchaseDate: '', licenseExpiry: '', mileage: '', mileageDate: '', licenseImage: '', notes: '', status: '正常' }) //車輛表單
const deleteDialogVisible = ref(false) //刪除彈窗
const deleteTargetId = ref(null) //刪除ID
const repairDialogVisible = ref(false) //維修彈窗
const maintenanceDialogVisible = ref(false) //保養彈窗
const activeVehicleId = ref(null) //操作車輛ID
const editingRepairId = ref(null) //維修記錄ID
const editingMaintenanceId = ref(null) //保養記錄ID
const repairForm = reactive({ vendor: '', date: '', items: '', cost: '', warrantyExpiry: '', mileage: '', nextRepairDate: '', nextRepairMileage: '', status: '完成', images: [] }) //維修表單
const maintenanceForm = reactive({ vendor: '', date: '', items: '', cost: '', warrantyExpiry: '', mileage: '', nextMaintenanceDate: '', nextMaintenanceMileage: '', status: '完成', images: [] }) //保養表單
const bulkStatusValue = ref(null) //批次狀態

/** 計算資料 **/
const filteredVehicles = computed(() => {
  const keyword = (value) => value?.toString().toLowerCase() || ''
  return vehicles.value.filter((vehicle) => {
    if (filters.id && !String(vehicle.id).includes(filters.id.trim())) return false
    if (filters.plateNumber && !keyword(vehicle.plateNumber).includes(filters.plateNumber.toLowerCase())) return false
    if (filters.brand && !keyword(vehicle.brand).includes(filters.brand.toLowerCase())) return false
    if (filters.ownerName && !keyword(vehicle.ownerName).includes(filters.ownerName.toLowerCase())) return false
    if (filters.driverName && !keyword(vehicle.driverName).includes(filters.driverName.toLowerCase())) return false
    if (filters.manufactureYear && !String(vehicle.manufactureYear).includes(filters.manufactureYear)) return false
    if (filters.purchaseDate && !(vehicle.purchaseDate || '').includes(filters.purchaseDate)) return false
    if (filters.licenseExpiry && !(vehicle.licenseExpiry || '').includes(filters.licenseExpiry)) return false
    if (filters.mileage && !String(vehicle.mileage).includes(filters.mileage)) return false
    if (filters.status !== 'all' && vehicle.status !== filters.status) return false
    return true
  })
}) //篩選車輛

const sortedVehicles = computed(() => {
  if (!sortConfig.value.key) return filteredVehicles.value
  const { key, direction } = sortConfig.value
  return [...filteredVehicles.value].sort((a, b) => {
    const dir = direction === 'asc' ? 1 : -1
    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''
    if (aVal < bVal) return -1 * dir
    if (aVal > bVal) return 1 * dir
    return 0
  })
}) //排序車輛

const totalPages = computed(() => Math.max(1, Math.ceil(sortedVehicles.value.length / pageSize))) //總頁數
const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedVehicles.value.slice(start, start + pageSize)
}) //當前列表
const selectedCount = computed(() => selectedIds.value.size) //選中數
const isPageFullySelected = computed(() => paginatedVehicles.value.length > 0 && paginatedVehicles.value.every((vehicle) => selectedIds.value.has(vehicle.id))) //當頁全選
const isPageIndeterminate = computed(() => {
  if (!selectedCount.value) return false
  const pageSelected = paginatedVehicles.value.filter((vehicle) => selectedIds.value.has(vehicle.id)).length
  return pageSelected > 0 && pageSelected < paginatedVehicles.value.length
}) //半選
const showingRange = computed(() => {
  if (!sortedVehicles.value.length) return { start: 0, end: 0, total: 0 }
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, sortedVehicles.value.length)
  return { start, end, total: sortedVehicles.value.length }
}) //顯示範圍

/** 排序顯示 **/
const isSortActive = (field) => sortConfig.value.key === field //是否排序欄位
const getSortIconComponent = (field) => {
  if (!isSortActive(field) || sortConfig.value.direction === 'asc') return IconArrowUp
  return IconArrowDown
} //排序圖示
const getSortIconClass = (field) => (isSortActive(field) ? 'tiny-svg-size text-primary-500' : 'tiny-svg-size text-gray-400') //排序樣式

/** 工具函式 **/
const handleFilterChange = (key, value) => {
  filters[key] = value
  currentPage.value = 1
} //更新篩選
const toggleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value = { key, direction: sortConfig.value.direction === 'asc' ? 'desc' : 'asc' }
  } else {
    sortConfig.value = { key, direction: 'asc' }
  }
} //切換排序
const toggleSelectAll = (checked) => {
  const next = new Set(selectedIds.value)
  if (checked) paginatedVehicles.value.forEach((vehicle) => next.add(vehicle.id))
  else paginatedVehicles.value.forEach((vehicle) => next.delete(vehicle.id))
  selectedIds.value = next
} //切換全選
const toggleSelectVehicle = (id) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
} //切換單筆
const isVehicleSelected = (id) => selectedIds.value.has(id) //單筆是否選中
const toggleExpand = (id) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
} //展開折疊
const isVehicleExpanded = (id) => expandedIds.value.has(id) //是否展開
const resetVehicleForm = () => {
  vehicleForm.plateNumber = ''
  vehicleForm.brand = ''
  vehicleForm.ownerName = ''
  vehicleForm.driverName = ''
  vehicleForm.manufactureYear = ''
  vehicleForm.purchaseDate = ''
  vehicleForm.licenseExpiry = ''
  vehicleForm.mileage = ''
  vehicleForm.mileageDate = ''
  vehicleForm.licenseImage = ''
  vehicleForm.notes = ''
  vehicleForm.status = '正常'
} //重設車輛表單
const resetRepairForm = () => {
  repairForm.vendor = ''
  repairForm.date = ''
  repairForm.items = ''
  repairForm.cost = ''
  repairForm.warrantyExpiry = ''
  repairForm.mileage = ''
  repairForm.nextRepairDate = ''
  repairForm.nextRepairMileage = ''
  repairForm.status = '完成'
  repairForm.images = []
} //重設維修
const resetMaintenanceForm = () => {
  maintenanceForm.vendor = ''
  maintenanceForm.date = ''
  maintenanceForm.items = ''
  maintenanceForm.cost = ''
  maintenanceForm.warrantyExpiry = ''
  maintenanceForm.mileage = ''
  maintenanceForm.nextMaintenanceDate = ''
  maintenanceForm.nextMaintenanceMileage = ''
  maintenanceForm.status = '完成'
  maintenanceForm.images = []
} //重設保養
const openVehicleDialog = (vehicle) => {
  if (vehicle) {
    editingVehicleId.value = vehicle.id
    Object.assign(vehicleForm, {
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      ownerName: vehicle.ownerName,
      driverName: vehicle.driverName,
      manufactureYear: vehicle.manufactureYear?.toString() || '',
      purchaseDate: vehicle.purchaseDate || '',
      licenseExpiry: vehicle.licenseExpiry || '',
      mileage: vehicle.mileage?.toString() || '',
      mileageDate: vehicle.mileageDate || '',
      licenseImage: vehicle.licenseImage || '',
      notes: vehicle.notes || '',
      status: vehicle.status
    })
  } else {
    editingVehicleId.value = null
    resetVehicleForm()
  }
  vehicleDialogVisible.value = true
} //開啟車輛彈窗
const closeVehicleDialog = () => {
  vehicleDialogVisible.value = false
} //關閉車輛彈窗
const validateVehicleForm = () => {
  if (!vehicleForm.plateNumber || !vehicleForm.brand || !vehicleForm.ownerName || !vehicleForm.driverName) {
    Notify({ type: 'warning', title: '請填寫必填欄位' })
    return false
  }
  return true
} //驗證車輛
const saveVehicle = () => {
  if (!validateVehicleForm()) return
  const payload = {
    plateNumber: vehicleForm.plateNumber,
    brand: vehicleForm.brand,
    ownerName: vehicleForm.ownerName,
    driverName: vehicleForm.driverName,
    manufactureYear: vehicleForm.manufactureYear ? Number(vehicleForm.manufactureYear) : '',
    purchaseDate: vehicleForm.purchaseDate,
    licenseExpiry: vehicleForm.licenseExpiry,
    mileage: vehicleForm.mileage ? Number(vehicleForm.mileage) : 0,
    mileageDate: vehicleForm.mileageDate,
    licenseImage: vehicleForm.licenseImage,
    notes: vehicleForm.notes,
    status: vehicleForm.status
  }
  if (editingVehicleId.value) {
    vehicles.value = vehicles.value.map((vehicle) => (vehicle.id === editingVehicleId.value ? { ...vehicle, ...payload } : vehicle))
    Notify({ type: 'success', title: '車輛資料已更新' })
  } else {
    const nextId = vehicles.value.length ? Math.max(...vehicles.value.map((vehicle) => vehicle.id)) + 1 : 1
    vehicles.value.push({ id: nextId, ...payload, maintenanceRecords: [], repairRecords: [] })
    Notify({ type: 'success', title: '車輛已新增' })
  }
  vehicleDialogVisible.value = false
} //儲存車輛
const handleDelete = (id) => {
  deleteTargetId.value = id
  deleteDialogVisible.value = true
} //開啟刪除
const closeDeleteDialog = () => {
  deleteDialogVisible.value = false
} //關閉刪除
const confirmDelete = () => {
  if (deleteTargetId.value !== null) {
    vehicles.value = vehicles.value.filter((vehicle) => vehicle.id !== deleteTargetId.value)
    selectedIds.value.delete(deleteTargetId.value)
    Notify({ type: 'success', title: '車輛已刪除' })
  }
  deleteTargetId.value = null
  deleteDialogVisible.value = false
} //確認刪除
const handleBulkDelete = () => {
  if (!selectedIds.value.size) return
  vehicles.value = vehicles.value.filter((vehicle) => !selectedIds.value.has(vehicle.id))
  selectedIds.value = new Set()
  Notify({ type: 'success', title: '選中車輛已刪除' })
} //批次刪除
const handleBulkStatusChange = (status) => {
  bulkStatusValue.value = status
  if (!status || !selectedIds.value.size) return
  vehicles.value = vehicles.value.map((vehicle) => (selectedIds.value.has(vehicle.id) ? { ...vehicle, status } : vehicle))
  selectedIds.value = new Set()
  bulkStatusValue.value = null
  Notify({ type: 'success', title: `已更新選中車輛為「${status}」` })
} //批次狀態
const openRepairDialog = (vehicleId, record) => {
  activeVehicleId.value = vehicleId
  if (record) {
    editingRepairId.value = record.id
    Object.assign(repairForm, {
      vendor: record.vendor,
      date: record.date,
      items: record.items,
      cost: record.cost?.toString() || '',
      warrantyExpiry: record.warrantyExpiry || '',
      mileage: record.mileage?.toString() || '',
      nextRepairDate: record.nextRepairDate || '',
      nextRepairMileage: record.nextRepairMileage?.toString() || '',
      status: record.status,
      images: record.images || []
    })
  } else {
    editingRepairId.value = null
    resetRepairForm()
  }
  repairDialogVisible.value = true
} //開啟維修
const closeRepairDialog = () => {
  repairDialogVisible.value = false
} //關閉維修
const openMaintenanceDialog = (vehicleId, record) => {
  activeVehicleId.value = vehicleId
  if (record) {
    editingMaintenanceId.value = record.id
    Object.assign(maintenanceForm, {
      vendor: record.vendor,
      date: record.date,
      items: record.items,
      cost: record.cost?.toString() || '',
      warrantyExpiry: record.warrantyExpiry || '',
      mileage: record.mileage?.toString() || '',
      nextMaintenanceDate: record.nextMaintenanceDate || '',
      nextMaintenanceMileage: record.nextMaintenanceMileage?.toString() || '',
      status: record.status,
      images: record.images || []
    })
  } else {
    editingMaintenanceId.value = null
    resetMaintenanceForm()
  }
  maintenanceDialogVisible.value = true
} //開啟保養
const closeMaintenanceDialog = () => {
  maintenanceDialogVisible.value = false
} //關閉保養
const validateRecord = (form, type) => {
  if (!form.vendor || !form.date || !form.items || !form.cost || !form.mileage) {
    Notify({ type: 'warning', title: `請填寫完整${type}資訊` })
    return false
  }
  return true
} //檢查記錄
const saveRepairRecord = () => {
  if (activeVehicleId.value === null) return
  if (!validateRecord(repairForm, '維修')) return
  const payload = {
    id: editingRepairId.value || Date.now(),
    vendor: repairForm.vendor,
    date: repairForm.date,
    items: repairForm.items,
    cost: Number(repairForm.cost),
    warrantyExpiry: repairForm.warrantyExpiry,
    mileage: Number(repairForm.mileage),
    nextRepairDate: repairForm.nextRepairDate,
    nextRepairMileage: Number(repairForm.nextRepairMileage) || 0,
    status: repairForm.status,
    images: repairForm.images
  }
  vehicles.value = vehicles.value.map((vehicle) => {
    if (vehicle.id !== activeVehicleId.value) return vehicle
    const nextRecords = editingRepairId.value
      ? vehicle.repairRecords.map((record) => (record.id === editingRepairId.value ? payload : record))
      : [...vehicle.repairRecords, payload]
    return { ...vehicle, repairRecords: nextRecords, mileage: payload.mileage, mileageDate: payload.date }
  })
  repairDialogVisible.value = false
  Notify({ type: 'success', title: editingRepairId.value ? '維修記錄已更新' : '維修記錄已新增' })
} //儲存維修
const saveMaintenanceRecord = () => {
  if (activeVehicleId.value === null) return
  if (!validateRecord(maintenanceForm, '保養')) return
  const payload = {
    id: editingMaintenanceId.value || Date.now(),
    vendor: maintenanceForm.vendor,
    date: maintenanceForm.date,
    items: maintenanceForm.items,
    cost: Number(maintenanceForm.cost),
    warrantyExpiry: maintenanceForm.warrantyExpiry,
    mileage: Number(maintenanceForm.mileage),
    nextMaintenanceDate: maintenanceForm.nextMaintenanceDate,
    nextMaintenanceMileage: Number(maintenanceForm.nextMaintenanceMileage) || 0,
    status: maintenanceForm.status,
    images: maintenanceForm.images
  }
  vehicles.value = vehicles.value.map((vehicle) => {
    if (vehicle.id !== activeVehicleId.value) return vehicle
    const nextRecords = editingMaintenanceId.value
      ? vehicle.maintenanceRecords.map((record) => (record.id === editingMaintenanceId.value ? payload : record))
      : [...vehicle.maintenanceRecords, payload]
    return { ...vehicle, maintenanceRecords: nextRecords, mileage: payload.mileage, mileageDate: payload.date }
  })
  maintenanceDialogVisible.value = false
  Notify({ type: 'success', title: editingMaintenanceId.value ? '保養記錄已更新' : '保養記錄已新增' })
} //儲存保養
const deleteRepairRecord = (vehicleId, recordId) => {
  vehicles.value = vehicles.value.map((vehicle) =>
    vehicle.id === vehicleId ? { ...vehicle, repairRecords: vehicle.repairRecords.filter((record) => record.id !== recordId) } : vehicle
  )
  Notify({ type: 'success', title: '維修記錄已刪除' })
} //刪除維修
const deleteMaintenanceRecord = (vehicleId, recordId) => {
  vehicles.value = vehicles.value.map((vehicle) =>
    vehicle.id === vehicleId
      ? { ...vehicle, maintenanceRecords: vehicle.maintenanceRecords.filter((record) => record.id !== recordId) }
      : vehicle
  )
  Notify({ type: 'success', title: '保養記錄已刪除' })
} //刪除保養
const handleClearFilters = () => {
  Object.assign(filters, { id: '', plateNumber: '', brand: '', ownerName: '', driverName: '', manufactureYear: '', purchaseDate: '', licenseExpiry: '', mileage: '', status: 'all' })
  currentPage.value = 1
} //清除篩選
const handlePageChange = (page) => {
  const target = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = target
} //換頁
const statusBadgeType = (status) => {
  switch (status) {
    case '正常':
      return 'success'
    case '維修中':
      return 'danger'
    case '報廢':
      return 'info'
    case '保固內':
      return 'primary'
    case '待付款':
      return 'warning'
    default:
      return 'default'
  }
} //顯示徽章
const isLicenseExpiring = (expiry) => {
  if (!expiry) return false
  const expiryDate = new Date(expiry)
  const today = new Date()
  const diffDays = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
} //是否即將到期
const formatCurrency = (value) => `NT$${Number(value || 0).toLocaleString('zh-TW')}` //金額顯示
const formatNumber = (value, unit = '') => `${Number(value || 0).toLocaleString('zh-TW')}${unit}` //數字顯示

/** 監聽事件 **/
watch(
  () => sortedVehicles.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (!sortedVehicles.value.length) currentPage.value = 1
  }
)

watch(
  () => vehicleDialogVisible.value,
  (visible) => {
    if (!visible) {
      editingVehicleId.value = null
      resetVehicleForm()
    }
  }
)

watch(
  () => repairDialogVisible.value,
  (visible) => {
    if (!visible) {
      editingRepairId.value = null
      activeVehicleId.value = null
      resetRepairForm()
    }
  }
)

watch(
  () => maintenanceDialogVisible.value,
  (visible) => {
    if (!visible) {
      editingMaintenanceId.value = null
      activeVehicleId.value = null
      resetMaintenanceForm()
    }
  }
)
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">車輛資料管理</h1>
      <p class="text-sm text-gray-500">管理車輛基本資訊、維修與保養紀錄</p>
    </div>

    <Card>
      <CardHeader class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>車輛列表（共 {{ sortedVehicles.length }} 筆）</CardTitle>
          <p class="text-sm text-gray-500">顯示第 {{ showingRange.start || 0 }} - {{ showingRange.end || 0 }} 筆，已選 {{ selectedCount }} 筆</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="selectedCount">
            <TinySelect :model-value="bulkStatusValue" placeholder="批量修改狀態" :options="vehicleStatusOptions.filter((option) => option.value !== 'all')" style="width: 180px" @update:model-value="handleBulkStatusChange" />
            <TinyButton type="danger" @click="handleBulkDelete">刪除選中（{{ selectedCount }}）</TinyButton>
          </template>
          <TinyButton type="default" @click="handleClearFilters">清除篩選</TinyButton>
          <TinyButton type="primary" class="gap-1" @click="openVehicleDialog()">
            <IconAdd class="tiny-svg-size" />
            新增車輛
          </TinyButton>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto rounded-lg border">
          <table class="min-w-full divide-y">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-12 p-3 text-center">
                  <TinyCheckbox :model-value="isPageFullySelected" :indeterminate="isPageIndeterminate" @update:model-value="toggleSelectAll" />
                </th>
                <th class="w-12 p-3" />
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>ID</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('id')">
                        <component :is="getSortIconComponent('id')" :class="getSortIconClass('id')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.id" @update:model-value="(val) => handleFilterChange('id', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>車牌號碼</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('plateNumber')">
                        <component :is="getSortIconComponent('plateNumber')" :class="getSortIconClass('plateNumber')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.plateNumber" @update:model-value="(val) => handleFilterChange('plateNumber', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>車種/品牌</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('brand')">
                        <component :is="getSortIconComponent('brand')" :class="getSortIconClass('brand')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.brand" @update:model-value="(val) => handleFilterChange('brand', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>車主</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('ownerName')">
                        <component :is="getSortIconComponent('ownerName')" :class="getSortIconClass('ownerName')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.ownerName" @update:model-value="(val) => handleFilterChange('ownerName', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>司機</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('driverName')">
                        <component :is="getSortIconComponent('driverName')" :class="getSortIconClass('driverName')" />
                      </TinyButton>
                    </div>
                    <TinySelect class="h-7 text-xs" placeholder="全部" :options="driverFilterOptions" :model-value="filters.driverName" @update:model-value="(val) => handleFilterChange('driverName', val || '')" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>出廠年份</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('manufactureYear')">
                        <component :is="getSortIconComponent('manufactureYear')" :class="getSortIconClass('manufactureYear')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.manufactureYear" @update:model-value="(val) => handleFilterChange('manufactureYear', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>購入日期</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('purchaseDate')">
                        <component :is="getSortIconComponent('purchaseDate')" :class="getSortIconClass('purchaseDate')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="YYYY-MM" :model-value="filters.purchaseDate" @update:model-value="(val) => handleFilterChange('purchaseDate', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>行照到期</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('licenseExpiry')">
                        <component :is="getSortIconComponent('licenseExpiry')" :class="getSortIconClass('licenseExpiry')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.licenseExpiry" @update:model-value="(val) => handleFilterChange('licenseExpiry', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>里程數</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('mileage')">
                        <component :is="getSortIconComponent('mileage')" :class="getSortIconClass('mileage')" />
                      </TinyButton>
                    </div>
                    <TinyInput class="h-7 text-xs" placeholder="篩選" :model-value="filters.mileage" @update:model-value="(val) => handleFilterChange('mileage', val)" />
                  </div>
                </th>
                <th class="p-3 text-left text-xs font-medium text-gray-500">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1">
                      <span>狀態</span>
                      <TinyButton type="text" class="!p-0 !h-auto" @click="toggleSort('status')">
                        <component :is="getSortIconComponent('status')" :class="getSortIconClass('status')" />
                      </TinyButton>
                    </div>
                    <TinySelect class="h-7 text-xs" :options="vehicleStatusOptions" :model-value="filters.status" @update:model-value="(val) => handleFilterChange('status', val)" />
                  </div>
                </th>
                <th class="p-3 text-right text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-if="!paginatedVehicles.length">
                <td colspan="12" class="p-6 text-center text-sm text-gray-500">沒有符合條件的車輛</td>
              </tr>
              <template v-else>
                <template v-for="vehicle in paginatedVehicles" :key="vehicle.id">
                  <tr class="hover:bg-gray-50">
                    <td class="p-3 text-center">
                      <TinyCheckbox :model-value="isVehicleSelected(vehicle.id)" @update:model-value="() => toggleSelectVehicle(vehicle.id)" />
                    </td>
                    <td class="p-3 text-center">
                      <TinyButton type="text" class="!p-0" @click="toggleExpand(vehicle.id)">
                        <IconChevronDown v-if="isVehicleExpanded(vehicle.id)" class="tiny-svg-size" />
                        <IconChevronRight v-else class="tiny-svg-size" />
                      </TinyButton>
                    </td>
                    <td class="p-3 text-sm text-gray-700">{{ vehicle.id }}</td>
                    <td class="p-3 text-sm text-gray-800">{{ vehicle.plateNumber }}</td>
                    <td class="p-3 text-sm text-gray-800">{{ vehicle.brand }}</td>
                    <td class="p-3 text-sm text-gray-800">{{ vehicle.ownerName }}</td>
                    <td class="p-3 text-sm text-gray-800">{{ vehicle.driverName }}</td>
                    <td class="p-3 text-sm text-gray-800">{{ vehicle.manufactureYear || '-' }}</td>
                    <td class="p-3 text-sm text-gray-700">{{ vehicle.purchaseDate || '-' }}</td>
                    <td class="p-3 text-sm text-gray-700">
                      <div class="flex items-center gap-2">
                        {{ vehicle.licenseExpiry || '-' }}
                        <IconWarningTriangle v-if="isLicenseExpiring(vehicle.licenseExpiry)" class="tiny-svg-size text-orange-500" />
                      </div>
                    </td>
                    <td class="p-3 text-sm text-gray-700">
                      <div class="flex flex-col">
                        <span>{{ formatNumber(vehicle.mileage, ' km') }}</span>
                        <span class="text-xs text-gray-500">{{ vehicle.mileageDate }}</span>
                      </div>
                    </td>
                    <td class="p-3">
                      <TinyBadge :type="statusBadgeType(vehicle.status)">{{ vehicle.status }}</TinyBadge>
                    </td>
                    <td class="p-3 text-right">
                      <div class="flex justify-end gap-2">
                        <TinyButton type="text" @click="openVehicleDialog(vehicle)">
                          <IconEdit class="tiny-svg-size" />
                        </TinyButton>
                        <TinyButton type="text" @click="handleDelete(vehicle.id)">
                          <IconDelete class="tiny-svg-size text-red-500" />
                        </TinyButton>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="isVehicleExpanded(vehicle.id)">
                    <td colspan="12" class="bg-gray-50 p-6">
                      <div class="space-y-6">
                        <div>
                          <h4 class="mb-2 font-semibold text-gray-800">基本資訊</h4>
                          <div class="grid gap-4 text-sm md:grid-cols-2">
                            <div>
                              <p class="text-gray-600">備註</p>
                              <p class="mt-1 text-gray-800">{{ vehicle.notes || '無' }}</p>
                            </div>
                            <div>
                              <p class="text-gray-600">行照檔案</p>
                              <div v-if="vehicle.licenseImage" class="mt-1 flex items-center gap-2 text-primary-600">
                                <IconFiletext class="tiny-svg-size" />
                                <span class="text-sm">{{ vehicle.licenseImage }}</span>
                              </div>
                              <p v-else class="mt-1 text-gray-400">尚未上傳</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div class="mb-3 flex items-center justify-between">
                            <h4 class="font-semibold text-gray-800">維修記錄（{{ vehicle.repairRecords.length }}）</h4>
                            <TinyButton type="primary" size="small" class="gap-1" @click="openRepairDialog(vehicle.id)">
                              <IconAdd class="tiny-svg-size" />
                              新增維修記錄
                            </TinyButton>
                          </div>
                          <div v-if="vehicle.repairRecords.length" class="space-y-3">
                            <Card v-for="record in vehicle.repairRecords" :key="record.id">
                              <CardContent class="pt-4">
                                <div class="flex flex-col gap-4 md:flex-row md:justify-between">
                                  <div class="grid gap-3 text-sm md:grid-cols-3 lg:grid-cols-4">
                                    <div>
                                      <p class="text-gray-500">維修廠商</p>
                                      <p>{{ record.vendor }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">維修日期</p>
                                      <p>{{ record.date }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">維修項目</p>
                                      <p>{{ record.items }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">費用</p>
                                      <p>{{ formatCurrency(record.cost) }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">保固期限</p>
                                      <p>{{ record.warrantyExpiry || '-' }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">維修里程</p>
                                      <p>{{ formatNumber(record.mileage, ' km') }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">下次維修</p>
                                      <p>{{ record.nextRepairDate || '-' }}</p>
                                      <p class="text-xs text-gray-500">{{ record.nextRepairMileage ? record.nextRepairMileage.toLocaleString() + ' km' : '' }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">狀態</p>
                                      <TinyBadge :type="statusBadgeType(record.status)">{{ record.status }}</TinyBadge>
                                    </div>
                                  </div>
                                  <div class="flex gap-2 self-start">
                                    <TinyButton type="text" @click="openRepairDialog(vehicle.id, record)">
                                      <IconEdit class="tiny-svg-size" />
                                    </TinyButton>
                                    <TinyButton type="text" @click="deleteRepairRecord(vehicle.id, record.id)">
                                      <IconDelete class="tiny-svg-size text-red-500" />
                                    </TinyButton>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          <p v-else class="text-sm text-gray-500">暫無維修記錄</p>
                        </div>

                        <div>
                          <div class="mb-3 flex items-center justify-between">
                            <h4 class="font-semibold text-gray-800">保養記錄（{{ vehicle.maintenanceRecords.length }}）</h4>
                            <TinyButton type="primary" size="small" class="gap-1" @click="openMaintenanceDialog(vehicle.id)">
                              <IconAdd class="tiny-svg-size" />
                              新增保養記錄
                            </TinyButton>
                          </div>
                          <div v-if="vehicle.maintenanceRecords.length" class="space-y-3">
                            <Card v-for="record in vehicle.maintenanceRecords" :key="record.id">
                              <CardContent class="pt-4">
                                <div class="flex flex-col gap-4 md:flex-row md:justify-between">
                                  <div class="grid gap-3 text-sm md:grid-cols-3 lg:grid-cols-4">
                                    <div>
                                      <p class="text-gray-500">保養廠商</p>
                                      <p>{{ record.vendor }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">保養日期</p>
                                      <p>{{ record.date }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">保養項目</p>
                                      <p>{{ record.items }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">費用</p>
                                      <p>{{ formatCurrency(record.cost) }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">保固期限</p>
                                      <p>{{ record.warrantyExpiry || '-' }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">保養里程</p>
                                      <p>{{ formatNumber(record.mileage, ' km') }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">下次保養</p>
                                      <p>{{ record.nextMaintenanceDate || '-' }}</p>
                                      <p class="text-xs text-gray-500">{{ record.nextMaintenanceMileage ? record.nextMaintenanceMileage.toLocaleString() + ' km' : '' }}</p>
                                    </div>
                                    <div>
                                      <p class="text-gray-500">狀態</p>
                                      <TinyBadge :type="statusBadgeType(record.status)">{{ record.status }}</TinyBadge>
                                    </div>
                                  </div>
                                  <div class="flex gap-2 self-start">
                                    <TinyButton type="text" @click="openMaintenanceDialog(vehicle.id, record)">
                                      <IconEdit class="tiny-svg-size" />
                                    </TinyButton>
                                    <TinyButton type="text" @click="deleteMaintenanceRecord(vehicle.id, record.id)">
                                      <IconDelete class="tiny-svg-size text-red-500" />
                                    </TinyButton>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          <p v-else class="text-sm text-gray-500">暫無保養記錄</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-sm text-gray-600">顯示第 {{ showingRange.start || 0 }} - {{ showingRange.end || 0 }} 筆，共 {{ showingRange.total }} 筆</span>
          <AppPagination
            :current="currentPage"
            :page-size="pageSize"
            :total="showingRange.total"
            :show-total="false"
            :show-page-size="false"
            @change="handlePageChange"
          />
        </div>
      </CardContent>
    </Card>

    <TinyDialogBox v-model:visible="vehicleDialogVisible" :title="editingVehicleId ? '編輯車輛' : '新增車輛'" width="800px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeVehicleDialog">取消</TinyButton>
          <TinyButton type="primary" @click="saveVehicle">{{ editingVehicleId ? '更新' : '新增' }}</TinyButton>
        </div>
      </template>

      <div class="grid gap-4 py-2">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">車牌號碼 *</p>
            <TinyInput v-model="vehicleForm.plateNumber" placeholder="例如 ABC-1234" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">車種/品牌 *</p>
            <TinyInput v-model="vehicleForm.brand" placeholder="例如 豐田 HIACE" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">車主 *</p>
            <TinyInput v-model="vehicleForm.ownerName" placeholder="車主姓名" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">司機 *</p>
            <TinySelect v-model="vehicleForm.driverName" placeholder="選擇司機" :options="driverOptions" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-sm font-medium text-gray-700">出廠年份</p>
            <TinyInput type="number" v-model="vehicleForm.manufactureYear" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">購入日期</p>
            <TinyInput type="date" v-model="vehicleForm.purchaseDate" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">行照到期日</p>
            <TinyInput type="date" v-model="vehicleForm.licenseExpiry" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">里程數</p>
            <TinyInput type="number" v-model="vehicleForm.mileage" placeholder="0" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">里程紀錄日期</p>
            <TinyInput type="date" v-model="vehicleForm.mileageDate" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">行照檔案名稱</p>
            <TinyInput v-model="vehicleForm.licenseImage" placeholder="可輸入檔名或連結" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">車輛狀態</p>
            <TinySelect v-model="vehicleForm.status" :options="vehicleStatusOptions.filter((option) => option.value !== 'all')" />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">備註</p>
          <TinyInput type="textarea" rows="3" v-model="vehicleForm.notes" placeholder="可補充備註" />
        </div>
      </div>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="repairDialogVisible" :title="editingRepairId ? '編輯維修記錄' : '新增維修記錄'" width="720px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeRepairDialog">取消</TinyButton>
          <TinyButton type="primary" @click="saveRepairRecord">儲存</TinyButton>
        </div>
      </template>

      <div class="grid gap-4 py-2">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">維修廠商 *</p>
            <TinyInput v-model="repairForm.vendor" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">維修日期 *</p>
            <TinyInput type="date" v-model="repairForm.date" />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">維修項目 *</p>
          <TinyInput type="textarea" rows="3" v-model="repairForm.items" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">費用（含稅）*</p>
            <TinyInput type="number" v-model="repairForm.cost" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">保固期限</p>
            <TinyInput type="date" v-model="repairForm.warrantyExpiry" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">維修里程數 *</p>
            <TinyInput type="number" v-model="repairForm.mileage" />
            <p class="text-xs text-gray-500">保存後會同步更新車輛里程</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">狀態</p>
            <TinySelect v-model="repairForm.status" :options="recordStatusOptions" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">下次維修日期</p>
            <TinyInput type="date" v-model="repairForm.nextRepairDate" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">下次維修里程</p>
            <TinyInput type="number" v-model="repairForm.nextRepairMileage" />
          </div>
        </div>
      </div>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="maintenanceDialogVisible" :title="editingMaintenanceId ? '編輯保養記錄' : '新增保養記錄'" width="720px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeMaintenanceDialog">取消</TinyButton>
          <TinyButton type="primary" @click="saveMaintenanceRecord">儲存</TinyButton>
        </div>
      </template>

      <div class="grid gap-4 py-2">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">保養廠商 *</p>
            <TinyInput v-model="maintenanceForm.vendor" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">保養日期 *</p>
            <TinyInput type="date" v-model="maintenanceForm.date" />
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">保養項目 *</p>
          <TinyInput type="textarea" rows="3" v-model="maintenanceForm.items" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">費用（含稅）*</p>
            <TinyInput type="number" v-model="maintenanceForm.cost" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">保固期限</p>
            <TinyInput type="date" v-model="maintenanceForm.warrantyExpiry" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">保養里程 *</p>
            <TinyInput type="number" v-model="maintenanceForm.mileage" />
            <p class="text-xs text-gray-500">保存後會同步更新車輛里程</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">狀態</p>
            <TinySelect v-model="maintenanceForm.status" :options="recordStatusOptions" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-700">下次保養日期</p>
            <TinyInput type="date" v-model="maintenanceForm.nextMaintenanceDate" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">下次保養里程</p>
            <TinyInput type="number" v-model="maintenanceForm.nextMaintenanceMileage" />
          </div>
        </div>
      </div>
    </TinyDialogBox>

    <TinyDialogBox v-model:visible="deleteDialogVisible" title="刪除確認" width="420px">
      <template #footer>
        <div class="flex justify-end gap-2">
          <TinyButton type="text" @click="closeDeleteDialog">取消</TinyButton>
          <TinyButton type="danger" @click="confirmDelete">刪除</TinyButton>
        </div>
      </template>
      <p class="text-sm text-gray-600">確定要刪除此車輛嗎？此操作無法復原。</p>
    </TinyDialogBox>
  </div>
</template>
