import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured, esc } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_OPPORTUNITIES_PER_BRAND = 5;

// Vercel Cron sends this exact header on every invocation when CRON_SECRET
// is set — see vercel.json's `crons` entry for this route's schedule.
// Without a valid secret, anyone could trigger a mass email send by hitting
// this URL directly, so unlike most routes here, an unconfigured secret
// fails closed (401) rather than silently skipping.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function digestHtml(brand) {
  const oppRows = brand.opportunities
    .map(
      (o) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee">
            <div style="font-size:13px;color:#888;margin-bottom:2px">${esc(o.sub)}</div>
            <a href="${esc(o.permalink)}" style="color:#0d0e1d;font-weight:600;text-decoration:none">${esc(o.title)}</a>
          </td>
        </tr>`
    )
    .join("");

  const mentionLine =
    brand.mentionCount > 0
      ? `<p style="margin:0 0 14px;color:#444">${brand.mentionCount} new mention${brand.mentionCount === 1 ? "" : "s"} of <strong>${esc(brand.companyName)}</strong> this week.</p>`
      : "";

  return `
    <div style="margin-bottom:32px">
      <h3 style="margin:0 0 10px;font-size:17px">${esc(brand.companyName)}</h3>
      ${mentionLine}
      ${
        oppRows
          ? `<table style="width:100%;border-collapse:collapse">${oppRows}</table>`
          : ""
      }
    </div>`;
}

function buildEmail(brands) {
  const totalOpps = brands.reduce((n, b) => n + b.opportunities.length, 0);
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.55;max-width:560px">
      <h2 style="margin:0 0 4px">Your week on Reddit</h2>
      <p style="color:#666;margin:0 0 24px">New opportunities and mentions found for your brand${brands.length > 1 ? "s" : ""} this week.</p>
      ${brands.map(digestHtml).join("")}
      <p style="margin-top:24px">
        <a href="https://www.aeorank.tech/dashboard/opportunities" style="color:#f2a83b;font-weight:600">Open your dashboard →</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:28px">
        You're getting this because you have an active AEOrank plan.
      </p>
    </div>`;

  const text =
    `Your week on Reddit\n\n` +
    brands
      .map(
        (b) =>
          `${b.companyName}${b.mentionCount ? ` — ${b.mentionCount} new mention(s)` : ""}\n` +
          b.opportunities.map((o) => `  - ${o.title} (${o.sub}) ${o.permalink}`).join("\n")
      )
      .join("\n\n") +
    `\n\nOpen your dashboard: https://www.aeorank.tech/dashboard/opportunities`;

  return {
    subject: `Your weekly AEOrank digest — ${totalOpps} new opportunit${totalOpps === 1 ? "y" : "ies"}`,
    html,
    text,
  };
}

// Weekly digest for active/trialing subscribers: new opportunities and
// mention counts per brand from the last 7 days. Skips anyone with nothing
// new rather than sending an empty email — see buildEmail's caller below.
export async function GET(req) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ skipped: "email not configured" });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  const { data: subs, error: subsError } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trialing"]);
  if (subsError) {
    console.error("[weekly-digest] subscriptions query failed:", subsError.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  const userIds = [...new Set((subs || []).map((s) => s.user_id))];
  if (userIds.length === 0) return NextResponse.json({ sent: 0, checked: 0 });

  const [{ data: users }, { data: profiles }] = await Promise.all([
    admin.from("users").select("id, email").in("id", userIds),
    admin
      .from("company_profiles")
      .select("id, user_id, company_name")
      .in("user_id", userIds)
      .eq("completed", true),
  ]);

  let sent = 0;
  for (const user of users || []) {
    const userProfiles = (profiles || []).filter((p) => p.user_id === user.id);
    if (userProfiles.length === 0) continue;

    const brands = [];
    for (const profile of userProfiles) {
      const [{ data: opps }, { count: mentionCount }] = await Promise.all([
        admin
          .from("opportunities")
          .select("title, sub, permalink")
          .eq("company_profile_id", profile.id)
          .gte("fetched_at", since)
          .order("relevance_score", { ascending: false })
          .limit(MAX_OPPORTUNITIES_PER_BRAND),
        admin
          .from("mentions")
          .select("id", { count: "exact", head: true })
          .eq("company_profile_id", profile.id)
          .gte("fetched_at", since),
      ]);

      const opportunities = opps || [];
      if (opportunities.length === 0 && !mentionCount) continue;
      brands.push({ companyName: profile.company_name || "Your brand", opportunities, mentionCount: mentionCount || 0 });
    }

    if (brands.length === 0) continue; // nothing new this week — don't email

    const { subject, html, text } = buildEmail(brands);
    const result = await sendEmail({ to: user.email, subject, html, text });
    if (result.ok) sent++;
  }

  return NextResponse.json({ sent, checked: (users || []).length });
}
