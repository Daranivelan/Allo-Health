import { prisma } from "@/lib/prisma";
import type { ProductWithStock, Warehouse } from "@/lib/inventory-types";
import { releaseExpiredReservations } from "@/lib/reservations.server";
import {
  getCachedProducts,
  getCachedWarehouses,
  setCachedProducts,
  setCachedWarehouses,
} from "@/lib/redis-cache";

async function fetchProductsWithStockFromDb(): Promise<ProductWithStock[]> {
  const products = await prisma.product.findMany({
    include: {
      stock: {
        include: {
          warehouse: {
            select: { id: true, name: true, location: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt.toISOString(),
    stock: product.stock.map((entry) => ({
      warehouseId: entry.warehouseId,
      warehouse: entry.warehouse,
      totalUnits: entry.totalUnits,
      reservedUnits: entry.reservedUnits,
      availableUnits: entry.totalUnits - entry.reservedUnits,
    })),
  }));
}

export async function getProductsWithStock(): Promise<ProductWithStock[]> {
  await releaseExpiredReservations();

  const cached = await getCachedProducts<ProductWithStock[]>();
  if (cached) return cached;

  const products = await fetchProductsWithStockFromDb();
  await setCachedProducts(products);
  return products;
}

async function fetchWarehousesFromDb(): Promise<Warehouse[]> {
  return prisma.warehouse.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true },
  });
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const cached = await getCachedWarehouses<Warehouse[]>();
  if (cached) return cached;

  const warehouses = await fetchWarehousesFromDb();
  await setCachedWarehouses(warehouses);
  return warehouses;
}
