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
  const kinds = Object.fromEntries((s.spectrumAwards || []).map((a) => [a.kind, a.playerId]));
  assert.equal(kinds["Mind Reader"], "p0"); // predicted right, closest to the median (80)
  assert.equal(kinds["Lonely Island"], "p3"); // 10, furthest from the crowd
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
  assert.equal(s.phase, "finishPresent");
  // host deals the answers out on TV one by one, then opens voting
  let pv = buildView(s, { viewer: { role: "display" } });
  assert.equal(pv.finishit.candidates.length, 0);
  s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" });
  pv = buildView(s, { viewer: { role: "display" } });
  assert.equal(pv.finishit.candidates.length, 4);
  s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "finishVote");
  const candOf = (state, writerId) => {
    const v = buildView(state, { viewer: { role: "host" } });
    return v.finishit.candidates.find((c) => {
      const idx = state.finishOrder.indexOf(writerId);
      return c.id === state.finishCandidateIds[idx];
    }).id;
  };
  // a raw player id is no longer accepted as a vote target
  assert.equal(applyAction(s, { type: "VOTE", playerId: "p0", choice: "p0" }, NOW).error, "Invalid vote.");
  s = act(s, { type: "VOTE", playerId: "p2", choice: candOf(s, "p0") });
  s = act(s, { type: "VOTE", playerId: "p3", choice: candOf(s, "p0") });
  s = act(s, { type: "VOTE", playerId: "p0", choice: candOf(s, "p2") });
  s = act(s, { type: "VOTE", playerId: "p1", choice: candOf(s, "p2") });
  assert.equal(s.phase, "finishReveal");
  // p0+p1 wrote the same normalized text: 2 votes * 100 split between them
  assert.equal(s.players.find((p) => p.id === "p0").score, 100);
  assert.equal(s.players.find((p) => p.id === "p1").score, 100);
  assert.equal(s.players.find((p) => p.id === "p2").score, 200);
  // After voting closes the reveal is authored immediately — no dead taps.
  const view = buildView(s, { viewer: { role: "display" } });
  assert.equal(view.finishit.authorsRevealed, true);
  assert.equal(view.finishit.candidates.length, 4);
  assert.ok(view.finishit.candidates[0].authorId);
  s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "scores");
});

test("finishit: host-hidden answers stay hidden on the TV at vote and reveal", () => {
  let s = room("finishit");
  s = act(s, { type: "START" });
  s = act(s, { type: "HIDE", targetId: "p0", hidden: true });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p0", text: "something rude" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p1", text: "clean one" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p2", text: "clean two" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p3", text: "clean three" });
  assert.equal(s.phase, "finishPresent");
  s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" });
  s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "finishVote");
  const view = buildView(s, { viewer: { role: "display" } });
  const hiddenEntry = view.finishit.candidates[s.finishOrder.indexOf("p0")];
  assert.equal(hiddenEntry.text, "Hidden by host");
  const hostView = buildView(s, { viewer: { role: "host" } });
  assert.equal(hostView.finishit.candidates[s.finishOrder.indexOf("p0")].text, "something rude");
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

test("kick: kicking the featured Spotlight player skips their turn instead of hanging", () => {
  let s = room("spotlight");
  s = act(s, { type: "START" });
  for (const id of ["p0", "p1", "p2"]) {
    s = act(s, { type: "SUBMIT_STATEMENTS", playerId: id, statements: { texts: ["t", "l", "t2"], lieIndex: 1, dontSave: [false, false, false] } });
  }
  s = act(s, { type: "BEGIN_SPOTLIGHT" });
  const featuredId = s.featuredOrder[s.featuredIdx];
  s = act(s, { type: "KICK", playerId: featuredId });
  assert.notEqual(s.phase, "finale");
  assert.equal(s.phase, "spotlight");
  assert.ok(!s.featuredOrder.includes(featuredId));
  assert.ok(s.featuredOrder.length >= 1);
});

