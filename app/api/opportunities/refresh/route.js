import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPosts } from "@/lib/reddit";
import { pickCategoryQuery } from "@/lib/keywords";
import { scoreOpportunities, generateOpportunityQueries, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEARCH_LIMIT = 20;

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

  // Prefer specific, description-grounded queries over the single generic
  // category bucket pickCategoryQuery falls back to (e.g. any "SaaS" mention
  // locks onto "SaaS startup", drowning out what the company actually does —
  // see lib/llm.js's generateOpportunityQueries for the full reasoning).
  const aiQueries = isLlmConfigured() ? await generateOpportunityQueries(brand, description) : null;
  const queries = aiQueries?.length ? aiQueries : [pickCategoryQuery(description, brand)];
  const perQueryLimit = Math.max(6, Math.ceil(SEARCH_LIMIT / queries.length));

  try {
    const results = await Promise.all(queries.map((q) => searchPosts(q, perQueryLimit)));
    const deduped = [...new Map(results.flat().map((p) => [p.permalink, p])).values()].slice(0, SEARCH_LIMIT + 10);

    if (deduped.length === 0) {
      await supabase
        .from("opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .eq("saved", false);
      return NextResponse.json({ ok: true, count: 0 });
    }

    const scores = isLlmConfigured()
      ? await scoreOpportunities(deduped, description || brand)
      : null;

    const rows = deduped.map((p, i) => ({
      user_id: user.id,
      company_profile_id: profile.id,
      sub: p.sub,
      title: p.title,
      snippet: p.snippet || null,
      permalink: p.permalink,
      ups: p.ups || 0,
      comments: p.comments || 0,
      post_created_at: p.created ? new Date(p.created).toISOString() : null,
      relevance_score: scores?.[i]?.score ?? null,
      relevance_reason: scores?.[i]?.reason || null,
      relevance_reasons: scores?.[i]?.reasons?.length ? scores[i].reasons : null,
      buying_intent: scores?.[i]?.buyingIntent ?? null,
    }));

    // Replace, not append — a refresh reflects the current search, not an
    // ever-growing history. Saved rows are pinned and skip this wipe.
    await supabase
      .from("opportunities")
      .delete()
      .eq("user_id", user.id)
      .eq("company_profile_id", profile.id)
      .eq("saved", false);
    const { error: insertError } = await supabase.from("opportunities").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("[opportunities/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh opportunities." }, { status: 500 });
  }
}
