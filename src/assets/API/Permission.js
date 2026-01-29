// src/assets/API/Permission.js (權限設定管理)
import { dataList } from "./api";

export const PermissionListGet = (params) => dataList.get(`/permissions`, { params }); // 取得權限列表
export const PermissionCreatePost = (data) => dataList.post(`/permissions`, data); // 新增權限
export const PermissionGetByID = (id) => dataList.get(`/permissions/${id}`); // 取得單筆權限
export const PermissionUpdatePatch = (id, data) => dataList.patch(`/permissions/${id}`, data); // 更新權限
export const PermissionDeleteById = (id) => dataList.delete(`/permissions/${id}`); // 刪除權限
