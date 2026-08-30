import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured, esc } from "@/lib/email";
import { refreshOpportunitiesForBrand } from "@/lib/opportunities";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_AGE_MS = 24 * 60 * 60 * 1000; // give people a full day before nudging
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // don't dredge up months-old dormant signups on first run
const CARD_LIMIT = 3;
// Each opportunity refresh does a real Reddit search + LLM scoring call —
// capped so a rare pile-up of candidates in one run can't blow through the
// 60s function timeout. Anyone left over still gets nudged next run (the
// windowStart/windowEnd range keeps including them until trial_nudge_sent_at
// is finally set), just a day later than usual.
const MAX_OPPORTUNITY_REFRESHES = 15;

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

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function opportunityCard(o) {
  const score = typeof o.relevance_score === "number" ? o.relevance_score : null;
  return `
  <div style="border:1px solid #ececf0;border-radius:12px;padding:16px 18px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-size:12.5px;color:#71717a;">${esc(o.sub)} · ${esc(formatDate(o.post_created_at))}</span>
      ${score != null ? `<span style="background:#EAF7EE;color:#1a7d3c;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap;">${score}% relevant</span>` : ""}
    </div>
    <div style="font-size:15px;font-weight:700;color:#0d0e1d;line-height:1.4;">
      ${esc(o.title)}
    </div>
  </div>`;
}

// Shown when we found real, live opportunities for this brand — makes the
// "you're missing out" case concretely instead of abstractly, same
// activity-report card style as app/api/admin/notify-activated so
// AEOrank's emails read as one system.
function neverSubscribedEmailWithOpportunities({ brand, opportunities }) {
  const dashUrl = "https://www.aeorank.tech/dashboard/billing";
  const cardsHtml = opportunities.map(opportunityCard).join("");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.6;max-width:520px">
    <h2 style="margin:0 0 12px">People are already asking${brand ? ` about ${esc(brand)}'s category` : ""} on Reddit</h2>
    <p style="margin:0 0 20px;">Your brand is set up on AEOrank, but your trial hasn't started, so nobody's watching these conversations for you yet. Here's a sample of what's already out there right now:</p>
    ${cardsHtml}
    <p style="margin:20px 0 0;color:#71717a;font-size:13.5px;">Start your 7-day free trial and we'll help you actually join conversations like these.</p>
    <p style="margin-top:20px">
      <a href="${esc(dashUrl)}" style="display:inline-block;background:#f2a83b;color:#1a1400;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">Start free trial →</a>
    </p>
  </div>`;

  const text =
    `People are already asking${brand ? ` about ${brand}'s category` : ""} on Reddit\n\n` +
    `Your brand is set up on AEOrank, but your trial hasn't started. Here's what's already out there:\n\n` +
    opportunities.map((o) => `${o.sub} (${formatDate(o.post_created_at)}): ${o.title}`).join("\n") +
    `\n\nStart your trial: ${dashUrl}`;

  return { subject: `${opportunities.length} real Reddit threads waiting for${brand ? ` ${brand}` : " you"}`, html, text };
}

// Fallback for when no opportunities could be found (search/LLM failure, or
// a genuinely quiet category) — same copy as before this feature existed.
function neverSubscribedEmailPlain() {
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
    admin.from("company_profiles").select("id, user_id, company_name, description, completed").in("user_id", userIds),
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
  let opportunityRefreshes = 0;

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

    const hasActiveSub = activeSubUserIds.has(user.id);
    const completedProfile = userProfiles.find((p) => p.completed);
    if (completedProfile && !hasActiveSub && !user.trial_nudge_sent_at) {
      // Over the cap for this run — skip entirely (no send, no flag set) so
      // this candidate is picked up fresh, with a real opportunity search,
      // on tomorrow's run instead of getting the bare fallback copy.
      if (opportunityRefreshes >= MAX_OPPORTUNITY_REFRESHES) continue;
      opportunityRefreshes++;

      let opportunities = [];
      try {
        await refreshOpportunitiesForBrand(admin, {
          userId: user.id,
          companyProfileId: completedProfile.id,
          brand: completedProfile.company_name || "",
          description: completedProfile.description || "",
          trackedKeywords: [],
        });
        const { data: rows } = await admin
          .from("opportunities")
          .select("sub, title, post_created_at, relevance_score")
          .eq("user_id", user.id)
          .eq("company_profile_id", completedProfile.id)
          .order("relevance_score", { ascending: false, nullsFirst: false })
          .limit(CARD_LIMIT);
        opportunities = rows || [];
      } catch (e) {
        console.error("[reengagement] opportunity refresh failed:", e?.message || e);
      }

      const { subject, html, text } =
        opportunities.length > 0
          ? neverSubscribedEmailWithOpportunities({ brand: completedProfile.company_name, opportunities })
          : neverSubscribedEmailPlain();

      const result = await sendEmail({ to: user.email, subject, html, text });
      if (result.ok) {
        await admin.from("users").update({ trial_nudge_sent_at: new Date().toISOString() }).eq("id", user.id);
        trialNudges++;
      }
    }
  }

  return NextResponse.json({ checked: candidates.length, onboardingNudges, trialNudges });
}
