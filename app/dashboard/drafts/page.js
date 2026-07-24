import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import TrackTasksTable from "@/components/TrackTasksTable";
import ExportTasksCsvButton from "@/components/ExportTasksCsvButton";

export const dynamic = "force-dynamic";

export default async function DashboardDraftsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data: drafts } = profile
    ? await supabase
        .from("report_drafts")
        .select(
          "id, type, subreddit, title, body, permalink, target_url, posted_at, created_at, live_score, live_reply_count, live_removed, live_checked_at"
        )
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( track task )</span>
        <h2>Your tasks</h2>

        <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard/drafts/new" className="btn btn-primary">
            + New task
          </Link>
          {drafts?.length > 0 && <ExportTasksCsvButton tasks={drafts} />}
        </div>

        {!drafts || drafts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No tasks yet. Generate a report, or click "+ New task" above to write one.
          </div>
        ) : (
          <TrackTasksTable tasks={drafts} />
        )}
      </div>
    </section>
  );
}
