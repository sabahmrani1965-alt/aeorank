import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser, buildSubmissionUpdate, PosterSubmissionError } from "@/lib/posterTasks";

export const runtime = "nodejs";
export const maxDuration = 30;

// Same as .../submit, but for a task an admin sent back with
// verification_status='changes_requested' (app/api/admin/drafts/[id]/
// review) — status stays 'submitted' the whole time (it never returns to
// the open pool), so this only ever fires from that state, not 'claimed'.
export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data: task } = await admin
    .from("report_drafts")
    .select("type, subreddit, target_url")
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "submitted")
    .eq("verification_status", "changes_requested")
    .maybeSingle();
  if (!task) {
    return NextResponse.json(
      { error: "Could not resubmit: this task isn't waiting on changes anymore." },
      { status: 409 }
    );
  }

  let updates;
  try {
    updates = await buildSubmissionUpdate(task, body?.permalink);
  } catch (err) {
    if (err instanceof PosterSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const { data, error } = await admin
    .from("report_drafts")
    .update(updates)
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "submitted")
    .eq("verification_status", "changes_requested")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not resubmit: this task isn't waiting on changes anymore." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
