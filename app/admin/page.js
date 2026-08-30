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

  const [{ data: users }, { data: subs }, { data: drafts }] =
    await Promise.all([
      admin.from("users").select("id, email, created_at, role"),
      admin
        .from("subscriptions")
        .select("user_id, plan, status, stripe_customer_id, created_at")
        .order("created_at", { ascending: false }),
      admin.from("report_drafts").select("user_id, posted"),
    ]);

  // Latest subscription per user — subs are already newest-first.
  const latestSubByUser = new Map();
  for (const s of subs || []) {
    if (!latestSubByUser.has(s.user_id)) latestSubByUser.set(s.user_id, s);
  }
  const latestSubs = [...latestSubByUser.values()];
  // Matches hasActiveSubscription() (lib/subscription.js) — a trialing
  // subscriber has real product access, same as an active one, so this
  // was undercounting anyone still in their trial window.
  const activeSubs = latestSubs.filter((s) => s.status === "active" || s.status === "trialing");
  // "Paying" means a real Stripe subscription actually being billed —
  // status='active' alone isn't enough: a manual/comp grant (see
  // lib/posterAccount... no, redeem_codes / admin's own manual_grant_admin
  // rows above) also sits at status='active' with no real charge behind
  // it. Real Stripe customer ids always start with "cus_"; comp/manual
  // grants use fixed non-Stripe placeholders ("comp", "manual_grant_admin").
  const isRealStripeCustomer = (s) => typeof s.stripe_customer_id === "string" && s.stripe_customer_id.startsWith("cus_");
  const payingSubs = activeSubs.filter((s) => s.status === "active" && isRealStripeCustomer(s));
  const trialingSubs = activeSubs.filter((s) => s.status === "trialing");

  // Includes 'comp' (redeem-code / manually-granted access, same table,
  // no real Stripe subscription behind it — see redeem_codes in
  // supabase/schema.sql) — previously dropped from this breakdown
  // entirely, so the by-plan cards didn't sum to the top KPI above.
  const planCounts = { starter: 0, growth: 0, scale: 0, comp: 0 };
  let mrr = 0;
  for (const s of activeSubs) {
    if (planCounts[s.plan] !== undefined) planCounts[s.plan]++;
    // Only a genuinely billing, real Stripe subscription counts toward
    // MRR — comp and manual grants (see isRealStripeCustomer above)
    // aren't real revenue, regardless of what plan they're tagged with.
    if (s.status === "active" && isRealStripeCustomer(s)) mrr += PLANS[s.plan]?.amount || 0;
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
            <div className="kpi-label">Paying subscriptions</div>
            <div className="kpi-value">{payingSubs.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">On trial</div>
            <div className="kpi-value">{trialingSubs.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Est. MRR</div>
            <div className="kpi-value">${(mrr / 100).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-row" style={{ marginTop: 16 }}>
          <div className="kpi">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value">{unpostedDrafts}</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Active subscriptions by plan</h3>
          <div className="kpi-row">
            {Object.entries(planCounts)
              // Comp (free/gifted access, no real Stripe plan) is still
              // counted in planCounts for accuracy elsewhere, just not
              // shown as its own card here.
              .filter(([plan]) => plan !== "comp")
              .map(([plan, count]) => (
              <div key={plan} className="kpi">
                {/* Real customer-facing name (PLANS[plan].label is
                    "AEOrank — Lite/Pro/Max" — the "AEOrank —" prefix is
                    redundant on AEOrank's own admin page) — not the raw
                    starter/growth/scale DB key. */}
                <div className="kpi-label">{(PLANS[plan]?.label || plan).replace("AEOrank — ", "")}</div>
                <div className="kpi-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
