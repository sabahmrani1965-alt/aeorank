import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Admin-only assignment control — distinct from the customer-facing
// app/api/drafts/[id]/route.js (owner editing their own posted/permalink
// status) and the poster-facing app/api/poster/drafts/[id]/route.js
// (assignee marking their assigned draft complete). Three different actors,
// three different authorization models, kept as separate routes.
export async function PATCH(req, { params }) {
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
  if (!("assigned_to" in body)) {
    return NextResponse.json({ error: "assigned_to is required." }, { status: 400 });
  }
  const assignedTo = body.assigned_to ? String(body.assigned_to) : null;

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  if (assignedTo) {
    const { data: poster } = await admin.from("users").select("id").eq("id", assignedTo).eq("role", "poster").maybeSingle();
    if (!poster) return NextResponse.json({ error: "That account isn't a poster." }, { status: 400 });
  }

  const { error } = await admin.from("report_drafts").update({ assigned_to: assignedTo }).eq("id", params.id);
  if (error) {
    console.error("[admin/drafts] assign failed:", error.message);
    return NextResponse.json({ error: "Could not update assignment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
