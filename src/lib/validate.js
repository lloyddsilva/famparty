import { createHash, randomBytes } from "node:crypto";
import { AVATARS } from "./questions.js";

export const newToken = () => randomBytes(24).toString("hex");
export const newId = () => randomBytes(12).toString("hex");
export const hashToken = (token) => createHash("sha256").update(String(token || "")).digest("hex");

const BLOCKED_WORDS = [
  "fuck", "fucking", "fucker", "motherfucker", "shit", "shitty", "shithead", "bullshit",
  "cunt", "nigger", "faggot", "bitch", "bitches", "whore", "whores",
  "rape", "raped", "rapist", "penis", "vagina", "porn", "pornstar", "hitler", "nazi",
  "asshole", "cock", "slut", "fucked", "shits", "retard",
  // Deliberately NOT blocked: "dick" (also a name). Host hide is the backstop;
  // filters will always miss things, and that is accepted.
];
export const cleanName = (v) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, 16);
// Word boundaries only: "grapes", "drapes", "trapeze" and "scraped" are innocent.
const containsBlocked = (v) => {
  const text = String(v ?? "").toLowerCase();
  return BLOCKED_WORDS.some((b) => new RegExp(`\\b${b}\\b`).test(text));
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
