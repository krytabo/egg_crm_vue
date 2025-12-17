// src/utils/auth.js
import { encrypt, decrypt } from "./encryption";
const TOKEN_KEY = "primax_token"; // access token
const REFRESH_TOKEN_KEY = "primax_refresh_token";
const TOKEN_EXPIRES_KEY = "primax_token_expires_at";
const TOKEN_EXPIRY_BUFFER = 5 * 1000; // 5 seconds buffer to refresh before actual expiry
const USER_INFO_KEY = "primax_user_info";
const USER_PERMISSION = "primax_permission";
const FACTORT_ID = "FactoryId";

/** token相關 **/
export const getToken = () => localStorage.getItem(TOKEN_KEY); //取得localStorage中的token
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY); //取得localStorage中的refresh token
export const getTokenExpiresAt = () => Number(localStorage.getItem(TOKEN_EXPIRES_KEY) || 0); //取得token到期時間 (毫秒)
export const setToken = (tokenInfo) => {
    if (!tokenInfo) {
        removeToken();
        return;
    }

    // 若仍傳入字串則向下相容
    if (typeof tokenInfo === "string") {
        localStorage.setItem(TOKEN_KEY, tokenInfo);
        return;
    }

    const { accessToken, refreshToken, expiresIn } = tokenInfo;
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (typeof expiresIn === "number") {
        const expiresAt = Date.now() + expiresIn * 1000;
        localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
    }
}; //將token存入localStorage，支援access/refresh/expire時間
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
}; //從localStorage中移除token
export const isTokenExpired = (token) => {
    if (!token) return true;
    const expiresAt = getTokenExpiresAt();
    if (expiresAt) {
        return Date.now() >= expiresAt - TOKEN_EXPIRY_BUFFER;
    }
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000;
        return Date.now() >= expirationTime;
    } catch (error) {
        console.error("Token parsing error:", error);
        return true;
    }
}; //檢查token是否已過期
export const refreshToken = async () => {
    // 返回新的 token
}; //刷新token

/** 使用者相關 **/
export const getUserInfo = () => {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
}; //取得localStorage中的使用者資訊
export const setUserInfo = (userInfo) => localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo)); //將使用者資訊存入localStorage
export const removeUserInfo = () => {
    localStorage.removeItem(USER_INFO_KEY); //使用者資料
    localStorage.removeItem(USER_PERMISSION); //使用者權限
    localStorage.removeItem(FACTORT_ID); //廠區資料
}; //從localStorage中移除使用者
export const logout = () => {
    removeToken();
    removeUserInfo();
}; //登出並移除localStorage中的token和使用者

/** 權限相關 **/
export const transformPermissions = (userInfo) => {
    if (!userInfo?.permission) return [];

    //取得所有系統
    return Object.entries(userInfo.permission).map(([systemId, systemData]) => {
        const allGroups = Object.entries(systemData);
        //預設語言設置為 'zh_TW'
        const defaultLanguage = "zh_TW";

        //整理所有角色
        const roles = allGroups.reduce((acc, [_, groupData]) => {
            if (groupData.role) {
                acc.push(
                    ...groupData.role.map((role) => ({
                        id: role.key,
                        name: role.name[defaultLanguage]
                    }))
                );
            }
            return acc;
        }, []);

        // 整理所有頁面
        const pages = allGroups
            .map(([groupId, groupData]) => {
                if (!groupData.page) return null;
                return {
                    id: groupId,
                    name: groupData.page[0].group_fields[defaultLanguage],
                    children: groupData.page.map((page) => ({
                        id: page.key,
                        name: page.name[defaultLanguage]
                    }))
                };
            })
            .filter(Boolean);

        return {
            id: systemId,
            name: allGroups[0][1].page?.[0].system_fields[defaultLanguage] || allGroups[0][1].role?.[0].system_fields[defaultLanguage],
            role: roles,
            page: pages
        };
    });
}; //將使用者權限轉換格式
export const getTransformedPermissions = () => {
    const userInfo = getUserInfo();
    return transformPermissions(userInfo);
}; //取得轉換後的權限
export const filterPermissionsBySystem = (permissions, systemId) => {
    return permissions.find((system) => system.id === systemId) || null;
};
export const hasPermission = (permissionKey) => {
    const userInfo = getUserInfo();
    if (!userInfo?.permission) return false;

    //在所有系統中尋找權限
    return Object.values(userInfo.permission).some((system) => Object.values(system).some((group) => group.page?.some((page) => page.key === permissionKey) || group.role?.some((role) => role.key === permissionKey)));
};

/** 登入記住我相關 **/
const REMEMBERED_CREDENTIALS_KEY = "remembered_credentials";
export const getRememberedCredentials = () => {
    const credentials = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
    return credentials ? JSON.parse(decrypt(credentials)) : null;
}; //取得記住的登入資訊(帳號和密碼)
export const setRememberedCredentials = (accounts, password) => {
    localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, encrypt(JSON.stringify({ accounts, password })));
}; //保存登入資訊(帳號和密碼)
export const clearRememberedCredentials = () => {
    localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
}; //清除保存的登入資訊(帳號和密碼)

const REMEMBER_STATUS_KEY = "remember_status";
export const getRememberStatus = () => {
    return localStorage.getItem(REMEMBER_STATUS_KEY) === "true";
}; //取得"記住我"的狀態
export const setRememberStatus = (status) => {
    localStorage.setItem(REMEMBER_STATUS_KEY, status);
}; //設置"記住我"的狀態

/** 登入相關 **/
export const getErrorMessage = (error) => {
    const defaultErrorMessage = "帳號或密碼錯誤，請重新輸入";
    if (!error.response || !error.response.data) return defaultErrorMessage;
    const errorData = error.response.data;

    //檢查是否有 errors 陣列
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const errorMessage = errorData.errors[0];
        if (errorMessage === "The account or password is incorrect, please re-enter it.")  return defaultErrorMessage;
        return errorMessage;
    }
    return defaultErrorMessage;
};
