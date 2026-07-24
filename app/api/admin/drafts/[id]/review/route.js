import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Resolves a submission that couldn't be auto-verified (see
// app/api/poster/tasks/[id]/submit) — approving sets it to 'verified' so
// it starts counting toward the poster's earnings (getEarningsSummary,
// lib/posterPay.js). Rejecting used to just flip verification_status to
// 'rejected' and leave status='submitted' forever — the customer's task
// never got fulfilled by anyone, since it also never returned to the
// marketplace for another poster to redo. Now it resets the whole row
// back to a fresh, available, unclaimed state instead, the same
// "don't let a task silently vanish" principle as the claim-expiry
// release in lib/posterTasks.js. Only acts on rows currently
// 'needs_review' — already-decided rows can't be flipped back through
// this route.
export async function POST(req, { params }) {
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
  const decision = body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "decision must be 'approve' or 'reject'." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const updates =
    decision === "approve"
      ? { verification_status: "verified" }
      : {
          status: "available",
          claimed_by: null,
          claimed_at: null,
          claim_expires_at: null,
          posted: false,
          posted_at: null,
          permalink: null,
          verification_status: null,
          live_score: null,
          live_reply_count: null,
          live_removed: null,
          live_checked_at: null,
        };

  const { data, error } = await admin
    .from("report_drafts")
    .update(updates)
    .eq("id", params.id)
    .eq("verification_status", "needs_review")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not update: this task may not be pending review anymore." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
