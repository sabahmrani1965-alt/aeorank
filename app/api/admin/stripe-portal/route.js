import { NextResponse } from "next/server";
import { hasAdminToken } from "@/lib/adminToken";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner token only, read-only: what the Stripe customer portal behind the
// dashboard's "Manage billing" button lets a customer do (cancel, change plan,
// update the card), so "cancel from Billing" in the welcome email can be
// checked without the live key ever leaving Vercel.
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
