// The one Redis client for the whole app (rooms + albums).
// Production/dev with KV_REST_API_URL set: Upstash. Without it (local dev,
// tests): an in-memory stand-in implementing the same command surface,
// including compare-and-set and expiry, so the full app runs offline.

import { Redis } from "@upstash/redis";

// The Upstash client JSON-deserialises values on read: a stored string
// "null" comes back as null, "007" as 7, "true" as true. The stand-in must
// do the same or whole classes of bug (album names!) stay invisible locally.
function deserialize(v) {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (!s) return v;
  if (s === "null") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    try { return JSON.parse(s); } catch { return v; }
  }
  if (s.startsWith('"') && s.endsWith('"')) { try { return JSON.parse(s); } catch { return v; } }
  return v;
}

class MemoryRedis {
  constructor() {
    this.store = new Map(); // key -> { kind: 'string'|'hash', value, expiresAt }
  }
  _live(key) {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.expiresAt && Date.now() > e.expiresAt) { this.store.delete(key); return null; }
    return e;
  }
  _setEntry(key, kind, value, exSeconds) {
    const prev = this._live(key);
    this.store.set(key, { kind, value, expiresAt: exSeconds ? Date.now() + exSeconds * 1000 : prev?.expiresAt ?? null });
  }
  async get(key) {
    const e = this._live(key);
    return e && e.kind === "string" ? deserialize(e.value) : null;
  }
  async set(key, value, opts = {}) {
    if (opts.nx && this._live(key)) return null;
    this._setEntry(key, "string", String(value), opts.ex);
    return "OK";
  }
  async del(...keys) {
    let n = 0;
    for (const k of keys.flat()) if (this.store.delete(k)) n++;
    return n;
  }
  async expire(key, seconds) {
    const e = this._live(key);
    if (!e) return 0;
    e.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }
  async incr(key) {
    const e = this._live(key);
    const next = (e ? parseInt(e.value, 10) || 0 : 0) + 1;
    this._setEntry(key, "string", String(next));
    return next;
  }
  async hgetall(key) {
    const e = this._live(key);
    if (!e || e.kind !== "hash") return null;
    return Object.fromEntries(Object.entries(e.value).map(([f, v]) => [f, deserialize(v)]));
  }
  async hset(key, obj) {
    const e = this._live(key);
    const value = e && e.kind === "hash" ? { ...e.value } : {};
    for (const [f, v] of Object.entries(obj)) value[f] = String(v);
    this._setEntry(key, "hash", value);
    return Object.keys(obj).length;
  }
  async hsetnx(key, field, value) {
    const e = this._live(key);
    const hash = e && e.kind === "hash" ? { ...e.value } : {};
    if (field in hash) return 0;
    hash[field] = String(value);
    this._setEntry(key, "hash", hash);
    return 1;
  }
  async hdel(key, field) {
    const e = this._live(key);
    if (!e || e.kind !== "hash" || !(field in e.value)) return 0;
    const value = { ...e.value };
    delete value[field];
    this._setEntry(key, "hash", value);
    return 1;
  }
  async hincrby(key, field, by) {
    const e = this._live(key);
    const hash = e && e.kind === "hash" ? { ...e.value } : {};
    hash[field] = String((parseInt(hash[field], 10) || 0) + by);
    this._setEntry(key, "hash", hash);
    return parseInt(hash[field], 10);
  }
  async ping() { return "PONG"; }
  async eval(script, keys, args) {
    // The app uses a few Lua scripts; emulate them faithfully.
    if (script.includes("HINCRBY")) {
      // atomic result save: album must exist, dedupe, points in the same step
      const [resultsKey, pointsKey, metaKey] = keys;
      const [field, value, memberId, points, ttl] = args;
      if (!this._live(metaKey)) return -2;
      const added = await this.hsetnx(resultsKey, field, value);
      if (added) {
        await this.hincrby(pointsKey, memberId, Number(points));
        await this.expire(resultsKey, Number(ttl));
        await this.expire(pointsKey, Number(ttl));
      }
      return added;
    }
    if (script.includes("EXISTS") && script.includes("HSET")) {
      // atomic statement/member save guarded by album existence
      const [hashKey, metaKey] = keys;
      if (!this._live(metaKey)) return -2;
      if (script.includes("HLEN")) {
        const [field, value, cap, ttl] = args;
        const e = this._live(hashKey);
        const hash = e && e.kind === "hash" ? { ...e.value } : {};
        if (field in hash) return 0;
        if (Object.keys(hash).length >= Number(cap)) return -1;
        hash[field] = value;
        this._setEntry(hashKey, "hash", hash);
        await this.expire(hashKey, Number(ttl));
        return 1;
      }
      const [field, value, ttl] = args;
      await this.hset(hashKey, { [field]: value });
      await this.expire(hashKey, Number(ttl));
      return 1;
    }
    if (script.includes("cjson")) {
      // CAS on a versioned JSON value (roomStore)
      const [key] = keys;
      const [expectedVersion, json, ttl] = args;
      // Lua sees the raw stored string, not the deserialized value.
      const entry = this._live(key);
      const raw = entry ? entry.value : null;
      if (raw === null) return -1;
      let cur;
      try { cur = JSON.parse(raw); } catch { return 0; }
      if (cur.version !== Number(expectedVersion)) return 0;
      this._setEntry(key, "string", json, Number(ttl));
      return 1;
    }
    if (script.includes("HEXISTS")) {
      // capped, deduped statement save (album store)
      const [key, capKey] = keys;
      const [field, value, cap] = args;
      const e = this._live(key);
      const hash = e && e.kind === "hash" ? { ...e.value } : {};
      if (field in hash) return 0;
      if (Object.keys(hash).length >= Number(cap)) return -1;
      hash[field] = value;
      this._setEntry(key, "hash", hash);
      return 1;
    }
    throw new Error("MemoryRedis: unsupported Lua script");
  }
}

let client;
let memory = false;

export function redis() {
  if (client) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  // Remote Redis only on a real deployment (VERCEL) or with an explicit opt-in.
  // Local dev and tests use memory even if .env.local carries production
  // values — that sharing caused real damage control earlier.
  const allowRemote = !!process.env.VERCEL || process.env.ALLOW_REMOTE_REDIS === "1";
  if (url && token && allowRemote) {
    client = new Redis({ url, token });
  } else if (process.env.VERCEL) {
    // A real deployment without its data store must fail loudly, never
    // silently fall back to per-instance memory.
    const err = new Error("Redis is not configured (KV_REST_API_URL / KV_REST_API_TOKEN missing).");
    err.code = "NO_REDIS";
    throw err;
  } else {
    memory = true;
    // Next.js loads route bundles as separate module copies in one process;
    // the stand-in must be a process-wide singleton or routes won't share data.
    if (!globalThis.__fampartyMemoryRedis) globalThis.__fampartyMemoryRedis = new MemoryRedis();
    client = globalThis.__fampartyMemoryRedis;
  }
  return client;
}

export const usingMemoryStore = () => {
  redis();
  return memory;
};
