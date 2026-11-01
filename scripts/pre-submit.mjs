// Pre-submit gate. The normal build stays green while content is in draft, but
// a submission is NOT ready until this passes:
//   npm run pre-submit
// It fails on: unreviewed content packs, no committed model outputs, a live
// build that differs from HEAD, or the production album store (Redis) being unhealthy.

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { ALL_PACKS } from "../src/lib/packs.js";

const failures = [];
const demoUrl = process.env.DEMO_URL || "https://famparty.vercel.app";

// 1. packs reviewed
const unreviewed = ALL_PACKS.filter((p) => !p.reviewed).map((p) => p.id);
if (unreviewed.length) failures.push(`Unreviewed content packs: ${unreviewed.join(", ")} (Lloyd's human review after the Muse Spark/Image run)`);

// 2. committed model outputs exist (content/outputs/*.json with model metadata)
let outputs = [];
try { outputs = readdirSync("content/outputs").filter((f) => f.endsWith(".json")); } catch {}
let modelOutputsOk = false;
for (const f of outputs) {
  try {
    const data = JSON.parse(readFileSync(`content/outputs/${f}`, "utf8"));
    if (String(data.model || "").startsWith("muse-")) modelOutputsOk = true;
  } catch {}
}
if (!modelOutputsOk) failures.push("No committed model outputs: expected content/outputs/*.json from the Muse Spark/Image run, each recording its model.");

// 3. live build == HEAD, and production database healthy (both read live)
let head = "unknown";
try { head = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim(); } catch {}
try {
  const res = await fetch(`${demoUrl}/api/health`, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  if (!data.ok || !data.build) failures.push(`Demo URL ${demoUrl}/api/health did not return a build marker.`);
  else if (data.build !== head) failures.push(`Live build ${data.build} does not match HEAD ${head} — deploy before submitting.`);
  else console.log(`✓ Live build matches HEAD: ${data.build}`);
} catch (e) {
  failures.push(`Demo URL ${demoUrl} unreachable: ${e.message}`);
}
try {
  const res = await fetch(`${demoUrl}/api/health/db`, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  if (!data.ok) failures.push(`Production album store not healthy at ${demoUrl}/api/health/db (${data.code || data.backend || "unconfigured"}).`);
  else if (!data.configured) failures.push("Production album store endpoint is up but no production Redis is configured (local fallback).");
  else console.log(`✓ Production album store healthy (${data.backend})`);
} catch (e) {
  failures.push(`Production database health check unreachable: ${e.message}`);
}

// After Lloyd's content run and review flip packs to reviewed:true, restore
// the final content wording in /about, /privacy and /llms.txt (they currently
// state, correctly, that packs are unreviewed hand-written starters).
if (!unreviewed.length) {
  console.log("NOTE: packs are marked reviewed — restore the final content wording in /about, /privacy and public/llms.txt, and confirm it matches what actually ran.");
}

if (failures.length) {
  console.error("\n✖ NOT submission-ready:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("✓ Submission-ready: packs reviewed, model outputs committed, live build == HEAD, production album store healthy.");
