import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ReservationCompletion } from "@/components/reservations/reservation-completion";
import { getReservationById } from "@/lib/reservations.server";

export const dynamic = "force-dynamic";

type ReservationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { id } = await params;
  const reservation = await getReservationById(id);

  if (!reservation) notFound();

  return (
    <AppShell>
      <ReservationCompletion reservation={reservation} />
    </AppShell>
  );
}
