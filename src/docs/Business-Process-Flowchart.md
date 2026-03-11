# CRM 管理系統 - 業務流程圖

## Business Process Flowchart

此圖展示 CRM 系統中各個角色在業務流程中的操作步驟與資料流向。

## 1. 客戶開發與管理流程

```mermaid
flowchart TD
    Start([開始: 獲得潛在客戶資訊]) --> Source{客戶來源?}
    
    Source -->|客戶轉介| Referral[業務記錄轉介客戶ID]
    Source -->|電話開發| TeleDev[業務記錄開發員工ID]
    Source -->|網路廣告| WebAd[業務記錄來源詳情]
    Source -->|展覽活動| Exhibition[業務記錄來源詳情]
    Source -->|其他| Other[業務記錄來源詳情]
    
    Referral --> CreatePotential[建立潛在客戶資料]
    TeleDev --> CreatePotential
    WebAd --> CreatePotential
    Exhibition --> CreatePotential
    Other --> CreatePotential
    
    CreatePotential --> FillBasicInfo[填寫基本資料:<br/>公司名稱、統編、地址等]
    FillBasicInfo --> AddContacts[新增聯絡人資訊<br/>可新增多位聯絡人]
    AddContacts --> SetCategory[設定客戶類別:<br/>飲水/雞蛋/飲水機]
    SetCategory --> SetPayment[設定收付方式與押金]
    SetPayment --> SetDelivery[設定預計出貨星期]
    SetDelivery --> SetCustomPrice[設定商品自訂價格<br/>可選]
    
    SetCustomPrice --> Track[定期追蹤潛在客戶]
    Track --> TrackResult{追蹤結果?}
    
    TrackResult -->|有意願| Negotiate[洽談合作條件]
    TrackResult -->|暫無意願| UpdateTrack[更新追蹤日期<br/>繼續追蹤]
    TrackResult -->|無意願| Archive[標記為無效客戶]
    
    UpdateTrack --> Track
    
    Negotiate --> Convert{是否成交?}
    Convert -->|是| ConvertToCustomer[轉為正式客戶]
    Convert -->|否| UpdateTrack
    
    ConvertToCustomer --> CustomerCreated[客戶資料建立完成<br/>保留聯絡人與價格設定]
    CustomerCreated --> End1([流程結束])
    Archive --> End2([流程結束])
    
    style CreatePotential fill:#e1f5ff
    style ConvertToCustomer fill:#c8e6c9
    style CustomerCreated fill:#c8e6c9
```

## 2. 訂單處理流程

```mermaid
flowchart TD
    Start([開始: 接收客戶訂購需求]) --> CheckCustomer{客戶類型?}
    
    CheckCustomer -->|正式客戶| GetCustomerInfo[取得客戶資料]
    CheckCustomer -->|新客戶| CreateNew[先建立客戶資料]
    
    CreateNew --> GetCustomerInfo
    
    GetCustomerInfo --> SelectProduct[選擇商品]
    SelectProduct --> CheckPrice{有自訂價格?}
    
    CheckPrice -->|是| UseCustomPrice[使用客戶自訂價格]
    CheckPrice -->|否| UseRetailPrice[使用標準零售價]
    
    UseCustomPrice --> FillOrderInfo[填寫訂單資訊:<br/>數量、配送地址、出貨日期]
    UseRetailPrice --> FillOrderInfo
    
    FillOrderInfo --> CalcTotal[計算訂單總額]
    CalcTotal --> SelectEmployee[指派負責業務人員]
    SelectEmployee --> CreateOrder[建立訂單]
    
    CreateOrder --> OrderStatus{訂單狀態}
    OrderStatus --> Pending[待出貨]
    
    Pending --> CheckInventory{檢查庫存}
    CheckInventory -->|庫存充足| AssignDriver[指派送貨司機]
    CheckInventory -->|庫存不足| StockWarning[庫存警示]
    
    StockWarning --> PurchaseOrder[通知採購進貨]
    PurchaseOrder --> WaitStock[等待進貨]
    WaitStock --> AssignDriver
    
    AssignDriver --> PrepareShip[準備出貨]
    PrepareShip --> UpdateStatus1[更新訂單狀態: 已出貨]
    UpdateStatus1 --> ReduceInventory[扣減庫存數量]
    
    ReduceInventory --> Delivery[司機送貨]
    Delivery --> DeliveryResult{送貨結果?}
    
    DeliveryResult -->|成功送達| Collect{收款方式?}
    DeliveryResult -->|客戶不在| Reschedule[重新安排配送]
    DeliveryResult -->|取消訂單| CancelOrder[訂單取消]
    
    Reschedule --> Delivery
    CancelOrder --> RestoreInventory[回復庫存數量]
    RestoreInventory --> End1([流程結束])
    
    Collect -->|現金| CollectCash[司機收取現金]
    Collect -->|月結| MonthlyBilling[記錄月結帳款]
    
    CollectCash --> UpdateStatus2[更新訂單狀態: 已完成]
    MonthlyBilling --> UpdateStatus2
    
    UpdateStatus2 --> End2([流程結束])
    
    style CreateOrder fill:#e1f5ff
    style UpdateStatus1 fill:#fff9c4
    style UpdateStatus2 fill:#c8e6c9
    style ReduceInventory fill:#ffccbc
```

