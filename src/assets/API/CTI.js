// src/assets/API/CTI.js (通話整合 CTI)
import { dataList } from './api';

/** 通話記錄 (Calls) **/
export const CtiCallsGet = (params) => dataList.get(`/cti/calls`, { params }); // 查詢通話記錄列表（分頁+篩選）
export const CtiCallCreatePost = (data) => dataList.post(`/cti/calls`, data); // 手動建立通話記錄
export const CtiCallGetById = (id) => dataList.get(`/cti/calls/${id}`); // 取得單筆通話記錄
export const CtiCallUpdatePatch = (id, data) => dataList.patch(`/cti/calls/${id}`, data); // 更新通話記錄（補備註、結果、客戶）
export const CtiCallAddNotes = (id, data) => dataList.post(`/cti/calls/${id}/notes`, data); // 新增通話備註 (data: { notes, agentId })

/** 外撥與通話動作 (Actions) **/
export const CtiInitiateCallPost = (data) => dataList.post(`/cti/initiate-call`, data); // 發起外撥電話 (data: { agentId, phoneNumber, customerId? })
export const CtiAnswerCallPost = (id, data) => dataList.post(`/cti/calls/${id}/answer`, data); // 接聽來電 (data: { agentId })
export const CtiHangupCallPost = (id, data) => dataList.post(`/cti/calls/${id}/hangup`, data); // 掛斷電話 (data: { reason? })
export const CtiTransferCallPost = (id, data) => dataList.post(`/cti/calls/${id}/transfer`, data); // 轉接通話 (data: { toAgentId, notes? })

/** 統計 (Statistics) **/
export const CtiCallStatisticsGet = (params) => dataList.get(`/cti/statistics/calls`, { params }); // 通話統計 (params: { startDate, endDate, agentId? })
export const CtiAgentStatisticsGet = (params) => dataList.get(`/cti/statistics/agents`, { params }); // 客服績效統計
