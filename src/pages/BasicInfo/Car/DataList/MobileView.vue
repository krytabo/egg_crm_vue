<!-- src/pages/BasicInfo/Car/DataList/MobileView.vue 車輛管理（手機版） -->
<template>
  <ion-page>
    <!-- 頂部導航列 -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('vehicleList', '車輛列表') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="permissionStore.hasPermission('VEHICLE', 'CREATE')" fill="clear" @click="openCreateDialog">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 統計卡片區 -->
      <ion-card class="summary-card">
        <ion-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">{{ t('totalCount', '總筆數') }}</span>
              <span class="summary-value">{{ pagination.total }} {{ t('count', '筆') }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 搜尋區 -->
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-searchbar
            :value="filters.search"
            :placeholder="t('searchVehiclePlaceholder', '搜尋車牌、品牌、型號')"
            @ionInput="filters.search = $event.detail.value"
            @ionClear="handleClearSearch"
            debounce="500"
          />
          <div class="filter-actions">
            <ion-button size="small" fill="outline" color="danger" @click="clearFilter">
              {{ t('clearFilter', '清除篩選') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- 車輛列表 -->
      <ion-list class="vehicle-list">
        <ion-item-sliding v-for="item in basicDataList" :key="item.id">
          <ion-item button @click="editData(item)">
            <ion-label>
              <h2>{{ item.licensePlate }}</h2>
              <p>{{ item.brand }} - {{ item.model }} <span v-if="item.year">({{ item.year }})</span></p>
              <p class="text-sm text-gray-500">
                {{ fuelTypeMap[item.fuelType] || item.fuelType || '-' }} · {{ item.assignedDriver?.name || t('unassigned', '未指派') }}
              </p>
            </ion-label>
            <ion-chip :color="getStatusColor(item.status)" slot="end" size="small">
              {{ statusMap[item.status] || item.status }}
            </ion-chip>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'READ')" color="secondary" @click="openDetailModal(item)">
              <ion-icon slot="icon-only" :icon="documentTextOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" color="tertiary" @click="openDriverDialog(item)">
              <ion-icon slot="icon-only" :icon="personOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" color="primary" @click="editData(item)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option v-if="permissionStore.hasPermission('VEHICLE', 'DELETE')" color="danger" @click="handleDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <!-- 空狀態 -->
        <ion-item v-if="!basicDataList.length && !loading" class="empty-state">
          <ion-label class="ion-text-center">
            <ion-icon :icon="carOutline" size="large" color="medium" />
            <p>{{ t('noVehicles', '尚無車輛資料') }}</p>
          </ion-label>
        </ion-item>

        <!-- 載入中 -->
        <ion-item v-if="loading && !basicDataList.length">
          <ion-label class="ion-text-center">
            <ion-spinner name="crescent" />
            <p>{{ t('loading', '載入中...') }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- 無限捲動 -->
      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!hasMore || loading">
        <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="t('loading', '載入中...')" />
      </ion-infinite-scroll>

      <!-- 沒有更多資料提示 -->
      <div v-if="noMoreData && basicDataList.length > 0" class="no-more-data">
        <p>{{ t('noMoreData', '沒有更多資料了') }}</p>
      </div>

      <!-- 底部留白 -->
      <div class="bottom-spacer"></div>
    </ion-content>

    <!-- 新增/編輯 Modal -->
    <ion-modal :is-open="dialogVisible" @didDismiss="closeDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ isCreate ? t('addVehicle', '新增車輛') : t('editVehicle', '編輯車輛') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveData" :disabled="isSaving">
              {{ isSaving ? t('saving', '儲存中') : t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <!-- 基本資訊 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('basicInfo', '基本資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('licensePlate', '車牌號碼') }} *</ion-label>
              <ion-input v-model="basicForm.licensePlate" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('make', '品牌') }} *</ion-label>
              <ion-input v-model="basicForm.make" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('model', '型號') }} *</ion-label>
              <ion-input v-model="basicForm.model" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('year', '出廠年份') }} *</ion-label>
              <ion-input v-model="basicForm.year" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 車輛規格 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('vehicleSpecs', '車輛規格') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('vin', '車身號碼') }}</ion-label>
              <ion-input v-model="basicForm.vin" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('engineNumber', '引擎號碼') }}</ion-label>
              <ion-input v-model="basicForm.engineNumber" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
            <ion-item button @click="openFuelTypePicker">
              <ion-label>{{ t('fuelType', '燃料類型') }}</ion-label>
              <ion-note slot="end">{{ fuelTypeMap[basicForm.fuelType] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ t('capacity', '載重量 (kg)') }}</ion-label>
              <ion-input v-model="basicForm.capacity" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
            </ion-item>
          </ion-item-group>

          <!-- 狀態 (編輯時顯示) -->
          <ion-item-group v-if="isEdite">
            <ion-item-divider>
              <ion-label>{{ t('statusInfo', '狀態資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item button @click="openStatusPicker">
              <ion-label>{{ t('status', '狀態') }}</ion-label>
              <ion-note slot="end">{{ statusMap[basicForm.status] || t('pleaseSelect', '請選擇') }}</ion-note>
            </ion-item>
          </ion-item-group>

          <!-- 備註 -->
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('otherInfo', '其他資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
              <ion-textarea v-model="basicForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 燃料類型選擇 Modal -->
    <ion-modal :is-open="fuelTypePickerVisible" @didDismiss="closeFuelTypePicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeFuelTypePicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectFuelType', '選擇燃料類型') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in fuelTypeOptions" :key="option.value" button @click="selectFuelType(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.fuelType === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 狀態選擇 Modal -->
    <ion-modal :is-open="statusPickerVisible" @didDismiss="closeStatusPicker">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeStatusPicker">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('selectStatus', '選擇狀態') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="option in statusOptions" :key="option.value" button @click="selectStatus(option.value)">
            <ion-label>{{ option.label }}</ion-label>
            <ion-icon v-if="basicForm.status === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 指派司機 Modal -->
    <ion-modal :is-open="driverDialogVisible" @didDismiss="closeDriverDialog">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDriverDialog">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('assignDriver', '指派司機') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="assignDriver" :disabled="isAssigning || !selectedDriverId">
              {{ isAssigning ? t('assigning', '指派中') : t('confirm', '確認') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('vehicleInfo', '車輛資訊') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>
                <h2>{{ selectedVehicle?.licensePlate }}</h2>
                <p>{{ selectedVehicle?.brand }} - {{ selectedVehicle?.model }}</p>
              </ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ t('selectDriver', '選擇司機') }}</ion-label>
            </ion-item-divider>
            <ion-item v-for="driver in driverList" :key="driver.id" button @click="selectedDriverId = driver.id">
              <ion-label>{{ driver.name }}</ion-label>
              <ion-icon v-if="selectedDriverId === driver.id" :icon="checkmarkOutline" slot="end" color="primary" />
            </ion-item>
            <ion-item v-if="!driverList.length">
              <ion-label color="medium">{{ t('noDrivers', '尚無可用司機') }}</ion-label>
            </ion-item>
          </ion-item-group>

          <!-- 目前指派的司機 -->
          <ion-item-group v-if="selectedVehicle?.assignedDriver">
            <ion-item-divider>
              <ion-label>{{ t('currentDriver', '目前指派司機') }}</ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-label>
                <h3>{{ selectedVehicle.assignedDriver.name }}</h3>
              </ion-label>
              <ion-button slot="end" fill="clear" color="warning" @click="handleUnassignDriver">
                {{ t('unassignDriver', '解除指派') }}
              </ion-button>
            </ion-item>
          </ion-item-group>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 車輛詳細資料 Modal -->
    <ion-modal :is-open="detailModalVisible" @didDismiss="closeDetailModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeDetailModal">
              <ion-icon slot="icon-only" :icon="closeOutline" />
            </ion-button>
          </ion-buttons>
          <ion-title>{{ detailVehicle?.licensePlate }} {{ t('detail', '詳細資料') }}</ion-title>
        </ion-toolbar>
        <!-- Tab 切換 -->
        <ion-toolbar>
          <ion-segment :value="detailTab" @ionChange="onDetailTabChange">
            <ion-segment-button value="maintenance">
              <ion-icon :icon="buildOutline" />
              <ion-label>{{ t('maintenance', '保養') }}</ion-label>
            </ion-segment-button>
            <ion-segment-button value="repair">
              <ion-icon :icon="constructOutline" />
              <ion-label>{{ t('repair', '維修') }}</ion-label>
            </ion-segment-button>
            <ion-segment-button value="trip">
              <ion-icon :icon="mapOutline" />
              <ion-label>{{ t('trip', '行程') }}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <!-- 保養記錄 Tab -->
        <div v-if="detailTab === 'maintenance'">
          <ion-list v-if="!maintenanceLoading && maintenanceList.length > 0">
            <ion-item-sliding v-for="item in maintenanceList" :key="item.id">
              <ion-item>
                <ion-label>
                  <h2>{{ maintenanceTypeMap[item.type] || item.type }}</h2>
                  <p>{{ item.description || '-' }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(item.completedDate || item.scheduledDate) }}
                    <span v-if="item.cost"> · NT$ {{ item.cost }}</span>
                    <span v-if="item.performedBy"> · {{ item.performedBy }}</span>
                  </p>
                </ion-label>
              </ion-item>
              <ion-item-options side="end">
                <ion-item-option color="danger" @click="deleteMaintenance(item.id)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
          <div v-else-if="maintenanceLoading" class="loading-state">
            <ion-spinner name="crescent" />
            <p>{{ t('loading', '載入中...') }}</p>
          </div>
          <div v-else class="empty-state-detail">
            <ion-icon :icon="buildOutline" size="large" color="medium" />
            <p>{{ t('noMaintenanceRecords', '尚無保養記錄') }}</p>
          </div>
          <!-- 新增保養按鈕 -->
          <ion-fab v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button @click="openAddMaintenance">
              <ion-icon :icon="addOutline" />
            </ion-fab-button>
          </ion-fab>
        </div>

        <!-- 維修記錄 Tab -->
        <div v-if="detailTab === 'repair'">
          <ion-list v-if="!repairLoading && repairList.length > 0">
            <ion-item-sliding v-for="item in repairList" :key="item.id">
              <ion-item>
                <ion-label>
                  <h2>
                    {{ repairTypeMap[item.type] || item.type }}
                    <ion-badge :color="getSeverityColor(item.severity)" class="ml-2">{{ repairSeverityMap[item.severity] || item.severity }}</ion-badge>
                  </h2>
                  <p>{{ item.description || '-' }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(item.completedDate || item.reportedDate) }}
                    <span v-if="item.cost"> · NT$ {{ item.cost }}</span>
                  </p>
                </ion-label>
                <ion-chip :color="getRepairStatusColor(item.status)" slot="end" size="small">
                  {{ repairStatusMap[item.status] || item.status }}
                </ion-chip>
              </ion-item>
              <ion-item-options side="end">
                <ion-item-option color="danger" @click="deleteRepair(item.id)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
          <div v-else-if="repairLoading" class="loading-state">
            <ion-spinner name="crescent" />
            <p>{{ t('loading', '載入中...') }}</p>
          </div>
          <div v-else class="empty-state-detail">
            <ion-icon :icon="constructOutline" size="large" color="medium" />
            <p>{{ t('noRepairRecords', '尚無維修記錄') }}</p>
          </div>
          <!-- 新增維修按鈕 -->
          <ion-fab v-if="permissionStore.hasPermission('VEHICLE', 'UPDATE')" vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button @click="openAddRepair">
              <ion-icon :icon="addOutline" />
            </ion-fab-button>
          </ion-fab>
        </div>

        <!-- 行程記錄 Tab -->
        <div v-if="detailTab === 'trip'">
          <ion-list v-if="!tripLoading && tripList.length > 0">
            <ion-item v-for="item in tripList" :key="item.id">
              <ion-label>
                <h2>{{ item.orderNumber || `#${item.id}` }}</h2>
                <p>{{ item.customer?.companyName || item.customer?.name || '-' }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(item.deliveryDate || item.createdAt) }}
                  <span v-if="item.deliveryAddress"> · {{ item.deliveryAddress }}</span>
                </p>
              </ion-label>
            </ion-item>
          </ion-list>
          <div v-else-if="tripLoading" class="loading-state">
            <ion-spinner name="crescent" />
            <p>{{ t('loading', '載入中...') }}</p>
          </div>
          <div v-else class="empty-state-detail">
            <ion-icon :icon="mapOutline" size="large" color="medium" />
            <p>{{ t('noTripRecords', '尚無行程記錄') }}</p>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- 新增保養記錄 Modal -->
    <ion-modal :is-open="addMaintenanceVisible" @didDismiss="closeAddMaintenance">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeAddMaintenance">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('addMaintenance', '新增保養記錄') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveMaintenance" :disabled="!maintenanceForm.type">
              {{ t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-label position="stacked">{{ t('maintenanceType', '保養類型') }} *</ion-label>
            <ion-select v-model="maintenanceForm.type" interface="action-sheet" :placeholder="t('pleaseSelect', '請選擇')">
              <ion-select-option v-for="opt in maintenanceTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('description', '描述') }}</ion-label>
            <ion-textarea v-model="maintenanceForm.description" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('cost', '費用') }}</ion-label>
            <ion-input v-model="maintenanceForm.cost" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('performedBy', '執行人員') }}</ion-label>
            <ion-input v-model="maintenanceForm.performedBy" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
            <ion-textarea v-model="maintenanceForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :rows="2" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- 新增維修記錄 Modal -->
    <ion-modal :is-open="addRepairVisible" @didDismiss="closeAddRepair">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" @click="closeAddRepair">{{ t('cancel', '取消') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('addRepair', '新增維修記錄') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" @click="saveRepair" :disabled="!repairForm.type">
              {{ t('save', '儲存') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-label position="stacked">{{ t('repairType', '維修類型') }} *</ion-label>
            <ion-select v-model="repairForm.type" interface="action-sheet" :placeholder="t('pleaseSelect', '請選擇')">
              <ion-select-option v-for="opt in repairTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('severity', '嚴重度') }}</ion-label>
            <ion-select v-model="repairForm.severity" interface="action-sheet">
              <ion-select-option v-for="opt in repairSeverityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('description', '描述') }}</ion-label>
            <ion-textarea v-model="repairForm.description" :placeholder="t('pleaseEnter', '請輸入')" :rows="3" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('cost', '費用') }}</ion-label>
            <ion-input v-model="repairForm.cost" type="number" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('performedBy', '執行人員') }}</ion-label>
            <ion-input v-model="repairForm.performedBy" :placeholder="t('pleaseEnter', '請輸入')" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{{ t('notes', '備註') }}</ion-label>
            <ion-textarea v-model="repairForm.notes" :placeholder="t('pleaseEnter', '請輸入')" :rows="2" />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonNote,
  IonInput,
  IonTextarea,
  IonChip,
  IonIcon,
  IonSearchbar,
  IonModal,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  alertController,
} from '@ionic/vue';
import { addOutline, createOutline, trashOutline, checkmarkOutline, carOutline, personOutline, documentTextOutline, buildOutline, constructOutline, mapOutline, addCircleOutline, closeOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { usePermissionStore } from '@/stores/PermissionStore';
import { useMainStore } from '@/stores/LoadingStore';
import { useDataList } from './useDataList';
import {
  VehicleMaintenanceHistoryGet,
  VehicleMaintenanceCreatePost,
  VehicleMaintenanceDeleteById,
  VehicleRepairHistoryGet,
  VehicleRepairCreatePost,
  VehicleRepairDeleteById,
  VehicleTripHistoryGet,
} from '@/assets/API/Vehicle';

const { t } = useI18n();
const permissionStore = usePermissionStore();
const mainStore = useMainStore();

// 使用共用邏輯
const {
  statusOptions,
  statusMap,
  fuelTypeOptions,
  fuelTypeMap,
  basicDataList,
  filters,
  pagination,
  getAPI,
  clearFilter: _clearFilter,
  dialogVisible,
  isSaving,
  isCreate,
  isEdite,
  basicForm,
  openCreateDialog,
  editData,
  closeDialog,
  saveData,
  deleteData,
  // 指派司機
  driverDialogVisible,
  selectedVehicle,
  selectedDriverId,
  isAssigning,
  openDriverDialog,
  closeDriverDialog,
  assignDriver,
  unassignDriver,
} = useDataList(t);

// 司機列表（手機版專用，使用 InfiniteSelect 的 drivers dataSource）
const driverList = ref([]);

// ===== 手機版專用狀態 =====
const loading = ref(false);
const hasMore = ref(true);
const noMoreData = computed(() => !hasMore.value && basicDataList.value.length > 0);

// 選擇器狀態
const fuelTypePickerVisible = ref(false);
const statusPickerVisible = ref(false);

const openFuelTypePicker = () => (fuelTypePickerVisible.value = true);
const closeFuelTypePicker = () => (fuelTypePickerVisible.value = false);
const selectFuelType = (value) => {
  basicForm.value.fuelType = value;
  closeFuelTypePicker();
};

const openStatusPicker = () => (statusPickerVisible.value = true);
const closeStatusPicker = () => (statusPickerVisible.value = false);
const selectStatus = (value) => {
  basicForm.value.status = value;
  closeStatusPicker();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'MAINTENANCE':
      return 'warning';
    case 'INACTIVE':
      return 'medium';
    default:
      return 'medium';
  }
};

