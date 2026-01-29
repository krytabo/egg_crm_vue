import { dataList } from "./api";

const API_ENDPOINT = "/orders";

export const OrderListGet = (params) => dataList.get(API_ENDPOINT, { params });
export const OrderGetByID = (id) => dataList.get(`${API_ENDPOINT}/${id}`);
export const OrderCreatePost = (payload) => dataList.post(API_ENDPOINT, payload);
export const OrderUpdatePatch = (id, payload) => dataList.patch(`${API_ENDPOINT}/${id}`, payload);
export const OrderStatusUpdatePatch = (id, payload) => dataList.patch(`${API_ENDPOINT}/${id}/status`, payload);
export const OrderDeleteById = (id) => dataList.delete(`${API_ENDPOINT}/${id}`);