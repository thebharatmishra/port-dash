import { NextResponse } from "next/server";

import { getPortfolioSnapshot } from "@/lib/financeService";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getPortfolioSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to build portfolio snapshot",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
