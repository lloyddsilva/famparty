// Family data: Neon Postgres in production (DATABASE_URL), PGLite locally — same SQL.
// This is a data-store client, not game state: room state lives only in Redis.

import { createHash } from "node:crypto";

let implPromise = null;
function dbUnavailable(cause) {
  const e = new Error("Family saving is temporarily unavailable. Games still work — try the family link again later.");
  e.code = "DB_UNAVAILABLE";
  e.cause = cause;
  return e;
}

async function getImpl() {
  if (implPromise) return implPromise;
  implPromise = (async () => {
    try { return await initImpl(); } catch (e) { implPromise = null; throw e?.code === "DB_UNAVAILABLE" ? e : dbUnavailable(e); }
  })();
  return implPromise;
}

async function initImpl() {
  return (async () => {
    let rawQuery;
    if (process.env.DATABASE_URL) {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); // sslmode=require comes from the Neon URL; no rejectUnauthorized override
      rawQuery = async (sql, params = []) => (await pool.query(sql, params)).rows;
    } else {
      const { PGlite } = await import("@electric-sql/pglite");
      const db = new PGlite(process.env.PGLITE_DIR || ".pglite");
      rawQuery = async (sql, params = []) => (await db.query(sql, params)).rows;
    }
    const query = async (sql, params = []) => {
      try { return await rawQuery(sql, params); }
      catch (e) { throw dbUnavailable(e); }
    };
    await query(`CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      member_token_hash TEXT UNIQUE NOT NULL, owner_token_hash TEXT UNIQUE NOT NULL,
      created_at BIGINT NOT NULL)`);
    await query(`CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY, family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      name TEXT NOT NULL, avatar TEXT NOT NULL, created_at BIGINT NOT NULL)`);
    await query(`CREATE TABLE IF NOT EXISTS saved_statements (
      id TEXT PRIMARY KEY, family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      member_id TEXT NOT NULL, text TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'truth',
      created_at BIGINT NOT NULL)`);
    // Idempotency: a statement/result can be scheduled by more than one caller
    // (host action + expiry poll); the dedupe key makes repeats no-ops.
    try { await query(`ALTER TABLE saved_statements ADD COLUMN dedupe_key TEXT`); } catch {}
    try { await query(`CREATE UNIQUE INDEX IF NOT EXISTS saved_statements_dedupe ON saved_statements(dedupe_key)`); } catch {}
    try { await query(`ALTER TABLE game_results ADD COLUMN dedupe_key TEXT`); } catch {}
    try { await query(`CREATE UNIQUE INDEX IF NOT EXISTS game_results_dedupe ON game_results(dedupe_key)`); } catch {}
    await query(`CREATE TABLE IF NOT EXISTS game_results (
      id TEXT PRIMARY KEY, family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      member_id TEXT NOT NULL, game TEXT NOT NULL, points INTEGER NOT NULL, played_at BIGINT NOT NULL)`);
    return { query };
  })();
  return implPromise;
}

/** Read-only readiness probe. Reports configuration, never content or credentials. */
export async function dbHealth() {
  const configured = !!process.env.DATABASE_URL;
  if (process.env.VERCEL && !configured) return { ok: false, configured: false, backend: "none" };
  try {
    const { query } = await getImpl();
    await query(`SELECT 1 AS one`);
    return { ok: true, configured, backend: configured ? "postgres" : "pglite-local" };
  } catch (e) {
    return { ok: false, configured, backend: configured ? "postgres" : "pglite-local", code: e?.code || "DB_UNAVAILABLE" };
  }
}

export const hashSecret = (v) => createHash("sha256").update(String(v || "")).digest("hex");
const id = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export async function createFamily(name, memberToken, ownerToken) {
  const { query } = await getImpl();
  const fam = { id: id("fam"), name, created_at: Date.now() };
  await query(`INSERT INTO families (id, name, member_token_hash, owner_token_hash, created_at) VALUES ($1,$2,$3,$4,$5)`,
    [fam.id, fam.name, hashSecret(memberToken), hashSecret(ownerToken), fam.created_at]);
  return fam;
}

