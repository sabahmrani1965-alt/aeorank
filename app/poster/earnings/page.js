import { createClient } from "@/lib/supabase/server";
import { POSTER_RATES, rateForType } from "@/lib/posterPay";

export const dynamic = "force-dynamic";

const TYPE_LABEL = { comment: "Comments", reply: "Replies", post: "Posts" };

export default async function PosterEarningsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS ("Posters can read assigned drafts") scopes this to this poster's
  // own assignments — same source of truth as the assignments tab.
  const { data: completed } = await supabase
    .from("report_drafts")
    .select("id, type, posted_at")
    .eq("assigned_to", user.id)
    .eq("posted", true);

  const rows = completed || [];
  const byType = new Map();
  for (const key of Object.keys(POSTER_RATES)) byType.set(key, 0);
  for (const r of rows) {
    const key = r.type && POSTER_RATES[r.type] != null ? r.type : "comment";
    byType.set(key, (byType.get(key) || 0) + 1);
  }

  const total = rows.reduce((sum, r) => sum + rateForType(r.type), 0);

  return (
    <section>
      <span className="section-tag">( poster )</span>
      <h2>Your earnings</h2>
      <p className="section-sub">
        A running total from completed assignments — not a payout record.
        Actual payment happens outside this app.
      </p>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 420, marginTop: 24, marginBottom: 32 }}>
        <div className="kpi">
          <div className="kpi-label">Completed tasks</div>
          <div className="kpi-value">{rows.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total earned</div>
          <div className="kpi-value">${total.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Task type</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Rate</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Completed</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(POSTER_RATES).map((type) => {
              const count = byType.get(type) || 0;
              const rate = POSTER_RATES[type];
              return (
                <tr key={type} style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
                  <td style={{ padding: "10px 12px" }}>{TYPE_LABEL[type]}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-dim)" }}>${rate.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>{count}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${(count * rate).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)", marginTop: 20 }}>
          Nothing completed yet — earnings show up here once you mark assignments as posted.
        </div>
      )}
    </section>
  );
}
