import { test, expect } from "@playwright/test";

// Real browsers, real polling, separate storage per device — the closest
// automated stand-in for 1 TV + host phone + 3 player phones.
// Covers review item 1 (answers must reach the TV screen) and item 3
// (a saved room that expired must not strand a phone on "Connecting…").
const AVATARS = ["🦊", "🐼", "🦄"];

test("TV + host + 3 phones play a round by polling", async ({ browser, baseURL }) => {
  const tvCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const hostCtx = await browser.newContext();
  const tv = await tvCtx.newPage();
  const host = await hostCtx.newPage();

  await host.goto(`${baseURL}/host`);
  await host.getByRole("button", { name: /Create room/ }).click();
  await expect(host.getByText(/Room [A-Z0-9]{4}/)).toBeVisible();
  const roomText = await host.locator("h2").first().textContent();
  const code = roomText.replace("Room ", "").trim();

  await tv.goto(`${baseURL}/tv/${code}`);
  await expect(tv.locator(".room-code")).toHaveText(code);
  await expect(tv.locator("img.qr")).toBeVisible();

  const phones = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/join?code=${code}`);
    await page.locator('input[placeholder="e.g. Alex"]').fill(`Phone${i + 1}`);
    await page.locator(".avatar").nth(i).click();
    await page.getByRole("button", { name: /Join game/ }).click();
    await expect(page.getByText("You're in!")).toBeVisible();
    phones.push({ ctx, page });
  }

  // players appear on the TV by polling alone
  for (let i = 0; i < 3; i++) await expect(tv.getByText(`Phone${i + 1}`)).toBeVisible();

  await host.getByRole("button", { name: /Start Emoji Decoder/ }).click();
  for (const { page } of phones) {
    await expect(page.locator(".btn-choice").first()).toBeVisible();
  }

  // ITEM 1: an answer submitted on a phone must show up on the TV.
  await phones[0].page.locator(".btn-choice").first().click();
  await expect(phones[0].page.getByText(/Answer locked in/)).toBeVisible();
  await expect(tv.getByText("1 / 3 answered")).toBeVisible({ timeout: 8000 });

  await phones[1].page.locator(".btn-choice").nth(1).click();
  await expect(tv.getByText("2 / 3 answered")).toBeVisible({ timeout: 8000 });
  await phones[2].page.locator(".btn-choice").first().click();

  // all answered -> reveal reaches every screen
  await expect(tv.locator("h2", { hasText: "Pizza Party" })).toBeVisible({ timeout: 10000 });
  await expect(phones[0].page.getByText(/Correct!/)).toBeVisible({ timeout: 10000 });

  for (const { ctx } of phones) await ctx.close();
  await tvCtx.close();
  await hostCtx.close();
});

test("an expired saved room returns the phone to the join form", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${baseURL}/join`);
  await page.evaluate(() => {
    localStorage.setItem("famparty:playerCode", "ZZZZ");
    localStorage.setItem("famparty:playerToken", "deadbeefdeadbeefdeadbeefdeadbeef");
  });
  await page.reload();
  // not stuck on Connecting…: the join form comes back with an explanation
  await expect(page.getByRole("button", { name: /Join game/ })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/room has ended/i)).toBeVisible();
  await ctx.close();
});
