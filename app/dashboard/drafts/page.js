import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrackTasksTable from "@/components/TrackTasksTable";

export const dynamic = "force-dynamic";

export default async function DashboardDraftsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: drafts } = await supabase
    .from("report_drafts")
    .select("id, type, subreddit, title, body, permalink, posted_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( track task )</span>
        <h2>Your tasks</h2>
        <p className="section-sub">
          AI-suggested replies and posts from your reports, plus anything you
          compose yourself. Copy one and post it from your own account —
          nothing here is posted automatically. Expand a row to read the
          content, copy it, and add the live link once you've posted it.
        </p>

        <div style={{ marginBottom: 24 }}>
          <Link href="/dashboard/drafts/new" className="btn btn-primary">
            + New task
          </Link>
        </div>

        {!drafts || drafts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No tasks yet — generate a report, or click "+ New task" above to write one.
          </div>
        ) : (
          <TrackTasksTable tasks={drafts} />
        )}
      </div>
    </section>
  );
}