const clearFilter = () => {
  _clearFilter();
};

const handleClearSearch = () => {
  filters.search = '';
};

// 解除司機指派
const handleUnassignDriver = () => {
  if (selectedVehicle.value?.id) {
    closeDriverDialog();
    unassignDriver(selectedVehicle.value.id);
  }
};

// ===== 車輛詳細資料 Modal =====
const detailModalVisible = ref(false);
const detailVehicle = ref(null);
const detailTab = ref('maintenance');

// 保養記錄
const maintenanceList = ref([]);
const maintenanceLoading = ref(false);
const maintenanceTypeOptions = [
  { label: t('oilChange', '換機油'), value: 'OIL_CHANGE' },
  { label: t('tireRotation', '輪胎調位'), value: 'TIRE_ROTATION' },
  { label: t('brakeService', '煞車保養'), value: 'BRAKE_SERVICE' },
  { label: t('filterChange', '濾芯更換'), value: 'FILTER_CHANGE' },
  { label: t('fluidCheck', '油液檢查'), value: 'FLUID_CHECK' },
  { label: t('inspection', '檢查'), value: 'INSPECTION' },
  { label: t('tuneUp', '調校'), value: 'TUNE_UP' },
  { label: t('other', '其他'), value: 'OTHER' },
];
const maintenanceTypeMap = Object.fromEntries(maintenanceTypeOptions.map((opt) => [opt.value, opt.label]));

