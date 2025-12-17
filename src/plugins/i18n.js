import { createI18n } from "vue-i18n";
import zhTWMessages from "@/locales/zh-TW.js";
import tinyLocale, { zhCN as tinyZhCN } from "@opentiny/vue-locale";
import { tify } from "chinese-conv";

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

const i18n = createI18n({
  legacy: false,
  locale: "zh-TW",
  fallbackLocale: "zh-TW",
  messages: {
    "zh-TW": zhTWMessages
  }
});

export default i18n;
