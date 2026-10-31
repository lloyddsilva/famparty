import { test, expect, request } from "@playwright/test";

// 13 clients: 1 host + 12 players (the maximum room size), playing a full
// Emoji Decoder game over HTTP polling — exactly how real phones play.
const AVATARS = ["🦊", "🐼", "🦄", "🐸", "🐙", "🦁", "🐨", "🦖", "🐯", "🦩", "🐳", "🦉"];
let invocations = 0;

async function call(ctx, method, path, { body, token } = {}) {
  invocations += 1;
  const res = await ctx.fetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { "x-room-token": token } : {}) },
    data: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status(), data: await res.json() };
}

test("13-client full Emoji Decoder game", async ({ baseURL }) => {
  const host = await request.newContext({ baseURL });
  const created = await call(host, "POST", "/api/rooms");
  expect(created.data.ok).toBeTruthy();
  const { code, hostToken } = created.data;

  const players = [];
  for (let i = 0; i < 12; i++) {
    const ctx = await request.newContext({ baseURL });
    const join = await call(ctx, "POST", `/api/rooms/${code}/join`, { body: { name: `Player${i + 1}`, avatar: AVATARS[i] } });
    expect(join.data.ok, `join ${i + 1}`).toBeTruthy();
    players.push({ ctx, token: join.data.playerToken });
  }

  let state = await call(host, "GET", `/api/rooms/${code}/state?role=display`);
  expect(state.data.view.players).toHaveLength(12);
  expect(state.data.view.players.length).toBeLessThanOrEqual(12); // TV grid must cope at 12

  let r = await call(host, "POST", `/api/rooms/${code}/actions`, { body: { type: "START", token: hostToken, expectedPhase: "lobby" } });
  expect(r.data.ok).toBeTruthy();

  // regression 4: a stale duplicate NEXT (same expectedPhase) must be rejected
  for (let round = 0; round < 10; round++) {
    state = await call(host, "GET", `/api/rooms/${code}/state?role=display`);
    expect(state.data.view.phase).toBe(round === 0 ? "question" : "question");
    // all 12 answer at once — simultaneous answers must all score at reveal (items 1-2)
    await Promise.all(players.map((p, i) => call(p.ctx, "POST", `/api/rooms/${code}/actions`, {
      body: { type: "ANSWER", token: p.token, choice: i % 4 },
    })));
    state = await call(host, "GET", `/api/rooms/${code}/state?role=display`);
    expect(state.data.view.phase).toBe("reveal"); // all-answered auto-reveal, scored from the hash
    const stale = await call(host, "POST", `/api/rooms/${code}/actions`, { body: { type: "NEXT", token: hostToken, expectedPhase: "question" } });
    expect(stale.status).toBe(409);
    r = await call(host, "POST", `/api/rooms/${code}/actions`, { body: { type: "NEXT", token: hostToken, expectedPhase: "reveal" } });
    expect(r.data.ok).toBeTruthy();
    if (round < 9) {
      r = await call(host, "POST", `/api/rooms/${code}/actions`, { body: { type: "NEXT", token: hostToken, expectedPhase: "scores" } });
      expect(r.data.ok).toBeTruthy();
    }
  }
  state = await call(host, "GET", `/api/rooms/${code}/state?role=display`);
  expect(state.data.view.phase).toBe("scores");
  r = await call(host, "POST", `/api/rooms/${code}/actions`, { body: { type: "NEXT", token: hostToken, expectedPhase: "scores" } });
  state = await call(host, "GET", `/api/rooms/${code}/state?role=display`);
  expect(state.data.view.phase).toBe("finale");
  const totalScore = state.data.view.players.reduce((s, p) => s + p.score, 0);
  expect(totalScore).toBeGreaterThan(0);

  for (const p of players) await p.ctx.dispose();
  await host.dispose();
  console.log(`13-CLIENT GAME OK · room ${code} · total score ${totalScore} · function invocations (API calls): ${invocations}`);
});
