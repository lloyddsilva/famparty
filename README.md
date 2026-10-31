# FamParty

**One big screen. Every phone is a controller. Nobody signs up.**

FamParty is a collection of short bonding games for people who are already together — families in a living room, friends on game night, or a team that needs five warm minutes before a meeting. A host runs the show from their phone, a TV (or any shared screen) displays it, and everyone else joins on their phone by scanning a QR code or typing a 4-letter room code.

> **Live demo:** https://famparty-lloyd-dsilvas-projects.vercel.app
> **Intended home:** famparty.com (domain/trademark checks parked — not a launch blocker)
> **For engineering context:** see `CLAUDE.md`. This README is the product brief.

---

## 1. The product in one minute

Most group games fail before they start: someone has to download an app, create an account, explain rules, find paper, or keep score by hand. By then the moment has passed.

FamParty removes all of that:

1. The host opens FamParty on their phone and taps **Host a show**.
2. The TV opens a display link and shows a big QR code + room code.
3. Players scan, pick a name and an emoji avatar, and they're in. Under 30 seconds.
4. Short rounds play out on the TV — big reveals, silly answers, real conversations.
5. The host drives everything from their phone: start, pause, skip, reveal, next.
6. At the end there's a winner's podium — and, if the group uses a family link, the best moments are saved for next time.

There are no accounts, no passwords, no app installs, no payments, and nothing to print. If you can open a link, you can play.

## 2. Why this exists

- **Phones usually pull people out of a gathering. FamParty puts them back in.** The phone becomes a private controller; the TV stays the shared focus, so people look up, react together, and talk.
- **The best party games create stories, not just scores.** A guessed lie, an outlier opinion, a ridiculous sentence ending — these become the thing the family retells next week. Scoring exists to create drama; conversation is the real reward.
- **Existing options have friction or the wrong setting.** TV party-game consoles assume everyone is a gamer. Meeting icebreakers assume a workplace and a facilitator with a laptop. Printable party games assume preparation. FamParty is built for a couch, a mix of ages, and zero preparation.

## 3. Who it's for

### Primary: the family host
The person who organises the gathering — a parent, grandparent, sibling, or the family's unofficial events person. They are not necessarily technical. They want something that works the first time, includes kids and grandparents alike, and makes them look like they planned more than they did.

**Their job to be done:** *"Give me something in the next two minutes that gets everyone — ages 8 to 80 — laughing together, without me having to teach, print, or troubleshoot."*

### Players: everyone else in the room
Kids, grandparents, in-laws, the cousin who's only on their phone anyway. Wide range of tech confidence, eyesight, and reading speed. They will join exactly once per session and abandon instantly if confused.

**Their job to be done:** *"Let me in fast, don't embarrass me, and make my turn obvious."*

### Secondary audiences
- **Friends on game night** — same room, more competitive, drinking-snacks energy (still family-safe content).
- **Small teams** — a 5-minute opener before a meeting, in-room or with the shared screen on a video call. No work content, no cringe corporate exercises.

### Explicitly not the user
Gamers looking for depth, leagues, ranked play, or accounts. Anyone wanting chat, friends lists, or public matchmaking. (These are non-goals **for now**, not forever.)

## 4. Product principles

Design and product decisions should be tested against these, in this order:

1. **Playing in 30 seconds.** Every screen, word, and tap is judged against time-to-first-round. If a feature delays the first game, it loses.
2. **The TV is the stage; phones are props.** Anything the group should react to happens big, on the shared screen. Phones hold only private information: your answer, your statements, your vote.
3. **Talk first, tap second.** The magic moments are spoken — telling the story behind a truth, defending an outlier opinion. Never make a player type while they should be talking.
4. **The host is the DJ, not a player-character.** The host controls pace, can rescue a stalling round (pause, skip, reveal), and can quietly hide anything inappropriate. Host controls live on the host's phone; the TV never shows controls.
5. **Safe to put on a family TV.** All shipped content is family-safe and original. Free-text moments (names, statements, answers) are paired with host moderation — hide or kick, at any moment — because filters alone will miss things.
6. **Nobody is put on the spot.** Every game has a low-pressure way in: watch-only roles, private writing time, anonymous answers, passing without penalty. Shy players and young kids must be able to participate sideways.
7. **Memory is the moat.** A one-off game is a commodity. A family whose true stories, scores, and inside jokes accumulate — and resurface in later games — has a reason to come back to *their* FamParty.
8. **No accounts is a feature, not a missing feature.** Identity is a name + avatar for tonight, or a roster member under a family link. We say plainly how the (admittedly thin) security model works rather than pretending it's something it isn't.

