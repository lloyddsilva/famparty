# FamParty — 3-minute demo script

**URL on screen:** https://famparty.vercel.app
**Setup:** TV or laptop on the big screen, host phone, 3 player phones. Everyone and everything in this demo is invented. Timings are targets — rehearse once with a stopwatch.

---

### 0:00–0:20 — What it is
*TV shows the landing page.*

> [LLOYD — PLACEHOLDER: one honest sentence about your own family and why you built this.]
>
> "It's a party game show that runs on your TV and everyone's phones. No accounts, no app. Watch how fast this room fills."

### 0:20–0:45 — TV-first start (the whole setup)
- On the TV, tap **Start on this screen**. The big QR code and room code appear.
- Three players scan, type a name, tap **I'm in**. The first scanner gets a "You're the host" message — their phone now runs the show *and* plays.
- Avatars land on the TV lobby. Point at it: "That's the setup. Under a minute, and nobody installed anything."

### 0:45–1:30 — Emoji Decoder + Spotlight (two games, one room)
- Host taps **Start**. A 5-second "How to play" card is on the TV; let it run once so the room hears the one-sentence rules.
- Play two Emoji Decoder rounds: big emoji, four choices per phone, leaderboard on TV.
- Host taps **Manage → End game → podium**. On the podium, the host taps **Next: Spotlight**. Scores carry over; nobody rejoins.
- Spotlight: statements were written in prep (write these off-camera if time is tight). One vote, one reveal, then **Start story beat** — the featured player tells the real story for 30 seconds. Host taps **End story beat**, then **Manage → End game → podium** again.

### 1:30–2:15 — Spectrum and Finish It (the other two)
- **Next: Spectrum.** Everyone places themselves, predicts the crowd, and the dots land at once. Call out the Lonely Island. Then **Manage → End game → podium**.
- **Next: Finish It.** One prompt, anonymous answers dealt onto the TV one by one, voting, authors unmasked.
- Podium. Someone points at the TV. That's the shot.

### 2:15–2:45 — Built with Muse
*Editor on screen.*

> "Built with OpenCode connected to Meta's Model API, using Muse Wonder 1.0 — the whole app, engine, tests and content pipeline."

**ONLY IF THE CONTENT RUN IS DONE, add:**

> "Content is generated once, offline, with Muse Spark and Muse Image, then a person reads every line before it ships."

**Otherwise, say this instead (the honest line for the current build):**

> "Built with Muse; the current game content is hand-written starter packs."

- Show `scripts/generate-content.mjs`, the committed outputs, one pack, and `npm run pre-submit` passing.
- "The running app makes **no live model calls** and holds **no model API keys**."

### 2:45–3:00 — Close
*Landing page.*

> "Four games, one room, zero signup. FamParty — party with the fam."

---

## Before recording
- [ ] Rehearse this exact sequence once on the live URL with the stopwatch running
- [ ] TV on the live URL (not localhost); one phone on cellular; nobody redeploys mid-show
- [ ] `npm run pre-submit` passes (packs reviewed by Lloyd, outputs committed, live build == HEAD)
- [ ] No real family names or true personal statements on camera — the placeholder line is Lloyd's only real-data moment
