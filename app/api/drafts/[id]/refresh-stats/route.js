import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchItemStats } from "@/lib/reddit";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

// On-demand only (never automatic) — each call is a real Apify fetch, same
// cost shape as Opportunities' "Quick Preview" analysis. Re-fetches this
// one task's own live permalink: current score, reply count (post-level
// only — see lib/reddit.js's fetchItemStats), and whether it looks removed.
export async function POST(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  // RLS-equivalent belt-and-suspenders .eq("user_id", ...) — same pattern
  // as the sibling PATCH route on this same [id] path.
  const { data: task } = await supabase
    .from("report_drafts")
    .select("id, permalink")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }
  if (!task.permalink) {
    return NextResponse.json({ error: "This task doesn't have a live link yet." }, { status: 400 });
  }

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "refresh_reddit_stats",
    amount: CREDIT_COSTS.refresh_reddit_stats,
    description: "Refreshed live Reddit stats",
    metadata: { draftId: task.id },
    run: () => fetchItemStats(task.permalink),
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json(
      { error: "Couldn't check that link right now. Try again." },
      { status: 502 }
    );
  }

  const stats = outcome.result;
  const checkedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("report_drafts")
    .update({
      live_score: stats.score,
      live_reply_count: stats.replyCount,
      live_removed: stats.removed,
      live_checked_at: checkedAt,
    })
    .eq("id", task.id);
  if (updateError) {
    console.error("[drafts/refresh-stats] save failed:", updateError.message);
  }

  return NextResponse.json({
    ok: true,
    liveScore: stats.score,
    liveReplyCount: stats.replyCount,
    liveRemoved: stats.removed,
    liveCheckedAt: checkedAt,
    creditsRemaining: outcome.balance,
  });
}
