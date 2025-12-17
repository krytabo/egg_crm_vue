import ApplicationLayout from "@/layouts/ApplicationLayout.vue";
import DashboardPage from "@/pages/dashboard/DashboardPage.vue";
import EmployeeManagementPage from "@/pages/basic-data/EmployeeManagementPage.vue";
import CustomerManagementPage from "@/pages/basic-data/CustomerManagementPage.vue";
import PotentialCustomerManagementPage from "@/pages/basic-data/PotentialCustomerManagementPage.vue";
import VendorManagementPage from "@/pages/basic-data/VendorManagementPage.vue";
import VehicleManagementPage from "@/pages/basic-data/VehicleManagementPage.vue";
import ProductTypeSettingsPage from "@/pages/basic-data/ProductTypeSettingsPage.vue";
import BottledWaterManagementPage from "@/pages/product-management/BottledWaterManagementPage.vue";
import EggManagementPage from "@/pages/product-management/EggManagementPage.vue";
import WaterDispenserManagementPage from "@/pages/product-management/WaterDispenserManagementPage.vue";
import InventoryManagementPage from "@/pages/inventory-reports/InventoryManagementPage.vue";
import BottledWaterOrdersPage from "@/pages/order-management/BottledWaterOrdersPage.vue";
import EggOrdersPage from "@/pages/order-management/EggOrdersPage.vue";
import WaterDispenserOrdersPage from "@/pages/order-management/WaterDispenserOrdersPage.vue";
import DeliveryReportPage from "@/pages/inventory-reports/DeliveryReportPage.vue";
import DeliveryReportNewPage from "@/pages/inventory-reports/DeliveryReportNewPage.vue";
import DeliveryReportEditPage from "@/pages/inventory-reports/DeliveryReportEditPage.vue";

const appChildren = [
  {
    path: "dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true, sidebarId: "dashboard", title: "儀表板" }
  },
  {
    path: "employees",
    name: "employees",
    component: EmployeeManagementPage,
    meta: { requiresAuth: true, sidebarId: "employees", title: "員工資料" }
  },
  {
    path: "customers",
    name: "customers",
    component: CustomerManagementPage,
    meta: { requiresAuth: true, sidebarId: "customers", title: "客戶資料" }
  },
  {
    path: "potential-customers",
    name: "potential-customers",
    component: PotentialCustomerManagementPage,
    meta: { requiresAuth: true, sidebarId: "potential-customers", title: "潛在客戶" }
  },
  {
    path: "vendors",
    name: "vendors",
    component: VendorManagementPage,
    meta: { requiresAuth: true, sidebarId: "vendors", title: "廠商資料" }
  },
  {
    path: "vehicles",
    name: "vehicles",
    component: VehicleManagementPage,
    meta: { requiresAuth: true, sidebarId: "vehicles", title: "車輛資料" }
  },
  {
    path: "product-types",
    name: "product-types",
    component: ProductTypeSettingsPage,
    meta: { requiresAuth: true, sidebarId: "product-types", title: "參數設定 - 產品類型" }
  },
  {
    path: "bottled-water",
    name: "bottled-water",
    component: BottledWaterManagementPage,
    meta: { requiresAuth: true, sidebarId: "bottled-water", title: "桶裝水資料" }
  },
  {
    path: "",
    name: "eggs",
    component: EggManagementPage,
    meta: { requiresAuth: true, sidebarId: "eggs", title: "雞蛋資料" }
  },
  {
    path: "water-dispensers",
    name: "water-dispensers",
    component: WaterDispenserManagementPage,
    meta: { requiresAuth: true, sidebarId: "water-dispensers", title: "飲水機資料" }
  },
  {
    path: "bottled-water-orders",
    name: "bottled-water-orders",
    component: BottledWaterOrdersPage,
    meta: { requiresAuth: true, sidebarId: "bottled-water-orders", title: "桶裝水訂單" }
  },
  {
    path: "egg-orders",
    name: "egg-orders",
    component: EggOrdersPage,
    meta: { requiresAuth: true, sidebarId: "egg-orders", title: "雞蛋訂單" }
  },
  {
    path: "water-dispenser-orders",
    name: "water-dispenser-orders",
    component: WaterDispenserOrdersPage,
    meta: { requiresAuth: true, sidebarId: "water-dispenser-orders", title: "飲水機訂單" }
  },
  {
    path: "inventory",
    name: "inventory",
    component: InventoryManagementPage,
    meta: { requiresAuth: true, sidebarId: "inventory", title: "商品庫存" }
  },
  {
    path: "delivery-report",
    name: "delivery-report",
    component: DeliveryReportPage,
    meta: { requiresAuth: true, sidebarId: "delivery-report", title: "送貨報表" }
  },
  {
    path: "delivery-report-new",
    name: "delivery-report-new",
    component: DeliveryReportNewPage,
    meta: { requiresAuth: true, sidebarId: "delivery-report-new", title: "全新送貨報表" }
  },
  {
    path: "delivery-report/edit/:uuid?",
    name: "delivery-report-edit",
    component: DeliveryReportEditPage,
    props: (route) => ({ uuid: route.params.uuid || "" }),
    meta: { requiresAuth: true, sidebarId: "delivery-report", title: "報表編輯" }
  }
];

const ApplicationListRouter = {
  path: "/ApplicationList",
  component: ApplicationLayout,
  meta: { requiresAuth: true },
  children: [{ path: "", redirect: { name: "dashboard" } }, ...appChildren]
};

export default ApplicationListRouter;
