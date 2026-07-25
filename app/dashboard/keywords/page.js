import { redirect } from "next/navigation";

// Keywords merged into Company Profile as a tab (same tracked_keywords
// data, no distinct purpose left as its own sidebar item) — kept as a
// redirect rather than a 404 for anyone with this URL bookmarked.
export default function KeywordsPage() {
  redirect("/dashboard/settings?tab=keywords");
}
