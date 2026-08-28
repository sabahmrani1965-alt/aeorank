import { searchPosts } from "@/lib/reddit";
import { scoreMentionSentiment, isLlmConfigured } from "@/lib/llm";

const SEARCH_LIMIT = 20;
// Soft cap on stored rows per brand — old ones beyond this get pruned,
// oldest first, so the accumulated pool doesn't grow unbounded.
const MAX_STORED = 300;

// Core mention-discovery logic, shared by the manual "Refresh" button
// (app/api/mentions/refresh/route.js) and the automated cron
// (app/api/cron/refresh-mentions/route.js): searches Reddit for the brand
// name plus any known variations, keeps only genuinely new permalinks,
// scores sentiment, inserts, and prunes the oldest rows beyond
// MAX_STORED. `db` is any Supabase client (user-scoped or service-role
// admin) with the same query-builder shape.
export async function refreshMentionsForBrand(db, { userId, companyProfileId, brand, variations = [] }) {
  const name = (brand || "").trim();
  if (!name) return { added: 0 };

  const queries = [name, ...variations.filter(Boolean)]
    .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i)
    .slice(0, 3);
  const perQueryLimit = Math.max(8, Math.ceil(SEARCH_LIMIT / queries.length));

  const [results, existingRes] = await Promise.all([
    Promise.all(queries.map((q) => searchPosts(q, perQueryLimit))),
    db.from("mentions").select("permalink").eq("user_id", userId).eq("company_profile_id", companyProfileId),
  ]);
  const merged = [...new Map(results.flat().map((p) => [p.permalink, p])).values()];

  // searchPosts's underlying providers rank by topical relevance, not
  // literal string match, so only keep results where the brand name or a
  // known variation genuinely appears in the fetched title/snippet text.
  const needles = queries.map((q) => q.toLowerCase());
  const found = merged
    .filter((p) => {
      const haystack = `${p.title} ${p.snippet || ""}`.toLowerCase();
      return needles.some((n) => haystack.includes(n));
    })
    .slice(0, SEARCH_LIMIT + 10);

  const existingPermalinks = new Set((existingRes.data || []).map((r) => r.permalink));
  const fresh = found.filter((p) => !existingPermalinks.has(p.permalink));
  if (fresh.length === 0) return { added: 0 };

  const sentiments = isLlmConfigured() ? await scoreMentionSentiment(fresh, name) : null;
  const rows = fresh.map((p, i) => ({
    user_id: userId,
    company_profile_id: companyProfileId,
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

  const { error: insertError } = await db.from("mentions").insert(rows);
  if (insertError) throw insertError;

  const { data: all } = await db
    .from("mentions")
    .select("id, fetched_at")
    .eq("user_id", userId)
    .eq("company_profile_id", companyProfileId)
    .order("fetched_at", { ascending: true });
  if (all && all.length > MAX_STORED) {
    const staleIds = all.slice(0, all.length - MAX_STORED).map((r) => r.id);
    await db.from("mentions").delete().in("id", staleIds);
  }

  return { added: rows.length };
}
