import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateForType } from "@/lib/posterPay";
import { displaySubreddit } from "@/lib/format";
import TaskDetail from "@/components/karmacrew/TaskDetail";

export const dynamic = "force-dynamic";

export default async function PosterTaskDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  if (!admin) redirect("/poster");

  const { data: task } = await admin
    .from("report_drafts")
    .select("id, subreddit, type, title, body, status, claimed_at, claim_expires_at, permalink, target_url, verification_status")
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .maybeSingle();

  // Not theirs (never claimed, claim expired and released, or someone
  // else's) — back to the marketplace rather than a bare 404.
  if (!task || !["claimed", "submitted"].includes(task.status)) {
    redirect("/poster");
  }

  return <TaskDetail task={{ ...task, subreddit: displaySubreddit(task.subreddit) }} reward={rateForType(task.type)} />;
}
