import { test, expect, request } from "@playwright/test";

const AV = ["🦊", "🐼", "🦄"];
async function makeRoom(browser, baseURL) {
  const hostCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const host = await hostCtx.newPage();
  await host.goto(`${baseURL}/host`);
  await host.getByRole("button", { name: /Create room/ }).click();
  await expect(host.locator("h2")).toContainText(/Room [A-Z0-9]{4}/);
  const code = ((await host.locator("h2").first().textContent()).match(/[A-Z0-9]{4}/) || [""])[0];
  const tvCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const tv = await tvCtx.newPage();
  await tv.goto(`${baseURL}/tv/${code}`);
  const phones = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/join?code=${code}`);
    await page.locator('input[placeholder="e.g. Alex"]').fill(`Ui${i + 1}`);
    await page.locator(".avatar").nth(i).click();
    await page.getByRole("button", { name: /I'm in/ }).click();
    await expect(page.getByText("You're in!")).toBeVisible();
    phones.push({ ctx, page });
  }
  return { hostCtx, host, tvCtx, tv, phones, code };
}
async function cleanup(r) {
  for (const { ctx } of r.phones) await ctx.close();
  await r.hostCtx.close();
  await r.tvCtx.close();
}

test("Spotlight in the UI, through to the podium", async ({ browser, baseURL }) => {
  const r = await makeRoom(browser, baseURL);
  await r.host.getByRole("button", { name: /Spotlight/ }).click();
  await r.host.getByRole("button", { name: /Start Spotlight/ }).click();
  for (const [i, { page }] of r.phones.entries()) {
    const inputs = page.locator('.card input:not([type="radio"]):not([type="checkbox"])');
    await inputs.nth(0).fill(`Ui${i + 1} has visited the seaside`);
    await inputs.nth(1).fill(`Ui${i + 1} can whistle`);
    await inputs.nth(2).fill(`Ui${i + 1} has flown a plane`);
    await page.getByRole("button", { name: /Submit statements/ }).click();
    await expect(page.getByText(/Statements in/)).toBeVisible();
  }
  await r.host.getByRole("button", { name: /Start anyway/ }).click();
  // three featured turns
  for (let turn = 0; turn < 3; turn++) {
    for (const { page } of r.phones) {
      const vote = page.locator(".btn-choice").first();
      if (await vote.isVisible().catch(() => false)) await vote.click();
    }
    await r.host.getByRole("button", { name: /Start story beat/ }).click();
    await r.host.getByRole("button", { name: /End story beat/ }).click();
    const nextBtn = r.host.getByRole("button", { name: /Next player|Final results/ });
    await nextBtn.click();
  }
  await expect(r.tv.getByText("Final Results")).toBeVisible({ timeout: 10000 });
  await expect(r.tv.locator(".podium-spot").first()).toBeVisible();
  await cleanup(r);
});

test("Finish It in the UI: write, present, vote, authors", async ({ browser, baseURL }) => {
  const r = await makeRoom(browser, baseURL);
  await r.host.getByRole("button", { name: /Finish It/ }).click();
  await r.host.getByRole("button", { name: /Start Finish It/ }).click();
  const answers = ["extra snacks", "a nap", "more wifi"];
  for (const [i, { page }] of r.phones.entries()) {
    await page.locator('input[placeholder="Make it funny…"]').fill(answers[i]);
    await page.getByRole("button", { name: /^Submit$/ }).click();
  }
  // host deals the answers onto the TV one tap at a time, then opens voting
  await r.host.getByRole("button", { name: /Reveal answer 1\/3/ }).click();
  await r.host.getByRole("button", { name: /Reveal answer 2\/3/ }).click();
  await r.host.getByRole("button", { name: /Reveal answer 3\/3/ }).click();
  await r.host.getByRole("button", { name: /Open voting/ }).click();
  await expect(r.tv.getByText(/Voting is open/)).toBeVisible();
  for (const { page } of r.phones) {
    const enabled = page.locator(".btn-choice:not([disabled])").first();
    await enabled.click();
  }
  await r.host.getByRole("button", { name: /Close voting/ }).click();
  await expect(r.tv.getByText(/votes? · /).first()).toBeVisible({ timeout: 10000 });
  await cleanup(r);
});

test("Remember This? in the UI from a family album", async ({ browser, baseURL }) => {
  const api = await request.newContext({ baseURL });
  const post = async (path, body, token) => (await api.fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "x-room-token": token } : {}) }, data: JSON.stringify(body ?? {}) })).json();
  const fam = await post("/api/families", { name: "Ui Test Family" });
  const members = [];
  for (const [name, avatar] of [["Ana", "🦊"], ["Ben", "🐼"], ["Cleo", "🦄"]]) {
    members.push((await post(`/api/families/${fam.memberToken}`, { action: "addMember", name, avatar })).member);
  }
  const room = await post("/api/rooms", { familyToken: fam.memberToken });
  const { code, hostToken } = room;
  const players = [];
  for (const m of members) players.push(await post(`/api/rooms/${code}/join`, { memberId: m.id, familyToken: fam.memberToken }));
  // seed an earlier session: one spotlight game by API
  await post(`/api/rooms/${code}/actions`, { type: "SELECT_GAME", game: "spotlight", token: hostToken, expectedPhase: "lobby" });
  await post(`/api/rooms/${code}/actions`, { type: "START", token: hostToken, expectedPhase: "lobby" });
  for (let i = 0; i < 3; i++) {
    await post(`/api/rooms/${code}/actions`, { type: "SUBMIT_STATEMENTS", token: players[i].playerToken, texts: [`seeded truth ${i}a`, `seeded truth ${i}b`, `seeded lie ${i}`], lieIndex: 2, dontSave: [false, false, false] });
  }
  await post(`/api/rooms/${code}/actions`, { type: "BEGIN_SPOTLIGHT", token: hostToken, expectedPhase: "prep" });
  for (let turn = 0; turn < 3; turn++) {
    const st = await (await api.fetch(`/api/rooms/${code}/state?role=display`)).json();
    const featuredId = st.view.spotlight.featuredId;
    for (const p of players) if (p.playerId !== featuredId) await post(`/api/rooms/${code}/actions`, { type: "VOTE", token: p.playerToken, choice: 0 });
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "spotlightReveal" });
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "story" });
    await post(`/api/rooms/${code}/actions`, { type: "NEXT", token: hostToken, expectedPhase: "storySave" });
  }
  await new Promise((r) => setTimeout(r, 1200)); // async saves land

  // now the UI: host + member phones play Remember This? in a NEW room so tonight's statements are excluded
  const room2 = await post("/api/rooms", { familyToken: fam.memberToken });
  const hostCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const host = await hostCtx.newPage();
  await host.goto(`${baseURL}/host`);
  await host.evaluate(({ c, t }) => { localStorage.setItem("famparty:hostCode", c); localStorage.setItem("famparty:hostToken", t); }, { c: room2.code, t: room2.hostToken });
  await host.reload();
  const phones = [];
  for (const m of members) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/join?code=${room2.code}&member=${m.id}&family=${fam.memberToken}`);
    await page.getByRole("button", { name: /I'm in/ }).click();
    await expect(page.getByText("You're in!")).toBeVisible();
    phones.push({ ctx, page });
  }
  await host.getByRole("button", { name: /Remember This/ }).click();
  await host.getByRole("button", { name: /Start Remember/ }).click();
  for (const { page } of phones) {
    const choice = page.locator(".btn-choice").first();
    if (await choice.isVisible().catch(() => false)) await choice.click();
  }
  const tvCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const tv = await tvCtx.newPage();
  await tv.goto(`${baseURL}/tv/${room2.code}`);
  await expect(tv.getByText(/REMEMBER THIS\?/i)).toBeVisible({ timeout: 10000 });
  for (const { ctx } of phones) await ctx.close();
  await hostCtx.close();
  await tvCtx.close();
  await api.dispose();
});
