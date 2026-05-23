import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status !== "PENDING") throw new Error("NOT_PENDING");

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
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "NOT_FOUND")
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    if (err.message === "NOT_PENDING")
      return NextResponse.json(
        { error: "Already confirmed/released" },
        { status: 409 },
      );
    console.error("[release]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
