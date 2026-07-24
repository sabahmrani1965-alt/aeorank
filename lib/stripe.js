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
//
// Keys (starter/growth/scale) are the internal plan identifiers — also used
// by lib/credits.js's PLAN_MONTHLY_CREDITS and app/admin/page.js's plan
// counts — kept stable even though the public-facing display names are now
// Lite/Pro/Max (see components/PricingTiers.js) so existing subscriptions
// and admin reporting don't need a migration.
export const PLANS = {
  starter: {
    label: "AEOrank — Lite",
    description:
      "$100 monthly credits included, $10 per comment / $20 per post, $0.1 per upvote, thread scans every 2 weeks, weekly brand & competitor mentions, monitor 50 keywords, connect up to 3 brands, up to 2 team members.",
    amount: 19900, // $199
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  growth: {
    label: "AEOrank — Pro",
    description:
      "$200 monthly credits included, $7 per comment / $15 per post, $0.1 per upvote, weekly thread scans, daily brand & competitor mentions, monitor 75 keywords, connect up to 6 brands, unlimited team members, dedicated Slack channel.",
    amount: 29900, // $299
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  scale: {
    label: "AEOrank — Max",
    description:
      "$300 monthly credits included, $5 per comment / $10 per post, $0.1 per upvote, daily thread scans, daily brand & competitor mentions, monitor 100 keywords, connect up to 10 brands, unlimited team members, dedicated Slack channel.",
    amount: 44900, // $449
    currency: "usd",
    mode: "subscription",
    interval: "month",
    // Card is still collected at checkout (Stripe Checkout's default
    // payment_method_collection for a subscription is "always") - the
    // trial just delays the first charge, it doesn't skip requiring one.
    trialDays: 3,
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
