import { esc } from "@/lib/email";
import { CALENDLY_URL } from "@/lib/links";

const SITE = "https://www.aeorank.tech";
const PLAN_NAMES = { starter: "Lite", growth: "Pro", scale: "Max" };

// A sign-in link for an account created by Stripe checkout (the buyer never
// chose a password). Verified by app/auth/confirm. Returns null on failure, so
// the welcome email still goes out with the password-reset fallback.
export async function loginLinkFor(admin, email) {
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const hash = data?.properties?.hashed_token;
  if (error || !hash) {
    console.error("[welcome] generateLink failed:", error?.message);
    return null;
  }
  return `${SITE}/auth/confirm?token_hash=${encodeURIComponent(hash)}&type=magiclink`;
}

// The buyer's first email from AEOrank, sent once when checkout completes:
// how to get into the dashboard, what happens next, how the trial ends.
export function buildWelcomeEmail({ name, plan, brand, loginUrl, trialEnd }) {
  const first = String(name || "").trim().split(/\s+/)[0];
  const hi = first ? `Hi ${first},` : "Hi,";
  const planName = PLAN_NAMES[plan] || "";
  const ends = trialEnd
    ? new Date(trialEnd * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })
    : null;
  const forBrand = brand ? ` for ${brand}` : "";

  const paras = [
    hi,
    `Your AEOrank${planName ? ` ${planName}` : ""} trial${forBrand} is active. Your account is ready: the button below signs you straight in, no password needed.`,
  ];
  const steps = [
    `Add your brand${brand ? ` (${brand})` : ""} and the questions your buyers ask. It takes about two minutes.`,
    "Your dashboard fills with the Reddit threads where buyers are asking about your category, ranked by buying intent.",
    "ChatGPT, Claude and Gemini are asked your questions every day, so you see when your brand starts being named.",
  ];
  const after = [
    `Prefer a walkthrough? Book a 20-minute kickoff call: ${CALENDLY_URL}`,
    ends
      ? `Your trial runs until ${ends}. You can cancel from Billing in your dashboard before then and you won't be charged.`
      : "You can cancel from Billing in your dashboard at any time.",
    `The sign-in button works once and expires after a while. If it has, set a password at ${SITE}/forgot-password with this email address.`,
  ];
  const label = loginUrl ? "Open your dashboard" : "Set your password";
  const href = loginUrl || `${SITE}/forgot-password`;

  const text = [
    ...paras,
    `${label}: ${href}`,
    "What happens next:",
    steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    ...after,
    "Questions? Just reply to this email.",
    "Ilyas\nFounder, AEOrank",
  ].join("\n\n");

  const p = (s) => `<p style="margin:0 0 16px">${s}</p>`;
  const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">${paras
    .map((x) => p(esc(x)))
    .join("")}<p style="margin:6px 0 24px"><a href="${esc(href)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${esc(label)} &rarr;</a></p>${p(
    "<strong>What happens next</strong>"
  )}<ol style="margin:0 0 16px;padding-left:20px">${steps.map((s) => `<li style="margin:0 0 6px">${esc(s)}</li>`).join("")}</ol>${p(
    `Prefer a walkthrough? <a href="${esc(CALENDLY_URL)}" style="color:#111">Book a 20-minute kickoff call</a>.`
  )}${p(esc(after[1]))}<p style="margin:0 0 16px;color:#666;font-size:13px">The sign-in button works once and expires after a while. If it has, <a href="${SITE}/forgot-password" style="color:#666">set a password</a> with this email address.</p>${p(
    "Questions? Just reply to this email."
  )}<p style="margin:0">Ilyas<br>Founder, AEOrank</p></div>`;

  return { subject: "Your AEOrank account is ready", html, text };
}
