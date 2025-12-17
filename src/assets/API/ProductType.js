// src/assets/API/ProductType.js (產品類型管理)
import { dataList } from "./api";

export const ProductTypeListGet = (data) => dataList.get(`/product-types`, { params: data }); //取得產品類型列表
export const ProductTypeCreatePost = (data) => dataList.post(`/product-types`, data); //新增單筆
export const ProductTypeGetByID = (id) => dataList.get(`/product-types/${id}`); //取得單筆
export const ProductTypeUpdatePatch = (id, data) => dataList.patch(`/product-types/${id}`, data); //編輯單筆
export const ProductTypeDeleteById = (id) => dataList.delete(`/product-types/${id}`); //刪除單筆
