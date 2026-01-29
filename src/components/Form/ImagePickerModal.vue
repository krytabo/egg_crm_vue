<!-- 通用圖片選取彈窗 -->
<template>
  <a-modal
    :visible="visible"
    :title="title"
    :width="560"
    :mask-closable="false"
    :closable="true"
    :destroy-on-close="true"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <div class="h-24 w-24 overflow-hidden rounded-full border border-dashed border-gray-200">
          <a-image v-if="currentPreview" :src="currentPreview" fit="cover" width="96" height="96" />
          <div v-else class="flex h-full w-full items-center justify-center text-xs text-gray-400">無預覽</div>
        </div>
        <div class="text-xs text-gray-500">
          <p>可以貼上圖片網址、將檔案轉為 Base64，或透過 API 上傳取得圖檔網址。</p>
          <p>檔案大小上限 {{ (maxSize / 1024 / 1024).toFixed(1) }} MB，格式：{{ accept }}</p>
        </div>
      </div>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane v-if="modes.includes('url')" key="url" title="貼上網址">
          <div class="space-y-2">
            <a-input v-model="urlInput" placeholder="https://example.com/avatar.png" allow-clear />
            <div class="flex gap-2">
              <Button type="primary" size="sm" @click="applyUrl" :disabled="!urlInput.trim()">套用網址</Button>
              <Button size="sm" variant="ghost" @click="urlInput = ''">清除</Button>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane v-if="modes.includes('base64')" key="base64" title="檔案轉 Base64">
          <div class="space-y-3">
            <input ref="base64InputRef" type="file" :accept="accept" class="hidden" @change="handleBase64File" />
            <div class="flex items-center gap-2">
              <Button size="sm" @click="triggerBase64Picker">選擇檔案</Button>
              <span class="text-xs text-gray-500">{{ base64FileName || "尚未選擇檔案" }}</span>
            </div>
            <div v-if="base64Preview" class="rounded border bg-gray-50 p-2">
              <a-image :src="base64Preview" width="160" height="160" fit="cover" />
            </div>
            <Button type="primary" size="sm" :disabled="!base64Preview" @click="applyBase64">使用此圖片</Button>
          </div>
        </a-tab-pane>

        <a-tab-pane v-if="modes.includes('upload')" key="upload" title="透過 API 上傳">
          <div class="space-y-3">
            <input ref="uploadInputRef" type="file" :accept="accept" class="hidden" @change="handleUploadFile" />
            <div class="flex items-center gap-2">
              <Button size="sm" @click="triggerUploadPicker">{{ uploadFileName ? "重新選擇" : "選擇檔案" }}</Button>
              <span class="text-xs text-gray-500">{{ uploadFileName || "尚未選擇檔案" }}</span>
            </div>
            <p class="text-xs text-gray-500">需提供 uploadApi 才能將檔案上傳至伺服器。</p>
            <Button type="primary" size="sm" :loading="uploading" :disabled="!uploadFile || !canUpload" @click="applyUpload">
              {{ canUpload ? "上傳並使用" : "等待 API" }}
            </Button>
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="ghost" @click="handleCancel">取消</Button>
        <Button type="primary" @click="handleConfirmLatest" :disabled="!currentPreview">使用目前預覽</Button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import Notify from "@opentiny/vue-notify";
import { Button } from "@/components/ui/button";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "更新圖片"
  },
  accept: {
    type: String,
    default: "image/*"
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  modes: {
    type: Array,
    default: () => ["url", "base64", "upload"]
  },
  uploadApi: {
    type: Function,
    default: null
  }
});
const emit = defineEmits(["update:modelValue", "update:visible", "change"]);

const urlInput = ref("");
const base64Preview = ref("");
const base64FileName = ref("");
const uploadFile = ref(null);
const uploadFileName = ref("");
const uploadPreview = ref("");
const uploading = ref(false);
const base64InputRef = ref(null);
const uploadInputRef = ref(null);
const activeTab = ref("url");

