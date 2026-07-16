import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription } from "@/lib/subscription";
import OpportunityRefreshButton from "@/components/OpportunityRefreshButton";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

function scoreColor(score) {
  if (score == null) return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
  if (score >= 80) return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (score >= 50) return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  return { bg: "rgba(255, 120, 120, 0.12)", fg: "#ff8a8a" };
}

export default async function OpportunitiesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( new opportunities )</span>
          <h2>Reddit threads worth engaging with</h2>
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
        </div>
      </section>
    );
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("description, company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, sub, title, snippet, permalink, ups, comments, post_created_at, relevance_score, relevance_reason, fetched_at")
    .eq("user_id", user.id)
    .order("relevance_score", { ascending: false, nullsFirst: false });

  const hasProfile = Boolean(profile?.description || profile?.company_name);

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( new opportunities )</span>
        <h2>Reddit threads worth engaging with</h2>
        <p className="section-sub">
          Real threads matched to your company profile, scored for
          relevance. Nothing here is posted automatically — browse and
          decide what's worth a reply from your own account.
        </p>

        {!hasProfile ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Complete your company profile first so we know what to search
            for. <Link href="/onboarding" style={{ color: "var(--accent)", fontWeight: 600 }}>Go to onboarding →</Link>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {opportunities.map((o) => {
                  const colors = scoreColor(o.relevance_score);
                  return (
                    <a
                      key={o.id}
                      href={o.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card"
                      style={{ display: "block", padding: 20 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <div className="post-meta">
                          <span>{o.sub}</span>
                          {o.post_created_at && (
                            <>
                              <span>·</span>
                              <span>{timeAgo(new Date(o.post_created_at).getTime())}</span>
                            </>
                          )}
                        </div>
                        {o.relevance_score != null && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: colors.bg,
                              color: colors.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Relevance: {o.relevance_score}/100
                          </span>
                        )}
                      </div>
                      <div className="post-title">{o.title}</div>
                      {o.snippet && <div className="post-snippet">{o.snippet}…</div>}
                      {(o.ups > 0 || o.comments > 0) && (
                        <div className="post-stats">
                          {o.ups > 0 && <span className="post-stat">↑ {o.ups.toLocaleString()}</span>}
                          {o.comments > 0 && <span className="post-stat">💬 {o.comments.toLocaleString()}</span>}
                        </div>
                      )}
                      {o.relevance_reason && (
                        <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
                          {o.relevance_reason}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
