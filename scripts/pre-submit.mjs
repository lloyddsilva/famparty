// Pre-submit gate. The normal build stays green while content is in draft, but
// a submission is NOT ready until this passes:
//   npm run pre-submit
// It fails on: unreviewed content packs, no production database configured,
// or a demo URL that doesn't answer with a build marker.

import { readFileSync, existsSync } from "node:fs";
import { ALL_PACKS } from "../src/lib/packs.js";

const failures = [];

// 1. packs reviewed
const unreviewed = ALL_PACKS.filter((p) => !p.reviewed).map((p) => p.id);
if (unreviewed.length) failures.push(`Unreviewed content packs: ${unreviewed.join(", ")} (Lloyd's human review after the Muse Spark/Image run)`);

// 2. production database configured (Neon via DATABASE_URL)
let envText = "";
for (const f of [".env.local", ".env.production.local"]) {
  if (existsSync(f)) envText += readFileSync(f, "utf8");
}
const hasDbEnv = /^DATABASE_URL=.+/m.test(envText) || !!process.env.DATABASE_URL;
if (!hasDbEnv) failures.push("No DATABASE_URL found — production family data (Neon) is not connected, so the family link fails live.");

// 3. demo URL alive with a build marker
const demoUrl = process.env.DEMO_URL || "https://famparty.vercel.app";
try {
  const res = await fetch(`${demoUrl}/api/health`, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  if (!data.ok || !data.build) failures.push(`Demo URL ${demoUrl}/api/health did not return a build marker.`);
  else console.log(`✓ Demo URL alive: ${demoUrl} (build ${data.build})`);
} catch (e) {
  failures.push(`Demo URL ${demoUrl} unreachable: ${e.message}`);
}

if (failures.length) {
  console.error("\n✖ NOT submission-ready:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("✓ Submission-ready: packs reviewed, database connected, demo live.");
