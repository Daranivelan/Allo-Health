import Link from "next/link";
import type { ReservationDetail } from "@/lib/inventory-types";
import {
  formatCountdown,
  formatReservationId,
  getProductEmoji,
} from "@/lib/inventory-display";

type ReservationsListProps = {
  reservations: ReservationDetail[];
};

export function ReservationsList({ reservations }: ReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] p-6">
        <div className="rounded-lg border border-dashed border-[#e0bfb9] bg-white px-6 py-16 text-center">
          <h1 className="font-[family-name:var(--font-dm-serif)] text-3xl text-[#1b1c19]">
            No active reservations
          </h1>
          <p className="mt-2 text-sm text-[#58413c]">
            Reserve stock from the inventory page to see it here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-sm bg-[#c84b31] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a6331b]"
          >
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-serif)] text-3xl text-[#1b1c19]">
          Active reservations
        </h1>
        <p className="mt-1 text-sm text-[#58413c]">
          Complete or cancel reservations before they expire.
        </p>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation) => {
          const countdown = formatCountdown(reservation.expiresAt);
          const timeLabel = countdown.expired
            ? "Expired"
            : `${String(countdown.minutes).padStart(2, "0")}:${String(countdown.seconds).padStart(2, "0")} left`;

          return (
            <Link
              key={reservation.id}
              href={`/reservations/${reservation.id}`}
              className="flex items-center justify-between rounded border border-[#e0bfb9] bg-white p-5 transition-colors hover:border-[#c84b31]"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-sm border border-[#e0bfb9] bg-[#f0eee9] text-2xl">
                  {getProductEmoji(reservation.product.name)}
                </span>
                <div>
                  <p className="font-medium text-[#1b1c19]">
                    {reservation.product.name}
                  </p>
                  <p className="text-sm text-[#58413c]">
                    {reservation.warehouse.name} · Qty {reservation.quantity} ·{" "}
                    {formatReservationId(reservation.id)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-[family-name:var(--font-dm-mono)] text-sm tracking-[0.28px] text-[#a6331b]">
                  {timeLabel}
                </p>
                <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.48px] text-[#58413c] uppercase">
                  {reservation.status}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
