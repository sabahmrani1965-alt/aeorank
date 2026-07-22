import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  // The cookie (set right before starting the Google OAuth redirect — see
  // GoogleAuthButton.js) is the reliable source for where an OAuth sign-in
  // should land; the query param is a fallback for non-OAuth flows (e.g.
  // password reset) that redirect straight here without that extra hop.
  const cookieNext = req.cookies.get("oauth_next")?.value;
  const explicitNext = (cookieNext && decodeURIComponent(cookieNext)) || searchParams.get("next");

  // TEMPORARY diagnostic — remove once the CrewQuest-signup-lands-on-
  // AEOrank-dashboard bug is confirmed fixed. Logs to Vercel's function
  // logs, not visible to the end user.
  console.log("[auth/callback debug]", {
    origin,
    rawCookieHeader: req.headers.get("cookie"),
    cookieNext,
    queryNext: searchParams.get("next"),
    explicitNext,
    hasCode: Boolean(code),
  });

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First-time signup confirmations (no explicit `next`, e.g. password
      // reset sets its own) go to onboarding if they haven't done it yet.
      // A returning poster (e.g. signing back in via Google) lands on
      // /poster instead — mirrors app/login/page.js's role check, so
      // every auth path (password, magic link, OAuth) agrees on where a
      // poster ends up.
      let next = explicitNext || "/dashboard";
      if (!explicitNext && data?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role === "poster") {
          next = "/poster";
        } else {
          // Existence check only — .eq("user_id", ...).maybeSingle() would
          // throw once a user can have more than one company_profiles row.
          const { count } = await supabase
            .from("company_profiles")
            .select("id", { count: "exact", head: true })
            .eq("user_id", data.user.id);
          if (!count) next = "/onboarding";
        }
      }
      const response = NextResponse.redirect(`${origin}${next}`);
      if (cookieNext) response.cookies.set("oauth_next", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
