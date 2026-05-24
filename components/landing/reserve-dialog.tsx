"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { DisplayProduct, ReservationResponse } from "@/lib/inventory-types";
import { createReservation } from "@/lib/inventory-client";
import { cn } from "@/lib/utils";

type ReserveDialogProps = {
  product: DisplayProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (reservation: ReservationResponse) => void;
};

export function ReserveDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: ReserveDialogProps) {
  const availableWarehouses = useMemo(
    () => product?.warehouses.filter((warehouse) => warehouse.quantity > 0) ?? [],
    [product],
  );

  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWarehouse = availableWarehouses.find(
    (warehouse) => warehouse.warehouseId === warehouseId,
  );
  const maxQuantity = selectedWarehouse?.quantity ?? 1;

  useEffect(() => {
    if (!open || !product) return;
    setWarehouseId(availableWarehouses[0]?.warehouseId ?? "");
    setQuantity(1);
    setError(null);
  }, [open, product, availableWarehouses]);

  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity));
    }
  }, [maxQuantity, quantity]);

  if (!open || !product) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!product || !warehouseId) return;

    setSubmitting(true);
    setError(null);

    try {
      const reservation = await createReservation({
        productId: product.id,
        warehouseId,
        quantity,
      });
      onSuccess(reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reserve stock");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        className="w-full max-w-md rounded-lg border border-[#e0bfb9] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="reserve-title"
          className="font-[family-name:var(--font-dm-serif)] text-2xl text-[#1b1c19]"
        >
          Reserve Stock
        </h2>
        <p className="mt-1 text-sm text-[#58413c]">
          {product.title} · {product.sku}
        </p>

        {availableWarehouses.length === 0 ? (
          <p className="mt-6 text-sm text-[#ba1a1a]">
            No available stock for this product.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#58413c] uppercase">
                Warehouse
              </span>
              <select
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
                className="w-full rounded-sm border border-[#e0bfb9] bg-white px-3 py-2 text-sm text-[#1b1c19] focus:border-[#c84b31] focus:outline-none"
              >
                {availableWarehouses.map((warehouse) => (
                  <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                    {warehouse.name} ({warehouse.quantity} available)
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#58413c] uppercase">
                Quantity
              </span>
              <input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number.parseInt(event.target.value, 10) || 1)
                }
                className="w-full rounded-sm border border-[#e0bfb9] bg-white px-3 py-2 text-sm text-[#1b1c19] focus:border-[#c84b31] focus:outline-none"
              />
            </label>

            {error && (
              <p className="text-sm text-[#ba1a1a]" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-sm border border-[#e0bfb9] py-2.5 text-sm font-medium text-[#58413c] transition-colors hover:bg-[#f5f3ee]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !warehouseId}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#c84b31] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a6331b] disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Reserve
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
