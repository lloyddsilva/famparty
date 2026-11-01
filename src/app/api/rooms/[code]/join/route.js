import { NextResponse } from "next/server";
import { addPlayer } from "../../../../../lib/engine.js";
import { casUpdate, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode, cleanName, isCleanName, isAvatar, newId, newToken, hashToken, parseJsonBody, clientIp, rateLimitFor } from "../../../../../lib/validate.js";
import { familyByToken, getMember } from "../../../../../lib/db.js";
import { loadRoom } from "../../../../../lib/roomStore.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const body = await parseJsonBody(req);
  if (!body) return bad("Invalid request.");
  let name = cleanName(body.name);
  let avatar = body.avatar;
  let memberId = null;
  try {
    // Roster join: identity comes from the family member, not a session name.
    if (body.memberId && body.familyToken) {
      const room = await loadRoom(code);
      if (!room) return bad("Room not found or expired.", 404);
      const found = await familyByToken(body.familyToken);
      if (!found || found.family.id !== room.familyId) return bad("This room is not linked to that family.", 403);
      const member = await getMember(found.family.id, body.memberId);
      if (!member) return bad("Member not found on the roster.", 404);
      name = member.name; avatar = member.avatar; memberId = member.id;
    }
    if (!name) return bad("Enter your name.");
    if (!isAvatar(avatar)) return bad("Pick an avatar.");
    const ip = clientIp(req);
    // Two layers (item 6): per IP+room (generous — 12 phones share one home IP),
    // plus a per-IP ceiling across ALL rooms so code guessing is throttled too.
    if (!(await rateLimit(`join:${ip}:${code}`, 40, 60))) return bad("Too many joins. Wait a few seconds.", 429);
    if (!(await rateLimit(`joinall:${ip}`, rateLimitFor(60), 60))) return bad("Too many join attempts. Wait a minute.", 429);
    if (!memberId && !isCleanName(name)) return bad("Our filter tripped on that one. Mind wording it differently?");

    const playerToken = typeof body.playerToken === "string" && body.playerToken.length >= 16 ? body.playerToken : newToken();
    const tokenHash = hashToken(playerToken);
    const playerId = newId();
    const { state, error } = await casUpdate(code, (s) => addPlayer(s, { id: playerId, tokenHash, name, avatar, memberId }, Date.now()));
    if (error) return bad(error, 404);
    const me = state.players.find((p) => p.tokenHash === tokenHash);
    return NextResponse.json({ ok: true, code, playerId: me.id, playerToken }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
