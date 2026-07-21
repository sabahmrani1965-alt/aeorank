import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";

export const runtime = "nodejs";

const TYPES = new Set(["commercial", "competitor", "branded"]);

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) return NextResponse.json({ prompts: [] });

  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, text, type, location, active, last_checked_at, last_mentioned, last_position, last_brands, last_answer, last_model, created_at"
    )
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load prompts." }, { status: 500 });
  }

  return NextResponse.json({ prompts: data || [] });
}

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const text = String(body?.text || "").trim().slice(0, 300);
  const type = TYPES.has(body?.type) ? body.type : "commercial";
  const location = String(body?.location || "Global").trim().slice(0, 60) || "Global";

  if (!text) {
    return NextResponse.json({ error: "Enter a prompt." }, { status: 400 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: "Complete your company profile first." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("prompts")
    .insert({ user_id: user.id, company_profile_id: profile.id, text, type, location })
    .select("id, text, type, location, active, created_at")
    .single();

  if (error) {
    console.error("[prompts] create failed:", error.message);
    return NextResponse.json({ error: "Could not save this prompt." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prompt: data });
}