// 維修記錄
const repairList = ref([]);
const repairLoading = ref(false);
const repairTypeOptions = [
  { label: t('engine', '引擎'), value: 'ENGINE' },
  { label: t('transmission', '變速箱'), value: 'TRANSMISSION' },
  { label: t('brake', '煞車'), value: 'BRAKE' },
  { label: t('suspension', '懸吊'), value: 'SUSPENSION' },
  { label: t('electrical', '電氣'), value: 'ELECTRICAL' },
  { label: t('cooling', '冷卻系統'), value: 'COOLING' },
  { label: t('exhaust', '排氣系統'), value: 'EXHAUST' },
  { label: t('body', '車身'), value: 'BODY' },
  { label: t('interior', '內裝'), value: 'INTERIOR' },
  { label: t('tire', '輪胎'), value: 'TIRE' },
  { label: t('other', '其他'), value: 'OTHER' },
];
const repairTypeMap = Object.fromEntries(repairTypeOptions.map((opt) => [opt.value, opt.label]));
const repairSeverityOptions = [
  { label: t('low', '低'), value: 'LOW' },
  { label: t('medium', '中'), value: 'MEDIUM' },
  { label: t('high', '高'), value: 'HIGH' },
  { label: t('critical', '嚴重'), value: 'CRITICAL' },
];
const repairSeverityMap = Object.fromEntries(repairSeverityOptions.map((opt) => [opt.value, opt.label]));
const repairStatusOptions = [
  { label: t('pending', '待處理'), value: 'PENDING' },
  { label: t('inProgress', '處理中'), value: 'IN_PROGRESS' },
  { label: t('completed', '已完成'), value: 'COMPLETED' },
  { label: t('cancelled', '已取消'), value: 'CANCELLED' },
];
const repairStatusMap = Object.fromEntries(repairStatusOptions.map((opt) => [opt.value, opt.label]));

