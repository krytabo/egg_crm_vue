// src/constants/categories.js

export const CATEGORY_IDS = {
  EGG: '959ff8c8-8bc7-4164-91b1-f2491142075b', //雞蛋
  WATER: 'e106af10-17d4-4f4d-9ccf-8dfd5fbfe0b6', //飲水(原本的桶裝水)
  DISPENSER: 'b2eb8750-10d5-4f90-803f-71ed3ae264da', //飲水機(暫時不用)
}; //商品類別
export const CATEGORY_CODES = {
  EGG: 'EGG', //雞蛋
  WATER: 'WATER', //飲水
  DISPENSER: 'DISPENSER', //飲水機
}; //商品類別代碼(Router用)

export const getCategoryIdByCode = (code) => CATEGORY_IDS[code]; //根據類別代碼取得類別
export const getCategoryCodeById = (id) => {
  return Object.keys(CATEGORY_IDS).find((key) => CATEGORY_IDS[key] === id);
}; //根據類別 ID 取得類別代碼
export const CATEGORIES = [
  { id: CATEGORY_IDS.EGG, code: CATEGORY_CODES.EGG, name: '雞蛋' },
  { id: CATEGORY_IDS.WATER, code: CATEGORY_CODES.WATER, name: '飲水' },
  { id: CATEGORY_IDS.DISPENSER, code: CATEGORY_CODES.DISPENSER, name: '飲水機' },
]; //所有類別列表（含 ID 與代碼）