## 3. 司機送貨報表流程

```mermaid
flowchart TD
    Start([開始: 司機每日配送]) --> Morning[早上接收配送任務]
    Morning --> CheckVehicle[檢查車輛狀況]
    CheckVehicle --> LoadGoods[裝載商品]
    
    LoadGoods --> Deliver[開始配送]
    Deliver --> DeliverLoop{還有配送點?}
    
    DeliverLoop -->|是| NextCustomer[前往下一客戶]
    NextCustomer --> DeliverGoods[交付商品]
    
    DeliverGoods --> RecordDetail[記錄送貨明細:<br/>客戶、商品、數量、金額]
    RecordDetail --> CollectPayment{收款方式?}
    
    CollectPayment -->|現金| RecordCash[記錄現金收款]
    CollectPayment -->|月結| RecordMonthly[記錄月結]
    
    RecordCash --> TakePhoto[拍照存證<br/>可選]
    RecordMonthly --> TakePhoto
    
    TakePhoto --> AddNote[添加備註<br/>可選]
    AddNote --> DeliverLoop
    
    DeliverLoop -->|否| ReturnBase[返回公司]
    
    ReturnBase --> FillReport[填寫送貨報表]
    FillReport --> AddExpense[記錄費用:<br/>油費、其他支出]
    AddExpense --> CalcTotal[計算總金額]
    CalcTotal --> SubmitReport[提交報表]
    
    SubmitReport --> ManagerReview{主管審核}
    
    ManagerReview -->|通過| ConvertDecision{需要轉訂單?}
    ManagerReview -->|退回| ReviseReport[司機修正報表]
    
    ReviseReport --> SubmitReport
    
    ConvertDecision -->|是| ConvertToOrder[將明細轉為正式訂單]
    ConvertDecision -->|否| ArchiveReport[歸檔報表]
    
    ConvertToOrder --> LinkOrder[關聯訂單編號]
    LinkOrder --> UpdateInventory[更新庫存]
    UpdateInventory --> ArchiveReport
    
    ArchiveReport --> End([流程結束])
    
    style SubmitReport fill:#e1f5ff
    style ConvertToOrder fill:#c8e6c9
    style UpdateInventory fill:#ffccbc
```

## 4. 庫存管理流程

