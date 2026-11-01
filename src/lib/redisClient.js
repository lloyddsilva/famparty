// The one Redis client for the whole app (rooms + albums).
// Production/dev with KV_REST_API_URL set: Upstash. Without it (local dev,
// tests): an in-memory stand-in implementing the same command surface,
// including compare-and-set and expiry, so the full app runs offline.

import { Redis } from "@upstash/redis";

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
    return e && e.kind === "string" ? e.value : null;
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
    return e && e.kind === "hash" ? { ...e.value } : null;
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
    // The app uses two Lua scripts; emulate both faithfully.
    if (script.includes("cjson")) {
      // CAS on a versioned JSON value (roomStore)
      const [key] = keys;
      const [expectedVersion, json, ttl] = args;
      const raw = await this.get(key);
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
  if (url && token) {
    client = new Redis({ url, token });
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
