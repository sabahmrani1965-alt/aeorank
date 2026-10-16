import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription, getActivePlan } from "@/lib/subscription";
import { itemCreditCost } from "@/lib/credits";
import { getActiveCompanyProfile } from "@/lib/brands";
import OpportunityRefreshButton from "@/components/OpportunityRefreshButton";
import OpportunityList from "@/components/OpportunityList";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="dashboard-page">
        <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Discover</div>
        <h2 style={{ marginBottom: 16 }}>Reddit threads worth engaging with</h2>
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            This is available on any active plan.
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
            Reddit threads where your brand can genuinely help, scored for fit. Nothing is posted automatically.
          </p>
        </div>
        {hasProfile ? (
          <div className="op-head-actions">
            <OpportunityRefreshButton />
            {lastRefreshedAt && <span className="op-refreshed">Last refreshed {timeAgo(new Date(lastRefreshedAt).getTime())}</span>}
          </div>
        ) : null}
      </div>

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
          <OpportunityList opportunities={opportunities} competitors={competitors} brandWebsite={profile?.website || ""} commentCost={itemCreditCost(plan, "comment")} />
        )
      )}
    </section>
  );
}
