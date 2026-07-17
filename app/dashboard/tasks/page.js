import { redirect } from "next/navigation";

// Track Tasks merged into Draft Library's Table view (same report_drafts
// data, no distinct purpose left) — kept as a redirect rather than a 404
// for anyone with this URL bookmarked.
export default function TrackTasksPage() {
  redirect("/dashboard/drafts?view=table");
}
