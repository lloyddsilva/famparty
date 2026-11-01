import { createHash, randomBytes } from "node:crypto";
import { AVATARS } from "./questions.js";
import { BLOCKED_TERMS, ALLOWED_PHRASES } from "./blockedWords.js";

export const newToken = () => randomBytes(24).toString("hex");
export const newId = () => randomBytes(12).toString("hex");
export const hashToken = (token) => createHash("sha256").update(String(token || "")).digest("hex");

export const cleanName = (v) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, 16);
// Light normalisation before matching (final filter pass):
// - exact innocent phrases are removed first (ALLOWED_PHRASES)
// - "!" counts as "i", "-" is removed (f-uck -> fuck), "*" is a wildcard letter
// - runs of 3+ repeated letters collapse (fuuuck -> fuck) — but ordinary
//   double letters are untouched, so "grapes", "drapes", "trapeze",
//   "scraped" and even "as" stay innocent.
// Filters will always miss things. Host hide is the backstop.

const collapseLongRuns = (s) => s.replace(/([a-z])\1{2,}/g, "$1");
const SINGLES = new Set();
const PHRASES = new Set();
for (const term of BLOCKED_TERMS) {
  const words = term.split(/\s+/).filter(Boolean);
  if (words.length === 1) { SINGLES.add(words[0]); SINGLES.add(collapseLongRuns(words[0])); }
  else { PHRASES.add(words.join(" ")); PHRASES.add(words.map(collapseLongRuns).join(" ")); }
}
const MAX_PHRASE_WORDS = Math.max(...[...PHRASES].map((x) => x.split(" ").length), 1);

function tokenMatches(token) {
  const forms = [token, collapseLongRuns(token)];
  for (const form of forms) {
    if (SINGLES.has(form)) return true;
    if (form.includes("*")) {
      const re = new RegExp(`^${form.replace(/[.*+?^${}()|[\]\\]/g, (c) => (c === "*" ? "[a-z]" : `\\${c}`))}$`);
      for (const term of SINGLES) if (re.test(term)) return true;
    }
  }
  return false;
}

const streamBlocked = (tokens) => {
  if (tokens.some(tokenMatches)) return true;
  for (const stream of [tokens.join(" "), tokens.map(collapseLongRuns).join(" ")]) {
    const padded = ` ${stream} `;
    for (const phrase of PHRASES) if (padded.includes(` ${phrase} `)) return true;
  }
  return false;
};

const withoutAllowed = (tokens) => {
  let joined = tokens.join(" ");
  for (const phrase of ALLOWED_PHRASES) joined = joined.split(phrase).join(" ");
  return joined.split(/\s+/).filter(Boolean);
};

const containsBlocked = (v) => {
  const base = String(v ?? "").toLowerCase().replace(/!/g, "i");
  const tokenize = (s) => s.replace(/[^a-z0-9* ]/g, " ").split(/\s+/).filter(Boolean);
  // Innocent-phrase allowances apply to both readings of the text.
  if (streamBlocked(withoutAllowed(tokenize(base.replace(/-/g, " "))))) return true;
  // Hyphens removed entirely catches f-uck style splitting.
  return streamBlocked(withoutAllowed(tokenize(base.replace(/-/g, ""))));
};

/** Names are shown on a family TV: reject blocked words outright. The host hide/kick tools are the backstop. */
export const isCleanName = (v) => !!cleanName(v) && !containsBlocked(v);
/** Free text (statements, answers, stories) gets the same screen (item 6). Filters miss things — host hide exists for the rest. */
export const isCleanText = (v) => !containsBlocked(v);
export const cleanCode = (v) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
export const isAvatar = (v) => AVATARS.includes(v);
export const isChoice = (v, max) => Number.isInteger(v) && v >= 0 && v < max;

// Room codes: unambiguous alphabet, and reject anything containing a blocked fragment.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const BLOCKED = ["FCK", "FUC", "SHT", "CUM", "SEX", "TIT", "ASS", "NIG", "FAG", "WTF", "PORN", "RAPE"];
export function makeRoomCode() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    if (!BLOCKED.some((b) => code.includes(b))) return code;
  }
  return "PLAY";
}

export function parseJsonBody(req) {
  return req.json().catch(() => null);
}

/** Client IP for rate limiting. On Vercel, x-vercel-forwarded-for is set by
 * the platform and can't be spoofed by the client, unlike x-forwarded-for. */
export function clientIp(req) {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}
