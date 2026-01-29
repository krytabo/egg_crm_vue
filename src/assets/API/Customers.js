// src/assets/API/Customers.js (客戶資料)
import { dataList } from './api';

export const CustomersListGet = (data) => dataList.get(`/customers`, { params: data }); //取得列表
export const CustomersCreatePost = (data) => dataList.post(`/customers`, data); //新增單筆
export const CustomersGetByID = (id) => dataList.get(`/customers/${id}`); //取得單筆
export const CustomersUpdatePatch = (id, data) => dataList.patch(`/customers/${id}`, data); //編輯單筆
export const CustomersDeleteById = (id) => dataList.delete(`/customers/${id}`); //刪除單筆
export const CustomersImportExcel = (data) => dataList.post(`/customers/import`, data); //Excel匯入
