// What a poster is paid per completed task, by type. Edit these to change
// payout rates — same pattern as CREDIT_COSTS in lib/credits.js. This is
// informational only (a running total); no payout/paid-status tracking.
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
