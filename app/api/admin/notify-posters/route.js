import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured, esc } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

// Between-send delay so a run of 80+ posters doesn't blow through Resend's
// per-second rate limit (same reason weekly-digest sends one at a time in
// a loop rather than batching every recipient into a single call's `to`
// array — that would also leak every poster's email address to every
// other poster in the same message).
const SEND_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isAuthorized(req) {
  const secret = process.env.POSTER_NOTIFY_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function buildEmail() {
  const url = "https://www.joincrewquest.com/poster";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.55;max-width:560px">
      <h2 style="margin:0 0 12px">New tasks are open</h2>
      <p style="color:#444;margin:0 0 20px">
        A few new missions just went live on CrewQuest. They're first come, first served, so it's worth checking in before they're claimed.
      </p>
      <p style="margin-top:24px">
        <a href="${esc(url)}" style="color:#f2a83b;font-weight:600">Go pick one up →</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:28px">
        You're getting this because you have a CrewQuest creator account.
      </p>
    </div>`;
  const text = `New tasks are open\n\nA few new missions just went live on CrewQuest. They're first come, first served.\n\n${url}`;
  return { subject: "New tasks just went live on CrewQuest", html, text };
}

// One-off (manually triggered, not on a cron schedule) notification to
// every poster that new tasks are available. Reuses lib/email.js's
// already-configured Resend setup rather than anything bespoke.
export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ skipped: "email not configured" });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { data: posters, error } = await admin
    .from("users")
    .select("email")
    .eq("role", "poster");
  if (error) {
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const emails = [...new Set((posters || []).map((p) => p.email).filter(Boolean))];
  const { subject, html, text } = buildEmail();

  let sent = 0;
  const failures = [];
  for (const email of emails) {
    const result = await sendEmail({ to: email, subject, html, text });
    if (result.ok) sent++;
    else failures.push(email);
    await sleep(SEND_DELAY_MS);
  }

  return NextResponse.json({ total: emails.length, sent, failed: failures.length });
}
