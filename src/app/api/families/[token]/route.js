import { NextResponse } from "next/server";
import { familyByToken, listMembers, listStatements, addMember, exportFamily, deleteFamily, RETENTION_MS } from "../../../../lib/db.js";
import { cleanName, isCleanName, isAvatar, parseJsonBody } from "../../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

async function auth(token) {
  const found = await familyByToken(token);
  if (!found) throw Object.assign(new Error("Family album not recognised."), { status: 404 });
  return found;
}

export async function GET(req, { params }) {
  const { token } = await params;
  try {
    const { family, access } = await auth(token);
    const [members, statements] = await Promise.all([listMembers(family.id), listStatements(family.id, 100)]);
    const lastActiveAt = Number(family.last_active_at || family.created_at);
    return NextResponse.json({ ok: true, access, family: { id: family.id, name: family.name }, lastActiveAt, expiresAt: lastActiveAt + RETENTION_MS, members, statements }, { headers: noStore });
  } catch (e) { return bad(e.message, e.status || 500); }
}

export async function POST(req, { params }) {
  const { token } = await params;
  const body = await parseJsonBody(req);
  try {
    const { family } = await auth(token);
    if (body?.action === "addMember") {
      const name = cleanName(body.name);
      if (!isCleanName(name) || !isAvatar(body.avatar)) return bad("Name and avatar required — and our filter tripped on that name. Mind wording it differently?");
      const members = await listMembers(family.id);
      if (members.length >= 24) return bad("Roster is full (24).");
      if (members.some((m) => m.avatar === body.avatar)) return bad("That avatar is already taken on this roster. Pick another.");
      const member = await addMember(family.id, name, body.avatar);
      return NextResponse.json({ ok: true, member }, { headers: noStore });
    }
    return bad("Unknown action.");
  } catch (e) { return bad(e.message, e.status || 500); }
}

export async function DELETE(req, { params }) {
  const { token } = await params;
  const body = await parseJsonBody(req);
  try {
    const { family, access } = await auth(token);
    if (access !== "owner") return bad("Only the owner link can delete this family.", 403);
    if (body?.confirm !== "DELETE") return bad('Type DELETE to confirm.');
    await deleteFamily(family.id);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch (e) { return bad(e.message, e.status || 500); }
}
