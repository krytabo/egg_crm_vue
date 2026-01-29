import { dataList } from "./api";

//庫存查詢
export const InventoryListGet = (params) => dataList.get(`/inventory`, { params }); //查詢庫存列表
export const InventoryProductGet = (productId) => dataList.get(`/inventory/product/${productId}`); //取得產品庫存總覽
export const InventoryLocationGet = (location, params) => dataList.get(`/inventory/location/${location}`, { params }); //取得位置庫存列表

//靜態資料與報表
export const InventoryLocationsGet = () => dataList.get(`/inventory/locations`); //取得所有存放位置
export const InventoryLowStockGet = (params) => dataList.get(`/inventory/low-stock`, { params }); //取得低庫存項目
export const InventoryOutOfStockGet = () => dataList.get(`/inventory/out-of-stock`); //取得缺貨項目
export const InventoryMovementsGet = (params) => dataList.get(`/inventory/movements`, { params }); //取得庫存異動記錄
export const InventoryReportValuationGet = (params) => dataList.get(`/inventory/reports/valuation`, { params }); //取得庫存估值報表
export const InventoryReportTurnoverGet = (params) => dataList.get(`/inventory/reports/turnover`, { params }); //取得庫存週轉報表
export const InventoryReorderAlertsGet = () => dataList.get(`/inventory/alerts/reorder`); //取得需補貨項目

//庫存異動操作
export const InventoryStockInPost = (data) => dataList.post(`/inventory/movements/stock-in`, data); //入庫
export const InventoryStockOutPost = (data) => dataList.post(`/inventory/movements/stock-out`, data); //出庫
export const InventoryTransferPost = (data) => dataList.post(`/inventory/movements/transfer`, data); //庫存調撥
export const InventoryAdjustmentPost = (data) => dataList.post(`/inventory/movements/adjustment`, data); //庫存盤點調整

//盤點作業
export const InventoryCycleCountPost = (data) => dataList.post(`/inventory/cycle-count`, data); //執行盤點作業
