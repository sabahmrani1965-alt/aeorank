import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( admin )</span>
          <h2>Users</h2>
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Supabase service role key isn't configured.
          </div>
        </div>
      </section>
    );
  }

  const [{ data: users }, { data: subs }, { data: reports }, { data: drafts }, { data: balances }] =
    await Promise.all([
      // CrewQuest accounts (role='poster') have their own page — see
      // /admin/posters — since Stripe plan/reports/drafts-authored below
      // don't mean anything for them (they fulfill drafts, they don't
      // create them). This page is AEOrank customers only.
      admin
        .from("users")
        .select("id, email, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false }),
      admin
        .from("subscriptions")
        .select("user_id, plan, status, created_at")
        .order("created_at", { ascending: false }),
      admin.from("reports").select("user_id"),
      admin.from("report_drafts").select("user_id, posted"),
      admin.from("credit_balances").select("user_id, balance"),
    ]);

  const balanceByUser = new Map((balances || []).map((b) => [b.user_id, b.balance]));

  const latestSubByUser = new Map();
  for (const s of subs || []) {
    if (!latestSubByUser.has(s.user_id)) latestSubByUser.set(s.user_id, s);
  }

  const reportCountByUser = new Map();
  for (const r of reports || []) {
    reportCountByUser.set(r.user_id, (reportCountByUser.get(r.user_id) || 0) + 1);
  }

  const draftCountByUser = new Map();
  for (const d of drafts || []) {
    const entry = draftCountByUser.get(d.user_id) || { posted: 0, total: 0 };
    entry.total++;
    if (d.posted) entry.posted++;
    draftCountByUser.set(d.user_id, entry);
  }

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>AEOrank Users</h2>
        <p className="section-sub">
          Customer accounts only — CrewQuest posters (accounts that fulfill
          tasks for pay) are tracked separately under "CrewQuest Users".
        </p>

        {!users || users.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No users yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Email</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Joined</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Plan</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Reports</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Drafts</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Credits</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const sub = latestSubByUser.get(u.id);
                  const draftInfo = draftCountByUser.get(u.id) || { posted: 0, total: 0 };
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                      <td style={{ padding: "10px 12px" }}>{u.email}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>
                        {sub?.plan || "—"}
                      </td>
                      <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>
                        {sub?.status || "—"}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {reportCountByUser.get(u.id) || 0}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {draftInfo.posted}/{draftInfo.total}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {balanceByUser.get(u.id) ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
