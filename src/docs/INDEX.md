# 📚 CRM 管理系統 - 技術文件索引

> **快速導航**: 所有技術文件的快速存取索引

---

## 🎯 開始使用

### 第一次閱讀？從這裡開始 👇

| 順序 | 文件 | 說明 | 預估時間 |
|-----|------|------|---------|
| 1️⃣ | [README.md](./README.md) | 📖 **總覽文件**<br/>系統概述、功能模組、技術架構 | 15 分鐘 |
| 2️⃣ | [DOWNLOAD-GUIDE.md](./DOWNLOAD-GUIDE.md) | 💾 **下載與使用指南**<br/>如何下載、檢視、編輯技術文件 | 10 分鐘 |

---

## 📊 核心技術圖表

### 資料庫設計

| 文件 | 圖表數量 | 適合對象 | 描述 |
|------|---------|---------|------|
| [ERD-Entity-Relationship-Diagram.md](./ERD-Entity-Relationship-Diagram.md) | 1 個大型 ERD | 資料庫設計師<br/>後端開發人員 | **18 張資料表**完整設計<br/>主鍵、外鍵、關聯關係<br/>業務邏輯說明 |

### 業務流程

| 文件 | 圖表數量 | 適合對象 | 描述 |
|------|---------|---------|------|
| [Business-Process-Flowchart.md](./Business-Process-Flowchart.md) | 5 個流程圖 | 產品經理<br/>業務分析師<br/>使用者培訓 | **5 大核心流程**：<br/>• 客戶開發與管理<br/>• 訂單處理<br/>• 司機送貨報表<br/>• 庫存管理<br/>• 車輛管理 |

### 系統架構

| 文件 | 圖表數量 | 適合對象 | 描述 |
|------|---------|---------|------|
| [System-Architecture-Diagram.md](./System-Architecture-Diagram.md) | 4 個架構圖 | 系統架構師<br/>技術主管<br/>全端開發人員 | **系統層級架構**：<br/>• 整體系統架構<br/>• 前端技術棧<br/>• 資料流向（時序圖）<br/>• 模組架構（心智圖） |

### 資料流程

| 文件 | 圖表數量 | 適合對象 | 描述 |
|------|---------|---------|------|
| [Data-Flow-Diagram.md](./Data-Flow-Diagram.md) | 7 個 DFD 圖 | 系統分析師<br/>資料架構師<br/>開發人員 | **多層級資料流**：<br/>• Level 0: 系統總覽<br/>• Level 1: 主要模組<br/>• Level 2: 詳細流程<br/>• 資料字典 |

---

## 🛠️ 工具與指南

### Draw.io 使用

| 文件 | 類型 | 說明 |
|------|------|------|
| [How-to-Use-Diagrams-in-DrawIO.md](./How-to-Use-Diagrams-in-DrawIO.md) | 完整指南 | **Draw.io 完整使用指南**<br/>• 4 種使用方法<br/>• 配色方案建議<br/>• 匯出與列印技巧<br/>• 常見問題解答 |
| [mermaid-to-drawio-guide.md](./mermaid-to-drawio-guide.md) | 快速指南 | **Mermaid 轉 Draw.io**<br/>• 快速操作步驟<br/>• 各圖表程式碼位置<br/>• 最佳實務建議 |

### API 規格文件

| 文件 | 類型 | 說明 |
|------|------|------|
| [API-Specification.md](./API-Specification.md) | 完整規格 | **70 支 API 完整規格**<br/>• 所有 Endpoint 定義<br/>• 完整 Request/Response 格式<br/>• 業務邏輯說明<br/>• 錯誤碼對照表 |
| [API-Quick-Reference.md](./API-Quick-Reference.md) | 快速參考 | **API 快速查找表**<br/>• 按模組分類清單<br/>• HTTP Method 統計<br/>• 呼叫流程範例<br/>• 權限需求說明 |

### 功能說明文件

