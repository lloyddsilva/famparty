// Family albums in Redis (the same Upstash database as live rooms; in-memory
// stand-in locally). No second database, no SQL.
//
// Layout per album (every key expires 60 days after last activity, refreshed
// together by touchFamily):
//   album:{id}:meta       hash  name, createdAt, lastActiveAt, token hashes
//   album:{id}:members    hash  memberId -> JSON member
//   album:{id}:points     hash  memberId -> cumulative points (atomic HINCRBY)
//   album:{id}:statements hash  dedupeKey -> JSON statement (capped at 200)
//   album:{id}:results    hash  dedupeKey -> JSON result
//   albumtoken:{hash}     string albumId (member and owner lookups)
//
// Tokens are only ever stored hashed. Statement/result saves are single
// atomic hash writes (with a Lua cap check), so simultaneous saves can't
// lose or duplicate data.

import { createHash } from "node:crypto";
import { redis, usingMemoryStore } from "./redisClient.js";

export const RETENTION_MS = 60 * 24 * 60 * 60 * 1000;
const TTL_SECONDS = Math.floor(RETENTION_MS / 1000);
const STATEMENT_CAP = 200;

export const hashSecret = (v) => createHash("sha256").update(String(v || "")).digest("hex");
const id = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const metaKey = (fid) => `album:${fid}:meta`;
const membersKey = (fid) => `album:${fid}:members`;
const pointsKey = (fid) => `album:${fid}:points`;
const statementsKey = (fid) => `album:${fid}:statements`;
const resultsKey = (fid) => `album:${fid}:results`;
const tokenKey = (hash) => `albumtoken:${hash}`;
const allKeys = (fid, meta) => [
  metaKey(fid), membersKey(fid), pointsKey(fid), statementsKey(fid), resultsKey(fid),
  ...(meta ? [tokenKey(meta.memberTokenHash), tokenKey(meta.ownerTokenHash)] : []),
];

async function expireAll(fid, meta) {
  const r = redis();
  await Promise.all(allKeys(fid, meta).map((k) => r.expire(k, TTL_SECONDS)));
}

async function loadMeta(fid) {
  // Meta is stored as a single JSON string, never as separate hash fields:
  // Redis clients JSON-parse hash values, so a name like "null" or "007"
  // would change type (and existence checks on truthiness would break).
  const raw = await redis().get(metaKey(fid));
  if (!raw) return null;
  const meta = typeof raw === "string" ? JSON.parse(raw) : raw;
  return meta && typeof meta === "object" ? meta : null;
}

async function saveMeta(fid, meta) {
  await redis().set(metaKey(fid), JSON.stringify(meta));
}

export async function createFamily(name, memberToken, ownerToken) {
  const r = redis();
  const fid = id("fam");
  const now = Date.now();
  const meta = {
    name: String(name), createdAt: now, lastActiveAt: now,
    memberTokenHash: hashSecret(memberToken), ownerTokenHash: hashSecret(ownerToken),
  };
  await saveMeta(fid, meta);
  await r.set(tokenKey(meta.memberTokenHash), fid);
  await r.set(tokenKey(meta.ownerTokenHash), fid);
  await expireAll(fid, meta);
  return { id: fid, name, created_at: now };
}

export async function familyByToken(token) {
  const r = redis();
  const hash = hashSecret(token);
  const fid = await r.get(tokenKey(hash));
  if (!fid) return null;
  const meta = await loadMeta(fid);
  if (!meta) return null;
  const access = hash === meta.memberTokenHash ? "member" : hash === meta.ownerTokenHash ? "owner" : null;
  if (!access) return null;
  return {
    family: { id: fid, name: String(meta.name), created_at: Number(meta.createdAt), last_active_at: Number(meta.lastActiveAt) },
    access,
  };
}

export async function touchFamily(familyId) {
  if (!familyId) return;
  const r = redis();
  const meta = await loadMeta(familyId);
  if (!meta) return;
  await saveMeta(familyId, { ...meta, lastActiveAt: Date.now() });
  await expireAll(familyId, meta);
}

export async function listMembers(familyId) {
  const r = redis();
  const [members, points] = await Promise.all([r.hgetall(membersKey(familyId)), r.hgetall(pointsKey(familyId))]);
  if (!members) return [];
  return Object.values(members)
    .map((raw) => { const m = typeof raw === "string" ? JSON.parse(raw) : raw; return { ...m, total_points: Number(points?.[m.id] || 0) }; })
    .sort((a, b) => a.created_at - b.created_at);
}

const MEMBER_LUA = `
if redis.call('EXISTS', KEYS[2]) == 0 then return -2 end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
return 1
`;

export async function addMember(familyId, name, avatar) {
  const r = redis();
  const m = { id: id("mem"), family_id: familyId, name, avatar, created_at: Date.now() };
  const res = await r.eval(MEMBER_LUA, [membersKey(familyId), metaKey(familyId)], [m.id, JSON.stringify(m), String(TTL_SECONDS)]);
  if (res === -2) {
    const e = new Error("This album no longer exists.");
    e.status = 404;
    throw e;
  }
  await touchFamily(familyId);
  return m;
}

