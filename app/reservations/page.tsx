import { AppShell } from "@/components/layout/app-shell";
import { ReservationsList } from "@/components/reservations/reservations-list";
import { getPendingReservations } from "@/lib/reservations.server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const session = await auth();
  const reservations = session?.user?.id
    ? await getPendingReservations(session.user.id)
    : [];

  return (
    <AppShell>
      <ReservationsList reservations={reservations} />
    </AppShell>
  );
}
