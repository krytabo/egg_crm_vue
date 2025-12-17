# Mermaid 轉 Draw.io 快速指南

## 🚀 最簡單的方法：Draw.io 直接支援 Mermaid

### 步驟 1: 開啟 Draw.io
前往 https://app.diagrams.net/

### 步驟 2: 插入 Mermaid 圖表
1. 點擊菜單：`Arrange` → `Insert` → `Advanced` → `Mermaid`
2. 或按快捷鍵：`Ctrl + K` (Windows) / `Cmd + K` (Mac)

### 步驟 3: 複製貼上對應的 Mermaid 程式碼

---

## 📋 各圖表的 Mermaid 程式碼位置

### 1️⃣ ERD - 實體關聯圖

**檔案**: `/docs/ERD-Entity-Relationship-Diagram.md`

**複製範圍**: 從 ` ```mermaid` 到 ` ``` ` 之間的所有內容

**範例**:
```
找到這段：
```mermaid
erDiagram
    EMPLOYEE {
        int id PK "員工編號"
        ...
    }
    ...
```
複製整個 mermaid 區塊（不包含 ```mermaid 和 ``` 標記）
```

---

### 2️⃣ 業務流程圖

**檔案**: `/docs/Business-Process-Flowchart.md`

**包含 5 個流程圖**，每個都可以單獨插入：

#### A. 客戶開發與管理流程
```
搜尋關鍵字: "## 1. 客戶開發與管理流程"
複製其下方的完整 mermaid 區塊
```

#### B. 訂單處理流程
```
搜尋關鍵字: "## 2. 訂單處理流程"
複製其下方的完整 mermaid 區塊
```

#### C. 司機送貨報表流程
```
搜尋關鍵字: "## 3. 司機送貨報表流程"
複製其下方的完整 mermaid 區塊
```

#### D. 庫存管理流程
```
搜尋關鍵字: "## 4. 庫存管理流程"
複製其下方的完整 mermaid 區塊
```

#### E. 車輛管理流程
```
搜尋關鍵字: "## 5. 車輛管理流程"
複製其下方的完整 mermaid 區塊
```

**建議**: 在 Draw.io 中建立 5 個不同的頁面（tabs），每個流程一頁。

---

### 3️⃣ 系統架構圖

**檔案**: `/docs/System-Architecture-Diagram.md`

**包含 3 個架構圖**：

#### A. 整體系統架構
```
搜尋關鍵字: "## 整體系統架構"
複製其下方的 mermaid 區塊
```

#### B. 前端技術架構詳細說明
```
搜尋關鍵字: "## 前端技術架構詳細說明"
複製其下方的 mermaid 區塊
```

#### C. 資料流向圖
```
搜尋關鍵字: "## 資料流向圖"
複製其下方的 mermaid 區塊（sequenceDiagram）
```

---

### 4️⃣ 資料流程圖 (DFD)

**檔案**: `/docs/Data-Flow-Diagram.md`

**包含 7 個 DFD 圖表**：

#### Level 0: 系統總覽
```
搜尋關鍵字: "## Level 0: 系統總覽"
```

#### Level 1: 主要功能模組資料流
```
搜尋關鍵字: "## Level 1: 主要功能模組資料流"
```

#### Level 2 詳細圖表：
- 客戶管理詳細資料流
- 訂單管理詳細資料流
- 庫存管理詳細資料流
- 報表管理詳細資料流

**建議**: 建立多頁面 Draw.io 文件，分層級組織。

---

## 📐 Draw.io 最佳實務

### 建議的文件結構

#### 方案 A: 單一文件多頁面
```
檔案名稱: CRM-系統完整圖表.drawio

頁面 1: ERD 實體關聯圖
頁面 2: 業務流程 - 客戶開發
頁面 3: 業務流程 - 訂單處理
頁面 4: 業務流程 - 送貨報表
頁面 5: 業務流程 - 庫存管理
頁面 6: 業務流程 - 車輛管理
頁面 7: 系統架構 - 整體
頁面 8: 系統架構 - 前端
頁面 9: 系統架構 - 資料流
頁面 10: DFD Level 0
頁面 11: DFD Level 1
頁面 12: DFD Level 2 - 客戶
頁面 13: DFD Level 2 - 訂單
頁面 14: DFD Level 2 - 庫存
頁面 15: DFD Level 2 - 報表
```

#### 方案 B: 分類文件
```
1. CRM-ERD.drawio              (實體關聯圖)
2. CRM-業務流程.drawio         (5個業務流程)
3. CRM-系統架構.drawio         (3個架構圖)
4. CRM-資料流程.drawio         (7個DFD圖)
```

---

## 🎨 Draw.io 編輯技巧

### 調整 Mermaid 圖表大小
1. 點擊插入的 Mermaid 圖表
2. 拖曳邊角調整大小
3. **保持比例**: 按住 `Shift` 鍵拖曳

### 編輯 Mermaid 內容
1. 雙擊 Mermaid 圖表
2. 修改語法
3. 點擊 "Apply" 或 "Insert"