export async function getMember(familyId, memberId) {
  const all = await listMembers(familyId);
  return all.find((m) => m.id === memberId) || null;
}

const SAVE_LUA = `
if redis.call('EXISTS', KEYS[2]) == 0 then return -2 end
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return 0 end
if redis.call('HLEN', KEYS[1]) >= tonumber(ARGV[3]) then return -1 end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[4]))
return 1
`;

export async function saveStatements(familyId, memberId, texts, kind = "truth", roomCode = "") {
  if (!familyId || !memberId || !texts?.length) return;
  const r = redis();
  for (const text of texts) {
    const dedupe = `${familyId}:${memberId}:${kind}:${roomCode}:${text}`;
    const stmt = { id: id("st"), family_id: familyId, member_id: memberId, text, kind, room_code: roomCode, created_at: Date.now() };
    await r.eval(SAVE_LUA, [statementsKey(familyId), metaKey(familyId)], [dedupe, JSON.stringify(stmt), String(STATEMENT_CAP), String(TTL_SECONDS)]);
  }
  await touchFamily(familyId);
}

export async function listStatements(familyId, limit = 100) {
  const r = redis();
  const [stmts, members] = await Promise.all([r.hgetall(statementsKey(familyId)), r.hgetall(membersKey(familyId))]);
  if (!stmts) return [];
  const byId = {};
  for (const raw of Object.values(members || {})) { const m = typeof raw === "string" ? JSON.parse(raw) : raw; byId[m.id] = m; }
  return Object.values(stmts)
    .map((raw) => (typeof raw === "string" ? JSON.parse(raw) : raw))
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit)
    .map((s) => ({ ...s, writer_name: byId[s.member_id]?.name || "Someone", writer_avatar: byId[s.member_id]?.avatar || "🦊" }));
}

export async function trueStatementsForGame(familyId) {
  const rows = await listStatements(familyId, 200);
  return rows.filter((r) => r.kind === "truth")
    .map((r) => ({ id: r.id, text: r.text, writerMemberId: r.member_id, writerName: r.writer_name, roomCode: r.room_code || null }));
}

const RESULT_LUA = `
if redis.call('EXISTS', KEYS[3]) == 0 then return -2 end
local added = redis.call('HSETNX', KEYS[1], ARGV[1], ARGV[2])
if added == 1 then
  redis.call('HINCRBY', KEYS[2], ARGV[3], tonumber(ARGV[4]))
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))
  redis.call('EXPIRE', KEYS[2], tonumber(ARGV[5]))
end
return added
`;

export async function saveGameResults(familyId, results) {
  if (!familyId || !results?.length) return;
  const r = redis();
  for (const res of results) {
    if (!res.memberId || !res.points) continue;
    const dedupe = `${familyId}:${res.memberId}:${res.game}:${res.dedupeScope || ""}:${res.points}`;
    await r.eval(RESULT_LUA, [resultsKey(familyId), pointsKey(familyId), metaKey(familyId)], [dedupe, JSON.stringify({
      id: id("gr"), family_id: familyId, member_id: res.memberId, game: res.game, points: res.points, played_at: Date.now(),
    }), res.memberId, String(res.points), String(TTL_SECONDS)]);
  }
  await touchFamily(familyId);
}

export async function exportFamily(familyId) {
  const r = redis();
  const meta = await loadMeta(familyId);
  if (!meta) return null;
  const [members, points, stmts, results] = await Promise.all([
    r.hgetall(membersKey(familyId)), r.hgetall(pointsKey(familyId)),
    r.hgetall(statementsKey(familyId)), r.hgetall(resultsKey(familyId)),
  ]);
  const parse = (obj) => Object.values(obj || {}).map((raw) => (typeof raw === "string" ? JSON.parse(raw) : raw));
  return {
    family: { id: familyId, name: String(meta.name), created_at: Number(meta.createdAt) },
    members: parse(members).map((m) => ({ ...m, total_points: Number(points?.[m.id] || 0) })),
    statements: parse(stmts),
    results: parse(results),
  };
}

export async function deleteFamily(familyId) {
  const r = redis();
  const meta = await loadMeta(familyId);
  await r.del(...allKeys(familyId, meta));
}

/** Readiness probe for /api/health/db. Reports the album store, never content. */
export async function dbHealth() {
  try {
    const pong = await redis().ping();
    const memory = usingMemoryStore();
    return {
      ok: pong === "PONG",
      configured: !memory,
      backend: memory ? "memory-local" : "upstash-redis",
    };
  } catch (e) {
    return { ok: false, configured: !usingMemoryStore(), backend: "unreachable", code: e?.code || "REDIS_UNAVAILABLE" };
  }
}
