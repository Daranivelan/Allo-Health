import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    accelerateUrl:
      process.env.PRISMA_ACCELERATE_URL ?? process.env.ACCELERATE_URL ?? "",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
