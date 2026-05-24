import { NextRequest, NextResponse } from "next/server";
import { RESERVATION_HOLD_MS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { invalidateProductsCache } from "@/lib/redis-cache";
import { auth } from "@/auth";
import {
  getIdempotentReservationId,
  isReservationRateLimited,
  registerReservationExpiry,
  setIdempotentReservationId,
} from "@/lib/redis-reservations";
import { getPendingReservations } from "@/lib/reservations.server";
import { z } from "zod";

const ReserveSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const reservationInclude = {
  product: { select: { id: true, name: true } },
  warehouse: { select: { id: true, name: true } },
} as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    return NextResponse.json(await getPendingReservations(session.user.id));
  } catch (err) {
    console.error("[GET /api/reservations]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";

    if (await isReservationRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many reservation requests. Try again shortly." },
        { status: 429 },
      );
    }

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
      const cachedReservationId =
        await getIdempotentReservationId(idempotencyKey);

      if (cachedReservationId) {
        const cached = await prisma.reservation.findUnique({
          where: { id: cachedReservationId },
          include: reservationInclude,
        });
        if (cached) return NextResponse.json(cached, { status: 200 });
      }

      const existing = await prisma.reservation.findUnique({
        where: { idempotencyKey },
        include: reservationInclude,
      });
      if (existing) return NextResponse.json(existing, { status: 200 });
    }

    const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MS);

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
          userId: session!.user!.id!,
          quantity,
          status: "PENDING",
          expiresAt,
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
        include: reservationInclude,
      });
    });

    if (idempotencyKey) {
      await setIdempotentReservationId(idempotencyKey, reservation.id);
    }

    await registerReservationExpiry(reservation.id, expiresAt);
    await invalidateProductsCache();

    return NextResponse.json(reservation, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
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
