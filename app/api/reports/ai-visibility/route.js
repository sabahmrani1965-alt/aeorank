import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";
import { pickCategoryQuery } from "@/lib/keywords";

export const runtime = "nodejs";
export const maxDuration = 30;

// On-demand re-check of an existing customer's own brand — free, same as
// the anonymous/logged-in "analyze a URL" report (app/report/[brand]).
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

  const aiVisibility = await analyzeBrandVisibility(brand, categoryQuery);
  if (!aiVisibility) {
    return NextResponse.json({ error: "Could not generate the report. Try again." }, { status: 500 });
  }

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

  return NextResponse.json({ ok: true, reportId: report.id });
}
