import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile, listBrands } from "@/lib/brands";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import DeleteBrandButton from "@/components/DeleteBrandButton";
import KeywordsManager from "@/components/KeywordsManager";
import SettingsTabs from "@/components/SettingsTabs";
import { suggestKeywords, isLlmConfigured } from "@/lib/llm";
import { checkKeywordVolume } from "@/lib/keywordVolume";

export const dynamic = "force-dynamic";

const KEYWORD_FIELDS = "id, keyword, last_checked_at, last_post_count, last_top_subreddits, last_sample_posts, created_at";

export default async function SettingsPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activeProfile, brands] = await Promise.all([
    getActiveCompanyProfile(supabase, user.id),
    listBrands(supabase, user.id),
  ]);

  let { data: keywords } = activeProfile
    ? await supabase
        .from("tracked_keywords")
        .select(KEYWORD_FIELDS)
        .eq("user_id", user.id)
        .eq("company_profile_id", activeProfile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Seed a starter set of keywords automatically, once, the first time this
  // brand's Keywords tab would otherwise be empty — a customer shouldn't
  // have to know to click "Suggest keywords" just to see anything here.
  // keywords_seeded guards against silently re-populating keywords the
  // customer deliberately deleted on a later visit; only flips true once
  // suggestions were actually generated (a transient LLM/Reddit hiccup
  // just tries again on the next page load instead of giving up forever).
  if (
    activeProfile &&
    !activeProfile.keywords_seeded &&
    (keywords?.length ?? 0) === 0 &&
    isLlmConfigured() &&
    (activeProfile.description || activeProfile.company_name)
  ) {
    const suggestions = await suggestKeywords(
      activeProfile.company_name || "",
      activeProfile.description || "",
      activeProfile.website || "",
      Array.isArray(activeProfile.competitors) ? activeProfile.competitors : [],
      []
    );
    if (suggestions?.length) {
      const volumes = await Promise.all(suggestions.map((k) => checkKeywordVolume(k).catch(() => null)));
      const rows = suggestions.map((keyword, i) => ({
        user_id: user.id,
        company_profile_id: activeProfile.id,
        keyword,
        last_checked_at: volumes[i] ? new Date().toISOString() : null,
        last_post_count: volumes[i]?.postCount ?? null,
        last_top_subreddits: volumes[i]?.topSubreddits ?? null,
        last_sample_posts: volumes[i]?.samplePosts ?? null,
      }));
      const { data: inserted } = await supabase.from("tracked_keywords").insert(rows).select(KEYWORD_FIELDS);
      if (inserted?.length) {
        keywords = inserted;
        await supabase.from("company_profiles").update({ keywords_seeded: true }).eq("id", activeProfile.id);
      }
    }
  }

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
