export type StockLevel = "high" | "medium" | "low" | "empty";

export type ProductStock = {
  warehouseId: string;
  warehouse: { id: string; name: string; location: string };
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

export type ProductWithStock = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  stock: ProductStock[];
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
};

export type DashboardStats = {
  productCount: number;
  warehouseCount: number;
  unitsAvailable: number;
};

export type DisplayWarehouseStock = {
  warehouseId: string;
  name: string;
  location: string;
  quantity: number;
  totalUnits: number;
  level: StockLevel;
  fillPercent: number;
};

export type DisplayProduct = {
  id: string;
  sku: string;
  emoji: string;
  title: string;
  description: string;
  warehouses: DisplayWarehouseStock[];
};

export type ReservationResponse = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
  product: { id: string; name: string };
  warehouse: { id: string; name: string };
};

export type ReservationDetail = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  createdAt: string;
  product: { id: string; name: string; description: string | null };
  warehouse: { id: string; name: string; location: string };
};
