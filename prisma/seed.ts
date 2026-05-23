import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const mumbai = await prisma.warehouse.create({
    data: { name: "Mumbai Central", location: "Mumbai, MH" },
  });
  const delhi = await prisma.warehouse.create({
    data: { name: "Delhi North", location: "New Delhi, DL" },
  });

  const products = [
    {
      name: "Wireless Headphones",
      description: "Noise-cancelling, 30hr battery",
    },
    {
      name: "Mechanical Keyboard",
      description: "TKL layout, Cherry MX switches",
    },
    { name: "USB-C Hub", description: "7-in-1, 4K HDMI, 100W PD" },
  ];

  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    await prisma.stock.createMany({
      data: [
        {
          productId: product.id,
          warehouseId: mumbai.id,
          totalUnits: 5,
          reservedUnits: 0,
        },
        {
          productId: product.id,
          warehouseId: delhi.id,
          totalUnits: 3,
          reservedUnits: 0,
        },
      ],
    });
  }

  console.log("Seeded: 3 products × 2 warehouses");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
