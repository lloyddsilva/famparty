import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, applyAction, buildView } from "./engine.js";

const NOW = 3_000_000;
function base(game) {
  let s = createRoom({ code: "KICK", hostTokenHash: "host", now: NOW, familyId: "fam" });
  const avatars = ["🦊", "🐼", "🦄", "🐸"];
  for (let i = 0; i < 4; i++) s = addPlayer(s, { id: `p${i}`, tokenHash: `t${i}`, name: `P${i}`, avatar: avatars[i], memberId: `m${i}` }, NOW).state;
  s = applyAction(s, { type: "SELECT_GAME", game }, NOW).state;
  return s;
}
const act = (s, a, now = NOW) => {
  let out = applyAction(s, a, now);
  assert.ok(!out.error, `action ${a.type} should not error: ${out.error}`);
  if (a.type === "START" && out.state.phase === "howto") {
    out = applyAction(out.state, { type: "NEXT" }, now);
    assert.ok(!out.error, `begin after START should not error: ${out.error}`);
  }
  return out.state;
};
function viewsOk(s) {
  for (const role of ["display", "host"]) {
    const v = buildView(s, { viewer: { role } });
    assert.ok(v && Array.isArray(v.players));
  }
  const v = buildView(s, { viewer: { role: "player", playerId: "p1" } });
  assert.ok(v);
}

// Each scenario drives a game to a phase, kicks someone (often the author /
// featured player), renders every view, and takes the next host step.
const scenarios = {
  "emoji question": () => {
    let s = act(base("emoji"), { type: "START" });
    s = act(s, { type: "KICK", playerId: "p0" });
    viewsOk(s);
    return act(s, { type: "NEXT" });
  },
  "spotlight prep": () => {
    let s = act(base("spotlight"), { type: "START" });
    s = act(s, { type: "KICK", playerId: "p0" });
    viewsOk(s);
    return s;
  },
  "spotlight featured": () => {
    let s = act(base("spotlight"), { type: "START" });
    for (const id of ["p0", "p1", "p2"]) s = act(s, { type: "SUBMIT_STATEMENTS", playerId: id, statements: { texts: ["t", "l", "u"], lieIndex: 1, dontSave: [false, false, false] } });
    s = act(s, { type: "BEGIN_SPOTLIGHT" });
    s = act(s, { type: "KICK", playerId: s.featuredOrder[s.featuredIdx] });
    viewsOk(s);
    return s;
  },
  "spotlight voter": () => {
    let s = act(base("spotlight"), { type: "START" });
    for (const id of ["p0", "p1", "p2"]) s = act(s, { type: "SUBMIT_STATEMENTS", playerId: id, statements: { texts: ["t", "l", "u"], lieIndex: 1, dontSave: [false, false, false] } });
    s = act(s, { type: "BEGIN_SPOTLIGHT" });
    const voter = s.players.find((p) => p.id !== s.featuredOrder[s.featuredIdx]).id;
    s = act(s, { type: "KICK", playerId: voter });
    viewsOk(s);
    return s;
  },
  "spectrum placed": () => {
    let s = act(base("spectrum"), { type: "START" });
    s = act(s, { type: "PLACE", playerId: "p0", pos: 80, prediction: "right" });
    s = act(s, { type: "KICK", playerId: "p0" });
    viewsOk(s);
    return s;
  },
  "finishit author in present (the production crash)": () => {
    let s = act(base("finishit"), { type: "START" });
    for (const id of ["p0", "p1", "p2", "p3"]) s = act(s, { type: "FINISH_SUBMIT", playerId: id, text: `answer ${id}` });
    assert.equal(s.phase, "finishPresent");
    s = act(s, { type: "KICK", playerId: "p0" }); // an author, mid-presentation
    viewsOk(s); // buildView must not throw on the removed author
    s = act(s, { type: "NEXT" }); // host step must not throw either
    viewsOk(s);
    assert.ok(!s.finishOrder.includes("p0"));
    return s;
  },
  "finishit author in vote": () => {
    let s = act(base("finishit"), { type: "START" });
    for (const id of ["p0", "p1", "p2", "p3"]) s = act(s, { type: "FINISH_SUBMIT", playerId: id, text: `answer ${id}` });
    for (let i = 0; i < 5; i++) s = act(s, { type: "NEXT" });
    assert.equal(s.phase, "finishVote");
    const candP0 = s.finishCandidateIds[s.finishOrder.indexOf("p0")];
    s = act(s, { type: "VOTE", playerId: "p1", choice: candP0 });
    s = act(s, { type: "KICK", playerId: "p0" });
    viewsOk(s);
    assert.equal(s.votes.p1, undefined); // votes for the removed author are gone
    return s;
  },
  "remember writer": () => {
    let s = base("remember");
    s = applyAction(s, { type: "START", items: [{ id: "x", text: "true thing", writerMemberId: "m0", writerName: "P0" }] }, NOW).state;
    s = act(s, { type: "KICK", playerId: "p0" });
    viewsOk(s);
    return s;
  },
  "lobby": () => {
    let s = base("emoji");
    s = act(s, { type: "KICK", playerId: "p3" });
    viewsOk(s);
    return s;
  },
};

for (const [name, run] of Object.entries(scenarios)) {
  test(`kick does not break the room: ${name}`, () => {
    const s = run();
    assert.ok(s && typeof s.phase === "string");
  });
}

test("moderation is exempt from the phase guard", async () => {
  const { applyHostAction } = await import("./engine.js");
  let s = act(base("emoji"), { type: "START" });
  // Host screen is stale (thinks we're still in the lobby); hide/kick must land anyway.
  const hidden = applyHostAction(s, { type: "HIDE", targetId: "p0", hidden: true }, NOW, {}, { phase: "lobby" });
  assert.ok(!hidden.error, hidden.error);
  assert.equal(hidden.state.players.find((p) => p.id === "p0").hidden, true);
  const kicked = applyHostAction(s, { type: "KICK", playerId: "p1" }, NOW, {}, { phase: "lobby" });
  assert.ok(!kicked.error, kicked.error);
  // …while ordinary host actions are still guarded.
  const stale = applyHostAction(s, { type: "NEXT" }, NOW, {}, { phase: "lobby" });
  assert.match(stale.error, /Stale screen/);
});

test("kick in finishPresent: removing an already-shown author steps the presentation back", () => {
  let s = act(base("finishit"), { type: "START" });
  for (const id of ["p0", "p1", "p2", "p3"]) s = act(s, { type: "FINISH_SUBMIT", playerId: id, text: `answer ${id}` });
  s = act(s, { type: "NEXT" }); s = act(s, { type: "NEXT" }); // two answers shown
  assert.equal(s.finishRevealStep, 2);
  const shownId = s.finishOrder[0];
  s = act(s, { type: "KICK", playerId: shownId });
  assert.equal(s.finishRevealStep, 1); // the next unseen answer still needs its own tap
  const view = buildView(s, { viewer: { role: "display" } });
  assert.equal(view.finishit.candidates.length, 1);
});

test("START stamps a distinct game instance id (result dedupe scope)", () => {
  let s = act(base("emoji"), { type: "START" }, NOW);
  const first = s.gameId;
  assert.ok(first);
  s = act(s, { type: "PLAY_AGAIN" }, NOW + 1);
  s = act(s, { type: "START" }, NOW + 2);
  assert.ok(s.gameId && s.gameId !== first);
});
