import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser } from "@/lib/posterTasks";

export const runtime = "nodejs";

// Voluntary release — a poster giving up a task before the claim window
// expires so it goes straight back into the pool for someone else,
// instead of sitting locked to them until releaseExpiredClaims (see
// lib/posterTasks.js) eventually times it out. Free, no penalty; this is
// a normal "not for me" outcome, not a violation.
export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("report_drafts")
    .update({ claimed_by: null, claimed_at: null, claim_expires_at: null, status: "available" })
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "claimed")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Task not found, expired, or not claimed by you." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
