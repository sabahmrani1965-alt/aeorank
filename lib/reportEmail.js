import { esc } from "./email";

const ORANGE = "#F2A83B";
const NAVY = "#06112A";
const TEXT = "#0f1830";
const MUTED = "#6b7693";
const BORDER = "#e6e8ee";

function formatMembers(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function renderReportEmail({
  brand,
  url,
  description,
  subreddits = [],
  posts = [],
  llmAnswers = [],
  reportUrl,
  baseUrl,
}) {
  const topSubs = subreddits.slice(0, 6);
  const topPosts = posts.slice(0, 5);
  const totalAudience = topSubs.reduce((s, x) => s + (x.members || 0), 0);

  const subsHtml = topSubs
    .map(
      (s) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};">
          <a href="${esc(s.url)}" style="color:${TEXT};text-decoration:none;font-weight:600;">${esc(s.name)}</a>
          <div style="color:${MUTED};font-size:13px;margin-top:2px;">${esc((s.desc || "").slice(0, 90))}</div>
        </td>
        <td align="right" style="padding:10px 14px;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;white-space:nowrap;">
          ${formatMembers(s.members || 0)} members
        </td>
      </tr>`
    )
    .join("");

  const postsHtml = topPosts
    .map(
      (p) => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid ${BORDER};">
          <a href="${esc(p.permalink)}" style="color:${ORANGE};text-decoration:none;font-weight:600;">${esc(p.title)}</a>
          <div style="color:${MUTED};font-size:13px;margin-top:4px;">
            ${esc(p.sub)} · ↑ ${p.ups || 0} · 💬 ${p.comments || 0}
          </div>
        </td>
      </tr>`
    )
    .join("");

  const llmHtml = llmAnswers.length
    ? llmAnswers
        .map(
          (a) => `
        <div style="background:#f7f8fb;border:1px solid ${BORDER};border-radius:10px;padding:14px;margin-bottom:10px;">
          <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">${esc(a.model || "")}</div>
          <div style="font-weight:600;color:${TEXT};margin-bottom:6px;">${esc(a.question || "")}</div>
          <div style="color:${TEXT};font-size:14px;line-height:1.55;">${esc(a.answer || "")}</div>
        </div>`
        )
        .join("")
    : `<p style="color:${MUTED};font-size:14px;">Live AI citations are available with paid plans. <a href="${esc(baseUrl)}/#pricing" style="color:${ORANGE};">View pricing →</a></p>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Your AEOrank report for ${esc(brand)}</title></head>
<body style="margin:0;padding:0;background:#f7f8fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:${TEXT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fb;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(6,17,42,.06);">

        <!-- Header -->
        <tr>
          <td style="background:${NAVY};padding:24px 28px;color:#fff;">
            <div style="font-size:20px;font-weight:800;letter-spacing:-.01em;">
              <span style="color:${ORANGE};">AEO</span>rank
            </div>
            <div style="margin-top:4px;color:#a8b2c8;font-size:13px;">Reddit + AI visibility report</div>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:32px 28px 16px;">
            <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;letter-spacing:-.01em;">
              Your report for <span style="color:${ORANGE};">${esc(brand)}</span>
            </h1>
            <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.5;">
              ${description ? esc(description.slice(0, 180)) : `We scanned Reddit for ${esc(brand)} and prepared a custom AI-visibility brief.`}
            </p>
            <p style="margin:18px 0 0;">
              <a href="${esc(reportUrl)}" style="display:inline-block;background:${ORANGE};color:${NAVY};padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                View full interactive report →
              </a>
            </p>
          </td>
        </tr>

        <!-- Stat -->
        <tr>
          <td style="padding:8px 28px 24px;">
            <div style="background:#fff7ec;border:1px solid #f6d499;border-radius:10px;padding:14px 18px;">
              <div style="color:${MUTED};font-size:13px;">Combined audience reachable across these communities</div>
              <div style="color:${TEXT};font-size:28px;font-weight:800;letter-spacing:-.01em;margin-top:2px;">${formatMembers(totalAudience)}+ members</div>
            </div>
          </td>
        </tr>

        <!-- Top subreddits -->
        <tr>
          <td style="padding:8px 28px 8px;">
            <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${TEXT};">Top subreddit opportunities</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">
              ${subsHtml || `<tr><td style="padding:16px;color:${MUTED};">No subreddits found yet — check the live report.</td></tr>`}
            </table>
          </td>
        </tr>

        <!-- Top posts -->
        <tr>
          <td style="padding:8px 28px 8px;">
            <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${TEXT};">Top Reddit posts</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">
              ${postsHtml || `<tr><td style="padding:16px;color:${MUTED};">No posts found in the last month.</td></tr>`}
            </table>
          </td>
        </tr>

        <!-- AI section -->
        <tr>
          <td style="padding:8px 28px 8px;">
            <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${TEXT};">How AI talks about ${esc(brand)}</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px;">
            ${llmHtml}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 28px 32px;text-align:center;">
            <a href="${esc(baseUrl)}/contact" style="display:inline-block;background:${NAVY};color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
              Talk to our team about a strategy →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f8fb;padding:18px 28px;color:${MUTED};font-size:12px;text-align:center;border-top:1px solid ${BORDER};">
            You received this because you requested a free AEOrank report at${" "}
            <a href="${esc(baseUrl)}" style="color:${MUTED};">aeorank</a>.
            <br />Reddit data fetched via public API. Not affiliated with Reddit, OpenAI, Anthropic, or Google.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body></html>`;

  const text = [
    `Your AEOrank report for ${brand}`,
    "",
    description ? description.slice(0, 200) : "",
    "",
    `View full report: ${reportUrl}`,
    "",
    `Combined audience: ${formatMembers(totalAudience)}+ members`,
    "",
    "Top subreddits:",
    ...topSubs.map((s) => `  • ${s.name} (${formatMembers(s.members || 0)} members) — ${s.url}`),
    "",
    "Top Reddit posts:",
    ...topPosts.map((p) => `  • ${p.title}\n    ${p.permalink}`),
    "",
    `Talk to us: ${baseUrl}/contact`,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
