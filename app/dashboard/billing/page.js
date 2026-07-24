import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import BillingPortalButton from "@/components/BillingPortalButton";
import RedeemCodeForm from "@/components/RedeemCodeForm";
import PricingTiers from "@/components/PricingTiers";

export const dynamic = "force-dynamic";

export default async function DashboardBillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: sub }, profile] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getActiveCompanyProfile(supabase, user.id),
  ]);

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( billing )</span>
        <h2>Plan &amp; billing</h2>

        {!sub ? (
          <>
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)", marginBottom: 20 }}>
              No active subscription on this account.
            </div>
            <PricingTiers brand={profile?.company_name || ""} />
            <div style={{ marginTop: 20 }}>
              <RedeemCodeForm />
            </div>
          </>
        ) : (
          <div className="card" style={{ padding: 24, maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "var(--text-dim)" }}>Plan</span>
              <strong style={{ textTransform: "capitalize" }}>{sub.plan}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "var(--text-dim)" }}>Status</span>
              <strong style={{ textTransform: "capitalize" }}>{sub.status}</strong>
            </div>
            {sub.current_period_end && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "var(--text-dim)" }}>
                  {sub.cancel_at_period_end ? "Cancels on" : "Renews on"}
                </span>
                <strong>{new Date(sub.current_period_end).toLocaleDateString()}</strong>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              {sub.plan === "comp" ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Complimentary access, no billing attached to this plan.
                </p>
              ) : (
                <BillingPortalButton />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
