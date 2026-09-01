import { displaySubreddit } from "./format";

// What a poster is paid per completed task, by type. Edit these to change
// payout rates — same pattern as CREDIT_COSTS in lib/credits.js. A flat
// rate per type, not per individual task — task cards' "Reward" badge is
// just rateForType(task.type).
export const POSTER_RATES = {
  comment: 0.5,
  reply: 1.0,
  post: 2.0,
  upvote: 0.1,
};

// Smallest amount a poster can request in one withdrawal — enforced
// server-side in app/api/poster/withdraw, not just a UI hint.
export const MIN_WITHDRAWAL_AMOUNT = 10;

// Rows saved before the `type` column existed are NULL — same fallback
// used when charging credits for a save (lib/credits.js callers treat a
// missing type as "comment").
export function rateForType(type) {
  return POSTER_RATES[type] ?? POSTER_RATES.comment;
}

// Referral commission: 15% of everything a referred poster earns (via
// POSTER_RATES) during their first 3 calendar months as a poster.
// Informational only — no ledger, same convention as POSTER_RATES itself.
export const REFERRAL_COMMISSION_RATE = 0.15;
export const REFERRAL_WINDOW_MONTHS = 3;

// One-time credit for the REFERRED poster (not the referrer) for having
// signed up via a valid referral code — folded into getEarningsSummary
// below as a synthetic row, so it flows through the same paid/pending
// math and shows up in the visible transaction list, not just a silent
// bump to the totals.
export const REFERRAL_SIGNUP_BONUS = 5;

// Avoids visually/verbally ambiguous characters (0/O, 1/I/L) since this
// is meant to be spoken or typed by hand, not just clicked as a link.
const REFERRAL_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateReferralCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)];
  }
  return code;
}

// Self-healing, same convention as lib/brands.js's getActiveCompanyProfile
// — generated lazily the first time it's needed (viewing /poster/refer),
// not at signup, and persisted once so it's stable afterward. Collisions
// are astronomically unlikely at this app's scale (32^6 combinations) but
// still checked and retried rather than assumed away.
export async function ensureReferralCode(admin, userId) {
  const { data: row } = await admin.from("users").select("referral_code").eq("id", userId).maybeSingle();
  if (row?.referral_code) return row.referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const { data: existing } = await admin.from("users").select("id").eq("referral_code", code).maybeSingle();
    if (existing) continue;
    const { error } = await admin.from("users").update({ referral_code: code }).eq("id", userId);
    if (!error) return code;
  }
  return null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Resolves a `ref` query param/field value to a real poster's user id —
// shared by both signup entry points (app/api/poster/verify-reddit and
// the legacy app/api/poster-applications) so they can't drift out of
// sync. Accepts either the new short referral_code OR a legacy raw
// user-id link shared before referral codes existed. Silently returns
// null for anything missing/malformed/not-a-poster — a bad or absent
// referral must never block signup.
export async function resolveReferrerId(admin, refParam) {
  const ref = String(refParam || "").trim();
  if (!ref) return null;

  let query = admin.from("users").select("id").eq("role", "poster");
  query = UUID_RE.test(ref) ? query.or(`referral_code.eq.${ref},id.eq.${ref}`) : query.eq("referral_code", ref);

  const { data: referrer } = await query.maybeSingle();
  return referrer?.id || null;
}

// End of a referred poster's earning window, as a Date. Built via UTC
// component math (not referredSince.setMonth(...)) to sidestep the
// well-known day-overflow bug (e.g. Jan 31 + 3mo would otherwise silently
// land on May 1 instead of clamping predictably to the last valid day).
export function referralWindowEnd(referredSince) {
  const d = new Date(referredSince);
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth() + REFERRAL_WINDOW_MONTHS,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    )
  );
}

// Whether a completed draft's posted_at falls inside the referred poster's
// 3-month earning window. Returns false (never throws) for missing/invalid
// dates — a posted=true row with a null posted_at is a data anomaly we
// skip rather than crash on.
export function isWithinReferralWindow(postedAt, referredSince) {
  if (!postedAt || !referredSince) return false;
  const posted = new Date(postedAt);
  const since = new Date(referredSince);
  if (Number.isNaN(posted.getTime()) || Number.isNaN(since.getTime())) return false;
  return posted >= since && posted <= referralWindowEnd(since);
}

