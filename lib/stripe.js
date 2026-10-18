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
    // Card is still collected at checkout (Stripe Checkout's default
    // payment_method_collection for a subscription is "always") - the
    // trial just delays the first charge, it doesn't skip requiring one.
    trialDays: 7,
  },
  growth: {
    label: "AEOrank — Pro",
    description:
      "$200 monthly credits included, $7 per comment / $15 per post, $0.1 per upvote, weekly thread scans, daily brand & competitor mentions, monitor 75 keywords, connect up to 6 brands, unlimited team members.",
    amount: 29900, // $299
    currency: "usd",
    mode: "subscription",
    interval: "month",
    trialDays: 7,
  },
  scale: {
    label: "AEOrank — Max",
    description:
      "$300 monthly credits included, $5 per comment / $10 per post, $0.1 per upvote, daily thread scans, daily brand & competitor mentions, monitor 100 keywords, connect up to 10 brands, unlimited team members.",
    amount: 44900, // $449
    currency: "usd",
    mode: "subscription",
    interval: "month",
    trialDays: 7,
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

// Stored Stripe prices, one per plan, found by lookup key (created on first
// use). Checkout bills these instead of inline price_data so the customer
// portal can offer switching between plans: it can only list saved prices.
// Changing an amount in PLANS creates a new price under the same lookup key
// (transfer_lookup_key); existing subscriptions keep their old price.
const LOOKUP = { starter: "aeorank_lite_monthly", growth: "aeorank_pro_monthly", scale: "aeorank_max_monthly" };
let _prices = null;

export async function planPrices() {
  if (_prices) return _prices;
  const s = stripe();
  const keys = Object.values(LOOKUP);
  const { data } = await s.prices.list({ lookup_keys: keys, active: true, limit: keys.length, expand: ["data.product"] });
  const out = {};
  for (const [plan, key] of Object.entries(LOOKUP)) {
    const p = PLANS[plan];
    let price = data.find((x) => x.lookup_key === key);
    if (!price || price.unit_amount !== p.amount || price.currency !== p.currency) {
      const productId =
        typeof price?.product === "object" ? price.product.id : price?.product ||
        (await s.products.create({ name: p.label, description: p.description, metadata: { plan } })).id;
      price = await s.prices.create({
        product: productId,
        currency: p.currency,
        unit_amount: p.amount,
        recurring: { interval: p.interval },
        lookup_key: key,
        transfer_lookup_key: true,
        metadata: { plan },
      });
    }
    out[plan] = { price: price.id, product: typeof price.product === "object" ? price.product.id : price.product };
  }
  _prices = out;
  return out;
}

// Plan key for a subscription's price (after a change in the portal).
export function planForPrice(price) {
  if (!price) return null;
  if (price.metadata?.plan && PLANS[price.metadata.plan]) return price.metadata.plan;
  return Object.entries(LOOKUP).find(([, key]) => key === price.lookup_key)?.[0] || null;
}

// The checkout line item for a plan: the stored price, or inline price_data
// if Stripe can't be reached for it (checkout still works, without the
// portal plan switch for that subscription).
export async function lineItemForPlan(plan) {
  if (PLANS[plan]?.mode === "subscription") {
    try {
      const prices = await planPrices();
      if (prices[plan]) return { price: prices[plan].price, quantity: 1 };
    } catch (e) {
      console.error("[stripe] stored price unavailable, using price_data:", e?.message || e);
    }
  }
  return { price_data: priceDataForPlan(plan), quantity: 1 };
}
