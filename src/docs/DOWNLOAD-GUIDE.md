# 📥 CRM 系統技術文件下載與使用指南

## 🎯 總覽

本指南說明如何下載與使用 CRM 管理系統的完整技術文件。

---

## 📚 可用文件清單

### ✅ 已完成的文件（全部使用 Mermaid 格式）

| 檔案名稱 | 說明 | 圖表數量 | 適合對象 |
|---------|------|---------|---------|
| [README.md](./README.md) | 技術文件總覽與導讀 | - | 所有人 |
| [ERD-Entity-Relationship-Diagram.md](./ERD-Entity-Relationship-Diagram.md) | 實體關聯圖 | 1 個大型 ERD | 資料庫設計師、後端開發 |
| [Business-Process-Flowchart.md](./Business-Process-Flowchart.md) | 業務流程圖 | 5 個流程圖 | 產品經理、業務分析師 |
| [System-Architecture-Diagram.md](./System-Architecture-Diagram.md) | 系統架構圖 | 4 個架構圖 | 系統架構師、技術主管 |
| [Data-Flow-Diagram.md](./Data-Flow-Diagram.md) | 資料流程圖 (DFD) | 7 個 DFD 圖 | 系統分析師、開發人員 |
| [How-to-Use-Diagrams-in-DrawIO.md](./How-to-Use-Diagrams-in-DrawIO.md) | Draw.io 完整使用指南 | - | 需要編輯圖表的人 |
| [mermaid-to-drawio-guide.md](./mermaid-to-drawio-guide.md) | Mermaid 轉 Draw.io 快速指南 | - | 技術與非技術人員 |

**總計**: 7 個文件，包含 20+ 個 Mermaid 圖表

---

## 💾 下載方式

### 方法 1: 完整專案下載（推薦）

如果您有 Git 存取權限：

```bash
# Clone 整個專案
git clone [專案網址]

# 技術文件位於 /docs 目錄
cd docs
```

### 方法 2: 單獨下載文件

從 GitHub 或專案平台下載個別文件：

1. 開啟想要的文件
2. 點擊 "Raw" 按鈕
3. 右鍵 → "另存新檔" → 儲存為 `.md` 檔案

### 方法 3: 匯出為 PDF（推薦用於分享）

**使用 VS Code**:
1. 安裝擴充套件：`Markdown PDF`
2. 開啟 Markdown 文件
3. 按 `Ctrl/Cmd + Shift + P`
4. 選擇 `Markdown PDF: Export (pdf)`

**使用線上工具**:
1. 複製整個 Markdown 內容
2. 前往 https://dillinger.io/
3. 貼上內容
4. 點擊 `Export as` → `PDF`

---

## 🎨 圖表檢視與編輯

### A. 檢視 Mermaid 圖表（唯讀）

#### GitHub 直接檢視
- ✅ 最簡單的方式
- ✅ 無需安裝任何工具
- ✅ 自動渲染 Mermaid 圖表

#### VS Code 檢視
1. 安裝 `Markdown Preview Mermaid Support`
2. 開啟 `.md` 文件
3. 按 `Ctrl/Cmd + Shift + V` 預覽

