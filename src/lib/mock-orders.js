// src/lib/mock-orders.js 模擬訂單資料
const ORDER_TYPE_CONFIG = {
  water: {
    label: "飲水",
    prefix: "WTR",
    products: ["清泉 20L", "純淨 20L", "山泉 20L"],
    unitPrice: 150,
    priceStep: 5,
    quantityBase: 10
  },
  egg: {
    label: "雞蛋",
    prefix: "EGG",
    products: ["紅殼蛋 10入/盒", "白殼蛋 12入/盒", "放牧蛋 10入/盒"],
    unitPrice: 85,
    priceStep: 4,
    quantityBase: 12
  },
  dispenser: {
    label: "飲水機",
    prefix: "DSP",
    products: ["WD-2000 冷熱", "WD-3000 冷熱溫", "WD-PRO 智能款"],
    unitPrice: 15000,
    priceStep: 1200,
    quantityBase: 1
  }
};

const ORDER_STATUS = ["待出貨", "處理中", "已出貨", "已完成"];
const SAMPLE_ADDRESSES = [
  "台北市信義區忠孝東路 100 號",
  "新北市板橋區中山路 50 號",
  "桃園市中壢區中央路 80 號",
  "台中市西屯區台灣大道 200 號",
  "台南市東區大同路 300 號"
];
const SAMPLE_NOTES = ["定期配送", "需要事前聯繫", "請協助搬運", "現場收款", "搭配促銷活動"];

const mockCustomers = Array.from({ length: 12 }, (_, index) => `mock-${index}`);

const formatDate = (date) => date.toISOString().split("T")[0];
const addDays = (date, days) => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
};

const generateOrders = () => {
  const orders = [];
  mockCustomers.forEach((customerKey, customerIndex) => {
    Object.entries(ORDER_TYPE_CONFIG).forEach(([typeKey, config]) => {
      for (let i = 0; i < 18; i += 1) {
        const baseDate = new Date(2025, (customerIndex + i) % 12, ((customerIndex + 3 * i) % 27) + 1);
        const quantity = typeKey === "dispenser" ? ((i % 2) + 1) : config.quantityBase + (i % 4) * 4;
        const unitPrice = config.unitPrice + (i % 3) * config.priceStep;
        const total = quantity * unitPrice;
        orders.push({
          id: `${config.prefix}-${customerIndex + 1}-${i + 1}`,
          type: typeKey,
          customerKey,
          orderCode: `${config.prefix}${(customerIndex + 1).toString().padStart(2, "0")}${(i + 1).toString().padStart(3, "0")}`,
          productId: `${typeKey}-${(i % config.products.length) + 1}`,
          productName: config.products[i % config.products.length],
          orderDate: formatDate(baseDate),
          shipDate: formatDate(addDays(baseDate, 2)),
          quantity,
          unitPrice,
          total,
          status: ORDER_STATUS[(i + customerIndex) % ORDER_STATUS.length],
          address: SAMPLE_ADDRESSES[(customerIndex + i) % SAMPLE_ADDRESSES.length],
          note: SAMPLE_NOTES[i % SAMPLE_NOTES.length]
        });
      }
    });
  });
  return orders;
};

const mockOrders = generateOrders();

const resolveCustomerKey = (customerId) => {
  if (!customerId) return mockCustomers[0];
  const str = String(customerId);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % mockCustomers.length;
  }
  return mockCustomers[hash];
};

const filterOrders = ({ customerId, type, startDate, endDate }) => {
  const customerKey = resolveCustomerKey(customerId);
  const start = startDate ? new Date(startDate).getTime() : null;
  const end = endDate ? new Date(endDate).getTime() : null;
  return mockOrders
    .filter((order) => order.customerKey === customerKey)
    .filter((order) => (type ? order.type === type : true))
    .filter((order) => {
      const time = new Date(order.orderDate).getTime();
      if (Number.isNaN(time)) return true;
      if (start && time < start) return false;
      if (end && time > end) return false;
      return true;
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

const paginateOrders = (orders, page = 1, limit = 5) => {
  const safeLimit = limit === "max" ? orders.length || 1 : Math.max(1, Number(limit) || 5);
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.min(Math.max(page || 1, 1), totalPages);
  const startIndex = (currentPage - 1) * safeLimit;
  const data = orders.slice(startIndex, startIndex + safeLimit);
  return {
    data,
    meta: {
      total,
      page: currentPage,
      limit: safeLimit,
      totalPages
    }
  };
};

const getOrdersByCustomerId = (customerId) => filterOrders({ customerId });

const getOrdersByCustomerIdAndType = (customerId, type) => filterOrders({ customerId, type });

const fetchMockOrdersByType = async ({ customerId, type, startDate, endDate, page = 1, limit = 5 }) => {
  const orders = filterOrders({ customerId, type, startDate, endDate });
  return paginateOrders(orders, page, limit);
};

const orderTypeLabels = Object.keys(ORDER_TYPE_CONFIG).reduce((acc, key) => {
  acc[key] = ORDER_TYPE_CONFIG[key].label;
  return acc;
}, {});

const orderStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800"
};

export {
  fetchMockOrdersByType,
  getOrdersByCustomerId,
  getOrdersByCustomerIdAndType,
  mockOrders,
  orderStatusColors,
  orderTypeLabels
};
