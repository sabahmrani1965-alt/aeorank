import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPosts } from "@/lib/reddit";
import { scoreMentionSentiment, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEARCH_LIMIT = 20;

// Free — unlike Opportunities/AI-visibility, this is a plain Reddit search
// + sentiment classification, not a per-thread Apify fetch, so there's no
// meaningful per-refresh cost to pass on.
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

  // Search the brand name plus any distinct name variations on file (e.g.
  // abbreviations, alternate spellings) so mentions using a variant instead
  // of the exact company_name string still get caught.
  const variations = Array.isArray(profile?.brand_variations) ? profile.brand_variations.filter(Boolean) : [];
  const queries = [brand, ...variations].filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i).slice(0, 3);
  const perQueryLimit = Math.max(8, Math.ceil(SEARCH_LIMIT / queries.length));

  try {
    const results = await Promise.all(queries.map((q) => searchPosts(q, perQueryLimit)));
    const merged = [...new Map(results.flat().map((p) => [p.permalink, p])).values()];

    // searchPosts's underlying providers rank by topical relevance, not
    // literal string match — a post can come back for query "SaaSOffers"
    // just for mentioning "SaaS" generically nearby, with no actual
    // reference to the brand. Only keep results where the brand name or a
    // known variation genuinely appears in the fetched title/snippet text,
    // so "mentions" means an actual mention, not a loose topical match.
    const needles = queries.map((q) => q.toLowerCase());
    const deduped = merged
      .filter((p) => {
        const haystack = `${p.title} ${p.snippet || ""}`.toLowerCase();
        return needles.some((n) => haystack.includes(n));
      })
      .slice(0, SEARCH_LIMIT + 10);

    if (deduped.length === 0) {
      await supabase.from("mentions").delete().eq("user_id", user.id).eq("company_profile_id", profile.id);
      return NextResponse.json({ ok: true, count: 0 });
    }

    const sentiments = isLlmConfigured() ? await scoreMentionSentiment(deduped, brand) : null;

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
      sentiment: sentiments?.[i]?.sentiment || null,
      sentiment_reason: sentiments?.[i]?.reason || null,
    }));

    await supabase.from("mentions").delete().eq("user_id", user.id).eq("company_profile_id", profile.id);
    const { error: insertError } = await supabase.from("mentions").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("[mentions/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh mentions." }, { status: 500 });
  }
}
