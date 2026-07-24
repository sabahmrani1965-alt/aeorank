import { createAdminClient } from "@/lib/supabase/admin";
import InvitePosterForm from "@/components/InvitePosterForm";
import PosterApplicationsTable from "@/components/PosterApplicationsTable";
import PosterPayoutControl from "@/components/PosterPayoutControl";
import AdminPayoutRequestsTable from "@/components/AdminPayoutRequestsTable";
import { getEarningsSummary } from "@/lib/posterPay";

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
    .select("id, email, reddit_username, created_at")
    .eq("role", "poster")
    .order("created_at", { ascending: false });

  const postersWithPending = await Promise.all(
    (posters || []).map(async (p) => {
      const summary = await getEarningsSummary(admin, p.id);
      return { ...p, pending: summary.pending };
    })
  );

  const { data: payoutRequests } = await admin
    .from("poster_payouts")
    .select("id, poster_id, amount, created_at")
    .eq("status", "requested")
    .order("created_at", { ascending: true });

  const requesterIds = [...new Set((payoutRequests || []).map((r) => r.poster_id))];
  let requesterEmailById = new Map();
  if (requesterIds.length > 0) {
    const { data: requesters } = await admin.from("users").select("id, email").in("id", requesterIds);
    requesterEmailById = new Map((requesters || []).map((r) => [r.id, r.email]));
  }
  const enrichedRequests = (payoutRequests || []).map((r) => ({
    ...r,
    posterEmail: requesterEmailById.get(r.poster_id) || "-",
  }));

  const { data: applications } = await admin
    .from("poster_applications")
    .select("id, email, referred_by, reddit_username, reddit_check_status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const referrerIds = [...new Set((applications || []).map((a) => a.referred_by).filter(Boolean))];
  let referrerEmailById = new Map();
  if (referrerIds.length > 0) {
    const { data: referrers } = await admin.from("users").select("id, email").in("id", referrerIds);
    referrerEmailById = new Map((referrers || []).map((r) => [r.id, r.email]));
  }
  const enrichedApplications = (applications || []).map((a) => ({
    ...a,
    referrerEmail: a.referred_by ? referrerEmailById.get(a.referred_by) : null,
  }));

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>CrewQuest Users</h2>
        <p className="section-sub">
          Poster accounts (role='poster'). They fulfill tasks claimed from the marketplace, across
          any AEOrank customer, for pay. Customer accounts are tracked separately under "AEOrank Users".
        </p>

        <div style={{ marginBottom: 32 }}>
          {postersWithPending.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No posters yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Email</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Reddit</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Added</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Pending</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {postersWithPending.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                      <td style={{ padding: "10px 12px" }}>{p.email}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {p.reddit_username ? `u/${p.reddit_username}` : "-"}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${p.pending.toFixed(2)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <PosterPayoutControl posterId={p.id} pending={p.pending} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <InvitePosterForm />

        <div style={{ marginTop: 40 }}>
          <h3 style={{ marginBottom: 14 }}>Pending withdrawal requests</h3>
          <AdminPayoutRequestsTable requests={enrichedRequests} />
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 style={{ marginBottom: 14 }}>Pending applications</h3>
          <PosterApplicationsTable applications={enrichedApplications} />
        </div>
      </div>
    </section>
  );
}
