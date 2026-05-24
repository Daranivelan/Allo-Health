import {
  computeDashboardStats,
} from "@/lib/inventory-display";
import {
  getProductsWithStock,
  getWarehouses,
} from "@/lib/inventory.server";
import { InventoryDashboard } from "@/components/landing/inventory-dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, warehouses] = await Promise.all([
    getProductsWithStock(),
    getWarehouses(),
  ]);

  const stats = computeDashboardStats(products, warehouses);

  return (
    <InventoryDashboard
      products={products}
      warehouses={warehouses}
      stats={stats}
    />
  );
}