## 5. The core experience

```
HOST PHONE            TV (display only)              PLAYER PHONES
──────────            ─────────────────              ─────────────
Create room     ───►  QR code + room code      ◄───  Scan / enter code
Pick a game           Lobby fills with avatars       Pick name + avatar
Start / pause /       Question, timer, reveals,      Answer, vote, place,
skip / reveal         leaderboard, podium            write — privately
```

- **Session length:** one game ≈ 10 minutes; a typical show is 2–3 games.
- **Players:** 3–12 per room (two players breaks voting games; the UI and copy assume a crowd).
- **One room, one show.** Rooms lock when a game starts (latecomers wait for the next show) and expire when idle. A fresh QR scan always beats a stale saved room.
- **Reconnects are invisible.** Phones lock, wake, lose Wi-Fi, refresh. Players rejoin as themselves without the group noticing. Design should never punish or dramatise a disconnect; an "away" dot is enough.

## 6. The games

Each game is a different flavour of bonding. All share the chassis: lobby → rounds → reveals → leaderboard → podium.

### 🧩 Emoji Decoder — *the warm-up*
Guess the phrase from an emoji clue (🍕🎉 = "Pizza Party"), four choices, faster correct answers score more, streaks build.
- **Feels like:** shouting answers at a game show. Zero learning curve; grandparents and kids play as equals.
- **Design moment:** the giant emoji on TV and the answer reveal. Speed pressure is excitement here — the only game where the timer leads.

### 🎤 Spotlight — *the heart of the product*
Each player privately writes two true statements and one lie about themselves (prompt starters help: *"A place I have been…"*), or chooses to just watch. Statements are shuffled so the lie has no tell. One player at a time is in the spotlight: everyone else votes on the lie. Guessers score for spotting it; the featured player scores for every person they fool. Then the screen gives them **30 seconds to tell the real story out loud** — typing is deliberately impossible during the beat. Afterward they may save a one-line version for the family album.
- **Feels like:** the best part of a family dinner, structured. This is the game people will describe to friends.
- **Design moments:** the spotlight reveal (who was fooled!), and the story beat — the TV should feel like it hands them the microphone.
- **Care points:** writing happens in its own prep phase (not the lobby), the host can start without everyone ("unfinished = just watch"), and every statement has a *"don't save this"* option.

### 🎚️ Spectrum — *the conversation starter*
A pair of opposites ("Cook at home ↔ Order takeaway"). Each player places themselves on a slider, and also predicts where the crowd will land. The TV then reveals everyone's avatar dots scattered along the spectrum at once.
- **Feels like:** "Wait — YOU put yourself *there*?!" Outliers and lone wolves get celebrated, not just winners (awards like *Lonely Island* and *Mind Reader*).
- **Design moment:** the simultaneous avatar reveal on the big spectrum. This visual is the game's identity; it must be readable at a glance from a couch, for up to 12 avatars.
- **Care points:** prompts stay light and preference-based — never politics, identity, health, or beliefs.

### ✍️ Finish It — *the comedy round*
Everyone privately completes the same sentence ("The secret to surviving a family road trip is ___"). Answers appear on TV anonymously, one by one; everyone votes for the funniest (never their own). Authors are revealed only after voting.
- **Feels like:** the family's funniest person gets discovered, and it isn't always who you expect. Anonymity means the quiet kid can beat the loud uncle.
- **Design moments:** the one-at-a-time anonymous reveal (comic timing matters — the host controls the pace) and the author unmasking.
- **Care points:** 80-character answers, exact-duplicate answers pool their votes, answers are moderated by host hide before anyone knows whose they are.

### 🧠 Remember This? — *the memory game (family link only)*
True statements saved from earlier Spotlight sessions resurface: "I once met a penguin." Whose was it? Everyone guesses; the writer can't score on their own.
- **Feels like:** proof the family has a history. It rewards returning and turns last month's game into tonight's content.
- **Design moment:** the "from a previous show" framing — this should feel like opening a family album, not a quiz rerun.

## 7. The family link (retention layer)

Any group can play anonymously tonight. A **family link** is for groups who come back:

