import { NextResponse } from "next/server";
import { hasAdminToken } from "@/lib/adminToken";
import { esc, sendEmail } from "@/lib/email";
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

  const { subject, html } = buildEmail(summaries);
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

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The brand whose share over the last 7 days rose most above its 30-day
// share. Needs more than a week of data, or the two windows are the same.
function climber(s) {
  if (s.days <= 7) return null;
  const best = [...s.brands].sort((a, b) => b.recentShare - b.share - (a.recentShare - a.share))[0];
  return best && best.recentShare - best.share >= 10 ? best : null;
}

function buildEmail(summaries) {
  const lead = summaries.find((s) => s.slug === "crm-software") || summaries[0];
  const subject = `What AI recommended this week: ${lead.brands[0].name} leads ${lead.name}`;
  const sections = summaries
    .map((s) => {
      const up = climber(s);
      const rows = s.brands
        .slice(0, 3)
        .map(
          (b, i) =>
            `<tr><td style="padding:4px 0;color:#0d0e1d">${i + 1}. ${esc(b.name)}</td><td style="padding:4px 0;text-align:right;color:#555">${b.share}% of answers</td></tr>`
        )
        .join("");
      return `
      <div style="padding:18px 0;border-bottom:1px solid #eee">
        <a href="${SITE}/ai-recommendations/${s.slug}" style="font-size:17px;font-weight:700;color:#0d0e1d;text-decoration:none">${esc(cap(s.name))}</a>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:15px">${rows}</table>
        ${up ? `<p style="margin:8px 0 0;color:#b45309;font-size:14px">Climbing: ${esc(up.name)}, ${up.recentShare}% this week vs ${up.share}% over 30 days.</p>` : ""}
      </div>`;
    })
    .join("");
  const total = summaries.reduce((n, s) => n + s.totalAnswers, 0);
  const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;line-height:1.55;color:#333">
  <p style="color:#d97706;font-weight:700;margin:0 0 6px">AEOrank · weekly AI answer data</p>
  <h1 style="font-size:22px;margin:0 0 10px;color:#0d0e1d">Which brands ChatGPT, Claude and Gemini recommended this week</h1>
  <p style="margin:0 0 6px">Every day we ask AI assistants the same buyer questions in ${summaries.length} software categories and count which brands they name. ${total} answers so far. Here are the three most-named brands in each.</p>
  ${sections}
  <p style="margin:22px 0 8px">Is your brand in these answers? <a href="${SITE}/free-ai-visibility-checker" style="color:#d97706;font-weight:700">Check it free</a>, or see <a href="${SITE}/ai-recommendations" style="color:#d97706">every category in full</a>.</p>
  <p style="font-size:12px;color:#888;margin-top:26px">You get this because you used AEOrank's free AI visibility checker. Reply to reach Ilyas directly. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#888">Unsubscribe</a>.</p>
</div>`;
  return { subject, html };
}
