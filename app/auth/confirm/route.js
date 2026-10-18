import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Sign-in from an emailed link (the welcome email a buyer gets after Stripe
// checkout, see lib/welcomeEmail.js). The link carries a one-time token hash
// from auth.admin.generateLink; verifying it here opens the session on the
// server, which the PKCE-only /auth/callback can't do for such links.
// Where to go: an explicit ?next (same-site paths only), else onboarding for
// an account with no brand yet, else the dashboard.
export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "magiclink";
  const nextParam = searchParams.get("next") || "";
  const safeNext = /^\/(?!\/)/.test(nextParam) ? nextParam : "";

  if (tokenHash) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error && data?.user) {
      let next = safeNext || "/dashboard";
      if (!safeNext) {
        const { count } = await supabase
          .from("company_profiles")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        if (!count) next = "/onboarding";
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/confirm] verifyOtp failed:", error?.message);
  }
  // Expired or already used: the login page explains how to get in.
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
