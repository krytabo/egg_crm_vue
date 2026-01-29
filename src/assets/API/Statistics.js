import { dataList } from "./api";

/** 統計報表 (Statistics) **/
export const StatisticsDashboardGet = () => dataList.get(`/statistics/dashboard`); // 取得儀表板統計
export const StatisticsSalesGet = (params) => dataList.get(`/statistics/sales`, { params }); // 取得銷售統計
export const StatisticsInventoryGet = () => dataList.get(`/statistics/inventory`); // 取得庫存統計
export const StatisticsCustomersGet = () => dataList.get(`/statistics/customers`); // 取得客戶統計
