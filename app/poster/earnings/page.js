import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEarningsSummary } from "@/lib/posterPay";
import StatusBadge from "@/components/karmacrew/StatusBadge";
import EarningsChart from "@/components/karmacrew/EarningsChart";
import WithdrawControl from "@/components/karmacrew/WithdrawControl";

export const dynamic = "force-dynamic";

export default async function PosterEarningsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const summary = admin
    ? await getEarningsSummary(admin, user.id)
    : { totalEarned: 0, totalPaid: 0, totalRequested: 0, pending: 0, tasks: [], payouts: [] };

  const daySpanDays = summary.tasks.length
    ? Math.max(1, Math.ceil((Date.now() - new Date(summary.tasks[summary.tasks.length - 1].posted_at).getTime()) / 86400000))
    : 1;
  const averagePerDay = summary.totalEarned / daySpanDays;

  // Real daily totals for the last 7 days — no interpolation, days with
  // nothing submitted just show $0.
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return d;
  });
  const chartPoints = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const value = summary.tasks
      .filter((t) => new Date(t.posted_at).toISOString().slice(0, 10) === key)
      .reduce((sum, t) => sum + t.rate, 0);
    return { label: d.toLocaleDateString(undefined, { weekday: "short" }), value };
  });

  return (
    <section>
      <span className="section-tag">( earnings )</span>
      <h2>Your earnings</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Real payout ledger. Pending is what's owed but not yet paid out.
      </p>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: 20 }}>
        <div className="kpi">
          <div className="kpi-label">Total earned</div>
          <div className="kpi-value">${summary.totalEarned.toFixed(2)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pending</div>
          <div className="kpi-value">${summary.pending.toFixed(2)}</div>
        </div>
        {summary.totalRequested > 0 && (
          <div className="kpi">
            <div className="kpi-label">Requested</div>
            <div className="kpi-value">${summary.totalRequested.toFixed(2)}</div>
          </div>
        )}
        <div className="kpi">
          <div className="kpi-label">Paid</div>
          <div className="kpi-value">${summary.totalPaid.toFixed(2)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg / day</div>
          <div className="kpi-value">${averagePerDay.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <WithdrawControl pending={summary.pending} />
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>This week</div>
        <EarningsChart points={chartPoints} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 14 }}>Transactions</h3>
        {summary.tasks.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No completed tasks yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Date</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Subreddit</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.tasks.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
                    <td style={{ padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>
                      {new Date(t.posted_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>r/{t.subreddit}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${t.rate.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <StatusBadge status={t.displayStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: 14 }}>Withdrawal history</h3>
        {summary.payouts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No payouts recorded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {summary.payouts.map((p) => (
              <div key={p.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>${Number(p.amount).toFixed(2)}</div>
                  {p.note && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{p.note}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusBadge status={p.status} />
                  <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
