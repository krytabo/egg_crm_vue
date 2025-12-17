// src/assets/API/Auth.js (登入相關)
import { dataList } from "./api";

export const AuthLoginPost = (data) => dataList.post(`/auth/login`, data); //登入
export const AuthLogoutPost = () => dataList.post(`/auth/logout`); //登出
export const AuthRefreshTokenPost = (data) => dataList.post(`/auth/refresh`, data); //重新取得token
export const AuthProfileGet = () => dataList.get(`/auth/me`); //取得個人資訊
