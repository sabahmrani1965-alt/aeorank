import { NextResponse } from "next/server";
import { hasAdminToken } from "@/lib/adminToken";
import { sendEmail } from "@/lib/email";
import { buildWeeklyEmail } from "@/lib/weeklyReport";
import { DATA_CATEGORIES, loadSummary } from "@/lib/categoryData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = "https://www.aeorank.tech";

// Weekly "what AI recommended" email for the Resend audience (free checker
// sign-ups, who were told they'd get AEOrank updates), built only from the
// public /ai-recommendations summaries. Owner token only, and it never
// sends to the audience itself:
//   ?mode=preview  return the HTML
//   ?mode=test     send it to LEAD_EMAIL_TO only
//   ?mode=draft    create a draft broadcast in Resend; a person sends it
export async function GET(req) {
  if (!hasAdminToken(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const mode = new URL(req.url).searchParams.get("mode") || "preview";

  const summaries = (await Promise.all(DATA_CATEGORIES.map((c) => loadSummary(c.slug).catch(() => null)))).filter(
    (s) => s?.brands?.length
  );
  if (summaries.length === 0) return NextResponse.json({ error: "no category data yet" }, { status: 404 });

  const { subject, html } = buildWeeklyEmail(summaries);
  if (mode === "test") {
    const r = await sendEmail({
      to: process.env.LEAD_EMAIL_TO,
      subject: `[TEST] ${subject}`,
      html: html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", `${SITE}/ai-recommendations`),
    });
    return NextResponse.json({ test: r });
  }
  if (mode === "draft") {
    const key = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!key || !audienceId) return NextResponse.json({ error: "Resend audience not configured" }, { status: 500 });
    const res = await fetch("https://api.resend.com/broadcasts", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        audience_id: audienceId,
        from: process.env.LEAD_EMAIL_FROM,
        reply_to: process.env.LEAD_EMAIL_TO || undefined,
        subject,
        html,
        name: `Weekly AI report ${new Date().toISOString().slice(0, 10)}`,
      }),
    });
    const b = await res.json().catch(() => ({}));
    return NextResponse.json(res.ok ? { draft: b.id } : { error: "draft failed", detail: b }, { status: res.ok ? 200 : 502 });
  }
  return new NextResponse(html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "#"), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
