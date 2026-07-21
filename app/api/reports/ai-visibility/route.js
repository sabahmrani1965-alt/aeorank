import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";
import { pickCategoryQuery } from "@/lib/keywords";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

// On-demand re-check of an existing customer's own brand — distinct from
// the free anonymous/logged-in "analyze a URL" report (app/report/[brand]),
// which stays unmetered as the lead-gen funnel. This reruns just the AI
// visibility check against the profile's brand, credit-metered.
export async function POST() {
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

  if (!isAiVisibilityConfigured()) {
    return NextResponse.json({ error: "AI visibility checks aren't configured." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const brand = profile?.company_name || "";
  const description = profile?.description || "";
  if (!brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know which brand to check." },
      { status: 400 }
    );
  }
  const categoryQuery = pickCategoryQuery(description, brand);

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "ai_visibility_report",
    amount: CREDIT_COSTS.ai_visibility_report,
    description: `AI visibility report for ${brand}`,
    metadata: { brand, categoryQuery },
    run: () => analyzeBrandVisibility(brand, categoryQuery),
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not generate the report. Try again." }, { status: 500 });
  }

  const aiVisibility = outcome.result;

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      company_profile_id: profile.id,
      brand,
      url: profile?.website || null,
      score: aiVisibility.score,
      total: aiVisibility.total,
      hits: aiVisibility.hits,
      competitors: aiVisibility.competitors || [],
      rows: aiVisibility.rows,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[reports/ai-visibility] insert failed:", insertError.message);
    return NextResponse.json({ error: "Report generated but could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reportId: report.id, creditsRemaining: outcome.balance });
}
