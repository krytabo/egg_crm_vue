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
      let errorMessage = "";

      try {
        if (error) {
          if (typeof error === "string") {
            errorMessage = error;
          } else if (error?.response?.data) {
            if (Array.isArray(error.response.data.errors)) {
              errorMessage = error.response.data.errors.join(", ");
            } else if (error.response.data.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
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
          errorMessage = i18n.global.t("swal.noDataFound") || "發生未知錯誤";
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        errorMessage = i18n.global.t("swal.noDataFound") || "發生未知錯誤";
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
      confirmButtonColor = "#F53F3F",
      cancelButtonColor = "#f2f3f5",
      onConfirm,
      onCancel,
      showLoading = true,
      showCancelButton = true,
      preConfirm,
      reverseButtons = false
    }) {
      const result = await Swal.fire({
        customClass: {
          cancelButton: "bg-[#f2f3f5] text-black"
        },
        title: title || null,
        text: text || null,
        html: html || null,
        icon,
        allowOutsideClick: false,
        showCancelButton,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText: confirmButtonText || i18n.global.t("swal.confirm"),
        cancelButtonText: cancelButtonText || i18n.global.t("swal.cancel"),
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
