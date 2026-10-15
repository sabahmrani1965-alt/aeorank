import { NextResponse } from "next/server";
import { checkEngines, criticalProblems, sendEngineAlert } from "@/lib/engineHealth";

export const runtime = "nodejs";
export const maxDuration = 150;

// Daily AI engine check, half an hour before check-prompts. Alerts by email
// and Discord when Claude fails (it backs AEOrank and the live EasyRep app)
// or when every Cloro engine fails. An Anthropic credit balance hitting
// zero went unnoticed for two weeks in October 2026; this is the guard.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await checkEngines();
  const problems = criticalProblems(results);
  if (problems.length === 0) return NextResponse.json({ ok: true, results });
  const sent = await sendEngineAlert(problems, results);
  return NextResponse.json({ ok: false, problems, sent, results });
}
