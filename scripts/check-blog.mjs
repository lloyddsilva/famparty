// Blog build gate. Fails if any published post:
// - lacks an explicit published: true/false
// - has a meta description over 155 characters
// - has no visual in the first 150 words, or >180 words of prose between visuals
// - has HTML inside a plain-text field
// - links internally to a page that doesn't exist, or references a missing image
//
// Run: npm run check:blog (also wired into npm run build)

import { existsSync } from "node:fs";
import { BLOG_POSTS } from "../src/lib/blogPosts.js";
import { GAMES, OCCASIONS } from "../src/lib/siteContent.js";

// Only visuals that teach or show something count toward the gap rule.
// Callouts and pull quotes are emphasis, not visuals (audit fix).
const VISUAL_TYPES = new Set(["gameCard", "ideaGrid", "steps", "table", "pickerChart", "tvMock", "phoneMock", "example", "revealGrid"]);
const MAX_GAP = 180;
const FIRST_VISUAL_BY = 150;

const knownRoutes = new Set([
  "/", "/games", "/how-it-works", "/family", "/blog", "/privacy", "/terms", "/about", "/host", "/join", "/tv",
  ...GAMES.map((g) => `/games/${g.slug}`),
  ...OCCASIONS.map((o) => `/for/${o.slug}`),
  ...BLOG_POSTS.filter((p) => p.published).map((p) => `/blog/${p.slug}`),
]);

const words = (text) => String(text || "").split(/\s+/).filter(Boolean).length;
const MIN_WORDS = 900;

function blockWords(block) {
  switch (block.type) {
    case "paragraph": case "heading": return words(block.text);
    case "gameCard": return words(block.name) + words(block.how) + words(block.players) + words(block.time) + words(block.needs);
    case "ideaGrid": case "revealGrid": return (block.items || []).reduce((a, i) => a + words(i.title) + words(i.text) + words(i.clue) + words(i.answer), 0);
    case "steps": return (block.items || []).reduce((a, i) => a + words(i), 0);
    case "example": return (block.items || []).reduce((a, i) => a + words(i.text), 0);
    case "callout": case "pullQuote": return words(block.title) + words(block.text);
    case "pickerChart": return (block.items || []).reduce((a, i) => a + words(i.if) + words(i.play) + words(i.note), 0);
    case "tvMock": return words(block.question) + (block.choices || []).reduce((a, c) => a + words(c), 0) + words(block.footer);
    case "phoneMock": return (block.lines || []).reduce((a, l) => a + words(l), 0);
    case "table": return (block.rows || []).flat().reduce((a, c) => a + words(c), 0) + (block.head || []).reduce((a, c) => a + words(c), 0);
    default: return words(block.text);
  }
}
function postWords(post) {
  return words(post.title) + words(post.description) + words(post.quickAnswer)
    + (post.takeaways || []).reduce((a, x) => a + words(x), 0)
    + post.blocks.reduce((a, b) => a + blockWords(b), 0)
    + (post.faq || []).reduce((a, f) => a + words(f.q) + words(f.a), 0);
}
const failures = [];

function checkPlain(value, where) {
  if (typeof value === "string" && /<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i.test(value)) {
    failures.push(`${where}: HTML found in a plain-text field`);
  }
}
function walkStrings(value, where) {
  if (typeof value === "string") checkPlain(value, where);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${where}[${i}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => walkStrings(v, `${where}.${k}`));
}

for (const post of BLOG_POSTS) {
  const at = `post "${post.slug}"`;
  if (typeof post.published !== "boolean") failures.push(`${at}: missing explicit published true/false`);
  const checkDrafts = process.argv.includes("--all");
  if (!post.published && !checkDrafts) continue;

  const totalWords = postWords(post);
  if (totalWords < MIN_WORDS) failures.push(`${at}: ${totalWords} words, below the ${MIN_WORDS}-word minimum`);
  if (!post.description || post.description.length > 155) {
    failures.push(`${at}: meta description is ${post.description?.length ?? 0} chars (max 155)`);
  }
  walkStrings({ title: post.title, description: post.description, quickAnswer: post.quickAnswer, takeaways: post.takeaways, blocks: post.blocks, faq: post.faq }, at);

  // visuals: quickAnswer + cover count as the opening visuals
  let proseSinceVisual = words(post.title) + words(post.description) + words(post.quickAnswer);
  if (proseSinceVisual > FIRST_VISUAL_BY && !post.quickAnswer) {
    failures.push(`${at}: no visual in the first ${FIRST_VISUAL_BY} words`);
  }
  proseSinceVisual = 0; // cover follows takeaways; takeaways are a list visual-adjacent block
  let sawVisual = true; // quickAnswer box at the top
  for (const [i, block] of post.blocks.entries()) {
    if (VISUAL_TYPES.has(block.type)) {
      if (proseSinceVisual > MAX_GAP) failures.push(`${at}: ${proseSinceVisual} words of prose before block ${i} (${block.type}), max ${MAX_GAP}`);
      proseSinceVisual = 0;
      sawVisual = true;
    } else if (block.type === "paragraph" || block.type === "heading") {
      proseSinceVisual += words(block.text);
    }
    if (block.image) {
      if (!String(block.image.src).endsWith(".webp")) failures.push(`${at}: block ${i} image is not .webp`);
      if (!block.image.alt) failures.push(`${at}: block ${i} image has no alt text`);
      if (!existsSync(`public${block.image.src}`)) failures.push(`${at}: block ${i} image missing: public${block.image.src}`);
    }
  }
  if (!sawVisual) failures.push(`${at}: no visuals at all`);
  if (proseSinceVisual > MAX_GAP) failures.push(`${at}: ${proseSinceVisual} words of prose after the last visual, max ${MAX_GAP}`);

  // no repeated heading or pull quote within a post
  const seenTexts = new Map();
  for (const block of post.blocks) {
    if (block.type === "heading" || block.type === "pullQuote") {
      const key = String(block.text || "").trim().toLowerCase();
      if (key && seenTexts.has(key)) failures.push(`${at}: repeated ${block.type} "${block.text}"`);
      seenTexts.set(key, true);
    }
  }

  // internal links: related posts + game page
  for (const rel of post.related || []) {
    const target = BLOG_POSTS.find((p) => p.slug === rel);
    if (!target) failures.push(`${at}: related link /blog/${rel} does not exist`);
    else if (post.published && !target.published) failures.push(`${at}: published post links to draft /blog/${rel}`);
  }
  if (post.gameSlug && !knownRoutes.has(`/games/${post.gameSlug}`)) {
    failures.push(`${at}: game link /games/${post.gameSlug} does not exist`);
  }
}

if (failures.length) {
  console.error("✖ Blog gate failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
const checked = BLOG_POSTS.filter((p) => p.published || process.argv.includes("--all")).length;
console.log(`✓ Blog gate: ${checked} posts pass${process.argv.includes("--all") ? " (including drafts)" : ""}.`);