#### 線上工具檢視
- [Mermaid Live Editor](https://mermaid.live/) - 複製 mermaid 程式碼到編輯器

### B. 在 Draw.io 中編輯（可編輯）

**推薦：用於製作簡報、列印、精美展示**

#### 快速步驟：
```
1. 前往 https://app.diagrams.net/
2. 建立新文件或開啟現有檔案
3. 按 Ctrl/Cmd + K（開啟 Mermaid 插入功能）
4. 從技術文件複製 Mermaid 程式碼
5. 貼上並點擊 "Insert"
6. 調整樣式、匯出為 PDF/PNG
```

#### 詳細指南：
- 📖 [完整 Draw.io 使用指南](./How-to-Use-Diagrams-in-DrawIO.md)
- 🚀 [快速轉換指南](./mermaid-to-drawio-guide.md)

---

## 📋 使用情境指南

### 情境 1: 快速瀏覽系統設計

**需求**: 了解系統整體架構與設計

**建議步驟**:
1. 先閱讀 [README.md](./README.md) 獲得整體概念
2. 在 GitHub 上直接檢視各個技術文件
3. Mermaid 圖表會自動渲染

**時間**: 30-60 分鐘

---

### 情境 2: 深入研究特定模組

**需求**: 詳細了解某個功能的實作細節

**建議步驟**:
1. 閱讀 [Business-Process-Flowchart.md](./Business-Process-Flowchart.md) 理解業務邏輯
2. 查看 [ERD](./ERD-Entity-Relationship-Diagram.md) 了解資料結構
3. 參考 [DFD](./Data-Flow-Diagram.md) 追蹤資料流向
4. 使用 VS Code 或線上工具放大檢視圖表

**時間**: 1-2 小時

---

### 情境 3: 製作專案簡報

**需求**: 向客戶或團隊展示系統設計

**建議步驟**:
1. 使用 Draw.io 開啟所需圖表
2. 插入 Mermaid 程式碼（從技術文件複製）
3. 調整顏色與樣式符合簡報風格
4. 匯出為高解析度 PNG：
   - `File` → `Export as` → `PNG`
   - Zoom: 300%
   - Transparent Background: ✓
5. 插入到 PowerPoint/Google Slides

**時間**: 2-3 小時（包含調整樣式）

---

### 情境 4: 列印技術文件

**需求**: 列印完整技術圖表供會議使用

**建議步驟**:
1. 使用 Draw.io 建立多頁面文件
2. 依序插入所有 Mermaid 圖表
3. 設定頁面為 A3 橫向
4. 匯出為 PDF：
   - `File` → `Export as` → `PDF`
   - All Pages: ✓
   - Fit to: 1 page
5. 使用專業列印服務列印

**建議紙張**: A3 或 A2（適合大型圖表）

---

### 情境 5: 系統維護與更新

**需求**: 系統功能變更，需更新文件

**建議步驟**:
1. 修改對應的 Markdown 文件中的 Mermaid 程式碼
2. 使用 Git 進行版本控制
3. 提交變更並附上說明
4. 如有使用 Draw.io 版本，同步更新：
   - 重新插入修改後的 Mermaid 程式碼
   - 或手動調整 Draw.io 圖表

**最佳實踐**: Markdown 文件為主要來源 (Source of Truth)

---

## 🗂️ 建議的檔案組織

### 本地儲存結構

```
CRM-系統文件/
├── 01-原始文件/
│   ├── README.md
│   ├── ERD-Entity-Relationship-Diagram.md
│   ├── Business-Process-Flowchart.md
│   ├── System-Architecture-Diagram.md
│   └── Data-Flow-Diagram.md
│
├── 02-Draw.io-文件/
│   ├── CRM-ERD.drawio
│   ├── CRM-業務流程.drawio
│   ├── CRM-系統架構.drawio
│   └── CRM-資料流程.drawio
│
├── 03-匯出圖片/
│   ├── PNG/
│   │   ├── ERD.png
│   │   ├── 業務流程-客戶開發.png
│   │   └── ...
│   └── PDF/
│       ├── 完整技術文件.pdf
│       └── 各別圖表.pdf
│
└── 04-簡報素材/
    ├── PowerPoint/
    └── Google-Slides/
```

---

## 🔄 版本控制建議

### Markdown 文件（主要）
```bash
# 追蹤變更
git add docs/*.md
git commit -m "更新庫存管理流程圖"
git push

# 查看歷史
git log docs/Business-Process-Flowchart.md
```

### Draw.io 文件（輔助）
```
建議存放位置:
- Google Drive 或 OneDrive（支援版本歷史）
- 或納入 Git 版本控制（.drawio 為 XML 格式，可追蹤）

命名規範:
CRM-[圖表類型]-v[版本號]-[日期].drawio
例如: CRM-ERD-v1.0-20250103.drawio
```

---

## 🎓 學習路徑

### 新進人員（0-2 週）
```
第 1 天: README.md (系統概述)
第 2-3 天: Business-Process-Flowchart.md (業務流程)
第 4-5 天: System-Architecture-Diagram.md (技術架構)
第 2 週: ERD + DFD (深入資料設計)
```

### 開發人員（上手前）
```
1. System-Architecture-Diagram.md (了解技術棧)
2. ERD (資料庫設計)
3. DFD (資料流向)
4. Business-Process-Flowchart.md (實作參考)
```

### 產品/業務人員
```
1. README.md (功能總覽)
2. Business-Process-Flowchart.md (業務邏輯)
3. (可選) System-Architecture.md (了解系統能力)
```

---

## 📊 圖表統計

### 按類型分類

| 圖表類型 | 數量 | 文件位置 |
|---------|------|---------|
| Entity Relationship Diagram (ERD) | 1 | ERD-Entity-Relationship-Diagram.md |
| Flowchart | 5 | Business-Process-Flowchart.md |
| Architecture Diagram | 4 | System-Architecture-Diagram.md |
| Data Flow Diagram (DFD) | 7 | Data-Flow-Diagram.md |
| Sequence Diagram | 1 | System-Architecture-Diagram.md |
| Mind Map | 1 | System-Architecture-Diagram.md |

**總計**: 19 個圖表

### 按複雜度分類

| 複雜度 | 圖表 | 建議檢視方式 |
|-------|------|-------------|
| 🟢 簡單 | 系統總覽、前端技術架構 | GitHub 直接檢視 |
| 🟡 中等 | 各業務流程圖、DFD Level 1 | VS Code 或 Draw.io |
| 🔴 複雜 | ERD、庫存管理流程、DFD Level 2 | Draw.io（放大檢視） |

---

## 🛠️ 推薦工具

### 檢視與編輯
- [VS Code](https://code.visualstudio.com/) + Mermaid 擴充套件
- [Draw.io Desktop](https://get.diagrams.net/) 或 [線上版](https://app.diagrams.net/)
- [Mermaid Live Editor](https://mermaid.live/)

### 匯出與轉換
- [Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) (VS Code)
- [Dillinger](https://dillinger.io/) (線上 Markdown 編輯器)
- Draw.io 內建匯出功能

### 協作工具
- GitHub / GitLab (版本控制)
- Google Drive / OneDrive (Draw.io 雲端儲存)
- Notion / Confluence (整合文件)

---

## ⚡ 快速操作指令

### 下載所有技術文件
```bash
# 使用 wget (Linux/Mac)
wget -r -np -nH --cut-dirs=1 -R "index.html*" [專案網址]/docs/

# 使用 Git
git clone [專案網址]
cd docs
```

### 批次匯出為 PDF (VS Code)
```
1. 安裝 Markdown PDF 擴充套件
2. 開啟每個 .md 文件
3. 按 F1 → "Markdown PDF: Export (pdf)"
```

### 建立 Draw.io 完整文件
```
1. 開啟 Draw.io
2. 建立新文件，命名為 "CRM-完整技術圖表"
3. 新增 19 個頁面（每個圖表一頁）
4. 依序插入所有 Mermaid 圖表
5. 匯出為 PDF (All Pages)
```

---

## 📞 支援與回饋

如有任何問題或建議：

- **技術問題**: 聯絡開發團隊
- **文件勘誤**: 提交 Issue 或 Pull Request
- **功能建議**: 聯絡產品經理

---

## 📝 更新日誌

### v1.0 (2025-01-03)
- ✅ 建立完整技術文件（7 個文件）
- ✅ 繪製 19 個 Mermaid 圖表
- ✅ 提供 Draw.io 使用指南
- ✅ 建立下載與使用指南

---

## 🎯 下一步

建議您：

1. ✅ **立即開始**: 從 [README.md](./README.md) 開始閱讀
2. ✅ **實作練習**: 使用 Draw.io 插入一個 Mermaid 圖表
3. ✅ **深入學習**: 選擇與您職責相關的文件深入研究
4. ✅ **保持更新**: 定期檢查文件更新

---

**祝您使用愉快！** 🎉

---

**文件版本**: v1.0  
**建立日期**: 2025-01-03  
**維護團隊**: CRM 系統開發團隊