// Real payout ledger (poster_payouts) — each row is either an admin
// directly recording a payment ('paid') or a poster's own withdrawal
// request awaiting admin action ('requested'). Only 'paid' rows reduce
// Pending — a requested-but-not-yet-paid withdrawal doesn't change the
// real owed amount. "Paid" isn't stored per-task (a payout is one
// aggregate $ amount, not tied to specific rows), so which submitted
// tasks count as "paid" vs still-pending is derived here: oldest-first
// (FIFO) against the poster's total PAID amount.
export async function getEarningsSummary(admin, posterId) {
  const { data: tasks } = await admin
    .from("report_drafts")
    .select("id, subreddit, type, posted_at, permalink, verification_status")
    .eq("claimed_by", posterId)
    .eq("status", "submitted")
    .order("posted_at", { ascending: true });

  const { data: payouts } = await admin
    .from("poster_payouts")
    .select("id, amount, note, status, created_at")
    .eq("poster_id", posterId)
    .order("created_at", { ascending: false });

  const { data: posterRow } = await admin
    .from("users")
    .select("referred_by, created_at")
    .eq("id", posterId)
    .maybeSingle();

  // NULL means this row predates verification_status (grandfathered in
  // as verified, same as every submission before this review gate
  // existed); 'needs_review' rows are shown (so nothing silently
  // vanishes from a poster's own history) but contribute $0 until an
  // admin approves them (app/api/admin/drafts/[id]/review).
  const taskRows = (tasks || []).map((t) => ({
    ...t,
    rate: rateForType(t.type),
    isBonus: false,
    countable: !t.verification_status || t.verification_status === "verified",
  }));

  // A one-time $5 credit for having signed up via a valid referral —
  // modeled as a synthetic row (not a real report_drafts task) so it goes
  // through the exact same FIFO paid/pending math below and shows up in
  // the transaction list, rather than only silently bumping the totals.
  const bonusRows = posterRow?.referred_by
    ? [
        {
          id: "referral-bonus",
          subreddit: "Referral bonus",
          type: "bonus",
          posted_at: posterRow.created_at,
          permalink: null,
          rate: REFERRAL_SIGNUP_BONUS,
          isBonus: true,
          countable: true,
        },
      ]
    : [];

  const rows = [...bonusRows, ...taskRows].sort((a, b) => new Date(a.posted_at) - new Date(b.posted_at));

  const totalEarned = rows.filter((r) => r.countable).reduce((sum, r) => sum + r.rate, 0);
  const totalPaid = (payouts || [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRequested = (payouts || [])
    .filter((p) => p.status === "requested")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pending = Math.max(0, totalEarned - totalPaid - totalRequested);

  let remaining = totalPaid;
  const tasksWithPaidStatus = rows
    .map((r) => {
      const subreddit = r.isBonus ? r.subreddit : displaySubreddit(r.subreddit);
      if (!r.countable) {
        const displayStatus =
          r.verification_status === "rejected"
            ? "rejected"
            : r.verification_status === "changes_requested"
            ? "changes_requested"
            : "pending_review";
        return { ...r, subreddit, displayStatus };
      }
      const isPaid = remaining >= r.rate - 0.0001;
      if (isPaid) remaining -= r.rate;
      return { ...r, subreddit, displayStatus: isPaid ? "paid" : "submitted" };
    })
    .reverse(); // most recent first for display

  return { totalEarned, totalPaid, totalRequested, pending, tasks: tasksWithPaidStatus, payouts: payouts || [] };
}

// Consecutive-day streak (UTC calendar days) ending today or yesterday —
// a gap of 2+ days breaks it. `postedDates` is any array of Date/ISO
// strings from real completed tasks; duplicates within the same day
// collapse naturally via the Set.
export function computeStreak(postedDates) {
  const daySet = new Set((postedDates || []).map((d) => new Date(d).toISOString().slice(0, 10)));
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  if (!daySet.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1); // today not done yet — still counts if yesterday was
  }

  let streak = 0;
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
