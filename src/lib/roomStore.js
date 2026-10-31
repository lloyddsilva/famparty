// Room state in Upstash Redis. No game state in module-level variables —
// every read/write goes to Redis so any Vercel instance can serve any poll.
//
// - Room JSON lives at room:{code} with a TTL, and carries a `version`.
// - Every mutation goes through a compare-and-set Lua script on that version.
// - Answers/votes are separate hash fields (room:{code}:answers:{round}) so
//   12 simultaneous submissions never overwrite each other.

import { Redis } from "@upstash/redis";
import { ROOM_TTL_SECONDS } from "./engine.js";

let client;
export function redis() {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    const err = new Error("Redis is not configured. Provision Upstash via the Vercel Marketplace and pull env vars (vercel env pull).");
    err.code = "NO_REDIS";
    throw err;
  }
  client = new Redis({ url, token });
  return client;
}

const roomKey = (code) => `room:${code}`;
export const answersKey = (code, round) => `room:${code}:answers:${round}`;
const presenceKey = (code) => `room:${code}:presence`;

const CAS_LUA = `
local raw = redis.call('GET', KEYS[1])
if not raw then return -1 end
local cur = cjson.decode(raw)
if cur['version'] ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', tonumber(ARGV[3]))
return 1
`;

export async function createRoom(state) {
  const ok = await redis().set(roomKey(state.code), JSON.stringify(state), { nx: true, ex: ROOM_TTL_SECONDS });
  return !!ok;
}

export async function loadRoom(code) {
  const raw = await redis().get(roomKey(code));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/**
 * mutate(state, ctx) -> { state, effects?, error? } | null (no change).
 * Retries on version conflict. Returns { state, error? }.
 */
export async function casUpdate(code, mutate, ctx = {}) {
  const r = redis();
  for (let attempt = 0; attempt < 6; attempt++) {
    const state = await loadRoom(code);
    if (!state) return { state: null, error: "Room not found or expired." };
    const out = mutate(state, ctx);
    if (!out || out.error) return { state, error: out?.error };
    if (out.state === state) return { state };
    const next = { ...out.state, version: state.version + 1 };
    const res = await r.eval(CAS_LUA, [roomKey(code)], [String(state.version), JSON.stringify(next), String(ROOM_TTL_SECONDS)]);
    if (res === 1) {
      if (out.effects?.clearAnswers) await r.del(answersKey(code, next.qIndex));
      if (out.effects?.removeAnswerFor) await r.hdel(answersKey(code, next.qIndex), out.effects.removeAnswerFor);
      return { state: next };
    }
    if (res === -1) return { state: null, error: "Room not found or expired." };
    // conflict: another writer won — reload and retry
  }
  return { state: null, error: "Room is busy. Try again." };
}

export async function recordAnswer(code, round, playerId, choice) {
  // One hash field per player: simultaneous answers cannot conflict.
  const added = await redis().hsetnx(answersKey(code, round), playerId, String(choice));
  if (added) await redis().expire(answersKey(code, round), ROOM_TTL_SECONDS);
  return !!added;
}

export async function loadAnswers(code, round) {
  const obj = await redis().hgetall(answersKey(code, round));
  if (!obj) return {};
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Number(v)]));
}

export async function touchPresence(code, playerId) {
  const r = redis();
  await r.hset(presenceKey(code), { [playerId]: String(Date.now()) });
  await r.expire(presenceKey(code), ROOM_TTL_SECONDS);
}

export async function loadPresence(code) {
  const obj = await redis().hgetall(presenceKey(code));
  if (!obj) return {};
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Number(v)]));
}

/** Generous per-IP+room limits: a whole family on one Wi-Fi must still get in. */
export async function rateLimit(bucket, limit, windowSeconds) {
  const r = redis();
  const key = `rl:${bucket}`;
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, windowSeconds);
  return count <= limit;
}
