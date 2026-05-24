import { NextResponse } from "next/server";
import { getProductsWithStock } from "@/lib/inventory.server";

export async function GET() {
  try {
    return NextResponse.json(await getProductsWithStock());
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
