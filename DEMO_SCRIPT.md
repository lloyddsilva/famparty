# FamParty — 3-minute demo script

**URL on screen:** https://famparty.vercel.app
**Setup before recording:** laptop on the TV (HDMI or cast tab), host phone, 3 player phones. Create the demo family in advance (step 0). All people and statements in this demo are invented.

---

### 0:00–0:25 — The problem & the join (show, don't tell)
*TV shows the landing page. Host phone in hand.*

> "This is FamParty. One person hosts from their phone, the TV just displays, and everyone else plays on their phone. No accounts, no app — watch how fast this room fills."

- Host taps **Host a show** → room created. TV opens the display link: big QR code + room code.
- Three players scan the QR code, pick a name + avatar. Avatars pop onto the TV lobby one by one.
- Point at the TV: "That's it. We're in."

### 0:25–1:20 — Spotlight, with the story beat (the heart)
*Host picks Spotlight on the host phone.*

> "Spotlight is two truths and a lie. Everyone writes theirs privately — the host can start without waiting, and anyone unfinished just watches."

- Cut to: statements already written (prep off-camera). Spotlight opens on Player 1; the three statements are on TV, the lie shuffled in.
- Other players vote on their phones. Reveal: who was fooled, who spotted it; the featured player scores for every person fooled.
- **Story beat:** the TV hands them the microphone for 30 seconds. Featured player *talks* — "You should be talking, not typing."
- Afterward: the optional one-line save appears ("Save a line for the family album?"). It goes to the family link — show that save happening.

### 1:20–1:55 — Remember This? (the memory payoff)
*Same room, back to the lobby. Host picks Remember This?*

> "This is why the family link exists. That true statement we just saved doesn't disappear — it becomes a later game."

- A saved true statement from an **invented earlier session** is on TV (prep this by seeding it in step 0 below).
- Players guess who wrote it. The writer can't score on their own — then the reveal.
- Quick cut to the family page: roster, cumulative scores, the saved statements list. "Scores and authorship attach to the person, not the name they typed tonight."

### 1:55–2:35 — The room at full stretch (montage, ~40s)
Fast cuts, 3–4 seconds each:
- Emoji Decoder round with 6+ avatars on the TV and phones tapping.
- Spectrum reveal — avatar dots scattered across the spectrum; *Lonely Island* and *Mind Reader* awards land.
- Finish It: an answer dealt onto the TV, voting, author unmasked.
- The podium. Someone points at the TV and laughs. End on the leaderboard.

### 2:35–3:00 — How it was built (Muse Code + content scripts)
*Editor on screen.*

> "FamParty was built with Meta's Muse models in Muse Code — the whole app, engine, tests and this content pipeline. The games run on content packs generated once, offline, with Muse Spark for text and Muse Image for the title-card art…"

- Show `scripts/generate-content.mjs` and `content/outputs/` (the prompts and raw outputs are committed).
- Show one pack in `src/lib/packs.js` with `reviewed: false`.

> "…and nothing ships until a human reviews it. The running app makes **no live model calls** and holds no API keys — everything it serves is committed files and your family's input."

*Final frame: landing page.*

> "FamParty. One big screen — everyone plays."

---

## Pre-recording checklist

**Step 0 — seed the invented earlier session (10 min, before recording):**
1. Open `/family`, create "The River Family" (invented name). Keep the **owner link** somewhere safe; show the member link in the demo.
2. Add 4 roster members (invented): e.g. Ana 🦊, Ben 🐼, Cleo 🦄, Dan 🐸.
3. From the family page, start a family show. On a TV + 3 phones, play **one Spotlight round** so everyone saves at least one true statement. Remember This? in the demo deals from these.
4. Confirm on the family page that the statements and scores stuck.

**On the day:**
- [ ] TV on the live URL (**not** localhost), phones on both Wi-Fi and one on cellular
- [ ] A redeploy is **not** done during recording (rooms are in Redis, but don't tempt fate mid-show)
- [ ] Pre-submit status known: `npm run pre-submit` currently fails only on unreviewed packs / missing model outputs (skipped content run) — do not claim submission-ready until that changes
- [ ] Nobody uses a real family member's name or a true personal statement on camera

**Claims to avoid on camera:** "playing in under a minute" (untimed on real devices), any real family's data, anything comparing us to an existing game or TV show by name.