```mermaid
flowchart TD
    Start([開始: 庫存管理]) --> Action{庫存操作?}
    
    Action -->|進貨| Purchase[廠商進貨]
    Action -->|出貨| Ship[客戶訂單出貨]
    Action -->|調整| Adjust[人工調整庫存]
    Action -->|盤點| Count[人工盤點]
    
    %% 進貨流程
    Purchase --> SelectVendor[選擇廠商]
    SelectVendor --> SelectProducts1[選擇進貨商品]
    SelectProducts1 --> EnterQuantity1[輸入進貨數量]
    EnterQuantity1 --> CreatePurchase[建立進貨異動記錄]
    CreatePurchase --> AddInventory[增加庫存數量]
    AddInventory --> RecordTransaction1[記錄異動明細:<br/>商品、數量、異動前後庫存]
    RecordTransaction1 --> CheckStock1{檢查庫存狀態}
    
    %% 出貨流程
    Ship --> GetOrder[取得訂單資訊]
    GetOrder --> CheckAvailable{庫存足夠?}
    CheckAvailable -->|是| CreateShip[建立出貨異動記錄]
    CheckAvailable -->|否| InsufficientAlert[庫存不足警示]
    InsufficientAlert --> End1([流程結束])
    
    CreateShip --> ReduceInventory[減少庫存數量]
    ReduceInventory --> RecordTransaction2[記錄異動明細]
    RecordTransaction2 --> CheckStock2{檢查庫存狀態}
    
    %% 調整流程
    Adjust --> EnterReason[輸入調整原因]
    EnterReason --> SelectProducts2[選擇調整商品]
    SelectProducts2 --> EnterAdjust[輸入調整數量<br/>正數增加/負數減少]
    EnterAdjust --> CreateAdjust[建立調整異動記錄]
    CreateAdjust --> UpdateInventory1[更新庫存數量]
    UpdateInventory1 --> RecordTransaction3[記錄異動明細]
    RecordTransaction3 --> CheckStock3{檢查庫存狀態}
    
    %% 盤點流程
    Count --> SelectProducts3[選擇盤點商品]
    SelectProducts3 --> CountActual[實際盤點數量]
    CountActual --> CompareStock{與系統庫存比對}
    CompareStock -->|一致| NoAdjustNeeded[無需調整]
    CompareStock -->|不一致| CalcDiff[計算差異]
    
    CalcDiff --> CreateCount[建立盤點異動記錄]
    CreateCount --> UpdateInventory2[更新庫存數量]
    UpdateInventory2 --> RecordTransaction4[記錄異動明細]
    RecordTransaction4 --> CheckStock4{檢查庫存狀態}
    
    NoAdjustNeeded --> End2([流程結束])
    
    %% 庫存狀態檢查
    CheckStock1 --> StockLevel1{庫存水位?}
    CheckStock2 --> StockLevel2{庫存水位?}
    CheckStock3 --> StockLevel3{庫存水位?}
    CheckStock4 --> StockLevel4{庫存水位?}
    
    StockLevel1 -->|低於最低安全庫存| LowAlert1[低庫存警示]
    StockLevel1 -->|正常| Normal1[正常]
    StockLevel1 -->|高於最高安全庫存| HighAlert1[高庫存警示]
    
    StockLevel2 -->|低於最低安全庫存| LowAlert2[低庫存警示]
    StockLevel2 -->|正常| Normal2[正常]
    
    StockLevel3 -->|低於最低安全庫存| LowAlert3[低庫存警示]
    StockLevel3 -->|正常| Normal3[正常]
    
    StockLevel4 -->|低於最低安全庫存| LowAlert4[低庫存警示]
    StockLevel4 -->|正常| Normal4[正常]
    
    LowAlert1 --> NotifyPurchase1[通知採購]
    LowAlert2 --> NotifyPurchase2[通知採購]
    LowAlert3 --> NotifyPurchase3[通知採購]
    LowAlert4 --> NotifyPurchase4[通知採購]
    
    HighAlert1 --> NotifyManager[通知主管]
    
    NotifyPurchase1 --> End3([流程結束])
    NotifyPurchase2 --> End3
    NotifyPurchase3 --> End3
    NotifyPurchase4 --> End3
    NotifyManager --> End3
    Normal1 --> End3
    Normal2 --> End3
    Normal3 --> End3
    Normal4 --> End3
    
    style AddInventory fill:#c8e6c9
    style ReduceInventory fill:#ffccbc
    style UpdateInventory1 fill:#fff9c4
    style UpdateInventory2 fill:#fff9c4
    style LowAlert1 fill:#ffebee
    style LowAlert2 fill:#ffebee
    style LowAlert3 fill:#ffebee
    style LowAlert4 fill:#ffebee
    style HighAlert1 fill:#fff3e0
```

## 5. 車輛管理流程

