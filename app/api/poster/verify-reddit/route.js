import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRedditAccount, MIN_ACCOUNT_AGE_MONTHS, MIN_KARMA } from "@/lib/reddit";
import { resolveReferrerId } from "@/lib/posterPay";

export const runtime = "nodejs";

// Step 2 of creator signup (app/apply-poster/page.js is step 1 — email +
// password, account already exists with role='customer' by default).
// This is the ONLY place a user's role actually flips to 'poster' — never
// trust a client-side update to their own row for that (RLS lets a user
// update their own users row, so the role flip must happen here, via the
// admin client, gated on a real passing Reddit check, not on the client's
// say-so).
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const redditInput = String(body?.reddit || "").trim();
  const refParam = String(body?.ref || "").trim();

  if (!redditInput) {
    return NextResponse.json({ error: "Enter your Reddit username or profile link." }, { status: 400 });
  }

  const check = await checkRedditAccount(redditInput);
  if (check.status === "invalid") {
    return NextResponse.json({ error: "That doesn't look like a valid Reddit username or profile link." }, { status: 400 });
  }
  if (check.status === "not_found") {
    return NextResponse.json({ error: "We couldn't find that Reddit account. Double-check the username." }, { status: 400 });
  }
  if (check.status === "suspended") {
    return NextResponse.json({ error: "That Reddit account is suspended: you'll need an active account to post from." }, { status: 400 });
  }
  if (check.status === "unavailable") {
    return NextResponse.json(
      { error: "That Reddit account couldn't be found: it may be suspended, deleted, or the username may be wrong." },
      { status: 400 }
    );
  }
  if (check.status === "too_new") {
    return NextResponse.json(
      { error: `That Reddit account needs to be at least ${MIN_ACCOUNT_AGE_MONTHS} months old.` },
      { status: 400 }
    );
  }
  if (check.status === "low_karma") {
    return NextResponse.json(
      { error: `That Reddit account needs at least ${MIN_KARMA} combined karma.` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const referredBy = await resolveReferrerId(admin, refParam);

  const { error } = await admin
    .from("users")
    .update({
      role: "poster",
      reddit_username: check.username,
      reddit_check_status: check.status,
      ...(referredBy ? { referred_by: referredBy } : {}),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[poster/verify-reddit] role update failed:", error.message);
    return NextResponse.json({ error: "Could not finish setting up your account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: check.status });
}
