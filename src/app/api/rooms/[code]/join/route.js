import { NextResponse } from "next/server";
import { addPlayer } from "../../../../../lib/engine.js";
import { casUpdate, rateLimit } from "../../../../../lib/roomStore.js";
import { cleanCode, cleanName, isAvatar, newId, newToken, hashToken, parseJsonBody } from "../../../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

export async function POST(req, { params }) {
  const { code: rawCode } = await params;
  const code = cleanCode(rawCode);
  const body = await parseJsonBody(req);
  if (!body) return bad("Invalid request.");
  const name = cleanName(body.name);
  if (!name) return bad("Enter your name.");
  if (!isAvatar(body.avatar)) return bad("Pick an avatar.");
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    // 12 phones on one home Wi-Fi share an IP — the limit is per IP+room and generous.
    if (!(await rateLimit(`join:${ip}:${code}`, 40, 60))) return bad("Too many joins. Wait a few seconds.", 429);

    const playerToken = typeof body.playerToken === "string" && body.playerToken.length >= 16 ? body.playerToken : newToken();
    const tokenHash = hashToken(playerToken);
    const playerId = newId();
    const { state, error } = await casUpdate(code, (s) => addPlayer(s, { id: playerId, tokenHash, name, avatar: body.avatar }, Date.now()));
    if (error) return bad(error, 404);
    const me = state.players.find((p) => p.tokenHash === tokenHash);
    return NextResponse.json({ ok: true, code, playerId: me.id, playerToken }, { headers: noStore });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "NO_REDIS" ? 503 : 500, headers: noStore });
  }
}