```mermaid
flowchart TD
    Start([開始: 車輛管理]) --> Action{管理操作?}
    
    Action -->|新增車輛| AddVehicle[建立車輛基本資料]
    Action -->|保養| Maintenance[車輛保養]
    Action -->|維修| Repair[車輛維修]
    Action -->|更新里程| UpdateMileage[更新里程數]
    
    %% 新增車輛
    AddVehicle --> FillBasic[填寫基本資料:<br/>車牌、廠牌、車主等]
    FillBasic --> AssignDriver[指派駕駛人]
    AssignDriver --> UploadLicense[上傳行照圖片]
    UploadLicense --> SetReminder[設定行照到期提醒]
    SetReminder --> VehicleCreated[車輛建檔完成]
    VehicleCreated --> End1([流程結束])
    
    %% 保養流程
    Maintenance --> MaintenanceType{保養類型?}
    MaintenanceType -->|定期保養| Scheduled[排程保養]
    MaintenanceType -->|臨時保養| Unscheduled[臨時保養]
    
    Scheduled --> SelectVendor1[選擇保養廠商]
    Unscheduled --> SelectVendor1
    
    SelectVendor1 --> RecordMaintenance[記錄保養資訊:<br/>日期、項目、費用、里程數]
    RecordMaintenance --> UploadImages1[上傳保養單據照片<br/>可選]
    UploadImages1 --> SetWarranty1[設定保固期限]
    SetWarranty1 --> SetNextMaintenance[設定下次保養:<br/>日期或里程數]
    SetNextMaintenance --> UpdateStatus1[更新保養狀態]
    UpdateStatus1 --> CheckStatus1{付款狀態?}
    
    CheckStatus1 -->|已付款| Complete1[標記完成]
    CheckStatus1 -->|未付款| Pending1[待付款]
    
    Complete1 --> End2([流程結束])
    Pending1 --> End2
    
    %% 維修流程
    Repair --> ReportIssue[回報故障問題]
    ReportIssue --> UpdateVehicleStatus[更新車輛狀態: 維修中]
    UpdateVehicleStatus --> SelectVendor2[選擇維修廠商]
    SelectVendor2 --> RecordRepair[記錄維修資訊:<br/>日期、項目、費用、里程數]
    RecordRepair --> UploadImages2[上傳維修單據照片<br/>可選]
    UploadImages2 --> SetWarranty2[設定保固期限]
    SetWarranty2 --> UpdateStatus2[更新維修狀態]
    UpdateStatus2 --> CheckStatus2{付款狀態?}
    
    CheckStatus2 -->|已付款| RestoreStatus1[恢復車輛狀態: 正常]
    CheckStatus2 -->|未付款| Pending2[待付款]
    
    RestoreStatus1 --> End3([流程結束])
    Pending2 --> PaymentDone{付款完成?}
    PaymentDone -->|是| RestoreStatus2[恢復車輛狀態: 正常]
    PaymentDone -->|否| Pending2
    
    RestoreStatus2 --> End3
    
    %% 更新里程
    UpdateMileage --> EnterMileage[輸入當前里程數]
    EnterMileage --> RecordDate[記錄更新日期]
    RecordDate --> CheckReminder{檢查保養提醒}
    CheckReminder -->|即將到期| MaintenanceAlert[保養提醒通知]
    CheckReminder -->|正常| Normal[正常]
    
    MaintenanceAlert --> End4([流程結束])
    Normal --> End4
    
    style VehicleCreated fill:#c8e6c9
    style UpdateVehicleStatus fill:#ffccbc
    style RestoreStatus1 fill:#c8e6c9
    style RestoreStatus2 fill:#c8e6c9
    style MaintenanceAlert fill:#fff9c4
```

## 角色與權限說明

### 1. 業務人員
- **客戶開發**: 建立潛在客戶、追蹤、轉正
- **訂單處理**: 接單、建立訂單、指派配送
- **價格管理**: 設定客戶自訂價格

### 2. 送貨司機
- **配送執行**: 執行配送任務
- **報表填寫**: 填寫每日送貨報表
- **收款記錄**: 記錄現金收款

### 3. 倉管人員
- **庫存管理**: 進貨、出貨、調整、盤點
- **庫存監控**: 監控庫存水位、發出警示
- **採購通知**: 低庫存時通知採購

### 4. 管理階層
- **報表審核**: 審核司機送貨報表
- **資料審查**: 審查各類資料異常
- **決策支援**: 查看統計報表

### 5. 系統管理員
- **員工管理**: 管理員工帳號與權限
- **廠商管理**: 管理廠商資料
- **車輛管理**: 管理車輛與維護記錄
- **系統設定**: 系統參數設定

## 版本資訊
- **版本**: v1.0
- **建立日期**: 2025-01-03
