import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPrompt, cloroModels, isAiVisibilityConfigured, persistCheckResults } from "@/lib/aivisibility";
import { runWithConcurrency } from "@/lib/concurrency";
import { hasAdminToken } from "@/lib/adminToken";

export const runtime = "nodejs";
// Two passes per run. The fast engines (Claude, direct Gemini) check every
// due prompt. Cloro allows one call at a time at 15-45s each, so it gets
// the remaining time and spends it on the prompts whose Cloro answers are
// oldest; with two runs a day every prompt cycles through.
export const maxDuration = 280;

const BATCH_SIZE = 12;
const CONCURRENCY = 4;
// Roughly a day, but checked slightly under 24h so the cadence doesn't
// drift later each run.
const STALE_MS = 20 * 60 * 60 * 1000;

// Vercel Cron sends this exact header on every invocation when CRON_SECRET
// is set — see vercel.json's `crons` entry for this route's schedule.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Automated version of the manual "Check now" button
// (app/api/prompts/[id]/check/route.js) — same checkPrompt() call against
// live Gemini/Claude, run on a schedule across every active brand's
// tracked prompts instead of waiting for a customer to click. Picks the
// most-overdue prompts first (last_checked_at, nulls first) and caps the
// batch per invocation to stay inside Vercel's function timeout; the
// cron fires every few hours so the full backlog cycles through over the
// day. This is what makes AI-citation tracking continuous instead of
// on-demand only.
export async function GET(req) {
  // Every engine call ends by this point, so finished prompts are saved
  // before Vercel kills the function at maxDuration.
  const deadline = Date.now() + 255000;
  if (!isAuthorizedCronRequest(req) && !hasAdminToken(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAiVisibilityConfigured()) {
    return NextResponse.json({ skipped: "ai visibility not configured" });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trialing"]);
  const activeUserIds = [...new Set((subs || []).map((s) => s.user_id))];
  if (activeUserIds.length === 0) return NextResponse.json({ checked: 0 });

  const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
  const { data: prompts, error } = await admin
    .from("prompts")
    .select("id, text, user_id, company_profile_id, last_checked_at")
    .in("user_id", activeUserIds)
    .eq("active", true)
    .not("company_profile_id", "is", null)
    .or(`last_checked_at.is.null,last_checked_at.lt.${staleBefore}`)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[cron/check-prompts] query failed:", error.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!prompts || prompts.length === 0) {
    const slow = cloroModels();
    const cloroChecked = slow.length ? await cloroPass(admin, activeUserIds, slow, deadline) : 0;
    return NextResponse.json({ checked: 0, cloroChecked });
  }

  // Brand name needed per prompt for checkPrompt() — batch-load every
  // distinct company_profile referenced instead of one query per prompt.
  const profileIds = [...new Set(prompts.map((p) => p.company_profile_id))];
  const { data: profiles } = await admin
    .from("company_profiles")
    .select("id, company_name")
    .in("id", profileIds);
  const brandById = new Map((profiles || []).map((p) => [p.id, p.company_name]));

  const slow = cloroModels();
  const fast = ["Gemini", "Claude", "ChatGPT", "Perplexity"].filter((m) => !slow.includes(m));

  let checked = 0;
  await runWithConcurrency(prompts, CONCURRENCY, async (prompt) => {
    const brand = brandById.get(prompt.company_profile_id);
    if (!brand || deadline - Date.now() < 20000) return;
    const results = await checkPrompt(prompt.text, brand, { deadline, only: fast }).catch((e) => {
      console.error("[cron/check-prompts] checkPrompt failed:", e?.message || e);
      return null;
    });
    if (!results) return;
    await persistCheckResults(admin, {
      promptId: prompt.id,
      userId: prompt.user_id,
      results,
      checkedAt: new Date().toISOString(),
    });
    checked++;
  });

  const cloroChecked = slow.length ? await cloroPass(admin, activeUserIds, slow, deadline) : 0;
  return NextResponse.json({ checked, candidates: prompts.length, cloroChecked });
}

// Cloro top-up: every active prompt, ordered by its newest Cloro answer
// (never-answered first), checked one at a time until the time runs out.
async function cloroPass(admin, userIds, models, deadline) {
  const { data: all } = await admin
    .from("prompts")
    .select("id, text, user_id, company_profile_id")
    .in("user_id", userIds)
    .eq("active", true)
    .not("company_profile_id", "is", null)
    .limit(500);
  if (!all?.length) return 0;

  const { data: recent } = await admin
    .from("prompt_checks")
    .select("prompt_id, created_at")
    .in("prompt_id", all.map((p) => p.id))
    .in("model", models)
    .order("created_at", { ascending: false })
    .limit(5000);
  const newest = new Map();
  for (const r of recent || []) if (!newest.has(r.prompt_id)) newest.set(r.prompt_id, r.created_at);
  const queue = [...all].sort((a, b) => (newest.get(a.id) || "").localeCompare(newest.get(b.id) || ""));

  const { data: profiles } = await admin
    .from("company_profiles")
    .select("id, company_name")
    .in("id", [...new Set(queue.map((p) => p.company_profile_id))]);
  const brandById = new Map((profiles || []).map((p) => [p.id, p.company_name]));

  let n = 0;
  for (const prompt of queue) {
    // One prompt needs a call per Cloro engine, in series.
    if (deadline - Date.now() < 45000) break;
    const brand = brandById.get(prompt.company_profile_id);
    if (!brand) continue;
    const results = await checkPrompt(prompt.text, brand, { deadline, only: models }).catch(() => null);
    if (!results) continue;
    await persistCheckResults(admin, {
      promptId: prompt.id,
      userId: prompt.user_id,
      results,
      checkedAt: new Date().toISOString(),
      touchCheckedAt: false,
    });
    n++;
  }
  return n;
}