// 行程記錄
const tripList = ref([]);
const tripLoading = ref(false);

// 新增保養/維修 Modal
const addMaintenanceVisible = ref(false);
const addRepairVisible = ref(false);
const maintenanceForm = ref({ type: '', description: '', cost: null, performedBy: '', notes: '' });
const repairForm = ref({ type: '', description: '', severity: 'MEDIUM', cost: null, performedBy: '', notes: '' });

const openDetailModal = (vehicle) => {
  detailVehicle.value = vehicle;
  detailTab.value = 'maintenance';
  detailModalVisible.value = true;
  fetchMaintenanceList();
};

const closeDetailModal = () => {
  detailModalVisible.value = false;
  detailVehicle.value = null;
  maintenanceList.value = [];
  repairList.value = [];
  tripList.value = [];
};

const onDetailTabChange = (e) => {
  detailTab.value = e.detail.value;
  if (detailTab.value === 'maintenance') {
    fetchMaintenanceList();
  } else if (detailTab.value === 'repair') {
    fetchRepairList();
  } else if (detailTab.value === 'trip') {
    fetchTripList();
  }
};

// 取得保養記錄
const fetchMaintenanceList = async () => {
  if (!detailVehicle.value?.id) return;
  maintenanceLoading.value = true;
  try {
    const res = await VehicleMaintenanceHistoryGet(detailVehicle.value.id, { page: 1, limit: 50 });
    maintenanceList.value = res.data?.data?.data || res.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch maintenance history:', error);
  } finally {
    maintenanceLoading.value = false;
  }
};

