import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  afterStockMutation,
  releasePendingReservation,
} from "@/lib/reservations.server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Reservation not pending" },
        { status: 409 },
      );
    }

    if (new Date() > reservation.expiresAt) {
      await releasePendingReservation(reservation);
      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 410 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          totalUnits: { decrement: reservation.quantity },
          reservedUnits: { decrement: reservation.quantity },
        },
      });

      return tx.reservation.update({
        where: { id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
        include: {
          product: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
        },
      });
    });

    await afterStockMutation(id);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[confirm]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
