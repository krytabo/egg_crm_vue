// src/stores/PermissionStore.js
// 權限管理 Store - 管理使用者權限並提供權限檢查功能
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const PERMISSION_KEY = 'Egg_user_permissions';

export const usePermissionStore = defineStore('permission', () => {
  /**
   * 權限列表
   * 格式: [{ resource: 'USER', action: 'CREATE' }, { resource: 'USER', action: 'READ' }, ...]
   */
  const permissions = ref([]);

  /**
   * 從 localStorage 載入權限
   */
  const loadPermissions = () => {
    try {
      const stored = localStorage.getItem(PERMISSION_KEY);
      if (stored) {
        permissions.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('載入權限失敗:', error);
      permissions.value = [];
    }
  };

  /**
   * 設置權限並存入 localStorage
   * @param {Array} permissionList - 權限陣列 [{ resource, action }, ...]
   */
  const setPermissions = (permissionList) => {
    permissions.value = permissionList || [];
    try {
      localStorage.setItem(PERMISSION_KEY, JSON.stringify(permissions.value));
    } catch (error) {
      console.error('儲存權限失敗:', error);
    }
  };

  /**
   * 清除權限
   */
  const clearPermissions = () => {
    permissions.value = [];
    localStorage.removeItem(PERMISSION_KEY);
  };

  /**
   * 權限 Map（用於快速查詢）
   * 格式: { 'USER:CREATE': true, 'USER:READ': true, ... }
   */
  const permissionMap = computed(() => {
    return permissions.value.reduce((map, perm) => {
      if (perm.resource && perm.action) {
        map[`${perm.resource}:${perm.action}`] = true;
      }
      return map;
    }, {});
  });

  /**
   * 資源權限 Map（用於快速查詢某資源是否有任何權限）
   * 格式: { 'USER': true, 'CUSTOMER': true, ... }
   */
  const resourceMap = computed(() => {
    return permissions.value.reduce((map, perm) => {
      if (perm.resource) {
        map[perm.resource] = true;
      }
      return map;
    }, {});
  });

  /**
   * 檢查是否擁有特定權限
   * @param {string} resource - 資源名稱 (例如: 'USER', 'CUSTOMER')
   * @param {string} action - 操作名稱 (例如: 'CREATE', 'READ', 'UPDATE', 'DELETE')
   * @returns {boolean}
   */
  const hasPermission = (resource, action) => {
    if (!resource || !action) return false;
    return !!permissionMap.value[`${resource}:${action}`];
  };

  /**
   * 檢查是否擁有某資源的任何權限（用於側邊欄顯示判斷）
   * @param {string} resource - 資源名稱
   * @returns {boolean}
   */
  const hasResourceAccess = (resource) => {
    if (!resource) return false;
    return !!resourceMap.value[resource];
  };

  /**
   * 檢查是否擁有多個權限中的任一個
   * @param {Array<{resource: string, action: string}>} permList - 權限陣列
   * @returns {boolean}
   */
  const hasAnyPermission = (permList) => {
    if (!Array.isArray(permList) || permList.length === 0) return false;
    return permList.some((perm) => hasPermission(perm.resource, perm.action));
  };

  /**
   * 檢查是否擁有所有指定的權限
   * @param {Array<{resource: string, action: string}>} permList - 權限陣列
   * @returns {boolean}
   */
  const hasAllPermissions = (permList) => {
    if (!Array.isArray(permList) || permList.length === 0) return false;
    return permList.every((perm) => hasPermission(perm.resource, perm.action));
  };

  /**
   * 取得某資源的所有操作權限
   * @param {string} resource - 資源名稱
   * @returns {string[]} - 操作陣列 ['CREATE', 'READ', ...]
   */
  const getResourceActions = (resource) => {
    if (!resource) return [];
    return permissions.value.filter((perm) => perm.resource === resource).map((perm) => perm.action);
  };

  // 初始化時載入權限
  loadPermissions();

  return {
    // 狀態
    permissions,
    permissionMap,
    resourceMap,

    // 方法
    loadPermissions,
    setPermissions,
    clearPermissions,
    hasPermission,
    hasResourceAccess,
    hasAnyPermission,
    hasAllPermissions,
    getResourceActions,
  };
});
