// Task marketplace mechanics: claiming, cooldowns, daily limits, expiry.
// No cron/background-job infrastructure exists in this app — expiry is
// enforced lazily, checked whenever anything reads or claims a task,
// rather than via a scheduled sweep.

import { rateForType } from "./posterPay";
import { displaySubreddit, normalizeRedditUrl } from "./format";
import { parseRedditUrl, fetchItemStats } from "./reddit";

export const CLAIM_WINDOW_MINUTES = 5;
export const TYPE_COOLDOWN_MINUTES = 15;
export const DAILY_TASK_LIMIT = 3;

// API routes are separate entry points from app/poster/layout.js's
// role-gate (which only protects page navigations), so every poster API
// route needs its own check — this mirrors requireAdminUser() in
// lib/adminAuth.js but for the poster role, using the request-scoped
// client (RLS-safe self-read), not the admin client.
export async function requirePosterUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "poster") return null;
  return user;
}

// Atomically claims a task for a poster. Fails (returns null) if someone
// else claimed it first, it's no longer available, or an existing claim
// on it hasn't expired yet — a lost race is the expected common case,
// not an error condition to throw on.
export async function claimTask(admin, taskId, posterId) {
  const nowIso = new Date().toISOString();
  const expiresAtIso = new Date(Date.now() + CLAIM_WINDOW_MINUTES * 60000).toISOString();

  const { data, error } = await admin
    .from("report_drafts")
    .update({ claimed_by: posterId, claimed_at: nowIso, claim_expires_at: expiresAtIso, status: "claimed" })
    .eq("id", taskId)
    .or(`status.eq.available,and(status.eq.claimed,claim_expires_at.lt.${nowIso})`)
    .select("id, subreddit, title, body, type, claimed_at, claim_expires_at")
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// A poster's currently-held, non-expired claim, if any. Lazily releases
// it back to the pool first if the claim window has passed, rather than
// showing stale "this is yours" state.
export async function getActiveClaim(admin, posterId) {
  const { data } = await admin
    .from("report_drafts")
    .select("id, subreddit, title, body, type, claimed_at, claim_expires_at, status")
    .eq("claimed_by", posterId)
    .eq("status", "claimed")
    .maybeSingle();

  if (!data) return null;

  if (new Date(data.claim_expires_at) < new Date()) {
    // Guarded by .eq("status", "claimed") so this can't clobber a submit
    // that raced in between the read above and this release.
    await admin
      .from("report_drafts")
      .update({ claimed_by: null, claimed_at: null, claim_expires_at: null, status: "available" })
      .eq("id", data.id)
      .eq("status", "claimed");
    return null;
  }

  return data;
}

// Which task types this poster can't claim right now because they just
// finished one of that type, and when each cooldown lifts. Returns
// { [type]: Date } — only present for types currently on cooldown.
export async function getCooldowns(admin, posterId) {
  const since = new Date(Date.now() - TYPE_COOLDOWN_MINUTES * 60000).toISOString();
  const { data } = await admin
    .from("report_drafts")
    .select("type, posted_at")
    .eq("claimed_by", posterId)
    .eq("status", "submitted")
    .gte("posted_at", since);

  const cooldowns = {};
  for (const row of data || []) {
    const type = row.type || "comment";
    const until = new Date(new Date(row.posted_at).getTime() + TYPE_COOLDOWN_MINUTES * 60000);
    if (until > new Date() && (!cooldowns[type] || until > cooldowns[type])) {
      cooldowns[type] = until;
    }
  }
  return cooldowns;
}

// Estimated minutes to complete, by task type — a disclosed heuristic
// (not a per-task measurement; no such data exists), tied to the one real
// property available: which type of content this is.
const ESTIMATED_MINUTES = { comment: 10, reply: 10, post: 15, upvote: 2 };
export function estimateMinutes(type) {
  return ESTIMATED_MINUTES[type] || ESTIMATED_MINUTES.comment;
}

// Difficulty label derived from real word count — a heuristic proxy for
// effort, not a claimed objective rating (no such rating exists).
export function difficultyForBody(body) {
  const words = String(body || "").trim().split(/\s+/).filter(Boolean).length;
  if (words <= 60) return "Easy";
  if (words <= 150) return "Medium";
  return "Hard";
}

// Bulk-release any expired claims back to the pool. getActiveClaim only
// ever releases the ONE row the original claimer is looking at, and only
// if they personally come back to check it — someone who claims a task
// and never returns leaves it stuck at status='claimed' forever, invisible
// to every other poster (getAvailableMissions below only lists rows
// already status='available'). Running this sweep here instead — the one
// place hit by every single poster browsing the marketplace, not just the
// original claimer — is what actually gets a stale claim back in front of
// someone else.
async function releaseExpiredClaims(admin) {
  const nowIso = new Date().toISOString();
  await admin
    .from("report_drafts")
    .update({ claimed_by: null, claimed_at: null, claim_expires_at: null, status: "available" })
    .eq("status", "claimed")
    .lt("claim_expires_at", nowIso);
}

// Real inventory grouping — "slots" reflects genuinely how many rows
// share the same (customer, subreddit, type) combo, not a fabricated
// quota. Widened to a 14-day window so slot totals include recently
// claimed/submitted siblings, not just what's available right now. Shared
// by app/poster/page.js (the marketplace) and app/crewquest/page.js (the
// public landing page's mission preview) — same real data, same math.
export async function getAvailableMissions(admin) {
  await releaseExpiredClaims(admin);
  const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
  const { data: recent } = await admin
    .from("report_drafts")
    .select("id, user_id, subreddit, type, title, body, status, created_at")
    .in("status", ["available", "claimed", "submitted"])
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const rows = recent || [];
  const groupKey = (r) => `${r.user_id}::${r.subreddit}::${r.type || "comment"}`;
  const totals = new Map();
  const remaining = new Map();
  for (const r of rows) {
    const k = groupKey(r);
    totals.set(k, (totals.get(k) || 0) + 1);
    if (r.status === "available") remaining.set(k, (remaining.get(k) || 0) + 1);
  }

  return rows
    .filter((r) => r.status === "available")
    .map((r) => {
      const k = groupKey(r);
      const type = r.type || "comment";
      return {
        id: r.id,
        subreddit: displaySubreddit(r.subreddit),
        type,
        title: r.title,
        body: r.body,
        reward: rateForType(type),
        estimatedMinutes: estimateMinutes(type),
        difficulty: difficultyForBody(r.body),
        slotsTotal: totals.get(k) || 1,
        slotsRemaining: remaining.get(k) || 1,
      };
    });
}

// Thrown for a rejected permalink — message is safe to show the poster
// directly (see both callers below).
export class PosterSubmissionError extends Error {}

// Validates a poster's proof link against the task it's meant to prove,
// then confirms it's genuinely live. Shared by the first submission
// (app/api/poster/tasks/[id]/submit) and a resubmission after an admin
// requested changes (app/api/poster/tasks/[id]/resubmit) so the two
// can't drift apart. `task` needs { type, subreddit, target_url }.
// Returns the full `report_drafts` update payload; throws
// PosterSubmissionError with a user-facing message on bad input.
export async function buildSubmissionUpdate(task, rawPermalink) {
  let permalink;
  if (task.type === "upvote") {
    // Upvoting doesn't create a new URL to prove — the target already
    // exists — so there's nothing new to paste; confirmed on trust, same
    // self-report basis the rest of this submission still runs on (only
    // whether the underlying content is genuinely live gets checked
    // below, not who actually did the upvoting).
    permalink = task.target_url;
  } else {
    const raw = String(rawPermalink || "").trim();
    if (!raw) throw new PosterSubmissionError("Paste the live Reddit link before submitting.");
    permalink = normalizeRedditUrl(raw);
    if (!permalink) {
      throw new PosterSubmissionError("That doesn't look like a real Reddit link. Paste the full URL of what you posted.");
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
        throw new PosterSubmissionError("That link doesn't belong to the thread you were assigned.");
      }
    } else if (task.type === "post") {
      const submittedSub = parseRedditUrl(permalink)?.sub;
      if (!submittedSub || displaySubreddit(submittedSub).toLowerCase() !== displaySubreddit(task.subreddit).toLowerCase()) {
        throw new PosterSubmissionError(`That post doesn't appear to be in r/${displaySubreddit(task.subreddit)}.`);
      }
    }
  }

  // Required liveness check, not the optional/credit-metered one
  // (app/api/drafts/[id]/refresh-stats) — free for the poster. Only a
  // CONFIRMED live result auto-completes the submission; everything else
  // (a confirmed "removed," or the check itself failing to run) goes to
  // manual review instead of an automatic reject/accept — see the fuller
  // reasoning in git history on the original submit route.
  const stats = await fetchItemStats(permalink);
  const verified = Boolean(stats && stats.removed === false);

  const nowIso = new Date().toISOString();
  const updates = {
    status: "submitted",
    posted: true,
    posted_at: nowIso,
    permalink: permalink.slice(0, 500),
    verification_status: verified ? "verified" : "needs_review",
    admin_notes: null,
  };
  if (stats) {
    updates.live_score = stats.score;
    updates.live_reply_count = stats.replyCount;
    updates.live_removed = stats.removed;
    updates.live_checked_at = nowIso;
  }
  return updates;
}

// How many tasks this poster has completed today (UTC calendar day) —
// compared against DAILY_TASK_LIMIT to gate further claims.
export async function getDailyCount(admin, posterId) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count } = await admin
    .from("report_drafts")
    .select("id", { count: "exact", head: true })
    .eq("claimed_by", posterId)
    .eq("status", "submitted")
    .gte("posted_at", startOfDay.toISOString());

  return count || 0;
}
