import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription, getActivePlan } from "@/lib/subscription";
import { itemCreditCost } from "@/lib/credits";
import { getActiveCompanyProfile } from "@/lib/brands";
import OpportunityRefreshButton from "@/components/OpportunityRefreshButton";
import OpportunityList from "@/components/OpportunityList";
import RedeemCodeForm from "@/components/RedeemCodeForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadCitedRedditThreads, redditThreadId } from "@/lib/promptSources";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    const lockedProfile = await getActiveCompanyProfile(supabase, user.id);
    const { count: found } = lockedProfile
      ? await supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("company_profile_id", lockedProfile.id)
      : { count: 0 };
    return (
      <section className="dashboard-page">
        <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Discover</div>
        <h2 style={{ marginBottom: 16 }}>Reddit threads worth engaging with</h2>
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            {found
              ? `We found ${found} threads for ${lockedProfile.company_name || "your brand"}. Start your 7-day trial to open them all and draft comments.`
              : "This is available on any active plan."}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard/billing" className="btn btn-primary">
              View plans →
            </Link>
            <RedeemCodeForm />
          </div>
        </div>
      </section>
    );
  }

  const [profile, plan] = await Promise.all([getActiveCompanyProfile(supabase, user.id), getActivePlan(supabase, user.id)]);

  const { data: opportunities } = profile
    ? await supabase
        .from("opportunities")
        .select(
          "id, sub, title, snippet, thread_selftext, permalink, ups, comments, post_created_at, relevance_score, relevance_reason, relevance_reasons, buying_intent, saved, fetched_at"
        )
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("relevance_score", { ascending: false, nullsFirst: false })
    : { data: [] };

  // Reddit threads ChatGPT cited for this brand's tracked prompts: the
  // threads already feeding AI answers, so the ones most worth joining.
  const { data: prompts } = profile
    ? await supabase.from("prompts").select("id, text").eq("user_id", user.id).eq("company_profile_id", profile.id)
    : { data: [] };
  const cited = await loadCitedRedditThreads(createAdminClient(), prompts || []);
  const citedById = new Map(cited.map((t) => [t.id, t]));
  const withCitations = (opportunities || []).map((o) => {
    const t = citedById.get(redditThreadId(o.permalink));
    return t ? { ...o, cited_by: t.models } : o;
  });

  const hasProfile = Boolean(profile?.description || profile?.company_name);
  const competitors = profile?.competitors || [];

  // Opportunities now accumulate across refreshes instead of being replaced
  // each time (see app/api/opportunities/refresh/route.js), so the list is
  // ordered by relevance, not recency — the most recent fetch time has to
  // be found explicitly rather than read off the first row.
  const lastRefreshedAt = (opportunities || []).reduce(
    (max, o) => (!max || new Date(o.fetched_at) > new Date(max) ? o.fetched_at : max),
    null
  );

  return (
    <section className="dashboard-page-wide">
      <div className="op-head">
        <div>
          <h1 className="command-greeting">Opportunities</h1>
          <p className="command-greeting-sub" style={{ marginBottom: 0 }}>
            Reddit threads where your brand can genuinely help, scored for fit. Nothing goes live until you approve it.
          </p>
        </div>
        {hasProfile ? (
          <div className="op-head-actions">
            <OpportunityRefreshButton />
            {lastRefreshedAt && <span className="op-refreshed">Last refreshed {timeAgo(new Date(lastRefreshedAt).getTime())}</span>}
          </div>
        ) : null}
      </div>

      {cited.length > 0 && (
        <div className="op-cited">
          <div className="op-cited-head">
            <h2>Threads AI already cites for your prompts</h2>
            <p>
              When buyers ask your tracked questions, these Reddit threads are among the sources the AI engines use.
              A helpful comment here sits right where the answer comes from.
            </p>
          </div>
          <ul className="op-cited-list">
            {cited.slice(0, 5).map((t) => (
              <li key={t.id}>
                <span className="op-cited-main">
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="op-cited-title">
                    {t.title || t.url}
                  </a>
                  <span className="op-cited-meta">
                    {t.sub} · cited by {t.models.join(", ")}
                    {t.prompt ? <> for &ldquo;{t.prompt}&rdquo;</> : null}
                  </span>
                </span>
                <Link href={`/dashboard/drafts/new?url=${encodeURIComponent(t.url)}`} className="btn btn-primary btn-sm">
                  Draft a comment →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasProfile ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          Complete your company profile first so we know what to search for.{" "}
          <Link href="/dashboard/settings" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Go to settings →
          </Link>
        </div>
      ) : (
        !opportunities || opportunities.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No opportunities yet. Click "Refresh opportunities" to search Reddit.
          </div>
        ) : (
          <OpportunityList opportunities={withCitations} competitors={competitors} brandWebsite={profile?.website || ""} commentCost={itemCreditCost(plan, "comment")} />
        )
      )}
    </section>
  );
}
