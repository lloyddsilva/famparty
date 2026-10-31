# Family Game Show — Emoji Pictionary

Jackbox-style party game: one big screen hosts, players join on phones with a 4-letter room code, pick an avatar, and guess emoji phrases. No accounts, no payments.

## Run

```bash
npm install
npm run dev    # http://localhost:3000
```

- Big screen (TV/laptop): open `/host`, create a room.
- Phones (same Wi-Fi for local play): open `/join` or the URL shown on the big screen, enter the code, pick an avatar.
- Host starts the show. 10 rounds, 20s per question, faster correct answers score more, streaks add bonus points.

## Stack & notes

- Next.js (App Router) UI + a custom Node server (`server.mjs`) running Socket.io — the server is authoritative for rooms, timers, answers, and scoring; clients only send inputs.
- State is in-memory and rooms are ephemeral (no database). Player/host refresh reconnects via tokens in `localStorage`.
- Deploy anywhere that supports a long-running Node server and WebSockets (Railway, Render, Fly.io, a VPS). It will **not** work as-is on Vercel serverless.
- Question bank lives in `src/lib/questions.js` — add rounds there.

## Next steps

- More game types (trivia, word scramble), host-configurable round count/timer
- QR code for the join URL in the lobby
- Persistent rooms / reconnection window cleanup, spectator mode
