import { NextResponse } from "next/server";
import { applyAction, advanceIfExpired } from "../../../../../lib/engine.js";
import { casUpdate, loadRoom, loadAnswers, recordAnswer, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode, hashToken, isChoice, parseJsonBody } from "../../../../../lib/validate.js";
import { QUESTIONS } from "../../../../../lib/questions.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

const HOST_ACTIONS = new Set(["START", "NEXT", "PLAY_AGAIN", "LOCK", "PAUSE", "RESUME", "KICK"]);

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const body = await parseJsonBody(req);
  if (!body || typeof body.type !== "string") return bad("Invalid action.");
  try {
    const state0 = await loadRoom(code);
    if (!state0) return bad("Room not found or expired.", 404);
    const tokenHash = body.token ? hashToken(body.token) : null;

    if (body.type === "ANSWER") {
      const me = state0.players.find((p) => p.tokenHash === tokenHash);
      if (!me) return bad("Unknown player.", 403);
      if (!(await rateLimit(`act:${me.id}`, 90, 60))) return bad("Too many actions.", 429);
      if (state0.phase !== "question" || state0.paused) return bad("Not accepting answers right now.");
      if (!isChoice(body.choice, QUESTIONS[state0.qIndex].choices.length)) return bad("Invalid choice.");
      const added = await recordAnswer(code, state0.qIndex, me.id, body.choice);
      if (!added) return NextResponse.json({ ok: true, alreadyAnswered: true }, { headers: noStore });
      const answers = await loadAnswers(code, state0.qIndex);
      const connectedCount = state0.players.length;
      const allAnswered = Object.keys(answers).length >= connectedCount;
      const out = await casUpdate(code, (s) => {
        const fresh = advanceIfExpired(s, Date.now());
        return applyAction(fresh, { type: "ANSWER_RECORDED", playerId: me.id, choice: body.choice }, Date.now(), { allAnswered });
      });
      return NextResponse.json({ ok: !out.error, error: out.error, version: out.state?.version }, { headers: noStore });
    }

    if (!HOST_ACTIONS.has(body.type)) return bad("Unknown action.");
    if (!tokenHash || tokenHash !== state0.hostTokenHash) return bad("Host token required.", 403);
    const action = { type: body.type };
    if (body.type === "LOCK") action.locked = !!body.locked;
    if (body.type === "KICK") {
      if (!state0.players.some((p) => p.id === body.playerId)) return bad("Player not found.");
      action.playerId = body.playerId;
    }
    const out = await casUpdate(code, (s) => applyAction(advanceIfExpired(s, Date.now()), action, Date.now()));
    if (out.error) return bad(out.error);
    return NextResponse.json({ ok: true, version: out.state.version }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
