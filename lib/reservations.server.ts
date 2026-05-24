import type { ReservationDetail } from "@/lib/inventory-types";
import { invalidateProductsCache } from "@/lib/redis-cache";
import {
  getExpiredReservationIds,
  unregisterReservationExpiry,
} from "@/lib/redis-reservations";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const reservationInclude = {
  product: { select: { id: true, name: true, description: true } },
  warehouse: { select: { id: true, name: true, location: true } },
} as const;

function serializeReservation(reservation: {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: ReservationDetail["status"];
  expiresAt: Date;
  createdAt: Date;
  product: { id: string; name: string; description: string | null };
  warehouse: { id: string; name: string; location: string };
}): ReservationDetail {
  return {
    id: reservation.id,
    productId: reservation.productId,
    warehouseId: reservation.warehouseId,
    quantity: reservation.quantity,
    status: reservation.status,
    expiresAt: reservation.expiresAt.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    product: reservation.product,
    warehouse: reservation.warehouse,
  };
}

type PendingReservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
};

async function releasePendingReservationInTx(
  tx: Prisma.TransactionClient,
  reservation: PendingReservation,
): Promise<boolean> {
  const current = await tx.reservation.findUnique({
    where: { id: reservation.id },
  });

  if (!current || current.status !== "PENDING") return false;

  await tx.stock.update({
    where: {
      productId_warehouseId: {
        productId: current.productId,
        warehouseId: current.warehouseId,
      },
    },
    data: { reservedUnits: { decrement: current.quantity } },
  });

  await tx.reservation.update({
    where: { id: current.id },
    data: { status: "RELEASED" },
  });

  return true;
}

async function afterStockMutation(reservationId: string): Promise<void> {
  await unregisterReservationExpiry(reservationId);
  await invalidateProductsCache();
}

export async function releasePendingReservation(
  reservation: PendingReservation,
): Promise<boolean> {
  const released = await prisma.$transaction((tx) =>
    releasePendingReservationInTx(tx, reservation),
  );

  if (released) {
    await afterStockMutation(reservation.id);
  }

  return released;
}

export async function releaseReservationById(id: string): Promise<boolean> {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return false;
  return releasePendingReservation(reservation);
}

export async function expireReservationIfNeeded(id: string): Promise<boolean> {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return false;
  if (reservation.status !== "PENDING") return false;
  if (reservation.expiresAt >= new Date()) return false;
  return releasePendingReservation(reservation);
}

export async function releaseExpiredReservations(): Promise<number> {
  const redisExpiredIds = await getExpiredReservationIds();
  let released = 0;

  for (const id of redisExpiredIds) {
    const didRelease = await expireReservationIfNeeded(id);
    if (didRelease) released++;
    await unregisterReservationExpiry(id);
  }

  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
  });

  for (const reservation of expired) {
    const didRelease = await releasePendingReservation(reservation);
    if (didRelease) released++;
  }

  return released;
}

export async function getReservationById(
  id: string,
): Promise<ReservationDetail | null> {
  await expireReservationIfNeeded(id);

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: reservationInclude,
  });

  if (!reservation) return null;
  return serializeReservation(reservation);
}

export async function getPendingReservations(): Promise<ReservationDetail[]> {
  await releaseExpiredReservations();

  const reservations = await prisma.reservation.findMany({
    where: { status: "PENDING" },
    include: reservationInclude,
    orderBy: { createdAt: "desc" },
  });

  return reservations.map(serializeReservation);
}

export { afterStockMutation };