// 取得維修記錄
const fetchRepairList = async () => {
  if (!detailVehicle.value?.id) return;
  repairLoading.value = true;
  try {
    const res = await VehicleRepairHistoryGet(detailVehicle.value.id, { page: 1, limit: 50 });
    repairList.value = res.data?.data?.data || res.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch repair history:', error);
  } finally {
    repairLoading.value = false;
  }
};

// 取得行程記錄
const fetchTripList = async () => {
  if (!detailVehicle.value?.id) return;
  tripLoading.value = true;
  try {
    const res = await VehicleTripHistoryGet(detailVehicle.value.id, { page: 1, limit: 50 });
    tripList.value = res.data?.data?.data || res.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch trip history:', error);
  } finally {
    tripLoading.value = false;
  }
};

// 新增保養記錄
const openAddMaintenance = () => {
  maintenanceForm.value = { type: '', description: '', cost: null, performedBy: '', notes: '' };
  addMaintenanceVisible.value = true;
};
const closeAddMaintenance = () => (addMaintenanceVisible.value = false);
const saveMaintenance = async () => {
  if (!maintenanceForm.value.type) return;
  mainStore.setLoading(true);
  try {
    await VehicleMaintenanceCreatePost(detailVehicle.value.id, maintenanceForm.value);
    await mainStore.SWAL_Success(t('addSuccess', '新增成功'));
    closeAddMaintenance();
    await fetchMaintenanceList();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
};
const deleteMaintenance = async (maintenanceId) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteMaintenanceConfirm', '確定要刪除此保養記錄嗎？'),
    buttons: [
      { text: t('cancel', '取消'), role: 'cancel' },
      {
        text: t('delete', '刪除'),
        role: 'destructive',
        handler: async () => {
          mainStore.setLoading(true);
          try {
            await VehicleMaintenanceDeleteById(detailVehicle.value.id, maintenanceId);
            await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
            await fetchMaintenanceList();
          } catch (error) {
            await mainStore.SWAL_Error(error);
          } finally {
            mainStore.setLoading(false);
          }
        },
      },
    ],
  });
  await alert.present();
};

