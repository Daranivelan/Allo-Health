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

  const locations = [
    { name: "Mumbai Central", location: "Mumbai, MH" },
    { name: "Delhi North", location: "New Delhi, DL" },
    { name: "Bangalore Tech Park", location: "Bangalore, KA" },
    { name: "Chennai Hub", location: "Chennai, TN" },
    { name: "Hyderabad Fulfillment", location: "Hyderabad, TN" },
  ];

  const createdWarehouses = [];
  for (const loc of locations) {
    createdWarehouses.push(await prisma.warehouse.create({ data: loc }));
  }

  const productsList = [
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      description:
        "Industry leading noise-canceling, 30hr battery life, multipoint connection.",
    },
    {
      name: "Apple AirPods Pro (2nd Gen)",
      description:
        "Active Noise Cancellation, Adaptive Transparency, MagSafe charging case.",
    },
    {
      name: "Keychron K2 Wireless Mechanical Keyboard",
      description:
        "TKL 84-keys layout, Cherry MX Brown switches, RGB backlight.",
    },
    {
      name: "Logitech MX Master 3S Mouse",
      description:
        "MagSpeed scrolling, 8000 DPI track-anywhere sensor, quiet clicks.",
    },
    {
      name: "Dell UltraSharp 27 Monitor",
      description: "27-inch 4K UHD (3840 x 2160) USB-C Hub Monitor.",
    },
    {
      name: "Samsung Galaxy S24 Ultra Phone",
      description:
        "256GB Storage, Titanium Gray, AI equipped flagship smartphone.",
    },
    {
      name: "Apple iPhone 15 Pro Max",
      description: "256GB Storage, Natural Titanium, A17 Pro chip.",
    },
    {
      name: "Apple Watch Series 9",
      description: "GPS 45mm, Midnight Aluminum Case with Sport Band.",
    },
    {
      name: "Garmin Fenix 7X Pro Watch",
      description:
        "Multisport GPS smartwatch, solar charging, built-in flashlight.",
    },
    {
      name: "Anker 7-in-1 USB-C Hub",
      description:
        "USB-C adapter with 4K HDMI, 100W Power Delivery, SD/microSD card reader.",
    },
    {
      name: "Belkin 65W Dual USB-C Charger",
      description: "GaN fast charging wall charger for laptops and phones.",
    },
    {
      name: "Sony Alpha a7 IV Mirrorless Camera",
      description: "33MP Full-Frame sensor, 4K 60p video, with 28-70mm lens.",
    },
    {
      name: "Logitech Brio 4K Webcam",
      description: "Ultra HD Pro Business Webcam with HDR and RightLight 3.",
    },
    {
      name: "Sonos Roam Smart Speaker",
      description:
        "Portable waterproof smart speaker with Bluetooth and Wi-Fi.",
    },
    {
      name: "PlayStation 5 Console",
      description: "Sony PS5 Disc Edition, 825GB SSD, 4K-TV Gaming.",
    },
    {
      name: "Xbox DualSense Wireless Controller",
      description: "Haptic feedback, adaptive triggers, built-in microphone.",
    },
    {
      name: "Herman Miller Aeron Chair",
      description:
        "Ergonomic office chair, Pellicle suspension material, adjustable posture fit.",
    },
    {
      name: "Uplift Standing Desk",
      description: "Adjustable height motor standing desk with bamboo top.",
    },
  ];

  for (const p of productsList) {
    const product = await prisma.product.create({ data: p });

    const stockEntries = createdWarehouses.map((wh) => {
      const isStockedLocally = Math.random() > 0.3;
      const totalUnits = isStockedLocally
        ? Math.floor(Math.random() * 30) + 1
        : 0;
      return {
        productId: product.id,
        warehouseId: wh.id,
        totalUnits: totalUnits,
        reservedUnits: 0,
      };
    });

    await prisma.stock.createMany({ data: stockEntries });
  }

  console.log("Seeded: " + productsList.length + " products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
