import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchThread } from "@/lib/reddit";
import { analyzeThread, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
// Matches every other route's budget here — confirmed via lib/reddit.js's
// own APIFY_TIMEOUT_MS comment that the deployed Vercel plan caps function
// runtime at 30s regardless of what a higher maxDuration would declare.
export const maxDuration = 30;

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!(await hasActiveSubscription(supabase, user.id))) {
    return NextResponse.json({ error: "This requires an active plan." }, { status: 403 });
  }

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI analysis isn't configured." }, { status: 500 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const opportunityId = String(body?.opportunityId || "").trim();
  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunity." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const { data: opportunity } = await admin
    .from("opportunities")
    .select("id, title, permalink")
    .eq("id", opportunityId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("description, company_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const companyDescription = profile?.description || profile?.company_name || "";

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "thread_analysis",
    amount: CREDIT_COSTS.thread_analysis,
    description: `Analyzed a thread in ${opportunity.title.slice(0, 60)}`,
    metadata: { opportunityId },
    run: async () => {
      const thread = await fetchThread(opportunity.permalink);
      if (!thread) return null;
      return analyzeThread({
        title: opportunity.title,
        selftext: thread.selftext,
        comments: thread.comments,
        companyDescription,
      });
    },
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json(
      { error: "Couldn't fetch or analyze that thread. It may have been removed or is temporarily unavailable." },
      { status: 502 }
    );
  }

  const analysis = outcome.result;
  const analyzedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("opportunities")
    .update({
      analysis_summary: analysis.summary,
      analysis_pain_points: analysis.painPoints,
      analysis_competitors_mentioned: analysis.competitorsMentioned,
      analysis_response_angle: analysis.responseAngle,
      analyzed_at: analyzedAt,
    })
    .eq("id", opportunityId);
  if (updateError) {
    console.error("[opportunities/analyze] save failed:", updateError.message);
  }

  return NextResponse.json({
    ok: true,
    analysis: { ...analysis, analyzedAt },
    creditsRemaining: outcome.balance,
  });
}
