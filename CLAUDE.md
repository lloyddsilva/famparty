# FamParty — notes for Claude (reviewer)

Private repo (do not change visibility without Lloyd's explicit approval; a full
history scan for secrets/real family data gates going public). GitHub and Vercel
accounts are both **lloyddsilva**; commits as `lloyddsilva@gmail.com` (repo-local
config). Production: https://famparty-lloyd-dsilvas-projects.vercel.app
(Vercel **Hobby** plan, project `lloyd-dsilvas-projects/famparty`).

## Hard rules
- **No live model calls, no model keys at runtime.** Content is meant to be
  generated once offline (`scripts/generate-content.mjs`, key from env only),
  human-reviewed, and committed. **That run has not happened yet:** the packs in
  `src/lib/packs.js` are hand-written starter placeholders with
  `reviewed: false`, and `npm run check:packs` correctly fails on them (the
  gate was deliberately proven by flipping a flag; it is not wired into
  `npm run build` while packs are unreviewed). Do not submit until the Spark/
  Image run and Lloyd's review flip them.
- No custom server, no WebSockets without asking Lloyd. State via polling.

## Architecture
- Next.js ~16.4, React 19, Tailwind v4, JS (no TS mid-event), Route Handlers.
- Rooms in **Upstash Redis** (Vercel Marketplace, `KV_REST_API_*` env): room JSON
  at `room:{code}` (2h TTL), mutated only via CAS Lua on `version`
  (`src/lib/roomStore.js`). Answers are per-player hash fields at
  `room:{code}:answers:{roundId}` storing `{choice, at}`.
- Pure engine `(state, action, now) => state` in `src/lib/engine.js`; scoring in
  `src/lib/scoring.js`. **Emoji scores are computed once at reveal from the
  answers hash** (`scoreEmojiReveal`) — never booked per answer. Timers: deadline
  lives in state; any poll/action after it advances via the same CAS.
- Polling: 1s, `?v=<version>` unchanged fast path (responses include fresh
  presence), player token in `x-room-token` header, host token only on actions,
  presence writes throttled to ~5s, polling pauses when hidden.
- Host actions send `expectedPhase`; the server 409s on mismatch
  (`assertExpectedPhase`). TV (`/tv/[code]`) is display-only with QR + code and a
  wake lock; host remote is `/host`; players `/join`.
- Family data (Nov 2): Neon Postgres in prod / PGLite locally (`.pglite`), same
  SQL in `src/lib/db.js`. Family link = unguessable token stored hashed; member
  link (play/view) vs owner link (export/delete, typed `DELETE` confirmation).
  Rooms created from a family are linked; joining via roster attaches scores and
  authorship to **members**. Spotlight truths (per-statement opt-out) and finale
  scores are written asynchronously at round end via `after()`. Family pages send
  `X-Robots-Tag: noindex` header only + `Referrer-Policy: no-referrer`, no
  third-party scripts.
- Games: Emoji Decoder, Spotlight (prep phase; start-anyway => just-watch; 30s
  talk-first story beat, optional one-line save after), Spectrum (placement +
  majority prediction), Finish It (anonymous vote, no self-vote, duplicates match
  only on normalized exact text), Remember This? (saved truths only; writer
  cannot score). 3–12 players. Host can hide any player's name/text on TV or
  kick at any phase; names pass a word filter; joins are rate-limited per IP+room
  *and* per IP globally (12 phones share one home IP — keep limits generous).

## Verify
```bash
npm test                                   # pure engine/scoring (node:test)
npm run build                              # includes the pack gate
npx playwright test                        # 13-client game + family/Spotlight/Remember (needs dev server + Redis env)
npm run dev                                # then http://localhost:3000
curl https://famparty-lloyd-dsilvas-projects.vercel.app/api/health   # build marker = commit sha
vercel ls famparty                         # confirm deployment Ready — a push may not deploy (GitHub app not connected; deploys are via CLI)
```

## Review history
- `780757c` review (Claude): items 1–10 fixed with regression tests —
  reveal-time scoring, no score-booking CAS contention, saved-credential
  recovery + `?code=` priority, expectedPhase guard, per-game `roundId` answer
  keys, global join limit, room-creation + host-action limits, tokens out of
  URLs, 1s polling + presence in unchanged responses, name filter + kick/hide at
  any phase. One fix found by the 13-client run: Upstash returns hash values
  pre-deserialized, so `loadAnswers` handles object values (`roomStore.js`).

## Outstanding / open questions for Lloyd
- Real-device milestone (1 TV + 3 phones, HDMI + cast tab, lock/wake, cellular,
  redeploy mid-game) still needs physical devices.
- Neon must be provisioned under lloyddsilva (Vercel Marketplace) and
  `DATABASE_URL` set for production family data; locally PGLite is used.
- `famparty.com` domain/trademark — parked, must not block anything.
- Content packs are unreviewed starter placeholders (see Hard rules); Lloyd's
  human review after the Muse Spark/Image run is the shipping gate.
- README review (Claude, of `40ffc3e`): Spectrum awards and the host-paced
  Finish It reveal were built to match the (previously aspirational) README;
  hidden Finish It answers are now masked on TV at vote and reveal; README
  claims about packs, test coverage, production family features, and
  reconnects were corrected to match reality.
- First commit `3569eba` used a `users.noreply` email (pre-dates the gmail
  instruction); all later commits use `lloyddsilva@gmail.com`.
