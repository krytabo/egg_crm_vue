// src/assets/API/Role.js (角色設定管理)
import { dataList } from "./api";

export const RoleListGet = (params) => dataList.get(`/roles`, { params }); // 取得角色列表
export const RoleCreatePost = (data) => dataList.post(`/roles`, data); // 新增角色
export const RoleGetByID = (id) => dataList.get(`/roles/${id}`); // 取得單筆角色
export const RoleUpdatePatch = (id, data) => dataList.patch(`/roles/${id}`, data); // 更新角色
export const RoleDeleteById = (id) => dataList.delete(`/roles/${id}`); // 刪除角色
export const RoleAssignPermissionsPost = (id, data) => dataList.post(`/roles/${id}/permissions`, data); // 指派權限
