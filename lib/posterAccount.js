import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, esc, isEmailConfigured } from "@/lib/email";

// Avoids visually ambiguous characters (0/O, 1/l/I) since this gets typed
// in by hand from an email, not pasted from a password manager.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
function generateTempPassword(length = 12) {
  return Array.from(crypto.randomBytes(length))
    .map((b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length])
    .join("");
}

// Creates a brand-new account with a real password up front and emails it
// directly via lib/email.js (the app's own Resend sender, not Supabase
// Auth's invite-link flow) — no click-through, no separate password-set
// step. If the email already belongs to an existing account (e.g. a
// customer being made a poster too), their password is left untouched —
// only their role (and, if provided, referred_by) is set.
//
// Shared by the direct admin-invite route (referredBy: null) and the
// apply-poster approval route (referredBy: the referring poster's id).
export async function createOrPromotePoster({ email, referredBy = null, origin }) {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "not_configured" };

  const tempPassword = generateTempPassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  let userId = created?.user?.id;
  let isNewAccount = Boolean(userId);

  if (createError || !userId) {
    const { data: existing, error: lookupError } = await admin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (lookupError || !existing?.id) {
      console.error("[posterAccount] create failed and no existing account:", createError?.message);
      return { ok: false, error: "create_failed" };
    }
    userId = existing.id;
    isNewAccount = false;
  }

  const { error: roleError } = await admin
    .from("users")
    .update({ role: "poster", ...(referredBy ? { referred_by: referredBy } : {}) })
    .eq("id", userId);
  if (roleError) {
    console.error("[posterAccount] role update failed:", roleError.message);
    return { ok: false, error: "role_update_failed" };
  }

  let emailSent = false;
  if (isNewAccount) {
    // Prefer a dedicated poster-facing domain if one's configured (see
    // middleware.js), so a poster's welcome email always points them at
    // the right domain regardless of which domain the admin happened to
    // approve them from.
    const loginUrl = `${process.env.NEXT_PUBLIC_POSTER_SITE_URL || origin}/login`;
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.55">
        <h2 style="margin:0 0 12px">You've been added as an AEOrank poster</h2>
        <p>You can now log in to complete Reddit drafts assigned to you.</p>
        <table style="border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 12px 6px 0;color:#666">Email</td><td style="padding:6px 0"><strong>${esc(email)}</strong></td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Temporary password</td><td style="padding:6px 0"><strong>${esc(tempPassword)}</strong></td></tr>
        </table>
        <p><a href="${esc(loginUrl)}" style="color:#f2a83b">Log in →</a></p>
        <p style="color:#888;font-size:12px;margin-top:18px">You can change this password any time from the "Forgot password" link on the login page.</p>
      </div>
    `;
    const text =
      `You've been added as an AEOrank poster.\n\n` +
      `Email: ${email}\nTemporary password: ${tempPassword}\n\n` +
      `Log in: ${loginUrl}\n\nYou can change this password any time via "Forgot password" on the login page.`;

    const result = isEmailConfigured()
      ? await sendEmail({ to: email, subject: "Your AEOrank poster account", html, text })
      : { ok: false, skipped: true };
    emailSent = result.ok;
  }

  return {
    ok: true,
    isNewAccount,
    emailSent,
    userId,
    // Returned so the caller can relay it manually if email delivery is
    // ever unreliable — never displayed again after this response.
    temporaryPassword: isNewAccount ? tempPassword : null,
  };
}
