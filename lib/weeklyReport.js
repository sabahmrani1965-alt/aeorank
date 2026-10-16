// The weekly "what AI recommended" email, built from the public
// /ai-recommendations summaries. Sent by app/api/cron/weekly-ai-report;
// previewed and tested through app/api/admin/weekly-ai-report.
import { esc } from "@/lib/email";

const SITE = "https://www.aeorank.tech";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The brand whose share over the last 7 days rose most above its 30-day
// share. Needs more than a week of data, or the two windows are the same.
function climber(s) {
  if (s.days <= 7) return null;
  const best = [...s.brands].sort((a, b) => b.recentShare - b.share - (a.recentShare - a.share))[0];
  return best && best.recentShare - best.share >= 10 ? best : null;
}

export function buildWeeklyEmail(summaries) {
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
