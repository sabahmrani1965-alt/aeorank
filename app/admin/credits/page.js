import { createAdminClient } from "@/lib/supabase/admin";
import AdminCreditAdjustForm from "@/components/AdminCreditAdjustForm";
import AdminCreditPackagesManager from "@/components/AdminCreditPackagesManager";

export const dynamic = "force-dynamic";

export default async function AdminCreditsPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( admin )</span>
          <h2>Credits</h2>
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Supabase service role key isn't configured.
          </div>
        </div>
      </section>
    );
  }

  const [{ data: transactions }, { data: balances }, { data: packages }] = await Promise.all([
    admin.from("credit_transactions").select("amount"),
    admin.from("credit_balances").select("balance"),
    admin
      .from("credit_packages")
      .select("id, name, credits, bonus_credits, price_cents, currency, active, badge, description, created_at")
      .order("price_cents", { ascending: true }),
  ]);

  let totalGranted = 0;
  let totalConsumed = 0;
  for (const t of transactions || []) {
    if (t.amount > 0) totalGranted += t.amount;
    else totalConsumed += -t.amount;
  }
  const totalOutstanding = (balances || []).reduce((sum, b) => sum + (b.balance || 0), 0);

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>Credits</h2>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">Total granted</div>
            <div className="kpi-value">{totalGranted.toLocaleString()}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Total consumed</div>
            <div className="kpi-value">{totalConsumed.toLocaleString()}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Outstanding balance</div>
            <div className="kpi-value">{totalOutstanding.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Adjust a user's balance</h3>
          <AdminCreditAdjustForm />
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Credit packages</h3>
          <AdminCreditPackagesManager initialPackages={packages || []} />
        </div>
      </div>
    </section>
  );
}
