import { NextResponse } from "next/server";
import { createFamily } from "../../../lib/db.js";
import { newToken, parseJsonBody, isCleanText, clientIp, rateLimitFor } from "../../../lib/validate.js";
import { rateLimit } from "../../../lib/roomStore.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST(req) {
  try {
    const ip = clientIp(req);
    if (!(await rateLimit(`familycreate:${ip}`, rateLimitFor(10), 3600))) {
      return NextResponse.json({ ok: false, error: "Too many families created from here. Try again later." }, { status: 429, headers: noStore });
    }
  } catch { /* rate limiting unavailable — creation still proceeds */ }
  const body = await parseJsonBody(req);
  const name = String(body?.name || "Our Family").replace(/\s+/g, " ").trim().slice(0, 40) || "Our Family";
  if (!isCleanText(name)) {
    return NextResponse.json({ ok: false, error: "Our filter tripped on that name. Mind wording it differently?" }, { status: 400, headers: noStore });
  }
  try {
    const memberToken = newToken();
    const ownerToken = newToken();
    const family = await createFamily(name, memberToken, ownerToken);
    // Plain tokens are returned exactly once; only hashes are stored.
    return NextResponse.json({ ok: true, familyId: family.id, memberToken, ownerToken }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: noStore });
  }
}
