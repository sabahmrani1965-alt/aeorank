import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Affiliate commissions, computed from Stripe rather than kept by hand:
// accounts carry the affiliate code in user_metadata.affiliate (set at
// signup from the ?via= cookie); their Stripe charges in the first 12
// months after their first payment, net of refunds, earn 30%.
const RATE = 0.3;
const WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

const usd = (cents) => `$${(cents / 100).toFixed(2)}`;

async function loadReferredUsers(admin) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      const code = u.user_metadata?.affiliate;
      if (code) out.push({ id: u.id, email: u.email, code, createdAt: u.created_at });
    }
    if (data.users.length < 1000) break;
  }
  return out;
}

async function chargesFor(customerId) {
  const s = stripe();
  if (!s) return null;
  const charges = [];
  for await (const c of s.charges.list({ customer: customerId, limit: 100 })) {
    if (c.paid && c.status === "succeeded") charges.push(c);
    if (charges.length >= 300) break;
  }
  return charges;
}

export default async function AdminAffiliates() {
  const admin = createAdminClient();
  if (!admin) return <p style={{ padding: 40 }}>Supabase service role key isn&apos;t configured.</p>;
  const stripeReady = Boolean(stripe());

  const users = await loadReferredUsers(admin);
  const { data: subs } = users.length
    ? await admin.from("subscriptions").select("user_id, stripe_customer_id, plan, status").in("user_id", users.map((u) => u.id))
    : { data: [] };

  const rows = [];
  for (const u of users) {
    const userSubs = (subs || []).filter((s) => s.user_id === u.id && s.plan !== "comp");
    const customerIds = [...new Set(userSubs.map((s) => s.stripe_customer_id).filter(Boolean))];
    let paid = 0;
    let first = null;
    if (stripeReady) {
      const all = (await Promise.all(customerIds.map(chargesFor))).flat().filter(Boolean);
      all.sort((a, b) => a.created - b.created);
      first = all[0] ? all[0].created * 1000 : null;
      for (const c of all) {
        if (c.created * 1000 - first > WINDOW_MS) continue;
        paid += (c.amount_captured ?? c.amount) - (c.amount_refunded || 0);
      }
    }
    rows.push({
      ...u,
      status: userSubs[0]?.status || "no subscription",
      plan: userSubs[0]?.plan || "",
      paid,
      first,
      windowEnds: first ? new Date(first + WINDOW_MS).toISOString().slice(0, 10) : null,
    });
  }

  const byCode = {};
  for (const r of rows) {
    byCode[r.code] = byCode[r.code] || { customers: 0, paying: 0, paid: 0 };
    byCode[r.code].customers += 1;
    if (r.paid > 0) byCode[r.code].paying += 1;
    byCode[r.code].paid += r.paid;
  }

  const th = { textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--border)" };
  const td = { padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" };

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( admin )</span>
        <h2>Affiliates</h2>
        <p style={{ color: "var(--text-dim)" }}>
          30% of each referred customer&apos;s Stripe payments, net of refunds, for 12 months from their
          first payment. {stripeReady ? "" : "Stripe isn't configured here, so amounts show as $0."}
        </p>

        <h3 style={{ marginTop: 24 }}>By affiliate</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Code", "Sign-ups", "Paying", "Revenue (12 mo)", "Commission owed"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(byCode).length === 0 ? (
                <tr><td style={td} colSpan={5}>No referred accounts yet.</td></tr>
              ) : (
                Object.entries(byCode)
                  .sort((a, b) => b[1].paid - a[1].paid)
                  .map(([code, v]) => (
                    <tr key={code}>
                      <td style={td}><strong>{code}</strong></td>
                      <td style={td}>{v.customers}</td>
                      <td style={td}>{v.paying}</td>
                      <td style={td}>{usd(v.paid)}</td>
                      <td style={td}><strong>{usd(Math.round(v.paid * RATE))}</strong></td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: 32 }}>Referred accounts</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Account", "Affiliate", "Signed up", "Plan / status", "Paid (12 mo)", "Window ends"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.email}</td>
                  <td style={td}>{r.code}</td>
                  <td style={td}>{r.createdAt?.slice(0, 10)}</td>
                  <td style={td}>{r.plan ? `${r.plan} / ${r.status}` : r.status}</td>
                  <td style={td}>{usd(r.paid)}</td>
                  <td style={td}>{r.windowEnds || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 14 }}>
          Commission owed is the total earned to date; subtract what you have already paid out.
        </p>
      </div>
    </section>
  );
}
