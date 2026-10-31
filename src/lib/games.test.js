import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, applyAction, advanceIfExpired, buildView, normalizeText } from "./engine.js";

const NOW = 2_000_000;
function room(game, n = 4) {
  let s = createRoom({ code: "TEST", hostTokenHash: "host", now: NOW, familyId: "fam1" });
  const avatars = ["🦊", "🐼", "🦄", "🐸", "🐙"];
  for (let i = 0; i < n; i++) s = addPlayer(s, { id: `p${i}`, tokenHash: `t${i}`, name: `P${i}`, avatar: avatars[i], memberId: `m${i}` }, NOW).state;
  s = applyAction(s, { type: "SELECT_GAME", game }, NOW).state;
  return s;
}
const act = (s, a, now = NOW) => applyAction(s, a, now).state;

test("spotlight: prep -> start anyway makes unfinished just-watch; lie vote scores both sides", () => {
  let s = room("spotlight");
  s = act(s, { type: "START" });
  assert.equal(s.phase, "prep");
  s = act(s, { type: "SUBMIT_STATEMENTS", playerId: "p0", statements: { texts: ["T1", "LIE", "T2"], lieIndex: 1, dontSave: [false, false, false] } });
  s = act(s, { type: "SUBMIT_STATEMENTS", playerId: "p1", statements: { texts: ["A", "B", "L"], lieIndex: 2, dontSave: [false, false, false] } });
  s = act(s, { type: "BEGIN_SPOTLIGHT" });
  assert.equal(s.phase, "spotlight");
  assert.equal(s.players.find((p) => p.id === "p2").watching, true);
  // featured p0; lie position depends on shuffle — find it via the reveal view logic
  const view = buildView(s, { viewer: { role: "host" } });
  const liePos = s.spotlightOrder.indexOf(1);
  s = act(s, { type: "VOTE", playerId: "p1", choice: liePos });
  s = act(s, { type: "VOTE", playerId: "p2", choice: (liePos + 1) % 3 });
  s = act(s, { type: "VOTE", playerId: "p3", choice: (liePos + 1) % 3 });
  assert.equal(s.phase, "spotlightReveal");
  assert.equal(s.players.find((p) => p.id === "p1").score, 300);
  assert.equal(s.players.find((p) => p.id === "p0").score, 300); // fooled 2 x 150
  s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "story");
  s = advanceIfExpired(s, NOW + 999999);
  assert.equal(s.phase, "storySave"); // no typing during the beat; save comes after
});

test("spotlight: display view masks hidden players", () => {
  let s = room("spotlight");
  s = act(s, { type: "HIDE", targetId: "p0", hidden: true });
  const view = buildView(s, { viewer: { role: "display" } });
  assert.equal(view.players.find((p) => p.id === "p0").name, "Hidden by host");
});

test("spectrum: placement + majority prediction scores", () => {
  let s = room("spectrum");
  s = act(s, { type: "START" });
  assert.equal(s.phase, "spectrum");
  for (const [id, pos] of [["p0", 80], ["p1", 90], ["p2", 70], ["p3", 10]]) {
    s = act(s, { type: "PLACE", playerId: id, pos, prediction: pos >= 50 ? "right" : "left" });
  }
  assert.equal(s.phase, "spectrumReveal");
  assert.equal(s.spectrumMajority, "right");
  assert.ok(s.players.find((p) => p.id === "p0").score >= 300);
});

test("finishit: no self-vote, exact-normalized duplicates split points", () => {
  assert.equal(normalizeText("  Pizza!! "), "pizza");
  let s = room("finishit");
  s = act(s, { type: "START" });
  assert.equal(s.phase, "finishWrite");
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p0", text: "Pizza!" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p1", text: "pizza" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p2", text: "Salad" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p3", text: "Soup" });
  assert.equal(s.phase, "finishVote");
  assert.equal(applyAction(s, { type: "VOTE", playerId: "p0", choice: "p0" }, NOW).error, "Invalid vote.");
  s = act(s, { type: "VOTE", playerId: "p2", choice: "p0" });
  s = act(s, { type: "VOTE", playerId: "p3", choice: "p0" });
  s = act(s, { type: "VOTE", playerId: "p0", choice: "p2" });
  s = act(s, { type: "VOTE", playerId: "p1", choice: "p2" });
  assert.equal(s.phase, "finishReveal");
  // p0+p1 wrote the same normalized text: 2 votes * 100 split between them
  assert.equal(s.players.find((p) => p.id === "p0").score, 100);
  assert.equal(s.players.find((p) => p.id === "p1").score, 100);
  assert.equal(s.players.find((p) => p.id === "p2").score, 200);
});

test("remember: writer cannot score on their own statement", () => {
  let s = room("remember");
  const items = [{ id: "st1", text: "I once met a penguin", writerMemberId: "m0", writerName: "P0" }];
  s = act(s, { type: "START", items });
  assert.equal(s.phase, "remember");
  s = act(s, { type: "VOTE", playerId: "p1", choice: "m0" });
  s = act(s, { type: "VOTE", playerId: "p2", choice: "m1" });
  s = act(s, { type: "VOTE", playerId: "p3", choice: "m0" });
  // p0 is the writer and does not guess; all guessers are in -> reveal
  assert.equal(s.phase, "rememberReveal");
  assert.equal(s.players.find((p) => p.id === "p1").score, 250);
  assert.equal(s.players.find((p) => p.id === "p0").score, 0);
});
