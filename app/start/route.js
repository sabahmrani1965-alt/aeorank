import { NextResponse } from "next/server";
import { stripe, PLANS, isStripeConfigured, priceDataForPlan } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A plain link straight into Stripe Checkout, for emails and DMs where the
// pricing page's buttons can't be used: /start (Lite, $199) or
// /start?plan=growth|scale, optionally &brand=Name. Same session as
// /api/checkout's plan branch, including the 7-day trial.
export async function GET(req) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const plan = (url.searchParams.get("plan") || "starter").toLowerCase();
  const brand = (url.searchParams.get("brand") || "").slice(0, 80);
  const planConfig = PLANS[plan];
  if (!planConfig || !isStripeConfigured()) return NextResponse.redirect(`${origin}/pricing`, 303);

  try {
    const session = await stripe().checkout.sessions.create({
      mode: planConfig.mode,
      line_items: [{ price_data: priceDataForPlan(plan), quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: { plan, brand, source: "start-link" },
      subscription_data: {
        metadata: { plan, brand },
        ...(planConfig.trialDays ? { trial_period_days: planConfig.trialDays } : {}),
      },
    });
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    console.error("[start] stripe error:", e?.message || e);
    return NextResponse.redirect(`${origin}/pricing`, 303);
  }
}
