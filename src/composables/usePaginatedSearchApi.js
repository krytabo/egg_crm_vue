import { ref, reactive } from 'vue';
import { useMainStore } from '@/stores/LoadingStore';

/**
 * 統一分頁搜尋 API Composable
 * @param {Function} apiFunction - API 函數（接收參數並返回 Promise）
 * @param {Object} defaultFilters - 預設篩選條件（不包含分頁參數）
 * @param {Object} options - 選項設定
 * @param {Function} options.getListFromResponse - 自訂 API 回傳資料處理函數
 * @param {Function} options.responseDataToList - 自訂資料轉換函數
 * @param {Function} options.afterApiCall - API 呼叫後的回調函數
 * @param {Array} options.pageSizeOptions - 分頁選項（預設 [10, 20, 50, 100]）
 * @param {Number} options.defaultPageSize - 預設每頁筆數（預設 10）
 * @returns {Object} { basicDataList, filters, pagination, pageSizeOptions, totalPages, getAPI, handleGlobalSearch, handleFiltersChange, clearFilter, CurrentChange, SizeChange, handleSort, buildListParams }
 */
export const usePaginatedSearchApi = (apiFunction, defaultFilters = {}, options = {}) => {
  const mainStore = useMainStore();

  /** 解構選項參數（必須在使用前定義） **/
  const { getListFromResponse = null, responseDataToList = null, afterApiCall = null, pageSizeOptions = [10, 20, 50, 100], defaultPageSize = 10 } = options;

  /** 取得資料相關 **/
  const basicDataList = ref([]); // 表格資料
  const filters = reactive({ ...defaultFilters }); // 篩選條件
  const tableKey = ref(Date.now());
  const pagination = reactive({
    page: 1,
    limit: defaultPageSize,
    total: 0,
    totalPages: 1,
  }); // 分頁設定
  const totalPages = () => pagination.totalPages || 1; // 取得總頁數

  const buildListParams = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    // 將 filters 中的非空值加入參數
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== '' && value !== null && value !== undefined && value !== 'all') {
        params[key] = value;
      }
    });

    return params;
  }; //整理查詢條件
  const getDefaultAPI = async () => {
    mainStore.setLoading(true);
    try {
      const params = buildListParams();
      const response = await apiFunction(params);

      //使用自訂的 getListFromResponse 或預設處理
      let items, meta;
      if (getListFromResponse) {
        const result = getListFromResponse(response);
        items = result.items || [];
        meta = result.meta || {};
      } else {
        // 預設處理邏輯：支持多層嵌套的 API 回傳格式
        const responseData = response?.data ?? response ?? {};
        const payload = responseData?.data ?? responseData ?? {};
        // 嘗試多種可能的數據路徑
        items = payload?.data ?? payload?.items ?? payload?.data?.data ?? payload?.data?.items ?? [];
        //嘗試多種可能的元數據路徑
        meta = payload?.meta ?? payload?.pagination ?? payload?.data?.meta ?? payload?.data?.pagination ?? {};
      }

      //使用自訂的 responseDataToList 或直接使用原始資料
      if (responseDataToList) {
        basicDataList.value = items.map(responseDataToList);
      } else {
        basicDataList.value = Array.isArray(items) ? items : [];
      }

      //更新分頁資訊
      pagination.total = meta.total ?? items.length;
      pagination.limit = Number(meta.limit ?? pagination.limit);
      pagination.page = meta.page ?? pagination.page;
      pagination.totalPages = meta.totalPages ?? pagination.totalPages;

      //執行後續回調
      if (afterApiCall) afterApiCall(response, basicDataList);

      return response;
    } catch (error) {
      basicDataList.value = [];
      await mainStore.SWAL_Error(error);
    } finally {
      mainStore.setLoading(false);
    }
  }; //取得資料列表
  const handleGlobalSearch = async () => {
    pagination.page = 1;
    await getDefaultAPI();
  }; //全域搜尋
  const handleFiltersChange = async () => {
    pagination.page = 1;
    await getDefaultAPI();
  }; //篩選條件變更
  const handleSort = async ({ field, order }) => {
    // 重置其他排序字段
    Object.keys(filters).forEach((key) => {
      if (key.endsWith('Order') && key !== field) {
        filters[key] = '';
      }
    });

    // 設定當前欄位的排序順序
    filters[field] = order;
    await getDefaultAPI();
  }; //排序

  /** 分頁相關 **/
  const CurrentChange = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages());
    if (safePage === pagination.page) return;
    pagination.page = safePage;
    getDefaultAPI();
  }; //切換分頁
  const SizeChange = (val) => {
    pagination.limit = Number(val) || defaultPageSize;
    pagination.page = 1;
    getDefaultAPI();
  }; //切換分頁筆數

  /** 清除篩選 **/
  const clearFilter = () => {
    // 重置所有篩選條件為初始值
    Object.keys(defaultFilters).forEach((key) => {
      filters[key] = defaultFilters[key];
    });
    handleGlobalSearch();
  }; //清除搜尋與篩選

  return {
    tableKey,
    filters,
    basicDataList,
    pagination,
    pageSizeOptions,
    totalPages,

    getDefaultAPI,
    handleGlobalSearch,
    handleFiltersChange,
    clearFilter,
    CurrentChange,
    SizeChange,
    handleSort,
    buildListParams,
  };
};
