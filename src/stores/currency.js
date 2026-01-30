// src/stores/currency.js
import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';

export const currencyMap = {
  TWD: { symbol: 'NT$', name: '新台幣', locale: 'zh-TW' },
  USD: { symbol: '$', name: '美元', locale: 'en-US' },
  CNY: { symbol: '¥', name: '人民幣', locale: 'zh-CN' },
  // JPY: { symbol: "¥", name: "日圓", locale: "ja-JP" }
};

const defaultCurrency = 'TWD'; //預設貨幣

export const useCurrencyStore = defineStore('currency', () => {
  const state = reactive({
    currency: localStorage.getItem('currency') || defaultCurrency,
    currentCurrencyInfo: null,
  }); //初始化狀態
  const currencySymbol = computed(() => {
    return state.currentCurrencyInfo?.symbol || currencyMap[defaultCurrency].symbol;
  }); //取得貨幣符號
  const setCurrency = (currency) => {
    state.currency = currency;
    state.currentCurrencyInfo = currencyMap[currency];
    localStorage.setItem('currency', currency);
  }; //設置當前使用的貨幣
  const getCurrencyInfo = () => {
    const savedCurrency = localStorage.getItem('currency') || defaultCurrency;
    state.currentCurrencyInfo = currencyMap[savedCurrency];
    state.currency = savedCurrency;
  }; //獲取＆初始化貨幣
  const formatCurrencyNumber = (value) => {
    if (isNaN(value)) {
      return value; // 非數字時直接返回原值
    }
    const { locale } = state.currentCurrencyInfo || currencyMap[defaultCurrency];
    return `${currencySymbol.value}${Number(value).toLocaleString(locale)}`;
  }; //格式化數字並加上當前選擇的貨幣符號
  const formatNumber = (value) => {
    if (isNaN(value)) {
      return value;
    }
    return Number(value).toLocaleString();
  }; //格式化數字為千分位表示法
  getCurrencyInfo(); //初始化幣別

  return {
    state,
    currencySymbol,
    setCurrency,
    getCurrencyInfo,
    formatCurrencyNumber,
    formatNumber,
  };
});
