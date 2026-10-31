import { NextResponse } from "next/server";
import { createFamily } from "../../../lib/db.js";
import { newToken, parseJsonBody } from "../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST(req) {
  const body = await parseJsonBody(req);
  const name = String(body?.name || "Our Family").replace(/\s+/g, " ").trim().slice(0, 40) || "Our Family";
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
