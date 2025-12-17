# 如何在 Draw.io 中使用技術圖表

## 📝 說明

本 CRM 系統的技術圖表原本使用 **Mermaid** 語法編寫。Draw.io (app.diagrams.net) 支援多種方式來使用這些圖表。

---

## 🎯 方法 1: Draw.io 內建 Mermaid 支援（推薦）

Draw.io 支援直接插入 Mermaid 圖表！

### 步驟：

1. **開啟 Draw.io**
   - 前往 https://app.diagrams.net/
   - 選擇儲存位置（裝置、Google Drive、OneDrive 等）

2. **插入 Mermaid 圖表**
   - 點擊菜單：`Arrange` → `Insert` → `Advanced` → `Mermaid`
   - 或使用快捷鍵：`Ctrl/Cmd + K`，然後選擇 "Mermaid"

3. **貼上 Mermaid 程式碼**
   - 從我們的技術文件中複製 Mermaid 程式碼區塊
   - 貼到 Draw.io 的 Mermaid 編輯器中
   - 點擊 "Insert" 或 "Apply"

4. **編輯與調整**
   - Draw.io 會自動渲染 Mermaid 圖表
   - 可以調整大小、位置
   - 如需修改內容，雙擊圖表即可編輯 Mermaid 語法

### 優點：
- ✅ 保持原始 Mermaid 語法
- ✅ 可隨時編輯與更新
- ✅ 支援所有 Mermaid 圖表類型
- ✅ 可與其他 Draw.io 元素混合使用

---

## 🎯 方法 2: 匯入現成的 Draw.io 文件

我已經為您準備了預先配置的 Draw.io 文件模板（見下方）。

### 使用步驟：

1. 前往 https://app.diagrams.net/
2. 點擊 `File` → `Open from` → `Device`
3. 選擇 `/docs/diagrams/` 目錄下的 `.drawio` 文件
4. 直接編輯與使用

---

## 🎯 方法 3: 複製 Mermaid 程式碼區塊

### 從我們的文件中複製：

#### ERD (實體關聯圖)
文件位置：`/docs/ERD-Entity-Relationship-Diagram.md`

```
在 Draw.io 中：
1. 點擊 Arrange → Insert → Advanced → Mermaid
2. 複製整個 ```mermaid ... ``` 區塊內的程式碼
3. 貼上並點擊 Insert
```

#### 業務流程圖
文件位置：`/docs/Business-Process-Flowchart.md`

```
包含 5 個主要流程：
1. 客戶開發與管理流程
2. 訂單處理流程
3. 司機送貨報表流程
4. 庫存管理流程
5. 車輛管理流程

每個流程都可以單獨插入為一個 Mermaid 圖表
```

#### 系統架構圖
文件位置：`/docs/System-Architecture-Diagram.md`

```
包含 3 個圖表：
1. 整體系統架構
2. 前端技術架構
3. 資料流向圖
```

#### 資料流程圖 (DFD)
文件位置：`/docs/Data-Flow-Diagram.md`

```
包含多層級圖表：
- Level 0: 系統總覽
- Level 1: 主要功能模組
- Level 2: 詳細資料流（4 個子圖）
```

---

## 🎯 方法 4: 使用線上轉換工具

### Mermaid Live Editor → 匯出 PNG/SVG

1. 前往 https://mermaid.live/
2. 貼上 Mermaid 程式碼
3. 點擊 `Download PNG` 或 `Download SVG`
4. 在 Draw.io 中插入圖片：`File` → `Import` → 選擇下載的圖片

### 優點：
- ✅ 高品質圖片
- ✅ 可縮放（SVG 格式）
- ✅ 適合最終報告

### 缺點：
- ❌ 無法在 Draw.io 中編輯原始 Mermaid 語法
- ❌ 更新時需重新匯出

---

## 📂 Draw.io 文件結構

我已為您創建以下 Draw.io 文件：

```
/docs/diagrams/
├── 01-ERD.drawio                    # 實體關聯圖
├── 02-Business-Process.drawio       # 業務流程圖（全部流程）
├── 03-System-Architecture.drawio    # 系統架構圖
├── 04-Data-Flow.drawio              # 資料流程圖
└── 00-All-Diagrams.drawio           # 完整技術圖表集合
```

---

## 🛠️ Draw.io 使用技巧

### 1. 多頁面管理
Draw.io 支援多頁面（tabs），每個圖表可以放在不同頁面：
- 點擊底部的 `+` 新增頁面
- 右鍵點擊頁籤可重新命名、複製、刪除

### 2. 圖層管理
使用圖層組織複雜圖表：
- 點擊右側面板的 `View` → `Layers`
- 可為不同元素建立圖層
- 方便顯示/隱藏特定部分

### 3. 樣式與主題
- 使用 `Format Panel` 調整顏色、字體、線條
- 可套用內建主題
- 建議與系統實際 UI 顏色一致

