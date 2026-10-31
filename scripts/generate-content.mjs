// Offline content generation — run ONCE by a developer, never at runtime.
// The app has no model API keys and makes no live model calls; everything the
// site serves comes from committed files (src/lib/packs.js and public/pack-art/).
//
// Usage:
//   META_API_KEY=... node scripts/generate-content.mjs --text   # Muse Spark -> draft pack JSON in scripts/out/
//   META_API_KEY=... node scripts/generate-content.mjs --art    # Muse Image -> pack title-card art in scripts/out/
//
// Then a human reviews family-safety/originality, pastes approved items into
// src/lib/packs.js (or public/pack-art/), and sets reviewed: true.
// The API key is read from the environment only and is never committed.

const apiKey = process.env.META_API_KEY;
const base = process.env.META_API_BASE_URL; // provider endpoint, set per developer environment
const textModel = process.env.META_TEXT_MODEL || "muse-spark";
const imageModel = process.env.META_IMAGE_MODEL || "muse-image";

if (!apiKey || !base) {
  console.error("Set META_API_KEY and META_API_BASE_URL (your Meta provider endpoint) in the environment. Nothing is committed with this key.");
  process.exit(2);
}

const mode = process.argv[2];
const { mkdir, writeFile } = await import("node:fs/promises");
await mkdir("scripts/out", { recursive: true });

async function call(path, payload) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Provider call failed: ${res.status} ${await res.text()}`);
  return res.json();
}

if (mode === "--text") {
  const prompts = {
    "spectrum-draft": "Write 20 Spectrum pairs for a family party game: two opposite, family-safe preferences per line as LEFT | RIGHT. No politics, religion, identity, health, or work topics. Original wording only.",
    "finish-it-draft": "Write 20 'Finish It' prompts for a family party game in the form 'sentence ___'. Family-safe, funny, original. Avoid medical, romantic, or school/work-specific topics.",
    "spotlight-starters-draft": "Write 20 short statement starters for a two-truths-and-a-lie family game, e.g. 'A place I have been…'. Family-safe and original.",
  };
  for (const [name, prompt] of Object.entries(prompts)) {
    const out = await call("/chat/completions", { model: textModel, messages: [{ role: "user", content: prompt }] });
    await writeFile(`scripts/out/${name}.json`, JSON.stringify({ model: textModel, prompt, draft: out }, null, 2));
    console.log(`draft written: scripts/out/${name}.json (REVIEW before use)`);
  }
} else if (mode === "--art") {
  // Art appears ONLY on pack title cards and (if Finish It ships) Finish It prompt cards.
  const jobs = [
    ["emoji-decoder-card", "Warm flat-illustration title card for a family emoji guessing game: big friendly emoji faces around a TV screen, purple and orange palette, no text."],
    ["spectrum-card", "Warm flat-illustration title card for a family opinion game: cartoon family avatars spread along a slider between a beach and mountains, purple and orange palette, no text."],
    ["finish-it-card", "Warm flat-illustration title card for a family fill-in-the-blank comedy game: speech bubbles and a pencil around a TV screen, purple and orange palette, no text."],
  ];
  for (const [name, prompt] of jobs) {
    const out = await call("/images/generations", { model: imageModel, prompt });
    await writeFile(`scripts/out/${name}.json`, JSON.stringify({ model: imageModel, prompt, draft: out }, null, 2));
    console.log(`art draft written: scripts/out/${name}.json (download, review, then place in public/pack-art/)`);
  }
} else {
  console.error("Pass --text or --art.");
  process.exit(2);
}
