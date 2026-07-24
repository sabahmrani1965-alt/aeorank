import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actionLabel, ACTION_GROUPS } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Real, credit-metered generation actions worth their own analytics card —
// deliberately NOT every CREDIT_COSTS key (e.g. opportunity/mention scoring
// are bulk background actions, not a thing a user "generates" one at a time).
const USAGE_ANALYTICS = [
  { action: "generate_comment", label: "Comments Generated" },
  { action: "generate_post", label: "Posts Generated" },
  { action: "generate_reply", label: "Replies Generated" },
  { action: "thread_analysis", label: "Thread Analyses" },
];

function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth()}`;
}

function TrendBar({ thisMonth, lastMonth }) {
  const max = Math.max(thisMonth, lastMonth, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", width: 60 }}>This month</span>
        <div style={{ flex: 1, height: 6, background: "var(--bg-3)", borderRadius: 999 }}>
          <div style={{ width: `${(thisMonth / max) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)", width: 24, textAlign: "right" }}>{thisMonth}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", width: 60 }}>Last month</span>
        <div style={{ flex: 1, height: 6, background: "var(--bg-3)", borderRadius: 999 }}>
          <div style={{ width: `${(lastMonth / max) * 100}%`, height: "100%", background: "var(--card-border)", borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)", width: 24, textAlign: "right" }}>{lastMonth}</span>
      </div>
    </div>
  );
}

export default async function DashboardCreditsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const thisMonthKey = monthKey(now);
  const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [{ data: balanceRow }, { data: subs }, { data: allTxns }, { data: recent }] = await Promise.all([
    supabase
      .from("credit_balances")
      .select("balance, monthly_allowance, allowance_reset_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("credit_transactions").select("amount, action, created_at").eq("user_id", user.id),
    supabase
      .from("credit_transactions")
      .select("id, amount, action, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const balance = balanceRow?.balance ?? 0;
  const monthlyAllowance = balanceRow?.monthly_allowance ?? 0;
  const resetAt = balanceRow?.allowance_reset_at;
  const plan = subs?.[0]?.plan || null;

  let purchasedLifetime = 0;
  let bonusLifetime = 0;
  let usedLifetime = 0;
  let usedThisMonth = 0;
  const byAction = {};

  for (const t of allTxns || []) {
    if (ACTION_GROUPS.purchase.includes(t.action)) purchasedLifetime += t.amount;
    if (ACTION_GROUPS.grant.includes(t.action)) bonusLifetime += t.amount;
    if (t.amount >= 0) continue;

    usedLifetime += -t.amount;
    const key = monthKey(t.created_at);
    if (key === thisMonthKey) usedThisMonth += -t.amount;

    if (!ACTION_GROUPS.usage.includes(t.action)) continue;
    if (!byAction[t.action]) byAction[t.action] = { thisMonthCount: 0, thisMonthCredits: 0, lastMonthCount: 0, lastMonthCredits: 0 };
    const bucket = byAction[t.action];
    if (key === thisMonthKey) {
      bucket.thisMonthCount++;
      bucket.thisMonthCredits += -t.amount;
    } else if (key === lastMonthKey) {
      bucket.lastMonthCount++;
      bucket.lastMonthCredits += -t.amount;
    }
  }

  const monthlyRemaining = Math.max(0, monthlyAllowance - usedThisMonth);

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>AI credits</h2>
        <p className="section-sub">Every AI-assisted action — drafts, opportunity scoring, reports — spends credits.</p>

        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="kpi">
                <div className="kpi-label">Current credits</div>
                <div className="kpi-value">{balance}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Monthly allowance remaining</div>
                <div className="kpi-value">{monthlyRemaining}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Used this month</div>
                <div className="kpi-value">{usedThisMonth}</div>
              </div>
            </div>
            <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 16 }}>
              <div className="kpi">
                <div className="kpi-label">Current plan</div>
                <div className="kpi-value" style={{ fontSize: 20, textTransform: "capitalize" }}>{plan || "None"}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Next reset</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{resetAt ? new Date(resetAt).toLocaleDateString() : "—"}</div>
              </div>
              <div className="kpi" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Link href="/dashboard/billing" className="btn btn-primary btn-sm">Upgrade plan →</Link>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Lifetime summary</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "var(--text-dim)" }}>Monthly allowance</span>
              <strong>{monthlyAllowance}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "var(--text-dim)" }}>Purchased credits</span>
              <strong>{purchasedLifetime}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "var(--text-dim)" }}>Bonus credits</span>
              <strong>{bonusLifetime}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, borderTop: "1px solid var(--card-border-soft)", paddingTop: 12 }}>
              <span style={{ color: "var(--text-dim)" }}>Lifetime credits used</span>
              <strong>{usedLifetime}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <h3 style={{ marginBottom: 14 }}>Usage by action</h3>
          <div className="sub-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {USAGE_ANALYTICS.map(({ action, label }) => {
              const b = byAction[action] || { thisMonthCount: 0, thisMonthCredits: 0, lastMonthCount: 0, lastMonthCredits: 0 };
              return (
                <div key={action} className="sub-card" style={{ cursor: "default" }}>
                  <div className="sub-head">
                    <div className="sub-name">{label}</div>
                  </div>
                  <div className="sub-members">
                    {b.thisMonthCount} this month · {b.thisMonthCredits} credits
                  </div>
                  <TrendBar thisMonth={b.thisMonthCredits} lastMonth={b.lastMonthCredits} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>Recent activity</h3>
            <Link href="/dashboard/credits/history" className="header-link">
              View full history →
            </Link>
          </div>
          {!recent || recent.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No credit activity yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Date</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Action</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Description</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "10px 12px" }}>{actionLabel(t.action)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{t.description || "—"}</td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: t.amount < 0 ? "#ff8a8a" : "#7ee3a3",
                          fontWeight: 600,
                        }}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 36, padding: 28, textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Need more credits?</h3>
          <p style={{ color: "var(--text-dim)", marginBottom: 18 }}>
            Top up any time — purchased credits never expire.
          </p>
          <Link href="/dashboard/credits/buy" className="btn btn-primary">
            Buy more credits →
          </Link>
        </div>
      </div>
    </section>
  );
}
