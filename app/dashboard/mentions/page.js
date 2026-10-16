import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { brandNeedles, isRealMention } from "@/lib/mentionMatch";
import MentionsRefreshButton from "@/components/MentionsRefreshButton";
import MentionsView from "@/components/MentionsView";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

export default async function MentionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="dashboard-page">
        <h1 className="command-greeting">Mentions</h1>
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>This is available on any active plan.</p>
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
  const { data: rows } = profile
    ? await supabase
        .from("mentions")
        .select("id, sub, title, snippet, permalink, ups, comments, post_created_at, sentiment, sentiment_reason, fetched_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("post_created_at", { ascending: false, nullsFirst: false })
    : { data: [] };

  // Only posts that are really about the brand (lib/mentionMatch.js).
  const needles = brandNeedles(profile);
  const mentions = (rows || []).filter((m) => isRealMention(m, needles));

  // Mentions accumulate across refreshes, so the newest fetch time has to
  // be found explicitly rather than read off the first row.
  const lastRefreshedAt = (rows || []).reduce((max, m) => (!max || new Date(m.fetched_at) > new Date(max) ? m.fetched_at : max), null);
  const hasProfile = Boolean(profile?.company_name);

  return (
    <section className="dashboard-page-wide">
      <div className="op-head">
        <div>
          <h1 className="command-greeting">Mentions</h1>
          <p className="command-greeting-sub" style={{ marginBottom: 0 }}>
            Where {profile?.company_name || "your brand"} is discussed on Reddit, with the sentiment of each post. Read-only: nothing is posted for you.
          </p>
        </div>
        {hasProfile ? (
          <div className="op-head-actions">
            <MentionsRefreshButton />
            {lastRefreshedAt && <span className="op-refreshed">Last refreshed {timeAgo(new Date(lastRefreshedAt).getTime())}</span>}
          </div>
        ) : null}
      </div>

      {!hasProfile ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          Complete your company profile first so we know what brand to search for.{" "}
          <Link href="/onboarding" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Go to onboarding →
          </Link>
        </div>
      ) : mentions.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No mentions found yet. Click "Refresh mentions" to search Reddit.
        </div>
      ) : (
        <MentionsView mentions={mentions} brandTerms={[profile.company_name, ...(profile.brand_variations || [])].filter(Boolean)} />
      )}
    </section>
  );
}
