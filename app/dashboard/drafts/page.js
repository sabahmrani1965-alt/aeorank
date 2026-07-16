import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostDraftActions from "@/components/PostDraftActions";

export const dynamic = "force-dynamic";

export default async function DashboardDraftsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: drafts } = await supabase
    .from("report_drafts")
    .select("id, subreddit, title, body, posted, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( saved drafts )</span>
        <h2>Your Reddit post drafts</h2>
        <p className="section-sub">
          AI-suggested drafts from your reports, plus anything you compose
          yourself. Copy one and post it from your own account — nothing
          here is posted automatically.
        </p>

        <div style={{ marginBottom: 24 }}>
          <Link href="/dashboard/drafts/new" className="btn btn-primary">
            + New draft
          </Link>
        </div>

        {!drafts || drafts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No drafts yet — generate a report, or click "+ New draft" above to write one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {drafts.map((d) => (
              <div key={d.id} className="card">
                <div className="reddit-mock">
                  <div className="reddit-mock-meta">
                    {d.subreddit} · {d.posted ? "Posted" : "Draft — not posted yet"}
                  </div>
                  <div className="reddit-mock-title">{d.title}</div>
                  <div className="reddit-mock-body">{d.body}</div>
                  <PostDraftActions
                    title={d.title}
                    body={d.body}
                    draftId={d.id}
                    initialPosted={d.posted}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
