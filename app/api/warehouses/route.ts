import { NextResponse } from "next/server";
import { getWarehouses } from "@/lib/inventory.server";

export async function GET() {
  try {
    return NextResponse.json(await getWarehouses());
  } catch (err) {
    console.error("[GET /api/warehouses]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
