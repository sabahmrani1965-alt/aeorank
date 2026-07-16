import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actionLabel } from "@/lib/credits";
import BuyCreditsButton from "@/components/BuyCreditsButton";

export const dynamic = "force-dynamic";

export default async function DashboardCreditsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: balanceRow }, { data: recent }, { data: packages }] = await Promise.all([
    supabase
      .from("credit_balances")
      .select("balance, monthly_allowance, allowance_reset_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, amount, action, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("credit_packages")
      .select("id, name, credits, price_cents, currency")
      .eq("active", true)
      .order("price_cents", { ascending: true }),
  ]);

  const balance = balanceRow?.balance ?? 0;
  const monthlyAllowance = balanceRow?.monthly_allowance ?? 0;
  const resetAt = balanceRow?.allowance_reset_at;

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>AI credits</h2>
        <p className="section-sub">Every AI-assisted action — drafts, opportunity scoring, reports — spends credits.</p>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">Balance</div>
            <div className="kpi-value">{balance}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Monthly allowance</div>
            <div className="kpi-value">{monthlyAllowance}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Resets</div>
            <div className="kpi-value" style={{ fontSize: 18 }}>
              {resetAt ? new Date(resetAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
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

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Buy more credits</h3>
          {!packages || packages.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No credit packages available right now.
            </div>
          ) : (
            <div className="sub-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="sub-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="sub-head">
                    <div className="sub-name">{pkg.name}</div>
                  </div>
                  <div className="sub-members">{pkg.credits} credits</div>
                  <div style={{ fontWeight: 600 }}>
                    {(pkg.price_cents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: pkg.currency.toUpperCase(),
                    })}
                  </div>
                  <BuyCreditsButton packageId={pkg.id} className="btn btn-secondary">
                    Buy
                  </BuyCreditsButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