// 新增維修記錄
const openAddRepair = () => {
  repairForm.value = { type: '', description: '', severity: 'MEDIUM', cost: null, performedBy: '', notes: '' };
  addRepairVisible.value = true;
};
const closeAddRepair = () => (addRepairVisible.value = false);
const saveRepair = async () => {
  if (!repairForm.value.type) return;
  mainStore.setLoading(true);
  try {
    await VehicleRepairCreatePost(detailVehicle.value.id, repairForm.value);
    await mainStore.SWAL_Success(t('addSuccess', '新增成功'));
    closeAddRepair();
    await fetchRepairList();
  } catch (error) {
    await mainStore.SWAL_Error(error);
  } finally {
    mainStore.setLoading(false);
  }
};
const deleteRepair = async (repairId) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteRepairConfirm', '確定要刪除此維修記錄嗎？'),
    buttons: [
      { text: t('cancel', '取消'), role: 'cancel' },
      {
        text: t('delete', '刪除'),
        role: 'destructive',
        handler: async () => {
          mainStore.setLoading(true);
          try {
            await VehicleRepairDeleteById(detailVehicle.value.id, repairId);
            await mainStore.SWAL_Success(t('deleteSuccess', '刪除成功'));
            await fetchRepairList();
          } catch (error) {
            await mainStore.SWAL_Error(error);
          } finally {
            mainStore.setLoading(false);
          }
        },
      },
    ],
  });
  await alert.present();
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW');
};

