import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile, listBrands } from "@/lib/brands";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import DeleteBrandButton from "@/components/DeleteBrandButton";
import KeywordsManager from "@/components/KeywordsManager";
import SettingsTabs from "@/components/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activeProfile, brands] = await Promise.all([
    getActiveCompanyProfile(supabase, user.id),
    listBrands(supabase, user.id),
  ]);

  const { data: keywords } = activeProfile
    ? await supabase
        .from("tracked_keywords")
        .select("id, keyword, last_checked_at, last_post_count, last_top_subreddits, last_sample_posts, created_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", activeProfile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const profileTab = (
    <>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        This edits your currently active brand. Switch brands from the sidebar. AEOrank uses this
        to find relevant Reddit threads, write on-brand responses, and check your AI visibility.
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
    </>
  );

  const keywordsTab = (
    <>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Add the keywords your buyers actually search for — they're used to find better,
        more relevant Reddit opportunities for you, and each one shows real conversation
        volume from Reddit's own search, not a generic SEO estimate.
      </p>
      <KeywordsManager initialKeywords={keywords || []} />
    </>
  );

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Knowledge</div>
      <h2 style={{ marginBottom: 8 }}>Company profile</h2>
      <SettingsTabs
        initialTab={searchParams?.tab === "keywords" ? "keywords" : "profile"}
        profileTab={profileTab}
        keywordsTab={keywordsTab}
      />
    </section>
  );
}
