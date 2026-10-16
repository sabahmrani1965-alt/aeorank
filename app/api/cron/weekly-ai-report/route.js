import { NextResponse } from "next/server";
import { DATA_CATEGORIES, loadSummary } from "@/lib/categoryData";
import { buildWeeklyEmail } from "@/lib/weeklyReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fewer days than this and the shares are too thin to send.
const MIN_DAYS = 4;

// Mondays (vercel.json): sends the weekly AI report to the Resend audience
// (free checker sign-ups, told they'd get AEOrank updates; every email has
// Resend's unsubscribe link). Approved by the owner on 2026-10-16.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) return NextResponse.json({ skipped: "Resend audience not configured" });

  const summaries = (await Promise.all(DATA_CATEGORIES.map((c) => loadSummary(c.slug).catch(() => null)))).filter(
    (s) => s?.brands?.length
  );
  const days = Math.max(0, ...summaries.map((s) => s.days));
  if (days < MIN_DAYS) return NextResponse.json({ skipped: `not enough data yet (${days} days)` });

  const { subject, html } = buildWeeklyEmail(summaries);
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const created = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      audience_id: audienceId,
      from: process.env.LEAD_EMAIL_FROM,
      reply_to: process.env.LEAD_EMAIL_TO || undefined,
      subject,
      html,
      name: `Weekly AI report ${new Date().toISOString().slice(0, 10)}`,
    }),
  });
  const b = await created.json().catch(() => ({}));
  if (!created.ok) return NextResponse.json({ error: "create failed", detail: b }, { status: 502 });
  const sent = await fetch(`https://api.resend.com/broadcasts/${b.id}/send`, { method: "POST", headers, body: "{}" });
  const s = await sent.json().catch(() => ({}));
  return NextResponse.json({ broadcast: b.id, sent: sent.ok, detail: sent.ok ? undefined : s });
}
