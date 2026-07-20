import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser } from "@/lib/posterTasks";
import { getEarningsSummary, MIN_WITHDRAWAL_AMOUNT } from "@/lib/posterPay";

export const runtime = "nodejs";

// Poster requests a withdrawal of some/all of their pending balance —
// this doesn't move money itself, just queues a real 'requested' row for
// an admin to mark 'paid' (app/api/admin/payouts/[id]). Amount is
// re-validated server-side against the live pending balance, never
// trusted from the client beyond "how much they'd like."
export async function POST(req) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
  }
  if (amount < MIN_WITHDRAWAL_AMOUNT) {
    return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.` }, { status: 400 });
  }

  const summary = await getEarningsSummary(admin, user.id);
  if (amount > summary.pending + 0.0001) {
    return NextResponse.json({ error: `You can withdraw up to $${summary.pending.toFixed(2)}.` }, { status: 400 });
  }

  const { data, error } = await admin
    .from("poster_payouts")
    .insert({ poster_id: user.id, amount, status: "requested" })
    .select("id, amount, note, status, created_at")
    .single();

  if (error) {
    console.error("[poster/withdraw] insert failed:", error.message);
    return NextResponse.json({ error: "Could not submit your withdrawal request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, payout: data });
}
