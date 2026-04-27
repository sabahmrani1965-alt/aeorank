// Resend wrapper for transactional emails. Fails soft when not configured.

const RESEND_URL = "https://api.resend.com/emails";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM || "AEOrank <onboarding@resend.dev>";
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[email] resend error", res.status, err);
      return { ok: false, error: err };
    }
    const j = await res.json().catch(() => ({}));
    return { ok: true, id: j.id };
  } catch (e) {
    console.error("[email] send failed:", e?.message || e);
    return { ok: false, error: String(e?.message || e) };
  }
}

// Escape user-provided text for safe inclusion in HTML.
export function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Add (or upsert) an email to the configured Resend Audience so it shows up
// on the dashboard's Audience → Contacts screen. No-op when the audience is
// not configured. Resend treats duplicate emails as a soft conflict, which
// we silently ignore — the goal is "every captured email ends up on the
// list", not "every call must succeed".
export async function addToAudience({ email, name }) {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) return { ok: false, skipped: true };
  if (!email) return { ok: false, error: "no email" };

  // Resend wants first_name / last_name split. Best-effort only — we never
  // ask for these explicitly, so most leads land with just an email.
  const parts = String(name || "").trim().split(/\s+/);
  const first_name = parts[0] || "";
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : "";

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${encodeURIComponent(audienceId)}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name,
          last_name,
          unsubscribed: false,
        }),
      }
    );
    if (res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: true, id: j.id };
    }
    // Existing contact comes back as 409 / duplicate — that's fine, we
    // just wanted them on the list.
    if (res.status === 409 || res.status === 422) return { ok: true, duplicate: true };
    const err = await res.text().catch(() => "");
    console.error("[audience] add failed", res.status, err);
    return { ok: false, error: err };
  } catch (e) {
    console.error("[audience] error:", e?.message || e);
    return { ok: false, error: String(e?.message || e) };
  }
}
