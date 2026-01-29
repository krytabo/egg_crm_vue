import { dataList } from './api';

/** 送貨報表管理 (Delivery Reports) **/
export const DeliveryReportCreatePost = (data) => dataList.post(`/delivery-reports`, data); // 新增送貨報表
export const DeliveryReportListGet = (params) => dataList.get(`/delivery-reports`, { params }); // 取得送貨報表列表
export const DeliveryReportDailyGet = (params) => dataList.get(`/delivery-reports/daily-report`, { params }); // 取得日報表匯總
export const DeliveryReportDailyExportGet = (params) => dataList.get(`/delivery-reports/daily-report/export`, { params, responseType: 'blob' }); // 匯出日報表 Excel
export const DeliveryReportFormDataGet = () => dataList.get(`/delivery-reports/form-data`); // 取得表單資料（司機列表、商品列表）
export const DeliveryByDaysGet = (params) => dataList.get(`/delivery-reports/entities-by-delivery-days`, { params }); // 依送貨日取得客戶與廠商
export const DeliveryReportGetById = (id) => dataList.get(`/delivery-reports/${id}`); // 取得單一送貨報表
export const DeliveryReportExportGet = (id) => dataList.get(`/delivery-reports/${id}/export`, { responseType: 'blob' }); // 匯出單一送貨報表 Excel
export const DeliveryReportUpdatePut = (id, data) => dataList.put(`/delivery-reports/${id}`, data); // 更新送貨報表
export const DeliveryReportDeleteById = (id) => dataList.delete(`/delivery-reports/${id}`); // 刪除送貨報表

/** 狀態與流程管理 (Workflow) **/
export const DeliveryReportSubmitPost = (id) => dataList.post(`/delivery-reports/${id}/submit`); // 提交送貨報表
export const DeliveryReportReviewPost = (id, data) => dataList.post(`/delivery-reports/${id}/review`, data); // 審核送貨報表 (data: { action: 'approve' | 'reject', note?: string })
export const DeliveryReportConvertToOrderPost = (id, data) => dataList.post(`/delivery-reports/${id}/convert-to-order`, data); // 轉入訂單
