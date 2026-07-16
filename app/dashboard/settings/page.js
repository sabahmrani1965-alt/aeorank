import { createClient } from "@/lib/supabase/server";
import CompanyProfileForm from "@/components/CompanyProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("website, company_name, target_location, brand_variations, description, competitors")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Knowledge</div>
      <h2 style={{ marginBottom: 8 }}>Company profile</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        This is what AEOrank uses to find relevant Reddit threads, draft on-brand
        responses, and check your AI visibility. Keep it up to date.
      </p>
      <CompanyProfileForm initialProfile={profile} />
    </section>
  );
}
