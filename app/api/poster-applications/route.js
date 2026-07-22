import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRedditAccount, MIN_ACCOUNT_AGE_MONTHS, MIN_KARMA } from "@/lib/reddit";
import { resolveReferrerId } from "@/lib/posterPay";

export const runtime = "nodejs";

// Public, unauthenticated — anyone can apply. Never creates an account
// directly; just queues a pending application for an admin to review in
// app/admin/posters (see app/api/admin/poster-applications/[id]/approve).
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim().toLowerCase();
  const refParam = String(body?.ref || "").trim();
  const redditInput = String(body?.reddit || "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!redditInput) {
    return NextResponse.json({ error: "Enter your Reddit username or profile link." }, { status: 400 });
  }

  // Reject on a confident real signal (confirmed suspended/nonexistent, or
  // unparseable input). "unverified" — neither Reddit OAuth nor the direct
  // fetch succeeded — still lets the application through rather than
  // blocking everyone whenever that check can't run; the status is stored
  // so an admin can eyeball it before approving (see PosterApplicationsTable).
  const check = await checkRedditAccount(redditInput);
  if (check.status === "invalid") {
    return NextResponse.json({ error: "That doesn't look like a valid Reddit username or profile link." }, { status: 400 });
  }
  if (check.status === "not_found") {
    return NextResponse.json({ error: "We couldn't find that Reddit account. Double-check the username." }, { status: 400 });
  }
  if (check.status === "suspended") {
    return NextResponse.json({ error: "That Reddit account is suspended — you'll need an active account to post from." }, { status: 400 });
  }
  if (check.status === "unavailable") {
    return NextResponse.json(
      { error: "That Reddit account couldn't be found — it may be suspended, deleted, or the username may be wrong." },
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

  const { error } = await admin.from("poster_applications").insert({
    email,
    referred_by: referredBy,
    reddit_username: check.username,
    reddit_check_status: check.status,
  });

  if (error) {
    // Unique-violation on the "one pending application per email" index —
    // treat as a soft success, not an error, so a double-submit doesn't
    // look broken to the applicant.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyPending: true });
    }
    console.error("[poster-applications] insert failed:", error.message);
    return NextResponse.json({ error: "Could not submit your application." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
