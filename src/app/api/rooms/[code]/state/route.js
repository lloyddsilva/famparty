import { NextResponse } from "next/server";
import { advanceIfExpired, buildView } from "../../../../../lib/engine.js";
import { casUpdate, loadRoom, loadAnswers, loadPresence, touchPresence } from "../../../../../lib/roomStore.js";
import { cleanCode, hashToken } from "../../../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const url = new URL(req.url);
  const since = Number(url.searchParams.get("v") ?? -1);
  const token = url.searchParams.get("token") || "";
  const role = url.searchParams.get("role") || "display";
  try {
    let state = await loadRoom(code);
    if (!state) return NextResponse.json({ ok: false, error: "Room not found or expired." }, { status: 404, headers: noStore });

    // Timer expiry advances through the same CAS as every other action — only one poll wins.
    if (state.phase === "question" && state.deadline && Date.now() >= state.deadline) {
      const out = await casUpdate(code, (s) => ({ state: advanceIfExpired(s, Date.now()) }));
      if (out.state) state = out.state;
    }

    const tokenHash = token ? hashToken(token) : null;
    const me = role === "player" && tokenHash ? state.players.find((p) => p.tokenHash === tokenHash) : null;
    if (me) await touchPresence(code, me.id);

    if (since === state.version) {
      return NextResponse.json({ ok: true, unchanged: true, version: state.version, serverNow: Date.now() }, { headers: noStore });
    }
    const [answers, presence] = await Promise.all([loadAnswers(code, state.qIndex), loadPresence(code)]);
    const view = buildView(state, { answers, presence, viewer: { playerId: me?.id } });
    return NextResponse.json({ ok: true, unchanged: false, serverNow: Date.now(), view }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
