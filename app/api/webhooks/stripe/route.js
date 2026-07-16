import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { sendEmail, esc, isEmailConfigured, addToAudience } from "@/lib/email";
import { createAdminClient, ensureUserId } from "@/lib/supabase/admin";
import { grantCredits, PLAN_MONTHLY_CREDITS } from "@/lib/credits";

// Stripe needs the *raw* request body to verify the signature, so we read
// it as text and pass it untouched into stripe.webhooks.constructEvent.
// Edge runtime would also work but we already use Node elsewhere.
export const runtime = "nodejs";

function fmtAmount(amountCents, currency) {
  if (amountCents == null) return "";
  const n = (amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  });
  return n;
}

async function notifyAdmin(session) {
  const to = process.env.LEAD_EMAIL_TO;
  if (!to) {
    console.warn("[stripe webhook] LEAD_EMAIL_TO not set — skipping admin notify");
    return;
  }
  if (!isEmailConfigured()) {
    console.warn("[stripe webhook] RESEND_API_KEY not set — skipping admin notify");
    return;
  }

  const plan = session.metadata?.plan || "(unknown)";
  const brand = session.metadata?.brand || "(none)";
  const email =
    session.customer_details?.email || session.customer_email || "(no email)";
  const name = session.customer_details?.name || "";
  const country = session.customer_details?.address?.country || "";
  const amount = fmtAmount(session.amount_total, session.currency);
  const isSub = session.mode === "subscription";
  const dashUrl = `https://dashboard.stripe.com/${session.livemode ? "" : "test/"}payments/${session.payment_intent || session.subscription || session.id}`;

  const subject = `New ${plan} ${isSub ? "subscriber" : "customer"} — ${amount} (${brand})`;

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.55">
      <h2 style="margin:0 0 12px">New ${esc(isSub ? "subscriber" : "customer")} 🎉</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 12px 6px 0;color:#666">Plan</td><td style="padding:6px 0"><strong>${esc(plan)}</strong>${isSub ? " (recurring monthly)" : " (one-time)"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Amount</td><td style="padding:6px 0">${esc(amount)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Brand from report</td><td style="padding:6px 0">${esc(brand)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Customer</td><td style="padding:6px 0">${esc(name || "(no name)")} &lt;${esc(email)}&gt;</td></tr>
        ${country ? `<tr><td style="padding:6px 12px 6px 0;color:#666">Country</td><td style="padding:6px 0">${esc(country)}</td></tr>` : ""}
      </table>
      <p style="margin:18px 0 6px"><a href="${esc(dashUrl)}" style="color:#f2a83b">Open in Stripe dashboard →</a></p>
      <p style="color:#888;font-size:12px;margin-top:18px">Session id: ${esc(session.id)}</p>
    </div>
  `;

  const text =
    `New ${isSub ? "subscriber" : "customer"}\n` +
    `Plan: ${plan} ${isSub ? "(recurring monthly)" : "(one-time)"}\n` +
    `Amount: ${amount}\n` +
    `Brand: ${brand}\n` +
    `Customer: ${name || "(no name)"} <${email}>\n` +
    (country ? `Country: ${country}\n` : "") +
    `\nStripe: ${dashUrl}\nSession: ${session.id}\n`;

  await sendEmail({ to, subject, html, text, replyTo: email });
}

// Provisions (or reuses) an account for the buyer and records the
// subscription — this is the durable source of truth the dashboard reads
// from; today's account.metadata.plan on the Stripe session is the only
// signal that existed before this, and it's not queryable outside Stripe.
async function provisionSubscription(session) {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[stripe webhook] Supabase not configured — skipping subscription provisioning");
    return;
  }
  const email = session.customer_details?.email || session.customer_email;
  if (!email || !session.subscription) return;

  const userId = await ensureUserId(admin, email);

  await admin
    .from("users")
    .update({ stripe_customer_id: session.customer })
    .eq("id", userId);

  const subscription = await stripe().subscriptions.retrieve(session.subscription);
  const plan = session.metadata?.plan;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan,
      status: subscription.status,
      brand: session.metadata?.brand || null,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  await grantMonthlyCredits(admin, userId, plan);
}

// Grants a plan's monthly credit allowance and bumps the reset date one
// month out. Called on initial signup and on every successful renewal
// invoice — grant_credits' upsert-on-conflict means the credit_balances
// row always exists after this, even for a brand-new user.
async function grantMonthlyCredits(admin, userId, plan) {
  const amount = PLAN_MONTHLY_CREDITS[plan];
  if (!amount) return;
  await grantCredits(admin, userId, amount, "monthly_renewal", `Monthly ${plan} plan credits`, { plan });
  const resetAt = new Date();
  resetAt.setMonth(resetAt.getMonth() + 1);
  await admin
    .from("credit_balances")
    .update({ monthly_allowance: amount, allowance_reset_at: resetAt.toISOString() })
    .eq("user_id", userId);
}

// Keeps an existing subscriptions row in sync for the rest of its
// lifecycle — cancellations, renewals, and failed payments were previously
// silently ignored entirely.
async function syncSubscriptionStatus(stripeSubscriptionId, patch) {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin
    .from("subscriptions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) {
    console.error("[stripe webhook] subscription sync failed:", error.message);
  }
}

// invoice.paid fires on every renewal (and the very first invoice) — looks
// up which user/plan this subscription belongs to via our own table, since
// the invoice itself doesn't carry our metadata.
async function grantRenewalCredits(stripeSubscriptionId) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: sub } = await admin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  if (!sub) return;
  await grantMonthlyCredits(admin, sub.user_id, sub.plan);
}

// One-time credit-pack purchase — session.metadata carries the exact
// user_id (stamped at checkout creation, see app/api/checkout/route.js),
// so no email-based user resolution is needed here.
async function grantPackageCredits(session) {
  const admin = createAdminClient();
  if (!admin) return;
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits || 0);
  if (!userId || !credits) return;
  await grantCredits(admin, userId, credits, "purchase", "Credit pack purchase", {
    packageId: session.metadata?.packageId,
    sessionId: session.id,
  });
}

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 500 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  // Raw body is required — do NOT use req.json() here.
  const raw = await req.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("[stripe webhook] signature verification failed:", e?.message || e);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(
        `[stripe webhook] checkout completed plan=${session.metadata?.plan || "-"} amount=${session.amount_total} mode=${session.mode}`
      );
      const customerEmail =
        session.customer_details?.email || session.customer_email || "";
      const customerName = session.customer_details?.name || "";
      await Promise.all([
        notifyAdmin(session),
        addToAudience({ email: customerEmail, name: customerName }),
        session.mode === "payment" && session.metadata?.packageId
          ? grantPackageCredits(session)
          : provisionSubscription(session),
      ]);
    } else if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      // "subscription_create" is the very first invoice — that period's
      // credits are already granted by provisionSubscription() above, in
      // the same checkout.session.completed event. Only actual renewals
      // ("subscription_cycle") should grant again here, or the first
      // month would be double-credited.
      if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
        await grantRenewalCredits(invoice.subscription);
      }
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      await syncSubscriptionStatus(subscription.id, {
        status: subscription.status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      });
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await syncSubscriptionStatus(subscription.id, { status: "canceled" });
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await syncSubscriptionStatus(invoice.subscription, { status: "past_due" });
      }
    } else {
      // Other events ignored — Stripe will still get a 200.
      console.log(`[stripe webhook] ignoring event type=${event.type}`);
    }
  } catch (e) {
    // Don't throw on email failures — just log. Returning 500 would make
    // Stripe retry and double-notify.
    console.error("[stripe webhook] handler error:", e?.message || e);
  }

  return NextResponse.json({ received: true });
}
