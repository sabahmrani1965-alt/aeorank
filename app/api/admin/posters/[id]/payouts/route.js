import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Records one real payout event for a poster — this IS the ledger entry,
// not a derived/computed row (see lib/posterPay.js's getEarningsSummary
// for how "paid" gets applied against real submitted tasks, FIFO).
export async function POST(req, { params }) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const amount = Number(body?.amount);
  const note = String(body?.note || "").trim().slice(0, 300) || null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid payout amount." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data: poster } = await admin.from("users").select("id").eq("id", params.id).eq("role", "poster").maybeSingle();
  if (!poster) return NextResponse.json({ error: "Poster not found." }, { status: 404 });

  const { data, error } = await admin
    .from("poster_payouts")
    .insert({ poster_id: params.id, amount, note })
    .select("id, amount, note, created_at")
    .single();

  if (error) {
    console.error("[admin/posters/payouts] insert failed:", error.message);
    return NextResponse.json({ error: "Could not record this payout." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, payout: data });
}
