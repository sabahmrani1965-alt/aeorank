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
        // Existence check only — .eq("user_id", ...).maybeSingle() would
        // throw once a user can have more than one company_profiles row.
        const { count } = await supabase
          .from("company_profiles")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        if (!count) next = "/onboarding";
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
