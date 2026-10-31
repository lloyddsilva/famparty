import { NextResponse } from "next/server";
import { familyByToken, listMembers, listStatements, addMember, exportFamily, deleteFamily } from "../../../../lib/db.js";
import { cleanName, isCleanName, isAvatar, parseJsonBody } from "../../../../lib/validate.js";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

async function auth(token) {
  const found = await familyByToken(token);
  if (!found) throw Object.assign(new Error("Family link not recognised."), { status: 404 });
  return found;
}

export async function GET(req, { params }) {
  const { token } = await params;
  try {
    const { family, access } = await auth(token);
    const [members, statements] = await Promise.all([listMembers(family.id), listStatements(family.id, 100)]);
    return NextResponse.json({ ok: true, access, family: { id: family.id, name: family.name }, members, statements }, { headers: noStore });
  } catch (e) { return bad(e.message, e.status || 500); }
}

export async function POST(req, { params }) {
  const { token } = await params;
  const body = await parseJsonBody(req);
  try {
    const { family } = await auth(token);
    if (body?.action === "addMember") {
      const name = cleanName(body.name);
      if (!isCleanName(name) || !isAvatar(body.avatar)) return bad("A clean name and an avatar are required.");
      const members = await listMembers(family.id);
      if (members.length >= 24) return bad("Roster is full (24).");
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
