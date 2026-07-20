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
