import { test, expect } from "@playwright/test";

// Automated rehearsal of DEMO_SCRIPT's game sequence on the live URL:
// TV-first start -> claim host -> 2 emoji rounds -> End game -> Next:
// Spotlight (one turn, statements typed) -> End game -> Next: Spectrum
// (one round) -> End game -> Next: Finish It (one round) -> podium.
test("demo script rehearsal, timed", async ({ browser, baseURL }) => {
  test.slow();
  const t0 = Date.now();
  const lap = (label) => console.log(`[${Math.round((Date.now() - t0) / 100) / 10}s] ${label}`);

  const tvCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const tv = await tvCtx.newPage();
  await tv.goto(`${baseURL}/`);
  await tv.getByRole("link", { name: /Start on this screen/ }).click();
  await tv.getByRole("button", { name: /Start on this screen/ }).click();
  await expect(tv.locator(".room-code")).toBeVisible();
  const code = (await tv.locator(".room-code").textContent()).trim();
  lap("QR on TV");

  const phones = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/join?code=${code}`);
    await page.locator('input[placeholder="e.g. Alex"]').fill(`Demo${i + 1}`);
    await page.getByRole("button", { name: /I'm in/ }).click();
    await expect(page.getByText("You're in!")).toBeVisible();
    phones.push({ ctx, page });
  }
  const host = phones[0].page;
  const endGame = async () => {
    const end = host.getByRole("button", { name: /End game/ });
    if (!(await end.isVisible().catch(() => false))) await host.getByRole("button", { name: /Manage/ }).click();
    await end.click();
  };
  await expect(host.getByText(/You're the host/)).toBeVisible();
  lap("3 players in, host claimed");

  const answerAll = async () => {
    for (const { page } of phones) {
      const b = page.locator(".btn-choice").first();
      if (await b.isVisible().catch(() => false)) await b.click();
    }
  };

  // Emoji x2, then end the game early
  await host.getByRole("button", { name: /Start .*Emoji Decoder/ }).click();
  await host.getByRole("button", { name: /Skip intro/ }).click();
  await answerAll();
  await host.getByRole("button", { name: /Reveal answer now/ }).click();
  await host.getByRole("button", { name: /Show scores/ }).click();
  await host.getByRole("button", { name: /Next round/ }).click();
  await answerAll();
  await host.getByRole("button", { name: /Reveal answer now/ }).click();
  lap("2 emoji rounds done");
  await endGame();
  await expect(tv.getByText("Final Results")).toBeVisible();

  // Next: Spotlight, one full turn with typed statements
  await host.getByRole("button", { name: /Next: Spotlight/ }).click();
  await host.getByRole("button", { name: /Skip intro/ }).click();
  for (const [i, { page }] of phones.entries()) {
    const inputs = page.locator('.card input:not([type="radio"]):not([type="checkbox"])');
    await inputs.nth(0).fill(`Demo${i + 1} has visited the seaside`);
    await inputs.nth(1).fill(`Demo${i + 1} can whistle`);
    await inputs.nth(2).fill(`Demo${i + 1} has flown a plane`);
    await page.getByRole("button", { name: /Submit statements/ }).click();
  }
  await host.getByRole("button", { name: /Start anyway/ }).click();
  for (const { page } of phones) {
    const v = page.locator(".btn-choice").first();
    if (await v.isVisible().catch(() => false)) await v.click();
  }
  await host.getByRole("button", { name: /Reveal the lie/ }).click();
  await host.getByRole("button", { name: /Start story beat/ }).click();
  await host.getByRole("button", { name: /End story beat/ }).click();
  lap("spotlight turn + story beat done");
  await endGame();

  // Next: Spectrum, one round
  await host.getByRole("button", { name: /Next: Spectrum/ }).click();
  await host.getByRole("button", { name: /Skip intro/ }).click();
  for (const { page } of phones) {
    const slider = page.locator('input[type="range"]');
    if (await slider.isVisible().catch(() => false)) {
      await slider.fill("70");
      await page.getByRole("button", { name: /Lock it in/ }).click();
    }
  }
  await expect(tv.getByText(/crowd leans/i)).toBeVisible({ timeout: 40000 });
  lap("spectrum round done");
  await endGame();

  // Next: Finish It, one round to authors
  await host.getByRole("button", { name: /Next: Finish It/ }).click();
  await host.getByRole("button", { name: /Skip intro/ }).click();
  for (const [i, { page }] of phones.entries()) {
    await page.locator('input[placeholder="Make it funny…"]').fill(["extra snacks", "a nap", "more wifi"][i]);
    await page.getByRole("button", { name: /^Submit$/ }).click();
  }
  for (let i = 0; i < 3; i++) {
    const btn = host.getByRole("button", { name: new RegExp(`Reveal answer ${i + 1}/3`) });
    await btn.click();
  }
  await host.getByRole("button", { name: /Open voting/ }).click();
  for (const { page } of phones) {
    const enabled = page.locator(".btn-choice:not([disabled])").first();
    if (await enabled.isVisible().catch(() => false)) await enabled.click();
  }
  await host.getByRole("button", { name: /Close voting/ }).click();
  await expect(tv.locator(".podium-spot").first()).toBeVisible({ timeout: 15000 }).catch(() => {});
  lap("finish round done — sequence complete");

  for (const { ctx } of phones) await ctx.close();
  await tvCtx.close();
});
