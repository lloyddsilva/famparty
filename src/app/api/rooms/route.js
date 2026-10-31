import { NextResponse } from "next/server";
import { createRoom } from "../../../lib/engine.js";
import { createRoom as storeRoom } from "../../../lib/roomStore.js";
import { makeRoomCode, newToken, hashToken } from "../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST() {
  try {
    for (let attempt = 0; attempt < 8; attempt++) {
      const hostToken = newToken();
      const state = createRoom({ code: makeRoomCode(), hostTokenHash: hashToken(hostToken), now: Date.now() });
      if (await storeRoom(state)) {
        return NextResponse.json({ ok: true, code: state.code, hostToken }, { headers: noStore });
      }
    }
    return NextResponse.json({ ok: false, error: "Could not create a room. Try again." }, { status: 503, headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
