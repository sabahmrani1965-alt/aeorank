import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import KeywordsManager from "@/components/KeywordsManager";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

export default async function KeywordsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="dashboard-page">
        <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Discover</div>
        <h2 style={{ marginBottom: 16 }}>Keywords</h2>
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

  const { data: keywords } = profile
    ? await supabase
        .from("tracked_keywords")
        .select("id, keyword, last_checked_at, last_post_count, last_top_subreddits, last_sample_posts, created_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Discover</div>
      <h2 style={{ marginBottom: 8 }}>Keywords</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Track real Reddit conversation volume for the keywords that matter to your category —
        genuine post counts from Reddit's own search, not a generic SEO estimate.
      </p>

      <KeywordsManager initialKeywords={keywords || []} />
    </section>
  );
}
