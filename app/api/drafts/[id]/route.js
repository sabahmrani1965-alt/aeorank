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

  const posted = Boolean(body?.posted);

  // RLS ("Users can update own drafts") already scopes this to the caller's
  // own rows — the explicit .eq("user_id", ...) is belt-and-suspenders.
  const { error } = await supabase
    .from("report_drafts")
    .update({ posted, posted_at: posted ? new Date().toISOString() : null })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[drafts] update failed:", error.message);
    return NextResponse.json({ error: "Could not update draft." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
