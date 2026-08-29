import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser } from "@/lib/posterTasks";
import { normalizeRedditUrl, displaySubreddit } from "@/lib/format";
import { parseRedditUrl, fetchItemStats } from "@/lib/reddit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data: task } = await admin
    .from("report_drafts")
    .select("type, subreddit, target_url")
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "claimed")
    .maybeSingle();
  if (!task) {
    return NextResponse.json(
      { error: "Could not submit: this task may have expired or already been submitted." },
      { status: 409 }
    );
  }

  // Upvoting doesn't create a new URL to prove — the target already
  // exists — so there's nothing new to paste; it's confirmed on trust,
  // same self-report basis the rest of this submission still runs on
  // (only whether the underlying content is genuinely live gets checked
  // below, not who actually did the upvoting).
  let permalink;
  if (task.type === "upvote") {
    permalink = task.target_url;
  } else {
    const raw = String(body?.permalink || "").trim();
    if (!raw) {
      return NextResponse.json({ error: "Paste the live Reddit link before submitting." }, { status: 400 });
    }
    permalink = normalizeRedditUrl(raw);
    if (!permalink) {
      return NextResponse.json(
        { error: "That doesn't look like a real Reddit link. Paste the full URL of what you posted." },
        { status: 400 }
      );
    }

    // Free, deterministic checks — no external call needed. A comment/
    // reply must land in the exact thread the task pointed at (comparing
    // at thread level via parseRedditUrl, which discards the comment-id
    // suffix, so it doesn't matter which comment in that thread); a post
    // must land in the assigned subreddit.
    if (task.type === "comment" || task.type === "reply") {
      const submittedThread = parseRedditUrl(permalink)?.permalink;
      const targetThread = task.target_url ? parseRedditUrl(task.target_url)?.permalink : null;
      if (!targetThread || submittedThread !== targetThread) {
        return NextResponse.json(
          { error: "That link doesn't belong to the thread you were assigned." },
          { status: 400 }
        );
      }
    } else if (task.type === "post") {
      const submittedSub = parseRedditUrl(permalink)?.sub;
      if (!submittedSub || displaySubreddit(submittedSub).toLowerCase() !== displaySubreddit(task.subreddit).toLowerCase()) {
        return NextResponse.json(
          { error: `That post doesn't appear to be in r/${displaySubreddit(task.subreddit)}.` },
          { status: 400 }
        );
      }
    }
  }

  // Required liveness check, not the optional/credit-metered one
  // (app/api/drafts/[id]/refresh-stats) — free for the poster (posters
  // don't have a credit account; this is an operational cost the
  // business absorbs, same as claim/release). Only a CONFIRMED live
  // result auto-completes the submission. Everything else — a confirmed
  // "removed," or `stats === null` (the check itself couldn't run: Apify
  // not configured, or the call failed/timed out) — goes to manual
  // review instead of an automatic reject/accept: fetchItemStats has
  // documented reliability gaps (see its own comment), so a "removed"
  // signal isn't reliable enough on its own to block a poster with no
  // recourse, and an infrastructure hiccup shouldn't either. The task
  // still moves to 'submitted' either way (the poster isn't left stuck
  // holding a claim) — it just doesn't count toward real earnings until
  // an admin approves it (see getEarningsSummary, lib/posterPay.js).
  const stats = await fetchItemStats(permalink);
  const verified = Boolean(stats && stats.removed === false);

  const nowIso = new Date().toISOString();
  const updates = {
    status: "submitted",
    posted: true,
    posted_at: nowIso,
    permalink: permalink.slice(0, 500),
    verification_status: verified ? "verified" : "needs_review",
  };
  if (stats) {
    updates.live_score = stats.score;
    updates.live_reply_count = stats.replyCount;
    updates.live_removed = stats.removed;
    updates.live_checked_at = nowIso;
  }

  const { data, error } = await admin
    .from("report_drafts")
    .update(updates)
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "claimed")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not submit: this task may have expired or already been submitted." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
