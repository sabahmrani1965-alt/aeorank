import { NextResponse } from "next/server";
import { hasAdminToken } from "@/lib/adminToken";
import { checkEngines, probeCloroConcurrency, sendEngineAlert } from "@/lib/engineHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 150;

// On-demand engine health check, guarded by the owner token (lib/adminToken).
export async function GET(req) {
  if (!hasAdminToken(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
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
