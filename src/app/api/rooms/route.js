import { NextResponse } from "next/server";
import { createRoom } from "../../../lib/engine.js";
import { createRoom as storeRoom } from "../../../lib/roomStore.js";
import { makeRoomCode, newToken, hashToken, parseJsonBody } from "../../../lib/validate.js";
import { familyByToken, touchFamily } from "../../../lib/db.js";
import { rateLimit } from "../../../lib/roomStore.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST(req) {
  try {
    // Room creation is capped per IP (item 7): rooms live 2h in Redis.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!(await rateLimit(`create:${ip}`, 20, 3600))) {
      return NextResponse.json({ ok: false, error: "Too many rooms created. Try again later." }, { status: 429, headers: noStore });
    }
    const body = await parseJsonBody(req).catch(() => null);
    let familyId = null;
    if (body?.familyToken) {
      const found = await familyByToken(body.familyToken);
      if (!found) return NextResponse.json({ ok: false, error: "Family album not recognised." }, { status: 404, headers: noStore });
      familyId = found.family.id;
      await touchFamily(familyId).catch(() => {});
    }
    for (let attempt = 0; attempt < 8; attempt++) {
      const hostToken = newToken();
      const state = createRoom({ code: makeRoomCode(), hostTokenHash: hashToken(hostToken), now: Date.now(), familyId });
      if (await storeRoom(state)) {
        return NextResponse.json({ ok: true, code: state.code, hostToken }, { headers: noStore });
      }
    }
    return NextResponse.json({ ok: false, error: "Could not create a room. Try again." }, { status: 503, headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
