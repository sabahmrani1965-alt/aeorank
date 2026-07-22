import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const updates = {};
  if ("permalink" in body) {
    // Self-reported link to the live post — not verified against Reddit at
    // save time (see app/api/drafts/[id]/refresh-stats for the separate,
    // on-demand, credit-metered live check). Status ("posted") is derived
    // from this, not user-settable on its own — a task is Published
    // exactly when a link is attached.
    const permalink = String(body.permalink || "").trim().slice(0, 500) || null;
    updates.permalink = permalink;
    updates.posted = Boolean(permalink);
    updates.posted_at = permalink ? new Date().toISOString() : null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // RLS ("Users can update own drafts") already scopes this to the caller's
  // own rows — the explicit .eq("user_id", ...) is belt-and-suspenders.
  const { error } = await supabase
    .from("report_drafts")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[drafts] update failed:", error.message);
    return NextResponse.json({ error: "Could not update draft." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
