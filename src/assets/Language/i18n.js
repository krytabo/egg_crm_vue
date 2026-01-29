// src/assets/language/i18n.js
import { createI18n } from "vue-i18n";
import tinyLocale, { zhCN as tinyZhCN } from "@opentiny/vue-locale";
import { tify } from "chinese-conv";
import merge from "lodash.merge";
import { defaultLanguage, loadLanguage, systemLanguages } from "./LanguageConfig";

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj || {}));
const convertToTraditional = (data) => {
  if (typeof data === "string") return tify(data);
  if (Array.isArray(data)) return data.map(convertToTraditional);
  if (data && typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = convertToTraditional(data[key]);
      return acc;
    }, Array.isArray(data) ? [] : {});
  }
  return data;
};

const tinyZhTW = convertToTraditional(cloneDeep(tinyZhCN));
tinyZhTW.code = "zh-TW";
if (tinyZhTW.pager) {
  tinyZhTW.pager.goto = "前往";
  tinyZhTW.pager.total = "共 {total} 筆";
  tinyZhTW.pager.pagesize = "每頁 {size} 筆";
  tinyZhTW.pager.pageClassifier = "頁";
}
if (tinyZhTW.select) {
  tinyZhTW.select.noMatch = "無符合結果";
  tinyZhTW.select.noData = "無資料";
}
if (tinyZhTW.table) {
  tinyZhTW.table.emptyText = "暫無資料";
}
tinyLocale.use(tinyZhTW);

const resolveSystem = (system) => {
  if (system && systemLanguages[system]) return system;
  return "Public";
};

const storedLocale = localStorage.getItem("i18nLang") || defaultLanguage;
const currentSystem = resolveSystem(localStorage.getItem("currentSystem") || "Auth");

const i18n = createI18n({
  legacy: false,
  locale: storedLocale,
  fallbackLocale: defaultLanguage,
  messages: { [storedLocale]: {} },
  globalInjection: true
});

export async function updateI18nMessages(system) {
  const targetSystem = resolveSystem(system || currentSystem);
  const languages = ["zh_TW", "zh_CN", "en"];

  for (const lang of languages) {
    const messages = await loadLanguage(targetSystem, lang);
    const currentMessages = i18n.global.getLocaleMessage(lang) || {};
    const mergedMessages = merge({}, currentMessages, messages);
    i18n.global.setLocaleMessage(lang, mergedMessages);
  }
}

updateI18nMessages(currentSystem);

export default i18n;
