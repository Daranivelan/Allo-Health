"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ReservationDetail } from "@/lib/inventory-types";
import { confirmReservation, releaseReservation } from "@/lib/inventory-client";
import {
  formatReservationId,
  getProductEmoji,
  isReservationActive,
} from "@/lib/inventory-display";
import { CountdownTimer } from "@/components/reservations/countdown-timer";

type ReservationCompletionProps = {
  reservation: ReservationDetail;
};

export function ReservationCompletion({
  reservation: initialReservation,
}: ReservationCompletionProps) {
  const router = useRouter();
  const [reservation, setReservation] = useState(initialReservation);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const hasReleasedOnExpire = useRef(false);

  const isPending = isReservationActive(reservation);
  const emoji = getProductEmoji(reservation.product.name);
  const shortProductName =
    reservation.product.name.length > 18
      ? `${reservation.product.name.slice(0, 15)}...`
      : reservation.product.name;

  const handleExpire = useCallback(async () => {
    if (hasReleasedOnExpire.current) return;
    hasReleasedOnExpire.current = true;

    try {
      await releaseReservation(reservation.id);
      setReservation((current) => ({ ...current, status: "RELEASED" }));
      toast.info("Reservation expired", {
        description: "Held stock has been returned to inventory.",
      });
      router.refresh();
    } catch {
      hasReleasedOnExpire.current = false;
    }
  }, [reservation.id, router]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await confirmReservation(reservation.id);
      toast.success("Purchase confirmed", {
        description: "Stock has been allocated to your order.",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm reservation",
      );
    } finally {
      setConfirming(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await releaseReservation(reservation.id);
      toast.success("Reservation cancelled", {
        description: "Held stock has been released.",
      });
      router.push("/reservations");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel reservation",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 sm:py-6">
      <div className="overflow-hidden rounded border border-[#e0bfb9] bg-white shadow-sm">
        <div className="grid min-h-[656px] lg:grid-cols-2">
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-16">
            <div className="space-y-6">
              {isPending ? (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#a6331b]" />
                  <span className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[1.2px] text-[#a6331b] uppercase">
                    Reservation active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#77746e]" />
                  <span className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[1.2px] text-[#5e5b56] uppercase">
                    {reservation.status}
                  </span>
                </div>
              )}

              <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl leading-tight text-[#1b1c19] sm:text-[32px] sm:leading-[38.4px]">
                Complete your reservation
              </h1>

              <div className="flex flex-col gap-4 rounded-sm border border-[#e0bfb9] p-4 sm:flex-row sm:gap-6 sm:p-6">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-sm border border-[#e0bfb9] bg-[#f0eee9] text-[32px]">
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-[#1b1c19]">
                    {reservation.product.name}
                  </h2>
                  <p className="mt-4 text-sm text-[#58413c]">
                    {reservation.warehouse.name} · Qty: {reservation.quantity}
                  </p>
                </div>
                <span className="h-fit rounded-sm border border-[#77746e] bg-[rgba(119,116,110,0.1)] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#5e5b56]">
                  {reservation.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="rounded-sm border border-[#e0bfb9] bg-[#f5f3ee] p-3">
                  <p className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#58413c] uppercase">
                    Res ID
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#1b1c19]">
                    {formatReservationId(reservation.id)}
                  </p>
                </div>
                <div className="rounded-sm border border-[#e0bfb9] bg-[#f5f3ee] p-3">
                  <p className="font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#58413c] uppercase">
                    Location
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#1b1c19]">
                    {reservation.warehouse.location}
                  </p>
                </div>
              </div>
            </div>

            {isPending ? (
              <div className="mt-10 space-y-2 sm:mt-16">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirming || cancelling}
                  className="flex h-10 w-full items-center justify-center gap-1 rounded-sm bg-[#c84b31] text-[15px] font-semibold tracking-[0.15px] text-[#fffbff] transition-colors hover:bg-[#a6331b] disabled:opacity-60"
                >
                  {confirming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Confirm Purchase
                      <CircleCheck className="size-4" strokeWidth={2} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={confirming || cancelling}
                  className="flex h-10 w-full items-center justify-center rounded-sm border border-[#e0bfb9] text-[15px] font-semibold tracking-[0.15px] text-[#1b1c19] transition-colors hover:bg-[#f5f3ee] disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Cancel Reservation"
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-16">
                <Link
                  href="/reservations"
                  className="inline-flex h-10 items-center justify-center rounded-sm border border-[#e0bfb9] px-4 text-[15px] font-semibold text-[#1b1c19] hover:bg-[#f5f3ee]"
                >
                  Back to reservations
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-[#e0bfb9] bg-[#f5f3ee] p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-16">
            <div className="space-y-10">
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.7px] text-[#58413c] uppercase">
                  Time remaining
                </p>
                <div className="mt-6">
                  {isPending ? (
                    <CountdownTimer
                      expiresAt={reservation.expiresAt}
                      onExpire={handleExpire}
                    />
                  ) : (
                    <div className="rounded border border-[#e0bfb9] bg-[#1b1c19] p-10 text-center">
                      <p className="font-[family-name:var(--font-dm-serif)] text-3xl text-white">
                        {reservation.status === "CONFIRMED"
                          ? "Confirmed"
                          : "Expired"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="border-b border-[#e0bfb9] pb-3 font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#58413c] uppercase">
                  Order summary
                </p>
                <dl className="mt-1 divide-y divide-[#e0bfb9]">
                  <SummaryRow label="Product" value={shortProductName} />
                  <SummaryRow
                    label="Warehouse"
                    value={reservation.warehouse.name}
                  />
                  <SummaryRow
                    label="Quantity"
                    value={`${reservation.quantity} Units`}
                  />
                </dl>
                <div className="flex items-center justify-between pt-6">
                  <span className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#1b1c19]">
                    Total Allocation
                  </span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#a6331b]">
                    {reservation.quantity} Items
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#58413c]">
        {label}
      </dt>
      <dd className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#1b1c19]">
        {value}
      </dd>
    </div>
  );
}
