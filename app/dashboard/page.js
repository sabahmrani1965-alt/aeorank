import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Thresholds match components/ScoreBadge.js (Opportunities page) so the
// same relevance_score doesn't show as a different tier color depending
// on which page it's viewed from.
function scoreColor(score) {
  if (score == null) return { bg: "var(--state-neutral-bg)", fg: "var(--text-dim)" };
  if (score >= 85) return { bg: "var(--state-success-bg)", fg: "var(--state-success-fg)" };
  if (score >= 60) return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  return { bg: "var(--state-danger-bg)", fg: "var(--state-danger-fg)" };
}

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const [
    { data: reports },
    { data: subs },
    { count: unpostedCount },
    { data: opportunities },
    { count: mentionsCount },
    { data: balanceRow },
    { count: activePromptsCount },
  ] = await Promise.all([
    profile
      ? supabase
          .from("reports")
          .select("id, brand, score, created_at")
          .eq("user_id", user.id)
          .eq("company_profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    profile
      ? supabase
          .from("report_drafts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("company_profile_id", profile.id)
          .eq("posted", false)
      : Promise.resolve({ count: 0 }),
    profile
      ? supabase
          .from("opportunities")
          .select("id, sub, title, snippet, permalink, relevance_score, relevance_reason")
          .eq("user_id", user.id)
          .eq("company_profile_id", profile.id)
          .order("relevance_score", { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] }),
    profile
      ? supabase
          .from("mentions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("company_profile_id", profile.id)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle(),
    profile
      ? supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("company_profile_id", profile.id)
          .eq("active", true)
      : Promise.resolve({ count: 0 }),
  ]);

  // Most recent report per brand — reports are already newest-first, so the
  // first occurrence of each brand is the latest one.
  const latestByBrand = [];
  const seen = new Set();
  for (const r of reports || []) {
    if (seen.has(r.brand)) continue;
    seen.add(r.brand);
    latestByBrand.push(r);
  }

  const sub = subs?.[0] || null;
  const topOpportunity = opportunities?.[0] || null;
  const highPriorityCount = (opportunities || []).filter((o) => o.relevance_score >= 80).length;
  const visibilityScore = latestByBrand[0]?.score ?? null;
  const firstName = (user.email || "").split("@")[0];

  return (
    <section className="dashboard-page">
      <h1 className="command-greeting">
        {greeting()}, {firstName}
      </h1>
      <p className="command-greeting-sub">Here's what's worth your attention today.</p>

      <div className="command-summary-grid">
        <div className="kpi">
          <div className="kpi-label">New opportunities</div>
          <div className="kpi-value">{opportunities?.length || 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High priority threads</div>
          <div className="kpi-value">{highPriorityCount}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Brand mentions</div>
          <div className="kpi-value">{mentionsCount || 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tasks waiting</div>
          <div className="kpi-value">{unpostedCount || 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Credits remaining</div>
          <div className="kpi-value">{balanceRow?.balance ?? 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">AI visibility</div>
          <div className="kpi-value">{visibilityScore == null ? "-" : `${visibilityScore}%`}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Prompts tracked</div>
          <div className="kpi-value">{activePromptsCount || 0}</div>
        </div>
      </div>

      <div className="quick-actions">
        <Link href="/dashboard/opportunities" className="quick-action">
          <span className="quick-action-icon">◎</span>
          <span className="quick-action-label">Find opportunities</span>
        </Link>
        <Link href="/dashboard/drafts/new" className="quick-action">
          <span className="quick-action-icon">✎</span>
          <span className="quick-action-label">Add task</span>
        </Link>
        <Link href="/dashboard/prompts" className="quick-action">
          <span className="quick-action-icon">❓</span>
          <span className="quick-action-label">Check a prompt</span>
        </Link>
        <Link href="/dashboard/reports" className="quick-action">
          <span className="quick-action-icon">▲</span>
          <span className="quick-action-label">Generate report</span>
        </Link>
      </div>

      {topOpportunity && (
        <div className="opportunity-spotlight">
          <span className="opportunity-spotlight-eyebrow">Top opportunity right now</span>
          <div className="opportunity-spotlight-meta">
            {topOpportunity.sub}
            {topOpportunity.relevance_score != null && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: scoreColor(topOpportunity.relevance_score).bg,
                  color: scoreColor(topOpportunity.relevance_score).fg,
                }}
              >
                Relevance: {topOpportunity.relevance_score}/100
              </span>
            )}
          </div>
          <div className="opportunity-spotlight-title">{topOpportunity.title}</div>
          {topOpportunity.relevance_reason && (
            <p className="opportunity-spotlight-reason">{topOpportunity.relevance_reason}</p>
          )}
          <div className="opportunity-spotlight-actions">
            <Link
              href={`/dashboard/drafts/new?url=${encodeURIComponent(topOpportunity.permalink || "")}`}
              className="btn btn-primary btn-sm"
            >
              Generate Reply →
            </Link>
            <a href={topOpportunity.permalink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              View thread ↗
            </a>
          </div>
        </div>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Your brands</h3>
          <span style={{ color: "var(--text-dim)", fontSize: 13.5, textTransform: "capitalize" }}>
            {sub ? `${sub.plan} plan` : "No active plan"}
          </span>
        </div>
        {latestByBrand.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No reports yet. Analyze a website above to generate your first one.
          </div>
        ) : (
          <div className="sub-grid">
            {latestByBrand.map((r) => (
              <Link key={r.id} href={`/dashboard/reports/${r.id}`} className="sub-card">
                <div className="sub-head">
                  <div className="sub-name">{r.brand}</div>
                </div>
                <div className="sub-members">
                  {r.score == null ? "No score yet" : `${r.score}% AI visibility`}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
