import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: reports }, { data: subs }, { count: unpostedCount }] = await Promise.all([
    supabase
      .from("reports")
      .select("id, brand, score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("report_drafts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("posted", false),
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

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( overview )</span>
        <h2>Your dashboard</h2>
        <p className="section-sub">
          Signed in as <strong>{user.email}</strong>
        </p>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">Current plan</div>
            <div className="kpi-value" style={{ fontSize: 22, textTransform: "capitalize" }}>
              {sub ? sub.plan : "None"}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Reports generated</div>
            <div className="kpi-value">{reports?.length || 0}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Drafts to post</div>
            <div className="kpi-value">{unpostedCount || 0}</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>AI visibility by brand</h3>
          {latestByBrand.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No reports yet — generate one from the homepage while logged in.
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
      </div>
    </section>
  );
}
