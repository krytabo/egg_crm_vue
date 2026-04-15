// src/assets/API/api.js
import axios from "axios";
import { getToken, getRefreshToken, logout, setToken } from "@/utils/auth";

// development: 使用 vite proxy（/hostApi → 測試站）
// staging / production: 直接使用環境變數的 API domain
const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
export const host = isDevelopment
  ? "/hostApi"
  : (import.meta.env.VITE_APP_AXIOS_BASEURL || location.origin);

const getUserTimezone = () => {
  const userTimezone = localStorage.getItem("userTimezone") || "Asia/Taipei";
  if (userTimezone) return userTimezone;
  try {
    const timeZone = Intl.DataTimeFormat().resolvedOptions().timeZone;
    localStorage.setItem("userTimezone", timeZone);
    return timeZone;
  } catch (error) {
    return "Asia/Taipei";
  }
}; //取得時區

/** 一般Domain **/
export const dataList = axios.create({
  baseURL: host,
  paramsSerializer: {
    indexes: null, // 陣列序列化格式：key=1&key=2&key=3（而非 key[]=1&key[]=2）
  },
});

const loginEndpoints = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/login", //舊登入
  "/microsoft/authorization", //授權網址
  "/microsoft/callback", ////授權網址
  "/microsoft/auth-status" //確認使用者授權狀態
]; //例外api

/** 攔截器相關 **/
const requestInterceptor = async (config) => {
  const token = getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;

  const currentFactoryId = localStorage.getItem("FactoryId");
  if (currentFactoryId) config.headers["Factory-Id"] = parseInt(currentFactoryId, 10);

  config.headers["Timezone"] = getUserTimezone();
  config.isLoginRequest = loginEndpoints.some((endpoint) => config.url.includes(endpoint)); //判斷無視回傳401，不會強制登出
  return config;
};
const responseInterceptor = async (response) => response;
const errorInterceptor = async (error) => {
  const originalRequest = error.config || {};
  if (error.response?.status === 401 && !originalRequest.isLoginRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("Missing refresh token");

      const { data: refreshResponse } = await dataList.post("/auth/refresh", {
        refreshToken
      });
      const payload = refreshResponse?.data || refreshResponse;
      const normalizedToken = {
        accessToken: payload?.accessToken || payload?.token,
        refreshToken: payload?.refreshToken || refreshToken,
        expiresIn: payload?.expiresIn
      };

      if (!normalizedToken.accessToken) {
        throw new Error("Refresh response missing access token");
      }

      setToken(normalizedToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers["Authorization"] = `Bearer ${normalizedToken.accessToken}`;
      return dataList(originalRequest);
    } catch (refreshError) {
      logout();
      location.href = "/auth/login";
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
};
const setupInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
  axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);
};

setupInterceptors(dataList); //多語系Domain初始化
