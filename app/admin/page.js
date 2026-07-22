import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( admin )</span>
          <h2>Admin overview</h2>
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Supabase service role key isn't configured.
          </div>
        </div>
      </section>
    );
  }

  const [{ data: users }, { data: subs }, { data: reports }, { data: drafts }] =
    await Promise.all([
      admin.from("users").select("id, email, created_at, role"),
      admin
        .from("subscriptions")
        .select("user_id, plan, status, created_at")
        .order("created_at", { ascending: false }),
      admin.from("reports").select("user_id"),
      admin.from("report_drafts").select("user_id, posted"),
    ]);

  // Latest subscription per user — subs are already newest-first.
  const latestSubByUser = new Map();
  for (const s of subs || []) {
    if (!latestSubByUser.has(s.user_id)) latestSubByUser.set(s.user_id, s);
  }
  const latestSubs = [...latestSubByUser.values()];
  const activeSubs = latestSubs.filter((s) => s.status === "active");

  const planCounts = { starter: 0, growth: 0, scale: 0 };
  let mrr = 0;
  for (const s of activeSubs) {
    if (planCounts[s.plan] !== undefined) planCounts[s.plan]++;
    mrr += PLANS[s.plan]?.amount || 0;
  }

  const postedDrafts = (drafts || []).filter((d) => d.posted).length;
  const unpostedDrafts = (drafts || []).length - postedDrafts;

  const aeorankUserCount = (users || []).filter((u) => u.role === "customer").length;
  const crewquestUserCount = (users || []).filter((u) => u.role === "poster").length;

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>Admin overview</h2>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">AEOrank users</div>
            <div className="kpi-value">{aeorankUserCount}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">CrewQuest users</div>
            <div className="kpi-value">{crewquestUserCount}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Active subscriptions</div>
            <div className="kpi-value">{activeSubs.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Est. MRR</div>
            <div className="kpi-value">${(mrr / 100).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-row" style={{ marginTop: 16 }}>
          <div className="kpi">
            <div className="kpi-label">Reports generated</div>
            <div className="kpi-value">{reports?.length || 0}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Drafts posted</div>
            <div className="kpi-value">{postedDrafts}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Drafts pending</div>
            <div className="kpi-value">{unpostedDrafts}</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Active subscriptions by plan</h3>
          <div className="kpi-row">
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan} className="kpi">
                <div className="kpi-label" style={{ textTransform: "capitalize" }}>{plan}</div>
                <div className="kpi-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
