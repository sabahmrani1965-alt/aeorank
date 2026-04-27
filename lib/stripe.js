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

// Plan definitions used to build inline `price_data` for Stripe Checkout.
// Amounts are in cents (Stripe convention). Editing these immediately changes
// the price the customer pays — no dashboard step required.
export const PLANS = {
  trial: {
    label: "AEOrank — 1-month trial",
    description: "A one-month proof run built to show traction fast.",
    amount: 100000, // $1,000
    currency: "usd",
    mode: "payment", // one-time
  },
  growth: {
    label: "AEOrank — Growth",
    description:
      "10 strategic Reddit posts and 60 reviewed comments per month, plus AI Visibility tracking.",
    amount: 200000, // $2,000
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  boost: {
    label: "AEOrank — Full Boost",
    description:
      "20 strategic Reddit posts, 100 reviewed comments, AI Visibility tracking, and a monthly strategy call.",
    amount: 350000, // $3,500
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Build the line_items[].price_data shape for a given plan.
export function priceDataForPlan(plan) {
  const p = PLANS[plan];
  if (!p) return null;
  const base = {
    currency: p.currency,
    unit_amount: p.amount,
    product_data: { name: p.label, description: p.description },
  };
  if (p.mode === "subscription") {
    base.recurring = { interval: p.interval };
  }
  return base;
}
