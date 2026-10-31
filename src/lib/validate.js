import { createHash, randomBytes } from "node:crypto";
import { AVATARS } from "./questions.js";

export const newToken = () => randomBytes(24).toString("hex");
export const newId = () => randomBytes(12).toString("hex");
export const hashToken = (token) => createHash("sha256").update(String(token || "")).digest("hex");

const NAME_BLOCKED = ["fuck", "shit", "cunt", "nigger", "faggot", "bitch", "whore", "rape", "penis", "vagina", "porn", "hitler"];
export const cleanName = (v) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, 16);
/** Names are shown on a family TV: reject blocked words outright (item 10). The host hide/kick tools are the backstop. */
export const isCleanName = (v) => {
  const n = cleanName(v).toLowerCase();
  return !!n && !NAME_BLOCKED.some((b) => n.includes(b));
};
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
