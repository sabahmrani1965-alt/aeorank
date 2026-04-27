import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { sendEmail, esc, isEmailConfigured } from "@/lib/email";

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
      await notifyAdmin(session);
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
