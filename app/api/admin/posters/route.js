import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";
import { sendEmail, esc, isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

// Avoids visually ambiguous characters (0/O, 1/l/I) since this gets typed
// in by hand from an email, not pasted from a password manager.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
function generateTempPassword(length = 12) {
  return Array.from(crypto.randomBytes(length))
    .map((b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length])
    .join("");
}

function siteOrigin(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET() {
  const admin_ = await requireAdmin();
  if (!admin_) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("users")
    .select("id, email, created_at")
    .eq("role", "poster")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load posters." }, { status: 500 });

  return NextResponse.json({ posters: data || [] });
}

// Creates a brand-new account with a real password up front and emails it
// directly via lib/email.js (the app's own Resend sender, not Supabase
// Auth's invite-link flow) — no click-through, no separate password-set
// step. If the email already belongs to an existing account (e.g. a
// customer being made a poster too), their password is left untouched —
// only their role is flipped, since overwriting a password they already
// chose would lock them out of their own account unexpectedly.
export async function POST(req) {
  const adminUser = await requireAdmin();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

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
      console.error("[admin/posters] create failed and no existing account:", createError?.message);
      return NextResponse.json({ error: "Could not create this account." }, { status: 500 });
    }
    userId = existing.id;
    isNewAccount = false;
  }

  const { error: roleError } = await admin.from("users").update({ role: "poster" }).eq("id", userId);
  if (roleError) {
    console.error("[admin/posters] role update failed:", roleError.message);
    return NextResponse.json({ error: "Could not grant poster access." }, { status: 500 });
  }

  let emailSent = false;
  if (isNewAccount) {
    const loginUrl = `${siteOrigin(req)}/login`;
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

  return NextResponse.json({
    ok: true,
    isNewAccount,
    emailSent,
    // Returned so the admin can relay it manually if email delivery is
    // ever unreliable — never displayed again after this response.
    temporaryPassword: isNewAccount ? tempPassword : null,
  });
}
