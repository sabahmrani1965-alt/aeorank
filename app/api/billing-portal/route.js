import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function siteOrigin(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found for this account." }, { status: 404 });
  }

  try {
    const portalSession = await stripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteOrigin(req)}/dashboard/billing`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (e) {
    console.error("[billing-portal] stripe error:", e?.message || e);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
