import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPrompt, isAiVisibilityConfigured } from "@/lib/aivisibility";
import { runWithConcurrency } from "@/lib/concurrency";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  if (!isAuthorizedCronRequest(req)) {
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
  if (!prompts || prompts.length === 0) return NextResponse.json({ checked: 0 });

  // Brand name needed per prompt for checkPrompt() — batch-load every
  // distinct company_profile referenced instead of one query per prompt.
  const profileIds = [...new Set(prompts.map((p) => p.company_profile_id))];
  const { data: profiles } = await admin
    .from("company_profiles")
    .select("id, company_name")
    .in("id", profileIds);
  const brandById = new Map((profiles || []).map((p) => [p.id, p.company_name]));

  let checked = 0;
  await runWithConcurrency(prompts, CONCURRENCY, async (prompt) => {
    const brand = brandById.get(prompt.company_profile_id);
    if (!brand) return;
    const result = await checkPrompt(prompt.text, brand).catch((e) => {
      console.error("[cron/check-prompts] checkPrompt failed:", e?.message || e);
      return null;
    });
    if (!result) return;
    const checkedAt = new Date().toISOString();
    await admin
      .from("prompts")
      .update({
        last_checked_at: checkedAt,
        last_mentioned: result.mentioned,
        last_position: result.position,
        last_brands: result.brands,
        last_answer: result.answer,
        last_model: result.model,
      })
      .eq("id", prompt.id);
    await admin.from("prompt_checks").insert({
      prompt_id: prompt.id,
      user_id: prompt.user_id,
      mentioned: result.mentioned,
      position: result.position,
      brands: result.brands,
      answer: result.answer,
      model: result.model,
      created_at: checkedAt,
    });
    checked++;
  });

  return NextResponse.json({ checked, candidates: prompts.length });
}