| 文件 | 類型 | 說明 |
|------|------|------|
| [Feature-Delivery-Report-Convert-Order.md](./Feature-Delivery-Report-Convert-Order.md) | 功能說明 | **送貨報表轉訂單功能**<br/>• 建立新訂單模式<br/>• 加入現有訂單模式<br/>• 訂單搜尋功能<br/>• 完整操作流程 |
| [Feature-Delivery-Report-Edit-Page.md](./Feature-Delivery-Report-Edit-Page.md) | 功能說明 | **送貨報表編輯頁面**<br/>• 智慧客戶選擇<br/>• 出貨星期動態編輯<br/>• 商品選擇智慧禁用<br/>• 完整編輯功能 |

---

## 🎨 按使用情境選擇

### 情境 A: 快速了解系統

```
時間: 30 分鐘
路徑: README.md → Business-Process-Flowchart.md
```

**推薦給**: 新進人員、專案經理、客戶

---

### 情境 B: 開發前準備

```
時間: 2-3 小時
路徑: System-Architecture-Diagram.md → ERD → DFD
```

**推薦給**: 開發人員（前端/後端）

---

### 情境 C: 資料庫設計

```
時間: 1-2 小時
路徑: ERD → DFD → Business-Process-Flowchart.md
```

**推薦給**: 資料庫設計師、後端開發

---

### 情境 D: 製作簡報

```
時間: 2-3 小時
路徑: 任何圖表 → Draw.io 編輯 → 匯出 PNG/PDF
工具: Draw.io + 技術文件
```

**推薦給**: 需要對外展示的任何人

---

### 情境 E: 系統維護

```
時間: 持續
路徑: 修改 Markdown → Git 版本控制 → 同步 Draw.io
```

**推薦給**: 技術文件維護人員

---

## 📈 圖表類型速查

| Mermaid 類型 | 用途 | 文件位置 | 數量 |
|-------------|------|---------|------|
| `erDiagram` | 資料庫設計 | ERD | 1 |
| `flowchart` / `graph` | 業務流程、資料流 | Business-Process, DFD | 12 |
| `graph TB/LR` | 系統架構 | System-Architecture | 3 |
| `sequenceDiagram` | 資料流向 | System-Architecture | 1 |
| `mindmap` | 模組架構 | System-Architecture | 1 |

**總計**: 18+ 個圖表

---

## 🔍 快速搜尋

### 按關鍵字查找

| 關鍵字 | 相關文件 | 章節 |
|--------|---------|------|
| **客戶管理** | Business-Process, ERD, DFD | 客戶開發流程、CUSTOMER 表 |
| **訂單管理** | Business-Process, ERD, DFD | 訂單處理流程、ORDER 表 |
| **庫存管理** | Business-Process, ERD, DFD | 庫存管理流程、INVENTORY 表 |
| **送貨報表** | Business-Process, ERD, DFD, Feature-Delivery-Report | 報表流程、DELIVERY_REPORT 表、編輯功能 |
| **車輛管理** | Business-Process, ERD | 車輛管理流程、VEHICLE 表 |
| **員工管理** | ERD | EMPLOYEE 表 |
| **廠商管理** | ERD | VENDOR 表 |
| **商品管理** | ERD | PRODUCT 表 |
| **系統架構** | System-Architecture | 前端技術棧、資料流 |
| **資料表設計** | ERD | 完整 18 張表 |

---

## 📖 按職位角色分類

### 👨‍💼 產品經理 / 專案經理

```
必讀:
✅ README.md
✅ Business-Process-Flowchart.md

選讀:
○ System-Architecture-Diagram.md (了解技術限制)
```

---

### 👨‍💻 前端開發人員

```
必讀:
✅ System-Architecture-Diagram.md (前端技術棧)
✅ Business-Process-Flowchart.md (業務邏輯)

選讀:
○ ERD (了解資料結構)
○ DFD (資料流向)
```

---

### 👨‍💻 後端開發人員

```
必讀:
✅ ERD (資料庫設計)
✅ DFD (資料流向)
✅ System-Architecture-Diagram.md (API 設計)

選讀:
○ Business-Process-Flowchart.md (業務規則)
```

---

### 🗄️ 資料庫設計師

```
必讀:
✅ ERD
✅ DFD
✅ Business-Process-Flowchart.md

選讀:
○ System-Architecture-Diagram.md
```

---

### 🎨 UI/UX 設計師

