// src/assets/API/User.js (員工 / 系統使用者管理)
import { dataList } from "./api";

/** 員工管理 **/
export const UserListGet = (data) => dataList.get(`/users`, { params: data }); //取得列表
export const UserCreatePost = (data) => dataList.post(`/users`, data); //新增單筆
export const UserGetByID = (id) => dataList.get(`/users/${id}`); //取得單筆
export const UserUpdatePatch = (id, data) => dataList.patch(`/users/${id}`, data); //編輯單筆
export const UserDeleteById = (id) => dataList.delete(`/users/${id}`); //刪除單筆

/** 角色權限管理 **/
export const UserUpdateRoles = (id, data) => dataList.post(`/users/${id}/roles`, data); //角色權限管理
