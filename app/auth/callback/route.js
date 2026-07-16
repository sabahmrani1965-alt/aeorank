import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First-time signup confirmations (no explicit `next`, e.g. password
      // reset sets its own) go to onboarding if they haven't done it yet.
      let next = explicitNext || "/dashboard";
      if (!explicitNext && data?.user) {
        const { data: profile } = await supabase
          .from("company_profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (!profile) next = "/onboarding";
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
