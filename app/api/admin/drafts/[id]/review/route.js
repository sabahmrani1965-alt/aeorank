import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";
import { notifyReviewDecision } from "@/lib/notifications";

export const runtime = "nodejs";

// Lets an admin act on ANY submitted task, not just one auto-verification
// couldn't confirm — most real submissions pass the automated Reddit
// check instantly (see fetchItemStats/buildSubmissionUpdate in
// lib/posterTasks.js) and land straight on 'verified', but a live post can
// still be off-brief, off-topic, or otherwise worth sending back even
// though it's genuinely posted. Approving sets 'verified' (idempotent if
// already verified) so it counts toward the poster's earnings
// (getEarningsSummary, lib/posterPay.js). Rejecting resets the whole row
// back to a fresh, available, unclaimed state — same "don't let a task
// silently vanish" principle as the claim-expiry release in
// lib/posterTasks.js; if the row had already been counted as verified,
// it stops counting the moment this runs. Requesting changes is the
// middle ground: unlike reject, the same poster keeps the claim and can
// fix + resubmit (app/api/poster/tasks/[id]/resubmit) — status stays
// 'submitted' throughout, so it never re-enters the open pool, but
// verification_status flips to 'changes_requested' with a note so the
// poster's task page can show them what to fix. Only acts on rows
// currently 'submitted' — an already-rejected (reset) row has no
// 'submitted' left to find.
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
  if (!["approve", "reject", "request_changes"].includes(decision)) {
    return NextResponse.json({ error: "decision must be 'approve', 'reject', or 'request_changes'." }, { status: 400 });
  }

  let note = "";
  if (decision === "request_changes") {
    note = String(body?.note || "").trim().slice(0, 1000);
    if (!note) {
      return NextResponse.json({ error: "A note is required so the poster knows what to fix." }, { status: 400 });
    }
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  // Read BEFORE the update — reject clears claimed_by as part of its own
  // reset, so this is the only chance to know who to notify.
  const { data: task } = await admin
    .from("report_drafts")
    .select("claimed_by, subreddit")
    .eq("id", params.id)
    .eq("status", "submitted")
    .maybeSingle();
  if (!task) {
    return NextResponse.json(
      { error: "Could not update: this task may not be submitted anymore." },
      { status: 409 }
    );
  }

  const updates =
    decision === "approve"
      ? { verification_status: "verified", admin_notes: null }
      : decision === "request_changes"
      ? { verification_status: "changes_requested", admin_notes: note }
      : {
          status: "available",
          claimed_by: null,
          claimed_at: null,
          claim_expires_at: null,
          posted: false,
          posted_at: null,
          permalink: null,
          verification_status: null,
          admin_notes: null,
          live_score: null,
          live_reply_count: null,
          live_removed: null,
          live_checked_at: null,
        };

  const { data, error } = await admin
    .from("report_drafts")
    .update(updates)
    .eq("id", params.id)
    .eq("status", "submitted")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not update: this task may not be submitted anymore." },
      { status: 409 }
    );
  }

  // Best-effort — a notification/email hiccup must never undo a review
  // decision that already landed.
  await notifyReviewDecision(admin, {
    posterId: task.claimed_by,
    decision,
    subreddit: task.subreddit,
    note,
    taskId: params.id,
  }).catch((err) => console.error("[review] notify failed:", err?.message || err));

  return NextResponse.json({ ok: true });
}
