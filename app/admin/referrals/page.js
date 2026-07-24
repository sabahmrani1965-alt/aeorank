import { createAdminClient } from "@/lib/supabase/admin";
import {
  rateForType,
  REFERRAL_COMMISSION_RATE,
  isWithinReferralWindow,
} from "@/lib/posterPay";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( admin )</span>
          <h2>Referrals</h2>
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Supabase service role key isn't configured.
          </div>
        </div>
      </section>
    );
  }

  // Completed signups that came in through a referral link.
  const { data: referredUsers } = await admin
    .from("users")
    .select("id, email, referred_by, created_at, role")
    .not("referred_by", "is", null)
    .order("created_at", { ascending: false });

  const referrerIds = [...new Set((referredUsers || []).map((u) => u.referred_by))];
  let referrerById = new Map();
  if (referrerIds.length > 0) {
    const { data: referrers } = await admin
      .from("users")
      .select("id, email, referral_code")
      .in("id", referrerIds);
    referrerById = new Map((referrers || []).map((r) => [r.id, r]));
  }

  // Commission math mirrors app/poster/refer/page.js — only referred posters
  // who actually submitted paid drafts within their 3-month window count.
  const referredPosterIds = (referredUsers || []).filter((u) => u.role === "poster").map((u) => u.id);
  const draftsByReferred = new Map();
  if (referredPosterIds.length > 0) {
    const { data: drafts } = await admin
      .from("report_drafts")
      .select("claimed_by, type, posted_at")
      .in("claimed_by", referredPosterIds)
      .eq("status", "submitted");
    for (const d of drafts || []) {
      if (!draftsByReferred.has(d.claimed_by)) draftsByReferred.set(d.claimed_by, []);
      draftsByReferred.get(d.claimed_by).push(d);
    }
  }

  // Pending applications (referral link used, but Reddit verification/approval not done yet).
  const { data: pendingApplications } = await admin
    .from("poster_applications")
    .select("id, referred_by, status")
    .not("referred_by", "is", null)
    .eq("status", "pending");
  const pendingCountByReferrer = new Map();
  for (const a of pendingApplications || []) {
    pendingCountByReferrer.set(a.referred_by, (pendingCountByReferrer.get(a.referred_by) || 0) + 1);
  }

  const grouped = new Map();
  for (const u of referredUsers || []) {
    const key = u.referred_by;
    if (!grouped.has(key)) {
      grouped.set(key, {
        referrer: referrerById.get(key) || { id: key, email: "(deleted user)", referral_code: null },
        referred: [],
        totalCommission: 0,
      });
    }
    const drafts = draftsByReferred.get(u.id) || [];
    const qualifying = drafts.filter((d) => isWithinReferralWindow(d.posted_at, u.created_at));
    const commission = qualifying.reduce((sum, d) => sum + rateForType(d.type) * REFERRAL_COMMISSION_RATE, 0);
    const g = grouped.get(key);
    g.referred.push({ ...u, commission });
    g.totalCommission += commission;
  }

  const rows = [...grouped.values()]
    .map((g) => ({ ...g, pending: pendingCountByReferrer.get(g.referrer.id) || 0 }))
    .sort((a, b) => b.referred.length - a.referred.length);

  const totalReferred = (referredUsers || []).length;
  const totalCommission = rows.reduce((sum, r) => sum + r.totalCommission, 0);

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>Referrals</h2>
        <p className="section-sub">
          Who referred whom, and the running (unpaid) commission owed under the CrewQuest referral
          program: {Math.round(REFERRAL_COMMISSION_RATE * 100)}% of a referred poster's earnings in
          their first 3 months. This is a running total, not a payout record.
        </p>

        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 620, marginBottom: 32 }}>
          <div className="kpi">
            <div className="kpi-label">Referrers</div>
            <div className="kpi-value">{rows.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Referred signups</div>
            <div className="kpi-value">{totalReferred}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Running commission</div>
            <div className="kpi-value">${totalCommission.toFixed(2)}</div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Nobody has signed up via a referral link yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Referrer</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Code</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Referred</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Pending applications</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Commission owed</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Referred people</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.referrer.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                    <td style={{ padding: "10px 12px" }}>{r.referrer.email}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                      {r.referrer.referral_code || "-"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{r.referred.length}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-dim)" }}>{r.pending}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${r.totalCommission.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>
                      {r.referred.map((u) => u.email).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