### 匯出高品質圖片
1. `File` → `Export as` → `PNG`
2. 設定：
   - **Zoom**: 200% 或更高（提高解析度）
   - **Border Width**: 10-20 像素
   - **Transparent Background**: 勾選（如需透明背景）

### 列印設定
1. `File` → `Page Setup`
2. 紙張大小：建議 A3 或更大（適合大型圖表）
3. 方向：橫向 (Landscape)
4. 縮放：Fit to 1 page

---

## 🔧 進階功能

### 1. 連結到其他頁面
可以在圖表元素上加入超連結，連結到其他頁面：
1. 選擇元素
2. 右鍵 → `Edit Link`
3. 選擇 `Page` 並選擇目標頁面

### 2. 新增註解與說明
- 使用文字方塊補充說明
- 使用不同顏色區分不同模組
- 加入圖例 (Legend)

### 3. 圖層管理
對於複雜圖表，使用圖層：
1. `View` → `Layers`
2. 建立圖層：資料表、關聯線、註解等
3. 可單獨顯示/隱藏特定圖層

---

## 📤 匯出選項

### 用於簡報 (PowerPoint/Google Slides)
```
格式: PNG
解析度: 300 DPI
背景: 透明
建議尺寸: 1920x1080 或 3840x2160
```

### 用於文件 (Word/Google Docs)
```
格式: PNG 或 SVG
解析度: 200-300 DPI
背景: 白色
```

### 用於網頁展示
```
格式: SVG (向量圖，可無限縮放)
或 HTML (互動式)
```

### 用於列印
```
格式: PDF
頁面: A3 或 A2
方向: 橫向
邊界: 適中
```

---

## ⚡ 快速操作清單

### 新增單一圖表
- [ ] 1. 開啟 https://app.diagrams.net/
- [ ] 2. 建立新文件或開啟現有文件
- [ ] 3. 按 `Ctrl/Cmd + K` 開啟 Mermaid 編輯器
- [ ] 4. 從技術文件複製 Mermaid 程式碼
- [ ] 5. 貼上並點擊 "Insert"
- [ ] 6. 調整大小與位置
- [ ] 7. 儲存文件

### 建立完整圖表集合
- [ ] 1. 建立新 Draw.io 文件
- [ ] 2. 為每個主要圖表新增頁面
- [ ] 3. 依序插入所有 Mermaid 圖表
- [ ] 4. 統一調整樣式與配色
- [ ] 5. 新增頁面導航（可選）
- [ ] 6. 儲存並匯出為 PDF

---

## 🎓 學習資源

### Draw.io 官方教學
- [基礎教學](https://www.diagrams.net/doc/getting-started)
- [進階功能](https://www.diagrams.net/blog/advanced-features)
- [快捷鍵列表](https://www.diagrams.net/shortcuts)

### Mermaid 語法參考
- [官方文件](https://mermaid.js.org/)
- [範例集](https://mermaid.js.org/ecosystem/integrations.html)
- [線上編輯器](https://mermaid.live/)

---

## 💡 小技巧

### 技巧 1: 批次處理
如果需要處理多個圖表，可以：
1. 先在 Mermaid Live Editor (https://mermaid.live/) 預覽
2. 確認無誤後再插入 Draw.io
3. 避免重複修改

### 技巧 2: 版本控制
建議同時保留：
- **Markdown 文件** (主要來源，易於版本控制)
- **Draw.io 文件** (展示與列印用)
- **匯出的 PDF** (最終文件)

### 技巧 3: 團隊協作
使用 Google Drive 或 OneDrive 存放 .drawio 文件：
- 支援即時協作
- 自動版本歷史
- 易於分享

### 技巧 4: 命名規範
```
CRM-ERD-v1.0-20250103.drawio
CRM-業務流程-v1.0-20250103.drawio
CRM-系統架構-v1.0-20250103.drawio
CRM-資料流程-v1.0-20250103.drawio
```

---

## ❗ 注意事項

1. **Mermaid 語法限制**: Draw.io 的 Mermaid 支援可能不包含所有最新語法
2. **圖表大小**: 非常大的圖表可能渲染緩慢，建議拆分
3. **中文字體**: 確保選擇支援中文的字體（如 Microsoft JhengHei, Noto Sans TC）
4. **備份**: 定期備份 .drawio 原始文件

---

## 🎯 總結

**最推薦的工作流程**:

```
1. 維護 Mermaid 原始碼 (在 .md 文件中)
   ↓
2. 需要展示時，插入到 Draw.io
   ↓
3. 調整樣式、新增註解
   ↓
4. 匯出為 PDF/PNG 用於分享
```

這樣可以保持：
- ✅ 原始碼易於維護與版本控制
- ✅ 視覺化圖表美觀易讀
- ✅ 支援團隊協作
- ✅ 適合各種使用場景

---

**文件版本**: v1.0  
**建立日期**: 2025-01-03  
**適用對象**: 所有需要使用技術圖表的團隊成員
