import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import PromptsManager from "@/components/PromptsManager";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="dashboard-page">
        <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Analyze</div>
        <h2 style={{ marginBottom: 16 }}>Prompts</h2>
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            This is available on any active plan.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard/billing" className="btn btn-primary">
              View plans →
            </Link>
            <RedeemCodeForm />
          </div>
        </div>
      </section>
    );
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data: prompts } = profile
    ? await supabase
        .from("prompts")
        .select(
          "id, text, type, location, active, last_checked_at, last_mentioned, last_position, last_brands, last_answer, last_model, created_at"
        )
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Analyze</div>
      <h2 style={{ marginBottom: 8 }}>Prompts</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Real questions checked against live AI models: see whether, and where, your brand
        actually gets mentioned when someone asks.
      </p>

      <PromptsManager initialPrompts={prompts || []} />
    </section>
  );
}
