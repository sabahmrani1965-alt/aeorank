import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_AGE_MS = 24 * 60 * 60 * 1000; // give people a full day before nudging
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // don't dredge up months-old dormant signups on first run

// Same convention as app/api/cron/weekly-digest/route.js.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function neverStartedEmail() {
  return {
    subject: "Still there? Finish setting up your AEOrank brand",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.6;max-width:520px">
        <h2 style="margin:0 0 12px">You're one step away</h2>
        <p>You signed up for AEOrank but haven't set up your brand yet — it takes about 2 minutes and we'll immediately start finding real Reddit threads where your buyers are already asking questions you can answer.</p>
        <p style="margin-top:24px">
          <a href="https://www.aeorank.tech/onboarding" style="display:inline-block;background:#f2a83b;color:#1a1400;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">Finish setup →</a>
        </p>
      </div>`,
    text:
      "You signed up for AEOrank but haven't set up your brand yet — takes about 2 minutes.\n\n" +
      "Finish setup: https://www.aeorank.tech/onboarding",
  };
}

function neverSubscribedEmail() {
  return {
    subject: "Your AEOrank setup is ready — start your free trial",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.6;max-width:520px">
        <h2 style="margin:0 0 12px">Your brand is set up — nothing's running yet</h2>
        <p>You finished setting up your brand on AEOrank, but you haven't started your 7-day free trial yet, so we haven't found any opportunities for you. Pick a plan and we'll get started right away — cancel anytime before the trial ends.</p>
        <p style="margin-top:24px">
          <a href="https://www.aeorank.tech/dashboard/billing" style="display:inline-block;background:#f2a83b;color:#1a1400;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">Start free trial →</a>
        </p>
      </div>`,
    text:
      "Your brand is set up on AEOrank, but you haven't started your 7-day free trial yet.\n\n" +
      "Start your trial: https://www.aeorank.tech/dashboard/billing",
  };
}

// Daily nudge for two distinct stuck states — see onboarding_nudge_sent_at /
// trial_nudge_sent_at in supabase/schema.sql for why these are two
// separate one-time flags rather than one generic "was nudged" column.
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

  const now = Date.now();
  const windowStart = new Date(now - MAX_AGE_MS).toISOString();
  const windowEnd = new Date(now - MIN_AGE_MS).toISOString();

  const { data: candidates, error: candidatesError } = await admin
    .from("users")
    .select("id, email, onboarding_nudge_sent_at, trial_nudge_sent_at")
    .eq("role", "customer")
    .gte("created_at", windowStart)
    .lte("created_at", windowEnd)
    .or("onboarding_nudge_sent_at.is.null,trial_nudge_sent_at.is.null");
  if (candidatesError) {
    console.error("[reengagement] candidates query failed:", candidatesError.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ checked: 0, onboardingNudges: 0, trialNudges: 0 });
  }

  const userIds = candidates.map((u) => u.id);
  const [{ data: profiles }, { data: activeSubs }] = await Promise.all([
    admin.from("company_profiles").select("user_id, completed").in("user_id", userIds),
    admin.from("subscriptions").select("user_id").in("user_id", userIds).in("status", ["active", "trialing"]),
  ]);
  const profilesByUser = new Map();
  for (const p of profiles || []) {
    if (!profilesByUser.has(p.user_id)) profilesByUser.set(p.user_id, []);
    profilesByUser.get(p.user_id).push(p);
  }
  const activeSubUserIds = new Set((activeSubs || []).map((s) => s.user_id));

  let onboardingNudges = 0;
  let trialNudges = 0;

  for (const user of candidates) {
    const userProfiles = profilesByUser.get(user.id) || [];

    if (userProfiles.length === 0 && !user.onboarding_nudge_sent_at) {
      const { subject, html, text } = neverStartedEmail();
      const result = await sendEmail({ to: user.email, subject, html, text });
      if (result.ok) {
        await admin.from("users").update({ onboarding_nudge_sent_at: new Date().toISOString() }).eq("id", user.id);
        onboardingNudges++;
      }
      continue;
    }

    const hasCompletedProfile = userProfiles.some((p) => p.completed);
    const hasActiveSub = activeSubUserIds.has(user.id);
    if (hasCompletedProfile && !hasActiveSub && !user.trial_nudge_sent_at) {
      const { subject, html, text } = neverSubscribedEmail();
      const result = await sendEmail({ to: user.email, subject, html, text });
      if (result.ok) {
        await admin.from("users").update({ trial_nudge_sent_at: new Date().toISOString() }).eq("id", user.id);
        trialNudges++;
      }
    }
  }

  return NextResponse.json({ checked: candidates.length, onboardingNudges, trialNudges });
}
