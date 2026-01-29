import { dataList } from "./api";

/** 司機查詢與列表 (Queries) **/
export const DriverAvailableByLocationGet = (params) => dataList.get(`/drivers/available/by-location`, { params }); // 依位置查詢可用司機
export const DriverLicensesExpiringGet = (params) => dataList.get(`/drivers/licenses/expiring-soon`, { params }); // 取得駕照即將到期的司機
export const DriverListGet = (params) => dataList.get(`/drivers`, { params }); // 查詢司機列表

/** 司機基本資料管理 (CRUD) **/
export const DriverCreatePost = (data) => dataList.post(`/drivers`, data); // 建立司機
export const DriverGetById = (id) => dataList.get(`/drivers/${id}`); // 取得單一司機
export const DriverUpdatePatch = (id, data) => dataList.patch(`/drivers/${id}`, data); // 更新司機
export const DriverDeleteById = (id) => dataList.delete(`/drivers/${id}`); // 刪除司機

/** 狀態與行程管理 (Status & Trips) **/
export const DriverStatusUpdatePost = (id, data) => dataList.post(`/drivers/${id}/status`, data); // 更新司機狀態 (data: { status })
export const DriverTripsGet = (id, params) => dataList.get(`/drivers/${id}/trips`, { params }); // 取得行程記錄

/** 績效與駕照管理 (Performance & License) **/
export const DriverPerformanceGet = (id, params) => dataList.get(`/drivers/${id}/performance`, { params }); // 取得績效指標
export const DriverLicenseRenewalPost = (id, data) => dataList.post(`/drivers/${id}/license/renewal`, data); // 更新駕照資訊 (data: { expiryDate, licenseNumber? })
