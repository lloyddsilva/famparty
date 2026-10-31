# FamParty — 3-minute demo script

**URL on screen:** https://famparty.vercel.app
**Setup before recording:** laptop on the TV (HDMI or cast tab), host phone, 3 player phones, plus extra browser sessions as players for the montage (step 0). The recorded room is a **family-linked room started from the family page**, with players joining as roster members. All people and statements in this demo are invented.

---

### 0:00–0:15 — Theme and value, up front
*TV shows the landing page. Host phone in hand.*

> [LLOYD — PLACEHOLDER: one honest sentence about your own family and why you built this. Do not script this for him.]
>
> "It's a party game that remembers your family, so it gets better every time you play."

### 0:15–0:40 — Start from the family, join as yourselves
*Host phone shows the family page (The River Family, seeded in step 0).*

> "We start from our family page — these are our people, on the roster. I tap Start a family show…"

- Host taps **Start a family show** on the family page. This device becomes the host remote; the TV opens the display link: big QR code + room code.
- Three players scan the QR code and tap **Join as Ana / Ben / Cleo** — no typed names, they're roster members. Avatars pop onto the TV lobby.
- Point at the TV: "Scores and stories attach to *us*, not to a name typed tonight."

### 0:40–1:25 — Spotlight, with the story beat (the heart)
*Host picks Spotlight on the host phone.*

> "Spotlight is two truths and a lie. Everyone writes theirs privately — the host can start without waiting, and anyone unfinished just watches."

- Cut to: statements already written (prep off-camera). Spotlight opens on Ana; the three statements are on TV, the lie shuffled in.
- Other players vote on their phones. Reveal: who was fooled, who spotted it; Ana scores for every person she fooled.
- **Story beat:** the TV hands her the microphone for 30 seconds. She *talks* — "You should be talking, not typing."
- Afterward: the optional one-line save appears ("Save a line for the family album?"). Show it saving to the family album.

### 1:25–1:55 — Remember This? (from a previous show)
*Same room, back to the lobby. Host picks Remember This?*

> "This statement isn't from tonight. It's from a **previous show** — the family album saved it, and now it's tonight's game."

- A true statement seeded in step 0 (from the earlier session, not the round just played) is on TV.
- Players guess who wrote it. The writer can't score on their own — then the reveal.
- Quick cut to the family page: roster, cumulative scores, the saved statements list.

### 1:55–2:35 — The room at full stretch (montage, ~40s)
Fast cuts, 3–4 seconds each. The montage room has **6+ players**: the 3 phones plus extra browser sessions joined as players (step 0).
- Emoji Decoder round with 6+ avatars on the TV and phones tapping.
- Spectrum reveal — make sure the placements visibly **spread**: players deliberately choose spread-out positions in rehearsal so the dots scatter, and the *Lonely Island* and *Mind Reader* awards land.
- Finish It: answers dealt onto the TV one by one, voting opens, author unmasked.
- The podium. Someone points at the TV and laughs. End on the leaderboard.

### 2:35–3:00 — How it was built (OpenCode + content scripts)
*Editor on screen. Record this segment only once the content run and Lloyd's pack review are done.*

> "Built with OpenCode connected to Meta's Model API, using Muse Wonder 1.0 — the whole app, engine, tests and this content pipeline. The games run on content packs generated once, offline, with Muse Spark for text and Muse Image for the title-card art…"

- Show `scripts/generate-content.mjs` and `content/outputs/` (prompts and raw outputs are committed).
- Show one pack in `src/lib/packs.js` with `reviewed: true`, then `npm run pre-submit` **passing** on screen.

> "…and nothing ships until a human reviews it. The running app makes **no live model calls** and holds **no model API keys** — it runs on database and Redis credentials, and everything it serves is committed files and your family's input."

*Final frame: landing page.*

> "FamParty. One big screen — everyone plays."

---

## Pre-recording checklist

**Step 0 — seed the family and the earlier session (before recording):**
1. On the **live site**, open `/family`, create "The River Family" (invented name). Keep the **owner link** somewhere safe.
2. Add 4 roster members (invented): Ana 🦊, Ben 🐼, Cleo 🦄, Dan 🐸.
3. From the family page, start a family show and play **one full Spotlight game** on a TV + phones. This is the *previous show*: its saved true statements are what Remember This? deals in the recording. Confirm on the family page that statements and scores stuck.
4. For the montage, prepare extra browser sessions (separate browser profiles/windows) that can join as additional players to reach 6+; in the Spectrum rehearsal, agree spread-out placements in advance.
5. Rehearse the exact recorded sequence once, end to end, on the live URL.

**On the day:**
- [ ] TV on the live URL (**not** localhost), phones on Wi-Fi and one on cellular
- [ ] No redeploy during recording
- [ ] `npm run pre-submit` passes (packs reviewed by Lloyd, model outputs committed, live build == HEAD, production DB healthy) before claiming anything is submission-ready
- [ ] Nobody uses a real family member's name or a true personal statement on camera — Lloyd's one personal sentence in the opening is his choice, and his only real-data moment

**Claims to avoid on camera:** "playing in under a minute" (untimed on real devices), any real family's data, anything comparing us to an existing game or TV show by name.
