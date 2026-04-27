import { NextResponse } from "next/server";
import {
  stripe,
  PLANS,
  isStripeConfigured,
  priceDataForPlan,
} from "@/lib/stripe";

export const runtime = "nodejs";

function siteOrigin(req) {
  // Prefer explicit env, fall back to the request's own host (works on Vercel).
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const plan = String(body?.plan || "").toLowerCase();
  const brand = String(body?.brand || "").slice(0, 80);
  const planConfig = PLANS[plan];
  if (!planConfig) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const price_data = priceDataForPlan(plan);
  const origin = siteOrigin(req);

  try {
    const session = await stripe().checkout.sessions.create({
      mode: planConfig.mode,
      line_items: [{ price_data, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        plan,
        brand: brand || "",
      },
      ...(planConfig.mode === "subscription"
        ? { subscription_data: { metadata: { plan, brand: brand || "" } } }
        : {}),
    });

    console.log(`[checkout] session created plan=${plan} brand=${brand || "-"} id=${session.id}`);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] stripe error:", e?.message || e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
