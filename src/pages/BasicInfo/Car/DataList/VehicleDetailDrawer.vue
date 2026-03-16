<!-- src/pages/BasicInfo/Car/DataList/VehicleDetailDrawer.vue 車輛詳細資料抽屜 -->
<template>
  <a-drawer v-model:visible="visible" :title="t('vehicleDetail', '車輛詳細資料') + ` - ${vehicle?.licensePlate || ''}`" :width="800" :footer="false" unmount-on-close @close="handleClose">
    <a-tabs v-model:active-key="activeTab" type="card">
      <template #extra>
        <a-button v-if="activeTab === 'maintenance'" type="primary" size="small" @click="openMaintenanceDialog()">
          <template #icon><icon-plus /></template>
          {{ t('addMaintenance', '新增保養') }}
        </a-button>
        <a-button v-if="activeTab === 'repairs'" type="primary" size="small" @click="openRepairDialog()">
          <template #icon><icon-plus /></template>
          {{ t('addRepair', '新增維修') }}
        </a-button>
        <a-button v-if="activeTab === 'insurance'" type="primary" size="small" @click="openInsuranceDialog()">
          <template #icon><icon-plus /></template>
          {{ t('addInsurance', '新增保險') }}
        </a-button>
      </template>
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        保養記錄 Tab        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <a-tab-pane key="maintenance" :title="t('maintenanceHistory', '保養記錄')">
        <a-table :data="maintenanceList" :loading="maintenanceLoading" :pagination="false" size="small" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column :title="t('type', '類型')" data-index="type" :width="100">
              <template #cell="{ record }">
                <a-tag>{{ maintenanceTypeMap[record.type] || record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('description', '說明')" data-index="description" ellipsis />
            <a-table-column :title="t('cost', '費用')" data-index="costAmount" :width="100" align="right">
              <template #cell="{ record }"> ${{ formatNumber(record.costAmount) }} </template>
            </a-table-column>
            <a-table-column :title="t('performedBy', '執行者')" data-index="performedBy" :width="100" />
            <a-table-column :title="t('completedDate', '完成日期')" data-index="completedDate" :width="110">
              <template #cell="{ record }">
                {{ formatDate(record.completedDate) || '-' }}
              </template>
            </a-table-column>
            <a-table-column :title="t('actions', '操作')" :width="80" align="center">
              <template #cell="{ record }">
                <a-button-group size="mini">
                  <a-button @click="openMaintenanceDialog(record)"><icon-edit /></a-button>
                  <a-button status="danger" @click="deleteMaintenance(record.id)"><icon-delete /></a-button>
                </a-button-group>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="mt-4 flex justify-end">
          <a-pagination :current="maintenancePagination.page" :page-size="maintenancePagination.limit" :total="maintenancePagination.total" show-total @change="onMaintenancePageChange" />
        </div>
      </a-tab-pane>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        維修記錄 Tab        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <a-tab-pane key="repairs" :title="t('repairHistory', '維修記錄')">
        <a-table :data="repairList" :loading="repairLoading" :pagination="false" size="small" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column :title="t('type', '類型')" data-index="type" :width="100">
              <template #cell="{ record }">
                <a-tag>{{ repairTypeMap[record.type] || record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('description', '說明')" data-index="description" ellipsis />
            <a-table-column :title="t('severity', '嚴重程度')" data-index="severity" :width="90">
              <template #cell="{ record }">
                <a-tag :color="severityColorMap[record.severity]">{{ severityMap[record.severity] || record.severity }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('status', '狀態')" data-index="status" :width="80">
              <template #cell="{ record }">
                <a-tag :color="repairStatusColorMap[record.status]">{{ repairStatusMap[record.status] || record.status }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('cost', '費用')" data-index="costAmount" :width="100" align="right">
              <template #cell="{ record }"> ${{ formatNumber(record.costAmount) }} </template>
            </a-table-column>
            <a-table-column :title="t('reportedDate', '報修日期')" data-index="reportedDate" :width="110">
              <template #cell="{ record }">
                {{ formatDate(record.reportedDate) }}
              </template>
            </a-table-column>
            <a-table-column :title="t('actions', '操作')" :width="80" align="center">
              <template #cell="{ record }">
                <a-button-group size="mini">
                  <a-button @click="openRepairDialog(record)"><icon-edit /></a-button>
                  <a-button status="danger" @click="deleteRepair(record.id)"><icon-delete /></a-button>
                </a-button-group>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="mt-4 flex justify-end">
          <a-pagination :current="repairPagination.page" :page-size="repairPagination.limit" :total="repairPagination.total" show-total @change="onRepairPageChange" />
        </div>
      </a-tab-pane>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        行程記錄 Tab        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <a-tab-pane key="trips" :title="t('tripHistory', '行程記錄')">
        <a-table :data="tripList" :loading="tripLoading" :pagination="false" size="small" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column :title="t('orderNumber', '訂單編號')" data-index="orderNumber" :width="140" />
            <a-table-column :title="t('customerName', '客戶名稱')" data-index="customerName" :width="120" />
            <a-table-column :title="t('deliveryAddress', '配送地址')" data-index="deliveryAddress" ellipsis>
              <template #cell="{ record }">
                {{ parseAddress(record.deliveryAddress) }}
              </template>
            </a-table-column>
            <a-table-column :title="t('deliveryDate', '配送日期')" data-index="deliveryDate" :width="110">
              <template #cell="{ record }">
                {{ formatDate(record.deliveryDate) }}
              </template>
            </a-table-column>
            <a-table-column :title="t('status', '狀態')" data-index="status" :width="90">
              <template #cell="{ record }">
                <a-tag :color="orderStatusColorMap[record.status]">{{ orderStatusMap[record.status] || record.status }}</a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="mt-4 flex justify-end">
          <a-pagination :current="tripPagination.page" :page-size="tripPagination.limit" :total="tripPagination.total" show-total @change="onTripPageChange" />
        </div>
      </a-tab-pane>

      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <!--        保險記錄 Tab        -->
      <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
      <a-tab-pane key="insurance" :title="t('insuranceHistory', '保險記錄')">
        <a-table :data="insuranceList" :loading="insuranceLoading" :pagination="false" size="small" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column :title="t('insurer', '保險公司')" data-index="insurer" :width="120" />
            <a-table-column :title="t('policyNumber', '保單號碼')" data-index="policyNumber" :width="140">
              <template #cell="{ record }">{{ record.policyNumber || '-' }}</template>
            </a-table-column>
            <a-table-column :title="t('insuranceType', '保險類型')" data-index="insuranceType" :width="110">
              <template #cell="{ record }">
                <a-tag>{{ insuranceTypeMap[record.insuranceType] || record.insuranceType || '-' }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('amount', '保費金額')" data-index="amount" :width="100" align="right">
              <template #cell="{ record }"> ${{ formatNumber(record.amount) }} </template>
            </a-table-column>
            <a-table-column :title="t('startDate', '生效日期')" data-index="startDate" :width="110">
              <template #cell="{ record }">{{ formatDate(record.startDate) || '-' }}</template>
            </a-table-column>
            <a-table-column :title="t('expiryDate', '到期日期')" data-index="expiryDate" :width="110">
              <template #cell="{ record }">
                <span :class="isExpiringSoon(record.expiryDate) ? 'text-red-500 font-semibold' : ''">
                  {{ formatDate(record.expiryDate) || '-' }}
                </span>
              </template>
            </a-table-column>
            <a-table-column :title="t('status', '狀態')" data-index="status" :width="90">
              <template #cell="{ record }">
                <a-tag :color="insuranceStatusColorMap[record.status]">{{ insuranceStatusMap[record.status] || record.status }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('actions', '操作')" :width="80" align="center">
              <template #cell="{ record }">
                <a-button-group size="mini">
                  <a-button @click="openInsuranceDialog(record)"><icon-edit /></a-button>
                  <a-button status="danger" @click="deleteInsurance(record.insuranceId)"><icon-delete /></a-button>
                </a-button-group>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <div class="mt-4 flex justify-end">
          <a-pagination :current="insurancePagination.page" :page-size="insurancePagination.limit" :total="insurancePagination.total" show-total @change="onInsurancePageChange" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--      保養記錄彈窗          -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="maintenanceDialogVisible" :title="maintenanceForm.id ? t('editMaintenance', '編輯保養記錄') : t('addMaintenance', '新增保養記錄')" :width="550" :mask-closable="false">
    <a-form ref="maintenanceFormRef" :model="maintenanceForm" :rules="maintenanceFormRules" layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <a-form-item :label="t('maintenanceType', '保養類型')" field="type">
          <a-select v-model="maintenanceForm.type" :placeholder="t('pleaseSelect', '請選擇')">
            <a-option v-for="opt in maintenanceTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('cost', '費用')" field="cost">
          <a-input-number v-model="maintenanceForm.cost" :min="0" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('performedBy', '執行者/廠商')" field="performedBy" class="col-span-2">
          <a-input v-model="maintenanceForm.performedBy" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('scheduledDate', '預定日期')" field="scheduledDate">
          <a-date-picker v-model="maintenanceForm.scheduledDate" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('completedDate', '完成日期')" field="completedDate">
          <a-date-picker v-model="maintenanceForm.completedDate" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('mileageAtService', '保養時里程 (km)')" field="mileageAtService">
          <a-input-number v-model="maintenanceForm.mileageAtService" :min="0" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('nextServiceMileage', '下次保養里程 (km)')" field="nextServiceMileage">
          <a-input-number v-model="maintenanceForm.nextServiceMileage" :min="0" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('description', '保養說明')" field="description" class="col-span-2">
          <a-textarea v-model="maintenanceForm.description" :placeholder="t('pleaseEnter', '請輸入')" :auto-size="{ minRows: 2 }" />
        </a-form-item>
        <a-form-item :label="t('notes', '備註')" field="notes" class="col-span-2">
          <a-textarea v-model="maintenanceForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :auto-size="{ minRows: 2 }" />
        </a-form-item>
      </div>
    </a-form>
    <template #footer>
      <a-button @click="maintenanceDialogVisible = false">{{ t('cancel', '取消') }}</a-button>
      <a-button type="primary" :loading="maintenanceSaving" @click="saveMaintenance">{{ t('save', '儲存') }}</a-button>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--      維修記錄彈窗          -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="repairDialogVisible" :title="repairForm.id ? t('editRepair', '編輯維修記錄') : t('addRepair', '新增維修記錄')" :width="550" :mask-closable="false">
    <a-form ref="repairFormRef" :model="repairForm" :rules="repairFormRules" layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <a-form-item :label="t('repairType', '維修類型')" field="type">
          <a-select v-model="repairForm.type" :placeholder="t('pleaseSelect', '請選擇')">
            <a-option v-for="opt in repairTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('severity', '嚴重程度')" field="severity">
          <a-select v-model="repairForm.severity" :placeholder="t('pleaseSelect', '請選擇')">
            <a-option v-for="opt in severityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('status', '維修狀態')" field="status">
          <a-select v-model="repairForm.status" :placeholder="t('pleaseSelect', '請選擇')">
            <a-option v-for="opt in repairStatusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('cost', '費用')" field="cost">
          <a-input-number v-model="repairForm.cost" :min="0" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('performedBy', '執行者/廠商')" field="performedBy" class="col-span-2">
          <a-input v-model="repairForm.performedBy" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('reportedDate', '報修日期')" field="reportedDate">
          <a-date-picker v-model="repairForm.reportedDate" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('completedDate', '完成日期')" field="completedDate">
          <a-date-picker v-model="repairForm.completedDate" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('laborHours', '工時')" field="laborHours">
          <a-input-number v-model="repairForm.laborHours" :min="0" :precision="1" :placeholder="t('pleaseEnter', '請輸入')" />
        </a-form-item>
        <a-form-item :label="t('description', '維修說明')" field="description" class="col-span-2">
          <a-textarea v-model="repairForm.description" :placeholder="t('pleaseEnter', '請輸入')" :auto-size="{ minRows: 2 }" />
        </a-form-item>
        <a-form-item :label="t('notes', '備註')" field="notes" class="col-span-2">
          <a-textarea v-model="repairForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :auto-size="{ minRows: 2 }" />
        </a-form-item>
      </div>
    </a-form>
    <template #footer>
      <a-button @click="repairDialogVisible = false">{{ t('cancel', '取消') }}</a-button>
      <a-button type="primary" :loading="repairSaving" @click="saveRepair">{{ t('save', '儲存') }}</a-button>
    </template>
  </a-modal>

  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <!--      保險記錄彈窗          -->
  <!--＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝-->
  <a-modal v-model:visible="insuranceDialogVisible" :title="insuranceForm.insuranceId ? t('editInsurance', '編輯保險記錄') : t('addInsurance', '新增保險記錄')" :width="600" :mask-closable="false">
    <a-form ref="insuranceFormRef" :model="insuranceForm" :rules="insuranceFormRules" layout="vertical">
      <div class="grid grid-cols-2 gap-4">
        <a-form-item :label="t('insurer', '保險公司')" field="insurer" class="col-span-2">
          <CustomField v-model="insuranceForm.insurer" type="input" />
        </a-form-item>
        <a-form-item :label="t('policyNumber', '保單號碼')" field="policyNumber">
          <CustomField v-model="insuranceForm.policyNumber" type="input" />
        </a-form-item>
        <a-form-item :label="t('insuranceType', '保險類型')" field="insuranceType">
          <a-select v-model="insuranceForm.insuranceType" :placeholder="t('optional', '選填')" allow-clear>
            <a-option v-for="opt in insuranceTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('startDate', '生效日期')" field="startDate">
          <CustomField v-model="insuranceForm.startDate" type="date-picker" />
        </a-form-item>
        <a-form-item :label="t('expiryDate', '到期日期')" field="expiryDate">
          <CustomField v-model="insuranceForm.expiryDate" type="date-picker" />
        </a-form-item>
        <a-form-item :label="t('amount', '保費金額')" field="amount" class="col-span-2">
          <CustomField v-model="insuranceForm.amount" type="number" :min="0" thousands />
        </a-form-item>
        <a-form-item :label="t('notes', '備註')" field="notes" class="col-span-2">
          <CustomField v-model="insuranceForm.notes" type="textarea" />
        </a-form-item>
      </div>
    </a-form>
    <template #footer>
      <a-button @click="insuranceDialogVisible = false">{{ t('cancel', '取消') }}</a-button>
      <a-button type="primary" :loading="insuranceSaving" @click="saveInsurance">{{ t('save', '儲存') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';
import { useMainStore } from '@/stores/LoadingStore';
import {
  VehicleMaintenanceHistoryGet,
  VehicleMaintenanceCreatePost,
  VehicleMaintenanceUpdatePut,
  VehicleMaintenanceDeleteById,
  VehicleRepairHistoryGet,
  VehicleRepairCreatePost,
  VehicleRepairUpdatePut,
  VehicleRepairDeleteById,
  VehicleTripHistoryGet,
  VehicleInsuranceHistoryGet,
  VehicleInsuranceCreatePost,
  VehicleInsuranceUpdatePatch,
  VehicleInsuranceDeleteById,
} from '@/assets/API/Vehicle';
import CustomField from '@/components/Form/CustomField.vue';

const { t } = useI18n();
const mainStore = useMainStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  vehicle: { type: Object, default: null },
});
const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const activeTab = ref('maintenance');

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.vehicle) {
      activeTab.value = 'maintenance';
      // 重置分頁狀態
      maintenancePagination.value = { page: 1, limit: 20, total: 0 };
      repairPagination.value = { page: 1, limit: 20, total: 0 };
      tripPagination.value = { page: 1, limit: 20, total: 0 };
      insurancePagination.value = { page: 1, limit: 20, total: 0 };
      // 載入資料
      fetchMaintenanceHistory();
      fetchRepairHistory();
      fetchTripHistory();
      fetchInsuranceHistory();
    }
  },
);

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleClose = () => {
  visible.value = false;
};

/** 工具函式 **/
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-TW');
};
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString();
};
const parseAddress = (address) => {
  if (!address) return '-';
  try {
    const parsed = typeof address === 'string' ? JSON.parse(address) : address;
    return parsed.fullAddress || parsed.address || `${parsed.city || ''}${parsed.district || ''}${parsed.street || ''}`;
  } catch {
    return address;
  }
};

/** 選項定義 **/
const maintenanceTypeOptions = [
  { label: t('maintenanceOilChange', '換機油'), value: 'OIL_CHANGE' },
  { label: t('maintenanceTireRotation', '輪胎調換'), value: 'TIRE_ROTATION' },
  { label: t('maintenanceBrakeService', '煞車保養'), value: 'BRAKE_SERVICE' },
  { label: t('maintenanceFilterChange', '濾芯更換'), value: 'FILTER_CHANGE' },
  { label: t('maintenanceFluidCheck', '油液檢查'), value: 'FLUID_CHECK' },
  { label: t('maintenanceInspection', '定期檢查'), value: 'INSPECTION' },
  { label: t('maintenanceTuneUp', '引擎調校'), value: 'TUNE_UP' },
  { label: t('maintenanceOther', '其他'), value: 'OTHER' },
];
const maintenanceTypeMap = Object.fromEntries(maintenanceTypeOptions.map((o) => [o.value, o.label]));

const repairTypeOptions = [
  { label: t('repairEngine', '引擎'), value: 'ENGINE' },
  { label: t('repairTransmission', '變速箱'), value: 'TRANSMISSION' },
  { label: t('repairBrake', '煞車系統'), value: 'BRAKE' },
  { label: t('repairSuspension', '懸吊系統'), value: 'SUSPENSION' },
  { label: t('repairElectrical', '電氣系統'), value: 'ELECTRICAL' },
  { label: t('repairCooling', '冷卻系統'), value: 'COOLING' },
  { label: t('repairExhaust', '排氣系統'), value: 'EXHAUST' },
  { label: t('repairBody', '車身'), value: 'BODY' },
  { label: t('repairInterior', '內裝'), value: 'INTERIOR' },
  { label: t('repairTire', '輪胎'), value: 'TIRE' },
  { label: t('repairOther', '其他'), value: 'OTHER' },
];
const repairTypeMap = Object.fromEntries(repairTypeOptions.map((o) => [o.value, o.label]));

const severityOptions = [
  { label: t('severityLow', '輕微'), value: 'LOW' },
  { label: t('severityMedium', '中等'), value: 'MEDIUM' },
  { label: t('severityHigh', '嚴重'), value: 'HIGH' },
  { label: t('severityCritical', '緊急'), value: 'CRITICAL' },
];
const severityMap = Object.fromEntries(severityOptions.map((o) => [o.value, o.label]));
const severityColorMap = { LOW: 'green', MEDIUM: 'orange', HIGH: 'red', CRITICAL: 'magenta' };

const repairStatusOptions = [
  { label: t('repairStatusPending', '待處理'), value: 'PENDING' },
  { label: t('repairStatusInProgress', '進行中'), value: 'IN_PROGRESS' },
  { label: t('repairStatusCompleted', '已完成'), value: 'COMPLETED' },
  { label: t('repairStatusCancelled', '已取消'), value: 'CANCELLED' },
];
const repairStatusMap = Object.fromEntries(repairStatusOptions.map((o) => [o.value, o.label]));
const repairStatusColorMap = { PENDING: 'orange', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'gray' };

const orderStatusMap = {
  DRAFT: '草稿',
  PENDING: '待處理',
  CONFIRMED: '已確認',
  PROCESSING: '處理中',
  SHIPPED: '已出貨',
  DELIVERED: '已送達',
  CANCELLED: '已取消',
  RETURNED: '已退貨',
};
const orderStatusColorMap = {
  DRAFT: 'gray',
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PROCESSING: 'arcoblue',
  SHIPPED: 'cyan',
  DELIVERED: 'green',
  CANCELLED: 'red',
  RETURNED: 'magenta',
};

const insuranceTypeOptions = [
  { label: t('insuranceTypeThirdParty', '第三責任險'), value: 'THIRD_PARTY' },
  { label: t('insuranceTypeComprehensive', '全險'), value: 'COMPREHENSIVE' },
  { label: t('insuranceTypeOther', '其他'), value: 'OTHER' },
];
const insuranceTypeMap = Object.fromEntries(insuranceTypeOptions.map((o) => [o.value, o.label]));

const insuranceStatusMap = {
  ACTIVE: t('insuranceStatusActive', '有效'),
  EXPIRED: t('insuranceStatusExpired', '已到期'),
  CANCELLED: t('insuranceStatusCancelled', '已取消'),
};
const insuranceStatusColorMap = { ACTIVE: 'green', EXPIRED: 'red', CANCELLED: 'gray' };

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const diff = new Date(expiryDate) - new Date();
  return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000; // 30 天內到期
};

/** 保養記錄 **/
const maintenanceList = ref([]);
const maintenanceLoading = ref(false);
const maintenancePagination = ref({ page: 1, limit: 20, total: 0 });
const maintenanceDialogVisible = ref(false);
const maintenanceSaving = ref(false);
const maintenanceFormRef = ref(null);
const maintenanceForm = ref({
  id: null, //記錄 ID
  type: 'OIL_CHANGE', //保養類型
  description: '', //保養說明
  cost: 0, //費用金額
  performedBy: '', //執行者/廠商
  scheduledDate: null, //預定日期
  completedDate: null, //完成日期
  mileageAtService: null, //保養時里程
  nextServiceMileage: null, //下次保養里程
  notes: '', //備註
});
const maintenanceFormRules = {
  type: [{ required: true, message: t('required', '此欄位必填') }],
  description: [{ required: true, message: t('required', '此欄位必填') }],
  cost: [{ required: true, message: t('required', '此欄位必填') }],
  performedBy: [{ required: true, message: t('required', '此欄位必填') }],
};

const fetchMaintenanceHistory = async () => {
  if (!props.vehicle?.id) return;
  maintenanceLoading.value = true;
  try {
    const { page, limit } = maintenancePagination.value;
    const res = await VehicleMaintenanceHistoryGet(props.vehicle.id, { page, limit });
    const responseData = res.data?.data || {};
    maintenanceList.value = responseData.data || [];
    maintenancePagination.value.total = responseData.meta?.total || 0;
  } catch (error) {
    console.error('Failed to fetch maintenance history:', error);
    maintenanceList.value = [];
  } finally {
    maintenanceLoading.value = false;
  }
};

const onMaintenancePageChange = (page) => {
  maintenancePagination.value.page = page;
  fetchMaintenanceHistory();
};

const openMaintenanceDialog = (record = null) => {
  if (record) {
    maintenanceForm.value = {
      id: record.id,
      type: record.type,
      description: record.description,
      cost: Number(record.costAmount) || 0,
      performedBy: record.performedBy,
      scheduledDate: record.scheduledDate,
      completedDate: record.completedDate,
      mileageAtService: record.mileageAtService,
      nextServiceMileage: record.nextServiceMileage,
      notes: record.notes || '',
    };
  } else {
    maintenanceForm.value = {
      id: null,
      type: 'OIL_CHANGE',
      description: '',
      cost: 0,
      performedBy: '',
      scheduledDate: null,
      completedDate: null,
      mileageAtService: null,
      nextServiceMileage: null,
      notes: '',
    };
  }
  maintenanceDialogVisible.value = true;
};

const saveMaintenance = async () => {
  const valid = await maintenanceFormRef.value?.validate();
  if (valid) return;

  maintenanceSaving.value = true;
  try {
    const payload = {
      type: maintenanceForm.value.type,
      description: maintenanceForm.value.description,
      cost: maintenanceForm.value.cost,
      performedBy: maintenanceForm.value.performedBy,
      scheduledDate: maintenanceForm.value.scheduledDate,
      completedDate: maintenanceForm.value.completedDate,
      mileageAtService: maintenanceForm.value.mileageAtService,
      nextServiceMileage: maintenanceForm.value.nextServiceMileage,
      notes: maintenanceForm.value.notes,
    };

    if (maintenanceForm.value.id) {
      await VehicleMaintenanceUpdatePut(props.vehicle.id, maintenanceForm.value.id, payload);
    } else {
      await VehicleMaintenanceCreatePost(props.vehicle.id, payload);
    }
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    maintenanceDialogVisible.value = false;
    await fetchMaintenanceHistory();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    maintenanceSaving.value = false;
  }
};

const deleteMaintenance = async (id) => {
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await VehicleMaintenanceDeleteById(props.vehicle.id, id);
        await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
        await fetchMaintenanceHistory();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
};

/** 維修記錄 **/
const repairList = ref([]);
const repairLoading = ref(false);
const repairPagination = ref({ page: 1, limit: 20, total: 0 });
const repairDialogVisible = ref(false);
const repairSaving = ref(false);
const repairFormRef = ref(null);
const repairForm = ref({
  id: null, //記錄 ID
  type: 'ENGINE', //維修類型
  description: '', //維修說明
  severity: 'MEDIUM', //嚴重程度 (LOW/MEDIUM/HIGH/CRITICAL)
  status: 'PENDING', //維修狀態 (PENDING/IN_PROGRESS/COMPLETED/CANCELLED)
  cost: 0, //費用金額
  performedBy: '', //執行者/廠商
  reportedDate: null, //報修日期
  completedDate: null, //完成日期
  laborHours: null, //工時
  notes: '', //備註
});
const repairFormRules = {
  type: [{ required: true, message: t('required', '此欄位必填') }],
  description: [{ required: true, message: t('required', '此欄位必填') }],
  cost: [{ required: true, message: t('required', '此欄位必填') }],
  performedBy: [{ required: true, message: t('required', '此欄位必填') }],
  reportedDate: [{ required: true, message: t('required', '此欄位必填') }],
};

const fetchRepairHistory = async () => {
  if (!props.vehicle?.id) return;
  repairLoading.value = true;
  try {
    const { page, limit } = repairPagination.value;
    const res = await VehicleRepairHistoryGet(props.vehicle.id, { page, limit });
    const responseData = res.data?.data || {};
    repairList.value = responseData.data || [];
    repairPagination.value.total = responseData.meta?.total || 0;
  } catch (error) {
    console.error('Failed to fetch repair history:', error);
    repairList.value = [];
  } finally {
    repairLoading.value = false;
  }
};

const onRepairPageChange = (page) => {
  repairPagination.value.page = page;
  fetchRepairHistory();
};

const openRepairDialog = (record = null) => {
  if (record) {
    repairForm.value = {
      id: record.id,
      type: record.type,
      description: record.description,
      severity: record.severity || 'MEDIUM',
      status: record.status || 'PENDING',
      cost: Number(record.costAmount) || 0,
      performedBy: record.performedBy,
      reportedDate: record.reportedDate,
      completedDate: record.completedDate,
      laborHours: record.laborHours ? Number(record.laborHours) : null,
      notes: record.notes || '',
    };
  } else {
    repairForm.value = {
      id: null,
      type: 'ENGINE',
      description: '',
      severity: 'MEDIUM',
      status: 'PENDING',
      cost: 0,
      performedBy: '',
      reportedDate: new Date().toISOString(),
      completedDate: null,
      laborHours: null,
      notes: '',
    };
  }
  repairDialogVisible.value = true;
};

const saveRepair = async () => {
  const valid = await repairFormRef.value?.validate();
  if (valid) return;

  repairSaving.value = true;
  try {
    const payload = {
      type: repairForm.value.type,
      description: repairForm.value.description,
      severity: repairForm.value.severity,
      status: repairForm.value.status,
      cost: repairForm.value.cost,
      performedBy: repairForm.value.performedBy,
      reportedDate: repairForm.value.reportedDate,
      completedDate: repairForm.value.completedDate,
      laborHours: repairForm.value.laborHours,
      notes: repairForm.value.notes,
    };

    if (repairForm.value.id) {
      await VehicleRepairUpdatePut(props.vehicle.id, repairForm.value.id, payload);
    } else {
      await VehicleRepairCreatePost(props.vehicle.id, payload);
    }
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    repairDialogVisible.value = false;
    await fetchRepairHistory();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    repairSaving.value = false;
  }
};

const deleteRepair = async (id) => {
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await VehicleRepairDeleteById(props.vehicle.id, id);
        await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
        await fetchRepairHistory();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
};

/** 行程記錄 **/
const tripList = ref([]);
const tripLoading = ref(false);
const tripPagination = ref({ page: 1, limit: 20, total: 0 });

const fetchTripHistory = async () => {
  if (!props.vehicle?.id) return;
  tripLoading.value = true;
  try {
    const { page, limit } = tripPagination.value;
    const res = await VehicleTripHistoryGet(props.vehicle.id, { page, limit });
    const responseData = res.data?.data || {};
    tripList.value = responseData.data || [];
    tripPagination.value.total = responseData.meta?.total || 0;
  } catch (error) {
    console.error('Failed to fetch trip history:', error);
    tripList.value = [];
  } finally {
    tripLoading.value = false;
  }
};

const onTripPageChange = (page) => {
  tripPagination.value.page = page;
  fetchTripHistory();
};

/** 保險記錄 **/
const insuranceList = ref([]);
const insuranceLoading = ref(false);
const insurancePagination = ref({ page: 1, limit: 20, total: 0 });
const insuranceDialogVisible = ref(false);
const insuranceSaving = ref(false);
const insuranceFormRef = ref(null);
const insuranceForm = ref({
  insuranceId: null, //記錄 ID
  insurer: '', //保險公司名稱
  policyNumber: '', //保單號碼
  insuranceType: null, //保險類型
  startDate: null, //生效日期
  expiryDate: null, //到期日期
  amount: 0, //保費金額
  notes: '', //備註
});
const insuranceFormRules = {
  insurer: [{ required: true, message: t('required', '此欄位必填') }],
  startDate: [{ required: true, message: t('required', '此欄位必填') }],
  expiryDate: [{ required: true, message: t('required', '此欄位必填') }],
  amount: [{ required: true, message: t('required', '此欄位必填') }],
};

const fetchInsuranceHistory = async () => {
  if (!props.vehicle?.id) return;
  insuranceLoading.value = true;
  try {
    const { page, limit } = insurancePagination.value;
    const res = await VehicleInsuranceHistoryGet(props.vehicle.id, { page, limit });
    const responseData = res.data?.data || {};
    insuranceList.value = responseData.data || [];
    insurancePagination.value.total = responseData.meta?.total || responseData.total || 0;
  } catch (error) {
    console.error('Failed to fetch insurance history:', error);
    insuranceList.value = [];
  } finally {
    insuranceLoading.value = false;
  }
};

const onInsurancePageChange = (page) => {
  insurancePagination.value.page = page;
  fetchInsuranceHistory();
};

const openInsuranceDialog = (record = null) => {
  if (record) {
    insuranceForm.value = {
      insuranceId: record.insuranceId,
      insurer: record.insurer,
      policyNumber: record.policyNumber || '',
      insuranceType: record.insuranceType || null,
      startDate: record.startDate,
      expiryDate: record.expiryDate,
      amount: Number(record.amount) || 0,
      notes: record.notes || '',
    };
  } else {
    insuranceForm.value = {
      insuranceId: null,
      insurer: '',
      policyNumber: '',
      insuranceType: null,
      startDate: null,
      expiryDate: null,
      amount: 0,
      notes: '',
    };
  }
  insuranceDialogVisible.value = true;
};

const saveInsurance = async () => {
  const valid = await insuranceFormRef.value?.validate();
  if (valid) return;

  insuranceSaving.value = true;
  try {
    const payload = {
      insurer: insuranceForm.value.insurer,
      policyNumber: insuranceForm.value.policyNumber || undefined,
      insuranceType: insuranceForm.value.insuranceType || undefined,
      startDate: insuranceForm.value.startDate,
      expiryDate: insuranceForm.value.expiryDate,
      amount: insuranceForm.value.amount,
      notes: insuranceForm.value.notes || undefined,
    };

    if (insuranceForm.value.insuranceId) {
      await VehicleInsuranceUpdatePatch(props.vehicle.id, insuranceForm.value.insuranceId, payload);
    } else {
      await VehicleInsuranceCreatePost(props.vehicle.id, payload);
    }
    await mainStore.SWAL_Success(t('saveSuccess', '儲存成功'));
    insuranceDialogVisible.value = false;
    await fetchInsuranceHistory();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    insuranceSaving.value = false;
  }
};

const deleteInsurance = async (insuranceId) => {
  await mainStore.SWAL_DeleteConfirm({
    onConfirm: async () => {
      try {
        await VehicleInsuranceDeleteById(props.vehicle.id, insuranceId);
        await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
        await fetchInsuranceHistory();
      } catch (error) {
        await mainStore.SWAL_Error(error);
      }
    },
  });
};
</script>
