import { NextResponse } from "next/server";
import { advanceIfExpired, buildView, roundKeyFor } from "../../../../../lib/engine.js";
import { casUpdate, loadRoom, loadAnswers, loadPresence, touchPresence, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode, hashToken , clientIp } from "../../../../../lib/validate.js";
import { scheduleFamilyWrites } from "../../../../../lib/familyWrites.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const url = new URL(req.url);
  const since = Number(url.searchParams.get("v") ?? -1);
  const token = req.headers.get("x-room-token") || "";
  const role = url.searchParams.get("role") || "display";
  try {
    let state = await loadRoom(code);
    if (!state) {
      // Failed lookups are rate-limited per IP so code guessing is throttled,
      // without touching normal polling of real rooms (item 9).
      const ip = clientIp(req);
      try { if (!(await rateLimit(`lookup:${ip}`, 90, 60))) return NextResponse.json({ ok: false, error: "Too many room lookups. Wait a minute." }, { status: 429, headers: noStore }); } catch {}
      return NextResponse.json({ ok: false, error: "Room not found or expired." }, { status: 404, headers: noStore });
    }

    // Timer expiry advances through the same CAS as every other action — only one poll wins.
    // Emoji expiry scores from the answers hash, so last-second answers still count.
    let preAnswers = {};
    if (state.deadline && Date.now() >= state.deadline) {
      if (state.game === "emoji" && state.phase === "question") preAnswers = await loadAnswers(code, roundKeyFor(state));
      const beforeExpiry = state;
      const out = await casUpdate(code, (s) => ({ state: advanceIfExpired(s, Date.now(), { answers: preAnswers }) }));
      if (out.state) {
        if (out.changed) scheduleFamilyWrites(beforeExpiry, out.state);
        state = out.state;
      }
    }

    // Player token arrives in a header, never the query string (item 8).
    const tokenHash = token ? hashToken(token) : null;
    const me = role === "player" && tokenHash ? state.players.find((p) => p.tokenHash === tokenHash) : null;
    // Presence writes are client-throttled (x-presence: 1 at most every few seconds).
    if (me && req.headers.get("x-presence") === "1") await touchPresence(code, me.id);

    const answersDigestOf = (a) => Object.keys(a).sort().join(",");
    if (since === state.version) {
      // Answers live outside the versioned room JSON. If only the answers hash
      // changed, the version check alone would hide it — so compare digests and
      // fall through to a full view when they differ (item 1).
      const curAnswers = state.game === "emoji" ? await loadAnswers(code, roundKeyFor(state)) : {};
      if (answersDigestOf(curAnswers) === (url.searchParams.get("ad") ?? "")) {
        const presence = await loadPresence(code);
        return NextResponse.json({ ok: true, unchanged: true, version: state.version, serverNow: Date.now(), presence }, { headers: noStore });
      }
    }
    const [answers, presence] = await Promise.all([loadAnswers(code, roundKeyFor(state)), loadPresence(code)]);
    const view = buildView(state, { answers, presence, viewer: { playerId: me?.id, role } });
    view.answersDigest = answersDigestOf(answers);
    return NextResponse.json({ ok: true, unchanged: false, serverNow: Date.now(), view }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