- An unguessable permanent link for one family — like an unlisted video. **The link is the key**: whoever has it can get in. We say this plainly in the UI, in friendly language, because it's the truth of the model.
- The link holds a **roster**: the family's actual people (Mum 🦊, Grandpa 🐢…). Joining through the link means picking *your* roster member, so scores, authorship, and history attach to the person — not to whatever name they typed tonight.
- Two links per family: a **member link** (play + view) and an **owner link** (everything, plus export and delete). Deleting a family requires typing a confirmation, and it's permanent.
- **What gets saved** (and only this): true statements from Spotlight (each with a per-statement "don't save this" opt-out), saved one-line stories, and game scores per member. Players are told at join when a room is family-linked. Room play itself is never recorded.
- **Why it matters:** it's the difference between "a fun website we used once" and "our family's game." Remember This? only exists because the link does.

Family pages are quiet, private-feeling pages — no marketing, no trackers or third-party scripts, `noindex` headers, `Referrer-Policy: no-referrer`. Design them like a private album, not like the show.

## 8. Brand and voice

**Name:** FamParty — *fam* + *party*. Friendly, obvious, a little bit silly. The wordmark should feel like it could be shouted across a room: "We're playing FamParty!"

**Personality:** a warm game-show host who is also your favourite cousin. Enthusiastic, never manic; inclusive, never saccharine; funny in the copy, never at a player's expense.

**Voice examples:**

| Say this | Not this |
|---|---|
| "You're in! Look at the big screen." | "Registration complete. Await host initiation." |
| "It fooled you!" | "Incorrect. 0 points awarded." |
| "Anyone with this link can get in — share it only with your family." | "Unauthenticated token-based access; treat as a bearer credential." |
| "Write something funny… or just true. True is funny here." | "Enter your response (max 80 chars)." |
| "Just watch" | "Spectator mode (non-scoring)" |

**Design territory to explore:** living-room warmth, game-show celebration, big joyful type, avatar-led identity. Think confetti moments and a winner's podium, not an arcade cabinet and not a board-game box.

**Avoid:**
- Looking or sounding like any existing game, game show, or TV format. Game *mechanics* are universal; names, catchphrases, set design, and visual identities must be our own. (This is also a legal line — e.g., the emoji game is "Emoji Decoder", never any trademarked drawing-game name.)
- Corporate/enterprise styling. Teams are welcome, but this is not a work tool that does parties; it's a party that works at work.
- Childish styling. Kids play, but adults host and pay attention. Aim "family Pixar", not "toddler app."
- Casino/neon/gambling cues, dark-pattern urgency, or anything that makes winning feel like the point over people.

## 9. Design requirements by surface

There are exactly four surfaces. A redesign should treat them as one system with four postures.

### 📺 TV display (`/tv`, `/tv/[code]`) — *10-foot UI*
- Readable from 3 metres: think billboard, not dashboard. If a sighted person across the room can't read it, it's too small.
- Shows **only** the show: QR + code in the lobby, the question/reveal, scores, podium. Never controls, never forms, never errors with instructions (route people to the host).
- Must stay legible with **12 players** on screen (chips, leaderboards, spectrum dots) — this is a hard test case, not an edge case.
- Timers are drawn from the server deadline; design them as calm drama, not anxiety. A paused game should look intentionally paused.
- The screen should keep itself awake (wake lock is already requested) and survive being cast from a laptop tab.

### 📱 Player phone (`/join`) — *thumb-first, one hand, mid-conversation*
- Join is one form: code (pre-filled by QR), name, avatar grid, one button. Big tap targets; nothing important below a scroll fold during play.
- During rounds: one decision per screen, enormous targets, instant "locked in" confirmation, then a relaxed waiting state that encourages looking up at the TV.
- Rejoining (refresh, lock/wake, new QR) must feel like nothing happened. No error modals for recoverable states — resume silently, message only when the room is truly gone or the host removed them.
- Free-text moments (Spotlight statements, Finish It answers) need honest character counts and a genuinely private feel: this screen is the only place a player's lie exists before the reveal.

### 🎛️ Host remote (`/host`, same phone the host is holding all night)
- Glanceable state ("Round 3 · 7/9 answered") and the **one next action** made obvious. The host is also talking to the room — controls must work half-looked-at.
- Full control set: create room, pick game, start, pause/resume, skip/reveal, next, back to lobby, lock room, hide a player's name/text on the TV, kick a player (available at any phase, not just the lobby).
- Destructive or embarrassing actions (kick, hide, delete) should be deliberate, reversible where possible (hide toggles), and never one stray tap away during a reveal.
- The host screen also carries the TV instructions ("On the TV, open …") because the host sets that up too.

