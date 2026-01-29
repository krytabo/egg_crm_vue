// src/stores/TimezoneStore.js
import { defineStore } from "pinia";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = "Asia/Taipei";
const getStoredTimezone = () => {
  if (typeof window === "undefined") return DEFAULT_TIMEZONE;
  return localStorage.getItem("userTimezone") || DEFAULT_TIMEZONE;
};
const initialTimezone = getStoredTimezone();
dayjs.tz.setDefault(initialTimezone);

const ensureDayjsInstance = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return dayjs(value);
  if (typeof value === "number") return dayjs(value);
  const parsed = dayjs(value);
  if (parsed.isValid()) return parsed;
  return null;
};

const formatWithTimezone = (value, tz, format) => {
  const instance = ensureDayjsInstance(value);
  if (!instance) return "";
  try {
    return instance.tz(tz).format(format);
  } catch {
    return instance.format(format);
  }
};

export const useTimezoneStore = defineStore("timezone", {
  state: () => ({
    currentTimezone: initialTimezone
  }),
  actions: {
    setTimezone(timezoneValue) {
      if (!timezoneValue) return;
      this.currentTimezone = timezoneValue;
      localStorage.setItem("userTimezone", timezoneValue);
      dayjs.tz.setDefault(timezoneValue);
    }
  },
  getters: {
    formatDate:
      (state) =>
      (value, format = "YYYY-MM-DD") =>
        formatWithTimezone(value, state.currentTimezone, format),
    formatDateTime:
      (state) =>
      (value, format = "YYYY/MM/DD HH:mm:ss") =>
        formatWithTimezone(value, state.currentTimezone, format),
    convertToTimezone:
      (state) =>
      (value) => {
        const instance = ensureDayjsInstance(value);
        if (!instance) return "";
        try {
          return instance.tz(state.currentTimezone);
        } catch {
          return instance;
        }
      }
  }
});
