import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
  });

  let released = 0;
  for (const res of expired) {
    await prisma.$transaction([
      prisma.stock.update({
        where: {
          productId_warehouseId: {
            productId: res.productId,
            warehouseId: res.warehouseId,
          },
        },
        data: { reservedUnits: { decrement: res.quantity } },
      }),
      prisma.reservation.update({
        where: { id: res.id },
        data: { status: "RELEASED" },
      }),
    ]);
    released++;
  }

  return NextResponse.json({ released });
}