const canUpload = computed(() => typeof props.uploadApi === "function");
const currentPreview = computed(() => {
  if (activeTab.value === "base64" && base64Preview.value) return base64Preview.value;
  if (activeTab.value === "upload" && uploadPreview.value) return uploadPreview.value;
  if (activeTab.value === "url" && urlInput.value.trim()) return urlInput.value.trim();
  return props.modelValue || "";
});

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetState();
    }
  }
);

const resetState = () => {
  urlInput.value = props.modelValue || "";
  base64Preview.value = "";
  base64FileName.value = "";
  uploadFile.value = null;
  uploadFileName.value = "";
  revokePreview(uploadPreview.value);
  uploadPreview.value = "";
  uploading.value = false;
  activeTab.value = props.modes.includes("url") ? "url" : props.modes[0] || "url";
};

const revokePreview = (value) => {
  if (value && value.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
};
watch(uploadPreview, (newVal, oldVal) => {
  if (oldVal) revokePreview(oldVal);
});
onBeforeUnmount(() => {
  revokePreview(uploadPreview.value);
});

const handleCancel = () => {
  emit("update:visible", false);
};

const applyValue = (value) => {
  if (!value) return;
  emit("update:modelValue", value);
  emit("change", value);
  handleCancel();
};

const applyUrl = () => {
  const url = urlInput.value.trim();
  if (!url) {
    Notify({ type: "warning", title: "請輸入網址", message: "請先貼上圖片網址再套用" });
    return;
  }
  applyValue(url);
};

const triggerBase64Picker = () => {
  base64InputRef.value?.click();
};

const triggerUploadPicker = () => {
  uploadInputRef.value?.click();
};

const validateFile = (file) => {
  if (!file) return false;
  if (!file.type.startsWith("image/")) {
    Notify({ type: "warning", title: "格式錯誤", message: "請選擇圖片檔案" });
    return false;
  }
  if (file.size > props.maxSize) {
    Notify({ type: "warning", title: "檔案過大", message: `請選擇小於 ${(props.maxSize / 1024 / 1024).toFixed(1)} MB 的圖片` });
    return false;
  }
  return true;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const handleBase64File = async (event) => {
  const file = event?.target?.files?.[0];
  event.target.value = "";
  if (!validateFile(file)) return;
  try {
    const result = await fileToBase64(file);
    base64Preview.value = result;
    base64FileName.value = file.name;
  } catch (error) {
    Notify({ type: "error", title: "轉換失敗", message: error?.message || "無法將檔案轉為 Base64" });
  }
};

const handleUploadFile = (event) => {
  const file = event?.target?.files?.[0];
  event.target.value = "";
  if (!validateFile(file)) return;
  uploadFile.value = file;
  uploadFileName.value = file.name;
  const previewUrl = URL.createObjectURL(file);
  uploadPreview.value = previewUrl;
};

const applyBase64 = () => {
  if (!base64Preview.value) {
    Notify({ type: "warning", title: "請選擇檔案", message: "尚未選擇任何圖片檔案" });
    return;
  }
  applyValue(base64Preview.value);
};

const applyUpload = async () => {
  if (!uploadFile.value) {
    Notify({ type: "warning", title: "請選擇檔案", message: "尚未選擇任何圖片檔案" });
    return;
  }
  if (!canUpload.value) {
    Notify({ type: "warning", title: "尚未提供 API", message: "請先實作 uploadApi 後再使用此功能" });
    return;
  }
  try {
    uploading.value = true;
    const url = await props.uploadApi(uploadFile.value);
    if (!url) throw new Error("上傳後未取得圖片網址");
    applyValue(url);
  } catch (error) {
    Notify({ type: "error", title: "上傳失敗", message: error?.message || "無法上傳圖片" });
  } finally {
    uploading.value = false;
  }
};

const handleConfirmLatest = () => {
  const preview = currentPreview.value;
  if (!preview) {
    Notify({ type: "warning", title: "沒有可用的圖片", message: "請先選擇或輸入圖片來源" });
    return;
  }
  applyValue(preview);
};
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
