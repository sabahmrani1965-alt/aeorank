import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPosts } from "@/lib/reddit";
import { pickCategoryQuery } from "@/lib/keywords";
import { scoreOpportunities, isLlmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("company_name, description, website")
    .eq("user_id", user.id)
    .maybeSingle();

  const description = profile?.description || "";
  const brand = profile?.company_name || "";
  if (!description && !brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what to search for." },
      { status: 400 }
    );
  }

  const categoryQuery = pickCategoryQuery(description, brand);

  try {
    const posts = await searchPosts(categoryQuery, 20);
    const deduped = [...new Map(posts.map((p) => [p.permalink, p])).values()];

    if (deduped.length === 0) {
      await supabase.from("opportunities").delete().eq("user_id", user.id);
      return NextResponse.json({ ok: true, count: 0 });
    }

    const scores = isLlmConfigured()
      ? await scoreOpportunities(deduped, description || brand)
      : null;

    const rows = deduped.map((p, i) => ({
      user_id: user.id,
      sub: p.sub,
      title: p.title,
      snippet: p.snippet || null,
      permalink: p.permalink,
      ups: p.ups || 0,
      comments: p.comments || 0,
      post_created_at: p.created ? new Date(p.created).toISOString() : null,
      relevance_score: scores?.[i]?.score ?? null,
      relevance_reason: scores?.[i]?.reason || null,
    }));

    // Replace, not append — a refresh reflects the current search, not an
    // ever-growing history.
    await supabase.from("opportunities").delete().eq("user_id", user.id);
    const { error: insertError } = await supabase.from("opportunities").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("[opportunities/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh opportunities." }, { status: 500 });
  }
}
