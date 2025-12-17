// src/assets/API/PotentialCustomers.js (潛在客戶管理)
import { dataList } from "./api";

export const PotentialCustomersListGet = (params) => dataList.get(`/potential-customers`, { params }); //取得列表
export const PotentialCustomersGetByID = (id) => dataList.get(`/potential-customers/${id}`); //取得單筆
export const PotentialCustomersCreatePost = (data) => dataList.post(`/potential-customers`, data); //新增單筆
export const PotentialCustomersUpdatePut = (id, data) => dataList.put(`/potential-customers/${id}`, data); //編輯單筆
export const PotentialCustomersDeleteById = (id) => dataList.delete(`/potential-customers/${id}`); //刪除單筆

/** 轉為正式客戶 **/
export const PotentialCustomersConvertPost = (id, data) => dataList.post(`/potential-customers/${id}/convert`, data); //潛在客戶轉正式客戶
