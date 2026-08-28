import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { refreshMentionsForBrand } from "@/lib/mentions";

export const runtime = "nodejs";
export const maxDuration = 60;

// Free — unlike Opportunities/AI-visibility, this is a plain Reddit search
// + sentiment classification, not a per-thread Apify fetch, so there's no
// meaningful per-refresh cost to pass on. Same search+sentiment logic as
// app/api/cron/refresh-mentions/route.js, which runs this automatically
// on a schedule; this route is what "Refresh" in the dashboard calls for
// an on-demand check in between.
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

  const brand = profile?.company_name || "";
  if (!brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what brand to search for." },
      { status: 400 }
    );
  }

  try {
    const variations = Array.isArray(profile?.brand_variations) ? profile.brand_variations.filter(Boolean) : [];
    const { added } = await refreshMentionsForBrand(supabase, {
      userId: user.id,
      companyProfileId: profile.id,
      brand,
      variations,
    });
    return NextResponse.json({ ok: true, added });
  } catch (e) {
    console.error("[mentions/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh mentions." }, { status: 500 });
  }
}
