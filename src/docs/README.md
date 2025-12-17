# CRM 管理系統 - v1.0 技術文件總覽

## 📚 文件導覽

本目錄包含 CRM 管理系統第一版的完整技術文件，包括四種核心圖表與說明文件。

### 📊 核心圖表文件

#### 1. [ERD - 實體關聯圖](./ERD-Entity-Relationship-Diagram.md)
**Entity Relationship Diagram**

展示系統中所有資料表、欄位、主鍵、外鍵與關聯關係。

**包含內容：**
- 15+ 張資料表設計
- 完整欄位定義（型別、說明）
- 表與表之間的關聯關係
- 業務邏輯說明
- 關鍵約束與規則

**適合對象：** 資料庫設計師、後端開發人員、系統架構師

---

#### 2. [業務流程圖](./Business-Process-Flowchart.md)
**Business Process Flowchart / BPMN**

展示各個角色在業務流程中的操作步驟與資料流向。

**包含內容：**
- 客戶開發與管理流程
- 訂單處理流程
- 司機送貨報表流程
- 庫存管理流程
- 車輛管理流程
- 角色與權限說明

**適合對象：** 業務分析師、產品經理、使用者培訓人員

---

#### 3. [系統架構圖](./System-Architecture-Diagram.md)
**System Architecture Diagram**

展示前端、後端、資料庫、API 的資料流與系統層級架構。

**包含內容：**
- 整體系統架構圖
- 前端技術架構詳細說明
- 資料流向圖（時序圖）
- 模組架構與職責
- 檔案結構對應
- 未來系統擴展規劃
- 技術選型說明

**適合對象：** 系統架構師、技術主管、前後端開發人員

---

#### 4. [資料流程圖](./Data-Flow-Diagram.md)
**Data Flow Diagram (DFD)**

展示資料的流動路徑、處理過程與儲存位置。

**包含內容：**
- Level 0: 系統總覽（Context Diagram）
- Level 1: 主要功能模組資料流
- Level 2: 各模組詳細資料流
  - 客戶管理
  - 訂單管理
  - 庫存管理
  - 報表管理
- 資料字典
- 資料一致性控制
- 資料驗證規則

**適合對象：** 系統分析師、資料架構師、開發人員

---

## 🎯 系統概述

### 專案名稱
**CRM 管理系統** - 桶裝水、雞蛋、飲水機銷售業務管理系統

### 版本資訊
- **版本號**: v1.0
- **建立日期**: 2025-01-03
- **資料時間範圍**: 2025年度
- **開發狀態**: 前端原型（使用 Mock Data）

### 核心功能模組

#### 📁 基本資料管理
- **員工資料管理**: 員工基本資料、職位、聯絡方式
- **客戶資料管理**: 多聯絡人、自訂價格、訂單查詢
- **潛在客戶管理**: 來源追蹤、轉正式客戶
- **廠商資料管理**: 分類管理、銀行帳戶
- **車輛資料管理**: 保養維修記錄、圖片上傳

#### 📦 商品管理
- **桶裝水管理**: 商品CRUD、安全庫存設定
- **雞蛋管理**: 商品CRUD、安全庫存設定
- **飲水機管理**: 商品CRUD、安全庫存設定

#### 🛒 訂單管理
- **桶裝水訂單**: 完整訂單流程、狀態管理
- **雞蛋訂單**: 完整訂單流程、狀態管理
- **飲水機訂單**: 完整訂單流程、狀態管理

#### 📊 庫存與報表
- **商品庫存管理**: 進貨出貨、調整盤點、庫存警示
- **司機送貨報表**: 
  - 送貨明細編輯（智慧客戶選擇、出貨星期動態編輯）
  - 商品選擇智慧禁用
  - 費用記錄、轉訂單功能（雙模式）

---

## 🏗️ 技術架構

### 前端技術棧
```
Vue 3 + Vite + TypeScript
├── UI 元件: OpenTiny Vue + 自訂 Wrapper
├── 樣式: Tailwind CSS v4
├── 圖示: @opentiny/vue-icon
├── 日期處理: date-fns
└── 通知系統: @opentiny/vue-notify
```

### 當前資料狀態
- **開發階段**: 前端原型
- **資料來源**: Mock Data（硬編碼假資料）
- **儲存方式**: Component Local State

### 未來擴展
- 後端 API 開發（Node.js / Python）
- 資料庫建置（PostgreSQL / MySQL）
- 檔案儲存服務（AWS S3 / Azure Blob）
- 身分驗證與授權
- 報表匯出（PDF / Excel）

---

## 📋 資料表總覽

### 基本資料 (8 張表)
```
EMPLOYEE              - 員工資料
CUSTOMER              - 客戶資料
CUSTOMER_CONTACT      - 客戶聯絡人
CUSTOMER_CUSTOM_PRICE - 客戶自訂價格
POTENTIAL_CUSTOMER    - 潛在客戶
POTENTIAL_CONTACT     - 潛在客戶聯絡人
POTENTIAL_CUSTOM_PRICE- 潛在客戶自訂價格
VENDOR                - 廠商資料
```

