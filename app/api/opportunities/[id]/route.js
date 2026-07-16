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
  if ("saved" in body) {
    updates.saved = Boolean(body.saved);
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // RLS ("Users can update own opportunities") already scopes this to the
  // caller's own rows — the explicit .eq("user_id", ...) is belt-and-suspenders.
  const { error } = await supabase
    .from("opportunities")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[opportunities] update failed:", error.message);
    return NextResponse.json({ error: "Could not update opportunity." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
