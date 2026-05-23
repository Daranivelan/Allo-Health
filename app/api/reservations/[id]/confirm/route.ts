import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status !== "PENDING") throw new Error("NOT_PENDING");
      if (new Date() > reservation.expiresAt) {
        await tx.stock.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: { reservedUnits: { decrement: reservation.quantity } },
        });
        await tx.reservation.update({
          where: { id },
          data: { status: "RELEASED" },
        });
        throw new Error("EXPIRED");
      }

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

    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === "NOT_FOUND")
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    if (err.message === "NOT_PENDING")
      return NextResponse.json(
        { error: "Reservation not pending" },
        { status: 409 },
      );
    if (err.message === "EXPIRED")
      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 410 },
      );
    console.error("[confirm]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
