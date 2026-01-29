import { dataList } from "./api";

/** 發票管理 (Invoices) **/
export const InvoiceListGet = (params) => dataList.get(`/billing/invoices`, { params }); //查詢發票列表
export const InvoiceCreatePost = (data) => dataList.post(`/billing/invoices`, data); //建立發票
export const InvoiceGetById = (id) => dataList.get(`/billing/invoices/${id}`); //取得單一發票
export const InvoiceUpdatePatch = (id, data) => dataList.patch(`/billing/invoices/${id}`, data); //更新發票
export const InvoiceDeleteById = (id) => dataList.delete(`/billing/invoices/${id}`); //刪除發票
export const InvoiceSendPost = (id) => dataList.post(`/billing/invoices/${id}/send`); //發送發票

/** 付款管理 (Payments) **/
export const PaymentListGet = (params) => dataList.get(`/billing/payments`, { params }); //查詢付款記錄列表
export const PaymentProcessPost = (data) => dataList.post(`/billing/payments`, data); //處理付款
export const PaymentGetById = (id) => dataList.get(`/billing/payments/${id}`); //取得單一付款記錄

/** 報表管理 (Reports) **/
export const ReportRevenueGet = (params) => dataList.get(`/billing/reports/revenue`, { params }); //取得營收報表
export const ReportOutstandingGet = () => dataList.get(`/billing/reports/outstanding`); //取得未收款報表

/** 折讓單管理 (Credit Memos) **/
export const CreditMemoListGet = (params) => dataList.get(`/billing/credit-memos`, { params }); //查詢折讓單列表
export const CreditMemoCreatePost = (data) => dataList.post(`/billing/credit-memos`, data); //建立折讓單
export const CreditMemoGetById = (id) => dataList.get(`/billing/credit-memos/${id}`); //取得單一折讓單
export const CreditMemoApplyPost = (id) => dataList.post(`/billing/credit-memos/${id}/apply`); //套用折讓單
export const CreditMemoCancelPost = (id) => dataList.post(`/billing/credit-memos/${id}/cancel`); //取消折讓單
