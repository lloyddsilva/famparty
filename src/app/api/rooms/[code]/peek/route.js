import { NextResponse } from "next/server";
import { loadRoom } from "../../../../../lib/roomStore.js";
import { cleanCode } from "../../../../../lib/validate.js";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  try {
    const room = await loadRoom(code);
    if (!room) return NextResponse.json({ ok: false, error: "Room not found or expired." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ ok: true, code, phase: room.phase, familyLinked: !!room.familyId, locked: room.locked || room.phase !== "lobby" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
