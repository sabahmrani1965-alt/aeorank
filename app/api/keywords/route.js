import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import { checkKeywordVolume } from "@/lib/keywordVolume";

export const runtime = "nodejs";
export const maxDuration = 30;

const SELECT_FIELDS = "id, keyword, last_checked_at, last_post_count, last_top_subreddits, last_sample_posts, created_at";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) return NextResponse.json({ keywords: [] });

  const { data, error } = await supabase
    .from("tracked_keywords")
    .select(SELECT_FIELDS)
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load keywords." }, { status: 500 });
  }

  return NextResponse.json({ keywords: data || [] });
}

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const keyword = String(body?.keyword || "").trim().slice(0, 100);
  if (!keyword) {
    return NextResponse.json({ error: "Enter a keyword." }, { status: 400 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: "Complete your company profile first." }, { status: 400 });
  }

  // Best-effort initial check — a keyword still gets saved even if the
  // real-time Reddit search fails, just with a null/"not checked yet"
  // state the customer can retry via "Check now".
  const volume = await checkKeywordVolume(keyword).catch(() => null);
  const checkedAt = volume ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("tracked_keywords")
    .insert({
      user_id: user.id,
      company_profile_id: profile.id,
      keyword,
      last_checked_at: checkedAt,
      last_post_count: volume?.postCount ?? null,
      last_top_subreddits: volume?.topSubreddits ?? null,
      last_sample_posts: volume?.samplePosts ?? null,
    })
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    console.error("[keywords] create failed:", error.message);
    return NextResponse.json({ error: "Could not save this keyword." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, keyword: data });
}
