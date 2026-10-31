import { test, expect, request } from "@playwright/test";

// Review item 2: many pollers race the Spotlight timer expiry. Exactly one
// CAS winner may schedule the family save, and the DB dedupe key is the
// backstop — the featured player's truths must be inserted exactly once.
test("concurrent expiry pollers save truths exactly once", async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const post = async (path, body, token) => {
    const res = await ctx.fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "x-room-token": token } : {}) }, data: JSON.stringify(body ?? {}) });
    return { status: res.status(), data: await res.json() };
  };
  const get = async (path, token) => (await (await ctx.fetch(path, { headers: token ? { "x-room-token": token } : {} })).json());

  const fam = await post("/api/families", { name: "Expiry Test Family" });
  expect(fam.data.ok).toBeTruthy();
  const memberToken = fam.data.memberToken;
  const members = [];
  for (const [name, avatar] of [["Ana", "🦊"], ["Ben", "🐼"], ["Cleo", "🦄"]]) {
    const m = await post(`/api/families/${memberToken}`, { action: "addMember", name, avatar });
    members.push(m.data.member);
  }
  const room = await post("/api/rooms", { familyToken: memberToken });
  const { code, hostToken } = room.data;
  const players = [];
  for (const m of members) players.push((await post(`/api/rooms/${code}/join`, { memberId: m.id, familyToken: memberToken })).data);

  await post(`/api/rooms/${code}/actions`, { type: "SELECT_GAME", game: "spotlight", token: hostToken, expectedPhase: "lobby" });
  await post(`/api/rooms/${code}/actions`, { type: "START", token: hostToken, expectedPhase: "lobby" });
  for (let i = 0; i < 3; i++) {
    await post(`/api/rooms/${code}/actions`, {
      type: "SUBMIT_STATEMENTS", token: players[i].playerToken,
      texts: [`truth one from ${i}`, `truth two from ${i}`, `lie from ${i}`], lieIndex: 2, dontSave: [false, false, false],
    });
  }
  await post(`/api/rooms/${code}/actions`, { type: "BEGIN_SPOTLIGHT", token: hostToken, expectedPhase: "prep" });

  // Nobody votes. Wait out the 30s spotlight timer, then hit the state route
  // with 13 concurrent pollers — the expiry race.
  console.log("waiting for spotlight expiry (~32s)…");
  await new Promise((r) => setTimeout(r, 32000));
  const contexts = await Promise.all(Array.from({ length: 13 }, () => request.newContext({ baseURL })));
  const results = await Promise.all(contexts.map((c) => c.fetch(`/api/rooms/${code}/state?role=display`).then((r) => r.json())));
  for (const c of contexts) await c.dispose();
  expect(results.every((r) => r.view?.phase === "spotlightReveal")).toBeTruthy();

  // The featured player's two truths, exactly once each.
  let statements = [];
  for (let i = 0; i < 12; i++) {
    const f = await get(`/api/families/${memberToken}`);
    statements = f.statements || [];
    if (statements.length >= 2) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  expect(statements).toHaveLength(2);
  expect(new Set(statements.map((s) => s.text)).size).toBe(2);
  await ctx.dispose();
  console.log(`EXPIRY RACE OK · room ${code} · saved exactly ${statements.length} truths from 13 pollers`);
});
