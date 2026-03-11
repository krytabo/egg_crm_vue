const mockProducts = [
  // 飲水
  { id: "water-1", category: "飲水", name: "清泉", spec: "20L", retailPrice: 150 },
  { id: "water-2", category: "飲水", name: "純淨", spec: "20L", retailPrice: 145 },
  { id: "water-3", category: "飲水", name: "山泉", spec: "12L", retailPrice: 110 },
  // 雞蛋
  { id: "egg-1", category: "雞蛋", name: "紅殼蛋", spec: "10入/盒", retailPrice: 90 },
  { id: "egg-2", category: "雞蛋", name: "白殼蛋", spec: "10入/盒", retailPrice: 85 },
  { id: "egg-3", category: "雞蛋", name: "土雞蛋", spec: "6入/盒", retailPrice: 120 },
  // 飲水機
  { id: "dispenser-1", category: "飲水機", name: "WD-2000", spec: "冷熱", retailPrice: 12e3 },
  { id: "dispenser-2", category: "飲水機", name: "WD-3000", spec: "冷熱溫", retailPrice: 18e3 },
  { id: "dispenser-3", category: "飲水機", name: "Premium-500", spec: "冷熱溫除菌", retailPrice: 26e3 }
];
const getProductById = (id) => {
  return mockProducts.find((p) => p.id === id);
};
const getProductsByCategory = (category) => {
  return mockProducts.filter((p) => p.category === category);
};
export {
  getProductById,
  getProductsByCategory,
  mockProducts
};
