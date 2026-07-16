import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TrackTasksTable from "@/components/TrackTasksTable";

export const dynamic = "force-dynamic";

export default async function TrackTasksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("report_drafts")
    .select("id, subreddit, title, body, posted, permalink, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( track tasks )</span>
        <h2>Track tasks</h2>
        <p className="section-sub">
          Every draft you've created, in one table. Add the live link once
          you've posted something yourself, so you can find it again later
          — this doesn't check Reddit for you, it's just a place to keep
          the reference.
        </p>

        <div style={{ marginBottom: 20 }}>
          <Link href="/dashboard/drafts/new" className="btn btn-primary">
            + New draft
          </Link>
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No tasks yet — click "+ New draft" or generate a report to get one.
          </div>
        ) : (
          <TrackTasksTable tasks={tasks} />
        )}
      </div>
    </section>
  );
}
