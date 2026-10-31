import { NextResponse } from "next/server";
import { dbHealth } from "../../../../lib/db.js";

export const dynamic = "force-dynamic";

// Read-only production readiness check: is a real database connected?
// Returns no family data and no credentials.
export async function GET() {
  const health = await dbHealth();
  return NextResponse.json(
    { ...health, serverNow: Date.now() },
    { status: health.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