test("host guard inside applyHostAction rejects a stale finish step", async () => {
  const { applyHostAction } = await import("./engine.js");
  let s = room("finishit");
  s = act(s, { type: "START" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p0", text: "a" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p1", text: "b" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p2", text: "c" });
  s = act(s, { type: "FINISH_SUBMIT", playerId: "p3", text: "d" });
  assert.equal(s.phase, "finishPresent");
  const stale = applyHostAction(s, { type: "NEXT" }, NOW, {}, { phase: "finishPresent", finishStep: 3 });
  assert.match(stale.error, /Stale screen/);
  const fresh = applyHostAction(s, { type: "NEXT" }, NOW, {}, { phase: "finishPresent", finishStep: 0 });
  assert.equal(fresh.state.finishRevealStep, 1);
});

test("shuffle produces a near-uniform permutation distribution", async () => {
  const { createRoom: cr } = await import("./engine.js");
  // indirectly exercise the PRNG through spotlight statement order over many seeds
  const counts = new Map();
  for (let seed = 1; seed <= 600; seed++) {
    let s = room("spotlight");
    s = act(s, { type: "START" }, seed * 1000);
    s = act(s, { type: "SUBMIT_STATEMENTS", playerId: "p0", statements: { texts: ["a", "b", "c"], lieIndex: 0, dontSave: [false, false, false] } }, seed * 1000);
    s = applyAction(s, { type: "BEGIN_SPOTLIGHT" }, seed * 1000).state;
    const key = s.spotlightOrder.join(",");
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  assert.equal(counts.size, 6, `expected all 6 permutations, saw ${counts.size}`);
  for (const [k, v] of counts) assert.ok(v > 50 && v < 160, `permutation ${k} biased: ${v}/600`);
});

test("finishit: no player id appears in candidates before the reveal; mine flag is viewer-only", () => {
  let s = room("finishit");
  s = act(s, { type: "START" });
  for (const id of ["p0", "p1", "p2", "p3"]) s = act(s, { type: "FINISH_SUBMIT", playerId: id, text: `answer ${id}` });
  assert.equal(s.phase, "finishPresent");
  for (const role of ["display", "host"]) {
    const view = buildView(s, { viewer: { role } });
    for (const c of view.finishit.candidates) {
      assert.ok(!["p0", "p1", "p2", "p3"].includes(c.id), `candidate id ${c.id} leaks a player id (${role})`);
      assert.equal(c.authorId, undefined);
    }
  }
  // step through presentation, then check the vote phase as a player
  s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" });
  s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "finishVote");
  const mine = buildView(s, { viewer: { role: "player", playerId: "p0" } });
  const own = mine.finishit.candidates.find((c) => c.mine);
  assert.ok(own, "own answer is flagged mine for the voter");
  assert.ok(!["p0", "p1", "p2", "p3"].includes(own.id));
  const others = buildView(s, { viewer: { role: "player", playerId: "p1" } });
  assert.notEqual(others.finishit.candidates.find((c) => c.mine)?.id, own.id);
});

test("finishit: after voting, myVote and finishit fields contain no player ids before reveal", () => {
  let s = room("finishit");
  s = act(s, { type: "START" });
  for (const id of ["p0", "p1", "p2", "p3"]) s = act(s, { type: "FINISH_SUBMIT", playerId: id, text: `answer ${id}` });
  for (let i = 0; i < 5; i++) s = act(s, { type: "NEXT" });
  assert.equal(s.phase, "finishVote");
  const cand = (state, writer) => state.finishCandidateIds[state.finishOrder.indexOf(writer)];
  s = act(s, { type: "VOTE", playerId: "p0", choice: cand(s, "p1") });
  const view = buildView(s, { viewer: { role: "player", playerId: "p0" } });
  const surface = JSON.stringify(view.finishit) + JSON.stringify(view.myVote);
  for (const pid of ["p0", "p1", "p2", "p3"]) {
    assert.ok(!surface.includes(`"${pid}"`), `player id ${pid} leaked into finishit/myVote`);
  }
  assert.ok(String(view.myVote).startsWith("cand-"), `myVote is a candidate id, got ${view.myVote}`);
});
