import { searchPosts } from "@/lib/reddit";
import { pickCategoryQuery } from "@/lib/keywords";
import { scoreOpportunities, generateOpportunityQueries, isLlmConfigured } from "@/lib/llm";

const SEARCH_LIMIT = 20;
const MAX_STORED = 300;
const MAX_QUERIES = 6;

// Core opportunity-discovery logic, shared by the manual "Refresh" button
// (app/api/opportunities/refresh/route.js) and any admin/service-role
// caller (e.g. app/api/admin/notify-activated) — searches Reddit using
// tracked keywords plus AI-generated queries grounded in the brand's
// description, scores relevance, keeps only genuinely new permalinks, and
// prunes the oldest unsaved rows beyond MAX_STORED. `db` is any Supabase
// client (user-scoped or service-role admin) with the same query-builder
// shape.
export async function refreshOpportunitiesForBrand(db, { userId, companyProfileId, brand, description, trackedKeywords = [] }) {
  const keywordQueries = trackedKeywords.slice(0, MAX_QUERIES);
  const aiQueries = isLlmConfigured() ? await generateOpportunityQueries(brand, description) : null;
  const fallbackQueries = aiQueries?.length ? aiQueries : [pickCategoryQuery(description, brand)];
  const queries = [...new Set([...keywordQueries, ...fallbackQueries])].slice(0, MAX_QUERIES);
  const perQueryLimit = Math.max(6, Math.ceil(SEARCH_LIMIT / queries.length));

  const [results, existingRes] = await Promise.all([
    Promise.all(queries.map((q) => searchPosts(q, perQueryLimit))),
    db.from("opportunities").select("permalink").eq("user_id", userId).eq("company_profile_id", companyProfileId),
  ]);
  const found = [...new Map(results.flat().map((p) => [p.permalink, p])).values()].slice(0, SEARCH_LIMIT + 10);
  const existingPermalinks = new Set((existingRes.data || []).map((r) => r.permalink));
  const fresh = found.filter((p) => !existingPermalinks.has(p.permalink));
  if (fresh.length === 0) return { added: 0 };

  const scores = isLlmConfigured() ? await scoreOpportunities(fresh, description || brand) : null;

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
    relevance_score: scores?.[i]?.score ?? null,
    relevance_reason: scores?.[i]?.reason || null,
    relevance_reasons: scores?.[i]?.reasons?.length ? scores[i].reasons : null,
    buying_intent: scores?.[i]?.buyingIntent ?? null,
  }));

  const { error: insertError } = await db.from("opportunities").insert(rows);
  if (insertError) throw insertError;

  const { data: unsaved } = await db
    .from("opportunities")
    .select("id, fetched_at")
    .eq("user_id", userId)
    .eq("company_profile_id", companyProfileId)
    .eq("saved", false)
    .order("fetched_at", { ascending: true });
  if (unsaved && unsaved.length > MAX_STORED) {
    const staleIds = unsaved.slice(0, unsaved.length - MAX_STORED).map((r) => r.id);
    await db.from("opportunities").delete().in("id", staleIds);
  }

  return { added: rows.length };
}
