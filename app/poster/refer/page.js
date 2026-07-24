import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rateForType,
  REFERRAL_COMMISSION_RATE,
  REFERRAL_WINDOW_MONTHS,
  REFERRAL_SIGNUP_BONUS,
  referralWindowEnd,
  isWithinReferralWindow,
  ensureReferralCode,
} from "@/lib/posterPay";
import CopyReferralLink from "@/components/CopyReferralLink";

export const dynamic = "force-dynamic";

export default async function ReferAFriendPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const referralCode = admin ? await ensureReferralCode(admin, user.id) : null;

  // Everyone this poster referred — scoped server-side to referred_by =
  // this authenticated poster's own id (never a client-supplied value).
  // Requires the admin client since this reads OTHER posters' rows, same
  // "admin client, safely scoped in application code" pattern already used
  // in app/poster/page.js for company_profiles lookups.
  const { data: referred } = admin
    ? await admin.from("users").select("id, email, created_at").eq("referred_by", user.id).eq("role", "poster")
    : { data: [] };

  const referredIds = (referred || []).map((r) => r.id);
  const draftsByReferred = new Map();
  if (admin && referredIds.length > 0) {
    const { data: drafts } = await admin
      .from("report_drafts")
      .select("claimed_by, type, posted_at")
      .in("claimed_by", referredIds)
      .eq("status", "submitted");
    for (const d of drafts || []) {
      if (!draftsByReferred.has(d.claimed_by)) draftsByReferred.set(d.claimed_by, []);
      draftsByReferred.get(d.claimed_by).push(d);
    }
  }

  const rows = (referred || [])
    .map((r) => {
      const drafts = draftsByReferred.get(r.id) || [];
      const qualifying = drafts.filter((d) => isWithinReferralWindow(d.posted_at, r.created_at));
      const commission = qualifying.reduce((sum, d) => sum + rateForType(d.type) * REFERRAL_COMMISSION_RATE, 0);
      const windowEnd = referralWindowEnd(r.created_at);
      const windowOpen = new Date() <= windowEnd;
      return { ...r, commission, windowOpen, windowEnd };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalCommission = rows.reduce((sum, r) => sum + r.commission, 0);
  const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aeorank.tech";

  return (
    <section>
      <span className="section-tag">( poster )</span>
      <h2>Refer a friend</h2>
      <p className="section-sub">
        Share your link or code. When someone you refer becomes a poster, they get a ${REFERRAL_SIGNUP_BONUS} signup
        bonus, and you earn {Math.round(REFERRAL_COMMISSION_RATE * 100)}% of everything they earn in their first{" "}
        {REFERRAL_WINDOW_MONTHS} months: a running total, not a payout record.
      </p>

      <div style={{ marginTop: 20, marginBottom: 28 }}>
        <CopyReferralLink userId={user.id} referralCode={referralCode} fallbackOrigin={fallbackOrigin} />
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 420, marginBottom: 32 }}>
        <div className="kpi">
          <div className="kpi-label">Referred posters</div>
          <div className="kpi-value">{rows.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total commission</div>
          <div className="kpi-value">${totalCommission.toFixed(2)}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          Nobody's signed up with your link yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Poster</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Joined</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Window</th>
                <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Commission earned</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
                  <td style={{ padding: "10px 12px" }}>{r.email}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: r.windowOpen ? "var(--state-success-bg)" : "var(--state-neutral-bg)",
                        color: r.windowOpen ? "var(--state-success-fg)" : "var(--state-neutral-fg)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.windowOpen ? `Active until ${r.windowEnd.toLocaleDateString()}` : "Window closed"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${r.commission.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
