import { dataList } from "./api";

/** 統計報表 (Statistics) **/
export const StatisticsDashboardGet = () => dataList.get(`/statistics/dashboard`); // 取得儀表板統計
export const StatisticsSalesGet = (params) => dataList.get(`/statistics/sales`, { params }); // 取得銷售統計（支援 dateFrom/dateTo/groupBy/productCategory）
export const StatisticsInventoryGet = () => dataList.get(`/statistics/inventory`); // 取得庫存統計
export const StatisticsCustomersGet = () => dataList.get(`/statistics/customers`); // 取得客戶統計
export const StatisticsWaterDepositsGet = () => dataList.get(`/statistics/water-deposits`); // 取得儲值統計（summary: totalDeposits/customerCount/totalQuantity/totalAmount/remainingQuantity/remainingAmount）
export const StatisticsPendingShipmentsGet = () => dataList.get(`/statistics/pending-shipments`); // 取得待出貨統計（summary.totalPending/totalAmount/byStatus/productBreakdown + orders[]）
