// src/assets/API/Vendor.js (供應商管理)
import { dataList } from "./api";

/** 供應商基本資料 **/
export const VendorListGet = (data) => dataList.get(`/vendors`, { params: data }); //取得列表
export const VendorCreatePost = (data) => dataList.post(`/vendors`, data); //新增單筆
export const VendorGetByID = (id) => dataList.get(`/vendors/${id}`); //取得單筆
export const VendorUpdatePatch = (id, data) => dataList.patch(`/vendors/${id}`, data); //更新單筆
export const VendorDeleteById = (id) => dataList.delete(`/vendors/${id}`); //刪除單筆

/** 供應商商品目錄管理 **/
export const VendorProductsGet = (id) => dataList.get(`/vendors/${id}/products`); //取得該供應商所有供應商品
export const VendorProductAdd = (id, data) => dataList.post(`/vendors/${id}/products`, data); //新增商品至此供應商
export const VendorProductPriceUpdate = (vendorId, productId, data) => dataList.patch(`/vendors/${vendorId}/products/${productId}`, data); //更新供應商商品價格
export const VendorProductRemove = (vendorId, productId) => dataList.delete(`/vendors/${vendorId}/products/${productId}`); //從供應商移除商品

/** 採購訂單相關（針對此供應商）**/
export const VendorOrdersGet = (id) => dataList.get(`/vendors/${id}/orders`); //取得此供應商的所有採購訂單
export const VendorCreatePurchaseOrder = (id, data) => dataList.post(`/vendors/${id}/orders`, data); //快速建立採購訂單給此供應商
