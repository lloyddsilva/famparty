import { NextResponse } from "next/server";
import { applyAction, applyHostAction, advanceIfExpired, assertExpectedPhase, scoreEmojiReveal, roundKeyFor } from "../../../../../lib/engine.js";
import { casUpdate, loadRoom, loadAnswers, recordAnswer, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode, hashToken, isChoice, isCleanText, parseJsonBody } from "../../../../../lib/validate.js";
import { QUESTIONS } from "../../../../../lib/questions.js";
import { trueStatementsForGame } from "../../../../../lib/db.js";
import { scheduleFamilyWrites } from "../../../../../lib/familyWrites.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

const HOST_ACTIONS = new Set(["START", "NEXT", "PLAY_AGAIN", "LOCK", "PAUSE", "RESUME", "KICK", "SELECT_GAME", "BEGIN_SPOTLIGHT", "HIDE"]);
const PLAYER_ACTIONS = new Set(["SUBMIT_STATEMENTS", "SET_WATCH", "VOTE", "PLACE", "FINISH_SUBMIT", "STORY_SAVE"]);
const cleanText = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);


export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const body = await parseJsonBody(req);
  if (!body || typeof body.type !== "string") return bad("Invalid action.");
  try {
    const state0 = await loadRoom(code);
    if (!state0) return bad("Room not found or expired.", 404);
    const tokenHash = body.token ? hashToken(body.token) : null;
    const now = Date.now();

    if (body.type === "ANSWER") {
      const me = state0.players.find((p) => p.tokenHash === tokenHash);
      if (!me) return bad("Unknown player.", 403);
      if (!(await rateLimit(`act:${me.id}`, 120, 60))) return bad("Too many actions.", 429);
      if (state0.phase !== "question" || state0.paused) return bad("Not accepting answers right now.");
      if (state0.deadline && now > state0.deadline) return bad("Time is up for this round.");
      if (!isChoice(body.choice, QUESTIONS[state0.qIndex].choices.length)) return bad("Invalid choice.");
      // Store the answer (with its time) and stop there. Scores are computed once,
      // from the answers hash, when the round moves to reveal — so a simultaneous
      // answer or one landing at expiry can never lose its points (items 1-2).
      const round = roundKeyFor(state0);
      const added = await recordAnswer(code, round, me.id, body.choice, now);
      if (!added) return NextResponse.json({ ok: true, alreadyAnswered: true }, { headers: noStore });
      const answers = await loadAnswers(code, round);
      if (Object.keys(answers).length < state0.players.length) {
        return NextResponse.json({ ok: true, version: state0.version }, { headers: noStore });
      }
      // Everyone is in: move to reveal through the CAS, scoring from the hash.
      const out = await casUpdate(code, (s) => ({ state: scoreEmojiReveal(s, answers, Date.now()) }));
      return NextResponse.json({ ok: !out.error, error: out.error, version: out.state?.version }, { headers: noStore });
    }

    let action;
    if (HOST_ACTIONS.has(body.type)) {
      if (!tokenHash || tokenHash !== state0.hostTokenHash) return bad("Host token required.", 403);
      if (!(await rateLimit(`host:${code}`, 120, 60))) return bad("Too many host actions.", 429);
      // Stale-screen guard (item 4): a host tap made against an old phase must not
      // advance the room twice. The client sends the phase it was looking at.
      const phaseError = ["HIDE", "KICK"].includes(body.type) ? null : assertExpectedPhase(state0, body.expectedPhase);
      if (phaseError) return bad(phaseError, 409);
      action = { type: body.type };
      if (body.type === "LOCK") action.locked = !!body.locked;
      if (body.type === "SELECT_GAME") action.game = String(body.game || "");
      if (body.type === "KICK") {
        if (!state0.players.some((p) => p.id === body.playerId)) return bad("Player not found.");
        action.playerId = body.playerId;
      }
      if (body.type === "HIDE") {
        if (!state0.players.some((p) => p.id === body.targetId)) return bad("Player not found.");
        action.targetId = body.targetId; action.hidden = !!body.hidden;
      }
      if (body.type === "START" && state0.game === "remember") {
        if (!state0.familyId) return bad("Remember This? needs a family-linked room with saved statements.");
        // Only statements whose writer is in this room (item 7): otherwise there is no right answer.
        const memberIds = new Set(state0.players.map((p) => p.memberId).filter(Boolean));
        const pool = (await trueStatementsForGame(state0.familyId))
          .filter((i) => memberIds.has(i.writerMemberId))
          .filter((i) => i.roomCode !== state0.code); // never tonight's own statements
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        action.items = pool.slice(0, 10);
        if (!action.items.length) return bad("No saved true statements from players in this room yet. Play Spotlight with this group first.");
      }
    } else if (PLAYER_ACTIONS.has(body.type)) {
      const me = state0.players.find((p) => p.tokenHash === tokenHash);
      if (!me) return bad("Unknown player.", 403);
      if (!(await rateLimit(`act:${me.id}`, 120, 60))) return bad("Too many actions.", 429);
      action = { type: body.type, playerId: me.id };
      if (body.type === "SUBMIT_STATEMENTS") {
        const texts = Array.isArray(body.texts) ? body.texts.map((t) => cleanText(t, 120)) : [];
        if (texts.length !== 3 || texts.some((t) => !t)) return bad("Write all three statements (max 120 characters each).");
        if (!texts.every(isCleanText)) return bad("Our filter tripped on that one. Mind wording it differently?");
        if (![0, 1, 2].includes(body.lieIndex)) return bad("Mark which statement is the lie.");
        action.statements = { texts, lieIndex: body.lieIndex, dontSave: Array.isArray(body.dontSave) ? body.dontSave.slice(0, 3).map(Boolean) : [false, false, false] };
      }
      if (body.type === "VOTE") action.choice = body.choice;
      if (body.type === "PLACE") { action.pos = body.pos; action.prediction = body.prediction; }
      if (body.type === "FINISH_SUBMIT") {
        action.text = cleanText(body.text, 80);
        if (!action.text) return bad("Write something first.");
        if (!isCleanText(action.text)) return bad("Our filter tripped on that one. Mind wording it differently?");
      }
      if (body.type === "STORY_SAVE") {
        action.text = cleanText(body.text, 140);
        if (action.text && !isCleanText(action.text)) return bad("Our filter tripped on that one. Mind wording it differently?");
      }
    } else {
      return bad("Unknown action.");
    }

    const before = state0;
    const roundAnswers = state0.game === "emoji" ? await loadAnswers(code, roundKeyFor(state0)) : {};
    const isHostAction = HOST_ACTIONS.has(body.type);
    const out = await casUpdate(code, (s) => {
      const now = Date.now();
      if (isHostAction) {
        // Expected phase/step are re-checked against the state actually being
        // mutated, inside the CAS — not only against the earlier read (item 5).
        return applyHostAction(s, action, now, { answers: roundAnswers }, { phase: body.expectedPhase, finishStep: body.expectedStep });
      }
      return applyAction(advanceIfExpired(s, now, { answers: roundAnswers }), action, now, { answers: roundAnswers });
    });
    if (out.error) return bad(out.error);
    scheduleFamilyWrites(before, out.state);
    return NextResponse.json({ ok: true, version: out.state.version }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
