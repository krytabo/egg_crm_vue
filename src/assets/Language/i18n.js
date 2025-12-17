// src/assets/language/i18n.js
import { createI18n } from "vue-i18n";
import { defaultLanguage, loadLanguage } from "./LanguageConfig";
import merge from "lodash.merge";

let locale = localStorage.getItem("i18nLang") || defaultLanguage;
let currentSystem = localStorage.getItem("currentSystem") || "Auth";

const i18n = createI18n({
  legacy: false,
  locale: locale,
  fallbackLocale: defaultLanguage,
  messages: {},
  globalInjection: true
});

export async function updateI18nMessages(system) {
  const languages = ["zh_TW", "zh_CN", "en"];
  for (const lang of languages) {
    const messages = await loadLanguage(system, lang);
    const currentMessages = i18n.global.getLocaleMessage(lang);
    const mergedMessages = merge({}, currentMessages, messages);
    i18n.global.setLocaleMessage(lang, mergedMessages);
  }
}

updateI18nMessages(currentSystem);

export default i18n;
