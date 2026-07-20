import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TYPES = new Set(["commercial", "competitor", "branded"]);

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
  if ("text" in body) {
    const text = String(body.text || "").trim().slice(0, 300);
    if (!text) return NextResponse.json({ error: "Prompt text can't be empty." }, { status: 400 });
    updates.text = text;
  }
  if ("type" in body) {
    if (!TYPES.has(body.type)) return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    updates.type = body.type;
  }
  if ("location" in body) {
    updates.location = String(body.location || "Global").trim().slice(0, 60) || "Global";
  }
  if ("active" in body) {
    updates.active = Boolean(body.active);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // RLS ("Users can update own prompts") already scopes this to the
  // caller's own rows — the explicit .eq("user_id", ...) is belt-and-suspenders.
  const { error } = await supabase.from("prompts").update(updates).eq("id", params.id).eq("user_id", user.id);
  if (error) {
    console.error("[prompts] update failed:", error.message);
    return NextResponse.json({ error: "Could not update this prompt." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { error } = await supabase.from("prompts").delete().eq("id", params.id).eq("user_id", user.id);
  if (error) {
    console.error("[prompts] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete this prompt." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