### 👨‍👩‍👧 Family pages (`/family`, `/f/[token]`) — *private album posture*
- Creating a family shows the member and owner links **once, clearly**, with calm guidance to save the owner link. Losing it means losing delete/export — say so kindly.
- Roster management (add member: name + avatar; cumulative points), saved statements/stories list, past scores, export (JSON download), delete (typed confirmation).
- The privacy model is explained in one honest sentence, without scare tactics: the link is the only protection.

### Cross-surface states the design must cover
Lobby filling up · waiting on host · mid-round (answered / not yet) · paused · reveal · leaderboard movement · podium · a player marked "away" · room full · room expired · kicked · your content hidden by the host (should be silent — no player-facing signal) · family-linked room (saving notice at join) · "just watch" mode.

### Accessibility & inclusion
- Don't rely on colour alone: pair it with labels/icons (answer letters A–D already do this).
- Timers must never be the only path: the host can always pause; reading speed varies hugely across ages.
- Emoji are identity, not decoration — avatars must render at sizes where 🦊 vs 🐯 is unmistakable, and names always accompany avatars.
- Respect reduced-motion settings for celebration animation; celebration should be joyful, not flashing.

## 10. Content

- Games run on **content packs** (emoji rounds, spectrum pairs, prompts, statement starters) — short, original, family-safe, reviewed by a human before shipping. Quantity matters less than hit rate: a pack of duds kills a room.
- Pack art (title cards) is the only illustrated surface. Players' own words are never illustrated or decorated — their statements appear as clean text, credited by avatar.
- New packs and new games are the long-term content engine; the chassis (rooms, scoring, family memory) doesn't change when content does.

## 11. What success looks like

North star: **rooms that finish a game** — a room created, 3+ people in, a game completed, a podium shown.

Signals we care about, in order:
1. **Time from host landing to first round** (target: under a minute, including joins).
2. **Join completion rate** after scanning the QR code.
3. **Games per session** (did they immediately play another?).
4. **Family link creation and return visits** (did a saved statement bring them back?).
5. Host rescue actions (pause/skip/hide) used without the session dying — moderation working is a *good* signal.

Not optimised for: time-on-site, accounts created, anything involving ads or payments (non-goals for now).

## 12. Constraints a redesign must respect

- **Everything is server-driven and polled (~1s).** Screens render discrete phases, and a phase can change under the user between polls. Design transitions that tolerate a beat of latency; never fake realtime, and never block input waiting for the server during a round.
- **Four routes are the whole product:** `/host`, `/tv/[code]`, `/join`, `/f/[token]` (+ `/family` to create a link). No new top-level concepts without asking.
- **No third-party scripts, fonts, or trackers on family pages.** Self-hosted/system assets only there; keep the rest of the site as close to that as practical.
- **No accounts, payments, chat, or live AI generation** may sneak in via design. (Content is pre-generated offline and human-reviewed.)
- Game names, looks, and copy must stay original and generic — no resemblance to existing games or TV shows.

## 13. Open design questions (designer's call, PM will react)

- Light, warm living-room palette vs. evolving the current dark purple/orange "stage" look — which better survives a bright room and a cheap TV?
- How much motion/celebration can reveals carry before they slow the host's pace?
- Avatar system: emoji grid today. Is there a more ownable identity (generated characters, colour + creature) that stays instant for a grandparent to pick?
- What does the podium look like when the real prize is teasing rights until next time?

## 14. Current state & honest gaps

- All five games, the family link, roster, and Remember This? are built and playable on the live URL; the full test suite (unit + 13-client Playwright + family/Spotlight end-to-end) passes. See `CLAUDE.md` for architecture, review history, and verification commands.
- The current visual design is a functional placeholder (dark purple/orange cards, emoji identity) built to prove the engine. **A full visual redesign is wanted — that's the brief this README supports.** Keep routes, phases, and control inventories; everything visual is on the table.
- Known non-design gaps: production family data awaits a Neon database provision (local works today); the famparty.com domain is unregistered at time of writing; the real-device test pass (physical TV + phones, HDMI + casting, cellular) is still to be run before any public submission.

---

*Last updated for the Nov 4 submission build. Product owner: Lloyd. This is a private repo; do not change visibility without Lloyd's explicit approval.*
