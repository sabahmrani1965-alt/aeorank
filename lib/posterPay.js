// What a poster is paid per completed task, by type. Edit these to change
// payout rates — same pattern as CREDIT_COSTS in lib/credits.js. A flat
// rate per type, not per individual task — task cards' "Reward" badge is
// just rateForType(task.type).
export const POSTER_RATES = {
  comment: 0.5,
  reply: 0.5,
  post: 1.0,
};

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

// Real payout ledger (poster_payouts) — each row is one payment event an
// admin recorded, not a computed total. "Paid" isn't stored per-task
// (a payout is one aggregate $ amount, not tied to specific rows), so
// which submitted tasks count as "paid" vs still-pending is derived here:
// oldest-submitted-first (FIFO) against the poster's total paid amount.
// Same live-computed-from-real-data spirit as everything else in this
// file — just walks two real tables instead of one.
export async function getEarningsSummary(admin, posterId) {
  const { data: tasks } = await admin
    .from("report_drafts")
    .select("id, subreddit, type, posted_at, permalink")
    .eq("claimed_by", posterId)
    .eq("status", "submitted")
    .order("posted_at", { ascending: true });

  const { data: payouts } = await admin
    .from("poster_payouts")
    .select("id, amount, note, created_at")
    .eq("poster_id", posterId)
    .order("created_at", { ascending: false });

  const rows = tasks || [];
  const totalEarned = rows.reduce((sum, t) => sum + rateForType(t.type), 0);
  const totalPaid = (payouts || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const pending = Math.max(0, totalEarned - totalPaid);

  let remaining = totalPaid;
  const tasksWithPaidStatus = rows
    .map((t) => {
      const rate = rateForType(t.type);
      const isPaid = remaining >= rate - 0.0001;
      if (isPaid) remaining -= rate;
      return { ...t, rate, displayStatus: isPaid ? "paid" : "submitted" };
    })
    .reverse(); // most recent first for display

  return { totalEarned, totalPaid, pending, tasks: tasksWithPaidStatus, payouts: payouts || [] };
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

// XP/Level — a designed game-mechanic curve layered on top of 100% real
// inputs (lifetime $ earned). The curve itself is a tunable choice, not a
// "real" business metric — edit these two constants to retune it.
export const XP_PER_DOLLAR = 100;
export const XP_PER_LEVEL = 500;

export function xpForEarnings(totalEarnedDollars) {
  return Math.round(totalEarnedDollars * XP_PER_DOLLAR);
}

export function levelForXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
