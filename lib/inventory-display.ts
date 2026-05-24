import type {
  DashboardStats,
  DisplayProduct,
  DisplayWarehouseStock,
  ProductWithStock,
  StockLevel,
  Warehouse,
} from "@/lib/inventory-types";

export function computeDashboardStats(
  products: ProductWithStock[],
  warehouses: Warehouse[],
): DashboardStats {
  const unitsAvailable = products.reduce(
    (sum, product) =>
      sum +
      product.stock.reduce(
        (stockSum, entry) => stockSum + entry.availableUnits,
        0,
      ),
    0,
  );

  return {
    productCount: products.length,
    warehouseCount: warehouses.length,
    unitsAvailable,
  };
}

export function formatStatNumber(value: number): string {
  if (value >= 1000) {
    const rounded = value / 1000;
    return Number.isInteger(rounded) ? `${rounded}k` : `${rounded.toFixed(1)}k`;
  }
  return String(value);
}

function getStockLevel(available: number, total: number): StockLevel {
  if (available <= 0) return "empty";
  if (total <= 0) return "low";
  const ratio = available / total;
  if (ratio >= 0.5) return "high";
  if (ratio >= 0.2) return "medium";
  return "low";
}

export function getProductEmoji(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("headphone") || lowerName.includes("earbud"))
    return "🎧";
  if (lowerName.includes("keyboard")) return "⌨️";
  if (lowerName.includes("mouse") || lowerName.includes("mice")) return "🖱️";
  if (lowerName.includes("monitor") || lowerName.includes("display"))
    return "🖥️";
  if (lowerName.includes("laptop") || lowerName.includes("macbook"))
    return "💻";
  if (lowerName.includes("phone") || lowerName.includes("mobile")) return "📱";
  if (lowerName.includes("watch")) return "⌚";
  if (
    lowerName.includes("charger") ||
    lowerName.includes("adapter") ||
    lowerName.includes("power")
  )
    return "🔌";
  if (
    lowerName.includes("cable") ||
    lowerName.includes("hub") ||
    lowerName.includes("usb")
  )
    return "🔗";
  if (lowerName.includes("camera") || lowerName.includes("webcam")) return "📷";
  if (lowerName.includes("speaker") || lowerName.includes("audio")) return "🔈";
  if (lowerName.includes("console") || lowerName.includes("controller"))
    return "🎮";
  if (lowerName.includes("chair") || lowerName.includes("desk")) return "🪑";

  const emojis = ["📦", "🔧", "⚙️", "🛠️", "📡", "🔋"];
  const index =
    name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    emojis.length;
  return emojis[index];
}

export function toDisplaySku(productId: string): string {
  return `SKU-${productId.slice(-4).toUpperCase()}`;
}

export function toDisplayProduct(product: ProductWithStock): DisplayProduct {
  return {
    id: product.id,
    sku: toDisplaySku(product.id),
    emoji: getProductEmoji(product.name),
    title: product.name,
    description: product.description ?? "No description available.",
    warehouses: product.stock.map(
      (entry): DisplayWarehouseStock => ({
        warehouseId: entry.warehouseId,
        name: entry.warehouse.name,
        location: entry.warehouse.location,
        quantity: entry.availableUnits,
        totalUnits: entry.totalUnits,
        level: getStockLevel(entry.availableUnits, entry.totalUnits),
        fillPercent:
          entry.totalUnits > 0
            ? Math.round((entry.availableUnits / entry.totalUnits) * 100)
            : 0,
      }),
    ),
  };
}

export function getLocationFilters(warehouses: Warehouse[]): string[] {
  const cities = warehouses
    .map((warehouse) => warehouse.location.split(",")[0]?.trim())
    .filter((city): city is string => Boolean(city));

  return [...new Set(cities)];
}

export function productHasAvailableStock(product: DisplayProduct): boolean {
  return product.warehouses.some((warehouse) => warehouse.quantity > 0);
}

export function productMatchesLocation(
  product: DisplayProduct,
  locationFilter: string,
): boolean {
  return product.warehouses.some(
    (warehouse) =>
      warehouse.totalUnits > 0 &&
      warehouse.location.toLowerCase().includes(locationFilter.toLowerCase()),
  );
}

export function formatReservationId(id: string): string {
  return `#SP-${id.slice(-4).toUpperCase()}`;
}

export function formatCountdown(expiresAt: string): {
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

export function isReservationExpired(reservation: {
  status: string;
  expiresAt: string;
}): boolean {
  return (
    reservation.status !== "PENDING" ||
    new Date(reservation.expiresAt).getTime() <= Date.now()
  );
}

export function isReservationActive(reservation: {
  status: string;
  expiresAt: string;
}): boolean {
  return (
    reservation.status === "PENDING" &&
    new Date(reservation.expiresAt).getTime() > Date.now()
  );
}

export function productMatchesSearch(
  product: DisplayProduct,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    product.title.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized) ||
    product.sku.toLowerCase().includes(normalized) ||
    product.id.toLowerCase().includes(normalized)
  );
}
