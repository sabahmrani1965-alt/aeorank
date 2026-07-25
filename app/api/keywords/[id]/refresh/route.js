import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { checkKeywordVolume } from "@/lib/keywordVolume";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req, { params }) {
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

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: "Complete your company profile first." }, { status: 400 });
  }

  // Scoped to the active brand, not just user_id — a user with 2+ brands
  // could otherwise pass a keyword id that's still their own row but
  // belongs to a different brand than the one currently active.
  const { data: row } = await admin
    .from("tracked_keywords")
    .select("id, keyword")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "Keyword not found." }, { status: 404 });
  }

  const volume = await checkKeywordVolume(row.keyword);
  const checkedAt = new Date().toISOString();

  const { error } = await admin
    .from("tracked_keywords")
    .update({
      last_checked_at: checkedAt,
      last_post_count: volume.postCount,
      last_top_subreddits: volume.topSubreddits,
      last_sample_posts: volume.samplePosts,
    })
    .eq("id", row.id);

  if (error) {
    console.error("[keywords/refresh] save failed:", error.message);
    return NextResponse.json({ error: "Could not refresh this keyword." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...volume, checkedAt });
}
