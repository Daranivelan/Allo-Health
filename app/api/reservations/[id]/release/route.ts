import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseReservationById } from "@/lib/reservations.server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const released = await releaseReservationById(id);
    if (!released) {
      const reservation = await prisma.reservation.findUnique({ where: { id } });
      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 },
        );
      }
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
