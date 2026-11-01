import { test, expect, request } from "@playwright/test";

// Item 1 regression: a host playing on /host keeps a compact HostBar under
// PlayerGame in-game, with all four answers on screen at 390x844, and can
// drive a full round (answer -> reveal -> scores) from that bar.
test("host plays a full emoji round through /host with the bar visible", async ({ browser, baseURL }) => {
  const api = await request.newContext({ baseURL });
  const room = await (await api.fetch("/api/rooms", { method: "POST" })).json();
  expect(room.ok).toBeTruthy();
  for (const [name, avatar] of [["Guest1", "🐼"], ["Guest2", "🦄"]]) {
    const j = await (await api.fetch(`/api/rooms/${room.code}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ name, avatar }),
    })).json();
    expect(j.ok).toBeTruthy();
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const host = await ctx.newPage();
  await host.goto(`${baseURL}/host`);
  await host.evaluate(({ c, t }) => {
    localStorage.setItem("famparty:hostCode", c);
    localStorage.setItem("famparty:hostToken", t);
  }, { c: room.code, t: room.hostToken });
  await host.reload();
  await host.locator('input[placeholder="e.g. Alex"]').fill("Hosty");
  await host.getByRole("button", { name: /Play & host/ }).click();

  await host.getByRole("button", { name: /Start .*Emoji Decoder/ }).click();
  await host.getByRole("button", { name: /Skip intro/ }).click({ timeout: 5000 }).catch(() => {});

  // question phase: 4 answers + compact host bar all fully in the viewport
  await expect(host.locator(".btn-choice").first()).toBeVisible();
  await expect(host.locator(".host-bar")).toHaveCount(1);
  await expect(host.getByRole("button", { name: /Reveal answer now/ })).toBeVisible();
  const inView = await host.evaluate(() => {
    const ok = (el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight; };
    return {
      answers: [...document.querySelectorAll(".btn-choice")].filter(ok).length,
      bar: ok(document.querySelector(".host-bar")),
    };
  });
  console.log("answers fully in viewport:", inView.answers, "of 4 · host bar in viewport:", inView.bar);
  expect(inView.answers).toBe(4);
  expect(inView.bar).toBe(true);
  await host.screenshot({ path: "/private/var/folders/w6/1p_m57290hs4t3rnwzdkxsyr0000gq/T/opencode/shots/host-answering-390.png" });

  // play the round through, driven only by the bar under the game
  await host.locator(".btn-choice").first().click({ force: true });
  await host.getByRole("button", { name: /Reveal answer now/ }).click();
  await expect(host.getByRole("button", { name: /Show scores/ })).toBeVisible();
  await host.getByRole("button", { name: /Show scores/ }).click();
  await expect(host.getByRole("button", { name: /Next round|Final results/ })).toBeVisible();
  console.log("HOST FULL ROUND OK · room", room.code);

  await ctx.close();
  await api.dispose();
});
