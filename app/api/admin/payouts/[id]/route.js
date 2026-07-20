import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Marks a poster-requested withdrawal (app/api/poster/withdraw) as
// actually paid — this is the only thing that moves it into totalPaid
// in lib/posterPay.js's getEarningsSummary. No amount edits here; if the
// amount was wrong, dismiss and record a fresh payout instead.
export async function PATCH(req, { params }) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { error } = await admin
    .from("poster_payouts")
    .update({ status: "paid" })
    .eq("id", params.id)
    .eq("status", "requested");

  if (error) {
    console.error("[admin/payouts] mark-paid failed:", error.message);
    return NextResponse.json({ error: "Could not mark this as paid." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Dismiss a withdrawal request without paying it (e.g. duplicate/mistaken
// request) — deletes the row rather than leaving a permanent 'dismissed'
// state to track, since nothing downstream needs to remember it happened.
export async function DELETE(req, { params }) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { error } = await admin.from("poster_payouts").delete().eq("id", params.id).eq("status", "requested");
  if (error) {
    console.error("[admin/payouts] dismiss failed:", error.message);
    return NextResponse.json({ error: "Could not dismiss this request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
