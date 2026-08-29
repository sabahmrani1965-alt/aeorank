import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refreshOpportunitiesForBrand } from "@/lib/opportunities";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_QUERIES = 6;

// Free for any customer with an active plan — same as Mentions refresh,
// no credits charged.
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

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what to search for." },
      { status: 400 }
    );
  }

  const description = profile?.description || "";
  const brand = profile?.company_name || "";
  if (!description && !brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what to search for." },
      { status: 400 }
    );
  }

  // Customer-tracked keywords (app/dashboard/keywords) take priority over
  // AI-guessed queries — the whole point of that tab is to let a customer
  // steer Opportunity discovery toward what they actually know their
  // buyers search for, not just what an LLM infers from the company
  // description.
  const { data: trackedKeywordRows } = await supabase
    .from("tracked_keywords")
    .select("keyword")
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(MAX_QUERIES);
  const trackedKeywords = (trackedKeywordRows || []).map((k) => k.keyword);

  try {
    const { added } = await refreshOpportunitiesForBrand(supabase, {
      userId: user.id,
      companyProfileId: profile.id,
      brand,
      description,
      trackedKeywords,
    });
    return NextResponse.json({ ok: true, added });
  } catch (e) {
    console.error("[opportunities/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh opportunities." }, { status: 500 });
  }
}
