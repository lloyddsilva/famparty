import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, applyAction, advanceIfExpired, buildView, MIN_PLAYERS, scoreEmojiReveal, assertExpectedPhase, QUESTION_MS } from "./engine.js";
const QUESTION_MS_FOR_TEST = QUESTION_MS;

const NOW = 1_000_000;
function started(s, now = NOW) {
  const out = applyAction(s, { type: "START" }, now);
  return applyAction(out.state, { type: "NEXT" }, now).state;
}
function roomWithPlayers(n = 3) {
  let s = createRoom({ code: "TEST", hostTokenHash: "host", now: NOW });
  for (let i = 0; i < n; i++) {
    const out = addPlayer(s, { id: `p${i}`, tokenHash: `t${i}`, name: `P${i}`, avatar: ["🦊", "🐼", "🦄", "🐸"][i] }, NOW);
    s = out.state;
  }
  return s;
}

test("start requires the per-game minimum (emoji works with 2)", () => {
  assert.equal(applyAction(roomWithPlayers(1), { type: "START" }, NOW).error, "Need at least 2 players for this game.");
  assert.ok(!applyAction(roomWithPlayers(2), { type: "START" }, NOW).error);
});

test("timer expiry advances question -> reveal via advanceIfExpired", () => {
  let s = started(roomWithPlayers(3));
  assert.equal(s.phase, "question");
  s = advanceIfExpired(s, NOW + 999999);
  assert.equal(s.phase, "reveal");
  const view = buildView(s, {});
  assert.equal(view.question.answer, "Pizza Party"); // answer only leaks at reveal
});

test("answer is hidden from the view during question phase", () => {
  const s = started(roomWithPlayers(3));
  const view = buildView(s, {});
  assert.equal(view.question.answer, undefined);
});

test("regression 1-2: simultaneous answers are all scored at reveal, in any order", () => {
  let s = started(roomWithPlayers(3));
  // p1 and p2 answer "together"; the reveal is triggered by whichever lands —
  // both must score. Answer entries carry their own timestamps.
  const answers = {
    p0: { choice: 0, at: NOW + 1000 }, // correct, fast
    p1: { choice: 0, at: NOW + 19000 }, // correct, at the wire (expiry race)
    p2: { choice: 1, at: NOW + 1000 }, // wrong
  };
  s = scoreEmojiReveal(s, answers, NOW + 20000);
  assert.equal(s.phase, "reveal");
  assert.ok(s.players.find((p) => p.id === "p0").score > s.players.find((p) => p.id === "p1").score);
  assert.ok(s.players.find((p) => p.id === "p1").score > 0, "last-second correct answer still scores");
  assert.equal(s.players.find((p) => p.id === "p2").score, 0);
});

test("late answer at/after the deadline scores nothing", () => {
  let s = started(roomWithPlayers(3));
  const answers = { p0: { choice: 0, at: NOW + QUESTION_MS_FOR_TEST }, p1: { choice: 0, at: NOW + 100 } };
  s = scoreEmojiReveal(s, answers, NOW + QUESTION_MS_FOR_TEST);
  assert.equal(s.players.find((p) => p.id === "p0").score, 0);
  assert.ok(s.players.find((p) => p.id === "p1").score > 0);
});

test("regression 4: expected-phase guard rejects stale host taps", () => {
  const s = started(roomWithPlayers(3));
  assert.equal(assertExpectedPhase(s, "question"), null);
  assert.match(assertExpectedPhase(s, "reveal"), /Stale screen/);
});

test("regression 5: every question gets a fresh roundId", () => {
  let s = started(roomWithPlayers(3));
  const first = s.roundId;
  s = applyAction(s, { type: "NEXT" }, NOW).state; // reveal
  s = applyAction(s, { type: "NEXT" }, NOW).state; // scores
  s = applyAction(s, { type: "NEXT" }, NOW + 1).state; // question 2
  assert.notEqual(s.roundId, first);
});

test("host NEXT reveals immediately regardless of deadline", () => {
  const s = started(roomWithPlayers(3));
  const out = applyAction(s, { type: "NEXT" }, NOW + 1000);
  assert.equal(out.state.phase, "reveal");
  assert.equal(out.state.deadline, null);
});

test("pause/resume preserves remaining time", () => {
  let s = started(roomWithPlayers(3));
  s = applyAction(s, { type: "PAUSE" }, NOW + 5000).state;
  assert.equal(s.paused, true);
  s = applyAction(s, { type: "RESUME" }, NOW + 60000).state;
  assert.equal(s.deadline, NOW + 60000 + 15000);
});

test("rejoin by token does not duplicate a player", () => {
  const s = roomWithPlayers(1);
  const out = addPlayer(s, { id: "other", tokenHash: "t0", name: "X", avatar: "🐙" }, NOW);
  assert.equal(out.rejoined, true);
  assert.equal(out.state.players.length, 1);
});
