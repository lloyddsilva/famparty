import { test, expect, request } from "@playwright/test";

// Family link -> roster -> linked room -> Spotlight saves truths -> Remember This?
const NAMES = [["Ana", "🦊"], ["Ben", "🐼"], ["Cleo", "🦄"], ["Dan", "🐸"]];

test("family roster, Spotlight save, and Remember This?", async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const post = async (path, body, token) => {
    const res = await ctx.fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "x-room-token": token } : {}) }, data: JSON.stringify(body ?? {}) });
    return { status: res.status(), data: await res.json() };
  };
  const get = async (path, token) => {
    const res = await ctx.fetch(path, { headers: token ? { "x-room-token": token } : {} });
    return { status: res.status(), data: await res.json() };
  };

  const fam = await post("/api/families", { name: "The Test Family" });
  expect(fam.data.ok).toBeTruthy();
  const memberToken = fam.data.memberToken;

  const members = [];
  for (const [name, avatar] of NAMES) {
    const m = await post(`/api/families/${memberToken}`, { action: "addMember", name, avatar });
    expect(m.data.ok).toBeTruthy();
    members.push(m.data.member);
  }

  const room = await post("/api/rooms", { familyToken: memberToken });
  expect(room.data.ok).toBeTruthy();
  const { code, hostToken } = room.data;

  const players = [];
  for (const m of members) {
    const j = await post(`/api/rooms/${code}/join`, { memberId: m.id, familyToken: memberToken });
    expect(j.data.ok, `member join ${m.name}`).toBeTruthy();
    players.push(j.data);
  }

  let r = await post(`/api/rooms/${code}/actions`, { type: "SELECT_GAME", game: "spotlight", token: hostToken, expectedPhase: "lobby" });
  expect(r.data.ok).toBeTruthy();
  r = await post(`/api/rooms/${code}/actions`, { type: "START", token: hostToken, expectedPhase: "lobby" });
  expect(r.data.ok).toBeTruthy();

  let state = await get(`/api/rooms/${code}/state?role=display`);
  expect(state.data.view.phase).toBe("prep");

  const statements = [
    ["I have visited a lighthouse", "I can whistle with my fingers", "I have flown a plane"],
    ["I once met a famous chef", "I hate coriander", "I have run a marathon"],
    ["I can juggle three balls", "I have never seen snow", "I once slept in a tent for a week"],
    ["I make my own bread", "I am afraid of ducks", "I have been on TV"],
  ];
  for (let i = 0; i < 4; i++) {
    const d = await post(`/api/rooms/${code}/actions`, { type: "SUBMIT_STATEMENTS", token: players[i].playerToken, texts: statements[i], lieIndex: 2, dontSave: [false, false, false] });
    expect(d.ok ?? d.data.ok).toBeTruthy();
  }
  r = await post(`/api/rooms/${code}/actions`, { type: "BEGIN_SPOTLIGHT", token: hostToken, expectedPhase: "prep" });
  expect(r.data.ok).toBeTruthy();

  // play all four spotlight turns: everyone else votes for statement index 0
  for (let turn = 0; turn < 4; turn++) {
    state = await get(`/api/rooms/${code}/state?role=display`);
    expect(state.data.view.phase).toBe("spotlight");
    const featuredId = state.data.view.spotlight.featuredId;
    for (const p of players) {
      if (p.playerId === featuredId) continue;
      await post(`/api/rooms/${code}/actions`, { type: "VOTE", token: p.playerToken, choice: 0 });
    }
    state = await get(`/api/rooms/${code}/state?role=display`);
    expect(state.data.view.phase).toBe("spotlightReveal");
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "spotlightReveal" }); // story
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "story" }); // storySave
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "storySave" }); // next/finale
  }
  state = await get(`/api/rooms/${code}/state?role=display`);
  expect(state.data.view.phase).toBe("finale");

  // truths must be saved against roster members (async round-end writes — poll briefly)
  let famState;
  for (let i = 0; i < 10; i++) {
    famState = await get(`/api/families/${memberToken}`);
    if (famState.data.statements?.length >= 8) break;
    await new Promise((res) => setTimeout(res, 500));
  }
  expect(famState.data.statements.length).toBeGreaterThanOrEqual(8);

  // back to lobby, Remember This? must load saved true statements
  r = await post(`/api/rooms/${code}/actions`, { type: "PLAY_AGAIN", token: hostToken, expectedPhase: "finale" });
  expect(r.data.ok).toBeTruthy();
  r = await post(`/api/rooms/${code}/actions`, { type: "SELECT_GAME", game: "remember", token: hostToken, expectedPhase: "lobby" });
  r = await post(`/api/rooms/${code}/actions`, { type: "START", token: hostToken, expectedPhase: "lobby" });
  expect(r.data.ok, JSON.stringify(r.data)).toBeTruthy();
  state = await get(`/api/rooms/${code}/state?role=display`);
  expect(state.data.view.phase).toBe("remember");
  expect(state.data.view.remember.text).toBeTruthy();
  await ctx.dispose();
  console.log(`FAMILY FLOW OK · room ${code} · saved statements: ${famState.data.statements.length}`);
});
