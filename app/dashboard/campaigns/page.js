import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displaySubreddit } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, target_url, subreddit, title, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const ids = (campaigns || []).map((c) => c.id);
  const latestByCampaign = {};
  if (ids.length) {
    const { data: snapshots } = await supabase
      .from("campaign_snapshots")
      .select("campaign_id, score, reply_count, removed, source, checked_at")
      .in("campaign_id", ids)
      .order("checked_at", { ascending: false });
    for (const s of snapshots || []) {
      if (!latestByCampaign[s.campaign_id]) latestByCampaign[s.campaign_id] = s;
    }
  }

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( campaigns )</span>
        <h2>Reddit Campaigns</h2>
        <p className="section-sub">
          Track real upvotes, replies, and removal status on a Reddit post
          over time — verification is a genuine re-check against Reddit,
          nothing here places votes automatically.
        </p>

        <div style={{ marginBottom: 24 }}>
          <Link href="/dashboard/campaigns/new" className="btn btn-primary">
            + New Campaign
          </Link>
        </div>

        {!campaigns || campaigns.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No campaigns yet — click "+ New Campaign" to start tracking a Reddit post.
          </div>
        ) : (
          <div className="camp-list">
            {campaigns.map((c) => {
              const snap = latestByCampaign[c.id];
              return (
                <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="camp-card">
                  <div className="camp-card-head">
                    <span className="camp-subreddit">
                      {c.subreddit ? `r/${displaySubreddit(c.subreddit)}` : "Reddit post"}
                    </span>
                    {snap?.removed && <span className="tt-badge tt-badge-removed">🔴 Removed</span>}
                  </div>
                  <div className="camp-card-title">{c.title || c.target_url}</div>
                  <div className="camp-card-stats">
                    <span>↑ {snap?.score ?? "—"}</span>
                    {snap?.reply_count != null && <span>💬 {snap.reply_count}</span>}
                    {snap && (
                      <span className={`camp-source-tag${snap.source === "simulated" ? " is-demo" : ""}`}>
                        {snap.source === "simulated" ? "demo" : "verified"}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
