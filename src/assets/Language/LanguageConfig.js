// src/assets/Language/LanguageConfig.js
import merge from "lodash.merge";

export const languageMap = {
  zh_TW: { name: "繁體中文", mapLanguage: "zh-TW" },
  zh_CN: { name: "简体中文", mapLanguage: "zh-CN" },
  en: { name: "English", mapLanguage: "en" }
};

export const defaultLanguage = "zh_TW";

export const systemLanguages = {
  Auth: {
    zh_TW: () => import("@/assets/Language/Auth/zh_TW.json"),
    zh_CN: () => import("@/assets/Language/Auth/zh_CN.json"),
    en: () => import("@/assets/Language/Auth/en.json")
  },
  Public: {
    zh_TW: () => import("@/assets/Language/Public/zh_TW.json"),
    zh_CN: () => import("@/assets/Language/Public/zh_CN.json"),
    en: () => import("@/assets/Language/Public/en.json")
  },
  Customer: {
    zh_TW: () => import("@/assets/Language/Customer/zh_TW.json"),
    zh_CN: () => import("@/assets/Language/Customer/zh_CN.json"),
    en: () => import("@/assets/Language/Customer/en.json")
  }
  //其他更多語系加這裡...
};

export async function loadLanguage(system, lang) {
  try {
    const [publicModule, systemModule] = await Promise.all([systemLanguages.Public[lang](), systemLanguages[system][lang]()]);
    return merge({}, publicModule.default, systemModule.default);
  } catch (error) {
    console.error(`無法載入 ${system} 系統的 ${lang} 語言文件:`, error);
    return {};
  }
}
