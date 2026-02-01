//src/stores/loadingStore.js
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import i18n from "@/assets/Language/i18n.js";

export const useLoadingStore = defineStore("loadingStore", {
  state: () => ({
    fullLoading: false,
    componentLoading: false,
    customLoadingMessage: null
  }),
  actions: {
    setFullLoading(status) {
      this.fullLoading = status;
    },
    setComponentLoading(status) {
      this.componentLoading = status;
    }
  }
});

export const useMainStore = defineStore("main", {
  state: () => ({
    loading: false,
    syncState: false,
    showProgress: false,
    progressNumber: 0,
    customLoadingMessage: null
  }),
  getters: {
    loadingMessage: (state) => {
      return state.customLoadingMessage || i18n.global.t("loadingPleaseWait");
    }
  },
  actions: {
    /** Loading相關 **/
    setLoading(status) {
      this.loading = status;
    },
    setSync(status) {
      this.syncState = status;
    },
    setShowProgress(value) {
      this.showProgress = value;
    },
    setProgress(value) {
      this.progressNumber = value;
    },
    setLoadingMessage(message) {
      this.customLoadingMessage = message;
    },
    resetLoadingMessage() {
      this.customLoadingMessage = null;
    },

    /** Alert相關 **/
    async SWAL_Success(customTitle, customMessage = "", customIcon = "success") {
      await Swal.fire({
        title: customTitle || i18n.global.t("swal.saveCompleted"),
        text: customMessage,
        icon: customIcon,
        allowOutsideClick: false,
        confirmButtonText: i18n.global.t("swal.confirm"),
        showCancelButton: false,
        confirmButtonColor: "#165DFF"
      });
    },
    async SWAL_Success_html(customTitle, customMessage, customIcon = "success") {
      await Swal.fire({
        title: customTitle || i18n.global.t("swal.saveCompleted"),
        html: customMessage || null,
        icon: customIcon,
        allowOutsideClick: false,
        confirmButtonText: i18n.global.t("swal.confirm"),
        showCancelButton: false,
        confirmButtonColor: "#165DFF"
      });
    },
    async SWAL_Error(error, customTitle, customIcon = "error") {
      const fallbackMessage = i18n.global.t("swal.noDataFound") || "發生未知錯誤";
      let errorMessage = "";
      // error?.response?.data?.message || error?.message || fallback;

      const normalizeErrorList = (errors) => {
        if (!Array.isArray(errors)) return [];
        return errors
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") return item;
            if (typeof item === "object") {
              if (item.message) return item.message;
              if (item.code) return item.code;
              return JSON.stringify(item);
            }
            return String(item);
          })
          .filter(Boolean);
      };

      try {
        if (error) {
          if (typeof error === "string") {
            errorMessage = error;
          } else if (error?.response?.data) {
            const { data } = error.response;
            const normalizedErrors = normalizeErrorList(data.errors);
            if (normalizedErrors.length) {
              errorMessage = normalizedErrors.join("\n");
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (typeof data === "string") {
              errorMessage = data;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.data?.message) {
            errorMessage = error.data.message;
          } else {
            errorMessage = String(error);
          }
        }

        if (!errorMessage) {
          errorMessage = fallbackMessage;
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        errorMessage = fallbackMessage;
      }

      await Swal.fire({
        title: customTitle || i18n.global.t("swal.errorOccurred"),
        text: errorMessage,
        icon: customIcon,
        allowOutsideClick: false,
        confirmButtonText: i18n.global.t("swal.confirm"),
        showCancelButton: false,
        confirmButtonColor: "#165DFF"
      });
    },
    async SWAL_Confirm({
      title,
      text,
      html,
      icon = "warning",
      confirmButtonText,
      cancelButtonText,
      denyButtonText,
      confirmButtonColor = "#F53F3F",
      cancelButtonColor = "#f2f3f5",
      denyButtonColor = "#6c757d",
      onConfirm,
      onCancel,
      onDeny,
      showLoading = true,
      showCancelButton = true,
      showDenyButton = false,
      preConfirm,
      reverseButtons = false
    }) {
      const result = await Swal.fire({
        customClass: {
          cancelButton: "bg-[#f2f3f5] text-black!"
        },
        title: title || null,
        text: text || null,
        html: html || null,
        icon,
        allowOutsideClick: false,
        showCancelButton,
        showDenyButton,
        confirmButtonColor,
        cancelButtonColor,
        denyButtonColor,
        confirmButtonText: confirmButtonText || i18n.global.t("swal.confirm"),
        cancelButtonText: cancelButtonText || i18n.global.t("swal.cancel"),
        denyButtonText: denyButtonText || i18n.global.t("swal.deny", "拒絕"),
        preConfirm: preConfirm || null,
        allowEscapeKey: false,
        reverseButtons
      });

      if (result.isConfirmed && onConfirm) {
        try {
          if (showLoading) {
            this.setLoading(true);
          }
          await onConfirm();
        } catch (error) {
          await this.SWAL_Error(error);
        } finally {
          if (showLoading) {
            this.setLoading(false);
          }
        }
      } else if (result.isDenied && onDeny) {
        try {
          if (showLoading) {
            this.setLoading(true);
          }
          await onDeny();
        } catch (error) {
          await this.SWAL_Error(error);
        } finally {
          if (showLoading) {
            this.setLoading(false);
          }
        }
      } else if (result.isDismissed && onCancel) {
        try {
          await onCancel();
        } catch (error) {
          await this.SWAL_Error(error);
        }
      }

      return result;
    }, //通用的確認對話框
    async SWAL_DeleteConfirm({ title, text, onConfirm, confirmButtonText, cancelButtonText, showLoading = true }) {
      return this.SWAL_Confirm({
        title: title || i18n.global.t("swal.aboutToDelete"),
        text: text || i18n.global.t("swal.dataCannotBeRecovered"),
        icon: "warning",
        confirmButtonColor: "#F53F3F",
        confirmButtonText: confirmButtonText || i18n.global.t("swal.confirm"),
        cancelButtonText: cancelButtonText || i18n.global.t("swal.cancel"),
        onConfirm,
        showLoading
      });
    } //刪除確認對話框
  }
});
