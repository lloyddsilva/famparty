import { NextResponse } from "next/server";
import { dbHealth } from "../../../../lib/db.js";

export const dynamic = "force-dynamic";

// Read-only production readiness check: is a real database connected?
// Returns no family data and no credentials.
let cache = { at: 0, health: null };
export async function GET() {
  // Brief cache: health checks must not become a database load generator.
  if (!cache.health || Date.now() - cache.at > 30000) {
    cache = { at: Date.now(), health: await dbHealth() };
  }
  const health = cache.health;
  return NextResponse.json(
    { ...health, serverNow: Date.now() },
    { status: health.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
