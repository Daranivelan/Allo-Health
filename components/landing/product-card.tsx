import type { DisplayProduct } from "@/lib/inventory-types";
import { StockBar } from "./stock-bar";

type ProductCardProps = {
  product: DisplayProduct;
  onReserve: () => void;
};

export function ProductCard({ product, onReserve }: ProductCardProps) {
  const hasStock = product.warehouses.some(
    (warehouse) => warehouse.quantity > 0,
  );

  return (
    <article className="flex flex-col overflow-hidden rounded border border-[#e0bfb9] bg-white">
      <div
        className="flex h-24 items-start justify-between gap-3 p-4"
        style={{
          backgroundImage:
            "linear-gradient(162deg, rgb(251, 249, 244) 0%, rgb(228, 226, 221) 100%)",
        }}
      >
        <span className="text-3xl leading-10 sm:text-4xl">{product.emoji}</span>
        <span className="shrink-0 rounded border border-[#e0bfb9] bg-white/80 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] backdrop-blur-sm">
          {product.sku}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-4">
        <div>
          <h3 className="text-base font-medium text-[#1b1c19] sm:text-lg">
            {product.title}
          </h3>
          <p className="mt-1 text-sm leading-[21px] text-[#58413c]">
            {product.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {product.warehouses.map((warehouse) => (
            <StockBar key={warehouse.warehouseId} {...warehouse} />
          ))}
        </div>
      </div>

      <div className="border-t border-[#e0bfb9] bg-[#fbf9f4]/50 p-4 pt-[17px]">
        <button
          type="button"
          onClick={onReserve}
          disabled={!hasStock}
          className="w-full rounded-sm border border-[#1b1c19] py-2.5 text-sm font-semibold tracking-[0.15px] text-[#1b1c19] transition-colors hover:bg-[#1b1c19] hover:text-white disabled:cursor-not-allowed disabled:border-[#e0bfb9] disabled:text-[#58413c] disabled:hover:bg-transparent sm:text-[15px]"
        >
          {hasStock ? "Reserve Stock" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}
