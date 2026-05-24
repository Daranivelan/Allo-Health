import { AppShell } from "@/components/layout/app-shell";
import { ReservationsList } from "@/components/reservations/reservations-list";
import { getPendingReservations } from "@/lib/reservations.server";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const reservations = await getPendingReservations();

  return (
    <AppShell>
      <ReservationsList reservations={reservations} />
    </AppShell>
  );
}
