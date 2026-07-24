import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPosts } from "@/lib/reddit";
import { scoreMentionSentiment, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEARCH_LIMIT = 20;
// Soft cap on stored rows per brand — old ones beyond this get pruned,
// oldest first, so the accumulated pool doesn't grow unbounded.
const MAX_STORED = 300;

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
    // The existing-permalinks lookup doesn't depend on the search results,
    // so it runs concurrently with the search fan-out rather than after it.
    const [results, existingRes] = await Promise.all([
      Promise.all(queries.map((q) => searchPosts(q, perQueryLimit))),
      supabase.from("mentions").select("permalink").eq("user_id", user.id).eq("company_profile_id", profile.id),
    ]);
    const merged = [...new Map(results.flat().map((p) => [p.permalink, p])).values()];

    // searchPosts's underlying providers rank by topical relevance, not
    // literal string match — a post can come back for query "SaaSOffers"
    // just for mentioning "SaaS" generically nearby, with no actual
    // reference to the brand. Only keep results where the brand name or a
    // known variation genuinely appears in the fetched title/snippet text,
    // so "mentions" means an actual mention, not a loose topical match.
    const needles = queries.map((q) => q.toLowerCase());
    const found = merged
      .filter((p) => {
        const haystack = `${p.title} ${p.snippet || ""}`.toLowerCase();
        return needles.some((n) => haystack.includes(n));
      })
      .slice(0, SEARCH_LIMIT + 10);

    // Accumulate, don't replace — a growing pool of discovered mentions
    // instead of a single point-in-time snapshot wiped on every refresh.
    // Only genuinely new permalinks get scored/inserted.
    const existingPermalinks = new Set((existingRes.data || []).map((r) => r.permalink));
    const fresh = found.filter((p) => !existingPermalinks.has(p.permalink));

    if (fresh.length === 0) {
      return NextResponse.json({ ok: true, added: 0 });
    }

    const sentiments = isLlmConfigured() ? await scoreMentionSentiment(fresh, brand) : null;

    const rows = fresh.map((p, i) => ({
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

    const { error: insertError } = await supabase.from("mentions").insert(rows);
    if (insertError) throw insertError;

    // Prune oldest rows beyond the soft cap so the pool doesn't grow
    // unbounded.
    const { data: all } = await supabase
      .from("mentions")
      .select("id, fetched_at")
      .eq("user_id", user.id)
      .eq("company_profile_id", profile.id)
      .order("fetched_at", { ascending: true });
    if (all && all.length > MAX_STORED) {
      const staleIds = all.slice(0, all.length - MAX_STORED).map((r) => r.id);
      await supabase.from("mentions").delete().in("id", staleIds);
    }

    return NextResponse.json({ ok: true, added: rows.length });
  } catch (e) {
    console.error("[mentions/refresh] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not refresh mentions." }, { status: 500 });
  }
}
