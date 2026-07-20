import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  // Resolve ref -> a real poster id. Silently ignored (not an error) if
  // missing, malformed, or doesn't belong to a poster — never blocks the
  // applicant over a bad/absent referral link.
  let referredBy = null;
  if (refParam) {
    const { data: referrer } = await admin
      .from("users")
      .select("id")
      .eq("id", refParam)
      .eq("role", "poster")
      .maybeSingle();
    if (referrer?.id) referredBy = referrer.id;
  }

  const { error } = await admin.from("poster_applications").insert({ email, referred_by: referredBy });

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
