import { test, expect } from "@playwright/test";

// Setup budget (product goal): host reaches a QR on the big screen in <=2
// taps; a player is in with a name + 1 tap; the group reaches round 1 in
// under 60 seconds. This test measures taps and wall-clock seconds.
test("setup: taps and seconds to round 1", async ({ browser, baseURL }) => {
  test.slow();
  const t0 = Date.now();
  const seconds = () => Math.round((Date.now() - t0) / 100) / 10;

  // --- TV-first host on desktop
  const tvCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const tv = await tvCtx.newPage();
  let tvTaps = 0;
  await tv.goto(`${baseURL}/`);
  await tv.getByRole("link", { name: /Start on this screen/ }).click(); tvTaps++;
  await tv.getByRole("button", { name: /Start on this screen/ }).click(); tvTaps++;
  await expect(tv.locator(".room-code")).toBeVisible();
  const code = (await tv.locator(".room-code").textContent()).trim();
  console.log(`TV-FIRST: ${tvTaps} taps to QR, ${seconds()}s elapsed`);
  expect(tvTaps).toBeLessThanOrEqual(2);

  // --- players scan in (QR link), name + one tap; first scanner claims host
  const phones = [];
  let firstPlayerTaps = 0;
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/join?code=${code}${i === 0 ? "&claim=1" : ""}`);
    await page.locator('input[placeholder="e.g. Alex"]').fill(`Timer${i + 1}`);
    await page.getByRole("button", { name: /I'm in/ }).click();
    if (i === 0) firstPlayerTaps = 1; // the only tap after typing the name
    await expect(page.getByText("You're in!")).toBeVisible();
    phones.push({ ctx, page });
  }
  console.log(`PLAYER: ${firstPlayerTaps} tap after typing name, ${seconds()}s elapsed`);
  expect(firstPlayerTaps).toBe(1);

  // first player is host: banner + host bar on the same phone
  const host = phones[0].page;
  await expect(host.getByText(/You're the host/)).toBeVisible();
  let hostTaps = 0;
  await host.getByRole("button", { name: /Start .*Emoji Decoder/ }).click(); hostTaps++;
  await host.getByRole("button", { name: /Skip intro/ }).click(); hostTaps++;
  await expect(tv.locator(".tv-question")).toBeVisible();
  const total = seconds();
  console.log(`ROUND 1 REACHED: host used ${hostTaps} taps in-game, total ${total}s from landing`);
  expect(total).toBeLessThan(60);

  for (const { ctx } of phones) await ctx.close();
  await tvCtx.close();
});
