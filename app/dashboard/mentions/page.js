import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/reddit";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import MentionsRefreshButton from "@/components/MentionsRefreshButton";
import RedeemCodeForm from "@/components/RedeemCodeForm";

export const dynamic = "force-dynamic";

function sentimentColor(sentiment) {
  if (sentiment === "positive") return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (sentiment === "negative") return { bg: "rgba(255, 120, 120, 0.12)", fg: "#ff8a8a" };
  return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
}

export default async function MentionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPlan = await hasActiveSubscription(supabase, user.id);
  if (!hasPlan) {
    return (
      <section className="section">
        <div className="container">
          <span className="section-tag">( mentions )</span>
          <h2>Brand mention tracking</h2>
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
        </div>
      </section>
    );
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data: mentions } = profile
    ? await supabase
        .from("mentions")
        .select("id, sub, title, snippet, permalink, ups, comments, post_created_at, sentiment, sentiment_reason, fetched_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("post_created_at", { ascending: false, nullsFirst: false })
    : { data: [] };

  const hasProfile = Boolean(profile?.company_name);
  const classified = (mentions || []).filter((m) => m.sentiment);
  const positivePct = classified.length
    ? Math.round((classified.filter((m) => m.sentiment === "positive").length / classified.length) * 100)
    : null;

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( mentions )</span>
        <h2>Brand mention tracking</h2>
        <p className="section-sub">
          Real Reddit posts and comments that already mention your brand,
          with sentiment. Read-only monitoring, nothing here posts,
          votes, or replies on your behalf.
        </p>

        {!hasProfile ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Complete your company profile first so we know what brand to
            search for. <Link href="/onboarding" style={{ color: "var(--accent)", fontWeight: 600 }}>Go to onboarding →</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <MentionsRefreshButton />
              {mentions?.length > 0 && (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Last refreshed {timeAgo(new Date(mentions[0].fetched_at).getTime())}
                </span>
              )}
            </div>

            {positivePct != null && (
              <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    Sentiment · {classified.length} classified of {mentions.length} total
                  </span>
                  <strong style={{ color: "#6EE7B7" }}>{positivePct}% positive</strong>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,120,120,0.2)", overflow: "hidden" }}>
                  <div style={{ width: `${positivePct}%`, height: "100%", background: "#6EE7B7" }} />
                </div>
              </div>
            )}

            {!mentions || mentions.length === 0 ? (
              <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
                No mentions found yet. Click "Refresh mentions" to search Reddit.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {mentions.map((m) => {
                  const colors = sentimentColor(m.sentiment);
                  return (
                    <a
                      key={m.id}
                      href={m.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card"
                      style={{ display: "block", padding: 20 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <div className="post-meta">
                          <span>{m.sub}</span>
                          {m.post_created_at && (
                            <>
                              <span>·</span>
                              <span>{timeAgo(new Date(m.post_created_at).getTime())}</span>
                            </>
                          )}
                        </div>
                        {m.sentiment && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: colors.bg,
                              color: colors.fg,
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {m.sentiment}
                          </span>
                        )}
                      </div>
                      <div className="post-title">{m.title}</div>
                      {m.snippet && <div className="post-snippet">{m.snippet}…</div>}
                      {(m.ups > 0 || m.comments > 0) && (
                        <div className="post-stats">
                          {m.ups > 0 && <span className="post-stat">↑ {m.ups.toLocaleString()}</span>}
                          {m.comments > 0 && <span className="post-stat">💬 {m.comments.toLocaleString()}</span>}
                        </div>
                      )}
                      {m.sentiment_reason && (
                        <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
                          {m.sentiment_reason}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
