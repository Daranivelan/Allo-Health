import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReserveSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReserveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { productId, warehouseId, quantity } = parsed.data;

    const idempotencyKey = req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const existing = await prisma.reservation.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return NextResponse.json(existing, { status: 200 });
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const rowsAffected = await tx.$executeRaw`
        UPDATE "Stock"
        SET "reservedUnits" = "reservedUnits" + ${quantity}
        WHERE "productId"   = ${productId}
          AND "warehouseId" = ${warehouseId}
          AND ("totalUnits" - "reservedUnits") >= ${quantity}
      `;

      if (rowsAffected === 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      return tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
        include: {
          product: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 409 },
      );
    }
    console.error("[POST /api/reservations]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
