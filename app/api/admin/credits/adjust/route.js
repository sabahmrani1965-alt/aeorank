import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ensureUserId } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";
import { grantCredits, deductCredits, refundCredits } from "@/lib/credits";

export const runtime = "nodejs";

// One endpoint covers grant/remove/refund — they're all just a signed
// credit_transactions row, distinguished by which helper writes it.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim().toLowerCase();
  const amount = Number(body?.amount);
  const reason = String(body?.reason || "").trim() || "Admin adjustment";
  const refundOf = body?.refundOf ? String(body.refundOf) : null;

  if (!email || !Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ error: "email and a non-zero amount are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  let targetUserId;
  try {
    targetUserId = await ensureUserId(admin, email);
  } catch {
    return NextResponse.json({ error: "Could not find or create that user." }, { status: 404 });
  }

  let result;
  if (refundOf) {
    result = await refundCredits(admin, targetUserId, Math.abs(amount), "refund", reason, refundOf);
  } else if (amount > 0) {
    result = await grantCredits(admin, targetUserId, amount, "admin_grant", reason);
  } else {
    result = await deductCredits(admin, targetUserId, Math.abs(amount), "admin_remove", reason);
  }

  if (!result.ok) {
    const message =
      result.error === "insufficient_credits"
        ? "That user doesn't have enough credits to remove that amount."
        : "Adjustment failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, balance: result.balance });
}
