import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/lib/credits";
import BuyCreditsButton from "@/components/BuyCreditsButton";

export const dynamic = "force-dynamic";

export default async function BuyCreditsPage() {
  const supabase = createClient();
  const { data: packages } = await supabase
    .from("credit_packages")
    .select("id, name, credits, bonus_credits, price_cents, currency, badge, description")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>Buy credits</h2>
        <p className="section-sub">
          One-time top-ups on top of your plan's monthly allowance — purchased credits never expire.{" "}
          <Link href="/dashboard/credits" className="header-link">← Back to credits</Link>
        </p>

        {!packages || packages.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No credit packages available right now.
          </div>
        ) : (
          <div className="sub-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {packages.map((pkg) => {
              const total = pkg.credits + (pkg.bonus_credits || 0);
              const price = (pkg.price_cents / 100).toLocaleString("en-US", {
                style: "currency",
                currency: pkg.currency.toUpperCase(),
              });
              const approxComments = Math.round(total / CREDIT_COSTS.generate_comment);
              const approxPosts = Math.round(total / CREDIT_COSTS.generate_post);
              const approxReports = Math.max(1, Math.round(total / CREDIT_COSTS.ai_visibility_report));

              return (
                <div
                  key={pkg.id}
                  className="card"
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    position: "relative",
                    border: pkg.badge ? "1px solid var(--accent)" : undefined,
                  }}
                >
                  {pkg.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -12,
                        left: 20,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)",
                        color: "var(--accent-ink)",
                      }}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{pkg.name}</div>
                  <div>
                    <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }}>{pkg.credits}</span>
                    <span style={{ color: "var(--text-dim)", fontSize: 14, marginLeft: 6 }}>credits</span>
                    {pkg.bonus_credits > 0 && (
                      <div style={{ fontSize: 13, color: "#6EE7B7", marginTop: 2 }}>+{pkg.bonus_credits} bonus credits</div>
                    )}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{price}</div>
                  {pkg.description && (
                    <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>{pkg.description}</p>
                  )}
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text-muted)",
                      borderTop: "1px solid var(--card-border-soft)",
                      paddingTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span>≈ {approxComments} AI comments</span>
                    <span>≈ {approxPosts} Reddit posts</span>
                    <span>≈ {approxReports} visibility report{approxReports === 1 ? "" : "s"}</span>
                  </div>
                  <BuyCreditsButton packageId={pkg.id} className="btn btn-primary" style={{ marginTop: 8 }}>
                    Buy {total} credits
                  </BuyCreditsButton>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
