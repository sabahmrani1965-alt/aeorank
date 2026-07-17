import { createAdminClient } from "@/lib/supabase/admin";
import InvitePosterForm from "@/components/InvitePosterForm";

export const dynamic = "force-dynamic";

export default async function AdminPostersPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( admin )</span>
          <h2>Posters</h2>
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Supabase service role key isn't configured.
          </div>
        </div>
      </section>
    );
  }

  const { data: posters } = await admin
    .from("users")
    .select("id, email, created_at")
    .eq("role", "poster")
    .order("created_at", { ascending: false });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>Posters</h2>
        <p className="section-sub">
          Accounts that fulfill drafts you assign them, across any customer — not their own account.
        </p>

        <div style={{ marginBottom: 32 }}>
          {!posters || posters.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No posters yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Email</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {posters.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                      <td style={{ padding: "10px 12px" }}>{p.email}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <InvitePosterForm />
      </div>
    </section>
  );
}
