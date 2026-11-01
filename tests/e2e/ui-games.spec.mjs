import { test, expect, request } from "@playwright/test";
test.slow();

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
  await r.host.getByRole("button", { name: "🎤 Spotlight" }).click();
  await r.host.getByRole("button", { name: /Start .*Spotlight/ }).click();
  await r.host.getByRole("button", { name: /Skip intro/ }).click();
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
    await r.host.getByRole("button", { name: /Reveal the lie/ }).click();
    await r.host.getByRole("button", { name: /Start story beat/ }).click();
    await r.host.getByRole("button", { name: /End story beat/ }).click();
  }
  await expect(r.tv.getByText("Final Results")).toBeVisible({ timeout: 10000 });
  await expect(r.tv.locator(".podium-spot").first()).toBeVisible();
  await cleanup(r);
});

test("Finish It in the UI: write, present, vote, authors", async ({ browser, baseURL }) => {
  const r = await makeRoom(browser, baseURL);
  await r.host.getByRole("button", { name: "✍️ Finish It" }).click();
  await r.host.getByRole("button", { name: /Start .*Finish It/ }).click();
  await r.host.getByRole("button", { name: /Skip intro/ }).click();
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

test("host picker offers exactly four games (no Remember This?)", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${baseURL}/host`);
  await page.getByRole("button", { name: /Create room/ }).click();
  await expect(page.getByText(/Room [A-Z0-9]{4}/)).toBeVisible();
  // the one game picker is the HostBar picker; only four games exist now
  for (const label of ["🧩 Emoji", "🎤 Spotlight", "🎚️ Spectrum", "✍️ Finish It"]) {
    await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Remember This/)).toHaveCount(0);
  await ctx.close();
});
