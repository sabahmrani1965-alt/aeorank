// Task marketplace mechanics: claiming, cooldowns, daily limits, expiry.
// No cron/background-job infrastructure exists in this app — expiry is
// enforced lazily, checked whenever anything reads or claims a task,
// rather than via a scheduled sweep.

import { rateForType } from "./posterPay";

export const CLAIM_WINDOW_MINUTES = 20;
export const TYPE_COOLDOWN_MINUTES = 15;
export const DAILY_TASK_LIMIT = 5;

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
const ESTIMATED_MINUTES = { comment: 10, reply: 10, post: 15 };
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

// Real inventory grouping — "slots" reflects genuinely how many rows
// share the same (customer, subreddit, type) combo, not a fabricated
// quota. Widened to a 14-day window so slot totals include recently
// claimed/submitted siblings, not just what's available right now. Shared
// by app/poster/page.js (the marketplace) and app/crewquest/page.js (the
// public landing page's mission preview) — same real data, same math.
export async function getAvailableMissions(admin) {
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
        subreddit: r.subreddit,
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
