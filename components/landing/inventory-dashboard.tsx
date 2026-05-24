"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DashboardStats,
  DisplayProduct,
  ProductWithStock,
  ReservationResponse,
  Warehouse,
} from "@/lib/inventory-types";
import {
  formatStatNumber,
  getLocationFilters,
  productHasAvailableStock,
  productMatchesLocation,
  productMatchesSearch,
  toDisplayProduct,
} from "@/lib/inventory-display";
import { AppShell } from "@/components/layout/app-shell";
import { FilterBar } from "@/components/landing/filter-bar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProductCard } from "@/components/landing/product-card";
import { ReserveDialog } from "@/components/landing/reserve-dialog";

type InventoryDashboardProps = {
  products: ProductWithStock[];
  warehouses: Warehouse[];
  stats: DashboardStats;
};

export function InventoryDashboard({
  products,
  warehouses,
  stats,
}: InventoryDashboardProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(
    null,
  );

  const displayProducts = useMemo(
    () => products.map(toDisplayProduct),
    [products],
  );

  const locationFilters = useMemo(
    () => getLocationFilters(warehouses),
    [warehouses],
  );

  const filteredProducts = useMemo(() => {
    return displayProducts.reduce<DisplayProduct[]>((acc, product) => {
      if (!productMatchesSearch(product, searchQuery)) return acc;

      if (activeFilter === "All Items") {
        acc.push(product);
        return acc;
      }

      if (activeFilter === "In Stock") {
        if (productHasAvailableStock(product)) {
          acc.push(product);
        }
        return acc;
      }

      const matchingWarehouses = product.warehouses.filter(
        (warehouse) =>
          warehouse.totalUnits > 0 &&
          warehouse.location.toLowerCase().includes(activeFilter.toLowerCase()),
      );

      if (matchingWarehouses.length > 0) {
        acc.push({ ...product, warehouses: matchingWarehouses });
      }

      return acc;
    }, []);
  }, [activeFilter, displayProducts, searchQuery]);

  const heroStats = [
    { value: String(stats.productCount), label: "PRODUCTS" },
    { value: String(stats.warehouseCount), label: "WAREHOUSES" },
    {
      value: formatStatNumber(stats.unitsAvailable),
      label: "UNITS AVAILABLE",
    },
  ];

  function handleReservationCreated(reservation: ReservationResponse) {
    setSelectedProduct(null);
    router.push(`/reservations/${reservation.id}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] space-y-6 p-6">
        <HeroSection stats={heroStats} />
        <FilterBar
          filters={["All Items", "In Stock", ...locationFilters]}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#e0bfb9] bg-white px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-dm-serif)] text-2xl text-[#1b1c19]">
              No products match your filters
            </p>
            <p className="mt-2 text-sm text-[#58413c]">
              Try clearing the search or selecting a different filter.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserve={() => setSelectedProduct(product)}
              />
            ))}
          </section>
        )}
      </div>

      <ReserveDialog
        product={selectedProduct}
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        onSuccess={handleReservationCreated}
      />
    </AppShell>
  );
}
