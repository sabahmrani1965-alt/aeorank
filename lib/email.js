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
