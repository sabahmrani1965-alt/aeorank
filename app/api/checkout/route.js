import { NextResponse } from "next/server";
import {
  stripe,
  PLANS,
  isStripeConfigured,
  priceDataForPlan,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

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

  const origin = siteOrigin(req);

  // One-time credit-pack purchase — separate branch from the plan-
  // subscription flow below. Unlike plans (which can be bought anonymously
  // and get linked to an account by email afterward), a credit top-up only
  // makes sense for an existing account, so we require login here and
  // stamp the exact user_id into metadata rather than resolving by email
  // later.
  const packageId = String(body?.packageId || "").trim();
  if (packageId) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to buy credits." }, { status: 401 });
    }

    const { data: pkg } = await supabase
      .from("credit_packages")
      .select("id, name, credits, bonus_credits, price_cents, currency")
      .eq("id", packageId)
      .eq("active", true)
      .maybeSingle();
    if (!pkg) {
      return NextResponse.json({ error: "Unknown credit package." }, { status: 400 });
    }

    // Total granted includes any bonus credits — the webhook just grants
    // whatever number is in metadata.credits, so it needs no change itself.
    const totalCredits = pkg.credits + (pkg.bonus_credits || 0);
    const description = pkg.bonus_credits
      ? `${pkg.credits} + ${pkg.bonus_credits} bonus AEOrank credits`
      : `${pkg.credits} AEOrank credits`;

    try {
      const session = await stripe().checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: pkg.currency,
              unit_amount: pkg.price_cents,
              product_data: { name: pkg.name, description },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        allow_promotion_codes: true,
        metadata: {
          packageId: pkg.id,
          credits: String(totalCredits),
          baseCredits: String(pkg.credits),
          bonusCredits: String(pkg.bonus_credits || 0),
          userId: user.id,
        },
      });
      console.log(`[checkout] credit-pack session created package=${pkg.id} user=${user.id} id=${session.id}`);
      return NextResponse.json({ url: session.url });
    } catch (e) {
      console.error("[checkout] stripe error (credit pack):", e?.message || e);
      return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
    }
  }

  const plan = String(body?.plan || "").toLowerCase();
  const brand = String(body?.brand || "").slice(0, 80);
  const planConfig = PLANS[plan];
  if (!planConfig) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const price_data = priceDataForPlan(plan);

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
        ? {
            subscription_data: {
              metadata: { plan, brand: brand || "" },
              ...(planConfig.trialDays ? { trial_period_days: planConfig.trialDays } : {}),
            },
          }
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