### 車輛管理 (3 張表)
```
VEHICLE               - 車輛資料
VEHICLE_MAINTENANCE   - 車輛保養記錄
VEHICLE_REPAIR        - 車輛維修記錄
```

### 商品與庫存 (4 張表)
```
PRODUCT               - 商品主檔
INVENTORY             - 商品庫存
INVENTORY_TRANSACTION - 庫存異動主表
INVENTORY_PRODUCT_ITEM- 庫存異動明細
```

### 訂單與報表 (3 張表)
```
ORDER                 - 訂單主表
DELIVERY_REPORT       - 送貨報表主表
DELIVERY_PRODUCT_DETAIL- 送貨明細表
```

**總計**: 18 張資料表

---

## 👥 使用者角色

### 1. 業務人員
- 管理潛在客戶與正式客戶
- 建立與追蹤訂單
- 設定客戶自訂價格

### 2. 送貨司機
- 執行配送任務
- 填寫送貨報表
- 記錄收款資訊

### 3. 倉管人員
- 管理商品庫存
- 執行進貨出貨
- 進行庫存調整與盤點
- 監控庫存警示

### 4. 管理階層
- 審核送貨報表
- 查看統計報表
- 監控業務狀況

### 5. 系統管理員
- 管理員工帳號
- 管理廠商資料
- 管理車輛與維護
- 系統參數設定

---

## 🔑 核心業務邏輯

### 1. 客戶管理
- **潛在客戶 → 正式客戶**: 支援轉換流程，保留聯絡人與價格設定
- **多聯絡人管理**: 一個客戶可有多個聯絡人，必須指定主要聯絡人
- **自訂價格**: 客戶可針對特定商品設定價格調整

### 2. 庫存管理
- **雙層設計**: 商品表記錄「安全庫存量」，庫存表記錄「實際庫存量」
- **完整追蹤**: 每次異動記錄異動前後庫存量
- **警示機制**: 低於最低庫存或高於最高庫存時發出警示

### 3. 訂單流程
- **價格計算**: 優先使用客戶自訂價格，否則使用標準零售價
- **庫存連動**: 訂單出貨時自動扣減庫存
- **狀態管理**: 待出貨 → 已出貨 → 已完成

### 4. 送貨報表
- **明細管理**: 記錄每筆送貨的詳細資訊
- **轉訂單功能**: 送貨明細可選擇性轉為正式訂單
- **費用記錄**: 記錄油費與其他支出

---

## 📈 系統特色

### ✅ 完整功能
- 涵蓋從客戶開發到訂單完成的完整流程
- 支援多商品類別管理（桶裝水、雞蛋、飲水機）
- 完整的庫存進銷存管理

### ✅ 彈性設計
- 客戶自訂價格機制
- 多聯絡人管理
- 可選的報表轉訂單功能

### ✅ 使用者友善
- 支援篩選、排序、分頁
- 展開/收合詳細資訊
- 即時通知回饋

### ✅ 資料完整性
- 完整的異動記錄追蹤
- 庫存前後狀態記錄
- 訂單狀態流程管理

---

## 📁 專案結構

```
/
├── App.jsx                          # 應用程式入口
├── components/                      # 元件目錄
│   ├── app-sidebar.jsx             # 側邊欄導航
│   ├── top-banner.jsx              # 頂部 Banner
│   ├── dashboard.jsx               # 儀表板
│   │
│   ├── [基本資料管理模組]
│   ├── employee-management.jsx
│   ├── customer-management.jsx
│   ├── potential-customer-management.jsx
│   ├── vendor-management.jsx
│   ├── vehicle-management.jsx
│   │
│   ├── [商品管理模組]
│   ├── bottled-water-management.jsx
│   ├── egg-management.jsx
│   ├── water-dispenser-management.jsx
│   │
│   ├── [訂單管理模組]
│   ├── bottled-water-orders.jsx
│   ├── egg-orders.jsx
│   ├── water-dispenser-orders.jsx
│   │
│   ├── [庫存與報表模組]
│   ├── inventory-management.jsx
│   ├── delivery-report-new.jsx
│   ├── delivery-report-edit-page.jsx
│   ├── daily-shipping-report-enhanced.jsx
│   │
│   └── ui/                          # ShadCN UI 元件
│       ├── button.jsx
│       ├── input.jsx
│       ├── table.jsx
│       └── ... (40+ 元件)
│
├── lib/                             # 工具與資料
│   ├── mock-products.js            # 商品假資料
│   └── mock-orders.js              # 訂單假資料
│
├── docs/                            # 📚 技術文件
│   ├── INDEX.md                         # 📑 文件索引（快速導航）
│   ├── README.md                        # 本文件（總覽）
│   ├── DOWNLOAD-GUIDE.md                # 下載與使用指南
│   │
│   ├── ERD-Entity-Relationship-Diagram.md      # 實體關聯圖
│   ├── Business-Process-Flowchart.md           # 業務流程圖
│   ├── System-Architecture-Diagram.md          # 系統架構圖
│   ├── Data-Flow-Diagram.md                    # 資料流程圖
│   │
│   ├── API-Specification.md             # API 完整規格（70支）
│   ├── API-Quick-Reference.md           # API 快速參考表
│   │
│   ├── How-to-Use-Diagrams-in-DrawIO.md        # Draw.io 使用指南
│   └── mermaid-to-drawio-guide.md              # Mermaid 轉換快速指南
│
└── styles/
    └── globals.css                  # 全域樣式
```

