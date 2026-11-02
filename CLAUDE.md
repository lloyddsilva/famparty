# FamParty — notes for Claude (reviewer)

Private repo (do not change visibility without Lloyd's explicit approval; a full
history scan for secrets/real family data gates going public). GitHub and Vercel
accounts are both **lloyddsilva**; commits as `lloyddsilva@gmail.com` (repo-local
config). Production: https://famparty.vercel.app
(Vercel **Hobby** plan, project `lloyd-dsilvas-projects/famparty`).

## Hard rules
- **No live model calls, no model keys at runtime.** Content is meant to be
  generated once offline (`scripts/generate-content.mjs`, key from env only),
  human-reviewed, and committed. **That run has happened:** the packs in
  `src/lib/packs.js` were generated offline with Muse Spark 1.3 and Muse
  Image 1.0, then edited with Muse in OpenCode, and reviewed by Lloyd;
  they are marked `reviewed: true` as his recorded decision (raw outputs and
  review list in `content/`). Not verbatim model output; not tested with
  real people.
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
- Family albums: **Redis-backed** in `src/lib/db.js` (same Upstash database
  as rooms; no second database). Album keys (`album:{id}:*`, `albumtoken:{hash}`)
  all carry a 60-day expiry refreshed by activity; statement saves are atomic
  capped hash writes, points use HINCRBY. Locally, with no `KV_REST_API_URL`,
  `src/lib/redisClient.js` provides an in-memory stand-in (CAS + expiry
  included) so dev and Playwright run offline. Album = unguessable token stored hashed; member
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

## Environment variables (Vercel)
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Upstash (Marketplace). The only
  data service: rooms and albums both live here. Locally, leave them unset
  (or blank them in `.env.development.local`) to use the in-memory stand-in.
- Playwright refuses production targets unless `ALLOW_PROD_E2E=1`.
- Local test servers may set `FAMPARTY_TEST_ROOM_LIMIT` to raise the
  rooms/hour cap for suites; the code ignores it on Vercel.
- The Neon integration and its env vars are unused since the Redis album
  store landed; Lloyd will remove the integration himself. Do not delete it.

## Verify
```bash
npm test                                   # pure engine/scoring (node:test)
npm run build                              # includes the pack gate
npx playwright test                        # 13-client game + family/Spotlight/Remember (needs dev server + Redis env)
npm run dev                                # then http://localhost:3000
curl https://famparty.vercel.app/api/health   # build marker = commit sha
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

## Known gaps (accepted for the hackathon)
- Remember This? only deals statements whose writer is in the current room
  (otherwise there would be no right answer). Roster-based choices that can
  include absent writers are a post-hackathon improvement.
- Polling cost (measured Oct 31, production, 14 clients = TV + host + 12
  players at 1s): a fast-played 10-round game (40s) used 602 function
  invocations; a realistic ~6-minute social game extrapolates to ~5,300
  invocations and ~16K Redis commands (modelled from code paths; Upstash INFO
  totals are per-replica and non-monotonic, so they can't be diffed). Hobby
  includes 1M function invocations/month (~190 such games) and Upstash Free
  500K commands/month (~30 such games) — Redis commands are the binding limit.

## Outstanding / open questions for Lloyd
- Real-device milestone (1 TV + 3 phones, HDMI + cast tab, lock/wake, cellular,
  redeploy mid-game) still needs physical devices.
- Albums live in Redis with automatic 60-day expiry (no purge job). The
  separate-Redis-for-tests backlog item is closed by the in-memory stand-in.
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
