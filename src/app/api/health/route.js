import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || process.env.BUILD_ID || "local-dev";
  return NextResponse.json({ ok: true, build, serverNow: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