---

## 🚀 快速開始

### 檢視 Mermaid 圖表

所有圖表均使用 Mermaid 語法編寫，可透過以下方式檢視：

#### 方法 1: GitHub
直接在 GitHub 上開啟 Markdown 文件，GitHub 會自動渲染 Mermaid 圖表。

#### 方法 2: VS Code
安裝 **Markdown Preview Mermaid Support** 擴充套件：
```
Name: Markdown Preview Mermaid Support
Id: bierner.markdown-mermaid
```

#### 方法 3: 線上工具
複製 Mermaid 程式碼到以下網站：
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid Chart](https://www.mermaidchart.com/)

#### 方法 4: Draw.io (推薦用於編輯與列印)
**Draw.io 原生支援 Mermaid 圖表！**

1. 前往 https://app.diagrams.net/
2. 按 `Ctrl/Cmd + K` 開啟 Mermaid 插入功能
3. 複製我們文件中的 Mermaid 程式碼區塊
4. 貼上並點擊 "Insert"
5. 可直接編輯、調整樣式、匯出為 PDF/PNG

**完整 Draw.io 使用指南**：
- 📖 [如何在 Draw.io 中使用技術圖表](./How-to-Use-Diagrams-in-DrawIO.md)
- 🚀 [Mermaid 轉 Draw.io 快速指南](./mermaid-to-drawio-guide.md)

---

## 📖 閱讀順序建議

### 對於新成員
1. 先閱讀本文件（README.md）了解系統概況
2. 查看 [業務流程圖](./Business-Process-Flowchart.md) 理解業務邏輯
3. 查看 [系統架構圖](./System-Architecture-Diagram.md) 了解技術架構
4. 最後查看 [ERD](./ERD-Entity-Relationship-Diagram.md) 和 [DFD](./Data-Flow-Diagram.md) 深入了解資料結構

### 對於開發人員
1. [系統架構圖](./System-Architecture-Diagram.md) - 了解技術棧與模組架構
2. [ERD](./ERD-Entity-Relationship-Diagram.md) - 理解資料庫設計
3. [DFD](./Data-Flow-Diagram.md) - 理解資料流向
4. [業務流程圖](./Business-Process-Flowchart.md) - 實作業務邏輯參考

### 對於資料庫設計師
1. [ERD](./ERD-Entity-Relationship-Diagram.md) - 完整資料表設計
2. [DFD](./Data-Flow-Diagram.md) - 資料流向與驗證規則
3. [業務流程圖](./Business-Process-Flowchart.md) - 業務需求參考

### 對於產品/業務人員
1. [業務流程圖](./Business-Process-Flowchart.md) - 完整業務流程
2. 本文件（README.md）- 功能模組說明
3. [系統架構圖](./System-Architecture-Diagram.md) - 了解系統能力

---

## 📝 版本歷程

### v1.0 (2025-01-03)
- ✅ 完成所有基本資料管理模組
- ✅ 完成商品管理三大類別
- ✅ 完成訂單管理三大類別
- ✅ 完成庫存管理與警示機制
- ✅ 完成司機送貨報表與日報表
- ✅ 完成車輛管理與維護記錄
- ✅ 完成側邊欄與頂部 Banner UI
- ✅ 完成四大技術文件與圖表
- 📊 使用 Mock Data 模擬所有功能
- 🎨 建立完整 UI/UX 互動流程

---

## 🎯 未來規劃

### Phase 1: 後端開發 (預計 Q2 2025)
- [ ] RESTful API 建置
- [ ] 資料庫建置與資料遷移
- [ ] 身分驗證與授權機制
- [ ] API 文件產生（Swagger）

### Phase 2: 進階功能 (預計 Q3 2025)
- [ ] 檔案上傳與管理
- [ ] 報表匯出（PDF、Excel）
- [ ] 即時通知系統
- [ ] 權限角色管理

### Phase 3: 效能優化 (預計 Q4 2025)
- [ ] 前端快取策略
- [ ] API 效能優化
- [ ] 資料庫索引優化
- [ ] CDN 部署

### Phase 4: 行動端支援 (預計 Q1 2026)
- [ ] PWA 支援
- [ ] 行動端專屬功能
- [ ] 離線模式

---

## 📞 聯絡資訊

如有任何問題或建議，請聯繫：
- **專案負責人**: [待補充]
- **技術負責人**: [待補充]
- **Email**: [待補充]

---

## 📄 授權聲明

本系統及相關文件為 [公司名稱] 內部專案，僅供授權人員使用。

---

**文件建立日期**: 2025-01-03  
**最後更新日期**: 2025-01-03  
**文件版本**: v1.0  
**維護人員**: 系統開發團隊
