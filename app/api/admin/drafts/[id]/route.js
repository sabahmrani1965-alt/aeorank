import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Admin-only manual assignment — distinct from the customer-facing
// app/api/drafts/[id]/route.js (owner editing their own posted/permalink
// status) and the poster-facing app/api/poster/tasks/[id]/submit route
// (the poster's own self-claimed marketplace flow). This is a manual
// override/VIP-routing path: no claim_expires_at is set, so it never
// times out and can't be reclaimed by anyone else via the marketplace's
// atomic claim (that only matches status='available' or an EXPIRED
// claim — a null expiry never satisfies "expired").
export async function PATCH(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!("claimed_by" in body)) {
    return NextResponse.json({ error: "claimed_by is required." }, { status: 400 });
  }
  const claimedBy = body.claimed_by ? String(body.claimed_by) : null;

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  if (claimedBy) {
    const { data: poster } = await admin.from("users").select("id").eq("id", claimedBy).eq("role", "poster").maybeSingle();
    if (!poster) return NextResponse.json({ error: "That account isn't a poster." }, { status: 400 });
  }

  // Already submitted work is the source of truth for that poster's
  // earnings/payout math (lib/posterPay.js) — reassigning it would make
  // it silently vanish from their history. Only 'available'/'claimed'
  // rows can be reassigned this way.
  const { data: existing } = await admin.from("report_drafts").select("status").eq("id", params.id).maybeSingle();
  if (existing?.status === "submitted") {
    return NextResponse.json({ error: "This task is already submitted and can't be reassigned." }, { status: 409 });
  }

  const { error } = await admin
    .from("report_drafts")
    .update(
      claimedBy
        ? { claimed_by: claimedBy, status: "claimed", claimed_at: new Date().toISOString(), claim_expires_at: null }
        : { claimed_by: null, status: "available", claimed_at: null, claim_expires_at: null }
    )
    .eq("id", params.id);
  if (error) {
    console.error("[admin/drafts] assign failed:", error.message);
    return NextResponse.json({ error: "Could not update assignment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
