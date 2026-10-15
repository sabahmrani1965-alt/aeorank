import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { checkEngines, probeCloroConcurrency, sendEngineAlert } from "@/lib/engineHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 150;

// On-demand engine health check. Guarded by a token whose SHA-256 is below
// (the repo is public, so only the hash lives here).
const TOKEN_SHA256 = "be07aec3d79993b11f68ee8725d57d88182d454ef90fc9eac8b8cb9fda53f250";

function authorized(req) {
  const t = new URL(req.url).searchParams.get("token") || "";
  const a = Buffer.from(createHash("sha256").update(t).digest("hex"));
  const b = Buffer.from(TOKEN_SHA256);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const params = new URL(req.url).searchParams;
  if (params.get("probe") === "concurrency") {
    const n = Math.min(8, Math.max(2, Number(params.get("n")) || 4));
    return NextResponse.json({ probe: n, results: await probeCloroConcurrency(n) });
  }
  const results = await checkEngines();
  // ?alert=test sends a sample alert through the real email + Discord path.
  if (new URL(req.url).searchParams.get("alert") === "test") {
    const sent = await sendEngineAlert(["This is a test alert. No action needed."], results, { test: true });
    return NextResponse.json({ results, testAlertSent: sent });
  }
  return NextResponse.json(results);
}
