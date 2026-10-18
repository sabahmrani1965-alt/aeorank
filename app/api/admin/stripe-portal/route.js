import { NextResponse } from "next/server";
import { hasAdminToken } from "@/lib/adminToken";
import { stripe, isStripeConfigured, planPrices } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner token only. GET reads what the Stripe customer portal behind the
// dashboard's "Manage billing" button lets a customer do (cancel, change plan,
// update the card); POST turns on switching between Lite, Pro and Max, using
// the stored plan prices (lib/stripe.js planPrices), prorated. The live key
// never leaves Vercel.
export async function GET(req) {
  if (!hasAdminToken(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!isStripeConfigured()) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  try {
    const { data } = await stripe().billingPortal.configurations.list({ limit: 10 });
    return NextResponse.json({
      configurations: data.map((c) => ({
        id: c.id,
        is_default: c.is_default,
        active: c.active,
        livemode: c.livemode,
        cancel: c.features.subscription_cancel,
        update_plan: c.features.subscription_update?.enabled,
        payment_method: c.features.payment_method_update?.enabled,
        invoices: c.features.invoice_history?.enabled,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 502 });
  }
}

export async function POST(req) {
  if (!hasAdminToken(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!isStripeConfigured()) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  try {
    const prices = await planPrices();
    const { data } = await stripe().billingPortal.configurations.list({ is_default: true, limit: 1 });
    const config = data[0];
    if (!config) return NextResponse.json({ error: "no default portal configuration" }, { status: 404 });
    const updated = await stripe().billingPortal.configurations.update(config.id, {
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          proration_behavior: "create_prorations",
          // Switching during the 7-day trial keeps the trial; no surprise charge.
          trial_update_behavior: "continue_trial",
          products: Object.values(prices).map((p) => ({ product: p.product, prices: [p.price] })),
        },
      },
    });
    return NextResponse.json({ ok: true, prices, subscription_update: updated.features.subscription_update });
  } catch (e) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 502 });
  }
}