```
必讀:
✅ Business-Process-Flowchart.md (使用者流程)
✅ README.md (功能需求)

選讀:
○ System-Architecture-Diagram.md (技術限制)
```

---

### 🧪 測試人員 / QA

```
必讀:
✅ Business-Process-Flowchart.md (測試情境)
✅ DFD (資料驗證)

選讀:
○ ERD (資料完整性測試)
```

---

### 👔 管理階層 / 客戶

```
必讀:
✅ README.md (系統概述)

選讀:
○ Business-Process-Flowchart.md (業務價值)
○ System-Architecture-Diagram.md (技術能力)
```

---

## 🚀 建議閱讀順序

### 路徑 A: 快速入門（30 分鐘）

```
1. README.md (15 分鐘)
2. DOWNLOAD-GUIDE.md (10 分鐘)
3. 選擇一個感興趣的圖表快速瀏覽 (5 分鐘)
```

---

### 路徑 B: 完整理解（半天）

```
1. README.md (15 分鐘)
2. Business-Process-Flowchart.md (60 分鐘)
3. System-Architecture-Diagram.md (45 分鐘)
4. ERD + DFD 擇一深入 (60 分鐘)
```

---

### 路徑 C: 精通系統（2-3 天）

```
第 1 天:
- README.md
- Business-Process-Flowchart.md
- System-Architecture-Diagram.md

第 2 天:
- ERD (深入每張資料表)
- DFD (追蹤所有資料流)

第 3 天:
- 實作練習
- 使用 Draw.io 編輯圖表
- 製作個人筆記
```

---

## 📦 文件包下載

### 完整文件包

```
包含:
✅ 所有 10 個 Markdown 文件
✅ 18+ 個 Mermaid 圖表
✅ 2 個功能說明文件
✅ Draw.io 使用指南

大小: 約 600 KB (純文字)

下載方式: 
git clone [專案網址]
或參考 DOWNLOAD-GUIDE.md
```

---

## 🔄 更新頻率

| 文件類型 | 更新頻率 | 維護人員 |
|---------|---------|---------|
| 核心圖表 (ERD, DFD) | 需求變更時 | 系統分析師 |
| 業務流程 | 流程優化時 | 產品經理 |
| 系統架構 | 技術升級時 | 技術主管 |
| 工具指南 | 工具更新時 | 文件團隊 |

**最後更新**: 2025-01-03 (v1.0)

---

## ❓ 需要協助？

### 找不到需要的資訊？

1. 檢查 [README.md](./README.md) 的目錄
2. 使用文字搜尋（`Ctrl/Cmd + F`）
3. 查看 [DOWNLOAD-GUIDE.md](./DOWNLOAD-GUIDE.md) 的常見問題

### 想要貢獻或回饋？

- 提交 Issue（錯誤回報、建議）
- 提交 Pull Request（文件改進）
- 聯絡文件維護團隊

---

## 📊 文件統計

```
總文件數:    10 個 (含 2 個功能說明文件)
圖表總數:    18+ 個
資料表數:    18 張
流程圖數:    5 個
架構圖數:    4 個
DFD 圖數:    7 個
總字數:      約 65,000 字
Mermaid 程式碼: 約 3,000 行
```

---

## 🎯 快速連結

### 核心文件
- [總覽 →](./README.md)
- [下載指南 →](./DOWNLOAD-GUIDE.md)

### 技術圖表
- [ERD →](./ERD-Entity-Relationship-Diagram.md)
- [業務流程 →](./Business-Process-Flowchart.md)
- [系統架構 →](./System-Architecture-Diagram.md)
- [資料流程 →](./Data-Flow-Diagram.md)

### 工具指南
- [Draw.io 使用 →](./How-to-Use-Diagrams-in-DrawIO.md)
- [快速轉換 →](./mermaid-to-drawio-guide.md)

### 外部資源
- [Mermaid Live Editor](https://mermaid.live/)
- [Draw.io 線上版](https://app.diagrams.net/)
- [GitHub 專案](./README.md#聯絡資訊)

---

**祝您閱讀愉快！** 📚✨

---

**文件版本**: v1.0  
**索引建立日期**: 2025-01-03  
**維護團隊**: CRM 系統開發團隊