// 取得維修狀態顏色
const getRepairStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'IN_PROGRESS':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'medium';
    default:
      return 'medium';
  }
};

// 取得嚴重度顏色
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'danger';
    case 'CRITICAL':
      return 'danger';
    default:
      return 'medium';
  }
};

// 刪除確認
const handleDelete = async (item) => {
  const alert = await alertController.create({
    header: t('confirmDelete', '確認刪除'),
    message: t('deleteVehicleConfirm', '確定要刪除此車輛嗎？'),
    buttons: [
      { text: t('cancel', '取消'), role: 'cancel' },
      {
        text: t('delete', '刪除'),
        role: 'destructive',
        handler: () => deleteData(item.id),
      },
    ],
  });
  await alert.present();
};

// 無限捲動
const loadMore = async (event) => {
  if (loading.value || !hasMore.value) {
    event.target.complete();
    return;
  }

  loading.value = true;
  const currentPage = pagination.page;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (currentPage >= totalPages) {
    hasMore.value = false;
    event.target.complete();
    loading.value = false;
    return;
  }

  pagination.page += 1;
  await getAPI();
  event.target.complete();
  loading.value = false;
};

// 監聽搜尋變化
watch(
  () => filters.search,
  async () => {
    pagination.page = 1;
    hasMore.value = true;
    await getAPI();
  },
);

// 生命週期
onMounted(async () => {
  loading.value = true;
  await getAPI();
  loading.value = false;
});
</script>

<style scoped>
.summary-card {
  margin: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
}

.filter-card {
  margin: 8px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.vehicle-list {
  margin-top: 8px;
}

.empty-state {
  --min-height: 200px;
}

.empty-state ion-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.bottom-spacer {
  height: 80px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--ion-color-medium);
}

.empty-state-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--ion-color-medium);
}

.empty-state-detail ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
