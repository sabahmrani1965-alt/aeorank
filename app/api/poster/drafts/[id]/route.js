import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Poster fulfilling a draft assigned to them — distinct from the
// owner-facing app/api/drafts/[id]/route.js, which scopes by user_id.
// This scopes by assigned_to instead; RLS ("Posters can update assigned
// drafts") independently enforces the same boundary.
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

  const permalink = String(body?.permalink || "").trim();
  if (!permalink) {
    return NextResponse.json({ error: "The live Reddit link is required to mark this complete." }, { status: 400 });
  }

  const { error } = await supabase
    .from("report_drafts")
    .update({ posted: true, posted_at: new Date().toISOString(), permalink: permalink.slice(0, 500) })
    .eq("id", params.id)
    .eq("assigned_to", user.id);

  if (error) {
    console.error("[poster/drafts] complete failed:", error.message);
    return NextResponse.json({ error: "Could not mark this draft complete." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
