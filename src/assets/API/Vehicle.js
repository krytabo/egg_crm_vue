import { dataList } from './api';

//車輛管理
export const VehicleListGet = (params) => dataList.get(`/vehicles`, { params }); //取得列表
export const VehicleCreatePost = (data) => dataList.post(`/vehicles`, data); //新增單筆
export const VehicleGetByID = (id) => dataList.get(`/vehicles/${id}`); //取得單筆
export const VehicleUpdatePatch = (id, data) => dataList.patch(`/vehicles/${id}`, data); //編輯單筆
export const VehicleDeleteById = (id) => dataList.delete(`/vehicles/${id}`); //刪除單筆

//司機指派
export const VehicleAssignDriverPost = (id, data) => dataList.post(`/vehicles/${id}/assign-driver`, data); //指派司機
export const VehicleUnassignDriverPost = (id) => dataList.post(`/vehicles/${id}/unassign-driver`); //解除司機指派

//保養記錄
export const VehicleMaintenanceHistoryGet = (id, params) => dataList.get(`/vehicles/${id}/maintenance-history`, { params }); //取得保養記錄
export const VehicleMaintenanceCreatePost = (id, data) => dataList.post(`/vehicles/${id}/maintenance`, data); //新增保養記錄
export const VehicleMaintenanceUpdatePut = (vehicleId, maintenanceId, data) => dataList.put(`/vehicles/${vehicleId}/maintenance/${maintenanceId}`, data); //更新保養記錄
export const VehicleMaintenanceDeleteById = (vehicleId, maintenanceId) => dataList.delete(`/vehicles/${vehicleId}/maintenance/${maintenanceId}`); //刪除保養記錄

//維修記錄
export const VehicleRepairHistoryGet = (id, params) => dataList.get(`/vehicles/${id}/repairs`, { params }); //取得維修記錄
export const VehicleRepairCreatePost = (id, data) => dataList.post(`/vehicles/${id}/repairs`, data); //新增維修記錄
export const VehicleRepairUpdatePut = (vehicleId, repairId, data) => dataList.put(`/vehicles/${vehicleId}/repairs/${repairId}`, data); //更新維修記錄
export const VehicleRepairDeleteById = (vehicleId, repairId) => dataList.delete(`/vehicles/${vehicleId}/repairs/${repairId}`); //刪除維修記錄

//行程記錄
export const VehicleTripHistoryGet = (id, params) => dataList.get(`/vehicles/${id}/trips`, { params }); //取得行程記錄
