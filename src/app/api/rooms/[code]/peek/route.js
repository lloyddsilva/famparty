import { NextResponse } from "next/server";
import { loadRoom, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode } from "../../../../../lib/validate.js";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  try {
    const room = await loadRoom(code);
    if (!room) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
      try { if (!(await rateLimit(`lookup:${ip}`, 90, 60))) return NextResponse.json({ ok: false, error: "Too many room lookups. Wait a minute." }, { status: 429, headers: { "Cache-Control": "no-store" } }); } catch {}
      return NextResponse.json({ ok: false, error: "Room not found or expired." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ ok: true, code, phase: room.phase, familyLinked: !!room.familyId, locked: room.locked || room.phase !== "lobby" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