/** Returns { family, access: 'member'|'owner' } or null. */
export async function familyByToken(token) {
  const { query } = await getImpl();
  const h = hashSecret(token);
  let rows = await query(`SELECT * FROM families WHERE member_token_hash=$1`, [h]);
  if (rows[0]) return { family: rows[0], access: "member" };
  rows = await query(`SELECT * FROM families WHERE owner_token_hash=$1`, [h]);
  if (rows[0]) return { family: rows[0], access: "owner" };
  return null;
}

export async function listMembers(familyId) {
  const { query } = await getImpl();
  return query(`SELECT m.*, COALESCE((SELECT SUM(points) FROM game_results g WHERE g.member_id=m.id),0) AS total_points
    FROM members m WHERE m.family_id=$1 ORDER BY m.created_at`, [familyId]);
}

export async function addMember(familyId, name, avatar) {
  const { query } = await getImpl();
  const m = { id: id("mem"), name, avatar };
  await query(`INSERT INTO members (id, family_id, name, avatar, created_at) VALUES ($1,$2,$3,$4,$5)`,
    [m.id, familyId, name, avatar, Date.now()]);
  return m;
}

export async function getMember(familyId, memberId) {
  const { query } = await getImpl();
  const rows = await query(`SELECT * FROM members WHERE family_id=$1 AND id=$2`, [familyId, memberId]);
  return rows[0] || null;
}

export async function saveStatements(familyId, memberId, texts, kind = "truth", dedupeScope = "") {
  if (!familyId || !memberId || !texts?.length) return;
  const { query } = await getImpl();
  for (const text of texts) {
    const dedupe = `${familyId}:${memberId}:${kind}:${dedupeScope}:${text}`;
    await query(`INSERT INTO saved_statements (id, family_id, member_id, text, kind, created_at, dedupe_key) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (dedupe_key) DO NOTHING`,
      [id("st"), familyId, memberId, text, kind, Date.now(), dedupe]);
  }
}

export async function listStatements(familyId, limit = 100) {
  const { query } = await getImpl();
  return query(`SELECT s.*, m.name AS writer_name, m.avatar AS writer_avatar FROM saved_statements s
    JOIN members m ON m.id=s.member_id WHERE s.family_id=$1 ORDER BY s.created_at DESC LIMIT $2`, [familyId, limit]);
}

export async function trueStatementsForGame(familyId, limit = 10) {
  const rows = await listStatements(familyId, 200);
  return rows.filter((r) => r.kind === "truth")
    .map((r) => ({ id: r.id, text: r.text, writerMemberId: r.member_id, writerName: r.writer_name }));
}

export async function saveGameResults(familyId, results) {
  if (!familyId || !results?.length) return;
  const { query } = await getImpl();
  for (const r of results) {
    if (!r.memberId || !r.points) continue;
    const dedupe = `${familyId}:${r.memberId}:${r.game}:${r.dedupeScope || ""}:${r.points}`;
    await query(`INSERT INTO game_results (id, family_id, member_id, game, points, played_at, dedupe_key) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (dedupe_key) DO NOTHING`,
      [id("gr"), familyId, r.memberId, r.game, r.points, Date.now(), dedupe]);
  }
}

export async function exportFamily(familyId) {
  const { query } = await getImpl();
  const [family, members, statements, results] = await Promise.all([
    query(`SELECT id, name, created_at FROM families WHERE id=$1`, [familyId]),
    query(`SELECT * FROM members WHERE family_id=$1`, [familyId]),
    query(`SELECT * FROM saved_statements WHERE family_id=$1`, [familyId]),
    query(`SELECT * FROM game_results WHERE family_id=$1`, [familyId]),
  ]);
  return { family: family[0], members, statements, results };
}

export async function deleteFamily(familyId) {
  const { query } = await getImpl();
  await query(`DELETE FROM saved_statements WHERE family_id=$1`, [familyId]);
  await query(`DELETE FROM game_results WHERE family_id=$1`, [familyId]);
  await query(`DELETE FROM members WHERE family_id=$1`, [familyId]);
  await query(`DELETE FROM families WHERE id=$1`, [familyId]);
}