### 4. 協作功能
如使用 Google Drive 或 OneDrive：
- 多人可同時編輯
- 自動儲存版本歷史
- 可分享連結給團隊成員

### 5. 匯出格式
Draw.io 支援匯出多種格式：
- **PDF**: 適合列印與分享
- **PNG/JPG**: 插入文件或簡報
- **SVG**: 向量圖，可無限縮放
- **HTML**: 互動式網頁
- **XML**: 原始 .drawio 格式

---

## 🎨 建議的配色方案

為保持與系統 UI 一致，建議使用以下顏色：

### 主要顏色
```
藍色系（主要）: #4fc3f7, #61dafb, #e1f5ff, #b3e5fc
綠色系（成功）: #c8e6c9
黃色系（警告）: #fff9c4, #fff3e0
紅色系（錯誤）: #ffccbc, #ffebee
紫色系（特殊）: #e1bee7
```

### 模組顏色對應
```
- 客戶管理: 淺藍色 #e1f5ff
- 訂單管理: 淺黃色 #fff9c4
- 庫存管理: 淺綠色 #c8e6c9
- 報表管理: 淺紫色 #e1bee7
- 系統管理: 淺灰色 #f5f5f5
```

---

## 📚 快速參考

### Mermaid 圖表類型對照

| Mermaid 類型 | Draw.io 對應 | 說明 |
|-------------|-------------|------|
| `graph` / `flowchart` | Flowchart | 流程圖 |
| `erDiagram` | Entity Relation | 實體關聯圖 |
| `sequenceDiagram` | Sequence Diagram | 時序圖 |
| `classDiagram` | UML Class Diagram | 類別圖 |
| `mindmap` | Mind Map | 心智圖 |

### Draw.io 常用快捷鍵

| 功能 | Windows/Linux | macOS |
|-----|---------------|-------|
| 新增圖表 | `Ctrl + N` | `Cmd + N` |
| 儲存 | `Ctrl + S` | `Cmd + S` |
| 復原 | `Ctrl + Z` | `Cmd + Z` |
| 重做 | `Ctrl + Y` | `Cmd + Shift + Z` |
| 插入 Mermaid | `Ctrl + K` | `Cmd + K` |
| 搜尋圖形 | `Ctrl + Shift + F` | `Cmd + Shift + F` |
| 對齊 | `Ctrl + Shift + Arrow` | `Cmd + Shift + Arrow` |

---

## 🔄 更新圖表流程

當系統需求變更時：

1. **更新 Mermaid 原始碼**
   - 編輯 `/docs/*.md` 文件中的 Mermaid 程式碼

2. **同步到 Draw.io**
   - 方法 A: 重新插入 Mermaid 程式碼到 Draw.io
   - 方法 B: 匯出新的 PNG/SVG 並替換

3. **版本控制**
   - 兩種格式都應該納入版本控制
   - Markdown 文件為主要來源（Source of Truth）
   - Draw.io 文件為展示用途

---

## ❓ 常見問題

### Q1: Draw.io 無法正確渲染 Mermaid 圖表？
**A**: 確保使用最新版本的 app.diagrams.net。舊版可能不支援某些 Mermaid 語法。

### Q2: 圖表太大無法完整顯示？
**A**: 
- 點擊 `View` → `Fit Page` 或按 `Ctrl/Cmd + Shift + F`
- 調整頁面大小：`File` → `Page Setup`
- 考慮將大型圖表拆分為多個小圖

### Q3: 如何列印大型圖表？
**A**:
- 使用 `File` → `Print` → `Fit to` 選項
- 或匯出為 PDF 後使用專業 PDF 軟體列印
- 建議設定為橫向 (Landscape) 列印

### Q4: 團隊協作建議？
**A**:
- 將 .drawio 文件存放在 Google Drive 或 OneDrive
- 使用共享資料夾確保所有人存取相同版本
- 建立命名規範，例如：`CRM-ERD-v1.0.drawio`

### Q5: Mermaid 與 Draw.io 哪個更好？
**A**:
- **Mermaid**: 適合版本控制、快速修改、程式碼審查
- **Draw.io**: 適合精美呈現、列印、非技術人員編輯
- **建議**: 兩者並用，Mermaid 為主，Draw.io 為輔

---

## 📖 延伸閱讀

- [Draw.io 官方文件](https://www.diagrams.net/doc/)
- [Mermaid 官方文件](https://mermaid.js.org/)
- [Draw.io 進階功能](https://www.diagrams.net/blog/advanced-features)
- [Mermaid Live Editor](https://mermaid.live/)

---

## 📞 需要協助？

如有任何問題，請參考：
- 本專案的 `/docs/README.md`
- Draw.io 線上說明：https://desk.draw.io/support/home
- Mermaid 討論區：https://github.com/mermaid-js/mermaid/discussions

---

**文件版本**: v1.0  
**最後更新**: 2025-01-03  
**維護人員**: 系統開發團隊
