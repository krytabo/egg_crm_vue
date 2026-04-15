// src/constants/categories.js
import { reactive, ref } from 'vue';
import { ProductTypeListGet } from '@/assets/API/ProductType.js';
import { getToken } from '@/utils/auth.js';

const CACHE_KEY = 'egg_crm_category_ids';

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

const _cached = loadCache();

export const CATEGORY_CODES = {
  EGG: 'EGG', //雞蛋
  WATER: 'WATER', //飲水
  DISPENSER: 'DISPENSER', //飲水機
}; //商品類別代碼(Router用)

// reactive 物件：模板中 CATEGORY_IDS.EGG 等用法完全不需要改
export const CATEGORY_IDS = reactive({
  EGG: _cached.EGG ?? null,
  WATER: _cached.WATER ?? null,
  DISPENSER: _cached.DISPENSER ?? null,
}); //商品類別

export const getCategoryIdByCode = (code) => CATEGORY_IDS[code]; //根據類別代碼取得類別
export const getCategoryCodeById = (id) => {
  return Object.keys(CATEGORY_IDS).find((key) => CATEGORY_IDS[key] === id);
}; //根據類別 ID 取得類別代碼

// reactive 陣列：CATEGORIES.map() / CATEGORIES.find() 用法完全不需要改
export const CATEGORIES = reactive([
  { id: _cached.EGG ?? null, code: CATEGORY_CODES.EGG, name: '雞蛋' },
  { id: _cached.WATER ?? null, code: CATEGORY_CODES.WATER, name: '飲水' },
  { id: _cached.DISPENSER ?? null, code: CATEGORY_CODES.DISPENSER, name: '飲水機' },
]); //所有類別列表（含 ID 與代碼）

// true = 已從 API 取得最新 ID（快取存在時啟動即為 true）
export const categoriesReady = ref(!!(_cached.EGG && _cached.WATER && _cached.DISPENSER));

let _initializing = false;

/**
 * 在 App.vue onMounted 與登入成功後各呼叫一次。
 * 未登入時直接 return，防止 401 迴圈。
 * 並發防護：同時只允許一個呼叫進行。
 */
export const initCategoryIds = async () => {
  if (!getToken()) return; // 未登入不呼叫
  if (_initializing) return; // 防止重複並發
  _initializing = true;
  try {
    const res = await ProductTypeListGet({ limit: 100 });
    const list = res?.data?.data?.data ?? [];
    const newCache = {};
    list.forEach((item) => {
      if (item.code in CATEGORY_IDS) {
        CATEGORY_IDS[item.code] = item.id;
        newCache[item.code] = item.id;
      }
    });
    CATEGORIES.forEach((cat) => {
      if (CATEGORY_IDS[cat.code]) cat.id = CATEGORY_IDS[cat.code];
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    categoriesReady.value = true;
  } catch (e) {
    console.error('[initCategoryIds] error:', e);
    categoriesReady.value = true; // 避免錯誤時永久卡住
  } finally {
    _initializing = false;
  }
};
