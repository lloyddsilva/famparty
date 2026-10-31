import { NextResponse } from "next/server";
import { familyByToken, exportFamily } from "../../../../../lib/db.js";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { token } = await params;
  const found = await familyByToken(token);
  if (!found) return NextResponse.json({ ok: false, error: "Family link not recognised." }, { status: 404 });
  if (found.access !== "owner") return NextResponse.json({ ok: false, error: "Only the owner link can export." }, { status: 403 });
  const data = await exportFamily(found.family.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="famparty-${found.family.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-export.json"`,
      "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
