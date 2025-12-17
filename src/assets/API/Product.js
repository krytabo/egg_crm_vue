// src/assets/API/Product.js (產品管理)
import { dataList } from "./api";

export const ProductListGet = (data) => dataList.get(`/products`, { params: data }); //取得列表
export const ProductCreatePost = (data) => dataList.post(`/products`, data); //新增單筆
export const ProductGetByID = (id) => dataList.get(`/products/${id}`); //取得單筆
export const ProductUpdatePatch = (id, data) => dataList.patch(`/products/${id}`, data); //編輯單筆
export const ProductDeleteById = (id) => dataList.delete(`/products/${id}`); //刪除單筆

/** 庫存管理 **/
export const ProductUpdateInventory = (id, data) => dataList.post(`/products/${id}/inventory`, data); //更新產品庫存-加減庫存
export const ProductLowStockGet = (threshold) => dataList.get(`/products/low-stock`, { params: { threshold } }); //取得低庫存產品（庫存 < 補貨點）
