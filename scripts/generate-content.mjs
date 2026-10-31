// Offline content generation — run ONCE by a developer, never at runtime.
// The app has no model API keys and makes no live model calls; everything the
// site serves comes from committed files (src/lib/packs.js, public/pack-art/).
//
// API facts (Meta Model API docs, https://dev.meta.ai/docs/overview):
//   Base URL  https://api.meta.ai/v1
//   Auth      Authorization: Bearer $MODEL_API_KEY
//   Text      muse-spark-1.3           POST /chat/completions
//   Image     muse-image-1.0           POST /images/generations (OpenAI-compatible)
//
// Usage (key entered by Lloyd himself; never committed):
//   MODEL_API_KEY=... node scripts/generate-content.mjs --text
//   MODEL_API_KEY=... node scripts/generate-content.mjs --art
//
// Raw outputs (prompt + model + response) land in content/outputs/ and are
// committed. A human reviews them, builds src/lib/packs.js from them recording
// any edits, places approved art in public/pack-art/, and only then flips
// reviewed:true. Lloyd's review is the shipping gate.

const apiKey = process.env.MODEL_API_KEY || process.env.META_API_KEY;
const base = (process.env.META_API_BASE_URL || "https://api.meta.ai/v1").replace(/\/$/, "");
const textModel = process.env.META_TEXT_MODEL || "muse-spark-1.3";
const imageModel = process.env.META_IMAGE_MODEL || "muse-image-1.0";

if (!apiKey) {
  console.error("Set MODEL_API_KEY in your environment (Meta Model API key from https://dev.meta.ai). It is read from the environment only and never committed.");
  process.exit(2);
}

const mode = process.argv[2];
const { mkdir, writeFile } = await import("node:fs/promises");
await mkdir("content/outputs/art", { recursive: true });

async function call(path, payload) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Model API call failed: ${res.status} ${await res.text()}`);
  return res.json();
}

if (mode === "--text") {
  const jobs = [
    ["emoji-decoder-draft", "Write 12 Emoji Decoder rounds for a family party game. Each round: an emoji clue (2-4 emojis), the phrase it represents, and 3 plausible wrong phrases of similar length. Everyday family phrases only (food, home, weather, celebrations, animals, school, holidays). Format each round exactly as: EMOJI | ANSWER | WRONG1 | WRONG2 | WRONG3. Original content only; do not reference any existing game or TV show."],
    ["spectrum-draft", "Write 20 Spectrum pairs for a family party game: two opposite, family-safe preferences per line, formatted exactly as LEFT | RIGHT. Topics: food, holidays, weather, animals, hobbies, home life. No politics, religion, identity, health, money, or work topics. Original wording only."],
    ["finish-it-draft", "Write 20 sentence-completion prompts for a family party game, in the form 'A sentence with ___ at a natural place for a funny ending'. Family-safe, warm, and open to silly answers. Settings: home, road trips, grandparents, group chats, game night, food. Original wording only; do not reference any existing game or TV show."],
    ["spotlight-starters-draft", "Write 20 short statement starters for a two-truths-and-a-lie family game, for example 'A place I have been...'. Each should help a shy player (age 8 to 80) think of a true statement and a plausible lie. Family-safe and original."],
  ];
  for (const [name, prompt] of jobs) {
    const out = await call("/chat/completions", {
      model: textModel,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 3000,
    });
    const record = { model: textModel, endpoint: "/chat/completions", prompt, generatedAt: new Date().toISOString(), output: out.choices?.[0]?.message?.content ?? out };
    await writeFile(`content/outputs/${name}.json`, JSON.stringify(record, null, 2));
    console.log(`draft written: content/outputs/${name}.json (REVIEW before use)`);
  }
} else if (mode === "--art") {
  // Art appears ONLY on pack title cards and (if Finish It ships) Finish It prompt cards.
  const jobs = [
    ["emoji-decoder-card", "Warm flat-illustration title card for a family emoji guessing game: big friendly emoji faces around a TV screen, deep purple and warm orange palette, cosy living-room feeling, no text, no letters."],
    ["spotlight-card", "Warm flat-illustration title card for a family storytelling game: one cartoon character in a friendly spotlight on a stage telling a story to a seated family audience, deep purple and warm orange palette, no text, no letters."],
    ["spectrum-card", "Warm flat-illustration title card for a family opinion game: cartoon family avatars spread along a horizontal slider between a sunny beach on the left and snowy mountains on the right, deep purple and warm orange palette, no text, no letters."],
    ["finish-it-card", "Warm flat-illustration title card for a family fill-in-the-blank comedy game: speech bubbles and a pencil around a TV screen, deep purple and warm orange palette, no text, no letters."],
  ];
  for (const [name, prompt] of jobs) {
    // Docs (dev.meta.ai/docs/image-generation): response_format "b64_json"
    // (default) returns data[].b64_json; "url" returns a signed data[].url.
    // output_format "webp" (default), "png" or "jpeg" is a documented field.
    const { resolveImageBytes, assertWebp } = await import("../src/lib/imageBytes.js");
    const out = await call("/images/generations", { model: imageModel, prompt, n: 1, output_format: "webp", response_format: "b64_json" });
    const bytes = assertWebp(await resolveImageBytes(out.data?.[0]), name);
    const file = `content/outputs/art/${name}.webp`;
    await writeFile(file, bytes);
    const record = { model: imageModel, endpoint: "/images/generations", prompt, generatedAt: new Date().toISOString(), file, usage: out.usage || null };
    await writeFile(`content/outputs/${name}.json`, JSON.stringify(record, null, 2));
    console.log(`art written: ${file} + content/outputs/${name}.json (REVIEW before use)`);
  }
} else {
  console.error("Pass --text or --art.");
  process.exit(2);
}
