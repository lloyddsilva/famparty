import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, applyAction, advanceIfExpired, buildView, MIN_PLAYERS } from "./engine.js";

const NOW = 1_000_000;
function roomWithPlayers(n = 3) {
  let s = createRoom({ code: "TEST", hostTokenHash: "host", now: NOW });
  for (let i = 0; i < n; i++) {
    const out = addPlayer(s, { id: `p${i}`, tokenHash: `t${i}`, name: `P${i}`, avatar: ["🦊", "🐼", "🦄", "🐸"][i] }, NOW);
    s = out.state;
  }
  return s;
}

test("start requires minimum players", () => {
  const s = roomWithPlayers(2);
  assert.equal(applyAction(s, { type: "START" }, NOW).error, `Need at least ${MIN_PLAYERS} players.`);
});

test("timer expiry advances question -> reveal via advanceIfExpired", () => {
  let s = applyAction(roomWithPlayers(3), { type: "START" }, NOW).state;
  assert.equal(s.phase, "question");
  s = advanceIfExpired(s, NOW + 999999);
  assert.equal(s.phase, "reveal");
  const view = buildView(s, {});
  assert.equal(view.question.answer, "Pizza Party"); // answer only leaks at reveal
});

test("answer is hidden from the view during question phase", () => {
  const s = applyAction(roomWithPlayers(3), { type: "START" }, NOW).state;
  const view = buildView(s, {});
  assert.equal(view.question.answer, undefined);
});

test("allAnswered reveals immediately and books score", () => {
  let s = applyAction(roomWithPlayers(3), { type: "START" }, NOW).state;
  const out = applyAction(s, { type: "ANSWER_RECORDED", playerId: "p0", choice: 0 }, NOW + 1000, { allAnswered: true });
  assert.equal(out.state.phase, "reveal");
  assert.equal(out.state.players.find((p) => p.id === "p0").score > 0, true);
});

test("host NEXT reveals immediately regardless of deadline", () => {
  const s = applyAction(roomWithPlayers(3), { type: "START" }, NOW).state;
  const out = applyAction(s, { type: "NEXT" }, NOW + 1000);
  assert.equal(out.state.phase, "reveal");
  assert.equal(out.state.deadline, null);
});

test("pause/resume preserves remaining time", () => {
  let s = applyAction(roomWithPlayers(3), { type: "START" }, NOW).state;
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
