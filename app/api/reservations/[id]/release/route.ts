import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { releaseReservationById } from "@/lib/reservations.server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reservationToRelease = await prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservationToRelease) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (reservationToRelease.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const released = await releaseReservationById(id);
    if (!released) {
      return NextResponse.json(
        { error: "Already confirmed/released" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[release]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
