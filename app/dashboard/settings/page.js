import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile, listBrands } from "@/lib/brands";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import DeleteBrandButton from "@/components/DeleteBrandButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activeProfile, brands] = await Promise.all([
    getActiveCompanyProfile(supabase, user.id),
    listBrands(supabase, user.id),
  ]);

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Knowledge</div>
      <h2 style={{ marginBottom: 8 }}>Company profile</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        This edits your currently active brand — switch brands from the sidebar. AEOrank uses this
        to find relevant Reddit threads, draft on-brand responses, and check your AI visibility.
      </p>
      {activeProfile ? (
        <CompanyProfileForm mode="edit" profileId={activeProfile.id} initialProfile={activeProfile} />
      ) : (
        <CompanyProfileForm mode="create" />
      )}
      {activeProfile && brands.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <DeleteBrandButton brandId={activeProfile.id} brandName={activeProfile.company_name} />
        </div>
      )}
    </section>
  );
}
