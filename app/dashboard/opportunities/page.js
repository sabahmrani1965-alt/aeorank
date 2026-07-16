import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription } from "@/lib/subscription";
import { CREDIT_COSTS } from "@/lib/credits";
import OpportunityRefreshButton from "@/components/OpportunityRefreshButton";
import OpportunityCard from "@/components/OpportunityCard";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

// company_profiles.competitors stores competitor URLs, not clean brand
// names — reduce a URL to its bare domain label so it can be matched
// against plain-text post titles/snippets (nobody writes full URLs in a
// casual Reddit post title).
function domainLabel(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").split(".")[0] || "";
  } catch {
    return "";
  }
}

function findCompetitorMention(text, competitors) {
  if (!text || !competitors?.length) return null;
  const compact = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const c of competitors) {
    const label = domainLabel(c).toLowerCase();
    if (label.length >= 3 && compact.includes(label)) return label;
  }
  return null;
}

function freshnessLabel(postCreatedAt) {
  if (!postCreatedAt) return null;
  const hours = (Date.now() - new Date(postCreatedAt).getTime()) / 3600000;
  if (hours < 24) return "New";
  if (hours < 24 * 7) return "This week";
  return "Older";
}

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

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("description, company_name, competitors")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select(
      "id, sub, title, snippet, permalink, ups, comments, post_created_at, relevance_score, relevance_reason, buying_intent, saved, analysis_summary, analysis_pain_points, analysis_competitors_mentioned, analysis_response_angle, analyzed_at, fetched_at"
    )
    .eq("user_id", user.id)
    .order("relevance_score", { ascending: false, nullsFirst: false });

  const hasProfile = Boolean(profile?.description || profile?.company_name);
  const competitors = profile?.competitors || [];
  const analyzeCost = CREDIT_COSTS.thread_analysis;

  const saved = (opportunities || []).filter((o) => o.saved);
  const rest = (opportunities || []).filter((o) => !o.saved);

  function renderCard(o) {
    return (
      <OpportunityCard
        key={o.id}
        opportunity={o}
        competitorMatch={findCompetitorMention(`${o.title} ${o.snippet || ""}`, competitors)}
        freshness={freshnessLabel(o.post_created_at)}
        analyzeCost={analyzeCost}
      />
    );
  }

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Discover</div>
      <h2 style={{ marginBottom: 8 }}>Reddit threads worth engaging with</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Real threads matched to your company profile, scored for relevance. Nothing here is
        posted automatically — browse and decide what's worth a reply from your own account.
      </p>

      {!hasProfile ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          Complete your company profile first so we know what to search for.{" "}
          <Link href="/dashboard/settings" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Go to settings →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <OpportunityRefreshButton />
            {opportunities?.length > 0 && (
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Last refreshed {timeAgo(new Date(opportunities[0].fetched_at).getTime())}
              </span>
            )}
          </div>

          {!opportunities || opportunities.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No opportunities yet — click "Refresh opportunities" to search Reddit.
            </div>
          ) : (
            <>
              {saved.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 14 }}>Saved</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {saved.map(renderCard)}
                  </div>
                </div>
              )}
              <div>
                {saved.length > 0 && <h3 style={{ marginBottom: 14 }}>All opportunities</h3>}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {rest.map(renderCard)}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
