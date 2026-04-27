// Server-only Stripe SDK wrapper. Lazily instantiated so the module can be
// imported without a key (e.g. at build time).

import Stripe from "stripe";

let _stripe = null;
export function stripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key);
  return _stripe;
}

// Plan key → { priceId, mode } map. Price IDs come from env so the same
// codebase can target test vs live keys without edits.
//   STRIPE_PRICE_TRIAL   — one-time $1,000
//   STRIPE_PRICE_GROWTH  — recurring $2,000/mo
//   STRIPE_PRICE_BOOST   — recurring $3,500/mo
export const PLANS = {
  trial: {
    priceEnv: "STRIPE_PRICE_TRIAL",
    mode: "payment", // one-time
    label: "1-month trial",
  },
  growth: {
    priceEnv: "STRIPE_PRICE_GROWTH",
    mode: "subscription",
    label: "Growth",
  },
  boost: {
    priceEnv: "STRIPE_PRICE_BOOST",
    mode: "subscription",
    label: "Full Boost",
  },
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
