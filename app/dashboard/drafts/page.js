import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DraftsView from "@/components/DraftsView";

export const dynamic = "force-dynamic";

export default async function DashboardDraftsPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: drafts } = await supabase
    .from("report_drafts")
    .select("id, subreddit, title, body, posted, permalink, created_at")
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
          nothing here is posted automatically. Switch to Table to search,
          filter, and add the live link once you've posted something.
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
          <DraftsView drafts={drafts} initialView={searchParams?.view === "table" ? "table" : "cards"} />
        )}
      </div>
    </section>
  );
}
