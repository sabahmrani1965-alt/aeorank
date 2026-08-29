import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured, esc } from "@/lib/email";
import { refreshOpportunitiesForBrand } from "@/lib/opportunities";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_QUERIES = 6;
const CARD_LIMIT = 5;

// Reuses the same trigger secret as the poster-notify endpoint — both are
// one-off admin actions meant to be triggered without a real browser
// admin session, not a recurring cron.
function isAuthorized(req) {
  const secret = process.env.POSTER_NOTIFY_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function opportunityCard(o) {
  const score = typeof o.relevance_score === "number" ? o.relevance_score : null;
  return `
  <div style="border:1px solid #ececf0;border-radius:12px;padding:18px 20px;margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <span style="font-size:13px;color:#71717a;">${esc(o.sub)} · ${esc(formatDate(o.post_created_at))}</span>
      ${score != null ? `<span style="background:#EAF7EE;color:#1a7d3c;font-size:12.5px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap;">${score}% relevant</span>` : ""}
    </div>
    <div style="font-size:16px;font-weight:700;color:#0d0e1d;line-height:1.4;margin-bottom:10px;">
      ${esc(o.title)}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#71717a;">↑ ${o.ups || 0} · 💬 ${o.comments || 0} comments</span>
      <a href="${esc(o.permalink)}" style="font-size:13.5px;font-weight:600;color:#F2A83B;text-decoration:none;">View on Reddit →</a>
    </div>
  </div>`;
}

function activityReportEmail({ brand, website, opportunities }) {
  const dashUrl = "https://www.aeorank.tech/dashboard/opportunities";
  const cardsHtml = opportunities.map(opportunityCard).join("");
  const subtitle = `${opportunities.length} discussion${opportunities.length === 1 ? "" : "s"} related to ${esc(website || brand || "your brand")} ${opportunities.length === 1 ? "was" : "were"} found on Reddit. Here's a summary.`;

  const html = `
  <div style="background:#f4f5f7;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececf0;">
      <div style="background:#06112A;padding:28px 32px;text-align:center;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-.01em;">AEOrank</span>
      </div>
      <div style="padding:32px 32px 8px;text-align:center;">
        <h1 style="margin:0 0 10px;font-size:24px;color:#0d0e1d;">Activity Report</h1>
        <p style="margin:0 0 28px;font-size:14.5px;color:#71717a;line-height:1.6;">${subtitle}</p>
      </div>
      <div style="padding:0 32px 8px;text-align:left;">
        ${cardsHtml}
      </div>
      <div style="padding:12px 32px 32px;text-align:center;">
        <a href="${esc(dashUrl)}" style="display:inline-block;background:#F2A83B;color:#1a1400;font-weight:700;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:10px;">
          See all opportunities →
        </a>
      </div>
      <div style="padding:22px 32px 30px;border-top:1px solid #f0f0f2;">
        <p style="margin:0;font-size:12.5px;color:#a1a1aa;line-height:1.6;">
          Questions about your account? Just reply to this email.
        </p>
      </div>
    </div>
  </div>`;

  const text =
    `Activity Report\n\n${subtitle.replace(/<[^>]+>/g, "")}\n\n` +
    opportunities.map((o) => `${o.sub} (${formatDate(o.post_created_at)})\n${o.title}\n${o.ups || 0} upvotes, ${o.comments || 0} comments\n${o.permalink}\n`).join("\n") +
    `\nSee all opportunities: ${dashUrl}`;

  return { subject: `Check ${opportunities.length} new opportunit${opportunities.length === 1 ? "y" : "ies"}${brand ? ` for ${brand}` : ""}`, html, text };
}

// One-off: run a real opportunity search for a specific customer (e.g.
// right after a manual subscription reconciliation, so their first email
// shows real, live Reddit discussions rather than an empty dashboard),
// then email them an activity-report-style summary of what was found.
export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ skipped: "email not configured" });
  }
  let body = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { data: user } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (!user) {
    return NextResponse.json({ error: "no user with that email" }, { status: 404 });
  }
  const { data: profile } = await admin
    .from("company_profiles")
    .select("id, company_name, website, description")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "no company profile for this user" }, { status: 400 });
  }

  const { data: trackedKeywordRows } = await admin
    .from("tracked_keywords")
    .select("keyword")
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(MAX_QUERIES);
  const trackedKeywords = (trackedKeywordRows || []).map((k) => k.keyword);

  try {
    await refreshOpportunitiesForBrand(admin, {
      userId: user.id,
      companyProfileId: profile.id,
      brand: profile.company_name || "",
      description: profile.description || "",
      trackedKeywords,
    });
  } catch (e) {
    console.error("[notify-activated] opportunity refresh failed:", e?.message || e);
  }

  const { data: opportunities } = await admin
    .from("opportunities")
    .select("sub, title, permalink, ups, comments, post_created_at, relevance_score")
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .order("relevance_score", { ascending: false, nullsFirst: false })
    .limit(CARD_LIMIT);

  if (!opportunities || opportunities.length === 0) {
    return NextResponse.json({ skipped: "no opportunities found to send" });
  }

  const { subject, html, text } = activityReportEmail({
    brand: profile.company_name,
    website: profile.website,
    opportunities,
  });
  const result = await sendEmail({ to: email, subject, html, text });

  return NextResponse.json({ ok: result.ok, sent: opportunities.length, error: result.error || undefined });
}
