import { test, expect, request } from "@playwright/test";

// Every TV phase, 12 players, maximum-length inputs, at 1280x720 and
// 1920x1080. The TV is a fixed 1280x720 stage scaled to the viewport, so
// document scrollHeight must equal the viewport height and the frame must
// fit the stage. Review item 4.
const AV = ["🦊", "🐼", "🦄", "🐸", "🐙", "🦁", "🐨", "🦖", "🐯", "🦩", "🐳", "🦉"];
const LONG_STATEMENT = "I once spent a whole summer learning to bake bread with my grandmother in her tiny kitchen by the sea and I still make it every single winter now.";
const LONG_ANSWER = "a suitcase full of snacks, three board games, grandma's famous playlist and the good charger that everyone fights over on every trip";

test("all TV phases fit at 720p and 1080p", async ({ browser, baseURL }) => {
  test.slow();
  const api = await request.newContext({ baseURL });
  const post = async (path, body, token, expectPhase) => {
    const res = await api.fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "x-room-token": token } : {}) }, data: JSON.stringify(body ?? {}) });
    const data = await res.json();
    if (expectPhase) data.__expectedPhase = expectPhase;
    return data;
  };
  const act = (code, token, type, extra = {}, expectedPhase) =>
    post(`/api/rooms/${code}/actions`, { type, token, expectedPhase, ...extra });
  const get2 = async (path, token) => (await api.fetch(path, { headers: token ? { "x-room-token": token } : {} })).json();
  const state = async (code) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const data = await (await api.fetch(`/api/rooms/${code}/state?role=display`)).json();
      if (data.view) return data.view;
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`no view for room ${code}`);
  };

  async function newRoom(game) {
    const room = await post("/api/rooms");
    const players = [];
    for (let i = 0; i < 12; i++) players.push(await post(`/api/rooms/${room.code}/join`, { name: `Player${i + 1}`, avatar: AV[i] }));
    if (game !== "emoji") await act(room.code, room.hostToken, "SELECT_GAME", { game }, "lobby");
    return { ...room, players };
  }

  const results = [];
  async function measure(code, phaseLabel) {
    for (const vp of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(`${baseURL}/tv/${code}`);
      await page.waitForTimeout(1400);
      const m = await page.evaluate(() => {
        // The viewport is position:fixed/overflow:hidden, so document
        // scrollHeight can never fail. Measure the panel's actual content:
        // every descendant's bottom must sit inside the panel's bottom.
        const panel = document.querySelector(".tv-panel");
        const frame = document.querySelector(".tv-frame-big");
        if (!panel) return { maxOverflow: 999, frameH: null };
        const panelBottom = panel.getBoundingClientRect().bottom;
        let maxOverflow = 0;
        for (const el of panel.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.height || r.width) maxOverflow = Math.max(maxOverflow, r.bottom - panelBottom);
        }
        return { maxOverflow: Math.round(maxOverflow * 10) / 10, frameH: frame ? frame.offsetHeight : null };
      });
      results.push({ phase: phaseLabel, viewport: `${vp.width}x${vp.height}`, ...m, fits: m.maxOverflow <= 1 && (m.frameH === null || m.frameH <= 708) });
      await ctx.close();
    }
  }

  // ---- Emoji: reveal, scores, podium
  {
    const r = await newRoom("emoji");
    await act(r.code, r.hostToken, "START", {}, "lobby");
    await act(r.code, r.hostToken, "NEXT", {}, "howto");
    for (let round = 0; round < 10; round++) {
      for (const p of r.players) await post(`/api/rooms/${r.code}/actions`, { type: "ANSWER", token: p.playerToken, choice: 0 });
      if (round === 0) {
        await measure(r.code, "emoji reveal");
        await act(r.code, r.hostToken, "NEXT", {}, "reveal");
        await measure(r.code, "scores");
        await act(r.code, r.hostToken, "NEXT", {}, "scores");
      } else if (round < 9) {
        await act(r.code, r.hostToken, "NEXT", {}, "reveal");
        await act(r.code, r.hostToken, "NEXT", {}, "scores");
      }
    }
    await act(r.code, r.hostToken, "NEXT", {}, "reveal");
    await act(r.code, r.hostToken, "NEXT", {}, "scores");
    expect((await state(r.code)).phase).toBe("finale");
    await measure(r.code, "podium / finale");
  }

  // ---- Spotlight: reveal, story, storySave (120-char statements)
  {
    const r = await newRoom("spotlight");
    await act(r.code, r.hostToken, "START", {}, "lobby");
    await act(r.code, r.hostToken, "NEXT", {}, "howto");
    for (const p of r.players.slice(0, 4)) {
      await post(`/api/rooms/${r.code}/actions`, { type: "SUBMIT_STATEMENTS", token: p.playerToken, texts: [LONG_STATEMENT.slice(0, 120), LONG_STATEMENT.slice(0, 119) + "!", LONG_STATEMENT.slice(0, 118) + "!!"], lieIndex: 1, dontSave: [false, false, false] });
    }
    await act(r.code, r.hostToken, "BEGIN_SPOTLIGHT", {}, "prep");
    const st = await state(r.code);
    for (const p of r.players) if (p.id !== st.spotlight.featuredId) await post(`/api/rooms/${r.code}/actions`, { type: "VOTE", token: p.playerToken, choice: 0 });
    expect((await state(r.code)).phase).toBe("spotlightReveal");
    await measure(r.code, "spotlightReveal");
    await act(r.code, r.hostToken, "NEXT", {}, "spotlightReveal");
    await measure(r.code, "story");
    await act(r.code, r.hostToken, "NEXT", {}, "story");
    await measure(r.code, "storySave");
  }

  // ---- Finish It: present, vote, reveal (80-char answers)
  {
    const r = await newRoom("finishit");
    await act(r.code, r.hostToken, "START", {}, "lobby");
    await act(r.code, r.hostToken, "NEXT", {}, "howto");
    for (const p of r.players) await post(`/api/rooms/${r.code}/actions`, { type: "FINISH_SUBMIT", token: p.playerToken, text: LONG_ANSWER.slice(0, 80) });
    expect((await state(r.code)).phase).toBe("finishPresent");
    for (let i = 0; i < 12; i++) await act(r.code, r.hostToken, "NEXT", {}, "finishPresent");
    await measure(r.code, "finishPresent (12 shown)");
    await act(r.code, r.hostToken, "NEXT", {}, "finishPresent");
    expect((await state(r.code)).phase).toBe("finishVote");
    await measure(r.code, "finishVote (12 max answers)");
    for (const p of r.players) {
      const mine = await get2(`/api/rooms/${r.code}/state?role=player`, p.playerToken);
      const cand = mine.view.finishit.candidates.find((c) => !c.mine);
      await post(`/api/rooms/${r.code}/actions`, { type: "VOTE", token: p.playerToken, choice: cand.id });
    }
    expect((await state(r.code)).phase).toBe("finishReveal");
    await measure(r.code, "finishReveal (12 max answers)");
  }

  for (const r of results) console.log(`PHASE ${r.phase} @ ${r.viewport}: contentOverflow=${r.maxOverflow}px frameH=${r.frameH} fits=${r.fits}`);
  const overflow = results.filter((r) => !r.fits);
  expect(overflow, JSON.stringify(overflow)).toHaveLength(0);
  await api.dispose();
});
