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
// All three tiers are monthly partnership packages. Differentiation is on
// volume (posts, comments, blog placements) and surface (newsletter,
// permanent listing). AEO structuring across ChatGPT / Perplexity / Claude
// is included in every tier. Content is published on saasoffers.tech (our
// sister SaaS deals marketplace) — the relationship is disclosed in the
// public-facing pricing copy.
export const PLANS = {
  starter: {
    label: "AEOrank — Starter",
    description:
      "5 Reddit posts from established accounts, 15 strategic comments with natural brand mentions, 1 blog post published on saasoffers.tech (our sister marketplace), AEO structuring across ChatGPT, Perplexity & Claude.",
    amount: 200000, // $2,000
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  growth: {
    label: "AEOrank — Growth",
    description:
      "9 Reddit posts, 25 strategic comments, 2 blog posts published on saasoffers.tech, newsletter mention to the SaaSOffers founder audience, AEO structuring across ChatGPT, Perplexity & Claude.",
    amount: 350000, // $3,500
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  scale: {
    label: "AEOrank — Scale",
    description:
      "18 Reddit posts, 50 strategic comments, 4 blog posts published on saasoffers.tech, newsletter mention to the SaaSOffers founder audience, permanent featured listing on saasoffers.tech, AEO structuring across ChatGPT, Perplexity & Claude.",
    amount: 650000, // $6,500
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
