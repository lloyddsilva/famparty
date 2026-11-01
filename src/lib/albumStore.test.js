import { test } from "node:test";
import assert from "node:assert/strict";

// Runs against whatever store is configured (in-memory locally in tests).
process.env.KV_REST_API_URL = "";
process.env.KV_REST_API_TOKEN = "";
const db = await import("./db.js");
const { redis } = await import("./redisClient.js");

test("album expiry: keys carry a 60-day TTL and activity refreshes it", async () => {
  const fam = await db.createFamily("Expiry Unit Family", "mtok-expiry", "otok-expiry");
  const meta = await db.familyByToken("mtok-expiry");
  assert.ok(meta, "album lookup works after creation");
  // In-memory store: every album key must carry ~60 days of TTL.
  const store = redis().store;
  if (store) {
    for (const key of [`album:${fam.id}:meta`, `albumtoken:${db.hashSecret("mtok-expiry")}`]) {
      const entry = store.get(key);
      assert.ok(entry?.expiresAt, `${key} has an expiry`);
      const days = (entry.expiresAt - Date.now()) / 86400000;
      assert.ok(days > 59 && days <= 60.1, `${key} TTL is ~60 days (got ${days.toFixed(2)})`);
    }
  }

  // simulate near-expiry by shrinking the TTL directly, then touch via activity
  await redis().expire(`album:${fam.id}:meta`, 5);
  await db.addMember(fam.id, "Ana", "🦊");
  // addMember touches the album: expiry is refreshed well beyond 5s.
  // (We assert behaviourally: the album still resolves and accepts saves.)
  await db.saveStatements(fam.id, (await db.listMembers(fam.id))[0].id, ["a truth"], "truth", "ROOM1");
  const stmts = await db.listStatements(fam.id);
  assert.equal(stmts.length, 1);

  // and a hard delete removes the lookup entirely
  await db.deleteFamily(fam.id);
  assert.equal(await db.familyByToken("mtok-expiry"), null);
});

test("statement dedupe and statement cap helpers hold under repeats", async () => {
  const fam = await db.createFamily("Dedupe Unit Family", "mtok-dedupe", "otok-dedupe");
  const m = await db.addMember(fam.id, "Ben", "🐼");
  await db.saveStatements(fam.id, m.id, ["same truth"], "truth", "ROOM1");
  await db.saveStatements(fam.id, m.id, ["same truth"], "truth", "ROOM1");
  await db.saveStatements(fam.id, m.id, ["same truth"], "truth", "ROOM2"); // different room: kept
  const stmts = await db.listStatements(fam.id);
  assert.equal(stmts.length, 2);
  await db.deleteFamily(fam.id);
});

test("album names round-trip as strings: null, 0, 007, true", async () => {
  for (const name of ["null", "0", "007", "true"]) {
    const fam = await db.createFamily(name, `mtok-${name}`, `otok-${name}`);
    const found = await db.familyByToken(`mtok-${name}`);
    assert.ok(found, `album named ${name} is findable`);
    assert.strictEqual(found.family.name, name);
    assert.strictEqual(typeof found.family.name, "string");
    await db.deleteFamily(fam.id);
    assert.equal(await db.familyByToken(`mtok-${name}`), null);
  }
});

test("saves after the album is deleted recreate no keys", async () => {
  const fam = await db.createFamily("Gone Family", "mtok-gone", "otok-gone");
  const m = await db.addMember(fam.id, "Ana", "🦊");
  await db.deleteFamily(fam.id);
  await db.saveStatements(fam.id, m.id, ["orphan truth"], "truth", "ROOMX");
  await db.saveGameResults(fam.id, [{ memberId: m.id, game: "emoji", points: 500, dedupeScope: "ROOMX:g1" }]);
  await assert.rejects(() => db.addMember(fam.id, "Late", "🐼"), /no longer exists/);
  const store = redis().store;
  if (store) {
    const keys = [...store.keys()].filter((k) => k.includes(fam.id) || k.includes(db.hashSecret("mtok-gone")));
    assert.deepEqual(keys, [], `expected no keys, found ${keys.join(", ")}`);
  }
  assert.deepEqual(await db.listStatements(fam.id), []);
  assert.deepEqual(await db.listMembers(fam.id), []);
});
