import { NextResponse } from "next/server";
import { purgeExpiredFamilies } from "../../../../lib/db.js";

export const dynamic = "force-dynamic";

// Daily purge of family albums idle for 60+ days (Vercel Cron).
// Vercel sends Authorization: Bearer $CRON_SECRET when that env var is set.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const purged = await purgeExpiredFamilies();
    return NextResponse.json({ ok: true, purged }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.code || "DB_UNAVAILABLE" }, { status: 503 });
  }
}
